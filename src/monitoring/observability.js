/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CERTA MONITORING & OBSERVABILITY
 * Week 2 Tasks: W2-007 (Vercel Analytics), W2-008 (Sentry Error Tracking)
 * Owner: VERCEL-4 (Monitoring & Observability Agent)
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════
// VERCEL ANALYTICS CONFIGURATION (W2-007)
// ═══════════════════════════════════════════════════════════════════════════════

const VERCEL_ANALYTICS_CONFIG = {
  enabled: true,
  
  // Web Vitals tracking
  webVitals: {
    enabled: true,
    // Core Web Vitals thresholds (per Google)
    thresholds: {
      LCP: { good: 2500, poor: 4000 },   // Largest Contentful Paint (ms)
      FID: { good: 100, poor: 300 },     // First Input Delay (ms)
      CLS: { good: 0.1, poor: 0.25 },    // Cumulative Layout Shift
      TTFB: { good: 100, poor: 300 },    // Time to First Byte (ms)
      FCP: { good: 1500, poor: 3000 },   // First Contentful Paint (ms)
      INP: { good: 200, poor: 500 }      // Interaction to Next Paint (ms)
    }
  },
  
  // Audience analytics
  audience: {
    enabled: true,
    trackVisitors: true,
    trackPageViews: true,
    trackCountry: true,
    trackDevice: true,
    trackBrowser: true,
    trackReferrer: true
  },
  
  // Speed insights
  speedInsights: {
    enabled: true,
    sampleRate: 1.0 // 100% of traffic
  }
};

// Next.js Analytics component setup
const ANALYTICS_COMPONENT = `
// app/layout.tsx or pages/_app.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
`;

// ═══════════════════════════════════════════════════════════════════════════════
// SENTRY ERROR TRACKING CONFIGURATION (W2-008)
// ═══════════════════════════════════════════════════════════════════════════════

const SENTRY_CONFIG = {
  dsn: process.env.SENTRY_DSN || '',
  environment: process.env.NODE_ENV || 'development',
  release: process.env.VERCEL_GIT_COMMIT_SHA || 'local',
  
  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Session replay (Pro feature)
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Error filtering
  ignoreErrors: [
    // Browser extensions
    /^chrome-extension:\/\//,
    /^moz-extension:\/\//,
    // Third-party scripts
    /^Script error\.$/,
    // Network errors (handled separately)
    /^NetworkError/,
    /^Failed to fetch/
  ],
  
  // User privacy
  sendDefaultPii: false,
  
  // Before send hook
  beforeSend: (event, hint) => {
    // Filter out sensitive data
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
    }
    
    // Filter out personal data from breadcrumbs
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.filter(b => 
        !b.message?.includes('email') && 
        !b.message?.includes('password')
      );
    }
    
    return event;
  }
};

// Sentry initialization for Next.js
const SENTRY_INIT_CLIENT = `
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true
    })
  ]
});
`;

const SENTRY_INIT_SERVER = `
// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1
});
`;

const SENTRY_INIT_EDGE = `
// sentry.edge.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1
});
`;

// ═══════════════════════════════════════════════════════════════════════════════
// ALERT THRESHOLDS (Per V16.1 §25)
// ═══════════════════════════════════════════════════════════════════════════════

