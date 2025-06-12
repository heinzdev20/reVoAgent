#!/bin/bash
# Environment Configuration Fix Script
# Fixes all environment and configuration issues

echo "🔧 Fixing reVoAgent Environment Configuration..."

# 1. Create proper .env file
echo "📝 Creating proper environment configuration..."
cat > .env << 'EOF'
# reVoAgent Environment Configuration

# Node Environment
NODE_ENV=development

# API Configuration
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
API_BASE_URL=http://localhost:8000

# Backend Configuration
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000

# Frontend Configuration
FRONTEND_HOST=localhost
FRONTEND_PORT=12000

# AI Model Configuration (Optional - for enhanced features)
OPENAI_API_KEY=sk-your-openai-key-here
ANTHROPIC_API_KEY=your-anthropic-key-here

# Local AI Models (Optional)
DEEPSEEK_MODEL_PATH=deepseek-ai/deepseek-r1-distill-qwen-1.5b
LLAMA_MODEL_PATH=meta-llama/Llama-2-7b-chat-hf

# Database Configuration (Optional - for memory features)
DATABASE_URL=postgresql://localhost/revoagent
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your-super-secret-jwt-key-change-in-production
ENCRYPTION_KEY=your-encryption-key-32-chars-long

# External Integrations (Optional)
GITHUB_TOKEN=your-github-token
SLACK_TOKEN=your-slack-token
JIRA_URL=your-jira-instance.atlassian.net
JIRA_TOKEN=your-jira-token

# Development Settings
DEBUG=true
LOG_LEVEL=info
ENABLE_MOCK_DATA=true
EOF

# 2. Create frontend environment file
echo "📝 Creating frontend environment file..."
cat > frontend/.env << 'EOF'
# Frontend Environment Variables
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
VITE_APP_MODE=development
VITE_ENABLE_MOCK_DATA=true
EOF

# 3. Fix frontend package.json scripts
echo "🔧 Fixing frontend package.json scripts..."
cat > frontend/package-fixed.json << 'EOF'
{
  "name": "revoagent-dashboard",
  "version": "1.0.0",
  "description": "Revolutionary Agentic Coding Platform Dashboard",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --port 12000 --host",
    "dev:api": "vite --port 12000 --host --mode development",
    "build": "tsc && vite build",
    "preview": "vite preview --port 12000",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "type-check": "tsc --noEmit",
    "start": "npm run dev"
  },
  "dependencies": {
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "@types/d3": "^7.4.3",
    "chart.js": "^4.4.9",
    "clsx": "^2.0.0",
    "d3": "^7.8.5",
    "framer-motion": "^10.16.5",
    "lucide-react": "^0.294.0",
    "react": "^18.2.0",
    "react-chartjs-2": "^5.3.0",
    "react-dom": "^18.2.0",
    "react-grid-layout": "^1.4.4",
    "react-markdown": "^9.0.1",
    "react-router-dom": "^6.20.0",
    "react-syntax-highlighter": "^15.5.0",
    "recharts": "^2.8.0",
    "tailwind-merge": "^2.6.0",
    "zustand": "^5.0.5"
  },
  "devDependencies": {
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "@types/react-grid-layout": "^1.3.5",
    "@types/react-syntax-highlighter": "^15.5.11",
    "@typescript-eslint/eslint-plugin": "^6.10.0",
    "@typescript-eslint/parser": "^6.10.0",
    "@vitejs/plugin-react": "^4.1.1",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.53.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.4",
    "postcss": "^8.4.31",
    "tailwindcss": "^3.3.5",
    "typescript": "^5.2.2",
    "vite": "^6.3.5"
  }
}
EOF

# 4. Fix frontend vite.config.ts
echo "🔧 Fixing Vite configuration..."
cat > frontend/vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 12000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/ws': {
        target: 'ws://localhost:8000',
        ws: true,
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  define: {
    'process.env': process.env,
  },
})
EOF

# 5. Create requirements-minimal.txt for quick setup
echo "🐍 Creating minimal Python requirements..."
cat > requirements-minimal.txt << 'EOF'
# Minimal requirements for quick development setup
fastapi>=0.100.0
uvicorn[standard]>=0.23.0
python-dotenv>=1.0.0
python-multipart>=0.0.6
websockets>=11.0.0
pydantic>=2.0.0
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.4

# Optional AI dependencies (uncomment if needed)
# transformers>=4.30.0
# torch>=2.0.0
# openai>=1.0.0
# anthropic>=0.25.0
EOF

# 6. Fix Python path issues
echo "🐍 Creating Python path fix..."
cat > fix_python_paths.py << 'EOF'
#!/usr/bin/env python3
"""
Fix Python import paths for reVoAgent
Run this script to fix import issues
"""

import os
import sys
from pathlib import Path

# Add project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

# Create __init__.py files where missing
init_files = [
    "packages/__init__.py",
    "packages/ai/__init__.py",
    "packages/core/__init__.py",
    "packages/agents/__init__.py",
    "packages/engines/__init__.py",
    "packages/integrations/__init__.py",
    "packages/memory/__init__.py",
    "packages/tools/__init__.py",
    "apps/__init__.py",
    "apps/backend/__init__.py",
]

for init_file in init_files:
    init_path = project_root / init_file
    init_path.parent.mkdir(parents=True, exist_ok=True)
    if not init_path.exists():
        init_path.write_text('# Auto-generated __init__.py\n')
        print(f"✅ Created {init_file}")

print("🐍 Python paths fixed!")
EOF

# 7. Create comprehensive start script
echo "🚀 Creating comprehensive start script..."
cat > start_revoagent_dev.sh << 'EOF'
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
EOF

chmod +x start_revoagent_dev.sh

# 8. Apply fixes
echo "🔧 Applying configuration fixes..."

# Run Python path fix
python3 fix_python_paths.py

# Copy fixed package.json
if [ -f "frontend/package-fixed.json" ]; then
    cp frontend/package-fixed.json frontend/package.json
    echo "✅ Frontend package.json updated"
fi

echo ""
echo "✅ Environment Configuration Fix Complete!"
echo ""
echo "🚀 To start development environment:"
echo "   ./start_revoagent_dev.sh"
echo ""
echo "📚 What was fixed:"
echo "   • Environment variables configured correctly"
echo "   • Frontend/backend port alignment (8000/12000)"
echo "   • Python import paths fixed"
echo "   • Vite proxy configuration added"
echo "   • Minimal dependencies for quick start"
echo "   • Comprehensive startup scripts"
echo ""
echo "Ready to develop! 🎯"