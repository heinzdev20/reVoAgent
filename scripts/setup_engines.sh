#!/bin/bash

# Three-Engine Setup Script for reVoAgent
# Initializes Perfect Recall, Parallel Mind, and Creative Engine

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
PINK='\033[0;95m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Engine emojis
PERFECT_RECALL="🔵"
PARALLEL_MIND="🟣"
CREATIVE_ENGINE="🩷"

echo -e "${BLUE}🧠 reVoAgent Three-Engine Setup${NC}"
echo "=================================="
echo ""

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if running from correct directory
if [ ! -f "pyproject.toml" ]; then
    print_error "Please run this script from the reVoAgent root directory"
    exit 1
fi

# Check Python version
python_version=$(python3 --version 2>&1 | cut -d' ' -f2 | cut -d'.' -f1,2)
required_version="3.8"

if [ "$(printf '%s\n' "$required_version" "$python_version" | sort -V | head -n1)" != "$required_version" ]; then
    print_error "Python 3.8+ required. Found: $python_version"
    exit 1
fi

print_status "Python version check passed: $python_version"

# Create necessary directories
print_info "Creating directory structure..."

directories=(
    "src/revoagent/engines/perfect_recall"
    "src/revoagent/engines/parallel_mind"
    "src/revoagent/engines/creative_engine"
    "src/revoagent/api"
    "tests/engines"
    "logs/engines"
    "models"
    "data/engines"
)

for dir in "${directories[@]}"; do
    mkdir -p "$dir"
    print_status "Created directory: $dir"
done

# Install Python dependencies
print_info "Installing Python dependencies..."

if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
    print_status "Installed requirements.txt"
fi

if [ -f "requirements-ai.txt" ]; then
    pip install -r requirements-ai.txt
    print_status "Installed requirements-ai.txt"
fi

# Install additional engine dependencies
print_info "Installing engine-specific dependencies..."

# Perfect Recall Engine dependencies
pip install faiss-cpu sentence-transformers chromadb
print_status "${PERFECT_RECALL} Perfect Recall Engine dependencies installed"

# Parallel Mind Engine dependencies
pip install celery redis asyncio aiohttp
print_status "${PARALLEL_MIND} Parallel Mind Engine dependencies installed"

# Creative Engine dependencies
pip install transformers torch accelerate
print_status "${CREATIVE_ENGINE} Creative Engine dependencies installed"

# Setup configuration files
print_info "Setting up configuration files..."

# Copy example configurations if they don't exist
config_files=(
    "engines.yaml"
    "models.yaml"
    "agents.yaml"
)

for config in "${config_files[@]}"; do
    if [ ! -f "config/$config" ]; then
        if [ -f "config/$config.example" ]; then
            cp "config/$config.example" "config/$config"
            print_status "Created config/$config from example"
        else
            print_warning "No example found for config/$config"
        fi
    else
        print_status "Config file already exists: config/$config"
    fi
done

# Initialize engine modules
print_info "Initializing engine modules..."

# Perfect Recall Engine
cat > "src/revoagent/engines/perfect_recall/__init__.py" << 'EOF'
"""
Perfect Recall Engine - Memory and Context Management
Target: < 100ms retrieval time
"""

from .memory_manager import MemoryManager
from .retrieval_engine import RetrievalEngine
from .context_processor import ContextProcessor

__all__ = ['MemoryManager', 'RetrievalEngine', 'ContextProcessor']
EOF

# Parallel Mind Engine
cat > "src/revoagent/engines/parallel_mind/__init__.py" << 'EOF'
"""
Parallel Mind Engine - Multi-threaded Processing
Target: 4-16 worker auto-scaling
"""

from .worker_manager import WorkerManager
from .task_coordinator import TaskCoordinator
from .parallel_processor import ParallelProcessor

__all__ = ['WorkerManager', 'TaskCoordinator', 'ParallelProcessor']
EOF

# Creative Engine
cat > "src/revoagent/engines/creative_engine/__init__.py" << 'EOF'
"""
Creative Engine - Innovation and Solution Generation
Target: 3-5 solution alternatives per request
"""

from .solution_generator import SolutionGenerator
from .innovation_engine import InnovationEngine
from .creativity_optimizer import CreativityOptimizer

