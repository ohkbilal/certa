/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CERTA SUPABASE CONFIGURATION
 * Week 2 Tasks: W2-005 (Assessment Counter), W2-006 (Database Config)
 * Owner: TechArch, VERCEL-2
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const SUPABASE_CONFIG = {
  url: process.env.SUPABASE_URL || '',
  anonKey: process.env.SUPABASE_ANON_KEY || '',
  serviceKey: process.env.SUPABASE_SERVICE_KEY || ''
};

// ═══════════════════════════════════════════════════════════════════════════════
// DATABASE SCHEMA (SQL - Run in Supabase SQL Editor)
// ═══════════════════════════════════════════════════════════════════════════════

const DATABASE_SCHEMA = `
-- CERTA DATABASE SCHEMA v1.0

-- Enable UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth0_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  tier TEXT DEFAULT 'free',
  stripe_customer_id TEXT,
  assessment_count_this_month INTEGER DEFAULT 0,
  assessment_count_total INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ASSESSMENTS TABLE
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  fluid_id TEXT NOT NULL,
  fluid_name TEXT NOT NULL,
  concentration DECIMAL,
  temperature DECIMAL,
  primary_regime TEXT NOT NULL,
  material_results JSONB,
  seal_results JSONB,
  policy_version TEXT DEFAULT 'V16.1',
  run_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- COUNTERS TABLE
CREATE TABLE IF NOT EXISTS assessment_counters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  year_month TEXT NOT NULL,
  count INTEGER DEFAULT 0,
  UNIQUE(user_id, year_month)
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_users_auth0 ON users(auth0_id);
CREATE INDEX IF NOT EXISTS idx_assessments_user ON assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_counters_user ON assessment_counters(user_id, year_month);
`;

// ═══════════════════════════════════════════════════════════════════════════════
// ASSESSMENT COUNTER SERVICE (W2-005)
// ═══════════════════════════════════════════════════════════════════════════════

class AssessmentCounterService {
  constructor(supabaseClient) {
    this.db = supabaseClient;
  }
  
  // Tier limits per V16 §21.1
  static TIER_LIMITS = {
    free: 5,
    pro_monthly: -1, // Unlimited
    pro_annual: -1,
    team: -1
  };
  
  async checkLimit(userId) {
    const yearMonth = new Date().toISOString().slice(0, 7);
    
    // Get user tier
    const { data: user } = await this.db
      .from('users')
      .select('tier, assessment_count_this_month')
      .eq('id', userId)
      .single();
    
    const tier = user?.tier || 'free';
    const limit = AssessmentCounterService.TIER_LIMITS[tier];
    const current = user?.assessment_count_this_month || 0;
    
    return {
      canAssess: limit === -1 || current < limit,
      current,
      limit: limit === -1 ? 'Unlimited' : limit,
      remaining: limit === -1 ? 'Unlimited' : Math.max(0, limit - current),
      tier
    };
  }
  
  async increment(userId) {
    const yearMonth = new Date().toISOString().slice(0, 7);
    
    // Upsert counter
    const { data: counter } = await this.db
      .from('assessment_counters')
      .upsert({
        user_id: userId,
        year_month: yearMonth,
        count: 1
      }, {
        onConflict: 'user_id,year_month',
        ignoreDuplicates: false
      })
      .select()
      .single();
    
    // Increment if exists
    if (counter) {
      await this.db.rpc('increment_counter', {
        p_user_id: userId,
        p_year_month: yearMonth
      });
    }
    
    // Update user totals
    await this.db
      .from('users')
      .update({
        assessment_count_this_month: counter?.count || 1,
        assessment_count_total: this.db.raw('assessment_count_total + 1')
      })
      .eq('id', userId);
    
    return { newCount: counter?.count || 1 };
  }
  
  async getUsageStats(userId) {
    const { data: user } = await this.db
      .from('users')
      .select('tier, assessment_count_this_month, assessment_count_total')
      .eq('id', userId)
      .single();
    
    const limit = AssessmentCounterService.TIER_LIMITS[user?.tier || 'free'];
    
    return {
      tier: user?.tier || 'free',
      thisMonth: user?.assessment_count_this_month || 0,
      total: user?.assessment_count_total || 0,
      limit: limit === -1 ? 'Unlimited' : limit,
      remaining: limit === -1 ? 'Unlimited' : Math.max(0, limit - (user?.assessment_count_this_month || 0))
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ASSESSMENT STORAGE SERVICE
// ═══════════════════════════════════════════════════════════════════════════════

class AssessmentStorageService {
  constructor(supabaseClient) {
    this.db = supabaseClient;
  }
  
  async saveAssessment(userId, assessment) {
    const { data, error } = await this.db
      .from('assessments')
      .insert({
        user_id: userId,
        fluid_id: assessment.fluidId,
        fluid_name: assessment.fluidName,
        concentration: assessment.concentration,
        temperature: assessment.temperature,
        primary_regime: assessment.primaryRegime,
        material_results: assessment.materialResults,
        seal_results: assessment.sealResults,
        policy_version: 'V16.1',
        run_id: assessment.runId
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
  
  async getHistory(userId, { page = 1, pageSize = 20 } = {}) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    const { data, error, count } = await this.db
      .from('assessments')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to);
    
    if (error) throw error;
    
    return {
      assessments: data || [],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize)
    };
  }
  
  async getAssessment(userId, assessmentId) {
    const { data, error } = await this.db
      .from('assessments')
      .select('*')
      .eq('id', assessmentId)
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    return data;
  }
  
  async deleteAssessment(userId, assessmentId) {
    const { error } = await this.db
      .from('assessments')
      .delete()
      .eq('id', assessmentId)
      .eq('user_id', userId);
    
    if (error) throw error;
    return true;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// USER SERVICE
// ═══════════════════════════════════════════════════════════════════════════════

class UserService {
  constructor(supabaseClient) {
    this.db = supabaseClient;
  }
  
  async getOrCreateUser(auth0Profile) {
    let { data: user, error } = await this.db
      .from('users')
      .select('*')
      .eq('auth0_id', auth0Profile.sub)
      .single();
    
    if (error?.code === 'PGRST116') {
      const { data: newUser, error: createError } = await this.db
        .from('users')
        .insert({
          auth0_id: auth0Profile.sub,
          email: auth0Profile.email,
          name: auth0Profile.name || auth0Profile.email.split('@')[0]
        })
        .select()
        .single();
      
      if (createError) throw createError;
      user = newUser;
    } else if (error) {
      throw error;
    }
    
    return user;
  }
  
  async updateTier(stripeCustomerId, tier) {
    await this.db
      .from('users')
      .update({ tier })
      .eq('stripe_customer_id', stripeCustomerId);
  }
  
  async linkStripeCustomer(userId, stripeCustomerId) {
    await this.db
      .from('users')
      .update({ stripe_customer_id: stripeCustomerId })
      .eq('id', userId);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════

function validateSupabaseConfig() {
  const issues = [];
  if (!SUPABASE_CONFIG.url) issues.push('Missing SUPABASE_URL');
  if (!SUPABASE_CONFIG.anonKey) issues.push('Missing SUPABASE_ANON_KEY');
  if (!SUPABASE_CONFIG.serviceKey) issues.push('Missing SUPABASE_SERVICE_KEY');
  return { valid: issues.length === 0, issues };
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
  SUPABASE_CONFIG,
  DATABASE_SCHEMA,
  AssessmentCounterService,
  AssessmentStorageService,
  UserService,
  validateSupabaseConfig
};
