#!/usr/bin/env python3
"""
🧠 Perfect Recall Engine Production Entrypoint

Starts the Perfect Recall Engine with production configuration,
monitoring, and health checks.
"""

import asyncio
import os
import sys
import logging
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from prometheus_client import start_http_server, Counter, Histogram, Gauge
import signal

from revoagent.engines.perfect_recall import PerfectRecallEngine

# Configure logging
logging.basicConfig(
    level=getattr(logging, os.getenv('LOG_LEVEL', 'INFO')),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Prometheus metrics
REQUESTS_TOTAL = Counter('perfect_recall_requests_total', 'Total requests', ['method', 'endpoint'])
REQUEST_DURATION = Histogram('perfect_recall_request_duration_seconds', 'Request duration')
MEMORY_USAGE = Gauge('perfect_recall_memory_usage_bytes', 'Memory usage in bytes')
ACTIVE_SESSIONS = Gauge('perfect_recall_active_sessions', 'Number of active sessions')

class PerfectRecallService:
    def __init__(self):
        self.app = FastAPI(
            title="Perfect Recall Engine",
            description="Sub-100ms memory retrieval and context management",
            version="2.0.0"
        )
        self.engine = None
        self.setup_middleware()
        self.setup_routes()
        
    def setup_middleware(self):
        """Setup FastAPI middleware"""
        self.app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
    
    def setup_routes(self):
        """Setup API routes"""
        
        @self.app.on_event("startup")
        async def startup_event():
            """Initialize engine on startup"""
            try:
                config = {
                    'redis_url': os.getenv('REDIS_URL', 'redis://redis-cluster-1:6379'),
                    'chromadb_host': os.getenv('CHROMADB_HOST', 'chromadb-cluster'),
                    'memory_limit': os.getenv('MEMORY_LIMIT', '3G'),
                    'retrieval_timeout': float(os.getenv('RETRIEVAL_TIMEOUT', '0.05'))  # 50ms
                }
                
                self.engine = PerfectRecallEngine(config)
                success = await self.engine.initialize()
                
                if not success:
                    logger.error("Failed to initialize Perfect Recall Engine")
                    raise RuntimeError("Engine initialization failed")
                
                logger.info("🧠 Perfect Recall Engine started successfully")
                
            except Exception as e:
                logger.error(f"Startup failed: {e}")
                raise
        
        @self.app.on_event("shutdown")
        async def shutdown_event():
            """Cleanup on shutdown"""
            if self.engine:
                await self.engine.cleanup()
            logger.info("🧠 Perfect Recall Engine shutdown complete")
        
        @self.app.get("/health")
        async def health_check():
            """Health check endpoint"""
            if not self.engine:
                raise HTTPException(status_code=503, detail="Engine not initialized")
            
            try:
                status = await self.engine.get_engine_status()
                return {
                    "status": "healthy",
                    "engine": "perfect_recall",
                    "version": "2.0.0",
                    "metrics": {
                        "memory_usage_mb": status.get('memory_usage_mb', 0),
                        "total_contexts": status.get('total_contexts', 0),
                        "avg_retrieval_time_ms": status.get('avg_retrieval_time_ms', 0)
                    }
                }
            except Exception as e:
                logger.error(f"Health check failed: {e}")
                raise HTTPException(status_code=503, detail=f"Health check failed: {e}")
        
        @self.app.get("/ready")
        async def readiness_check():
            """Readiness check for Kubernetes"""
            if not self.engine:
                raise HTTPException(status_code=503, detail="Engine not ready")
            
            return {"status": "ready", "engine": "perfect_recall"}
        
        @self.app.post("/api/v1/recall/store")
        async def store_context(request: dict):
            """Store context in memory"""
            REQUESTS_TOTAL.labels(method='POST', endpoint='/store').inc()
            
            with REQUEST_DURATION.time():
                try:
                    context_id = await self.engine.store_context(
                        content=request['content'],
                        context_type=request.get('context_type', 'general'),
                        session_id=request['session_id'],
                        **request.get('metadata', {})
                    )
                    
                    return {
                        "success": True,
                        "context_id": context_id,
                        "message": "Context stored successfully"
                    }
                    
                except Exception as e:
                    logger.error(f"Store context failed: {e}")
                    raise HTTPException(status_code=500, detail=str(e))
        
        @self.app.post("/api/v1/recall/retrieve")
        async def retrieve_context(request: dict):
            """Retrieve context from memory"""
            REQUESTS_TOTAL.labels(method='POST', endpoint='/retrieve').inc()
            
            with REQUEST_DURATION.time():
                try:
                    from revoagent.engines.perfect_recall.engine import RecallRequest
                    
                    recall_request = RecallRequest(
                        query=request['query'],
                        session_id=request.get('session_id'),
                        limit=request.get('limit', 10)
                    )
                    
                    result = await self.engine.retrieve_fast(recall_request)
                    
                    return {
                        "success": True,
                        "memories": [
                            {
                                "id": memory.id,
                                "content": memory.content,
                                "context_type": memory.context_type,
                                "timestamp": memory.timestamp.isoformat(),
                                "relevance_score": getattr(memory, 'relevance_score', 0.8)
                            }
                            for memory in result.memories
                        ],
                        "query_time_ms": result.query_time_ms,
                        "context_summary": result.context_summary
                    }
                    
                except Exception as e:
                    logger.error(f"Retrieve context failed: {e}")
                    raise HTTPException(status_code=500, detail=str(e))
        
        @self.app.get("/metrics")
        async def get_metrics():
            """Prometheus metrics endpoint"""
            # Update metrics
            if self.engine:
                status = await self.engine.get_engine_status()
                MEMORY_USAGE.set(status.get('memory_usage_mb', 0) * 1024 * 1024)
                ACTIVE_SESSIONS.set(status.get('active_sessions', 0))
            
            return {"message": "Metrics available at /metrics"}

def signal_handler(signum, frame):
    """Handle shutdown signals"""
    logger.info(f"Received signal {signum}, shutting down...")
    sys.exit(0)

async def main():
    """Main entry point"""
    # Setup signal handlers
    signal.signal(signal.SIGTERM, signal_handler)
    signal.signal(signal.SIGINT, signal_handler)
    
    # Start Prometheus metrics server
    metrics_port = int(os.getenv('METRICS_PORT', 9090))
    start_http_server(metrics_port)
    logger.info(f"Prometheus metrics server started on port {metrics_port}")
    
    # Create and start service
    service = PerfectRecallService()
    
    # Start FastAPI server
    config = uvicorn.Config(
        service.app,
        host="0.0.0.0",
        port=8001,
        log_level=os.getenv('LOG_LEVEL', 'info').lower(),
        access_log=True
    )
    
    server = uvicorn.Server(config)
    await server.serve()

if __name__ == "__main__":
    asyncio.run(main())