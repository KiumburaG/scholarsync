# ScholarSync Deployment Guide

## Overview

This guide covers deploying ScholarSync to production, including both the backend (GraphQL API) and frontend (Next.js app).

## Architecture

- **Frontend**: Next.js app deployed on Vercel
- **Backend**: Node.js GraphQL API deployed on Railway/Render/Heroku
- **Database**: PostgreSQL on Supabase
- **File Storage**: Supabase Storage (for documents, profile images)
- **AI Service**: Google Gemini API

## Prerequisites

Before deploying, ensure you have:
- [ ] GitHub repository with latest code
- [ ] Supabase project created
- [ ] Google Gemini API key
- [ ] All environment variables ready
- [ ] Tests passing (`npm test` in both directories)

## Backend Deployment

### Option 1: Railway (Recommended)

Railway provides free tier with PostgreSQL and automatic deployments.

#### Steps:

1. **Sign up for Railway**
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub account

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your ScholarSync repository

3. **Configure Build Settings**
   - Root directory: `scholarsync-backend`
   - Build command: `npm install && npx prisma generate`
   - Start command: `npm start`
   - Add `package.json` start script if not present:
   ```json
   "scripts": {
     "start": "node dist/server.js"
   }
   ```

4. **Add Environment Variables**
   ```
   DATABASE_URL=your_supabase_postgres_url
   JWT_SECRET=your_secure_random_string
   GEMINI_API_KEY=your_gemini_api_key
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend.vercel.app
   PORT=4000
   ```

5. **Generate Railway PostgreSQL** (Alternative to Supabase)
   - Add PostgreSQL service in Railway
   - Railway will provide DATABASE_URL automatically

6. **Run Migrations**
   - In Railway dashboard, open shell and run:
   ```bash
   npx prisma migrate deploy
   npx prisma db seed  # Optional: seed with sample data
   ```

7. **Deploy**
   - Railway auto-deploys on every push to main branch
   - Get your backend URL from Railway dashboard

### Option 2: Render

