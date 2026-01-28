# ═══════════════════════════════════════════════════════════════════════════════
# CERTA PRODUCTION ENVIRONMENT CONFIGURATION
# Week 2 Tasks: W2-002, W2-003, W2-004, W2-006
# Owner: VERCEL-2 (Environment & Secrets Agent)
# ═══════════════════════════════════════════════════════════════════════════════

## CRITICAL: Environment Variables Required for Production

All secrets must be configured in Vercel Dashboard → Settings → Environment Variables.
NEVER commit secrets to code.

---

## AUTH0 PRODUCTION CONFIGURATION (W2-002)

### Required Environment Variables

```bash
# Auth0 Domain and Credentials
AUTH0_DOMAIN=certa.us.auth0.com
AUTH0_CLIENT_ID=<your-production-client-id>
AUTH0_CLIENT_SECRET=<your-production-client-secret>
AUTH0_AUDIENCE=https://api.certa.app

# Auth0 Management API (for user management)
AUTH0_MGMT_CLIENT_ID=<your-mgmt-client-id>
AUTH0_MGMT_CLIENT_SECRET=<your-mgmt-client-secret>

# Session Secret (generate with: openssl rand -hex 32)
AUTH0_SESSION_SECRET=<64-character-hex-string>

# Callback URLs (must match Auth0 dashboard)
AUTH0_CALLBACK_URL=https://certa.app/auth/callback
AUTH0_LOGOUT_URL=https://certa.app
```

### Auth0 Dashboard Configuration

1. **Create Production Application**
   - Type: Regular Web Application
   - Name: CERTA Production
   
2. **Allowed Callback URLs**
   ```
   https://certa.app/auth/callback
   https://www.certa.app/auth/callback
   ```

3. **Allowed Logout URLs**
   ```
   https://certa.app
   https://www.certa.app
   ```

4. **Allowed Web Origins**
   ```
   https://certa.app
   https://www.certa.app
   ```

5. **Enable Connections**
   - Username-Password-Authentication
   - Google OAuth (optional)
   - LinkedIn OAuth (optional)

---

## STRIPE PRODUCTION CONFIGURATION (W2-003)

### Required Environment Variables

```bash
# Stripe API Keys (from Stripe Dashboard → Developers → API Keys)
STRIPE_SECRET_KEY=sk_live_<your-live-secret-key>
STRIPE_PUBLISHABLE_KEY=pk_live_<your-live-publishable-key>

# Webhook Secret (from Stripe Dashboard → Webhooks → Signing Secret)
STRIPE_WEBHOOK_SECRET=whsec_<your-webhook-secret>

# Product and Price IDs (create in Stripe Dashboard → Products)
STRIPE_PRODUCT_PRO_MONTHLY=prod_<monthly-product-id>
STRIPE_PRICE_PRO_MONTHLY=price_<monthly-price-id>
STRIPE_PRODUCT_PRO_YEARLY=prod_<yearly-product-id>
STRIPE_PRICE_PRO_YEARLY=price_<yearly-price-id>
```

### Stripe Dashboard Configuration

1. **Create Products**
   
   **CERTA Pro Monthly**
   - Name: CERTA Pro Monthly
   - Price: $49.00 USD / month
   - Billing: Recurring
   
   **CERTA Pro Yearly**
   - Name: CERTA Pro Yearly
   - Price: $399.00 USD / year
   - Billing: Recurring

2. **Configure Webhooks**
   
   Endpoint URL: `https://certa.app/webhook/stripe`
   
   Events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

3. **Customer Portal**
   - Enable in Settings → Billing → Customer Portal
   - Allow subscription management
   - Allow invoice history

---

## CUSTOM DOMAIN CONFIGURATION (W2-004)

### Vercel Domain Setup

1. **Add Domain in Vercel**
   - Go to Project Settings → Domains
   - Add `certa.app`
   - Add `www.certa.app`

2. **DNS Configuration**
   
   At your domain registrar, add these records:
   
   ```
   # Root domain
   Type: A
   Name: @
   Value: 76.76.21.21
   
   # WWW subdomain
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

3. **SSL Certificate**
   - Vercel automatically provisions SSL via Let's Encrypt
   - Verify HTTPS works: `https://certa.app`

---

## SUPABASE CONFIGURATION (W2-006)

### Required Environment Variables

