#!/bin/bash

# 🚀 Start reVoAgent Real-Time Application
# Launches the Three-Engine Architecture with WebSocket monitoring

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PORT=${1:-8000}
HOST=${2:-0.0.0.0}
RELOAD=${3:-false}
LOG_LEVEL=${4:-info}

echo -e "${CYAN}🎯 reVoAgent Three-Engine Architecture${NC}"
echo -e "${CYAN}=====================================${NC}"
echo -e "Starting real-time application with WebSocket monitoring"
echo -e "Host: ${YELLOW}$HOST${NC}"
echo -e "Port: ${YELLOW}$PORT${NC}"
echo -e "Reload: ${YELLOW}$RELOAD${NC}"
echo -e "Log Level: ${YELLOW}$LOG_LEVEL${NC}"
echo ""

# Function to print status
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
print_status "Checking prerequisites..."

# Check Python
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "src/revoagent/main_realtime.py" ]; then
    print_error "Please run this script from the reVoagent root directory"
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ] && [ ! -d ".venv" ] && [ -z "$VIRTUAL_ENV" ]; then
    print_warning "No virtual environment detected. Consider using one for isolation."
fi

# Install dependencies if needed
if [ ! -f ".deps_installed" ]; then
    print_status "Installing dependencies..."
    pip install -r requirements.txt -r requirements-engines.txt
    touch .deps_installed
    print_success "Dependencies installed"
fi

# Set environment variables
export PYTHONPATH="${PYTHONPATH}:$(pwd)/src"
export REDIS_URL="${REDIS_URL:-redis://localhost:6379}"
export LOG_LEVEL="$LOG_LEVEL"

# Check if Redis is available (optional)
if command -v redis-cli &> /dev/null; then
    if redis-cli ping &> /dev/null; then
        print_success "Redis connection available"
    else
        print_warning "Redis not available - Perfect Recall Engine will use fallback storage"
    fi
else
    print_warning "Redis CLI not found - Perfect Recall Engine will use fallback storage"
fi

# Create logs directory
mkdir -p logs

# Start the application
print_status "🚀 Starting Three-Engine Architecture..."
echo ""
echo -e "${PURPLE}🔵 Perfect Recall Engine${NC} - Sub-100ms memory retrieval"
echo -e "${PURPLE}🟣 Parallel Mind Engine${NC} - Auto-scaling workers (4-16)"
echo -e "${PURPLE}🩷 Creative Engine${NC} - 3-5 solution generation"
echo -e "${PURPLE}🔄 Engine Coordinator${NC} - Multi-strategy orchestration"
echo ""
echo -e "${GREEN}📡 WebSocket Endpoints:${NC}"
echo -e "  Engine Monitor: ${CYAN}ws://$HOST:$PORT/ws/engines${NC}"
echo -e "  Event Stream: ${CYAN}ws://$HOST:$PORT/ws/events${NC}"
echo ""
echo -e "${GREEN}🌐 Web Interfaces:${NC}"
echo -e "  Main Dashboard: ${CYAN}http://$HOST:$PORT/${NC}"
echo -e "  Live Dashboard: ${CYAN}http://$HOST:$PORT/ws/dashboard${NC}"
echo -e "  API Docs: ${CYAN}http://$HOST:$PORT/api/docs${NC}"
echo -e "  Health Check: ${CYAN}http://$HOST:$PORT/health${NC}"
echo ""

# Determine reload flag
RELOAD_FLAG=""
if [ "$RELOAD" = "true" ]; then
    RELOAD_FLAG="--reload"
    print_warning "Development mode: Auto-reload enabled"
fi

# Start the application
if [ "$RELOAD" = "true" ]; then
    # Development mode with auto-reload
    exec uvicorn src.revoagent.main_realtime:app \
        --host "$HOST" \
        --port "$PORT" \
        --log-level "$LOG_LEVEL" \
        --reload \
        --reload-dir src \
        --access-log
else
    # Production mode
    exec python3 src/revoagent/main_realtime.py
fi