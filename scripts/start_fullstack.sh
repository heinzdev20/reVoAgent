#!/bin/bash

# reVoAgent Full Stack Startup Script with Port Management
# This script ensures clean startup without port conflicts

set -e  # Exit on any error

BACKEND_PORT=12001
FRONTEND_PORT=12000
PROJECT_ROOT="/workspace/reVoAgent"

echo "🚀 Starting reVoAgent Full Stack..."
echo "=================================================="

# Function to check if port is available
check_port() {
    local port=$1
    python3 -c "
import socket
try:
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.bind(('localhost', $port))
    sock.close()
    exit(0)
except OSError:
    exit(1)
" 2>/dev/null
}

# Function to wait for service to be ready
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    echo "⏳ Waiting for $service_name to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" >/dev/null 2>&1; then
            echo "✅ $service_name is ready!"
            return 0
        fi
        echo "   Attempt $attempt/$max_attempts..."
        sleep 1
        attempt=$((attempt + 1))
    done
    
    echo "❌ $service_name failed to start within $max_attempts seconds"
    return 1
}

# Step 1: Cleanup existing processes
echo "🧹 Step 1: Cleaning up existing processes..."
bash "$PROJECT_ROOT/scripts/cleanup_ports.sh"

# Step 2: Verify ports are free
echo "🔍 Step 2: Verifying ports are available..."
if ! check_port $BACKEND_PORT; then
    echo "❌ Port $BACKEND_PORT is still in use. Please run cleanup script manually."
    exit 1
fi

if ! check_port $FRONTEND_PORT; then
    echo "❌ Port $FRONTEND_PORT is still in use. Please run cleanup script manually."
    exit 1
fi

echo "✅ Ports $BACKEND_PORT and $FRONTEND_PORT are available"

# Step 3: Start Backend
echo "🖥️  Step 3: Starting Backend on port $BACKEND_PORT..."
cd "$PROJECT_ROOT"

# Start backend in background with proper logging
nohup python apps/backend/main.py > logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait for backend to be ready
if ! wait_for_service "http://localhost:$BACKEND_PORT/health" "Backend"; then
    echo "❌ Backend failed to start"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

# Step 4: Start Frontend
echo "🌐 Step 4: Starting Frontend on port $FRONTEND_PORT..."
cd "$PROJECT_ROOT/frontend"

# Ensure node_modules exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Start frontend in background with proper logging
nohup npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

# Wait for frontend to be ready
if ! wait_for_service "http://localhost:$FRONTEND_PORT" "Frontend"; then
    echo "❌ Frontend failed to start"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    exit 1
fi

# Step 5: Save PIDs for later cleanup
echo "💾 Step 5: Saving process information..."
mkdir -p "$PROJECT_ROOT/logs"
echo "$BACKEND_PID" > "$PROJECT_ROOT/logs/backend.pid"
echo "$FRONTEND_PID" > "$PROJECT_ROOT/logs/frontend.pid"

# Step 6: Final verification
echo "🔍 Step 6: Final verification..."
echo ""
echo "🎉 reVoAgent Full Stack Started Successfully!"
echo "=============================================="
echo ""
echo "📊 Service Status:"
echo "   Backend:  http://localhost:$BACKEND_PORT (PID: $BACKEND_PID)"
echo "   Frontend: http://localhost:$FRONTEND_PORT (PID: $FRONTEND_PID)"
echo ""
echo "🌐 Access URLs:"
echo "   Frontend:  http://localhost:$FRONTEND_PORT"
echo "   Backend:   http://localhost:$BACKEND_PORT"
echo "   API Docs:  http://localhost:$BACKEND_PORT/docs"
echo "   Health:    http://localhost:$BACKEND_PORT/health"
echo ""
echo "📁 Logs:"
echo "   Backend:   $PROJECT_ROOT/logs/backend.log"
echo "   Frontend:  $PROJECT_ROOT/logs/frontend.log"
echo ""
echo "🛑 To stop services:"
echo "   bash $PROJECT_ROOT/scripts/stop_fullstack.sh"
echo ""

# Test the services
echo "🧪 Testing services..."
echo "Backend health check:"
curl -s http://localhost:$BACKEND_PORT/health | python3 -m json.tool | head -10

echo ""
echo "✅ Full stack is ready for development!"