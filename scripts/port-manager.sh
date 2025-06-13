#!/bin/bash

# 🚀 reVoAgent Port Manager - Enhanced Full-Stack Workflow Setup
# Ensures smooth development environment with proper port management

set -e

# Color codes for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_PORT=12000
BACKEND_PORT=8001
REDIS_PORT=6379
POSTGRES_PORT=5432
PROMETHEUS_PORT=9090
GRAFANA_PORT=3000

# Project paths
PROJECT_ROOT="/workspace/reVoAgent"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
BACKEND_DIR="$PROJECT_ROOT/apps/backend"

# Log file
LOG_FILE="$PROJECT_ROOT/logs/port-manager.log"
mkdir -p "$PROJECT_ROOT/logs"

# Logging function
log() {
    echo -e "${CYAN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

# Check if port is in use
check_port() {
    local port=$1
    # Try multiple methods to check if port is in use
    if command -v lsof >/dev/null 2>&1; then
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            return 0  # Port is in use
        fi
    elif command -v netstat >/dev/null 2>&1; then
        if netstat -tlnp 2>/dev/null | grep ":$port " >/dev/null; then
            return 0  # Port is in use
        fi
    elif command -v ss >/dev/null 2>&1; then
        if ss -tlnp 2>/dev/null | grep ":$port " >/dev/null; then
            return 0  # Port is in use
        fi
    else
        # Fallback: try to connect to the port
        if timeout 1 bash -c "</dev/tcp/localhost/$port" 2>/dev/null; then
            return 0  # Port is in use
        fi
    fi
    return 1  # Port is free
}

# Kill process on port
kill_port() {
    local port=$1
    local process_name=$2
    
    if check_port $port; then
        warning "Port $port is in use. Attempting to free it..."
        local pids=$(lsof -ti:$port)
        if [ ! -z "$pids" ]; then
            echo "$pids" | xargs kill -9 2>/dev/null || true
            sleep 2
            if check_port $port; then
                error "Failed to free port $port"
                return 1
            else
                success "Port $port freed successfully"
            fi
        fi
    else
        info "Port $port is already free"
    fi
    return 0
}

# Check system requirements
check_requirements() {
    log "🔍 Checking system requirements..."
    
    # Check Node.js
    if command -v node >/dev/null 2>&1; then
        local node_version=$(node --version)
        success "Node.js found: $node_version"
    else
        error "Node.js not found. Please install Node.js 18+"
        return 1
    fi
    
    # Check npm
    if command -v npm >/dev/null 2>&1; then
        local npm_version=$(npm --version)
        success "npm found: $npm_version"
    else
        error "npm not found. Please install npm"
        return 1
    fi
    
    # Check Python
    if command -v python3 >/dev/null 2>&1; then
        local python_version=$(python3 --version)
        success "Python found: $python_version"
    else
        error "Python3 not found. Please install Python 3.8+"
        return 1
    fi
    
    # Check Docker (optional)
    if command -v docker >/dev/null 2>&1; then
        local docker_version=$(docker --version)
        success "Docker found: $docker_version"
    else
        warning "Docker not found. Some features may be limited"
    fi
    
    return 0
}

# Setup frontend
setup_frontend() {
    log "🎨 Setting up frontend..."
    
    if [ ! -d "$FRONTEND_DIR" ]; then
        error "Frontend directory not found: $FRONTEND_DIR"
        return 1
    fi
    
    cd "$FRONTEND_DIR"
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        info "Installing frontend dependencies..."
        npm install
    else
        info "Frontend dependencies already installed"
    fi
    
    # Check if package.json has correct dev script
    if grep -q "vite --port $FRONTEND_PORT --host" package.json; then
        success "Frontend port configuration correct"
    else
        warning "Updating frontend port configuration..."
        # Update package.json dev script
        sed -i.bak "s/vite --port [0-9]* --host/vite --port $FRONTEND_PORT --host/g" package.json
    fi
    
    return 0
}

# Setup backend
setup_backend() {
    log "⚙️ Setting up backend..."
    
    if [ ! -d "$BACKEND_DIR" ]; then
        error "Backend directory not found: $BACKEND_DIR"
        return 1
    fi
    
    cd "$BACKEND_DIR"
    
    # Check if virtual environment exists
    if [ ! -d "venv" ]; then
        info "Creating Python virtual environment..."
        python3 -m venv venv
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Install dependencies if requirements.txt exists
    if [ -f "requirements.txt" ]; then
        info "Installing backend dependencies..."
        pip install -r requirements.txt
    else
        warning "requirements.txt not found in backend directory"
    fi
    
    return 0
}

# Start services
start_services() {
    log "🚀 Starting reVoAgent services..."
    
    # Free ports first
    kill_port $FRONTEND_PORT "Frontend"
    kill_port $BACKEND_PORT "Backend"
    
    # Start backend
    info "Starting backend on port $BACKEND_PORT..."
    cd "$BACKEND_DIR"
    if [ -f "main.py" ]; then
        # Activate virtual environment and start backend
        source venv/bin/activate
        export PORT=$BACKEND_PORT
        nohup python3 main.py > "$PROJECT_ROOT/logs/backend.log" 2>&1 &
        echo $! > "$PROJECT_ROOT/logs/backend.pid"
        sleep 5
        if check_port $BACKEND_PORT; then
            success "Backend started successfully on port $BACKEND_PORT"
        else
            error "Failed to start backend"
            return 1
        fi
    else
        warning "Backend main.py not found, skipping backend startup"
    fi
    
    # Start frontend
    info "Starting frontend on port $FRONTEND_PORT..."
    cd "$FRONTEND_DIR"
    nohup npm run dev > "$PROJECT_ROOT/logs/frontend.log" 2>&1 &
    echo $! > "$PROJECT_ROOT/logs/frontend.pid"
    sleep 5
    if check_port $FRONTEND_PORT; then
        success "Frontend started successfully on port $FRONTEND_PORT"
    else
        error "Failed to start frontend"
        return 1
    fi
    
    return 0
}

# Stop services
stop_services() {
    log "🛑 Stopping reVoAgent services..."
    
    # Stop frontend
    if [ -f "$PROJECT_ROOT/logs/frontend.pid" ]; then
        local frontend_pid=$(cat "$PROJECT_ROOT/logs/frontend.pid")
        if ps -p $frontend_pid > /dev/null 2>&1; then
            kill $frontend_pid
            success "Frontend stopped"
        fi
        rm -f "$PROJECT_ROOT/logs/frontend.pid"
    fi
    
    # Stop backend
    if [ -f "$PROJECT_ROOT/logs/backend.pid" ]; then
        local backend_pid=$(cat "$PROJECT_ROOT/logs/backend.pid")
        if ps -p $backend_pid > /dev/null 2>&1; then
            kill $backend_pid
            success "Backend stopped"
        fi
        rm -f "$PROJECT_ROOT/logs/backend.pid"
    fi
    
    # Force kill any remaining processes on our ports
    kill_port $FRONTEND_PORT "Frontend"
    kill_port $BACKEND_PORT "Backend"
}

# Status check
status_check() {
    log "📊 Checking reVoAgent service status..."
    
    echo -e "\n${PURPLE}=== Service Status ===${NC}"
    
    # Frontend status
    if check_port $FRONTEND_PORT; then
        success "✅ Frontend: Running on port $FRONTEND_PORT"
        echo -e "   ${CYAN}🌐 URL: https://work-1-dziuemnamvipshbv.prod-runtime.all-hands.dev${NC}"
    else
        error "❌ Frontend: Not running on port $FRONTEND_PORT"
    fi
    
    # Backend status
    if check_port $BACKEND_PORT; then
        success "✅ Backend: Running on port $BACKEND_PORT"
        echo -e "   ${CYAN}🔗 API: http://localhost:$BACKEND_PORT${NC}"
    else
        error "❌ Backend: Not running on port $BACKEND_PORT"
    fi
    
    # Additional services
    echo -e "\n${PURPLE}=== Additional Services ===${NC}"
    
    if check_port $REDIS_PORT; then
        success "✅ Redis: Running on port $REDIS_PORT"
    else
        warning "⚠️  Redis: Not running on port $REDIS_PORT"
    fi
    
    if check_port $POSTGRES_PORT; then
        success "✅ PostgreSQL: Running on port $POSTGRES_PORT"
    else
        warning "⚠️  PostgreSQL: Not running on port $POSTGRES_PORT"
    fi
    
    echo -e "\n${PURPLE}=== Resource Usage ===${NC}"
    echo -e "${CYAN}Memory Usage:${NC}"
    free -h | head -2
    echo -e "${CYAN}Disk Usage:${NC}"
    df -h / | tail -1
}

# Health check
health_check() {
    log "🏥 Performing health check..."
    
    local all_healthy=true
    
    # Check frontend health
    if check_port $FRONTEND_PORT; then
        if curl -s -f "http://localhost:$FRONTEND_PORT" > /dev/null 2>&1; then
            success "Frontend health check passed"
        else
            warning "Frontend port open but not responding to HTTP requests"
            all_healthy=false
        fi
    else
        error "Frontend health check failed - service not running"
        all_healthy=false
    fi
    
    # Check backend health
    if check_port $BACKEND_PORT; then
        if curl -s -f "http://localhost:$BACKEND_PORT/health" > /dev/null 2>&1; then
            success "Backend health check passed"
        else
            warning "Backend port open but health endpoint not responding"
            all_healthy=false
        fi
    else
        error "Backend health check failed - service not running"
        all_healthy=false
    fi
    
    if [ "$all_healthy" = true ]; then
        success "🎉 All services are healthy!"
        return 0
    else
        error "⚠️  Some services have health issues"
        return 1
    fi
}

# Cleanup function
cleanup() {
    log "🧹 Cleaning up temporary files and processes..."
    
    # Clean log files older than 7 days
    find "$PROJECT_ROOT/logs" -name "*.log" -mtime +7 -delete 2>/dev/null || true
    
    # Clean node_modules cache
    if [ -d "$FRONTEND_DIR/node_modules/.cache" ]; then
        rm -rf "$FRONTEND_DIR/node_modules/.cache"
        info "Cleaned frontend cache"
    fi
    
    # Clean Python cache
    find "$PROJECT_ROOT" -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
    find "$PROJECT_ROOT" -name "*.pyc" -delete 2>/dev/null || true
    
    success "Cleanup completed"
}

# Quick restart
quick_restart() {
    log "🔄 Performing quick restart..."
    stop_services
    sleep 2
    start_services
    sleep 3
    health_check
}

# Development mode
dev_mode() {
    log "🛠️  Starting development mode..."
    
    # Setup services
    setup_frontend
    setup_backend
    
    # Start services
    start_services
    
    # Wait a bit for services to stabilize
    sleep 5
    
    # Perform health check
    health_check
    
    # Show status
    status_check
    
    success "🎉 Development environment ready!"
    echo -e "\n${GREEN}=== Quick Access ===${NC}"
    echo -e "${CYAN}Frontend:${NC} https://work-1-dziuemnamvipshbv.prod-runtime.all-hands.dev"
    echo -e "${CYAN}Backend API:${NC} http://localhost:$BACKEND_PORT"
    echo -e "${CYAN}Logs:${NC} tail -f $PROJECT_ROOT/logs/*.log"
    echo -e "\n${YELLOW}Press Ctrl+C to stop all services${NC}"
    
    # Keep script running and monitor services
    trap 'stop_services; exit 0' INT TERM
    
    while true; do
        sleep 30
        if ! check_port $FRONTEND_PORT || ! check_port $BACKEND_PORT; then
            warning "Service detected as down, attempting restart..."
            quick_restart
        fi
    done
}

# Show usage
show_usage() {
    echo -e "${PURPLE}🚀 reVoAgent Port Manager${NC}"
    echo -e "${CYAN}Enhanced Full-Stack Workflow Setup${NC}"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo -e "  ${GREEN}dev${NC}         Start development mode (recommended)"
    echo -e "  ${GREEN}start${NC}       Start all services"
    echo -e "  ${GREEN}stop${NC}        Stop all services"
    echo -e "  ${GREEN}restart${NC}     Restart all services"
    echo -e "  ${GREEN}status${NC}      Check service status"
    echo -e "  ${GREEN}health${NC}      Perform health check"
    echo -e "  ${GREEN}setup${NC}       Setup frontend and backend"
    echo -e "  ${GREEN}cleanup${NC}     Clean temporary files"
    echo -e "  ${GREEN}kill-ports${NC}  Force kill processes on our ports"
    echo -e "  ${GREEN}help${NC}        Show this help message"
    echo ""
    echo "Examples:"
    echo -e "  ${YELLOW}$0 dev${NC}          # Start development environment"
    echo -e "  ${YELLOW}$0 status${NC}       # Check what's running"
    echo -e "  ${YELLOW}$0 restart${NC}      # Quick restart all services"
    echo ""
    echo "Ports:"
    echo -e "  Frontend:  ${CYAN}$FRONTEND_PORT${NC}"
    echo -e "  Backend:   ${CYAN}$BACKEND_PORT${NC}"
    echo -e "  Redis:     ${CYAN}$REDIS_PORT${NC}"
    echo -e "  PostgreSQL: ${CYAN}$POSTGRES_PORT${NC}"
}

# Main script logic
main() {
    case "${1:-help}" in
        "dev"|"development")
            check_requirements && dev_mode
            ;;
        "start")
            check_requirements && setup_frontend && setup_backend && start_services
            ;;
        "stop")
            stop_services
            ;;
        "restart")
            quick_restart
            ;;
        "status")
            status_check
            ;;
        "health")
            health_check
            ;;
        "setup")
            check_requirements && setup_frontend && setup_backend
            ;;
        "cleanup")
            cleanup
            ;;
        "kill-ports")
            kill_port $FRONTEND_PORT "Frontend"
            kill_port $BACKEND_PORT "Backend"
            ;;
        "help"|"--help"|"-h")
            show_usage
            ;;
        *)
            error "Unknown command: $1"
            show_usage
            exit 1
            ;;
    esac
}

# Initialize log
log "🚀 reVoAgent Port Manager started with command: ${1:-help}"

# Run main function
main "$@"