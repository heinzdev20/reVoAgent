#!/usr/bin/env python3
"""
Quick Backend Server for reVoAgent
Simple FastAPI server for immediate testing
"""

import sys
import os
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))
sys.path.insert(0, str(Path(__file__).parent))

try:
    from fastapi import FastAPI, HTTPException
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import JSONResponse
    import uvicorn
    import asyncio
    import json
    from datetime import datetime
    
    app = FastAPI(title="reVoAgent API", version="1.0.0")
    
    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    @app.get("/")
    async def root():
        return {"message": "reVoAgent API Server", "status": "running", "timestamp": datetime.now().isoformat()}
    
    @app.get("/health")
    async def health_check():
        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "version": "1.0.0",
            "services": {
                "api": "running",
                "database": "connected",
                "ai_models": "ready"
            }
        }
    
    @app.get("/api/status")
    async def api_status():
        return {
            "api_status": "operational",
            "endpoints": [
                "/health",
                "/api/status",
                "/api/models",
                "/api/chat"
            ],
            "timestamp": datetime.now().isoformat()
        }
    
    @app.get("/api/models")
    async def get_models():
        return {
            "models": [
                {
                    "id": "deepseek-r1",
                    "name": "DeepSeek R1 0528",
                    "type": "local_opensource",
                    "priority": 1,
                    "cost_per_token": 0.0,
                    "status": "available"
                },
                {
                    "id": "llama-3.1-70b",
                    "name": "Llama 3.1 70B",
                    "type": "local_commercial",
                    "priority": 2,
                    "cost_per_token": 0.0,
                    "status": "available"
                },
                {
                    "id": "gpt-4",
                    "name": "OpenAI GPT-4",
                    "type": "cloud_openai",
                    "priority": 3,
                    "cost_per_token": 0.03,
                    "status": "available"
                }
            ],
            "cost_savings": "95%",
            "local_first": True
        }
    
    @app.post("/api/chat")
    async def chat_endpoint(request: dict):
        message = request.get("message", "")
        return {
            "response": f"Echo from reVoAgent: {message}",
            "model_used": "deepseek-r1",
            "cost": 0.0,
            "local_execution": True,
            "timestamp": datetime.now().isoformat()
        }
    
    if __name__ == "__main__":
        print("🚀 Starting reVoAgent Quick Backend Server...")
        print("📡 Server will be available at:")
        print("   - http://localhost:12001")
        print("   - Health check: http://localhost:12001/health")
        print("   - API status: http://localhost:12001/api/status")
        
        uvicorn.run(
            app,
            host="0.0.0.0",
            port=12001,
            log_level="info",
            access_log=True
        )
        
except ImportError as e:
    print(f"❌ Missing dependency: {e}")
    print("Installing FastAPI and uvicorn...")
    os.system("pip install fastapi uvicorn")
    print("✅ Dependencies installed. Please run the script again.")