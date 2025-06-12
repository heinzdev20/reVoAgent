#!/bin/bash

# reVoAgent Development Startup Script
# Quick start for development environment

set -e

echo "🚀 Starting reVoAgent Development Environment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[SETUP]${NC} $1"
}

# Check if setup has been run
if [ ! -f "venv/bin/activate" ]; then
    print_warning "Python virtual environment not found. Running setup..."
    ./scripts/setup_environment.sh development
fi

# Activate Python environment
print_status "Activating Python virtual environment..."
source venv/bin/activate

# Check if Redis is running
print_status "Checking Redis connection..."
if ! redis-cli ping &> /dev/null; then
    print_warning "Redis is not running. Starting Redis..."
    if command -v redis-server &> /dev/null; then
        redis-server --daemonize yes
        sleep 2
    else
        print_warning "Redis not installed. Some features may not work."
    fi
fi

# Create necessary directories
mkdir -p logs data/cognee_memory temp

# Start backend in background
print_status "Starting unified backend on port 12001..."
cd apps/backend
python unified_main.py &
BACKEND_PID=$!
cd ../..

# Wait for backend to start
sleep 3

# Start frontend in background
print_status "Starting frontend on port 12000..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Wait a moment for services to start
sleep 2

print_status "✅ reVoAgent is running!"
echo ""
echo "🌐 Frontend: http://localhost:12000"
echo "🔧 Backend API: http://localhost:12001"
echo "📚 API Docs: http://localhost:12001/docs"
echo "🔍 Health Check: http://localhost:12001/health"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo ""
    print_status "Stopping services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    
    # Wait for processes to terminate
    sleep 2
    
    # Force kill if still running
    kill -9 $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    
    print_status "✅ All services stopped"
    exit 0
}

# Set trap for cleanup
trap cleanup INT TERM

# Wait for interrupt
wait