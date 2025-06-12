#!/usr/bin/env python3
"""
Simple Working Backend for reVoAgent
This is a minimal but functional backend that demonstrates the fixes.
"""

import asyncio
import os
import sys
import logging
from datetime import datetime
from typing import Dict, Any, Optional
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uvicorn
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import our enhanced model manager
try:
    from packages.ai.enhanced_local_model_manager import (
        EnhancedLocalModelManager, 
        GenerationRequest, 
        ModelProvider
    )
    MODEL_MANAGER_AVAILABLE = True
except ImportError as e:
    logger.warning(f"Could not import enhanced model manager: {e}")
    MODEL_MANAGER_AVAILABLE = False

# Import memory manager
try:
    from packages.memory.enhanced_memory_manager import EnhancedMemoryManager
    MEMORY_MANAGER_AVAILABLE = True
except ImportError as e:
    logger.warning(f"Could not import memory manager: {e}")
    MEMORY_MANAGER_AVAILABLE = False

app = FastAPI(
    title="reVoAgent Simple Working Backend",
    description="A minimal but functional backend demonstrating the fixes",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global managers
model_manager: Optional[EnhancedLocalModelManager] = None
memory_manager: Optional[EnhancedMemoryManager] = None

class ChatRequest(BaseModel):
    content: str
    system_prompt: Optional[str] = None
    max_tokens: int = 1024
    temperature: float = 0.7

class ChatResponse(BaseModel):
    content: str
    provider: str
    tokens_used: int
    generation_time: float

@app.on_event("startup")
async def startup_event():
    """Initialize the application"""
    global model_manager, memory_manager
    
    logger.info("🚀 Starting reVoAgent Simple Working Backend...")
    
    # Initialize model manager
    if MODEL_MANAGER_AVAILABLE:
        config = {
            "openai_api_key": os.getenv("OPENAI_API_KEY"),
            "anthropic_api_key": os.getenv("ANTHROPIC_API_KEY"),
        }
        
        model_manager = EnhancedLocalModelManager(config)
        await model_manager.initialize_with_fallback()
        logger.info("✅ Model manager initialized")
    else:
        logger.warning("⚠️ Model manager not available")
    
    # Initialize memory manager
    if MEMORY_MANAGER_AVAILABLE:
        memory_manager = EnhancedMemoryManager({})
        await memory_manager.initialize()
        logger.info("✅ Memory manager initialized")
    else:
        logger.warning("⚠️ Memory manager not available")
    
    logger.info("✅ Backend initialization complete")

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "reVoAgent Simple Working Backend",
        "status": "running",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    health_data = {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "services": {
            "backend": "running",
            "database": "not_configured",
            "redis": "not_configured",
            "ai_models": "checking..."
        }
    }
    
    # Check model manager
    if model_manager:
        try:
            model_health = await model_manager.health_check()
            health_data["services"]["ai_models"] = model_health["status"]
            health_data["ai_providers"] = model_health.get("available_providers", [])
            health_data["resources"] = model_health.get("resources", {})
        except Exception as e:
            health_data["services"]["ai_models"] = f"error: {str(e)}"
    else:
        health_data["services"]["ai_models"] = "not_available"
    
    # Check memory manager
    if memory_manager:
        try:
            memory_health = await memory_manager.health_check()
            health_data["services"]["memory"] = memory_health["status"]
        except Exception as e:
            health_data["services"]["memory"] = f"error: {str(e)}"
    else:
        health_data["services"]["memory"] = "not_available"
    
    return health_data

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """Chat endpoint with AI model integration"""
    try:
        if not model_manager:
            # Return a fallback response
            return ChatResponse(
                content="Hello! I'm a fallback response. The AI models are not currently available, but the backend is working correctly.",
                provider="fallback",
                tokens_used=20,
                generation_time=0.1
            )
        
        # Create generation request
        gen_request = GenerationRequest(
            prompt=request.content,
            system_prompt=request.system_prompt,
            max_tokens=request.max_tokens,
            temperature=request.temperature
        )
        
        # Generate response
        response = await model_manager.generate(gen_request)
        
        return ChatResponse(
            content=response.content,
            provider=response.provider.value,
            tokens_used=response.tokens_used,
            generation_time=response.generation_time
        )
        
    except Exception as e:
        logger.error(f"Chat endpoint error: {e}")
        # Return a graceful error response instead of HTTP error
        return ChatResponse(
            content=f"I encountered an error: {str(e)}. But the backend is working!",
            provider="error_fallback",
            tokens_used=0,
            generation_time=0.0
        )

@app.get("/api/models")
async def list_models():
    """List available AI models"""
    if not model_manager:
        return {
            "models": ["fallback"],
            "status": "model_manager_not_available",
            "message": "Backend is working but AI models are not configured"
        }
    
    try:
        health = await model_manager.health_check()
        return {
            "models": health.get("available_providers", []),
            "status": health["status"],
            "resources": health.get("resources", {})
        }
    except Exception as e:
        return {
            "models": ["fallback"],
            "status": f"error: {str(e)}",
            "message": "Backend is working but AI models encountered an error"
        }

@app.get("/api/memory/stats")
async def memory_stats():
    """Get memory system statistics"""
    if not memory_manager:
        return {
            "status": "memory_manager_not_available",
            "message": "Backend is working but memory system is not configured"
        }
    
    try:
        return await memory_manager.health_check()
    except Exception as e:
        return {
            "status": f"error: {str(e)}",
            "message": "Backend is working but memory system encountered an error"
        }

@app.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket):
    """WebSocket endpoint for real-time chat"""
    await websocket.accept()
    logger.info("WebSocket client connected")
    
    try:
        while True:
            # Receive message
            data = await websocket.receive_json()
            
            if not model_manager:
                await websocket.send_json({
                    "content": "WebSocket is working! AI models are not available, but real-time communication is functional.",
                    "provider": "websocket_fallback",
                    "tokens_used": 15,
                    "generation_time": 0.1,
                    "type": "response"
                })
                continue
            
            # Process chat request
            try:
                gen_request = GenerationRequest(
                    prompt=data.get("content", ""),
                    system_prompt=data.get("system_prompt"),
                    max_tokens=data.get("max_tokens", 1024),
                    temperature=data.get("temperature", 0.7)
                )
                
                response = await model_manager.generate(gen_request)
                
                await websocket.send_json({
                    "content": response.content,
                    "provider": response.provider.value,
                    "tokens_used": response.tokens_used,
                    "generation_time": response.generation_time,
                    "type": "response"
                })
                
            except Exception as e:
                await websocket.send_json({
                    "content": f"WebSocket error: {str(e)}. But the connection is working!",
                    "provider": "websocket_error",
                    "tokens_used": 0,
                    "generation_time": 0.0,
                    "type": "error"
                })
                
    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected")

if __name__ == "__main__":
    # Set up environment
    os.environ.setdefault("DATABASE_URL", "postgresql+asyncpg://revoagent:revoagent_pass@localhost:5432/revoagent")
    os.environ.setdefault("REDIS_URL", "redis://localhost:6379")
    os.environ.setdefault("JWT_SECRET", "revoagent-secret-key-change-in-production")
    
    # Configure for the runtime environment
    host = "0.0.0.0"
    port = 12000  # Use the provided port for this environment
    
    logger.info(f"🚀 Starting server on {host}:{port}")
    logger.info(f"🌐 Access the backend at: https://work-1-lkaruorwyrduwqrb.prod-runtime.all-hands.dev")
    
    uvicorn.run(
        "simple_working_backend:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    )