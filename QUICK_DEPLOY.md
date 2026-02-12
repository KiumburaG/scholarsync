# Quick Deployment Guide

This is a condensed version of the full deployment guide for quick reference.

## 🚀 Quick Start (15 minutes)

### 1. Database Setup (Supabase)

```bash
# Go to https://supabase.com and create a new project
# Copy the connection string (with connection pooling)
# It looks like: postgresql://postgres.[project]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

### 2. Deploy Backend (Railway)

```bash
# Go to https://railway.app
# Click "New Project" → "Deploy from GitHub repo"
# Select your repository
# Configure:
#   - Root directory: scholarsync-backend
#   - Build command: npm install && npx prisma generate && npm run build
#   - Start command: npm start

# Add environment variables in Railway:
DATABASE_URL=<your_supabase_connection_string>
JWT_SECRET=<generate_random_32_char_string>
GEMINI_API_KEY=<your_gemini_api_key>
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
PORT=4000

# Run migrations in Railway shell:
npx prisma migrate deploy
npx prisma db seed  # Optional: adds sample scholarships
```

**Generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Deploy Frontend (Vercel)

```bash
# Go to https://vercel.com
# Click "Add New" → "Project"
# Import your GitHub repository
# Configure:
#   - Framework: Next.js
#   - Root Directory: scholarsync-frontend
#   - Build Command: npm run build (default)

# Add environment variables in Vercel:
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/graphql
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# Click "Deploy"
```

### 4. Verify Deployment

```bash
# Backend health check:
curl https://your-backend.railway.app/health
# Should return: {"status":"ok","timestamp":"..."}

# Frontend:
# Visit https://your-app.vercel.app
# Should load without errors
```

## 📋 Pre-Deployment Checklist

- [ ] All tests passing: `npm test` (both backend and frontend)
- [ ] Environment variables prepared
- [ ] Google Gemini API key obtained
- [ ] Supabase project created
- [ ] Latest code pushed to GitHub main branch

## 🔑 Required Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-32-char-random-string
GEMINI_API_KEY=your-gemini-api-key
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
PORT=4000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/graphql
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

## 🧪 Post-Deployment Testing

1. **Authentication**: Register new user, login
2. **Onboarding**: Complete profile wizard
3. **Scholarships**: View scholarships, check match scores
4. **Applications**: Create application, update progress
5. **Analytics**: View analytics dashboard
6. **Essay Generator**: Generate an essay

## 🐛 Common Issues

### Issue: "Cannot connect to database"
**Solution**: Check DATABASE_URL format and verify connection pooling URL

### Issue: "CORS error"
**Solution**: Update FRONTEND_URL in backend environment variables

### Issue: "Build fails"
**Solution**: Check build logs, verify all dependencies in package.json

### Issue: "Migrations not applied"
**Solution**: Run `npx prisma migrate deploy` in Railway shell

## 📊 Monitoring

- **Backend**: Railway dashboard → Metrics
- **Frontend**: Vercel dashboard → Analytics
- **Database**: Supabase dashboard → Database
- **Errors**: Check deployment logs in Railway/Vercel

## 🔄 Continuous Deployment

Both platforms auto-deploy on push to main:
- Push to GitHub main branch → Auto-deploy to Railway (backend)
- Push to GitHub main branch → Auto-deploy to Vercel (frontend)

## 🆘 Rollback

### Railway (Backend):
1. Go to Deployments
2. Select previous deployment
3. Click "Redeploy"

### Vercel (Frontend):
1. Go to Deployments
2. Select previous deployment
3. Click "Promote to Production"

## 📚 Full Documentation

For detailed instructions, see:
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Complete deployment guide
- [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) - Pre-launch checklist

## 🎯 Alternative Deployment Options

### Backend Alternatives:
- **Render**: Similar to Railway, free tier available
- **Heroku**: Established platform, requires credit card
- **AWS/GCP**: More complex, better for scale

### Database Alternatives:
- **Railway PostgreSQL**: Included with Railway project
- **Neon**: Serverless PostgreSQL
- **PlanetScale**: MySQL-compatible (requires Prisma config change)

## 💰 Cost Estimates (Starting)

- **Supabase**: Free tier (500MB database, 2GB bandwidth)
- **Railway**: Free tier ($5 credit/month, ~550 hours)
- **Vercel**: Free tier (100GB bandwidth, unlimited deployments)
- **Google Gemini API**: Free tier (60 requests/minute)

**Total**: $0/month to start, scales as you grow

## 🔐 Security Notes

- Never commit .env files to repository
- Rotate JWT_SECRET if compromised
- Use strong database passwords
- Enable 2FA on all deployment platforms
- Review Supabase security policies
- Set up rate limiting (see full guide)

## 📞 Need Help?

1. Check logs in Railway/Vercel dashboards
2. Review [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
3. Check [GitHub Issues](https://github.com/yourusername/scholarsync/issues)
4. Join community Discord (if available)

---

**Deployment time**: ~15 minutes
**First-time setup**: ~30 minutes (including account creation)

Good luck with your deployment! 🎉
