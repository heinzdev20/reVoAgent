#!/bin/bash
# reVoAgent Installation Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        log_warning "Running as root. Consider using a virtual environment."
    fi
}

# Check Python version
check_python() {
    log_info "Checking Python version..."
    
    if ! command -v python3 &> /dev/null; then
        log_error "Python 3 is not installed. Please install Python 3.12 or later."
        exit 1
    fi
    
    python_version=$(python3 -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
    required_version="3.12"
    
    if ! python3 -c "import sys; exit(0 if sys.version_info >= (3, 12) else 1)"; then
        log_error "Python $required_version or later is required. Found: $python_version"
        exit 1
    fi
    
    log_success "Python $python_version detected"
}

# Main installation function
main() {
    log_info "Starting reVoAgent installation..."
    
    # Parse command line arguments
    DEV_MODE=false
    RUN_TESTS=false
    
    for arg in "$@"; do
        case $arg in
            --dev)
                DEV_MODE=true
                shift
                ;;
            --test)
                RUN_TESTS=true
                shift
                ;;
            --help)
                echo "reVoAgent Installation Script"
                echo ""
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  --dev     Install development dependencies"
                echo "  --test    Run tests after installation"
                echo "  --help    Show this help message"
                exit 0
                ;;
        esac
    done
    
    # Run installation steps
    check_root
    check_python
    
    log_success "reVoAgent installation completed!"
    echo ""
    log_info "Next steps:"
    log_info "1. Install dependencies: pip install -r requirements.txt"
    log_info "2. Edit config/config.yaml to customize your setup"
    log_info "3. Download AI models and place them in the 'models' directory"
    log_info "4. Run reVoAgent: python main.py"
    echo ""
    log_info "For more information, visit: https://docs.revoagent.dev"
}

# Run main function with all arguments
main "$@"