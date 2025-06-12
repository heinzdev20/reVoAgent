#!/bin/bash
# Working reVoAgent Startup Script
# This script starts the simplified, working version of reVoAgent

set -e

echo "🚀 Starting reVoAgent Working Development Environment"
echo "====================================================="

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Check if we're in the right directory
if [ ! -f "simple_dev_server.py" ]; then
    print_error "Please run this script from the reVoAgent project root directory"
fi

# Check prerequisites
print_status "Checking prerequisites..."

if ! command -v python3 &> /dev/null; then
    print_error "Python 3.9+ is required but not installed"
fi

if ! command -v node &> /dev/null; then
    print_error "Node.js 18+ is required but not installed"
fi

print_success "Prerequisites check passed"

# Function to check if port is available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "Port $port is already in use"
        return 1
    fi
    return 0
}

# Check ports
print_status "Checking port availability..."
if ! check_port 8000; then
    print_error "Backend port 8000 is in use. Please free the port first."
fi

if ! check_port 12000; then
    print_error "Frontend port 12000 is in use. Please free the port first."
fi

print_success "Ports 8000 and 12000 are available"

# Create logs directory
mkdir -p logs

# Start backend
print_status "Starting simplified backend server on port 8000..."
python3 simple_dev_server.py > logs/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > logs/backend.pid

# Wait for backend to start
print_status "Waiting for backend to initialize..."
for i in {1..30}; do
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "Backend failed to start within 30 seconds. Check logs/backend.log"
    fi
    sleep 1
done

print_success "Backend started successfully"

# Start frontend
print_status "Starting frontend on port 12000..."
cd frontend
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../logs/frontend.pid

cd ..

# Wait for frontend to start
print_status "Waiting for frontend to initialize..."
sleep 5

# Check if services are running
if kill -0 $BACKEND_PID 2>/dev/null && kill -0 $FRONTEND_PID 2>/dev/null; then
    print_success "All services started successfully!"
    echo ""
    echo "🎉 reVoAgent Working Development Environment is Ready!"
    echo "===================================================="
    echo ""
    echo "📡 Backend API:       http://localhost:8000"
    echo "📚 API Documentation: http://localhost:8000/docs"
    echo "🎨 Frontend Dashboard: http://localhost:12000"
    echo "📊 Health Check:      http://localhost:8000/health"
    echo ""
    echo "📝 Logs:"
    echo "   Backend:  logs/backend.log"
    echo "   Frontend: logs/frontend.log"
    echo ""
    echo "🛑 To stop all services:"
    echo "   ./stop_working_revoagent.sh"
    echo ""
    echo "✨ Features working:"
    echo "   • ✅ Backend API with mock data"
    echo "   • ✅ Frontend dashboard with real-time connection"
    echo "   • ✅ System metrics display"
    echo "   • ✅ Agent status monitoring"
    echo "   • ✅ API documentation"
    echo "   • ✅ Error handling and fallbacks"
    echo ""
    echo "Press Ctrl+C to stop all services"
    
    # Create stop script
    cat > stop_working_revoagent.sh << 'STOP_EOF'
#!/bin/bash
echo "🛑 Stopping reVoAgent Working Development Environment..."

# Read PIDs and stop processes
if [ -f "logs/backend.pid" ]; then
    BACKEND_PID=$(cat logs/backend.pid)
    if kill -0 $BACKEND_PID 2>/dev/null; then
        kill $BACKEND_PID
        echo "✅ Backend stopped"
    fi
    rm -f logs/backend.pid
fi

if [ -f "logs/frontend.pid" ]; then
    FRONTEND_PID=$(cat logs/frontend.pid)
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        kill $FRONTEND_PID
        echo "✅ Frontend stopped"
    fi
    rm -f logs/frontend.pid
fi

echo "🏁 All services stopped"
STOP_EOF
    
    chmod +x stop_working_revoagent.sh
    
    # Wait for interrupt
    trap './stop_working_revoagent.sh; exit' INT TERM
    wait
else
    print_error "Failed to start services. Check the logs for details."
fi