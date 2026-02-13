# Local Development Guide

Quick guide to run ScholarSync locally and test the UI.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL installed (or use Docker)
- Google Gemini API key

## Quick Start (5 minutes)

### Option 1: With Docker (Easiest)

```bash
# 1. Set up environment variables
cd scholarsync-backend
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# 2. Start everything with Docker
cd ..
docker-compose up

# 3. Open browser
# Frontend: http://localhost:3000
# Backend GraphQL: http://localhost:4000/graphql
```

### Option 2: Without Docker

#### Step 1: Set Up Backend

```bash
cd scholarsync-backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Edit .env file:
# - DATABASE_URL: Set to your PostgreSQL URL
# - JWT_SECRET: Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# - GEMINI_API_KEY: Your Google Gemini API key
# - Keep other defaults

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed with sample scholarships
npx prisma db seed

# Start backend server
npm run dev
```

Backend will run on http://localhost:4000

#### Step 2: Set Up Frontend

```bash
# Open a new terminal
cd scholarsync-frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Edit .env.local:
# - NEXT_PUBLIC_API_URL=http://localhost:4000/graphql
# - NEXT_PUBLIC_APP_URL=http://localhost:3000

# Start frontend server
npm run dev
```

Frontend will run on http://localhost:3000

## Testing the UI

### 1. Register a New Account

1. Go to http://localhost:3000
2. Click "Sign Up" or "Get Started"
3. Create an account with:
   - Email: test@example.com
   - Password: Test123456!

### 2. Complete Onboarding

After registration, you'll be guided through the onboarding wizard:

**Step 1: Basic Information**
- First Name: John
- Last Name: Doe
- Phone: (123) 456-7890
- Date of Birth: 01/01/2000
- Address details

**Step 2: Academic Information**
- Current School: Monmouth University
- Graduation Year: 2025
- Major: Computer Science
- Minor: Mathematics
- GPA: 3.8
- Academic Standing: Good Standing

**Step 3: Experiences & Activities**
- Add volunteer work, jobs, leadership roles
- Add at least 2-3 activities for better matches

**Step 4: Narrative Information**
- Background: Brief personal story
- Challenges: Obstacles you've overcome
- Academic Journey: Your educational path
- Career Goals: Future aspirations
- Why Education Matters: Your motivation
- Personal Values: What drives you

**Step 5: Preferences**
- Select scholarship categories (STEM, Arts, etc.)
- Choose notification preferences

### 3. Explore Scholarships

1. Navigate to "Scholarships" page
2. You'll see scholarship cards with:
   - Match scores (0-100%)
   - Award amounts
   - Deadlines
   - Eligibility status
3. Click on a scholarship to see details
4. Filter by:
   - Minimum match score
   - Categories
   - Amount range
   - Deadline

### 4. Create an Application

1. From scholarship detail page, click "Start Application"
2. Or go to "Applications" page → "Create Application"
3. Track application with:
   - Status (DRAFT, IN_PROGRESS, SUBMITTED, etc.)
   - Progress slider (0-100%)
   - Deadline reminder
   - Notes

### 5. Generate an Essay

1. Go to "Essay Generator"
2. Enter essay prompt
3. Specify word count
4. Click "Generate Essay"
5. AI will create a personalized essay based on your profile
6. Edit and save

### 6. View Analytics

1. Go to "Analytics" page
2. See:
   - Application timeline (6-month view)
   - Success metrics
   - Activity stats and streaks
   - Financial summary
   - Category breakdown
   - Upcoming deadlines

### 7. Test Chrome Extension (Optional)

```bash
cd scholarsync-extension

# Install dependencies
npm install

# Build extension
npm run build

# Load in Chrome:
# 1. Go to chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select the scholarsync-extension/dist folder
```

## Common UI Pages

| Page | URL | Description |
|------|-----|-------------|
| Home | http://localhost:3000 | Landing page |
| Login | http://localhost:3000/auth/login | User login |
| Sign Up | http://localhost:3000/auth/signup | Registration |
| Onboarding | http://localhost:3000/onboarding | Profile wizard |
| Dashboard | http://localhost:3000/dashboard | Overview |
| Scholarships | http://localhost:3000/scholarships | Browse scholarships |
| Scholarship Detail | http://localhost:3000/scholarships/[id] | Single scholarship |
| Applications | http://localhost:3000/applications | My applications |
| Application Detail | http://localhost:3000/applications/[id] | Single application |
| Essay Generator | http://localhost:3000/essay-generator | AI essay tool |
| Analytics | http://localhost:3000/analytics | Dashboard stats |

