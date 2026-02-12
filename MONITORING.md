# ScholarSync Monitoring & Observability

This document outlines monitoring strategies, error tracking, and observability practices for ScholarSync in production.

## Overview

Effective monitoring helps you:
- Detect issues before users report them
- Understand system performance
- Track user behavior and engagement
- Optimize resource usage
- Plan for scaling

## Monitoring Stack

### 1. Application Performance Monitoring (APM)

#### Vercel Analytics (Frontend)
- **Built-in**: Automatically enabled for Vercel deployments
- **Metrics**:
  - Real User Monitoring (RUM)
  - Core Web Vitals (LCP, FID, CLS)
  - Page load times
  - Time to First Byte (TTFB)
- **Access**: Vercel Dashboard → Project → Analytics

#### Railway Metrics (Backend)
- **Built-in**: Available in Railway dashboard
- **Metrics**:
  - CPU usage
  - Memory usage
  - Network traffic
  - Request count
  - Response times
- **Access**: Railway Dashboard → Project → Metrics

### 2. Error Tracking

#### Sentry Setup (Recommended)

**Installation:**

Backend:
```bash
cd scholarsync-backend
npm install @sentry/node @sentry/profiling-node
```

Frontend:
```bash
cd scholarsync-frontend
npm install @sentry/nextjs
```

**Backend Configuration** (`src/utils/sentry.ts`):
```typescript
import * as Sentry from '@sentry/node';

export function initSentry() {
  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 1.0,
      profilesSampleRate: 1.0,
    });
  }
}

export { Sentry };
```

**Frontend Configuration** (`sentry.client.config.ts`):
```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: false,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
});
```

**Environment Variables:**
```env
# Backend
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# Frontend
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

### 3. Uptime Monitoring

#### UptimeRobot (Free Tier)

1. **Sign up**: https://uptimerobot.com
2. **Add Monitors**:
   - Backend API: `https://your-backend.railway.app/health` (HTTP, 5-min interval)
   - Frontend: `https://your-app.vercel.app` (HTTP, 5-min interval)
3. **Configure Alerts**:
   - Email notifications
   - SMS (optional, paid)
   - Webhook to Slack/Discord

#### Alternative: Pingdom, StatusCake, Better Uptime

### 4. Log Management

#### Backend Logging

**Setup Winston Logger** (`src/utils/logger.ts`):
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'scholarsync-backend' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

export default logger;
```

**Usage:**
```typescript
import logger from './utils/logger';

logger.info('User registered', { userId: user.id, email: user.email });
logger.error('Failed to generate essay', { error: error.message, userId });
```

#### Railway Logs
- Access logs in Railway Dashboard → Deployments → Logs
- Filter by time range, search keywords
- Export logs for analysis

#### Vercel Logs
- Access logs in Vercel Dashboard → Logs
- Real-time log streaming
- Filter by deployment, function

### 5. Database Monitoring

#### Supabase Dashboard
- **Metrics**: Database Dashboard → Metrics
  - Connection count
  - Query performance
  - Cache hit rate
  - Table sizes
- **Slow Queries**: Database Dashboard → Query Performance
- **Backups**: Settings → Backups (automated on paid plans)

#### Custom Metrics via Prisma
```typescript
// Track query performance
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'stdout' },
  ],
});

prisma.$on('query', (e) => {
  if (e.duration > 1000) { // Log slow queries (>1s)
    logger.warn('Slow query detected', {
      query: e.query,
      duration: e.duration,
    });
  }
});
```

## Key Metrics to Track

### Application Metrics

#### User Engagement
- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- User retention (7-day, 30-day)
- Average session duration
- Pages per session
- Bounce rate

#### Feature Usage
- Scholarships viewed per user
- Applications created per user
- Essays generated per user
- Profile completion rate
- Onboarding completion rate
- Chrome extension installs

#### Performance
- Page load time (target: <3s)
- API response time (target: <500ms)
- Time to Interactive (target: <5s)
- Core Web Vitals (LCP, FID, CLS)

#### Errors
- Error rate (target: <1%)
- API error rate (target: <0.5%)
- Failed authentication attempts
- AI generation failures

### Business Metrics

- Total scholarships in database
- Total applications tracked
- Total essays generated
- User-to-scholarship match quality
- Application success rate (if tracked)

### Infrastructure Metrics

- CPU usage (target: <70%)
- Memory usage (target: <80%)
- Database connection count
- API request rate
- Bandwidth usage

## Alerting Strategy

### Critical Alerts (Immediate Action)
- Site down (>5 min)
- Database unavailable
- API error rate >5%
- Memory usage >90%
- Authentication system failure

**Alert Channels**: SMS, Phone call, PagerDuty

### High Priority Alerts (Action within 1 hour)
- API error rate >2%
- Slow response times (>2s average)
- High memory usage (>80%)
- Database connection pool exhausted
- AI service failures >10%

**Alert Channels**: Email, Slack

### Medium Priority Alerts (Action within 24 hours)
- API error rate >1%
- Disk space >70%
- Unusual traffic patterns
- Failed backup jobs
- Security scan findings

**Alert Channels**: Email, Dashboard

## Dashboards

### Grafana Setup (Optional, Advanced)

Create custom dashboards combining metrics from multiple sources.

**Metrics to Display:**
1. **Overview Dashboard**
   - System health (green/red status)
   - Active users (last 24h)
   - Request rate (requests/min)
   - Error rate (%)
   - Average response time (ms)

2. **Performance Dashboard**
   - CPU usage over time
   - Memory usage over time
   - API response time percentiles (p50, p95, p99)
   - Database query performance
   - Cache hit rates

3. **User Dashboard**
   - User signups over time
   - Active users (DAU/MAU)
   - Feature usage breakdown
   - User funnel (signup → onboarding → first application)

4. **Business Dashboard**
   - Applications created per day
   - Essays generated per day
   - Scholarships added per week
   - User retention cohorts

## Google Analytics Setup

### Installation

Add to `scholarsync-frontend/app/layout.tsx`:

```typescript
import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
              `}
            </Script>
          </>
        )}
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### Event Tracking

```typescript
// lib/analytics.ts
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Usage:
trackEvent('scholarship_viewed', 'Engagement', 'STEM Award', 92);
trackEvent('application_created', 'Conversion');
trackEvent('essay_generated', 'AI_Feature');
```

### Conversion Goals

Set up in Google Analytics:
1. User registration
2. Onboarding completion
3. First application created
4. First essay generated
5. Chrome extension installed

## Health Checks

### Backend Health Endpoint

Already implemented at `/health`:

```typescript
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});
```

### Enhanced Health Check

```typescript
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: 'unknown',
  };

  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    health.database = 'connected';
  } catch (error) {
    health.status = 'degraded';
    health.database = 'disconnected';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});