```bash
# Supabase Project URL
SUPABASE_URL=https://<project-ref>.supabase.co

# Supabase API Keys
SUPABASE_ANON_KEY=eyJ...<anon-key>
SUPABASE_SERVICE_KEY=eyJ...<service-key>

# Database Connection (for direct access if needed)
DATABASE_URL=postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres
```

### Supabase Schema Setup

Run this SQL in Supabase SQL Editor:

```sql
-- Users table (synced from Auth0)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth0_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  subscription_tier TEXT DEFAULT 'free',
  stripe_customer_id TEXT,
  assessments_this_month INTEGER DEFAULT 0,
  assessments_reset_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assessments table (for assessment history - RG-001)
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  fluid_id TEXT NOT NULL,
  fluid_name TEXT NOT NULL,
  temperature NUMERIC,
  concentration NUMERIC,
  regime TEXT,
  results JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assessment counter per user
CREATE TABLE assessment_counts (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  count INTEGER DEFAULT 0,
  period_start TIMESTAMP WITH TIME ZONE DEFAULT DATE_TRUNC('month', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_auth0_id ON users(auth0_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_assessments_user_id ON assessments(user_id);
CREATE INDEX idx_assessments_created_at ON assessments(created_at);
CREATE INDEX idx_assessment_counts_period ON assessment_counts(period_start);

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_counts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = auth0_id);

CREATE POLICY "Users can view own assessments" ON assessments
  FOR SELECT USING (user_id = (SELECT id FROM users WHERE auth0_id = auth.uid()::text));

CREATE POLICY "Users can insert own assessments" ON assessments
  FOR INSERT WITH CHECK (user_id = (SELECT id FROM users WHERE auth0_id = auth.uid()::text));
```

---

## COMPLETE .env.production FILE

```bash
# ═══════════════════════════════════════════════════════════════════════════════
# CERTA PRODUCTION ENVIRONMENT
# VERCEL-2 MANAGED - DO NOT COMMIT TO REPOSITORY
# ═══════════════════════════════════════════════════════════════════════════════

# Application
NODE_ENV=production
APP_URL=https://certa.app

# Auth0
AUTH0_DOMAIN=certa.us.auth0.com
AUTH0_CLIENT_ID=<production-client-id>
AUTH0_CLIENT_SECRET=<production-client-secret>
AUTH0_AUDIENCE=https://api.certa.app
AUTH0_SESSION_SECRET=<64-char-hex>
AUTH0_CALLBACK_URL=https://certa.app/auth/callback
AUTH0_LOGOUT_URL=https://certa.app

# Stripe
STRIPE_SECRET_KEY=sk_live_<key>
STRIPE_PUBLISHABLE_KEY=pk_live_<key>
STRIPE_WEBHOOK_SECRET=whsec_<secret>
STRIPE_PRICE_PRO_MONTHLY=price_<id>
STRIPE_PRICE_PRO_YEARLY=price_<id>

# Supabase
SUPABASE_URL=https://<ref>.supabase.co
SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_KEY=<service-key>

# Sentry (Error Tracking)
SENTRY_DSN=https://<key>@sentry.io/<project>

# Analytics
VERCEL_ANALYTICS_ID=<analytics-id>
```

---

## SECRETS ROTATION SCHEDULE (VERCEL-2 Requirement)

| Secret | Rotation Period | Last Rotated | Next Rotation |
|--------|-----------------|--------------|---------------|
| AUTH0_CLIENT_SECRET | 90 days | - | +90 days |
| AUTH0_SESSION_SECRET | 180 days | - | +180 days |
| STRIPE_WEBHOOK_SECRET | 365 days | - | +365 days |
| SUPABASE_SERVICE_KEY | 90 days | - | +90 days |
| SENTRY_DSN | Never | - | - |

---

## VERIFICATION CHECKLIST

- [ ] All environment variables set in Vercel Dashboard
- [ ] Auth0 production application created
- [ ] Auth0 callback URLs configured
- [ ] Stripe products created
- [ ] Stripe webhook endpoint configured
- [ ] Custom domain DNS configured
- [ ] SSL certificate active
- [ ] Supabase project created
- [ ] Supabase schema deployed
- [ ] Sentry project created

---

**Document Version:** 1.0
**Task IDs:** W2-002, W2-003, W2-004, W2-006
**Owner:** VERCEL-2 (Environment & Secrets Agent)
**Date:** January 28, 2026
