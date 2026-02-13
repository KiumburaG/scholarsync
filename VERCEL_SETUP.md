# Vercel Deployment Setup

## Backend Deployment

### Step 1: Prepare Backend for Vercel

The backend is already configured for Vercel serverless deployment. The structure is ready.

### Step 2: Create vercel.json

Backend is configured with a `vercel.json` file that routes all requests through the Express server.

### Step 3: Deploy Backend to Vercel

```bash
cd scholarsync-backend

# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (follow prompts)
vercel

# For production deployment
vercel --prod
```

### Step 4: Configure Environment Variables in Vercel

After deployment, add environment variables in Vercel Dashboard:

1. Go to your project in Vercel Dashboard
2. Settings → Environment Variables
3. Add all variables from `.env`:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
   - `JWT_EXPIRY`
   - `JWT_REFRESH_EXPIRY`
   - `EMAIL_FROM`
   - `SENDGRID_API_KEY`
   - `GEMINI_API_KEY`
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_BUCKET_NAME`
   - `AWS_REGION`
   - `NODE_ENV` (set to "production")
   - `FRONTEND_URL` (your frontend Vercel URL)

---

## Frontend Deployment

### Step 1: Deploy Frontend to Vercel

```bash
cd scholarsync-frontend

# Deploy
vercel

# For production
vercel --prod
```

### Step 2: Configure Frontend Environment Variables

Add in Vercel Dashboard:
- `NEXT_PUBLIC_API_URL` - Your backend GraphQL endpoint
- Any other public environment variables

---

## GitHub Integration (Recommended)

For automatic deployments on git push:

1. Push your repos to GitHub:
   ```bash
   # In scholarsync-backend
   git remote add origin https://github.com/YOUR_USERNAME/scholarsync-backend.git
   git branch -M main
   git add .
   git commit -m "Initial commit"
   git push -u origin main

   # In scholarsync-frontend
   git remote add origin https://github.com/YOUR_USERNAME/scholarsync-frontend.git
   git branch -M main
   git add .
   git commit -m "Initial commit"
   git push -u origin main
   ```

2. In Vercel Dashboard:
   - Import Project
   - Connect to GitHub
   - Select repository
   - Vercel will auto-deploy on every push to main

---

**Note**: For now, we'll develop locally. Deployment to Vercel will happen in Task #18 before beta launch.
