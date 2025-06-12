#!/bin/bash
# Comprehensive reVoAgent Development Startup Script

set -e  # Exit on error

echo "🚀 Starting reVoAgent Development Environment"
echo "============================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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
if [ ! -f "package.json" ] && [ ! -f "frontend/package.json" ]; then
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

if ! command -v npm &> /dev/null; then
    print_error "npm is required but not installed"
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
    print_error "Backend port 8000 is in use. Please free the port or change configuration."
fi

if ! check_port 12000; then
    print_error "Frontend port 12000 is in use. Please free the port or change configuration."
fi

print_success "Ports 8000 and 12000 are available"

# Fix Python paths
print_status "Fixing Python import paths..."
python3 fix_python_paths.py

# Install Python dependencies
print_status "Installing Python dependencies..."
if [ -f "requirements-minimal.txt" ]; then
    pip install -r requirements-minimal.txt
else
    pip install fastapi uvicorn python-dotenv python-multipart websockets
fi

print_success "Python dependencies installed"

# Install frontend dependencies
print_status "Installing frontend dependencies..."
cd frontend

# Use fixed package.json if it exists
if [ -f "package-fixed.json" ]; then
    cp package-fixed.json package.json
fi

npm install
print_success "Frontend dependencies installed"

cd ..

# Create logs directory
mkdir -p logs

# Start backend
print_status "Starting backend server on port 8000..."
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
    echo "🎉 reVoAgent Development Environment is Ready!"
    echo "=============================================="
    echo ""
    echo "📡 Backend API:      http://localhost:8000"
    echo "📚 API Documentation: http://localhost:8000/docs"
    echo "🎨 Frontend:         http://localhost:12000"
    echo "📊 Health Check:     http://localhost:8000/health"
    echo ""
    echo "📝 Logs:"
    echo "   Backend:  logs/backend.log"
    echo "   Frontend: logs/frontend.log"
    echo ""
    echo "🛑 To stop all services:"
    echo "   ./stop_revoagent_dev.sh"
    echo ""
    echo "Press Ctrl+C to stop all services"
    
    # Create stop script
    cat > stop_revoagent_dev.sh << 'STOP_EOF'
#!/bin/bash
echo "🛑 Stopping reVoAgent Development Environment..."

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
    
    chmod +x stop_revoagent_dev.sh
    
    # Wait for interrupt
    trap './stop_revoagent_dev.sh; exit' INT TERM
    wait
else
    print_error "Failed to start services. Check the logs for details."
fi
