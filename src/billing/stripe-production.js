/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CERTA STRIPE PRODUCTION CONFIGURATION
 * Week 2 Task: W2-003
 * Owner: VERCEL-2 (Environment & Secrets Agent)
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════
// ENVIRONMENT DETECTION
// ═══════════════════════════════════════════════════════════════════════════════

const isProduction = process.env.NODE_ENV === 'production';

// ═══════════════════════════════════════════════════════════════════════════════
// STRIPE CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const STRIPE_CONFIG = {
  // API Keys
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  secretKey: process.env.STRIPE_SECRET_KEY || '',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  
  // API Version
  apiVersion: '2023-10-16',
  
  // Currency
  currency: 'usd',
  
  // Portal configuration
  customerPortalEnabled: true,
  
  // Billing settings
  billing: {
    // Collect automatic tax
    automaticTax: true,
    
    // Payment methods
    paymentMethods: ['card'],
    
    // Allow promotion codes
    allowPromotionCodes: true,
    
    // Invoice settings
    invoiceSettings: {
      defaultPaymentMethod: null,
      footer: 'Thank you for using CERTA!'
    }
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// PRICING & PRODUCTS
// Per V16 §21.1 (Parliament Approved)
// ═══════════════════════════════════════════════════════════════════════════════

const STRIPE_PRODUCTS = {
  // Free Tier - No Stripe product needed
  free: {
    id: null,
    name: 'Free',
    description: '5 assessments per month',
    features: [
      '5 assessments/month',
      'Watermarked PDF exports',
      'All safety features',
      'Email support'
    ],
    limits: {
      assessmentsPerMonth: 5,
      pdfExport: true,
      pdfWatermark: true,
      history: false,
      excelExport: false,
      priority: false
    }
  },
  
  // Pro Monthly
  pro_monthly: {
    productId: process.env.STRIPE_PRODUCT_PRO || 'prod_CERTA_Pro',
    priceId: process.env.STRIPE_PRICE_PRO_MONTHLY || 'price_CERTA_Pro_Monthly',
    name: 'Pro Monthly',
    description: 'Unlimited assessments, clean exports',
    price: 4900, // $49.00
    interval: 'month',
    features: [
      'Unlimited assessments',
      'Clean PDF exports (no watermark)',
      'Assessment history',
      'Priority email support',
      'All safety features'
    ],
    limits: {
      assessmentsPerMonth: -1, // Unlimited
      pdfExport: true,
      pdfWatermark: false,
      history: true,
      excelExport: false,
      priority: true
    }
  },
  
  // Pro Annual (save $189/year)
  pro_annual: {
    productId: process.env.STRIPE_PRODUCT_PRO || 'prod_CERTA_Pro',
    priceId: process.env.STRIPE_PRICE_PRO_ANNUAL || 'price_CERTA_Pro_Annual',
    name: 'Pro Annual',
    description: 'Best value - save $189/year',
    price: 39900, // $399.00
    interval: 'year',
    features: [
      'Everything in Pro Monthly',
      'Save $189/year (32% off)',
      'Annual billing convenience'
    ],
    limits: {
      assessmentsPerMonth: -1,
      pdfExport: true,
      pdfWatermark: false,
      history: true,
      excelExport: false,
      priority: true
    }
  },
  
  // Team Tier (Revenue Gate RG-003 @ $5K MRR)
  team_monthly: {
    productId: process.env.STRIPE_PRODUCT_TEAM || 'prod_CERTA_Team',
    priceId: process.env.STRIPE_PRICE_TEAM_MONTHLY || 'price_CERTA_Team_Monthly',
    name: 'Team Monthly',
    description: 'Multi-user teams with shared assessments',
    price: 19900, // $199.00 base
    interval: 'month',
    perSeatPrice: 2900, // $29.00 per additional seat
    features: [
      'Everything in Pro',
      '5 team seats included',
      'Shared assessment library',
      'Team admin dashboard',
      'Usage analytics',
      'Phone support'
    ],
    limits: {
      assessmentsPerMonth: -1,
      pdfExport: true,
      pdfWatermark: false,
      history: true,
      excelExport: true,
      priority: true,
      teamSeatsIncluded: 5
    }
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// STRIPE SETUP CHECKLIST (Production)
// ═══════════════════════════════════════════════════════════════════════════════

const STRIPE_SETUP_CHECKLIST = {
  account: {
    type: 'Standard',
    country: 'US',
    businessType: 'Company',
    capabilities: ['card_payments', 'transfers']
  },
  
  products: [
    {
      name: 'CERTA Pro',
      description: 'Professional material compatibility assessment',
      prices: [
        { nickname: 'Pro Monthly', unitAmount: 4900, currency: 'usd', interval: 'month' },
        { nickname: 'Pro Annual', unitAmount: 39900, currency: 'usd', interval: 'year' }
      ]
    },
    {
      name: 'CERTA Team',
      description: 'Team collaboration for material compatibility',
      prices: [
        { nickname: 'Team Base', unitAmount: 19900, currency: 'usd', interval: 'month' },
        { nickname: 'Team Seat', unitAmount: 2900, currency: 'usd', interval: 'month', metered: true }
      ]
    }
  ],
  
  webhookEndpoints: [
    {
      url: 'https://certa.app/api/webhooks/stripe',
      events: [
        'checkout.session.completed',
        'customer.subscription.created',
        'customer.subscription.updated',
        'customer.subscription.deleted',
        'invoice.paid',
        'invoice.payment_failed',
        'customer.created',
        'customer.updated'
      ]
    }
  ],
  
  customerPortal: {
    enabled: true,
    features: {
      invoiceHistory: true,
      subscriptionCancel: true,
      subscriptionPause: false,
      subscriptionUpdate: true,
      paymentMethodUpdate: true
    },
    businessProfile: {
      headline: 'Manage your CERTA subscription',
      privacyPolicyUrl: 'https://certa.app/privacy',
      termsOfServiceUrl: 'https://certa.app/terms'
    }
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// STRIPE HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

const stripe = require('stripe')(STRIPE_CONFIG.secretKey, {
  apiVersion: STRIPE_CONFIG.apiVersion
});

/**
 * Create a checkout session for subscription
 * @param {object} params - Checkout parameters
 * @returns {Promise<object>} Stripe checkout session
 */
async function createCheckoutSession({ userId, email, priceId, successUrl, cancelUrl }) {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    customer_email: email,
    client_reference_id: userId,
    success_url: successUrl || 'https://certa.app/dashboard?checkout=success',
    cancel_url: cancelUrl || 'https://certa.app/pricing?checkout=cancelled',
    allow_promotion_codes: STRIPE_CONFIG.billing.allowPromotionCodes,
    automatic_tax: { enabled: STRIPE_CONFIG.billing.automaticTax },
    metadata: {
      userId,
      source: 'certa_web'
    }
  });
  
  return session;
}

/**
 * Create customer portal session
 * @param {string} customerId - Stripe customer ID
 * @returns {Promise<object>} Portal session
 */
async function createPortalSession(customerId) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: 'https://certa.app/dashboard/billing'
  });
  
  return session;
}