## Quick Database Setup (If No PostgreSQL)

### Option A: Use Docker for PostgreSQL Only

```bash
# Start PostgreSQL in Docker
docker run --name scholarsync-db \
  -e POSTGRES_DB=scholarsync \
  -e POSTGRES_USER=scholarsync \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:15-alpine

# Use this DATABASE_URL in .env:
DATABASE_URL="postgresql://scholarsync:password@localhost:5432/scholarsync"
```

### Option B: Use Supabase (Free)

1. Go to https://supabase.com
2. Create free project
3. Get connection string from Settings → Database
4. Use the "Connection pooling" URL
5. Add to .env as DATABASE_URL

## Troubleshooting

### Backend Issues

**"Cannot connect to database"**
```bash
# Check PostgreSQL is running
psql --version
# or
docker ps | grep postgres

# Test connection
psql -h localhost -U scholarsync -d scholarsync
```

**"Prisma Client not generated"**
```bash
cd scholarsync-backend
npx prisma generate
```

**"Migration failed"**
```bash
# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Or create new migration
npx prisma migrate dev --name init
```

### Frontend Issues

**"Cannot connect to GraphQL API"**
- Verify backend is running on port 4000
- Check NEXT_PUBLIC_API_URL in .env.local
- Open http://localhost:4000/graphql in browser

**"Module not found" errors**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**"Port 3000 already in use"**
```bash
# Use different port
PORT=3001 npm run dev

# Or kill existing process
lsof -ti:3000 | xargs kill -9
```

### UI Issues

**"No scholarships showing"**
- Make sure you ran: `npx prisma db seed`
- Check backend logs for errors
- Verify your profile is complete

**"Match scores are 0%"**
- Complete your profile (especially GPA, major, activities)
- Check that scholarships have eligibility criteria

**"Essay generation not working"**
- Verify GEMINI_API_KEY is set in backend .env
- Check Google Gemini API quota
- Check backend logs for API errors

## Testing Tips

### Test Data

Create multiple test accounts to see different match scores:
- **High GPA student** (3.8+) - Will match STEM scholarships
- **Arts student** - Will match Arts/Humanities scholarships
- **Athlete student** - Add sports activities for athletic scholarships

### Browser DevTools

Open Chrome DevTools (F12) to:
- **Console**: See any JavaScript errors
- **Network**: Monitor GraphQL requests
- **Application**: Check localStorage for auth tokens

### Backend Logs

Watch backend logs for:
- GraphQL queries/mutations
- Authentication issues
- Database errors
- API calls

### Test Features Systematically

1. ✅ Registration → Login → Logout
2. ✅ Complete onboarding wizard (all 5 steps)
3. ✅ View scholarships with different filters
4. ✅ Create application → Update status → Delete
5. ✅ Generate essay with different prompts
6. ✅ Check analytics update after creating applications
7. ✅ Test mobile responsive design (resize browser)

## Performance Tips

### Speed Up Development

```bash
# Backend: Use nodemon watch mode (already default)
npm run dev

# Frontend: Turbopack for faster builds
npm run dev --turbo

# Database: Use connection pooling
# Add ?connection_limit=5 to DATABASE_URL
```

### Clear Cache

```bash
# Frontend
rm -rf .next

# Backend
rm -rf dist

# Prisma
npx prisma generate
```

## Next Steps

Once everything works locally:

1. Run tests: `npm test` (in both backend and frontend)
2. Build for production: `npm run build`
3. Follow DEPLOYMENT_GUIDE.md to deploy
4. Use PRODUCTION_CHECKLIST.md before launching

## Support

- **Backend Issues**: Check scholarsync-backend/README.md
- **Frontend Issues**: Check scholarsync-frontend/README.md
- **Extension Issues**: Check scholarsync-extension/README.md
- **Deployment**: Check QUICK_DEPLOY.md

Happy coding! 🚀
