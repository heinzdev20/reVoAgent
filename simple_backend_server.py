#!/usr/bin/env python3
"""
Simple Backend Server for Health Check Validation
Provides basic API endpoints to validate frontend-backend integration
"""

import asyncio
import json
import time
from datetime import datetime
from typing import Dict, Any
from pathlib import Path
import logging

# Try to import FastAPI, fallback to simple HTTP server
try:
    from fastapi import FastAPI, HTTPException
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import JSONResponse
    import uvicorn
    FASTAPI_AVAILABLE = True
except ImportError:
    from http.server import HTTPServer, BaseHTTPRequestHandler
    import socketserver
    FASTAPI_AVAILABLE = False

logger = logging.getLogger(__name__)

if FASTAPI_AVAILABLE:
    # FastAPI implementation
    app = FastAPI(title="reVoAgent Backend API", version="1.0.0")
    
    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    @app.get("/health")
    async def health_check():
        """Health check endpoint"""
        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "service": "reVoAgent Backend API",
            "version": "1.0.0"
        }
    
    @app.get("/")
    async def root():
        """Root endpoint"""
        return {
            "message": "🚀 reVoAgent Backend API",
            "status": "running",
            "endpoints": ["/health", "/api/models", "/api/agents", "/api/chat"]
        }
    
    @app.get("/api/models")
    async def get_models():
        """Get available AI models"""
        return {
            "models": [
                {
                    "id": "deepseek_r1_0528",
                    "name": "DeepSeek R1 0528",
                    "type": "local",
                    "cost_per_request": 0.0,
                    "status": "available"
                },
                {
                    "id": "llama_3_1_70b",
                    "name": "Llama 3.1 70B",
                    "type": "local", 
                    "cost_per_request": 0.0,
                    "status": "available"
                },
                {
                    "id": "openai_gpt4",
                    "name": "OpenAI GPT-4",
                    "type": "cloud",
                    "cost_per_request": 0.03,
                    "status": "available"
                }
            ],
            "cost_savings": "95%+",
            "local_models_active": True
        }
    
    @app.get("/api/agents")
    async def get_agents():
        """Get available agents"""
        return {
            "agents": [
                {"id": "code-analyst", "name": "Code Analyst", "status": "active"},
                {"id": "debug-detective", "name": "Debug Detective", "status": "active"},
                {"id": "workflow-manager", "name": "Workflow Manager", "status": "active"},
                {"id": "multi-agent-chat", "name": "Multi-Agent Chat", "status": "active"}
            ],
            "total_agents": 20,
            "active_agents": 4
        }
    
    @app.post("/api/chat")
    async def chat_endpoint(message: dict):
        """Chat endpoint for testing"""
        return {
            "response": f"Echo: {message.get('content', 'No message')}",
            "model_used": "deepseek_r1_0528",
            "cost": 0.0,
            "timestamp": datetime.now().isoformat()
        }
    
    def start_fastapi_server(port: int = 8000):
        """Start FastAPI server"""
        print(f"🚀 Starting reVoAgent Backend API on port {port}")
        uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")

else:
    # Simple HTTP server fallback
    class SimpleAPIHandler(BaseHTTPRequestHandler):
        def do_GET(self):
            if self.path == "/health":
                response = {
                    "status": "healthy",
                    "timestamp": datetime.now().isoformat(),
                    "service": "reVoAgent Backend API (Simple)",
                    "version": "1.0.0"
                }
            elif self.path == "/":
                response = {
                    "message": "🚀 reVoAgent Backend API (Simple)",
                    "status": "running",
                    "endpoints": ["/health"]
                }
            else:
                self.send_response(404)
                self.end_headers()
                return
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())
        
        def log_message(self, format, *args):
            # Suppress default logging
            pass
    
    def start_simple_server(port: int = 8000):
        """Start simple HTTP server"""
        print(f"🚀 Starting reVoAgent Backend API (Simple) on port {port}")
        with socketserver.TCPServer(("", port), SimpleAPIHandler) as httpd:
            print(f"✅ Server running at http://localhost:{port}")
            httpd.serve_forever()

def main():
    """Main function"""
    port = 8000
    
    if FASTAPI_AVAILABLE:
        start_fastapi_server(port)
    else:
        start_simple_server(port)

if __name__ == "__main__":
    main()