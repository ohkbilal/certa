# ═══════════════════════════════════════════════════════════════════════════════
# CERTA DOMAIN & DNS CONFIGURATION
# Week 2 Task: W2-004
# Owner: VERCEL-3 (Domain & Edge Agent)
# ═══════════════════════════════════════════════════════════════════════════════

## PRIMARY DOMAIN

| Property | Value |
|----------|-------|
| Domain | certa.app |
| Registrar | (To be configured) |
| DNS Provider | Vercel (recommended) |
| SSL | Automatic via Vercel |

---

## DNS RECORDS (Required)

### Option A: Using Vercel DNS (Recommended)

Add these records at your domain registrar to point to Vercel:

```
# Root domain
Type: A
Name: @
Value: 76.76.21.21

# WWW subdomain
Type: CNAME
Name: www
Value: cname.vercel-dns.com.

# Verification (Vercel will provide this)
Type: TXT
Name: _vercel
Value: vc-domain-verify=<verification-code>
```

### Option B: Using External DNS

If keeping DNS at your registrar (e.g., Cloudflare, Route53):

```
# Root domain - CNAME flattening required
Type: CNAME (or ALIAS/ANAME)
Name: @
Value: cname.vercel-dns.com.

# WWW subdomain
Type: CNAME
Name: www
Value: cname.vercel-dns.com.
```

---

## VERCEL DOMAIN CONFIGURATION

### vercel.json domains section
```json
{
  "alias": ["certa.app", "www.certa.app"]
}
```

### CLI Commands
```bash
# Add domain to project
vercel domains add certa.app

# Add www subdomain
vercel domains add www.certa.app

# Verify DNS
vercel domains inspect certa.app

# Set as production
vercel alias set certa.app
```

---

## SSL/TLS CONFIGURATION

| Setting | Value |
|---------|-------|
| SSL Mode | Full (Strict) |
| TLS Version | TLS 1.2 minimum |
| HSTS | Enabled |
| HSTS Max-Age | 31536000 (1 year) |
| Include Subdomains | Yes |
| Preload | Yes (after verification) |

### Security Headers (in vercel.json)
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains; preload"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

---

## EDGE CONFIGURATION

### Global Regions (Vercel Edge Network)
| Region | Location | Code |
|--------|----------|------|
| US East | Washington, D.C. | iad1 |
| US West | San Francisco | sfo1 |
| Europe | London | lhr1 |
| Asia Pacific | Singapore | sin1 |

### Performance Targets (VERCEL-3)
| Metric | Target | Measurement |
|--------|--------|-------------|
| TTFB | < 100ms | Global average |
| FCP | < 1.5s | First Contentful Paint |
| LCP | < 2.5s | Largest Contentful Paint |
| CLS | < 0.1 | Cumulative Layout Shift |
| FID | < 100ms | First Input Delay |

### Caching Strategy
```javascript
const CACHE_RULES = {
  // Static assets - aggressive caching
  static: {
    pattern: '/_next/static/(.*)',
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  },
  
  // API responses - no cache
  api: {
    pattern: '/api/(.*)',
    headers: {
      'Cache-Control': 'no-store, max-age=0'
    }
  },
  
  // HTML pages - short cache with revalidation
  pages: {
    pattern: '/(.*)',
    headers: {
      'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=600'
    }
  },
  
  // Assessment engine - no cache (dynamic)
  engine: {
    pattern: '/assess(.*)',
    headers: {
      'Cache-Control': 'no-store, max-age=0'
    }
  }
};
```

---

## REDIRECTS

| Source | Destination | Type |
|--------|-------------|------|
| http://certa.app | https://certa.app | 301 |
| http://www.certa.app | https://certa.app | 301 |
| https://www.certa.app | https://certa.app | 301 |

### vercel.json redirects
```json
{
  "redirects": [
    {
      "source": "/",
      "has": [{ "type": "host", "value": "www.certa.app" }],
      "destination": "https://certa.app",
      "permanent": true
    }
  ]
}
```

---

## PREVIEW DEPLOYMENTS

| Environment | Domain Pattern |
|-------------|----------------|
| Preview | certa-saas-<hash>-<team>.vercel.app |
| Branch | certa-saas-git-<branch>-<team>.vercel.app |

### Preview Environment Variables
- Same as production but with test API keys
- Auth0 callbacks include preview URLs
- Stripe in test mode

---

## MONITORING ENDPOINTS

| Endpoint | Purpose | Expected Response |
|----------|---------|-------------------|
| /api/health | Health check | 200 OK + JSON |
| / | Homepage | 200 OK + HTML |
| /dashboard | App (auth required) | 302 → /login |

### Health Check Response
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "policyVersion": "V16.1",
  "timestamp": "2026-01-28T00:00:00.000Z",
  "services": {
    "auth0": "connected",
    "stripe": "connected",
    "supabase": "connected"
  }
}
```

---

## DOMAIN VERIFICATION CHECKLIST

- [ ] Domain registered (certa.app)
- [ ] DNS records configured
- [ ] SSL certificate issued (automatic)
- [ ] WWW redirect configured
- [ ] HTTPS redirect configured
- [ ] HSTS enabled
- [ ] Security headers configured
- [ ] Edge regions active
- [ ] Health check passing
- [ ] Performance targets met

---

## TROUBLESHOOTING

### DNS Propagation
```bash
# Check A record
dig certa.app A

# Check CNAME
dig www.certa.app CNAME

# Check from multiple locations
dig @8.8.8.8 certa.app A
dig @1.1.1.1 certa.app A
```

### SSL Issues
```bash
# Check certificate
openssl s_client -connect certa.app:443 -servername certa.app

# Check certificate chain
curl -vI https://certa.app 2>&1 | grep -A 10 "Server certificate"
```

### Vercel CLI
```bash
# Debug deployment
vercel logs certa.app

# Check domain status
vercel domains inspect certa.app

# Force redeploy
vercel --prod --force
```

---

**Document Version:** 1.0
**Task ID:** W2-004
**Owner:** VERCEL-3
**Date:** January 28, 2026
