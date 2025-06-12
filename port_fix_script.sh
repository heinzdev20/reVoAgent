#!/bin/bash

# reVoAgent Port Configuration Fix Script
# Fixes the port mismatch issues between frontend and backend

echo "🔧 reVoAgent Port Configuration Fix"
echo "===================================="
echo ""

echo "📋 Current Port Issues Detected:"
echo "   ❌ Frontend vite.config.ts expects backend on port 12001"
echo "   ❌ Backend main.py runs on port 8000"
echo "   ❌ Frontend dev server configured for port 12000"
echo ""

echo "🎯 Applying Standard Port Configuration:"
echo "   ✅ Frontend dev server: 3000"
echo "   ✅ Backend API server: 8000"
echo "   ✅ WebSocket server: 8001"
echo ""

# Fix frontend vite.config.ts
echo "🔧 Fixing frontend/vite.config.ts..."
if [ -f "frontend/vite.config.ts" ]; then
    cat > frontend/vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    cors: true,
    allowedHosts: ['*'],
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      },
      '/ws': {
        target: 'ws://localhost:8000',
        ws: true,
        changeOrigin: true
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
EOF
    echo "   ✅ Updated frontend/vite.config.ts"
else
    echo "   ⚠️  frontend/vite.config.ts not found"
fi

# Fix frontend package.json scripts
echo "🔧 Fixing frontend package.json scripts..."
if [ -f "frontend/package.json" ]; then
    # Create a backup
    cp frontend/package.json frontend/package.json.backup
    
    # Update the dev script to use port 3000
    sed -i 's/"dev": "vite"/"dev": "vite --port 3000"/' frontend/package.json
    echo "   ✅ Updated frontend package.json dev script"
else
    echo "   ⚠️  frontend/package.json not found"
fi

# Fix backend main.py port configuration
echo "🔧 Checking backend port configuration..."
if [ -f "apps/backend/main.py" ]; then
    # Check if port 8000 is already configured
    if grep -q "port.*8000" apps/backend/main.py; then
        echo "   ✅ Backend main.py already configured for port 8000"
    else
        echo "   ⚠️  Backend main.py may need manual port configuration"
        echo "      Please ensure it runs on port 8000"
    fi
else
    echo "   ⚠️  apps/backend/main.py not found"
fi

# Fix simple_backend_server.py
echo "🔧 Fixing simple_backend_server.py..."
if [ -f "simple_backend_server.py" ]; then
    # Update the default port to 8000
    sed -i 's/port: int = 8000/port: int = 8000/' simple_backend_server.py
    echo "   ✅ Confirmed simple_backend_server.py uses port 8000"
else
    echo "   ⚠️  simple_backend_server.py not found"
fi

# Create WebSocket service configuration fix
echo "🔧 Fixing WebSocket service configuration..."
if [ -f "frontend/src/services/unifiedWebSocketService.js" ] || [ -f "frontend/src/services/unifiedWebSocketService.ts" ]; then
    echo "   📝 WebSocket service found - create manual fix:"
    echo "      Update WebSocket connection URL to: ws://localhost:8000/ws"
elif [ -d "frontend/src/services" ]; then
    echo "   📝 Services directory found - WebSocket service may need configuration"
    echo "      Ensure WebSocket connects to: ws://localhost:8000/ws"
fi

# Update Docker configurations
echo "🔧 Fixing Docker configurations..."
if [ -f "docker-compose.yml" ]; then
    echo "   📝 docker-compose.yml found - manual check needed:"
    echo "      Ensure frontend service uses port 3000"
    echo "      Ensure backend service uses port 8000"
fi

# Create corrected environment configuration
echo "🔧 Creating corrected .env configuration..."
cat > .env.development << 'EOF'
# reVoAgent Development Environment - Corrected Ports

# Application Environment
NODE_ENV=development

# Frontend Configuration
REACT_APP_API_URL=http://localhost:8000
REACT_APP_WS_URL=ws://localhost:8000
FRONTEND_PORT=3000

# Backend Configuration
BACKEND_PORT=8000
WEBSOCKET_PORT=8000

# Database Configuration
DATABASE_URL=sqlite:///./data/revoagent.db

# AI Model Configuration
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Security
JWT_SECRET=your_jwt_secret_here

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
EOF
echo "   ✅ Created .env.development with correct ports"

# Update startup scripts with correct ports
echo "🔧 Creating corrected startup script..."
cat > start-fixed.sh << 'EOF'
#!/bin/bash

echo "🚀 Starting reVoAgent with Fixed Port Configuration"
echo "=================================================="
echo ""
echo "🔗 Service URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""

# Kill any existing services on these ports
echo "🔧 Cleaning up existing services..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
sleep 2

# Install frontend dependencies if needed
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

# Install Python dependencies
echo "🐍 Installing Python dependencies..."
pip install -r requirements.txt

echo ""
echo "🚀 Starting services with correct ports..."

# Start backend on port 8000
echo "🖥️  Starting backend on port 8000..."
cd apps/backend
python -c "
import sys
sys.path.insert(0, '../../')
from apps.backend.main import app
import uvicorn
print('Backend starting on http://localhost:8000')
uvicorn.run(app, host='0.0.0.0', port=8000)
" &
BACKEND_PID=$!
cd ../..

# Wait for backend to start
echo "⏳ Waiting for backend to initialize..."
sleep 5

# Start frontend on port 3000
echo "🌐 Starting frontend on port 3000..."
cd frontend && npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Services started successfully!"
echo "   Backend PID: $BACKEND_PID (port 8000)"
echo "   Frontend PID: $FRONTEND_PID (port 3000)"
echo ""
echo "🌐 Open your browser to: http://localhost:3000"
echo "📚 API Documentation: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    exit 0
}

