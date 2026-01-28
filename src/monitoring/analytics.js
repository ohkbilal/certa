/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CERTA VERCEL ANALYTICS INTEGRATION
 * Week 2 Task: W2-007
 * Owner: VERCEL-4 (Monitoring & Observability Agent)
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYTICS CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const ANALYTICS_CONFIG = {
  // Core Web Vitals targets (per VERCEL-4 mandate)
  targets: {
    LCP: 2500,   // Largest Contentful Paint (ms) - target: <2.5s
    FID: 100,    // First Input Delay (ms) - target: <100ms
    CLS: 0.1,    // Cumulative Layout Shift - target: <0.1
    TTFB: 100,   // Time to First Byte (ms) - target: <100ms (VERCEL-3 mandate)
    FCP: 1800,   // First Contentful Paint (ms) - target: <1.8s
    INP: 200     // Interaction to Next Paint (ms) - target: <200ms
  },
  
  // Alert thresholds
  alertThresholds: {
    errorRate: 0.05,        // 5% error rate triggers alert
    p99ResponseTime: 5000,  // 5s p99 triggers alert
    availabilityMin: 0.99   // 99% availability required
  },
  
  // Sampling rates
  sampling: {
    production: 1.0,   // 100% sampling in production
    preview: 0.1       // 10% sampling in preview
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// CLIENT-SIDE ANALYTICS SNIPPET
// ═══════════════════════════════════════════════════════════════════════════════

const ANALYTICS_SCRIPT = `
<!-- Vercel Analytics -->
<script>
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
</script>
<script defer src="/_vercel/insights/script.js"></script>

<!-- Vercel Speed Insights -->
<script>
  window.si = window.si || function () { (window.siq = window.siq || []).push(arguments); };
</script>
<script defer src="/_vercel/speed-insights/script.js"></script>

<!-- Custom Event Tracking -->
<script>
  // Track assessment events
  function trackAssessment(fluidId, regime, materialsCount) {
    if (window.va) {
      window.va('event', {
        name: 'assessment_completed',
        data: {
          fluidId: fluidId,
          regime: regime,
          materialsCount: materialsCount
        }
      });
    }
  }
  
  // Track conversion events
  function trackConversion(event, data) {
    if (window.va) {
      window.va('event', {
        name: event,
        data: data
      });
    }
  }
  
  // Track errors
  function trackError(error, context) {
    if (window.va) {
      window.va('event', {
        name: 'error',
        data: {
          message: error.message,
          stack: error.stack?.substring(0, 500),
          context: context
        }
      });
    }
  }
  
  // Expose functions globally
  window.certaAnalytics = {
    trackAssessment: trackAssessment,
    trackConversion: trackConversion,
    trackError: trackError
  };
</script>
`;

// ═══════════════════════════════════════════════════════════════════════════════
// SERVER-SIDE ANALYTICS TRACKING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Track server-side events
 * @param {string} eventName - Event name
 * @param {object} data - Event data
 * @param {object} request - Express request object
 */
async function trackServerEvent(eventName, data, request = null) {
  const event = {
    timestamp: new Date().toISOString(),
    event: eventName,
    data: data,
    metadata: {}
  };
  
  if (request) {
    event.metadata = {
      ip: request.ip || request.headers['x-forwarded-for'],
      userAgent: request.headers['user-agent'],
      referer: request.headers['referer'],
      path: request.path
    };
  }
  
  // Log for now (in production, send to analytics service)
  console.log('[ANALYTICS]', JSON.stringify(event));
  
  // Store in memory for dashboard
  analyticsBuffer.push(event);
  if (analyticsBuffer.length > 1000) {
    analyticsBuffer.shift();
  }
  
  return event;
}

// In-memory buffer for recent events
const analyticsBuffer = [];

// ═══════════════════════════════════════════════════════════════════════════════
// METRICS COLLECTION
// ═══════════════════════════════════════════════════════════════════════════════

const metrics = {
  requests: {
    total: 0,
    success: 0,
    error: 0,
    byPath: {}
  },
  assessments: {
    total: 0,
    byFluid: {},
    byRegime: {}
  },
  users: {
    active: new Set(),
    signups: 0,
    conversions: 0
  },
  performance: {
    responseTimes: [],
    p50: 0,
    p95: 0,
    p99: 0
  }
};

/**
 * Record request metrics
 * @param {object} req - Request object
 * @param {object} res - Response object
 * @param {number} duration - Request duration in ms
 */
function recordRequest(req, res, duration) {
  metrics.requests.total++;
  
  if (res.statusCode >= 200 && res.statusCode < 400) {
    metrics.requests.success++;
  } else {
    metrics.requests.error++;
  }
  
  const path = req.path || '/';
  metrics.requests.byPath[path] = (metrics.requests.byPath[path] || 0) + 1;
  
  // Record response time
  metrics.performance.responseTimes.push(duration);
  if (metrics.performance.responseTimes.length > 1000) {
    metrics.performance.responseTimes.shift();
  }
  
  // Calculate percentiles
  const sorted = [...metrics.performance.responseTimes].sort((a, b) => a - b);
  metrics.performance.p50 = sorted[Math.floor(sorted.length * 0.5)] || 0;
  metrics.performance.p95 = sorted[Math.floor(sorted.length * 0.95)] || 0;
  metrics.performance.p99 = sorted[Math.floor(sorted.length * 0.99)] || 0;
}

/**
 * Record assessment metrics
 * @param {object} assessment - Assessment data
 */
function recordAssessment(assessment) {
  metrics.assessments.total++;
  
  const fluidId = assessment.fluidId || 'unknown';
  const regime = assessment.regime || 'unknown';
  
  metrics.assessments.byFluid[fluidId] = (metrics.assessments.byFluid[fluidId] || 0) + 1;
  metrics.assessments.byRegime[regime] = (metrics.assessments.byRegime[regime] || 0) + 1;
}

/**
 * Record user activity
 * @param {string} userId - User ID
 */
function recordUserActivity(userId) {
  metrics.users.active.add(userId);
}

/**
 * Get current metrics
 * @returns {object} Current metrics
 */
function getMetrics() {
  return {
    ...metrics,
    users: {
      ...metrics.users,
      active: metrics.users.active.size
    },
    errorRate: metrics.requests.total > 0 
      ? (metrics.requests.error / metrics.requests.total).toFixed(4)
      : 0
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// HEALTH CHECK ENDPOINT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Health check handler for monitoring
 * Reports to VERCEL-4 and ENF-1
 */
function healthCheckHandler(req, res) {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    metrics: {
      requests: metrics.requests.total,
      errorRate: getMetrics().errorRate,
      p99ResponseTime: metrics.performance.p99,
      activeUsers: metrics.users.active.size
    },
    checks: {
      database: 'ok',  // Would check Supabase
      auth: 'ok',      // Would check Auth0
      billing: 'ok'    // Would check Stripe
    }
  };
  
  // Check thresholds
  const errorRate = parseFloat(health.metrics.errorRate);
  if (errorRate > ANALYTICS_CONFIG.alertThresholds.errorRate) {
    health.status = 'degraded';
    health.alerts = health.alerts || [];
    health.alerts.push(`Error rate ${(errorRate * 100).toFixed(1)}% exceeds threshold`);
  }
  
  if (health.metrics.p99ResponseTime > ANALYTICS_CONFIG.alertThresholds.p99ResponseTime) {
    health.status = 'degraded';
    health.alerts = health.alerts || [];
    health.alerts.push(`P99 response time ${health.metrics.p99ResponseTime}ms exceeds threshold`);
  }
  
  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPRESS MIDDLEWARE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Analytics middleware for Express
 */
function analyticsMiddleware(req, res, next) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    recordRequest(req, res, duration);
    
    // Track server event
    trackServerEvent('request', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: duration
    }, req);
  });
  
  next();
}

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD DATA
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get analytics dashboard data
 * @returns {object} Dashboard data
 */
function getDashboardData() {
  return {
    timestamp: new Date().toISOString(),
    metrics: getMetrics(),
    coreWebVitals: {
      targets: ANALYTICS_CONFIG.targets,
      // In production, these would come from Vercel Analytics API
      current: {
        LCP: null,
        FID: null,
        CLS: null,
        TTFB: null
      }
    },
    recentEvents: analyticsBuffer.slice(-50),
    topPaths: Object.entries(metrics.requests.byPath)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10),
    topFluids: Object.entries(metrics.assessments.byFluid)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10),
    regimeDistribution: metrics.assessments.byRegime
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
  ANALYTICS_CONFIG,
  ANALYTICS_SCRIPT,
  trackServerEvent,
  recordRequest,
  recordAssessment,
  recordUserActivity,
  getMetrics,
  healthCheckHandler,
  analyticsMiddleware,
  getDashboardData
};
