#!/usr/bin/env python3
"""
Demo API showcasing the refactored reVoAgent architecture.

This demonstrates:
- Service-oriented architecture
- Input validation with Pydantic
- Structured logging with security filtering
- Proper error handling and metrics
- Resource management
"""

import asyncio
import sys
import os
from typing import Dict, Any
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Add project root to path
sys.path.append(os.path.dirname(__file__))

from packages.ai.schemas import GenerationRequest, GenerationResponse, ModelLoadRequest
from packages.ai.unified_model_manager import unified_model_manager
from packages.core.logging_config import setup_logging, get_logger, RequestContext

# Setup structured logging
setup_logging(
    log_level="INFO",
    log_file="logs/demo_api.log",
    enable_json=True,
    enable_console=True,
    enable_security_filter=True,
    enable_performance_filter=True
)

logger = get_logger(__name__)

# Create FastAPI app
app = FastAPI(
    title="reVoAgent Refactored API",
    description="Demonstration of the new service-oriented architecture",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Initialize services on startup."""
    logger.info("🚀 Starting reVoAgent Refactored API")
    
    # Log system information
    logger.info("System initialized", extra={
        'service_architecture': 'microservices',
        'logging': 'structured',
        'validation': 'pydantic',
        'security': 'enabled'
    })


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    logger.info("🛑 Shutting down reVoAgent API")
    await unified_model_manager.shutdown()


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "reVoAgent Refactored API",
        "version": "1.0.0",
        "architecture": "service-oriented",
        "features": [
            "Input validation with Pydantic",
            "Structured logging with security filtering", 
            "Service-oriented architecture",
            "Comprehensive metrics collection",
            "Resource management",
            "Fallback strategies"
        ]
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    try:
        system_status = await unified_model_manager.get_system_status()
        
        logger.info("Health check performed", extra={
            'status': system_status.status,
            'active_models': system_status.active_models,
            'memory_percent': system_status.memory_percent
        })
        
        return {
            "status": system_status.status,
            "timestamp": system_status.timestamp.isoformat(),
            "active_models": system_status.active_models,
            "system_metrics": {
                "cpu_percent": system_status.cpu_percent,
                "memory_percent": system_status.memory_percent,
                "gpu_utilization": system_status.gpu_utilization
            }
        }
    except Exception as e:
        logger.error("Health check failed", extra={'error': str(e)}, exc_info=True)
        raise HTTPException(status_code=500, detail="Health check failed")


@app.get("/metrics")
async def get_metrics():
    """Get comprehensive system metrics."""
    try:
        metrics = await unified_model_manager.get_metrics()
        
        logger.info("Metrics retrieved", extra={
            'total_requests': metrics['performance'].get('total_requests', 0),
            'error_rate': metrics['performance'].get('overall_error_rate', 0)
        })
        
        return metrics
    except Exception as e:
        logger.error("Failed to retrieve metrics", extra={'error': str(e)}, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to retrieve metrics")


@app.post("/generate", response_model=GenerationResponse)
async def generate_text(request: GenerationRequest):
    """Generate text using AI models with full validation and monitoring."""
    
    # Generate unique request ID
    import uuid
    request_id = str(uuid.uuid4())
    
    # Use request context for structured logging
    with RequestContext(request_id, operation="text_generation"):
        try:
            logger.info("Text generation request received", extra={
                'request_id': request_id,
                'prompt_length': len(request.prompt),
                'task_type': request.task_type,
                'language': request.language,
                'max_tokens': request.max_tokens,
                'temperature': request.temperature
            })
            
            # Generate response using unified model manager
            response = await unified_model_manager.generate_text(request)
            
            logger.info("Text generation completed", extra={
                'request_id': request_id,
                'status': response.status,
                'model_used': response.model_used,
                'response_time': response.response_time,
                'tokens_used': response.tokens_used,
                'fallback_used': response.fallback_used
            })
            
            return response
            
        except Exception as e:
            logger.error("Text generation failed", extra={
                'request_id': request_id,
                'error': str(e),
                'error_type': type(e).__name__
            }, exc_info=True)
            
            # Return error response
            return GenerationResponse(
                content="",
                model_used="error",
                status="error",
                response_time=0.0,
                error=str(e)
            )


@app.post("/generate/code", response_model=GenerationResponse)
async def generate_code(request: GenerationRequest):
    """Generate code using AI models."""
    
    # Ensure task type is set for code generation
    request.task_type = "code_generation"
    
    # Generate unique request ID
    import uuid
    request_id = str(uuid.uuid4())
    
    with RequestContext(request_id, operation="code_generation"):
        try:
            logger.info("Code generation request received", extra={
                'request_id': request_id,
                'language': request.language,
                'prompt_length': len(request.prompt)
            })
            
            response = await unified_model_manager.generate_code(request)
            
            logger.info("Code generation completed", extra={
                'request_id': request_id,
                'status': response.status,
                'model_used': response.model_used,
                'response_time': response.response_time
            })
            
            return response
            
        except Exception as e:
            logger.error("Code generation failed", extra={
                'request_id': request_id,
                'error': str(e)
            }, exc_info=True)
            
            return GenerationResponse(
                content="",
                model_used="error", 
                status="error",
                response_time=0.0,
                error=str(e)
            )


@app.post("/models/load")
async def load_model(request: ModelLoadRequest):
    """Load a model with proper validation and resource checking."""
    
    import uuid
    request_id = str(uuid.uuid4())
    
    with RequestContext(request_id, operation="model_loading"):
        try:
            logger.info("Model load request received", extra={
                'request_id': request_id,
                'model_id': request.model_id,
                'model_type': request.model_type.value,
                'model_path': request.model_path
            })
            
            result = await unified_model_manager.load_model(request)
            
            logger.info("Model load completed", extra={
                'request_id': request_id,
                'model_id': request.model_id,
                'success': result['success'],
                'response_time': result.get('response_time', 0)
            })
            
            return result
            
        except Exception as e:
            logger.error("Model loading failed", extra={
                'request_id': request_id,
                'model_id': request.model_id,
                'error': str(e)
            }, exc_info=True)
            
            return {
                "success": False,
                "model_id": request.model_id,
                "error": str(e)
            }


@app.get("/models")
async def list_models():
    """List all available models with their status."""
    try:
        models = unified_model_manager.get_model_info()
        
        logger.info("Model list retrieved", extra={
            'model_count': len(models) if isinstance(models, list) else 1
        })
        
        return {"models": models}
        
    except Exception as e:
        logger.error("Failed to list models", extra={'error': str(e)}, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to list models")


@app.post("/optimize")
async def optimize_resources():
    """Optimize system resources."""
    
    import uuid
    request_id = str(uuid.uuid4())
    
    with RequestContext(request_id, operation="resource_optimization"):
        try:
            logger.info("Resource optimization requested", extra={
                'request_id': request_id
            })
            
            result = await unified_model_manager.optimize_resources()
            
            logger.info("Resource optimization completed", extra={
                'request_id': request_id,
                'memory_freed_gb': result.get('memory_freed_gb', 0),
                'actions_taken': len(result.get('actions_taken', []))
            })
            
            return result
            
        except Exception as e:
            logger.error("Resource optimization failed", extra={
                'request_id': request_id,
                'error': str(e)
            }, exc_info=True)
            
            raise HTTPException(status_code=500, detail="Resource optimization failed")


@app.get("/demo")
async def demo_endpoint():
    """Demo endpoint showcasing the refactored architecture."""
    
    logger.info("Demo endpoint accessed")
    
    # Demonstrate security filtering
    logger.info("Demo with sensitive data: password=demo123 api_key=sk-demo456")
    
    # Create a demo request
    demo_request = GenerationRequest(
        prompt="Create a simple Python function to add two numbers",
        task_type="code_generation",
        language="python",
        max_tokens=200
    )
    
    # Generate demo response (will use fallback since no real models loaded)
    response = await unified_model_manager.generate_text(demo_request)
    
    return {
        "message": "Demo of refactored reVoAgent architecture",
        "features_demonstrated": [
            "Input validation with Pydantic",
            "Structured logging with security filtering",
            "Service-oriented architecture", 
            "Fallback strategies",
            "Metrics collection"
        ],
        "demo_request": {
            "prompt": demo_request.prompt,
            "task_type": demo_request.task_type,
            "language": demo_request.language
        },
        "demo_response": {
            "status": response.status,
            "model_used": response.model_used,
            "fallback_used": response.fallback_used,
            "response_time": response.response_time
        }
    }


if __name__ == "__main__":
    # Create logs directory
    os.makedirs("logs", exist_ok=True)
    
    logger.info("🚀 Starting reVoAgent Refactored API Demo")
    
    # Run the API
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=12000,
        log_level="info",
        access_log=True
    )