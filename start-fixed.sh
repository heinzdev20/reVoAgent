#!/bin/bash

echo "🚀 Starting reVoAgent with Fixed Port Configuration"
echo "=================================================="
echo ""
echo "🔗 Service URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""

# Kill any existing services on these ports
echo "🔧 Cleaning up existing services..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
sleep 2

# Install frontend dependencies if needed
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

# Install Python dependencies
echo "🐍 Installing Python dependencies..."
pip install -r requirements.txt

echo ""
echo "🚀 Starting services with correct ports..."

# Start backend on port 8000
echo "🖥️  Starting backend on port 8000..."
cd apps/backend
python -c "
import sys
sys.path.insert(0, '../../')
from apps.backend.main import app
import uvicorn
print('Backend starting on http://localhost:8000')
uvicorn.run(app, host='0.0.0.0', port=8000)
" &
BACKEND_PID=$!
cd ../..

# Wait for backend to start
echo "⏳ Waiting for backend to initialize..."
sleep 5

# Start frontend on port 3000
echo "🌐 Starting frontend on port 3000..."
cd frontend && npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Services started successfully!"
echo "   Backend PID: $BACKEND_PID (port 8000)"
echo "   Frontend PID: $FRONTEND_PID (port 3000)"
echo ""
echo "🌐 Open your browser to: http://localhost:3000"
echo "📚 API Documentation: http://localhost:8000/docs"
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
