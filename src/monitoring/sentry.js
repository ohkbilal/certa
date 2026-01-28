/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CERTA SENTRY ERROR TRACKING
 * Week 2 Task: W2-008
 * Owner: VERCEL-4 (Monitoring & Observability Agent)
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const Sentry = require('@sentry/node');
const { ProfilingIntegration } = require('@sentry/profiling-node');

// ═══════════════════════════════════════════════════════════════════════════════
// SENTRY CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const SENTRY_CONFIG = {
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  release: `certa-saas@${process.env.npm_package_version || '1.0.0'}`,
  
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Profiling
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Error filtering
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
    /^NetworkError/,
    /^AbortError/
  ],
  
  // Breadcrumb filtering
  beforeBreadcrumb(breadcrumb) {
    // Don't capture console breadcrumbs in production
    if (process.env.NODE_ENV === 'production' && breadcrumb.category === 'console') {
      return null;
    }
    return breadcrumb;
  },
  
  // Error filtering
  beforeSend(event, hint) {
    const error = hint.originalException;
    
    // Don't send expected errors
    if (error && error.expected) {
      return null;
    }
    
    // Scrub sensitive data
    if (event.request) {
      delete event.request.cookies;
      if (event.request.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.cookie;
      }
    }
    
    return event;
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Initialize Sentry
 * @param {object} app - Express app (optional)
 */
function initSentry(app = null) {
  if (!SENTRY_CONFIG.dsn) {
    console.warn('[SENTRY] No DSN configured, error tracking disabled');
    return;
  }
  
  Sentry.init({
    ...SENTRY_CONFIG,
    integrations: [
      // Enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // Enable Express.js middleware tracing
      ...(app ? [new Sentry.Integrations.Express({ app })] : []),
      // Enable profiling
      new ProfilingIntegration()
    ]
  });
  
  console.log('[SENTRY] Initialized with environment:', SENTRY_CONFIG.environment);
}

// ═══════════════════════════════════════════════════════════════════════════════
// ERROR HANDLERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Capture exception with context
 * @param {Error} error - Error to capture
 * @param {object} context - Additional context
 */
function captureException(error, context = {}) {
  Sentry.withScope((scope) => {
    // Add context
    if (context.user) {
      scope.setUser(context.user);
    }
    
    if (context.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }
    
    if (context.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }
    
    if (context.level) {
      scope.setLevel(context.level);
    }
    
    Sentry.captureException(error);
  });
}

/**
 * Capture message with context
 * @param {string} message - Message to capture
 * @param {string} level - Sentry level (info, warning, error)
 * @param {object} context - Additional context
 */
function captureMessage(message, level = 'info', context = {}) {
  Sentry.withScope((scope) => {
    if (context.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }
    
    if (context.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }
    
    Sentry.captureMessage(message, level);
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// CERTA-SPECIFIC ERROR TRACKING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Track chemistry engine errors
 * Reports to ENF-1 for policy violation detection
 */
function trackEngineError(error, assessment) {
  captureException(error, {
    tags: {
      category: 'engine',
      fluidId: assessment?.fluidId,
      regime: assessment?.regime
    },
    extra: {
      assessment: assessment,
      policyVersion: 'V15'
    },
    level: 'error'
  });
  
  // Also report to ENF-1 for violation detection
  console.error('[ENF-1 ALERT] Engine error detected:', {
    error: error.message,
    fluidId: assessment?.fluidId,
    timestamp: new Date().toISOString()
  });
}

/**
 * Track authentication errors
 */
function trackAuthError(error, context) {
  captureException(error, {
    tags: {
      category: 'auth',
      provider: context?.provider || 'auth0'
    },
    extra: context,
    level: 'error'
  });
}

/**
 * Track billing errors
 */
function trackBillingError(error, context) {
  captureException(error, {
    tags: {
      category: 'billing',
      provider: 'stripe',
      event: context?.event
    },
    extra: context,
    level: 'error'
  });
}

/**
 * Track policy violations (critical)
 * Reports to ENF-1 immediately
 */
function trackPolicyViolation(violation) {
  captureMessage(`Policy Violation: ${violation.type}`, 'fatal', {
    tags: {
      category: 'policy_violation',
      violationType: violation.type,
      policyClause: violation.clause
    },
    extra: violation
  });
  
  // Alert ENF-1
  console.error('[ENF-1 CRITICAL] Policy violation detected:', violation);
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPRESS MIDDLEWARE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Sentry request handler middleware
 * Must be first middleware
 */
const requestHandler = Sentry.Handlers.requestHandler();

/**
 * Sentry tracing handler middleware
 * Must be after request handler
 */
const tracingHandler = Sentry.Handlers.tracingHandler();

/**
 * Sentry error handler middleware
 * Must be before any other error handlers
 */
const errorHandler = Sentry.Handlers.errorHandler({
  shouldHandleError(error) {
    // Capture all 500 errors
    if (error.status >= 500) return true;
    // Capture 4xx errors that aren't validation
    if (error.status >= 400 && error.status < 500 && error.status !== 400 && error.status !== 422) {
      return true;
    }
    return false;
  }
});

/**
 * Custom error handler for CERTA
 */
function certaErrorHandler(err, req, res, next) {
  // Log error
  console.error('[ERROR]', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  // Categorize and track
  if (err.isEngineError) {
    trackEngineError(err, req.body?.assessment);
  } else if (err.isAuthError) {
    trackAuthError(err, { path: req.path });
  } else if (err.isBillingError) {
    trackBillingError(err, { path: req.path });
  } else {
    captureException(err, {
      tags: {
        path: req.path,
        method: req.method
      }
    });
  }
  
  // Send error response
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    error: {
      message: process.env.NODE_ENV === 'production' 
        ? 'An error occurred' 
        : err.message,
      code: err.code || 'INTERNAL_ERROR',
      requestId: res.sentry
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLIENT-SIDE ERROR TRACKING SCRIPT
// ═══════════════════════════════════════════════════════════════════════════════

const CLIENT_ERROR_SCRIPT = `
<!-- Sentry Browser SDK -->
<script
  src="https://browser.sentry-cdn.com/7.x/bundle.tracing.min.js"
  crossorigin="anonymous"
></script>
<script>
  Sentry.init({
    dsn: '${process.env.SENTRY_DSN || ''}',
    environment: '${process.env.NODE_ENV || 'development'}',
    release: 'certa-saas@1.0.0',
    
    // Performance
    tracesSampleRate: 0.1,
    
    // Error filtering
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      /^NetworkError/,
      /^AbortError/
    ],
    
    // Scrub sensitive data
    beforeSend(event) {
      // Remove any auth tokens from URLs
      if (event.request && event.request.url) {
        event.request.url = event.request.url.replace(/token=[^&]+/, 'token=REDACTED');
      }
      return event;
    }
  });
  
  // Track CERTA-specific errors
  window.certaErrors = {
    trackEngine: function(error, fluidId) {
      Sentry.withScope(function(scope) {
        scope.setTag('category', 'engine');
        scope.setTag('fluidId', fluidId);
        Sentry.captureException(error);
      });
    },
    
    trackUI: function(error, component) {
      Sentry.withScope(function(scope) {
        scope.setTag('category', 'ui');
        scope.setTag('component', component);
        Sentry.captureException(error);
      });
    }
  };
</script>
`;

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
  // Initialization
  initSentry,
  SENTRY_CONFIG,
  
  // Error tracking
  captureException,
  captureMessage,
  
  // CERTA-specific tracking
  trackEngineError,
  trackAuthError,
  trackBillingError,
  trackPolicyViolation,
  
  // Express middleware
  requestHandler,
  tracingHandler,
  errorHandler,
  certaErrorHandler,
  
  // Client script
  CLIENT_ERROR_SCRIPT,
  
  // Sentry instance
  Sentry
};
