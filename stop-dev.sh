#!/bin/bash

echo "🛑 Stopping ScholarSync development servers..."

# Kill by saved PIDs
if [ -f /tmp/scholarsync-backend.pid ]; then
    kill $(cat /tmp/scholarsync-backend.pid) 2>/dev/null
    rm /tmp/scholarsync-backend.pid
    echo "✓ Backend stopped"
fi

if [ -f /tmp/scholarsync-frontend.pid ]; then
    kill $(cat /tmp/scholarsync-frontend.pid) 2>/dev/null
    rm /tmp/scholarsync-frontend.pid
    echo "✓ Frontend stopped"
fi

# Fallback: kill by port
lsof -ti:4000 | xargs kill -9 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null

echo "✅ All servers stopped"
