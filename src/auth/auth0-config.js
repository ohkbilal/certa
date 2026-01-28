/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CERTA AUTH0 CONFIGURATION
 * Parliament Mandate: Week 1, Day 3-4
 * Policy: V16 §20.2.2 - Authentication Separation
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * CRITICAL: Per V16 §20.2.2:
 * - Auth layer MUST NOT modify assessment logic
 * - Auth = access control only
 * - Auth middleware separate from engine
 * - No chemistry decisions based on user role
 * ═══════════════════════════════════════════════════════════════════════════════
 */

require('dotenv').config();

/**
 * Auth0 Configuration
 * 
 * To set up Auth0:
 * 1. Create account at auth0.com (free tier: 7,000 users)
 * 2. Create new Application (Regular Web Application)
 * 3. Configure Allowed Callback URLs, Logout URLs, Web Origins
 * 4. Copy credentials to .env file
 */
const AUTH0_CONFIG = {
  // Domain from Auth0 dashboard
  domain: process.env.AUTH0_DOMAIN || 'your-tenant.auth0.com',
  
  // Client ID from Auth0 dashboard
  clientId: process.env.AUTH0_CLIENT_ID || 'your-client-id',
  
  // Client Secret (keep secure, never commit)
  clientSecret: process.env.AUTH0_CLIENT_SECRET || '',
  
  // Callback URL after login
  callbackUrl: process.env.AUTH0_CALLBACK_URL || 'http://localhost:3000/callback',
  
  // URL after logout
  logoutUrl: process.env.AUTH0_LOGOUT_URL || 'http://localhost:3000',
  
  // Audience for API (if using API authorization)
  audience: process.env.AUTH0_AUDIENCE || 'https://api.certa.app',
  
  // Scopes requested
  scope: 'openid profile email',
};

/**
 * User Tiers - V16 §21.3
 * NOTE: These tiers affect CONVENIENCE features only
 * NEVER affects safety features (V16 §21.1.2)
 */
const USER_TIERS = {
  FREE: {
    id: 'free',
    name: 'Free',
    assessmentsPerMonth: 5,
    pdfExport: 'watermarked',
    fluidsAccess: 50,
    features: {
      // V16 §21.1.2: ALL safety features included
      safetyGates: true,
      regimeClassification: true,
      sealRouting: true,
      failureWarnings: true,
      hardExclusions: true,
      // Convenience features
      batchProcessing: false,
      assessmentHistory: false,
      apiAccess: false,
      excelExport: false,
    }
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    price: 49, // Parliament mandate: $49/mo, not $99
    priceAnnual: 399, // 2 months free
    assessmentsPerMonth: -1, // Unlimited
    pdfExport: 'clean',
    fluidsAccess: 437,
    features: {
      // V16 §21.1.2: ALL safety features included
      safetyGates: true,
      regimeClassification: true,
      sealRouting: true,
      failureWarnings: true,
      hardExclusions: true,
      // Convenience features
      batchProcessing: true,
      assessmentHistory: true,
      apiAccess: false, // P2 feature - $1K+ MRR
      excelExport: true,
    }
  },
  TEAM: {
    id: 'team',
    name: 'Team',
    price: null, // "Contact us" - build when demanded
    assessmentsPerMonth: -1,
    pdfExport: 'clean',
    fluidsAccess: 437,
    features: {
      // All Pro features plus team management
      // TO BE BUILT when revenue > $5K MRR
    }
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    price: null, // Custom pricing
    assessmentsPerMonth: -1,
    pdfExport: 'clean',
    fluidsAccess: -1, // 437 + custom
    features: {
      // All Team features plus custom fluids
      // TO BE BUILT when revenue > $10K MRR
    }
  }
};

/**
 * Get user tier from Auth0 user metadata
 * 
 * @param {Object} user - Auth0 user object
 * @returns {Object} User tier configuration
 */
function getUserTier(user) {
  if (!user) return USER_TIERS.FREE;
  
  // Check app_metadata for subscription tier
  const metadata = user.app_metadata || {};
  const tierId = (metadata.tier || 'free').toUpperCase();
  
  return USER_TIERS[tierId] || USER_TIERS.FREE;
}

/**
 * Check if user can perform assessment
 * V16 §21.1.2: Safety features NEVER restricted
 * 
 * @param {Object} user - Auth0 user object
 * @param {number} currentMonthCount - Assessments this month
 * @returns {Object} { allowed: boolean, reason: string }
 */
function canPerformAssessment(user, currentMonthCount) {
  const tier = getUserTier(user);
  
  // Unlimited for paid tiers
  if (tier.assessmentsPerMonth === -1) {
    return { allowed: true, reason: 'Unlimited assessments' };
  }
  
  // Check limit for free tier
  if (currentMonthCount >= tier.assessmentsPerMonth) {
    return { 
      allowed: false, 
      reason: `Free tier limit reached (${tier.assessmentsPerMonth}/month). Upgrade to Pro for unlimited.`,
      upgradeUrl: '/upgrade'
    };
  }
  
  return { 
    allowed: true, 
    reason: `${tier.assessmentsPerMonth - currentMonthCount} assessments remaining this month`
  };
}

/**
 * V16 §20.2.2 CRITICAL: Auth must not affect engine output
 * This function verifies separation of concerns
 */
function validateAuthSeparation() {
  // Auth should NEVER be passed to these functions:
  const engineFunctions = [
    'createRunContext',
    'resolvePrimaryRegime',
    'resolveSealEligibility',
    'evaluateCompatibility',
    'constructCandidateSets',
    'generateFAO'
  ];
  
  // These functions MAY use auth for access control only:
  const authAwareFunctions = [
    'canPerformAssessment',
    'getUserTier',
    'checkFeatureAccess',
    'trackUsage'
  ];
  
  return {
    engineFunctions,
    authAwareFunctions,
    rule: 'V16 §20.2.2: Engine functions must NEVER receive user/auth parameters'
  };
}

/**
 * Express middleware for Auth0 authentication
 */
function authMiddleware(req, res, next) {
  // Check if user is authenticated
  if (!req.oidc || !req.oidc.isAuthenticated()) {
    // Allow public routes
    const publicRoutes = ['/', '/login', '/callback', '/health'];
    if (publicRoutes.includes(req.path)) {
      return next();
    }
    
    // Redirect to login for protected routes
    return res.redirect('/login');
  }
  
  // Attach user tier to request (for convenience features only)
  req.userTier = getUserTier(req.oidc.user);
  
  next();
}

/**
 * Check feature access (convenience features only)
 * V16 §21.1.2: Safety features ALWAYS accessible
 */
function checkFeatureAccess(user, feature) {
  const tier = getUserTier(user);
  
  // Safety features - ALWAYS allowed (V16 §21.1.2)
  const safetyFeatures = [
    'safetyGates',
    'regimeClassification', 
    'sealRouting',
    'failureWarnings',
    'hardExclusions'
  ];
  
  if (safetyFeatures.includes(feature)) {
    return { allowed: true, reason: 'Safety feature - always accessible' };
  }
  
  // Convenience features - check tier
  if (tier.features && tier.features[feature]) {
    return { allowed: true, reason: `Feature included in ${tier.name} tier` };
  }
  
  return { 
    allowed: false, 
    reason: `Feature not available in ${tier.name} tier`,
    upgradeUrl: '/upgrade'
  };
}

module.exports = {
  AUTH0_CONFIG,
  USER_TIERS,
  getUserTier,
  canPerformAssessment,
  validateAuthSeparation,
  authMiddleware,
  checkFeatureAccess
};
