#!/bin/bash

# reVoAgent Environment Setup Script
# Automated configuration for development and production environments

set -e

echo "🚀 reVoAgent Environment Setup Starting..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_PORT=12001
FRONTEND_PORT=12000
REDIS_PORT=6379

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[SETUP]${NC} $1"
}

# Check if running in Docker
check_docker_environment() {
    if [ -f /.dockerenv ]; then
        print_status "Running in Docker environment"
        export DOCKER_ENV=true
    else
        print_status "Running in host environment"
        export DOCKER_ENV=false
    fi
}

# Check system requirements
check_requirements() {
    print_header "Checking system requirements..."
    
    # Check Python version
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
        print_status "Python version: $PYTHON_VERSION"
        
        # Check if Python 3.12+
        if python3 -c "import sys; exit(0 if sys.version_info >= (3, 12) else 1)"; then
            print_status "Python version is compatible (3.12+)"
        else
            print_error "Python 3.12+ is required. Current version: $PYTHON_VERSION"
            exit 1
        fi
    else
        print_error "Python 3 is not installed"
        exit 1
    fi
    
    # Check Node.js version
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_status "Node.js version: $NODE_VERSION"
    else
        print_warning "Node.js is not installed. Installing..."
        install_nodejs
    fi
    
    # Check npm/yarn
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_status "npm version: $NPM_VERSION"
    else
        print_error "npm is not installed"
        exit 1
    fi
    
    # Check Docker (optional)
    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version)
        print_status "Docker version: $DOCKER_VERSION"
    else
        print_warning "Docker is not installed (optional for development)"
    fi
}

# Install Node.js if not present
install_nodejs() {
    print_header "Installing Node.js..."
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Ubuntu/Debian
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install node
        else
            print_error "Homebrew not found. Please install Node.js manually"
            exit 1
        fi
    else
        print_error "Unsupported OS. Please install Node.js manually"
        exit 1
    fi
}

# Setup Python environment
setup_python_environment() {
    print_header "Setting up Python environment..."
    
    # Create virtual environment if it doesn't exist
    if [ ! -d "venv" ]; then
        print_status "Creating Python virtual environment..."
        python3 -m venv venv
    fi
    
    # Activate virtual environment
    print_status "Activating virtual environment..."
    source venv/bin/activate
    
    # Upgrade pip
    print_status "Upgrading pip..."
    pip install --upgrade pip
    
    # Install dependencies
    print_status "Installing Python dependencies..."
    if [ -f "requirements.txt" ]; then
        pip install -r requirements.txt
    fi
    
    if [ -f "requirements-ai.txt" ]; then
        pip install -r requirements-ai.txt
    fi
    
    if [ -f "requirements-engines.txt" ]; then
        pip install -r requirements-engines.txt
    fi
    
    # Install package in development mode
    print_status "Installing reVoAgent package in development mode..."
    pip install -e .
}

# Setup Node.js environment
setup_nodejs_environment() {
    print_header "Setting up Node.js environment..."
    
    cd frontend
    
    # Install dependencies
    print_status "Installing Node.js dependencies..."
    npm install
    
    # Build frontend for production
    if [ "$1" = "production" ]; then
        print_status "Building frontend for production..."
        npm run build
    fi
    
    cd ..
}

# Setup configuration files
setup_configuration() {
    print_header "Setting up configuration files..."
    
    # Create config directory if it doesn't exist
    mkdir -p config/environments
    
    # Create development config
    if [ ! -f "config/environments/development.yaml" ]; then
        print_status "Creating development configuration..."
        cat > config/environments/development.yaml << EOF
# reVoAgent Development Configuration
environment: development
debug: true

server:
  host: "0.0.0.0"
  port: ${BACKEND_PORT}
  reload: true

frontend:
  host: "0.0.0.0"
  port: ${FRONTEND_PORT}
  api_url: "http://localhost:${BACKEND_PORT}"
  ws_url: "ws://localhost:${BACKEND_PORT}"

database:
  redis:
    host: "localhost"
    port: ${REDIS_PORT}
    db: 0

memory:
  enable_memory: true
  vector_db_provider: "lancedb"
  graph_db_provider: "networkx"
  memory_data_path: "./data/cognee_memory"

engines:
  perfect_recall:
    enabled: true
    model: "local"
  parallel_mind:
    enabled: true
    model: "local"
  creative_engine:
    enabled: true
    model: "local"

agents:
  max_concurrent: 10
  timeout: 300
  retry_attempts: 3

logging:
  level: "INFO"
  file: "./logs/revoagent.log"
EOF
    fi
    
    # Create production config
    if [ ! -f "config/environments/production.yaml" ]; then
        print_status "Creating production configuration..."
        cat > config/environments/production.yaml << EOF
# reVoAgent Production Configuration
environment: production
debug: false

server:
  host: "0.0.0.0"
  port: ${BACKEND_PORT}
  reload: false

frontend:
  host: "0.0.0.0"
  port: ${FRONTEND_PORT}
  api_url: "http://backend:${BACKEND_PORT}"
  ws_url: "ws://backend:${BACKEND_PORT}"

database:
  redis:
    host: "redis"
    port: ${REDIS_PORT}
    db: 0

memory:
  enable_memory: true
  vector_db_provider: "lancedb"
  graph_db_provider: "networkx"
  memory_data_path: "/app/data/cognee_memory"

engines:
  perfect_recall:
    enabled: true
    model: "production"
  parallel_mind:
    enabled: true
    model: "production"
  creative_engine:
    enabled: true
    model: "production"

agents:
  max_concurrent: 20
  timeout: 600
  retry_attempts: 5

logging:
  level: "WARNING"
  file: "/app/logs/revoagent.log"
EOF
    fi
    
    # Create environment file
    if [ ! -f ".env" ]; then
        print_status "Creating environment file..."
        cat > .env << EOF
# reVoAgent Environment Variables
REVOAGENT_ENV=development
REVOAGENT_CONFIG=./config/environments/development.yaml
PYTHONPATH=./src

# API Configuration
BACKEND_PORT=${BACKEND_PORT}
FRONTEND_PORT=${FRONTEND_PORT}

# Database Configuration
REDIS_URL=redis://localhost:${REDIS_PORT}

# Security
SECRET_KEY=$(openssl rand -hex 32)
JWT_SECRET=$(openssl rand -hex 32)

# Development flags
REVOAGENT_DEBUG=true
REVOAGENT_RELOAD=true
EOF
    fi
}

