#!/bin/bash
# reVoAgent Quick Start Script - Get running in 5 minutes
# Run this script in your project root directory

echo "🚀 Starting reVoAgent Quick Setup..."

# Step 1: Check requirements
echo "📋 Checking requirements..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3.9+ required. Please install Python first."
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js 18+ required. Please install Node.js first."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm required. Please install npm first."
    exit 1
fi

echo "✅ Requirements check passed"

# Step 2: Create simplified .env file
echo "📝 Creating environment configuration..."
cat > .env.development << 'EOF'
# Development Environment Variables
NODE_ENV=development
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000

# Optional AI API Keys (for enhanced features)
OPENAI_API_KEY=your-openai-key-here
ANTHROPIC_API_KEY=your-anthropic-key-here

# Database (optional for memory features)
DATABASE_URL=postgresql://user:pass@localhost/revoagent

# Security
JWT_SECRET=your-super-secret-jwt-key-for-development
EOF

echo "✅ Environment file created (.env.development)"

# Step 3: Install Python dependencies (simplified)
echo "🐍 Installing Python dependencies..."
pip install -r requirements.txt || pip install fastapi uvicorn python-dotenv python-multipart websockets

# Step 4: Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install

# Step 5: Create simplified backend server
echo "🖥️ Creating simplified backend server..."
cd ..
cat > simple_dev_server.py << 'EOF'
#!/usr/bin/env python3
"""
Simplified reVoAgent Development Server
Minimal backend to get frontend working quickly
"""

import asyncio
import os
from typing import Dict, Any, Optional, List
from datetime import datetime
import json
import logging

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uvicorn
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.development')

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="reVoAgent Development Server",
    description="Simplified backend for development",
    version="1.0.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:12000", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class ChatRequest(BaseModel):
    content: str
    system_prompt: Optional[str] = None
    max_tokens: int = 1024
    temperature: float = 0.7

class ChatResponse(BaseModel):
    content: str
    provider: str = "mock"
    tokens_used: int = 100
    generation_time: float = 0.5

# Mock data for development
MOCK_AGENTS = {
    "code_generator": {"status": "idle", "current_task": None},
    "debug_agent": {"status": "idle", "current_task": None},
    "testing_agent": {"status": "idle", "current_task": None},
}

MOCK_MODELS = [
    {"id": "gpt-4", "name": "GPT-4", "status": "available", "provider": "openai"},
    {"id": "claude-3", "name": "Claude 3", "status": "available", "provider": "anthropic"},
    {"id": "deepseek-r1", "name": "DeepSeek R1", "status": "local", "provider": "local"},
]

MOCK_WORKFLOWS = [
    {"id": "1", "name": "Code Review", "status": "active", "progress": 75},
    {"id": "2", "name": "Testing Pipeline", "status": "pending", "progress": 0},
]

# API Endpoints
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0-dev",
        "services": {
            "backend": "running",
            "database": "mock",
            "ai_models": "mock"
        }
    }

@app.get("/api/dashboard/stats")
async def dashboard_stats():
    """Dashboard statistics"""
    return {
        "agents": {"active": 3, "total": 9},
        "workflows": {"active": 1, "total": 2},
        "projects": {"active": 2, "total": 5},
        "system": {
            "cpu_usage": 45.2,
            "memory_usage": 67.8,
            "disk_usage": 34.1
        }
    }

@app.get("/api/agents")
async def get_agents():
    """Get all agents"""
    return {
        "agents": MOCK_AGENTS,
        "active_tasks": 0,
        "total_agents": len(MOCK_AGENTS)
    }

@app.get("/api/agents/{agent_type}/status")
async def get_agent_status(agent_type: str):
    """Get agent status"""
    if agent_type not in MOCK_AGENTS:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    return {
        "agent_type": agent_type,
        "status": MOCK_AGENTS[agent_type]["status"],
        "current_task": MOCK_AGENTS[agent_type]["current_task"],
        "performance": {
            "success_rate": 95.5,
            "avg_response_time": 1.2
        },
        "last_updated": datetime.now().isoformat()
    }

@app.post("/api/agents/{agent_type}/execute")
async def execute_agent_task(agent_type: str, task_data: Dict[str, Any]):
    """Execute agent task"""
    if agent_type not in MOCK_AGENTS:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    task_id = f"task_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    return {
        "success": True,
        "task_id": task_id,
        "agent_type": agent_type,
        "status": "running",
        "estimated_completion": "2024-01-01T12:00:00Z"
    }

