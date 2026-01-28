/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CERTA AUTH ROUTES
 * Parliament Mandate: Week 1, Day 3-4
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const express = require('express');
const router = express.Router();
const { getUserTier, canPerformAssessment, checkFeatureAccess } = require('./auth0-config');

/**
 * Login route - redirects to Auth0
 */
router.get('/login', (req, res) => {
  res.oidc.login({
    returnTo: req.query.returnTo || '/app'
  });
});

/**
 * Logout route
 */
router.get('/logout', (req, res) => {
  res.oidc.logout({
    returnTo: process.env.AUTH0_LOGOUT_URL || 'http://localhost:3000'
  });
});

/**
 * Callback route - Auth0 redirects here after login
 */
router.get('/callback', (req, res) => {
  // Auth0 SDK handles this automatically
  res.redirect('/app');
});

/**
 * User profile endpoint
 */
router.get('/api/user/profile', (req, res) => {
  if (!req.oidc || !req.oidc.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const user = req.oidc.user;
  const tier = getUserTier(user);
  
  res.json({
    id: user.sub,
    email: user.email,
    name: user.name,
    picture: user.picture,
    tier: {
      id: tier.id,
      name: tier.name,
      assessmentsPerMonth: tier.assessmentsPerMonth,
      features: tier.features
    }
  });
});

/**
 * Check assessment allowance
 */
router.get('/api/user/assessment-allowance', async (req, res) => {
  if (!req.oidc || !req.oidc.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  // TODO: Get actual count from database
  const currentMonthCount = 0;
  
  const result = canPerformAssessment(req.oidc.user, currentMonthCount);
  
  res.json({
    ...result,
    currentCount: currentMonthCount,
    tier: getUserTier(req.oidc.user).name
  });
});

/**
 * Check feature access
 */
router.get('/api/user/feature/:feature', (req, res) => {
  if (!req.oidc || !req.oidc.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const result = checkFeatureAccess(req.oidc.user, req.params.feature);
  res.json(result);
});

/**
 * Upgrade to Pro - redirects to Stripe Checkout
 */
router.get('/upgrade', (req, res) => {
  if (!req.oidc || !req.oidc.isAuthenticated()) {
    return res.redirect('/login?returnTo=/upgrade');
  }
  
  // Redirect to billing (Stripe Checkout)
  res.redirect('/api/billing/checkout?plan=pro');
});

module.exports = router;
