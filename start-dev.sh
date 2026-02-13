#!/bin/bash

# ScholarSync Development Server Launcher

echo "🚀 Starting ScholarSync Development Servers..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists and has credentials
if [ ! -f "scholarsync-backend/.env" ]; then
    echo -e "${RED}✗ Backend .env file not found${NC}"
    echo "Run: npm run setup-env first"
    exit 1
fi

# Check if credentials are set
if grep -q "YOUR_SUPABASE_CONNECTION_STRING_HERE" scholarsync-backend/.env; then
    echo -e "${RED}✗ DATABASE_URL not configured in .env${NC}"
    echo "Please edit scholarsync-backend/.env and add your Supabase connection string"
    exit 1
fi

if grep -q "YOUR_GEMINI_API_KEY_HERE" scholarsync-backend/.env; then
    echo -e "${YELLOW}⚠ GEMINI_API_KEY not configured${NC}"
    echo "Essay generation won't work without it, but you can continue"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo -e "${GREEN}✓ Environment configured${NC}"
echo ""

# Run migrations
echo "📦 Setting up database..."
cd scholarsync-backend
npx prisma generate >/dev/null 2>&1
npx prisma migrate deploy

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Database migration failed${NC}"
    echo "Check your DATABASE_URL in .env"
    exit 1
fi

echo -e "${GREEN}✓ Database ready${NC}"

# Seed database
echo "🌱 Seeding scholarships..."
npx prisma db seed >/dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Sample scholarships added${NC}"
else
    echo -e "${YELLOW}⚠ Seeding skipped (may already exist)${NC}"
fi

cd ..
echo ""

# Start backend
echo "🔧 Starting backend server..."
cd scholarsync-backend
npm run dev >/dev/null 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✓ Backend running on http://localhost:4000${NC}"
echo "   GraphQL Playground: http://localhost:4000/graphql"

# Wait for backend to start
sleep 3

# Start frontend
echo ""
echo "🎨 Starting frontend server..."
cd ../scholarsync-frontend
npm run dev >/dev/null 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}✓ Frontend running on http://localhost:3000${NC}"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ ScholarSync is ready!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Open your browser to: http://localhost:3000"
echo ""
echo "📚 Quick Start:"
echo "   1. Click 'Sign Up' to create an account"
echo "   2. Complete the onboarding wizard"
echo "   3. Browse scholarships and see your matches"
echo "   4. Create applications and generate essays"
echo ""
echo "🛑 To stop servers:"
echo "   Press Ctrl+C or run: npm run stop-dev"
echo ""
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"

# Save PIDs for cleanup
echo "$BACKEND_PID" > /tmp/scholarsync-backend.pid
echo "$FRONTEND_PID" > /tmp/scholarsync-frontend.pid

# Wait for Ctrl+C
trap "echo ''; echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Stopped'; exit 0" INT
wait
