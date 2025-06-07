#!/bin/bash

# reVoAgent Production Startup Script
# Integrates xCodeAgent01 and OpenHands capabilities

set -e

echo "🚀 Starting reVoAgent Production Environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REVO_AGENT_HOST=${REVO_AGENT_HOST:-"0.0.0.0"}
REVO_AGENT_PORT=${REVO_AGENT_PORT:-12000}
MODEL_SERVER_PORT=${MODEL_SERVER_PORT:-8000}
WORKSPACE_DIR=${WORKSPACE_DIR:-"./workspace"}
LOG_LEVEL=${LOG_LEVEL:-"INFO"}

# Function to print colored output
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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if port is available
is_port_available() {
    ! nc -z localhost $1 2>/dev/null
}

# Function to wait for service
wait_for_service() {
    local host=$1
    local port=$2
    local service_name=$3
    local max_attempts=30
    local attempt=1

    print_status "Waiting for $service_name to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if nc -z $host $port 2>/dev/null; then
            print_success "$service_name is ready!"
            return 0
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "$service_name failed to start within $((max_attempts * 2)) seconds"
    return 1
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Check if Python is available
    if ! command_exists python3; then
        print_error "Python 3 is required but not installed"
        exit 1
    fi
    
    # Check if pip is available
    if ! command_exists pip; then
        print_error "pip is required but not installed"
        exit 1
    fi
    
    # Install Python dependencies
    if [ -f "requirements.txt" ]; then
        print_status "Installing Python dependencies..."
        pip install -r requirements.txt
    else
        print_warning "requirements.txt not found, installing basic dependencies..."
        pip install fastapi uvicorn pydantic pyyaml click rich asyncio-mqtt torch transformers langchain playwright psutil redis docker
    fi
    
    # Install additional dependencies for integrations
    print_status "Installing integration dependencies..."
    pip install vllm httpx websockets aiofiles tenacity jinja2
    
    print_success "Dependencies installed successfully"
}

# Function to setup workspace
setup_workspace() {
    print_status "Setting up workspace..."
    
    # Create workspace directory
    mkdir -p "$WORKSPACE_DIR"
    mkdir -p "$WORKSPACE_DIR/models"
    mkdir -p "$WORKSPACE_DIR/projects"
    mkdir -p "$WORKSPACE_DIR/logs"
    mkdir -p "$WORKSPACE_DIR/cache"
    
    # Create config directory
    mkdir -p "config"
    
    # Copy example config if it doesn't exist
    if [ ! -f "config/config.yaml" ] && [ -f "config/config.example.yaml" ]; then
        cp "config/config.example.yaml" "config/config.yaml"
        print_status "Created config.yaml from example"
    fi
    
    print_success "Workspace setup complete"
}

# Function to check system requirements
check_system_requirements() {
    print_status "Checking system requirements..."
    
    # Check available memory
    available_memory=$(free -g | awk '/^Mem:/{print $7}')
    if [ "$available_memory" -lt 4 ]; then
        print_warning "Low available memory: ${available_memory}GB (recommended: 8GB+)"
    else
        print_success "Memory check passed: ${available_memory}GB available"
    fi
    
    # Check disk space
    available_disk=$(df -BG . | awk 'NR==2{print $4}' | sed 's/G//')
    if [ "$available_disk" -lt 10 ]; then
        print_warning "Low disk space: ${available_disk}GB (recommended: 20GB+)"
    else
        print_success "Disk space check passed: ${available_disk}GB available"
    fi
    
    # Check if GPU is available
    if command_exists nvidia-smi; then
        gpu_memory=$(nvidia-smi --query-gpu=memory.total --format=csv,noheader,nounits | head -1)
        if [ "$gpu_memory" -gt 4000 ]; then
            print_success "GPU detected: ${gpu_memory}MB VRAM"
        else
            print_warning "GPU has limited memory: ${gpu_memory}MB (recommended: 8GB+)"
        fi
    else
        print_warning "No GPU detected, will use CPU-only mode"
    fi
}

