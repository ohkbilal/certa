/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CERTA STRIPE BILLING CONFIGURATION
 * Parliament Mandate: Week 1, Day 5-7
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Pricing per Parliament Decision:
 * - Pro Monthly: $49/month
 * - Pro Annual: $399/year (2 months free)
 * 
 * V16 §21.1: Monetization Boundaries
 * - Tier restrictions apply ONLY to convenience features
 * - Safety features ALWAYS available to all tiers
 * ═══════════════════════════════════════════════════════════════════════════════
 */

require('dotenv').config();
const Stripe = require('stripe');

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_xxx');

/**
 * Product and Price Configuration
 * 
 * To set up in Stripe Dashboard:
 * 1. Create Product "CERTA Pro"
 * 2. Create two prices: Monthly ($49) and Annual ($399)
 * 3. Copy price IDs to .env file
 */
const STRIPE_CONFIG = {
  // Product ID
  productId: process.env.STRIPE_PRODUCT_ID || 'prod_xxx',
  
  // Price IDs
  prices: {
    proMonthly: process.env.STRIPE_PRICE_PRO_MONTHLY || 'price_xxx_monthly',
    proAnnual: process.env.STRIPE_PRICE_PRO_ANNUAL || 'price_xxx_annual',
  },
  
  // Webhook secret for verifying Stripe events
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_xxx',
  
  // Success/Cancel URLs
  successUrl: process.env.STRIPE_SUCCESS_URL || 'http://localhost:3000/billing/success',
  cancelUrl: process.env.STRIPE_CANCEL_URL || 'http://localhost:3000/billing/cancel',
};

/**
 * Create Stripe Checkout Session
 * 
 * @param {string} userId - Auth0 user ID
 * @param {string} email - User email
 * @param {string} plan - 'monthly' or 'annual'
 * @returns {Promise<Object>} Stripe checkout session
 */
async function createCheckoutSession(userId, email, plan = 'monthly') {
  const priceId = plan === 'annual' 
    ? STRIPE_CONFIG.prices.proAnnual 
    : STRIPE_CONFIG.prices.proMonthly;
  
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: email,
      client_reference_id: userId,
      success_url: `${STRIPE_CONFIG.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: STRIPE_CONFIG.cancelUrl,
      subscription_data: {
        metadata: {
          userId: userId,
          plan: plan,
        },
      },
      metadata: {
        userId: userId,
        plan: plan,
      },
    });
    
    return {
      sessionId: session.id,
      url: session.url,
    };
  } catch (error) {
    console.error('Stripe checkout error:', error);
    throw error;
  }
}

/**
 * Create Stripe Customer Portal Session
 * For managing subscription, updating payment method, canceling
 * 
 * @param {string} customerId - Stripe customer ID
 * @returns {Promise<Object>} Portal session
 */
async function createPortalSession(customerId) {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: process.env.APP_URL || 'http://localhost:3000/app',
    });
    
    return {
      url: session.url,
    };
  } catch (error) {
    console.error('Stripe portal error:', error);
    throw error;
  }
}

/**
 * Get subscription status for user
 * 
 * @param {string} customerId - Stripe customer ID
 * @returns {Promise<Object>} Subscription status
 */
async function getSubscriptionStatus(customerId) {
  if (!customerId) {
    return { status: 'free', tier: 'FREE' };
  }
  
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1,
    });
    
    if (subscriptions.data.length === 0) {
      return { status: 'free', tier: 'FREE' };
    }
    
    const subscription = subscriptions.data[0];
    const priceId = subscription.items.data[0].price.id;
    
    // Determine tier from price
    let tier = 'PRO';
    let plan = 'monthly';
    
    if (priceId === STRIPE_CONFIG.prices.proAnnual) {
      plan = 'annual';
    }
    
    return {
      status: 'active',
      tier: tier,
      plan: plan,
      subscriptionId: subscription.id,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    };
  } catch (error) {
    console.error('Get subscription error:', error);
    return { status: 'error', tier: 'FREE' };
  }
}

/**
 * Handle Stripe webhook events
 * 
 * @param {string} body - Raw request body
 * @param {string} signature - Stripe signature header
 * @returns {Object} Event processing result
 */
async function handleWebhook(body, signature) {
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      STRIPE_CONFIG.webhookSecret
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    throw new Error('Invalid signature');
  }
  
  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      return handleCheckoutComplete(event.data.object);
      
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      return handleSubscriptionUpdate(event.data.object);
      
    case 'customer.subscription.deleted':
      return handleSubscriptionCanceled(event.data.object);
      
    case 'invoice.payment_failed':
      return handlePaymentFailed(event.data.object);
      
    default:
      console.log(`Unhandled event type: ${event.type}`);
      return { handled: false, type: event.type };
  }
}

/**
 * Handle successful checkout
 */
async function handleCheckoutComplete(session) {
  const userId = session.client_reference_id;
  const customerId = session.customer;
  const subscriptionId = session.subscription;
  
  console.log(`Checkout complete for user ${userId}`);
  
  // TODO: Update user in database with:
  // - stripeCustomerId
  // - subscriptionId
  // - tier = 'PRO'
  
  return {
    handled: true,
    type: 'checkout.session.completed',
    userId,
    customerId,
    subscriptionId,
    action: 'UPDATE_USER_TIER_TO_PRO'
  };
}

/**
 * Handle subscription update
 */
async function handleSubscriptionUpdate(subscription) {
  const userId = subscription.metadata?.userId;
  const status = subscription.status;
  
  console.log(`Subscription ${subscription.id} updated: ${status}`);
  
  // TODO: Update user tier in database based on status
  
  return {
    handled: true,
    type: 'subscription.updated',
    subscriptionId: subscription.id,
    status,
    action: status === 'active' ? 'ENSURE_PRO_TIER' : 'CHECK_TIER'
  };
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionCanceled(subscription) {
  const userId = subscription.metadata?.userId;
  
  console.log(`Subscription ${subscription.id} canceled`);
  
  // TODO: Downgrade user to FREE tier in database
  
  return {
    handled: true,
    type: 'subscription.deleted',
    subscriptionId: subscription.id,
    action: 'DOWNGRADE_TO_FREE'
  };
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(invoice) {
  const customerId = invoice.customer;
  
  console.log(`Payment failed for customer ${customerId}`);
  
  // TODO: Send email notification, possibly downgrade after grace period
  
  return {
    handled: true,
    type: 'invoice.payment_failed',
    customerId,
    action: 'SEND_PAYMENT_FAILED_EMAIL'
  };
}

/**
 * Cancel subscription
 * 
 * @param {string} subscriptionId - Stripe subscription ID
 * @param {boolean} immediate - Cancel immediately vs at period end
 */
async function cancelSubscription(subscriptionId, immediate = false) {
  try {
    if (immediate) {
      await stripe.subscriptions.cancel(subscriptionId);
    } else {
      await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Cancel subscription error:', error);
    throw error;
  }
}

module.exports = {
  stripe,
  STRIPE_CONFIG,
  createCheckoutSession,
  createPortalSession,
  getSubscriptionStatus,
  handleWebhook,
  cancelSubscription,
};