const ALERT_THRESHOLDS = {
  // Error rates
  errorRate: {
    warning: 1,    // 1% error rate
    critical: 5    // 5% triggers emergency rollback
  },
  
  // Response time (p95)
  responseTime: {
    warning: 1000,   // 1 second
    critical: 3000   // 3 seconds
  },
  
  // Availability
  availability: {
    warning: 99.5,   // 99.5%
    critical: 99.0   // 99% triggers rollback
  },
  
  // Core Web Vitals
  webVitals: {
    LCP: { warning: 2500, critical: 4000 },
    FID: { warning: 100, critical: 300 },
    CLS: { warning: 0.1, critical: 0.25 },
    TTFB: { warning: 100, critical: 300 }
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// MONITORING SERVICE
// ═══════════════════════════════════════════════════════════════════════════════

class MonitoringService {
  constructor() {
    this.metrics = {
      requests: 0,
      errors: 0,
      assessments: 0,
      startTime: Date.now()
    };
  }
  
  /**
   * Track API request
   */
  trackRequest(endpoint, duration, statusCode) {
    this.metrics.requests++;
    
    if (statusCode >= 400) {
      this.metrics.errors++;
    }
    
    // Check thresholds
    const errorRate = (this.metrics.errors / this.metrics.requests) * 100;
    if (errorRate > ALERT_THRESHOLDS.errorRate.critical) {
      this.triggerAlert('CRITICAL', 'Error rate exceeded threshold', {
        errorRate,
        threshold: ALERT_THRESHOLDS.errorRate.critical
      });
    }
    
    if (duration > ALERT_THRESHOLDS.responseTime.critical) {
      this.triggerAlert('WARNING', 'Slow response time', {
        endpoint,
        duration,
        threshold: ALERT_THRESHOLDS.responseTime.critical
      });
    }
  }
  
  /**
   * Track assessment execution
   */
  trackAssessment(runId, fluidId, duration) {
    this.metrics.assessments++;
    
    // Log for analytics
    console.log(JSON.stringify({
      event: 'assessment',
      runId,
      fluidId,
      duration,
      timestamp: new Date().toISOString()
    }));
  }
  
  /**
   * Track Web Vital
   */
  trackWebVital(metric, value) {
    const threshold = ALERT_THRESHOLDS.webVitals[metric];
    if (threshold && value > threshold.critical) {
      this.triggerAlert('WARNING', `Poor ${metric}`, {
        metric,
        value,
        threshold: threshold.critical
      });
    }
  }
  
  /**
   * Trigger alert to ENF-1 (per V16.1 §25.6)
   */
  triggerAlert(severity, message, data) {
    const alert = {
      severity,
      message,
      data,
      timestamp: new Date().toISOString(),
      source: 'VERCEL-4'
    };
    
    console.error(`[ALERT:${severity}] ${message}`, data);
    
    // In production, send to ENF-1
    // This would integrate with the enforcement chamber
    if (process.env.NODE_ENV === 'production') {
      // Could send to Slack, PagerDuty, etc.
    }
    
    return alert;
  }
  
  /**
   * Get current metrics
   */
  getMetrics() {
    const uptime = Date.now() - this.metrics.startTime;
    const errorRate = this.metrics.requests > 0 
      ? (this.metrics.errors / this.metrics.requests) * 100 
      : 0;
    
    return {
      uptime,
      uptimeFormatted: this.formatUptime(uptime),
      requests: this.metrics.requests,
      errors: this.metrics.errors,
      errorRate: errorRate.toFixed(2) + '%',
      assessments: this.metrics.assessments,
      status: errorRate < ALERT_THRESHOLDS.errorRate.warning ? 'healthy' : 
              errorRate < ALERT_THRESHOLDS.errorRate.critical ? 'degraded' : 'critical'
    };
  }
  
  formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// HEALTH CHECK ENDPOINT
// ═══════════════════════════════════════════════════════════════════════════════

const healthCheck = async () => {
  const checks = {
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    policyVersion: 'V16.1',
    services: {}
  };
  
  // Check Auth0
  try {
    // In real implementation, ping Auth0
    checks.services.auth0 = 'connected';
  } catch (e) {
    checks.services.auth0 = 'error';
  }
  
  // Check Stripe
  try {
    // In real implementation, ping Stripe
    checks.services.stripe = 'connected';
  } catch (e) {
    checks.services.stripe = 'error';
  }
  
  // Check Supabase
  try {
    // In real implementation, ping Supabase
    checks.services.supabase = 'connected';
  } catch (e) {
    checks.services.supabase = 'error';
  }
  
  const allHealthy = Object.values(checks.services).every(s => s === 'connected');
  checks.status = allHealthy ? 'healthy' : 'degraded';
  
  return checks;
};

// ═══════════════════════════════════════════════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════

function validateMonitoringConfig() {
  const issues = [];
  
  if (!SENTRY_CONFIG.dsn) {
    issues.push('Missing SENTRY_DSN - error tracking disabled');
  }
  
  return {
    valid: issues.length === 0,
    issues,
    vercelAnalytics: VERCEL_ANALYTICS_CONFIG.enabled,
    sentry: !!SENTRY_CONFIG.dsn
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
  VERCEL_ANALYTICS_CONFIG,
  SENTRY_CONFIG,
  ALERT_THRESHOLDS,
  MonitoringService: new MonitoringService(),
  healthCheck,
  validateMonitoringConfig,
  
  // Code snippets for setup
  ANALYTICS_COMPONENT,
  SENTRY_INIT_CLIENT,
  SENTRY_INIT_SERVER,
  SENTRY_INIT_EDGE
};