1. **Sign up for Render**
   - Go to [render.com](https://render.com)
   - Connect GitHub

2. **Create Web Service**
   - New → Web Service
   - Connect repository
   - Name: scholarsync-backend
   - Root directory: `scholarsync-backend`
   - Environment: Node
   - Build command: `npm install && npx prisma generate && npm run build`
   - Start command: `npm start`

3. **Add PostgreSQL Database**
   - Create new PostgreSQL database in Render
   - Connect to web service
   - DATABASE_URL will be auto-injected

4. **Environment Variables**
   - Add all required env vars in Render dashboard

5. **Deploy**
   - Render auto-deploys from GitHub

### Option 3: Heroku

1. **Install Heroku CLI**
   ```bash
   brew tap heroku/brew && brew install heroku  # macOS
   ```

2. **Login and Create App**
   ```bash
   heroku login
   cd scholarsync-backend
   heroku create scholarsync-backend
   ```

3. **Add PostgreSQL**
   ```bash
   heroku addons:create heroku-postgresql:essential-0
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set JWT_SECRET=your_secret
   heroku config:set GEMINI_API_KEY=your_key
   heroku config:set NODE_ENV=production
   ```

5. **Deploy**
   ```bash
   git push heroku main
   heroku run npx prisma migrate deploy
   ```

## Frontend Deployment (Vercel)

Vercel is the recommended platform for Next.js deployments.

### Steps:

1. **Sign up for Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub

2. **Import Project**
   - Click "Add New" → "Project"
   - Import your ScholarSync repository
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `scholarsync-frontend`

3. **Configure Build Settings**
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

4. **Environment Variables**
   Add these in Vercel dashboard:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app/graphql
   NEXT_PUBLIC_APP_URL=https://your-frontend.vercel.app
   ```

5. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy automatically
   - Every push to main triggers auto-deployment

6. **Custom Domain** (Optional)
   - Go to Project Settings → Domains
   - Add your custom domain
   - Configure DNS records as instructed

## Database Setup (Supabase)

### Creating Supabase Project:

1. **Sign up for Supabase**
   - Go to [supabase.com](https://supabase.com)
   - Create account

2. **Create New Project**
   - Organization: Create new or select existing
   - Project name: ScholarSync
   - Database password: Generate strong password
   - Region: Choose closest to your users

3. **Get Connection String**
   - Go to Project Settings → Database
   - Copy "Connection string" under "Connection pooling"
   - Format: `postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`

4. **Run Migrations**
   ```bash
   cd scholarsync-backend
   DATABASE_URL="your_supabase_url" npx prisma migrate deploy
   ```

5. **Enable Row Level Security** (Optional but recommended)
   - Go to Table Editor
   - Enable RLS on sensitive tables
   - Create policies for user access

### Supabase Storage Setup:

1. **Create Buckets**
   - Go to Storage
   - Create bucket: `documents` (for application documents)
   - Create bucket: `profile-images` (for user avatars)
   - Set bucket policies (public or authenticated)

2. **Update Backend Code**
   - Install Supabase client: `npm install @supabase/supabase-js`
   - Configure storage in `src/utils/storage.ts`

## Environment Variables Reference

### Backend (.env)

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Authentication
JWT_SECRET=your-super-secure-random-string-min-32-chars

# AI Service
GEMINI_API_KEY=your-gemini-api-key

# Application
NODE_ENV=production
PORT=4000
FRONTEND_URL=https://scholarsync.vercel.app

# Optional: Supabase Storage
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

### Frontend (.env.local)

```env
# API
NEXT_PUBLIC_API_URL=https://scholarsync-backend.railway.app/graphql

# Application
NEXT_PUBLIC_APP_URL=https://scholarsync.vercel.app

# Optional: Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

## CI/CD Pipeline (GitHub Actions)

Automated testing and deployment on every push.

### Setup:

1. **Create Workflow File**
   - See `.github/workflows/ci-cd.yml` (created separately)

2. **Add GitHub Secrets**
   - Go to repo Settings → Secrets and variables → Actions
   - Add secrets:
     - `RAILWAY_TOKEN` (for backend deployment)
     - `VERCEL_TOKEN` (for frontend deployment)
     - `DATABASE_URL` (for running tests)
     - `JWT_SECRET` (for tests)

3. **Workflow Features**
   - Runs tests on every PR
   - Lints code
   - Type checks
   - Deploys on merge to main
   - Sends notifications on failure

## Post-Deployment Checklist

### Backend:

- [ ] API endpoint accessible and responds to health check
- [ ] GraphQL playground accessible (if enabled for production)
- [ ] Database migrations applied successfully
- [ ] Environment variables set correctly
- [ ] CORS configured for frontend domain
- [ ] Error logging/monitoring set up (optional: Sentry)
- [ ] API rate limiting configured
- [ ] SSL/HTTPS enabled

### Frontend:

- [ ] Website loads without errors
- [ ] Authentication works (login/register)
- [ ] Can complete onboarding flow
- [ ] Scholarships load and match scores display
- [ ] Can create applications
- [ ] Analytics dashboard loads
- [ ] Essay generator works
- [ ] All images and assets load
- [ ] SEO meta tags present
- [ ] Responsive on mobile devices

### Database:

- [ ] Migrations applied
- [ ] Sample data seeded (optional)
- [ ] Backups configured
- [ ] Connection pooling enabled
- [ ] Indexes created for performance

## Monitoring and Maintenance

### Health Checks:

1. **Backend Health Endpoint**
   - Add health check route:
   ```typescript
   app.get('/health', (req, res) => {
     res.json({ status: 'ok', timestamp: new Date() });
   });
   ```

2. **Monitor Services**
   - Railway/Render: Built-in monitoring
   - Vercel: Analytics dashboard
   - Supabase: Database logs

### Error Tracking (Optional):

1. **Sentry Integration**
   ```bash
   npm install @sentry/node @sentry/nextjs
   ```

2. **Configure Sentry**
   - Backend: `src/utils/sentry.ts`
   - Frontend: `sentry.client.config.ts`

### Performance Monitoring:

- **Vercel Analytics**: Enable in project settings
- **Supabase Logs**: Check query performance
- **Railway Metrics**: Monitor CPU/memory usage

## Database Backups

### Supabase:

- Automatic daily backups on paid plans
- Manual backups: SQL Editor → Run pg_dump command

### Railway:

- Database backups in project settings
- Export: `pg_dump $DATABASE_URL > backup.sql`

### Restore:

```bash
psql $DATABASE_URL < backup.sql
```

## Scaling Considerations

### As User Base Grows:

1. **Database**
   - Upgrade to higher tier (more connections)
   - Add read replicas for analytics queries
   - Implement caching (Redis)

2. **Backend**
   - Scale horizontally (more instances)
   - Add load balancer
   - Implement rate limiting
   - Cache frequently accessed data

3. **Frontend**
   - Vercel scales automatically
   - Implement CDN for static assets
   - Optimize images (next/image)
   - Code splitting for faster loads

4. **AI Service**
   - Implement request queuing
   - Add retry logic
   - Consider self-hosted AI models

## Security Checklist

- [ ] Environment variables secured (not in repo)
- [ ] JWT secret is strong and unique
- [ ] Database credentials rotated regularly
- [ ] HTTPS enforced on all endpoints
- [ ] CORS properly configured (not allow *)
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (Prisma handles this)
- [ ] XSS prevention (React handles this)
- [ ] Authentication required for protected routes
- [ ] User data encrypted at rest (Supabase default)

## Rollback Procedure

If deployment fails or issues arise:

### Backend:

1. **Railway/Render**: Rollback to previous deployment
   - Dashboard → Deployments → Select previous → Redeploy

2. **Database Migration Rollback**:
   ```bash
   npx prisma migrate resolve --rolled-back [migration_name]
   ```

### Frontend:

1. **Vercel**: Rollback in dashboard
   - Deployments → Select previous → Promote to Production

## Domain Configuration

### Custom Domain Setup:

1. **Purchase Domain** (Namecheap, Google Domains, etc.)

2. **Configure DNS**:
   - Frontend (Vercel):
     ```
     Type: A
     Name: @
     Value: 76.76.19.19

     Type: CNAME
     Name: www
     Value: cname.vercel-dns.com
     ```

   - Backend (Railway):
     ```
     Type: CNAME
     Name: api
     Value: your-service.up.railway.app
     ```

3. **SSL Certificates**: Auto-provisioned by Vercel/Railway

## Beta Launch Checklist

Before launching to users:

### Technical:
- [ ] All tests passing
- [ ] Performance tested (load times < 3s)
- [ ] Mobile responsiveness verified
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Error handling graceful
- [ ] Loading states implemented
- [ ] 404/500 error pages

### Content:
- [ ] Privacy Policy page
- [ ] Terms of Service page
- [ ] About page
- [ ] FAQ/Help section
- [ ] Contact information

### Analytics:
- [ ] Google Analytics set up
- [ ] Event tracking configured
- [ ] Conversion funnels defined
- [ ] User feedback mechanism

### Marketing:
- [ ] Landing page ready
- [ ] Social media accounts created
- [ ] Beta announcement drafted
- [ ] Email list for beta users
- [ ] Feedback form ready

## Troubleshooting

### Common Issues:

**Issue**: "Cannot connect to database"
- Check DATABASE_URL format
- Verify database is running
- Check firewall/network rules
- Verify connection pooling settings

**Issue**: "CORS error on API calls"
- Add frontend URL to CORS whitelist
- Check CORS middleware configuration
- Verify NEXT_PUBLIC_API_URL is correct

**Issue**: "Build fails on Vercel"
- Check build logs for errors
- Verify all dependencies in package.json
- Check Node version compatibility
- Verify environment variables set

**Issue**: "Migrations not applied"
- Manually run: `npx prisma migrate deploy`
- Check database permissions
- Verify DATABASE_URL is correct

**Issue**: "API response slow"
- Check database query performance
- Add database indexes
- Implement caching
- Optimize GraphQL queries (avoid N+1)

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **Supabase Docs**: https://supabase.com/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Next.js Docs**: https://nextjs.org/docs

## Conclusion

Following this guide will help you successfully deploy ScholarSync to production. Remember to:

1. Test thoroughly before going live
2. Monitor services after deployment
3. Set up alerts for errors
4. Keep dependencies updated
5. Regularly backup database
6. Listen to user feedback

Good luck with your launch! 🚀