@app.get("/api/models")
async def get_models():
    """Get available models"""
    return {
        "models": MOCK_MODELS,
        "status": "available"
    }

@app.get("/api/workflows")
async def get_workflows():
    """Get workflows"""
    return {
        "workflows": MOCK_WORKFLOWS
    }

@app.get("/api/system/metrics")
async def get_system_metrics():
    """Get system metrics"""
    return {
        "cpu": {"value": 45.2, "unit": "%", "status": "normal"},
        "memory": {"value": 67.8, "unit": "%", "status": "normal"},
        "disk": {"value": 34.1, "unit": "%", "status": "normal"},
        "network": {"value": 12.5, "unit": "MB/s", "status": "normal"}
    }

@app.get("/api/integrations/status")
async def get_integration_status():
    """Get integration status"""
    return {
        "integrations": [
            {"name": "GitHub", "status": "connected", "last_sync": "2024-01-01T12:00:00Z"},
            {"name": "Slack", "status": "connected", "last_sync": "2024-01-01T11:30:00Z"},
            {"name": "JIRA", "status": "disconnected", "last_sync": null}
        ]
    }

@app.get("/api/activity/recent")
async def get_recent_activity():
    """Get recent activity"""
    return {
        "activities": [
            {
                "id": "1",
                "type": "agent_execution",
                "message": "Code generator completed task",
                "timestamp": "2024-01-01T12:00:00Z",
                "status": "success"
            },
            {
                "id": "2",
                "type": "workflow_started",
                "message": "Testing pipeline initiated",
                "timestamp": "2024-01-01T11:45:00Z",
                "status": "info"
            }
        ]
    }

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    """Chat endpoint with mock AI response"""
    # Simple mock response
    mock_response = f"Mock AI Response to: {request.content[:50]}..."
    
    return ChatResponse(
        content=mock_response,
        provider="mock",
        tokens_used=len(request.content.split()),
        generation_time=0.5
    )

@app.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket):
    """WebSocket endpoint for real-time chat"""
    await websocket.accept()
    logger.info("WebSocket client connected")
    
    try:
        while True:
            data = await websocket.receive_json()
            
            # Mock response
            response = {
                "content": f"Mock response to: {data.get('content', 'No content')}",
                "provider": "mock",
                "tokens_used": 50,
                "generation_time": 0.3,
                "type": "response"
            }
            
            await websocket.send_json(response)
            
    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected")

if __name__ == "__main__":
    print("🚀 Starting reVoAgent Development Server...")
    print("📡 Backend API: http://localhost:8000")
    print("📚 API Docs: http://localhost:8000/docs")
    print("🔧 Health Check: http://localhost:8000/health")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
EOF

echo "✅ Simplified backend server created (simple_dev_server.py)"

# Step 6: Create startup script
cat > start_dev.sh << 'EOF'
#!/bin/bash
# Development startup script

echo "🚀 Starting reVoAgent Development Environment..."

# Function to check if port is free
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port $1 is already in use"
        return 1
    else
        return 0
    fi
}

# Check ports
echo "🔍 Checking ports..."
if ! check_port 8000; then
    echo "❌ Backend port 8000 in use. Please stop other services or change port."
    exit 1
fi

if ! check_port 12000; then
    echo "❌ Frontend port 12000 in use. Please stop other services or change port."
    exit 1
fi

# Start backend in background
echo "🖥️  Starting backend server on port 8000..."
python simple_dev_server.py &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend on port 12000..."
cd frontend
npm run dev &
FRONTEND_PID=$!

# Show status
echo "✅ Development environment started!"
echo "📡 Backend: http://localhost:8000"
echo "🎨 Frontend: http://localhost:12000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap 'kill $BACKEND_PID $FRONTEND_PID; exit' INT
wait
EOF

chmod +x start_dev.sh

echo "✅ Startup script created (start_dev.sh)"

# Step 7: Show final instructions
echo ""
echo "🎉 Setup Complete! To start development:"
echo ""
echo "1. Start the development environment:"
echo "   ./start_dev.sh"
echo ""
echo "2. Or manually:"
echo "   # Terminal 1 (Backend):"
echo "   python simple_dev_server.py"
echo ""
echo "   # Terminal 2 (Frontend):"
echo "   cd frontend && npm run dev"
echo ""
echo "3. Access the application:"
echo "   🎨 Frontend: http://localhost:12000"
echo "   📡 Backend API: http://localhost:8000"
echo "   📚 API Documentation: http://localhost:8000/docs"
echo ""
echo "✅ Ready to code! Your reVoAgent development environment is set up."