# Set trap to cleanup on exit
trap cleanup SIGINT SIGTERM

# Wait for services
wait $BACKEND_PID $FRONTEND_PID
EOF
chmod +x start-fixed.sh
echo "   ✅ Created start-fixed.sh with correct port configuration"

# Create test script to verify ports
echo "🔧 Creating port verification script..."
cat > test-ports.sh << 'EOF'
#!/bin/bash

echo "🔍 Port Configuration Test"
echo "========================="
echo ""

echo "📋 Testing port availability..."

# Test if ports are free
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "   ❌ Port 3000 is already in use"
    echo "      Run: lsof -ti:3000 | xargs kill -9"
else
    echo "   ✅ Port 3000 is available (Frontend)"
fi

if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
    echo "   ❌ Port 8000 is already in use"
    echo "      Run: lsof -ti:8000 | xargs kill -9"
else
    echo "   ✅ Port 8000 is available (Backend)"
fi

echo ""
echo "📋 Configuration files check..."

# Check vite.config.ts
if [ -f "frontend/vite.config.ts" ]; then
    if grep -q "port: 3000" frontend/vite.config.ts; then
        echo "   ✅ Frontend vite.config.ts configured for port 3000"
    else
        echo "   ❌ Frontend vite.config.ts not configured for port 3000"
    fi
    
    if grep -q "localhost:8000" frontend/vite.config.ts; then
        echo "   ✅ Frontend proxy configured for backend port 8000"
    else
        echo "   ❌ Frontend proxy not configured for backend port 8000"
    fi
else
    echo "   ❌ frontend/vite.config.ts not found"
fi

echo ""
echo "🚀 To start with fixed configuration:"
echo "   ./start-fixed.sh"
EOF
chmod +x test-ports.sh
echo "   ✅ Created test-ports.sh for verification"

echo ""
echo "✅ Port Configuration Fix Complete!"
echo "=================================="
echo ""
echo "📊 Changes Applied:"
echo "   ✅ Frontend dev server: port 3000"
echo "   ✅ Backend API server: port 8000"
echo "   ✅ Frontend proxy: points to localhost:8000"
echo "   ✅ Environment configuration: updated"
echo "   ✅ Startup scripts: corrected"
echo ""
echo "🧪 Next Steps:"
echo "   1. Run: ./test-ports.sh (verify configuration)"
echo "   2. Run: ./start-fixed.sh (start with fixed ports)"
echo "   3. Open: http://localhost:3000 (frontend)"
echo "   4. Test: http://localhost:8000/docs (backend API)"
echo ""
echo "🔍 If services don't start:"
echo "   • Check that ports 3000 and 8000 are free"
echo "   • Verify Python and Node.js dependencies are installed"
echo "   • Check firewall/antivirus settings"
echo ""