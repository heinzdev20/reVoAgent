#!/bin/bash

echo "🔍 Port Configuration Test"
echo "========================="
echo ""

echo "📋 Testing port availability..."

# Test if ports are free
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "   ❌ Port 3000 is already in use"
    echo "      Run: lsof -ti:3000 | xargs kill -9"
else
    echo "   ✅ Port 3000 is available (Frontend)"
fi

if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
    echo "   ❌ Port 8000 is already in use"
    echo "      Run: lsof -ti:8000 | xargs kill -9"
else
    echo "   ✅ Port 8000 is available (Backend)"
fi

echo ""
echo "📋 Configuration files check..."

# Check vite.config.ts
if [ -f "frontend/vite.config.ts" ]; then
    if grep -q "port: 3000" frontend/vite.config.ts; then
        echo "   ✅ Frontend vite.config.ts configured for port 3000"
    else
        echo "   ❌ Frontend vite.config.ts not configured for port 3000"
    fi
    
    if grep -q "localhost:8000" frontend/vite.config.ts; then
        echo "   ✅ Frontend proxy configured for backend port 8000"
    else
        echo "   ❌ Frontend proxy not configured for backend port 8000"
    fi
else
    echo "   ❌ frontend/vite.config.ts not found"
fi

echo ""
echo "🚀 To start with fixed configuration:"
echo "   ./start-fixed.sh"