__all__ = ['SolutionGenerator', 'InnovationEngine', 'CreativityOptimizer']
EOF

print_status "${PERFECT_RECALL} Perfect Recall Engine module initialized"
print_status "${PARALLEL_MIND} Parallel Mind Engine module initialized"
print_status "${CREATIVE_ENGINE} Creative Engine module initialized"

# Create engine coordinator
cat > "src/revoagent/engines/engine_coordinator.py" << 'EOF'
"""
Engine Coordinator - Inter-engine communication and task distribution
"""

import asyncio
from typing import Dict, List, Any, Optional
from dataclasses import dataclass

@dataclass
class EngineTask:
    """Task definition for engine processing"""
    task_id: str
    task_type: str
    data: Dict[str, Any]
    priority: int = 1
    timeout: float = 30.0

class EngineCoordinator:
    """Coordinates tasks between the three engines"""
    
    def __init__(self):
        self.engines = {
            'perfect_recall': None,
            'parallel_mind': None,
            'creative_engine': None
        }
        self.task_queue = asyncio.Queue()
        self.results = {}
    
    async def initialize_engines(self):
        """Initialize all three engines"""
        # TODO: Implement engine initialization
        pass
    
    async def route_task(self, task: EngineTask) -> Dict[str, Any]:
        """Route task to appropriate engine(s)"""
        # TODO: Implement task routing logic
        pass
    
    async def coordinate_engines(self, task: EngineTask) -> Dict[str, Any]:
        """Coordinate multiple engines for complex tasks"""
        # TODO: Implement multi-engine coordination
        pass

# Global coordinator instance
coordinator = EngineCoordinator()
EOF

print_status "Engine coordinator created"

# Create basic test files
print_info "Creating test files..."

# Engine tests
for engine in "perfect_recall" "parallel_mind" "creative_engine"; do
    cat > "tests/engines/test_${engine}.py" << EOF
"""
Test suite for ${engine} engine
"""

import pytest
import asyncio
from src.revoagent.engines.${engine} import *

class Test${engine^}Engine:
    """Test cases for ${engine} engine"""
    
    def test_engine_initialization(self):
        """Test engine initialization"""
        # TODO: Implement initialization test
        pass
    
    @pytest.mark.asyncio
    async def test_engine_processing(self):
        """Test engine processing capabilities"""
        # TODO: Implement processing test
        pass
    
    def test_engine_performance(self):
        """Test engine performance metrics"""
        # TODO: Implement performance test
        pass
EOF
    print_status "Created test file for ${engine} engine"
done

# Create Docker configurations for engines
print_info "Creating Docker configurations..."

mkdir -p docker/engines

# Perfect Recall Engine Dockerfile
cat > "docker/engines/Dockerfile.perfect-recall" << 'EOF'
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt requirements-ai.txt ./

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir -r requirements-ai.txt
RUN pip install --no-cache-dir faiss-cpu sentence-transformers chromadb

# Copy source code
COPY src/ ./src/
COPY config/ ./config/

# Set environment variables
ENV PYTHONPATH=/app
ENV ENGINE_TYPE=perfect_recall

# Expose port
EXPOSE 8001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8001/health')"

# Run engine
CMD ["python", "-m", "src.revoagent.engines.perfect_recall"]
EOF

# Parallel Mind Engine Dockerfile
cat > "docker/engines/Dockerfile.parallel-mind" << 'EOF'
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    redis-tools \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt requirements-ai.txt ./

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir -r requirements-ai.txt
RUN pip install --no-cache-dir celery redis asyncio aiohttp

# Copy source code
COPY src/ ./src/
COPY config/ ./config/

# Set environment variables
ENV PYTHONPATH=/app
ENV ENGINE_TYPE=parallel_mind

# Expose port
EXPOSE 8002

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8002/health')"

# Run engine
CMD ["python", "-m", "src.revoagent.engines.parallel_mind"]
EOF

# Creative Engine Dockerfile
cat > "docker/engines/Dockerfile.creative-engine" << 'EOF'
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt requirements-ai.txt ./

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir -r requirements-ai.txt
RUN pip install --no-cache-dir transformers torch accelerate

# Copy source code
COPY src/ ./src/
COPY config/ ./config/

# Set environment variables
ENV PYTHONPATH=/app
ENV ENGINE_TYPE=creative_engine