# Function to start model server
start_model_server() {
    print_status "Starting model server..."
    
    # Check if port is available
    if ! is_port_available $MODEL_SERVER_PORT; then
        print_warning "Port $MODEL_SERVER_PORT is already in use, skipping model server startup"
        return 0
    fi
    
    # Start vLLM server in background
    export CUDA_VISIBLE_DEVICES=0
    export VLLM_HOST=0.0.0.0
    export VLLM_PORT=$MODEL_SERVER_PORT
    
    # Use a lightweight model for demo if no specific model is configured
    MODEL_NAME=${MODEL_NAME:-"microsoft/DialoGPT-medium"}
    
    print_status "Starting vLLM server with model: $MODEL_NAME"
    
    # Start model server
    python -m vllm.entrypoints.openai.api_server \
        --model "$MODEL_NAME" \
        --host 0.0.0.0 \
        --port $MODEL_SERVER_PORT \
        --gpu-memory-utilization 0.8 \
        --max-model-len 2048 \
        > "$WORKSPACE_DIR/logs/model_server.log" 2>&1 &
    
    MODEL_SERVER_PID=$!
    echo $MODEL_SERVER_PID > "$WORKSPACE_DIR/model_server.pid"
    
    # Wait for model server to be ready
    if wait_for_service "localhost" $MODEL_SERVER_PORT "Model Server"; then
        print_success "Model server started successfully (PID: $MODEL_SERVER_PID)"
    else
        print_error "Failed to start model server"
        return 1
    fi
}

# Function to start OpenHands integration
start_openhands() {
    print_status "Setting up OpenHands integration..."
    
    # Check if OpenHands is available
    if [ -d "../OpenHands" ]; then
        export PYTHONPATH="../OpenHands:$PYTHONPATH"
        print_success "OpenHands integration configured"
    else
        print_warning "OpenHands not found, some features may be limited"
    fi
}

# Function to start web dashboard
start_web_dashboard() {
    print_status "Starting web dashboard..."
    
    # Check if port is available
    if ! is_port_available $REVO_AGENT_PORT; then
        print_error "Port $REVO_AGENT_PORT is already in use"
        return 1
    fi
    
    # Set environment variables
    export REVO_AGENT_HOST=$REVO_AGENT_HOST
    export REVO_AGENT_PORT=$REVO_AGENT_PORT
    export MODEL_SERVER_HOST=localhost
    export MODEL_SERVER_PORT=$MODEL_SERVER_PORT
    export WORKSPACE_DIR=$WORKSPACE_DIR
    export LOG_LEVEL=$LOG_LEVEL
    
    # Start the main application
    python main.py > "$WORKSPACE_DIR/logs/revoagent.log" 2>&1 &
    
    REVO_AGENT_PID=$!
    echo $REVO_AGENT_PID > "$WORKSPACE_DIR/revoagent.pid"
    
    # Wait for web dashboard to be ready
    if wait_for_service $REVO_AGENT_HOST $REVO_AGENT_PORT "reVoAgent Dashboard"; then
        print_success "reVoAgent started successfully (PID: $REVO_AGENT_PID)"
    else
        print_error "Failed to start reVoAgent"
        return 1
    fi
}

# Function to display startup information
display_startup_info() {
    echo ""
    echo "🎉 reVoAgent Production Environment Started Successfully!"
    echo ""
    echo "📊 Dashboard: http://$REVO_AGENT_HOST:$REVO_AGENT_PORT"
    echo "🤖 Model Server: http://localhost:$MODEL_SERVER_PORT"
    echo "📁 Workspace: $WORKSPACE_DIR"
    echo "📝 Logs: $WORKSPACE_DIR/logs/"
    echo ""
    echo "🔧 Management Commands:"
    echo "  Stop: ./scripts/stop_production.sh"
    echo "  Status: ./scripts/status.sh"
    echo "  Logs: tail -f $WORKSPACE_DIR/logs/revoagent.log"
    echo ""
    echo "🚀 Ready for agentic AI coding tasks!"
    echo ""
}

