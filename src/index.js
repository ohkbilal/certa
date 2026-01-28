/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CERTA SAAS - MAIN APPLICATION
 * Parliament Mandate: Week 1 MVP
 * Policy Version: V16.0 | Engine Version: V17.4
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Architecture per V16 §20.2:
 * - Auth layer SEPARATE from assessment engine
 * - Fresh RunContext per request (stateless)
 * - Tenant isolation via session
 * 
 * V16 §21.1: Safety features available to ALL tiers
 * ═══════════════════════════════════════════════════════════════════════════════
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { auth } = require('express-openid-connect');

const authRoutes = require('./auth/routes');
const billingRoutes = require('./billing/routes');
const { AUTH0_CONFIG, authMiddleware, getUserTier, canPerformAssessment } = require('./auth/auth0-config');

const app = express();
const PORT = process.env.PORT || 3000;

// ═══════════════════════════════════════════════════════════════════════════════
// MIDDLEWARE
// ═══════════════════════════════════════════════════════════════════════════════

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://*.auth0.com", "https://api.stripe.com"],
    },
  },
}));

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

// JSON parsing (except for Stripe webhook which needs raw body)
app.use((req, res, next) => {
  if (req.path === '/api/billing/webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH0 SETUP
// ═══════════════════════════════════════════════════════════════════════════════

// Auth0 configuration
const authConfig = {
  authRequired: false, // Allow public routes
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET || 'a-long-random-string-for-session-encryption',
  baseURL: process.env.BASE_URL || 'http://localhost:3000',
  clientID: AUTH0_CONFIG.clientId,
  issuerBaseURL: `https://${AUTH0_CONFIG.domain}`,
};

// Initialize Auth0 middleware
if (AUTH0_CONFIG.domain !== 'your-tenant.auth0.com') {
  app.use(auth(authConfig));
} else {
  console.warn('⚠️  Auth0 not configured. Running in development mode without auth.');
  // Mock auth for development
  app.use((req, res, next) => {
    req.oidc = {
      isAuthenticated: () => false,
      user: null,
    };
    next();
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    version: '18.0.0-alpha',
    policyVersion: 'V16.0',
    engineVersion: 'V17.4',
    timestamp: new Date().toISOString(),
  });
});

// Auth routes
app.use('/', authRoutes);

// Billing routes
app.use('/api/billing', billingRoutes);

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN APPLICATION ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// Landing page (public)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/landing.html'));
});

// App page (requires auth)
app.get('/app', (req, res) => {
  // Check if authenticated
  if (req.oidc && !req.oidc.isAuthenticated()) {
    return res.redirect('/login?returnTo=/app');
  }
  
  // Serve the CERTA engine
  res.sendFile(path.join(__dirname, '../public/certa-engine.html'));
});

// API: Check assessment allowance before running
app.get('/api/check-allowance', async (req, res) => {
  if (!req.oidc || !req.oidc.isAuthenticated()) {
    // Allow unauthenticated users limited access
    return res.json({
      allowed: true,
      reason: 'Guest access - limited features',
      tier: 'GUEST',
      remaining: 1,
    });
  }
  
  // TODO: Get actual count from database
  const currentMonthCount = 0;
  
  const result = canPerformAssessment(req.oidc.user, currentMonthCount);
  const tier = getUserTier(req.oidc.user);
  
  res.json({
    ...result,
    tier: tier.name,
    remaining: tier.assessmentsPerMonth === -1 
      ? 'unlimited' 
      : Math.max(0, tier.assessmentsPerMonth - currentMonthCount),
  });
});

// API: Log assessment (for tracking usage)
app.post('/api/log-assessment', async (req, res) => {
  if (!req.oidc || !req.oidc.isAuthenticated()) {
    return res.json({ logged: false, reason: 'Not authenticated' });
  }
  
  const { fluidId, timestamp } = req.body;
  
  // TODO: Store in database
  // - userId: req.oidc.user.sub
  // - fluidId
  // - timestamp
  // - tier
  
  console.log(`Assessment logged: ${req.oidc.user.email} - ${fluidId}`);
  
  res.json({ logged: true });
});

// ═══════════════════════════════════════════════════════════════════════════════
// PRICING PAGE
// ═══════════════════════════════════════════════════════════════════════════════