/**
 * Get or create Stripe customer
 * @param {object} user - User object with email, userId
 * @returns {Promise<object>} Stripe customer
 */
async function getOrCreateCustomer({ userId, email, name }) {
  // Check for existing customer
  const existing = await stripe.customers.list({
    email,
    limit: 1
  });
  
  if (existing.data.length > 0) {
    return existing.data[0];
  }
  
  // Create new customer
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      userId,
      source: 'certa_web'
    }
  });
  
  return customer;
}

/**
 * Get subscription status for a customer
 * @param {string} customerId - Stripe customer ID
 * @returns {Promise<object>} Subscription details
 */
async function getSubscriptionStatus(customerId) {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'active',
    limit: 1
  });
  
  if (subscriptions.data.length === 0) {
    return {
      tier: 'free',
      status: 'none',
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false
    };
  }
  
  const sub = subscriptions.data[0];
  const priceId = sub.items.data[0].price.id;
  
  // Determine tier from price ID
  let tier = 'pro_monthly';
  if (priceId === STRIPE_PRODUCTS.pro_annual.priceId) {
    tier = 'pro_annual';
  } else if (priceId === STRIPE_PRODUCTS.team_monthly.priceId) {
    tier = 'team_monthly';
  }
  
  return {
    tier,
    status: sub.status,
    currentPeriodEnd: new Date(sub.current_period_end * 1000),
    cancelAtPeriodEnd: sub.cancel_at_period_end,
    subscriptionId: sub.id
  };
}