# Expose port
EXPOSE 8003

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8003/health')"

# Run engine
CMD ["python", "-m", "src.revoagent.engines.creative_engine"]
EOF

print_status "Docker configurations created for all engines"

# Create docker-compose for engines
cat > "docker-compose.engines.yml" << 'EOF'
version: '3.8'

services:
  # Perfect Recall Engine
  perfect-recall:
    build:
      context: .
      dockerfile: docker/engines/Dockerfile.perfect-recall
    container_name: revoagent-perfect-recall
    ports:
      - "8001:8001"
    environment:
      - ENGINE_TYPE=perfect_recall
      - LOG_LEVEL=INFO
    volumes:
      - ./data/engines/perfect_recall:/app/data
      - ./logs/engines:/app/logs
    networks:
      - revoagent-network
    restart: unless-stopped

  # Parallel Mind Engine
  parallel-mind:
    build:
      context: .
      dockerfile: docker/engines/Dockerfile.parallel-mind
    container_name: revoagent-parallel-mind
    ports:
      - "8002:8002"
    environment:
      - ENGINE_TYPE=parallel_mind
      - LOG_LEVEL=INFO
      - REDIS_URL=redis://redis:6379
    volumes:
      - ./data/engines/parallel_mind:/app/data
      - ./logs/engines:/app/logs
    depends_on:
      - redis
    networks:
      - revoagent-network
    restart: unless-stopped

  # Creative Engine
  creative-engine:
    build:
      context: .
      dockerfile: docker/engines/Dockerfile.creative-engine
    container_name: revoagent-creative-engine
    ports:
      - "8003:8003"
    environment:
      - ENGINE_TYPE=creative_engine
      - LOG_LEVEL=INFO
    volumes:
      - ./data/engines/creative_engine:/app/data
      - ./logs/engines:/app/logs
      - ./models:/app/models
    networks:
      - revoagent-network
    restart: unless-stopped

  # Redis for Parallel Mind Engine
  redis:
    image: redis:7-alpine
    container_name: revoagent-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - revoagent-network
    restart: unless-stopped

  # Engine Monitor
  monitor:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: revoagent-monitor
    ports:
      - "8765:8765"
    environment:
      - MONITOR_MODE=true
    volumes:
      - ./logs/engines:/app/logs
    depends_on:
      - perfect-recall
      - parallel-mind
      - creative-engine
    networks:
      - revoagent-network
    restart: unless-stopped
    command: ["python", "scripts/monitor_engines.py"]

volumes:
  redis_data:

networks:
  revoagent-network:
    driver: bridge
EOF

print_status "Engine orchestration docker-compose created"

# Make scripts executable
chmod +x scripts/*.py scripts/*.sh
print_status "Made scripts executable"

# Create log directories
mkdir -p logs/engines/{perfect_recall,parallel_mind,creative_engine}
print_status "Created log directories"

# Create data directories
mkdir -p data/engines/{perfect_recall,parallel_mind,creative_engine}
print_status "Created data directories"

# Final setup verification
print_info "Verifying setup..."

# Check if all required files exist
required_files=(
    "config/engines.yaml"
    "config/models.yaml"
    "config/agents.yaml"
    "src/revoagent/engines/__init__.py"
    "scripts/monitor_engines.py"
    "docker-compose.engines.yml"
)

all_good=true
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        print_status "✓ $file"
    else
        print_error "✗ $file missing"
        all_good=false
    fi
done

echo ""
echo "=================================="

if [ "$all_good" = true ]; then
    print_status "🎉 Three-Engine setup completed successfully!"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Review and customize config files in config/"
    echo "2. Run engines: docker-compose -f docker-compose.engines.yml up -d"
    echo "3. Monitor engines: python scripts/monitor_engines.py"
    echo "4. Test engines: pytest tests/engines/"
    echo ""
    echo -e "${PERFECT_RECALL} Perfect Recall Engine: http://localhost:8001"
    echo -e "${PARALLEL_MIND} Parallel Mind Engine: http://localhost:8002"
    echo -e "${CREATIVE_ENGINE} Creative Engine: http://localhost:8003"
    echo -e "🌐 Engine Monitor: ws://localhost:8765"
else
    print_error "Setup completed with errors. Please check the missing files."
    exit 1
fi