app.get('/pricing', (req, res) => {
  const isAuthenticated = req.oidc && req.oidc.isAuthenticated();
  const user = isAuthenticated ? req.oidc.user : null;
  const tier = user ? getUserTier(user) : null;
  
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Pricing - CERTA Industrial Fluid Assessment</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', system-ui, sans-serif; background: #0f172a; color: #e2e8f0; min-height: 100vh; }
        .header { padding: 20px; text-align: center; background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%); }
        .header h1 { font-size: 2rem; margin-bottom: 10px; }
        .container { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }
        .pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
        .pricing-card { background: #1e293b; border-radius: 16px; padding: 30px; border: 2px solid #334155; position: relative; }
        .pricing-card.popular { border-color: #3b82f6; }
        .popular-badge { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: #3b82f6; color: white; padding: 4px 16px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
        .tier-name { font-size: 1.5rem; font-weight: 600; margin-bottom: 10px; }
        .price { font-size: 3rem; font-weight: 700; color: #3b82f6; }
        .price span { font-size: 1rem; color: #94a3b8; }
        .annual-price { color: #10b981; font-size: 0.9rem; margin-top: 5px; }
        .features { margin: 20px 0; }
        .features li { padding: 8px 0; border-bottom: 1px solid #334155; list-style: none; }
        .features li::before { content: '✓ '; color: #10b981; }
        .btn { display: block; width: 100%; padding: 14px; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; text-align: center; text-decoration: none; margin-top: 20px; }
        .btn-primary { background: #3b82f6; color: white; }
        .btn-primary:hover { background: #2563eb; }
        .btn-secondary { background: #334155; color: #e2e8f0; }
        .btn-disabled { background: #475569; color: #94a3b8; cursor: not-allowed; }
        .coming-soon { background: #475569; color: #94a3b8; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; }
        .safety-note { background: #064e3b; border: 1px solid #10b981; padding: 20px; border-radius: 12px; margin-top: 40px; text-align: center; }
        .nav { display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; background: #1e293b; }
        .nav a { color: #e2e8f0; text-decoration: none; padding: 8px 16px; }
        .nav a:hover { color: #3b82f6; }
      </style>
    </head>
    <body>
      <nav class="nav">
        <a href="/" style="font-weight: 600; font-size: 1.2rem;">CERTA</a>
        <div>
          ${isAuthenticated 
            ? `<a href="/app">Dashboard</a><a href="/logout">Logout</a>` 
            : `<a href="/login">Login</a>`}
        </div>
      </nav>
      
      <div class="header">
        <h1>Simple, Transparent Pricing</h1>
        <p>All plans include full safety analysis. Upgrade for unlimited assessments.</p>
      </div>
      
      <div class="container">
        <div class="pricing-grid">
          <div class="pricing-card">
            <div class="tier-name">Free</div>
            <div class="price">$0</div>
            <ul class="features">
              <li>5 assessments per month</li>
              <li>All 437 fluids</li>
              <li>Full safety analysis</li>
              <li>Seal recommendations</li>
              <li>PDF export (watermarked)</li>
            </ul>
            <a href="/login" class="btn btn-secondary">Start Free</a>
          </div>
          
          <div class="pricing-card popular">
            <div class="popular-badge">Most Popular</div>
            <div class="tier-name">Pro</div>
            <div class="price">$49<span>/month</span></div>
            <div class="annual-price">or $399/year (save $189)</div>
            <ul class="features">
              <li>Unlimited assessments</li>
              <li>All 437 fluids</li>
              <li>Full safety analysis</li>
              <li>Seal recommendations</li>
              <li>Clean PDF export</li>
              <li>Excel export</li>
              <li>Assessment history</li>
              <li>Priority support</li>
            </ul>
            ${isAuthenticated && tier?.id === 'pro'
              ? `<span class="btn btn-disabled">Current Plan</span>`
              : `<a href="/api/billing/checkout?plan=monthly" class="btn btn-primary">Upgrade to Pro</a>`}
          </div>
          
          <div class="pricing-card">
            <div class="tier-name">Team <span class="coming-soon">Coming Soon</span></div>
            <div class="price" style="font-size: 1.5rem; color: #94a3b8;">Contact Us</div>
            <ul class="features">
              <li>Everything in Pro</li>
              <li>Team management</li>
              <li>Shared assessments</li>
              <li>API access</li>
              <li>SSO integration</li>
            </ul>
            <a href="mailto:sales@certa.app" class="btn btn-secondary">Contact Sales</a>
          </div>
        </div>
        
        <div class="safety-note">
          <h3 style="color: #6ee7b7; margin-bottom: 10px;">🛡️ Safety First</h3>
          <p>All safety features - regime classification, seal routing, failure warnings, and hard exclusions - are available on <strong>every tier</strong>, including Free. We never restrict safety analysis.</p>
        </div>
      </div>
    </body>
    </html>
  `);
});

// ═══════════════════════════════════════════════════════════════════════════════
// ERROR HANDLING
// ═══════════════════════════════════════════════════════════════════════════════

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════════════════════════════

app.listen(PORT, () => {
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('  CERTA SaaS Server');
  console.log('  Parliament Mandate: Week 1 MVP');
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log(`  🚀 Server running on http://localhost:${PORT}`);
  console.log(`  📋 Policy Version: V16.0`);
  console.log(`  ⚙️  Engine Version: V17.4`);
  console.log(`  🔐 Auth0: ${AUTH0_CONFIG.domain !== 'your-tenant.auth0.com' ? 'Configured' : 'Not configured (dev mode)'}`);
  console.log(`  💳 Stripe: ${process.env.STRIPE_SECRET_KEY ? 'Configured' : 'Not configured'}`);
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('');
  console.log('  Routes:');
  console.log('    GET  /           - Landing page');
  console.log('    GET  /app        - CERTA application (requires auth)');
  console.log('    GET  /pricing    - Pricing page');
  console.log('    GET  /login      - Auth0 login');
  console.log('    GET  /logout     - Auth0 logout');
  console.log('    GET  /health     - Health check');
  console.log('');
});

module.exports = app;