```

### Monitoring Health Checks

```bash
# Simple monitoring script
#!/bin/bash

BACKEND_URL="https://your-backend.railway.app/health"
FRONTEND_URL="https://your-app.vercel.app"

check_backend() {
  response=$(curl -s -o /dev/null -w "%{http_code}" $BACKEND_URL)
  if [ $response -eq 200 ]; then
    echo "✅ Backend is healthy"
  else
    echo "❌ Backend is down (HTTP $response)"
    # Send alert
  fi
}

check_frontend() {
  response=$(curl -s -o /dev/null -w "%{http_code}" $FRONTEND_URL)
  if [ $response -eq 200 ]; then
    echo "✅ Frontend is healthy"
  else
    echo "❌ Frontend is down (HTTP $response)"
    # Send alert
  fi
}

check_backend
check_frontend
```

## Performance Monitoring

### Lighthouse CI (Automated)

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI

on: [push]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            https://your-app.vercel.app
            https://your-app.vercel.app/scholarships
            https://your-app.vercel.app/applications
          uploadArtifacts: true
```

### Web Vitals Tracking

Already built into Next.js:

```typescript
// app/_app.tsx
export function reportWebVitals(metric) {
  // Send to analytics
  if (window.gtag) {
    window.gtag('event', metric.name, {
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_label: metric.id,
      non_interaction: true,
    });
  }
}
```

## Cost Monitoring

### Track Spending

- **Vercel**: Dashboard → Usage
- **Railway**: Dashboard → Usage
- **Supabase**: Dashboard → Billing
- **Google Gemini**: Console → Quotas

### Set Budget Alerts

Configure alerts when approaching limits:
- Database storage >400MB (of 500MB free)
- Railway usage >80% of free tier
- Gemini API calls >50/min
- Vercel bandwidth >80GB

## Security Monitoring

### Failed Authentication Tracking

```typescript
// Track failed logins
logger.warn('Failed login attempt', {
  email: sanitizeEmail(email),
  ip: req.ip,
  timestamp: new Date(),
});

// Alert on brute force (>5 failures in 1 minute)
```

### API Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
});

app.use('/graphql', limiter);
```

### Security Scanning

- **npm audit**: Run weekly (`npm audit`)
- **Snyk**: Continuous security scanning
- **Dependabot**: Auto-update dependencies (GitHub)

## Incident Response

### When Alert Triggers

1. **Acknowledge**: Confirm you've received the alert
2. **Assess**: Check dashboards, logs, error tracking
3. **Communicate**: Update status page, notify team
4. **Mitigate**: Apply immediate fix or rollback
5. **Resolve**: Fix root cause
6. **Document**: Write incident report
7. **Review**: Post-mortem to prevent recurrence

### Status Page

Use https://statuspage.io or self-host with:
- **Uptime**: Current system status
- **Metrics**: Response time, uptime %
- **Incidents**: Active and historical
- **Subscribe**: Email/SMS updates

## Regular Reviews

### Daily
- Check error rates in Sentry
- Review uptime metrics
- Scan logs for anomalies

### Weekly
- Analyze user engagement metrics
- Review slow query reports
- Check security scan results
- Update team on key metrics

### Monthly
- Performance trends analysis
- Cost review and optimization
- Capacity planning
- Security audit

### Quarterly
- Full system health review
- Disaster recovery test
- Update monitoring strategy
- Scale planning

## Tools Comparison

| Tool | Purpose | Cost | Difficulty |
|------|---------|------|-----------|
| Vercel Analytics | Frontend monitoring | Free | Easy |
| Railway Metrics | Backend monitoring | Free | Easy |
| Sentry | Error tracking | Free tier | Medium |
| UptimeRobot | Uptime monitoring | Free tier | Easy |
| Google Analytics | User analytics | Free | Easy |
| Grafana | Custom dashboards | Free (self-host) | Hard |
| Datadog | Full APM | Paid | Medium |
| New Relic | Full APM | Free tier | Medium |

## Recommended Starter Setup

For a new deployment, start with:

1. ✅ **Vercel Analytics** - Built-in, no setup
2. ✅ **Railway Metrics** - Built-in, no setup
3. ✅ **UptimeRobot** - 5 min setup, free
4. ✅ **Google Analytics** - 15 min setup, free
5. ⏳ **Sentry** - 30 min setup, free tier
6. ⏳ **Supabase Monitoring** - Built-in

Total setup time: ~1 hour
Total cost: $0/month

## Conclusion

Effective monitoring is essential for production applications. Start with the basics (uptime, errors, analytics) and expand as you grow. Focus on metrics that drive business decisions and user experience improvements.

Remember: **If you're not monitoring it, you can't improve it.**