/**
 * Cancel subscription at period end
 * @param {string} subscriptionId - Stripe subscription ID
 * @returns {Promise<object>} Updated subscription
 */
async function cancelSubscription(subscriptionId) {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true
  });
  
  return subscription;
}

/**
 * Handle Stripe webhook events
 * @param {object} event - Stripe event
 * @returns {Promise<object>} Processing result
 */
async function handleWebhookEvent(event) {
  const handlers = {
    'checkout.session.completed': async (session) => {
      // Upgrade user tier
      const userId = session.client_reference_id;
      const customerId = session.customer;
      // Update user in database with customerId and tier
      return { action: 'upgrade', userId, customerId };
    },
    
    'customer.subscription.deleted': async (subscription) => {
      // Downgrade user to free
      const customerId = subscription.customer;
      return { action: 'downgrade', customerId };
    },
    
    'invoice.payment_failed': async (invoice) => {
      // Send payment failed notification
      const customerId = invoice.customer;
      return { action: 'payment_failed', customerId };
    }
  };
  
  const handler = handlers[event.type];
  if (handler) {
    return await handler(event.data.object);
  }
  
  return { action: 'ignored', type: event.type };
}

/**
 * Validate Stripe configuration
 * @returns {object} Validation result
 */
function validateStripeConfig() {
  const issues = [];
  
  if (!STRIPE_CONFIG.publishableKey) {
    issues.push('Missing STRIPE_PUBLISHABLE_KEY');
  } else if (!STRIPE_CONFIG.publishableKey.startsWith('pk_')) {
    issues.push('Invalid STRIPE_PUBLISHABLE_KEY format');
  }
  
  if (!STRIPE_CONFIG.secretKey) {
    issues.push('Missing STRIPE_SECRET_KEY');
  } else if (!STRIPE_CONFIG.secretKey.startsWith('sk_')) {
    issues.push('Invalid STRIPE_SECRET_KEY format');
  }
  
  if (!STRIPE_CONFIG.webhookSecret) {
    issues.push('Missing STRIPE_WEBHOOK_SECRET');
  } else if (!STRIPE_CONFIG.webhookSecret.startsWith('whsec_')) {
    issues.push('Invalid STRIPE_WEBHOOK_SECRET format');
  }
  
  // Check for test vs live keys in production
  if (isProduction) {
    if (STRIPE_CONFIG.publishableKey.includes('_test_')) {
      issues.push('Using TEST publishable key in production');
    }
    if (STRIPE_CONFIG.secretKey.includes('_test_')) {
      issues.push('Using TEST secret key in production');
    }
  }
  
  return {
    valid: issues.length === 0,
    issues,
    mode: STRIPE_CONFIG.secretKey.includes('_test_') ? 'test' : 'live'
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
  STRIPE_CONFIG,
  STRIPE_PRODUCTS,
  STRIPE_SETUP_CHECKLIST,
  stripe,
  createCheckoutSession,
  createPortalSession,
  getOrCreateCustomer,
  getSubscriptionStatus,
  cancelSubscription,
  handleWebhookEvent,
  validateStripeConfig,
  isProduction
};
