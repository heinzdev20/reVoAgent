#!/bin/bash
# Development startup script

echo "🚀 Starting reVoAgent Development Environment..."

# Function to check if port is free
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port $1 is already in use"
        return 1
    else
        return 0
    fi
}

# Check ports
echo "🔍 Checking ports..."
if ! check_port 8000; then
    echo "❌ Backend port 8000 in use. Please stop other services or change port."
    exit 1
fi

if ! check_port 12000; then
    echo "❌ Frontend port 12000 in use. Please stop other services or change port."
    exit 1
fi

# Start backend in background
echo "🖥️  Starting backend server on port 8000..."
python simple_dev_server.py &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend on port 12000..."
cd frontend
npm run dev &
FRONTEND_PID=$!

# Show status
echo "✅ Development environment started!"
echo "📡 Backend: http://localhost:8000"
echo "🎨 Frontend: http://localhost:12000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap 'kill $BACKEND_PID $FRONTEND_PID; exit' INT
wait
