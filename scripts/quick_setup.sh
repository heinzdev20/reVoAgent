#!/bin/bash

# reVoAgent Quick Setup Script
# Integrated DeepSeek R1 + OpenHands + Zero-Cost AI Platform

set -e

echo "🚀 reVoAgent Quick Setup - Zero-Cost AI Coding Platform"
echo "========================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Detect system
detect_system() {
    print_status "Detecting system capabilities..."
    
    # OS Detection
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        OS="windows"
    else
        OS="unknown"
    fi
    
    print_status "Operating System: $OS"
    
    # CPU Detection
    if command_exists nproc; then
        CPU_CORES=$(nproc)
    elif command_exists sysctl; then
        CPU_CORES=$(sysctl -n hw.ncpu)
    else
        CPU_CORES=4
    fi
    
    print_status "CPU Cores: $CPU_CORES"
    
    # Memory Detection
    if command_exists free; then
        TOTAL_RAM=$(free -g | awk '/^Mem:/{print $2}')
    elif command_exists vm_stat; then
        TOTAL_RAM=$(echo "$(vm_stat | grep "Pages free" | awk '{print $3}' | sed 's/\.//' ) * 4096 / 1024 / 1024 / 1024" | bc)
    else
        TOTAL_RAM=8
    fi
    
    print_status "Total RAM: ${TOTAL_RAM}GB"
    
    # GPU Detection
    GPU_AVAILABLE=false
    if command_exists nvidia-smi; then
        if nvidia-smi > /dev/null 2>&1; then
            GPU_AVAILABLE=true
            GPU_INFO=$(nvidia-smi --query-gpu=name,memory.total --format=csv,noheader,nounits | head -1)
            print_status "GPU: $GPU_INFO"
        fi
    fi
    
    if [ "$GPU_AVAILABLE" = false ]; then
        print_status "GPU: Not available (CPU-only mode)"
    fi
}

# Install Python dependencies
install_python_deps() {
    print_status "Installing Python dependencies..."
    
    # Check Python version
    if command_exists python3; then
        PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
        print_status "Python version: $PYTHON_VERSION"
        
        if [[ $(echo "$PYTHON_VERSION >= 3.8" | bc -l) -eq 1 ]]; then
            print_success "Python version is compatible"
        else
            print_error "Python 3.8+ required, found $PYTHON_VERSION"
            exit 1
        fi
    else
        print_error "Python 3 not found. Please install Python 3.8+"
        exit 1
    fi
    
    # Install core dependencies
    print_status "Installing core dependencies..."
    pip3 install --upgrade pip
    
    # Install essential packages first
    pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
    pip3 install transformers accelerate
    pip3 install fastapi uvicorn
    pip3 install pydantic pyyaml click rich
    pip3 install psutil httpx aiofiles
    
    print_success "Core dependencies installed"
    
    # Install optional GPU support
    if [ "$GPU_AVAILABLE" = true ]; then
        print_status "Installing GPU support..."
        pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
        print_success "GPU support installed"
    fi
    
    # Install additional dependencies
    print_status "Installing additional dependencies..."
    pip3 install playwright selenium beautifulsoup4
    pip3 install gitpython docker
    pip3 install redis
    pip3 install websockets
    pip3 install tenacity jinja2
    pip3 install numpy pandas
    
    # Install optional vLLM (if compatible)
    if [ "$OS" = "linux" ] && [ "$GPU_AVAILABLE" = true ]; then
        print_status "Installing vLLM for optimized inference..."
        pip3 install vllm || print_warning "vLLM installation failed, will use transformers"
    fi
    
    # Install llama-cpp-python for GGUF support
    print_status "Installing llama-cpp-python for GGUF support..."
    if [ "$GPU_AVAILABLE" = true ]; then
        CMAKE_ARGS="-DLLAMA_CUBLAS=on" pip3 install llama-cpp-python || print_warning "GPU-accelerated llama-cpp-python failed, installing CPU version"
    fi
    pip3 install llama-cpp-python || print_warning "llama-cpp-python installation failed"
    
    print_success "Python dependencies installed"
}

# Setup workspace
setup_workspace() {
    print_status "Setting up workspace..."
    
    # Create directories
    mkdir -p workspace/{models,projects,logs,cache}
    mkdir -p config
    mkdir -p logs
    
    # Create default config if it doesn't exist
    if [ ! -f "config/config.yaml" ]; then
        cat > config/config.yaml << EOF
platform:
  name: "reVoAgent"
  version: "1.0.0"
  
models:
  default: "deepseek-ai/DeepSeek-R1-0528"
  local_models_path: "./workspace/models"
  quantization: true
  
agents:
  code_generator:
    enabled: true
    model: "deepseek-ai/DeepSeek-R1-0528"
    tools: ["git", "editor", "terminal"]
    
  debugging_agent:
    enabled: true
    model: "deepseek-ai/DeepSeek-R1-0528"
    
security:
  sandbox_enabled: true
  network_isolation: false
  file_system_limits: true

execution:
  max_concurrent_agents: 5
  agent_timeout: 300
  memory_limit_per_agent: "1GB"
EOF
        print_success "Created default configuration"
    fi
    
    print_success "Workspace setup complete"
}