# Function to create stop script
create_stop_script() {
    cat > scripts/stop_production.sh << 'EOF'
#!/bin/bash

echo "🛑 Stopping reVoAgent Production Environment..."

WORKSPACE_DIR=${WORKSPACE_DIR:-"./workspace"}

# Stop reVoAgent
if [ -f "$WORKSPACE_DIR/revoagent.pid" ]; then
    PID=$(cat "$WORKSPACE_DIR/revoagent.pid")
    if kill -0 $PID 2>/dev/null; then
        kill $PID
        echo "✅ reVoAgent stopped (PID: $PID)"
    fi
    rm -f "$WORKSPACE_DIR/revoagent.pid"
fi

# Stop model server
if [ -f "$WORKSPACE_DIR/model_server.pid" ]; then
    PID=$(cat "$WORKSPACE_DIR/model_server.pid")
    if kill -0 $PID 2>/dev/null; then
        kill $PID
        echo "✅ Model server stopped (PID: $PID)"
    fi
    rm -f "$WORKSPACE_DIR/model_server.pid"
fi

echo "🏁 reVoAgent Production Environment stopped"
EOF

    chmod +x scripts/stop_production.sh
}

# Function to create status script
create_status_script() {
    cat > scripts/status.sh << 'EOF'
#!/bin/bash

echo "📊 reVoAgent Status"
echo "==================="

WORKSPACE_DIR=${WORKSPACE_DIR:-"./workspace"}

# Check reVoAgent
if [ -f "$WORKSPACE_DIR/revoagent.pid" ]; then
    PID=$(cat "$WORKSPACE_DIR/revoagent.pid")
    if kill -0 $PID 2>/dev/null; then
        echo "✅ reVoAgent: Running (PID: $PID)"
    else
        echo "❌ reVoAgent: Not running"
    fi
else
    echo "❌ reVoAgent: Not running"
fi

# Check model server
if [ -f "$WORKSPACE_DIR/model_server.pid" ]; then
    PID=$(cat "$WORKSPACE_DIR/model_server.pid")
    if kill -0 $PID 2>/dev/null; then
        echo "✅ Model Server: Running (PID: $PID)"
    else
        echo "❌ Model Server: Not running"
    fi
else
    echo "❌ Model Server: Not running"
fi

# Check ports
REVO_AGENT_PORT=${REVO_AGENT_PORT:-12000}
MODEL_SERVER_PORT=${MODEL_SERVER_PORT:-8000}

if nc -z localhost $REVO_AGENT_PORT 2>/dev/null; then
    echo "✅ Dashboard: Available at http://localhost:$REVO_AGENT_PORT"
else
    echo "❌ Dashboard: Not accessible"
fi

if nc -z localhost $MODEL_SERVER_PORT 2>/dev/null; then
    echo "✅ Model API: Available at http://localhost:$MODEL_SERVER_PORT"
else
    echo "❌ Model API: Not accessible"
fi
EOF

    chmod +x scripts/status.sh
}

# Main execution
main() {
    echo "🤖 reVoAgent - Agentic AI Coding System Platform"
    echo "================================================="
    echo ""
    
    # Create scripts directory
    mkdir -p scripts
    
    # Check system requirements
    check_system_requirements
    
    # Install dependencies
    install_dependencies
    
    # Setup workspace
    setup_workspace
    
    # Start services
    start_model_server
    start_openhands
    start_web_dashboard
    
    # Create management scripts
    create_stop_script
    create_status_script
    
    # Display startup information
    display_startup_info
    
    # Keep script running to monitor services
    trap 'echo ""; echo "🛑 Shutting down..."; ./scripts/stop_production.sh; exit 0' INT TERM
    
    echo "Press Ctrl+C to stop all services"
    echo ""
    
    # Monitor services
    while true; do
        sleep 10
        
        # Check if services are still running
        if [ -f "$WORKSPACE_DIR/revoagent.pid" ]; then
            PID=$(cat "$WORKSPACE_DIR/revoagent.pid")
            if ! kill -0 $PID 2>/dev/null; then
                print_error "reVoAgent process died unexpectedly"
                break
            fi
        fi
        
        if [ -f "$WORKSPACE_DIR/model_server.pid" ]; then
            PID=$(cat "$WORKSPACE_DIR/model_server.pid")
            if ! kill -0 $PID 2>/dev/null; then
                print_warning "Model server process died unexpectedly"
            fi
        fi
    done
}

# Run main function
main "$@"