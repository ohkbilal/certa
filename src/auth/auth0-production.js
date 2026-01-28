/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CERTA AUTH0 PRODUCTION CONFIGURATION
 * Week 2 Task: W2-002
 * Owner: VERCEL-2 (Environment & Secrets Agent)
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════
// ENVIRONMENT DETECTION
// ═══════════════════════════════════════════════════════════════════════════════

const isProduction = process.env.NODE_ENV === 'production';
const isVercel = process.env.VERCEL === '1';

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH0 CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const AUTH0_CONFIG = {
  // Domain - Your Auth0 tenant domain
  domain: process.env.NEXT_PUBLIC_AUTH0_DOMAIN || 'certa.us.auth0.com',
  
  // Client ID - Public identifier for your application
  clientId: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID || '',
  
  // Client Secret - NEVER expose this on client side
  clientSecret: process.env.AUTH0_CLIENT_SECRET || '',
  
  // Audience - API identifier for your Auth0 API
  audience: process.env.AUTH0_AUDIENCE || 'https://api.certa.app',
  
  // Base URL - Your application's base URL
  baseURL: process.env.NEXT_PUBLIC_APP_URL || (
    isProduction 
      ? 'https://certa.app' 
      : 'http://localhost:3000'
  ),
  
  // Issuer Base URL - Auth0 tenant URL
  issuerBaseURL: `https://${process.env.NEXT_PUBLIC_AUTH0_DOMAIN || 'certa.us.auth0.com'}`,
  
  // Secret - Used to encrypt session cookie
  secret: process.env.AUTH0_SECRET || process.env.AUTH0_CLIENT_SECRET || '',
  
  // Session settings
  session: {
    // Cookie settings
    cookie: {
      secure: isProduction,
      sameSite: 'lax',
      httpOnly: true,
      domain: isProduction ? '.certa.app' : undefined
    },
    // Rolling session
    rolling: true,
    // Absolute session duration (24 hours)
    absoluteDuration: 60 * 60 * 24,
    // Inactivity timeout (2 hours)
    rollingDuration: 60 * 60 * 2
  },
  
  // Routes
  routes: {
    callback: '/api/auth/callback',
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    postLogoutRedirect: '/'
  },
  
  // Authorization parameters
  authorizationParams: {
    response_type: 'code',
    scope: 'openid profile email',
    audience: process.env.AUTH0_AUDIENCE || 'https://api.certa.app'
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH0 PRODUCTION SETUP CHECKLIST
// ═══════════════════════════════════════════════════════════════════════════════

const AUTH0_SETUP_CHECKLIST = {
  tenant: {
    name: 'certa',
    region: 'US',
    environment: 'Production'
  },
  
  application: {
    name: 'CERTA SaaS',
    type: 'Regular Web Application',
    
    settings: {
      // Application URIs
      allowedCallbackUrls: [
        'https://certa.app/api/auth/callback',
        'https://www.certa.app/api/auth/callback',
        // Preview deployments
        'https://*.vercel.app/api/auth/callback'
      ],
      
      allowedLogoutUrls: [
        'https://certa.app',
        'https://www.certa.app',
        'https://*.vercel.app'
      ],
      
      allowedWebOrigins: [
        'https://certa.app',
        'https://www.certa.app',
        'https://*.vercel.app'
      ],
      
      // Token settings
      tokenEndpointAuthMethod: 'client_secret_post',
      
      // Grant types
      grantTypes: [
        'authorization_code',
        'refresh_token'
      ],
      
      // OIDC Conformant
      oidcConformant: true
    }
  },
  
  api: {
    name: 'CERTA API',
    identifier: 'https://api.certa.app',
    signingAlgorithm: 'RS256',
    
    permissions: [
      { value: 'read:assessments', description: 'Read assessment history' },
      { value: 'write:assessments', description: 'Create/update assessments' },
      { value: 'read:profile', description: 'Read user profile' },
      { value: 'write:profile', description: 'Update user profile' },
      { value: 'manage:team', description: 'Manage team members' }
    ]
  },
  
  rules: [
    {
      name: 'Add User Metadata to Token',
      script: `
function addUserMetadata(user, context, callback) {
  const namespace = 'https://certa.app/';
  
  // Add subscription tier
  context.accessToken[namespace + 'tier'] = user.app_metadata?.tier || 'free';
  
  // Add assessment count
  context.accessToken[namespace + 'assessments'] = user.app_metadata?.assessmentCount || 0;
  
  // Add team info if exists
  if (user.app_metadata?.teamId) {
    context.accessToken[namespace + 'teamId'] = user.app_metadata.teamId;
    context.accessToken[namespace + 'teamRole'] = user.app_metadata.teamRole || 'member';
  }
  
  callback(null, user, context);
}
      `
    }
  ],
  
  branding: {
    logo: 'https://certa.app/logo.png',
    colors: {
      primary: '#3B82F6',
      pageBackground: '#0F172A'
    }
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Validate Auth0 configuration
 * @returns {object} Validation result
 */
function validateAuth0Config() {
  const issues = [];
  
  if (!AUTH0_CONFIG.domain) {
    issues.push('Missing AUTH0_DOMAIN');
  }
  
  if (!AUTH0_CONFIG.clientId) {
    issues.push('Missing AUTH0_CLIENT_ID');
  }
  
  if (!AUTH0_CONFIG.clientSecret) {
    issues.push('Missing AUTH0_CLIENT_SECRET');
  }
  
  if (!AUTH0_CONFIG.secret) {
    issues.push('Missing AUTH0_SECRET');
  }
  
  if (isProduction && !AUTH0_CONFIG.baseURL.startsWith('https://')) {
    issues.push('Production URL must use HTTPS');
  }
  
  return {
    valid: issues.length === 0,
    issues,
    config: AUTH0_CONFIG
  };
}

/**
 * Get Auth0 Management API token (for user management)
 * @returns {Promise<string>} Access token
 */
async function getManagementToken() {
  const response = await fetch(`https://${AUTH0_CONFIG.domain}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: process.env.AUTH0_MANAGEMENT_CLIENT_ID,
      client_secret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET,
      audience: `https://${AUTH0_CONFIG.domain}/api/v2/`
    })
  });
  
  const data = await response.json();
  return data.access_token;
}

/**
 * Update user app metadata (subscription tier, etc.)
 * @param {string} userId - Auth0 user ID
 * @param {object} metadata - Metadata to update
 */
async function updateUserMetadata(userId, metadata) {
  const token = await getManagementToken();
  
  const response = await fetch(
    `https://${AUTH0_CONFIG.domain}/api/v2/users/${encodeURIComponent(userId)}`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ app_metadata: metadata })
    }
  );
  
  return response.json();
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
  AUTH0_CONFIG,
  AUTH0_SETUP_CHECKLIST,
  validateAuth0Config,
  getManagementToken,
  updateUserMetadata,
  isProduction,
  isVercel
};
