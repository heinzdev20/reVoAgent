#!/bin/bash

echo "🚀 Starting reVoAgent with Runtime Port Configuration"
echo "=================================================="
echo ""
echo "🔗 Service URLs:"
echo "   Frontend: https://work-1-mlefcofvnyscmhno.prod-runtime.all-hands.dev (port 12000)"
echo "   Backend:  https://work-2-mlefcofvnyscmhno.prod-runtime.all-hands.dev (port 12001)"
echo "   Local Frontend: http://localhost:12000"
echo "   Local Backend:  http://localhost:12001"
echo ""

# Install frontend dependencies if needed
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

# Install Python dependencies
echo "🐍 Installing Python dependencies..."
pip install -r requirements.txt

echo ""
echo "🚀 Starting services with runtime ports..."

# Start backend on port 12001
echo "🖥️  Starting backend on port 12001..."
cd apps/backend && python main.py &
BACKEND_PID=$!
cd ../..

# Wait for backend to start
echo "⏳ Waiting for backend to initialize..."
sleep 5

# Start frontend on port 12000
echo "🌐 Starting frontend on port 12000..."
cd frontend && npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Services started successfully!"
echo "   Backend PID: $BACKEND_PID (port 12001)"
echo "   Frontend PID: $FRONTEND_PID (port 12000)"
echo ""
echo "🌐 Access URLs:"
echo "   Frontend: https://work-1-mlefcofvnyscmhno.prod-runtime.all-hands.dev"
echo "   Backend:  https://work-2-mlefcofvnyscmhno.prod-runtime.all-hands.dev"
echo "   Local Frontend: http://localhost:12000"
echo "   Local Backend:  http://localhost:12001/docs"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    exit 0
}

# Set trap to cleanup on exit
trap cleanup SIGINT SIGTERM

# Wait for services
wait $BACKEND_PID $FRONTEND_PID