# Download OpenHands (optional)
setup_openhands() {
    print_status "Setting up OpenHands integration..."
    
    if [ ! -d "OpenHands" ]; then
        print_status "Cloning OpenHands repository..."
        git clone https://github.com/All-Hands-AI/OpenHands.git || {
            print_warning "Failed to clone OpenHands, some features may be limited"
            return
        }
    fi
    
    print_success "OpenHands integration ready"
}

# Create startup scripts
create_scripts() {
    print_status "Creating startup scripts..."
    
    # Create simple startup script
    cat > start_revoagent.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting reVoAgent..."
python3 main.py "$@"
EOF
    chmod +x start_revoagent.sh
    
    # Create model selection script
    cat > select_model.sh << 'EOF'
#!/bin/bash
echo "🤖 reVoAgent Model Selector"
python3 main.py --interactive-model-selection
EOF
    chmod +x select_model.sh
    
    # Create CPU-only script
    cat > start_cpu_only.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting reVoAgent (CPU Only)"
python3 main.py --cpu-only
EOF
    chmod +x start_cpu_only.sh
    
    # Create GPU script
    if [ "$GPU_AVAILABLE" = true ]; then
        cat > start_gpu.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting reVoAgent (GPU Accelerated)"
python3 main.py --gpu-only
EOF
        chmod +x start_gpu.sh
    fi
    
    print_success "Startup scripts created"
}

# Test installation
test_installation() {
    print_status "Testing installation..."
    
    # Test Python imports
    python3 -c "
import torch
import transformers
import fastapi
print('✅ Core dependencies working')

# Test system detection
import sys
sys.path.insert(0, 'src')
from revoagent.model_layer.deepseek_provider import SystemDetector
capabilities = SystemDetector.detect_system()
print(f'✅ System detection working: {capabilities.cpu_cores} cores, {capabilities.total_ram_gb:.1f}GB RAM')
" || {
        print_error "Installation test failed"
        exit 1
    }
    
    print_success "Installation test passed"
}

# Main setup function
main() {
    echo "Starting reVoAgent setup..."
    echo ""
    
    # Detect system
    detect_system
    echo ""
    
    # Install dependencies
    install_python_deps
    echo ""
    
    # Setup workspace
    setup_workspace
    echo ""
    
    # Setup OpenHands
    setup_openhands
    echo ""
    
    # Create scripts
    create_scripts
    echo ""
    
    # Test installation
    test_installation
    echo ""
    
    # Show completion message
    echo "🎉 reVoAgent Setup Complete!"
    echo "=========================="
    echo ""
    echo "📊 System Summary:"
    echo "  CPU: $CPU_CORES cores"
    echo "  RAM: ${TOTAL_RAM}GB"
    echo "  GPU: $([ "$GPU_AVAILABLE" = true ] && echo "Available" || echo "Not available")"
    echo ""
    echo "🚀 Quick Start Options:"
    echo ""
    echo "1. Interactive Model Selection:"
    echo "   ./select_model.sh"
    echo ""
    echo "2. Auto-detect and Start:"
    echo "   ./start_revoagent.sh"
    echo ""
    echo "3. CPU-only Mode:"
    echo "   ./start_cpu_only.sh"
    echo ""
    if [ "$GPU_AVAILABLE" = true ]; then
        echo "4. GPU Accelerated Mode:"
        echo "   ./start_gpu.sh"
        echo ""
    fi
    echo "5. Web Dashboard Only:"
    echo "   python3 main.py --mode web"
    echo ""
    echo "6. CLI Only:"
    echo "   python3 main.py --mode cli"
    echo ""
    echo "📚 Documentation:"
    echo "  - README.md - Platform overview"
    echo "  - INTEGRATION_SUMMARY.md - Integration details"
    echo "  - docs/ - Comprehensive documentation"
    echo ""
    echo "🔧 Configuration:"
    echo "  - config/config.yaml - Main configuration"
    echo "  - workspace/ - Working directory"
    echo ""
    echo "💡 Tips:"
    echo "  - First run will download the AI model (~14GB for DeepSeek R1)"
    echo "  - Use --interactive-model-selection to choose different models"
    echo "  - Check logs/ directory for troubleshooting"
    echo ""
    echo "🚀 Ready to start your zero-cost AI coding journey!"
}

# Run main function
main "$@"