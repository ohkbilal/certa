/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CERTA BILLING ROUTES
 * Parliament Mandate: Week 1, Day 5-7
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const express = require('express');
const router = express.Router();
const {
  createCheckoutSession,
  createPortalSession,
  getSubscriptionStatus,
  handleWebhook,
} = require('./stripe-config');

/**
 * Start checkout process
 * GET /api/billing/checkout?plan=monthly|annual
 */
router.get('/checkout', async (req, res) => {
  if (!req.oidc || !req.oidc.isAuthenticated()) {
    return res.redirect('/login?returnTo=/upgrade');
  }
  
  const user = req.oidc.user;
  const plan = req.query.plan || 'monthly';
  
  try {
    const session = await createCheckoutSession(
      user.sub,
      user.email,
      plan
    );
    
    // Redirect to Stripe Checkout
    res.redirect(session.url);
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

/**
 * Checkout success page
 * GET /billing/success?session_id=xxx
 */
router.get('/success', async (req, res) => {
  const sessionId = req.query.session_id;
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Payment Successful - CERTA</title>
      <style>
        body { font-family: system-ui; background: #0f172a; color: #e2e8f0; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
        .card { background: #1e293b; padding: 40px; border-radius: 16px; text-align: center; max-width: 400px; }
        h1 { color: #10b981; margin-bottom: 10px; }
        p { color: #94a3b8; margin-bottom: 20px; }
        a { display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 8px; }
        a:hover { background: #2563eb; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>✓ Payment Successful!</h1>
        <p>Welcome to CERTA Pro! Your account has been upgraded with unlimited assessments.</p>
        <a href="/app">Start Using CERTA Pro</a>
      </div>
    </body>
    </html>
  `);
});

/**
 * Checkout canceled page
 * GET /billing/cancel
 */
router.get('/cancel', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Payment Canceled - CERTA</title>
      <style>
        body { font-family: system-ui; background: #0f172a; color: #e2e8f0; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
        .card { background: #1e293b; padding: 40px; border-radius: 16px; text-align: center; max-width: 400px; }
        h1 { color: #f59e0b; margin-bottom: 10px; }
        p { color: #94a3b8; margin-bottom: 20px; }
        a { display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 8px; margin: 5px; }
        a:hover { background: #2563eb; }
        a.secondary { background: #475569; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>Payment Canceled</h1>
        <p>No worries! You can upgrade anytime. Your free tier includes all safety features.</p>
        <a href="/app">Continue with Free</a>
        <a href="/upgrade" class="secondary">Try Again</a>
      </div>
    </body>
    </html>
  `);
});

/**
 * Customer portal - manage subscription
 * GET /api/billing/portal
 */
router.get('/portal', async (req, res) => {
  if (!req.oidc || !req.oidc.isAuthenticated()) {
    return res.redirect('/login?returnTo=/api/billing/portal');
  }
  
  // Get Stripe customer ID from user metadata
  const user = req.oidc.user;
  const customerId = user.app_metadata?.stripeCustomerId;
  
  if (!customerId) {
    return res.redirect('/upgrade');
  }
  
  try {
    const session = await createPortalSession(customerId);
    res.redirect(session.url);
  } catch (error) {
    console.error('Portal error:', error);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

/**
 * Get subscription status
 * GET /api/billing/status
 */
router.get('/status', async (req, res) => {
  if (!req.oidc || !req.oidc.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const user = req.oidc.user;
  const customerId = user.app_metadata?.stripeCustomerId;
  
  const status = await getSubscriptionStatus(customerId);
  
  res.json({
    ...status,
    email: user.email
  });
});

/**
 * Stripe webhook endpoint
 * POST /api/billing/webhook
 * 
 * IMPORTANT: This must receive raw body, not JSON parsed
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['stripe-signature'];
  
  try {
    const result = await handleWebhook(req.body, signature);
    console.log('Webhook processed:', result);
    res.json({ received: true, ...result });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * Pricing page data
 * GET /api/billing/pricing
 */
router.get('/pricing', (req, res) => {
  res.json({
    tiers: [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        priceAnnual: 0,
        features: [
          '5 assessments per month',
          'All 437 fluids database',
          'Full safety analysis',
          'Seal recommendations',
          'PDF export (watermarked)',
        ],
        limitations: [
          'Limited to 5 assessments/month',
          'Watermarked PDF exports',
        ],
        cta: 'Start Free',
        ctaUrl: '/login'
      },
      {
        id: 'pro',
        name: 'Pro',
        price: 49,
        priceAnnual: 399,
        annualSavings: 189, // $49*12 - $399
        features: [
          'Unlimited assessments',
          'All 437 fluids database',
          'Full safety analysis',
          'Seal recommendations',
          'Clean PDF export',
          'Excel export',
          'Assessment history',
          'Priority support',
        ],
        popular: true,
        cta: 'Upgrade to Pro',
        ctaUrl: '/api/billing/checkout?plan=monthly',
        ctaAnnual: '/api/billing/checkout?plan=annual'
      },
      {
        id: 'team',
        name: 'Team',
        price: null,
        features: [
          'Everything in Pro',
          'Team management',
          'Shared assessments',
          'API access',
          'SSO integration',
        ],
        cta: 'Contact Us',
        ctaUrl: 'mailto:sales@certa.app?subject=CERTA%20Team%20Plan',
        comingSoon: true
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: null,
        features: [
          'Everything in Team',
          'Custom fluids',
          'White-label option',
          'Dedicated support',
          'SLA guarantee',
        ],
        cta: 'Contact Us',
        ctaUrl: 'mailto:sales@certa.app?subject=CERTA%20Enterprise',
        comingSoon: true
      }
    ],
    faq: [
      {
        q: 'What happens when I reach my free limit?',
        a: 'You\'ll be prompted to upgrade. Your previous assessments remain accessible, but you cannot run new ones until next month or until you upgrade.'
      },
      {
        q: 'Can I cancel anytime?',
        a: 'Yes, you can cancel your subscription anytime. You\'ll retain Pro access until the end of your billing period.'
      },
      {
        q: 'Are safety features available on Free?',
        a: 'Yes! All safety analysis, seal recommendations, and failure warnings are available on every tier. We never restrict safety features.'
      },
      {
        q: 'What payment methods do you accept?',
        a: 'We accept all major credit cards via Stripe. Enterprise customers can pay by invoice.'
      }
    ]
  });
});

module.exports = router;
