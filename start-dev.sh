#!/bin/bash

echo "🚀 Starting reVoAgent Development Environment..."
echo "=============================================="

# Check if frontend dependencies are installed
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

# Check if Python dependencies are installed
echo "🐍 Checking Python dependencies..."
pip install -r requirements.txt

echo ""
echo "🔗 Starting services..."
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo ""

# Start backend in background
echo "🖥️  Starting backend server..."
cd apps/backend && python main.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "🌐 Starting frontend development server..."
cd frontend && npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Development environment started!"
echo "   Backend PID: $BACKEND_PID"
echo "   Frontend PID: $FRONTEND_PID"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user to stop services
wait $BACKEND_PID $FRONTEND_PID