# Setup directories
setup_directories() {
    print_header "Setting up directories..."
    
    # Create necessary directories
    mkdir -p data/cognee_memory
    mkdir -p logs
    mkdir -p temp
    mkdir -p models
    mkdir -p config/agents
    mkdir -p config/engines
    mkdir -p config/workflows
    
    print_status "Created necessary directories"
}

# Setup database
setup_database() {
    print_header "Setting up database..."
    
    # Check if Redis is running
    if command -v redis-cli &> /dev/null; then
        if redis-cli ping &> /dev/null; then
            print_status "Redis is running"
        else
            print_warning "Redis is not running. Starting Redis..."
            start_redis
        fi
    else
        print_warning "Redis is not installed. Installing..."
        install_redis
    fi
}

# Install Redis
install_redis() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Ubuntu/Debian
        sudo apt-get update
        sudo apt-get install -y redis-server
        sudo systemctl enable redis-server
        sudo systemctl start redis-server
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install redis
            brew services start redis
        else
            print_error "Homebrew not found. Please install Redis manually"
            exit 1
        fi
    else
        print_error "Unsupported OS. Please install Redis manually"
        exit 1
    fi
}

# Start Redis
start_redis() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo systemctl start redis-server
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew services start redis
    else
        redis-server &
    fi
}

# Validate setup
validate_setup() {
    print_header "Validating setup..."
    
    # Check Python environment
    if source venv/bin/activate && python -c "import revoagent" 2>/dev/null; then
        print_status "Python environment is working"
    else
        print_error "Python environment validation failed"
        return 1
    fi
    
    # Check Node.js environment
    if cd frontend && npm list &> /dev/null; then
        print_status "Node.js environment is working"
        cd ..
    else
        print_error "Node.js environment validation failed"
        return 1
    fi
    
    # Check Redis connection
    if redis-cli ping &> /dev/null; then
        print_status "Redis connection is working"
    else
        print_error "Redis connection validation failed"
        return 1
    fi
    
    print_status "All validations passed!"
}

# Create startup scripts
create_startup_scripts() {
    print_header "Creating startup scripts..."
    
    # Development startup script
    cat > start_dev.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting reVoAgent Development Environment..."

# Activate Python environment
source venv/bin/activate

# Start Redis if not running
if ! redis-cli ping &> /dev/null; then
    echo "Starting Redis..."
    redis-server &
    sleep 2
fi

# Start backend in background
echo "Starting backend on port 12001..."
cd apps/backend && python main.py --port 12001 &
BACKEND_PID=$!

# Start frontend in background
echo "Starting frontend on port 12000..."
cd ../../frontend && npm run dev &
FRONTEND_PID=$!

echo "✅ reVoAgent is running!"
echo "Frontend: http://localhost:12000"
echo "Backend: http://localhost:12001"
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap "echo 'Stopping services...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
EOF
    
    chmod +x start_dev.sh
    
    # Production startup script
    cat > start_prod.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting reVoAgent Production Environment..."

# Use Docker Compose for production
if command -v docker-compose &> /dev/null; then
    docker-compose -f docker-compose.yml up -d
    echo "✅ reVoAgent is running in production mode!"
    echo "Frontend: http://localhost:12000"
    echo "Backend: http://localhost:12001"
else
    echo "❌ Docker Compose not found. Please install Docker Compose for production deployment."
    exit 1
fi
EOF
    
    chmod +x start_prod.sh
    
    print_status "Created startup scripts: start_dev.sh and start_prod.sh"
}

# Main setup function
main() {
    local mode=${1:-development}
    
    print_header "reVoAgent Environment Setup - Mode: $mode"
    
    check_docker_environment
    check_requirements
    setup_directories
    setup_configuration
    setup_python_environment
    setup_nodejs_environment "$mode"
    setup_database
    create_startup_scripts
    validate_setup
    
    print_status "✅ Environment setup completed successfully!"
    print_status ""
    print_status "Next steps:"
    print_status "1. For development: ./start_dev.sh"
    print_status "2. For production: ./start_prod.sh"
    print_status "3. Access frontend at: http://localhost:${FRONTEND_PORT}"
    print_status "4. Access backend at: http://localhost:${BACKEND_PORT}"
    print_status ""
    print_status "🎉 Welcome to reVoAgent!"
}

# Run main function with arguments
main "$@"