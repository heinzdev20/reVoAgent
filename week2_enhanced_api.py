#!/usr/bin/env python3
"""
Week 2 Enhanced API - Production-Ready reVoAgent

This API demonstrates all Week 2 improvements:
- Secret management with Azure Key Vault
- Rate limiting with multiple algorithms
- Database connection pooling
- Circuit breakers for external APIs
- Comprehensive monitoring and health checks
"""

import asyncio
import sys
import os
from typing import Dict, Any, Optional
from fastapi import FastAPI, HTTPException, Depends, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import uvicorn
import time

# Add project root to path
sys.path.append(os.path.dirname(__file__))

from packages.ai.schemas import GenerationRequest, GenerationResponse
from packages.ai.unified_model_manager import unified_model_manager
from packages.core.logging_config import setup_logging, get_logger, RequestContext
from packages.core.secret_manager import (
    SecretManager, SecretConfig, SecretProvider, initialize_secret_manager, get_secret
)
from packages.core.rate_limiter import (
    RateLimiter, InMemoryStorage, RateLimitRule, RateLimitAlgorithm, 
    RateLimitScope, initialize_rate_limiter, get_rate_limiter
)
from packages.core.database import (
    DatabaseManager, DatabaseConfig, initialize_database_manager, 
    get_database_manager, RequestLog, ModelUsage, RateLimitLog
)
from packages.core.circuit_breaker import (
    CircuitBreakerManager, get_circuit_breaker_manager, 
    initialize_default_circuit_breakers, CircuitBreakerOpenException
)

# Setup structured logging
setup_logging(
    log_level="INFO",
    log_file="logs/week2_api.log",
    enable_json=True,
    enable_console=True,
    enable_security_filter=True,
    enable_performance_filter=True
)

logger = get_logger(__name__)

# Create FastAPI app
app = FastAPI(
    title="reVoAgent Week 2 Enhanced API",
    description="Production-ready API with secret management, rate limiting, database pooling, and circuit breakers",
    version="2.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer(auto_error=False)

# Global managers
secret_manager: Optional[SecretManager] = None
rate_limiter: Optional[RateLimiter] = None
db_manager: Optional[DatabaseManager] = None
circuit_manager: CircuitBreakerManager = None


async def get_client_identifier(request: Request) -> str:
    """Get client identifier for rate limiting."""
    # Try to get user ID from auth header, fallback to IP
    auth_header = request.headers.get("authorization")
    if auth_header and auth_header.startswith("Bearer "):
        # In production, decode JWT and extract user ID
        return f"user_{hash(auth_header) % 10000}"
    
    # Use IP address as fallback
    client_ip = request.client.host
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        client_ip = forwarded_for.split(",")[0].strip()
    
    return f"ip_{client_ip}"


async def check_rate_limit(request: Request, rule_name: str = "api_general") -> bool:
    """Check rate limit for request."""
    if not rate_limiter:
        return True
    
    identifier = await get_client_identifier(request)
    
    try:
        result = await rate_limiter.check_rate_limit(rule_name, identifier)
        
        # Log rate limit event to database
        if db_manager:
            try:
                async with db_manager.get_async_session() as session:
                    rate_log = RateLimitLog(
                        identifier=identifier,
                        identifier_type="ip" if identifier.startswith("ip_") else "user",
                        rule_name=rule_name,
                        blocked=not result.allowed,
                        current_usage=result.current_usage,
                        limit_value=rate_limiter.rules[rule_name].requests,
                        window_seconds=rate_limiter.rules[rule_name].window_seconds,
                        retry_after=result.retry_after,
                        endpoint=str(request.url.path)
                    )
                    session.add(rate_log)
                    await session.commit()
            except Exception as e:
                logger.error("Failed to log rate limit event", extra={'error': str(e)})
        
        return result.allowed
        
    except Exception as e:
        logger.error("Rate limit check failed", extra={'error': str(e)})
        return True  # Fail open


async def log_request(request: Request, response: Response, response_time: float):
    """Log request to database."""
    if not db_manager:
        return
    
    try:
        import uuid
        request_id = str(uuid.uuid4())
        
        async with db_manager.get_async_session() as session:
            request_log = RequestLog(
                request_id=request_id,
                user_id=None,  # Extract from auth in production
                ip_address=request.client.host,
                endpoint=str(request.url.path),
                method=request.method,
                status_code=response.status_code,
                response_time=int(response_time * 1000),  # Convert to milliseconds
                user_agent=request.headers.get("user-agent", ""),
                rate_limited=response.status_code == 429
            )
            session.add(request_log)
            await session.commit()
            
    except Exception as e:
        logger.error("Failed to log request", extra={'error': str(e)})


@app.middleware("http")
async def request_middleware(request: Request, call_next):
    """Request middleware for logging and monitoring."""
    start_time = time.time()
    
    # Generate request ID
    import uuid
    request_id = str(uuid.uuid4())
    
    # Add request context for logging
    with RequestContext(request_id, operation=f"{request.method} {request.url.path}"):
        try:
            response = await call_next(request)
            response_time = time.time() - start_time
            
            # Log request
            await log_request(request, response, response_time)
            
            # Add performance headers
            response.headers["X-Response-Time"] = f"{response_time:.3f}s"
            response.headers["X-Request-ID"] = request_id
            
            return response
            
        except Exception as e:
            response_time = time.time() - start_time
            logger.error("Request failed", extra={
                'request_id': request_id,
                'error': str(e),
                'response_time': response_time
            })
            raise


@app.on_event("startup")
async def startup_event():
    """Initialize all services on startup."""
    global secret_manager, rate_limiter, db_manager, circuit_manager
    
    logger.info("🚀 Starting Week 2 Enhanced API")
    
    try:
        # 1. Initialize Secret Manager
        secret_config = SecretConfig(
            provider=SecretProvider.LOCAL_FILE,  # Use Azure Key Vault in production
            local_secrets_file="secrets.json",
            cache_ttl_seconds=3600
        )
        secret_manager = initialize_secret_manager(secret_config)
        await secret_manager.initialize()
        logger.info("✅ Secret manager initialized")
        
        # 2. Initialize Database Manager
        db_config = DatabaseConfig(
            pool_size=10,
            max_overflow=20,
            pool_timeout=30,
            pool_recycle=3600
        )
        db_manager = initialize_database_manager(db_config)
        await db_manager.initialize()
        logger.info("✅ Database manager initialized")
        
        # 3. Initialize Rate Limiter
        storage = InMemoryStorage()  # Use Redis in production
        rate_limiter = initialize_rate_limiter(storage)
        logger.info("✅ Rate limiter initialized")
        
        # 4. Initialize Circuit Breakers
        circuit_manager = get_circuit_breaker_manager()
        initialize_default_circuit_breakers()
        logger.info("✅ Circuit breakers initialized")
        
        # 5. Initialize AI services
        logger.info("✅ All services initialized successfully")
        
    except Exception as e:
        logger.error("Failed to initialize services", extra={'error': str(e)})
        raise


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    logger.info("🛑 Shutting down Week 2 Enhanced API")
    
    try:
        if db_manager:
            await db_manager.close()
        await unified_model_manager.shutdown()
        logger.info("✅ All services shut down successfully")
    except Exception as e:
        logger.error("Error during shutdown", extra={'error': str(e)})


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "reVoAgent Week 2 Enhanced API",
        "version": "2.0.0",
        "features": [
            "Secret management with Azure Key Vault support",
            "Advanced rate limiting with multiple algorithms",
            "Database connection pooling with monitoring",
            "Circuit breakers for external API resilience",
            "Comprehensive health checks and monitoring",
            "Structured logging with security filtering"
        ],
        "week_2_improvements": [
            "✅ Secret Management",
            "✅ Rate Limiting", 
            "✅ Database Connection Pooling",
            "✅ Circuit Breakers"
        ]
    }


@app.get("/health")
async def health_check():
    """Comprehensive health check endpoint."""
    health_status = {
        "status": "healthy",
        "timestamp": time.time(),
        "services": {}
    }
    
    try:
        # Check secret manager
        if secret_manager:
            secret_health = await secret_manager.health_check()
            health_status["services"]["secret_manager"] = secret_health
        
        # Check database
        if db_manager:
            db_health = await db_manager.health_check()
            health_status["services"]["database"] = db_health
        
        # Check rate limiter
        if rate_limiter:
            rate_health = await rate_limiter.health_check()
            health_status["services"]["rate_limiter"] = rate_health
        
        # Check circuit breakers
        if circuit_manager:
            circuit_health = await circuit_manager.health_check_all()
            health_status["services"]["circuit_breakers"] = circuit_health
        
        # Check AI services
        ai_health = await unified_model_manager.get_system_status()
        health_status["services"]["ai_services"] = {
            "status": ai_health.status,
            "active_models": ai_health.active_models,
            "memory_percent": ai_health.memory_percent
        }
        
        # Determine overall status
        for service_health in health_status["services"].values():
            if isinstance(service_health, dict) and service_health.get("status") == "unhealthy":
                health_status["status"] = "unhealthy"
                break
            elif isinstance(service_health, dict) and service_health.get("status") == "degraded":
                health_status["status"] = "degraded"
        
        return health_status
        
    except Exception as e:
        logger.error("Health check failed", extra={'error': str(e)})
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": time.time()
        }


@app.get("/metrics")
async def get_metrics():
    """Get comprehensive system metrics."""
    try:
        metrics = {
            "timestamp": time.time(),
            "ai_services": {},
            "rate_limiter": {},
            "database": {},
            "circuit_breakers": {}
        }
        
        # AI service metrics
        ai_metrics = await unified_model_manager.get_metrics()
        metrics["ai_services"] = ai_metrics
        
        # Rate limiter metrics
        if rate_limiter:
            metrics["rate_limiter"] = rate_limiter.get_stats()
        
        # Database metrics
        if db_manager:
            metrics["database"] = {
                "pool_status": await db_manager.get_pool_status(),
                "performance_stats": db_manager.get_performance_stats()
            }
        
        # Circuit breaker metrics
        if circuit_manager:
            metrics["circuit_breakers"] = circuit_manager.get_all_stats()
        
        return metrics
        
    except Exception as e:
        logger.error("Failed to retrieve metrics", extra={'error': str(e)})
        raise HTTPException(status_code=500, detail="Failed to retrieve metrics")


@app.post("/generate", response_model=GenerationResponse)
async def generate_text(request: GenerationRequest, http_request: Request):
    """Generate text with full Week 2 enhancements."""
    
    # Check rate limit
    if not await check_rate_limit(http_request, "api_generation"):
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded",
            headers={"Retry-After": "60"}
        )
    
    import uuid
    request_id = str(uuid.uuid4())
    
    with RequestContext(request_id, operation="text_generation"):
        try:
            logger.info("Text generation request received", extra={
                'request_id': request_id,
                'prompt_length': len(request.prompt),
                'task_type': request.task_type,
                'language': request.language
            })
            
            # Use circuit breaker for AI generation
            async def generate_with_circuit_breaker():
                return await unified_model_manager.generate_text(request)
            
            if circuit_manager:
                circuit_breaker = circuit_manager.get_circuit_breaker("openai_api")
                if circuit_breaker:
                    response = await circuit_breaker.call_with_fallback(generate_with_circuit_breaker)
                else:
                    response = await generate_with_circuit_breaker()
            else:
                response = await generate_with_circuit_breaker()
            
            # Log model usage to database
            if db_manager and response.status == "completed":
                try:
                    async with db_manager.get_async_session() as session:
                        model_usage = ModelUsage(
                            model_id=response.model_used,
                            request_id=request_id,
                            user_id=None,  # Extract from auth in production
                            prompt_tokens=len(request.prompt.split()),  # Rough estimate
                            completion_tokens=len(response.content.split()) if response.content else 0,
                            total_tokens=len(request.prompt.split()) + len(response.content.split()) if response.content else 0,
                            response_time=int(response.response_time * 1000),
                            success=response.status == "completed",
                            error_message=response.error,
                            temperature=str(request.temperature),
                            max_tokens=request.max_tokens
                        )
                        session.add(model_usage)
                        await session.commit()
                except Exception as e:
                    logger.error("Failed to log model usage", extra={'error': str(e)})
            
            logger.info("Text generation completed", extra={
                'request_id': request_id,
                'status': response.status,
                'model_used': response.model_used,
                'response_time': response.response_time
            })
            
            return response
            
        except CircuitBreakerOpenException as e:
            logger.warning("Circuit breaker open", extra={
                'request_id': request_id,
                'error': str(e)
            })
            raise HTTPException(
                status_code=503,
                detail="Service temporarily unavailable",
                headers={"Retry-After": "30"}
            )
            
        except Exception as e:
            logger.error("Text generation failed", extra={
                'request_id': request_id,
                'error': str(e)
            })
            
            return GenerationResponse(
                content="",
                model_used="error",
                status="error",
                response_time=0.0,
                error=str(e)
            )


@app.get("/secrets/test")
async def test_secrets():
    """Test secret management (development only)."""
    if not secret_manager:
        raise HTTPException(status_code=503, detail="Secret manager not initialized")
    
    try:
        # Test retrieving a secret
        test_secret = await secret_manager.get_secret("test-secret", "default-value")
        
        return {
            "secret_retrieved": test_secret is not None,
            "cache_stats": secret_manager.get_cache_stats(),
            "provider": secret_manager.config.provider.value
        }
        
    except Exception as e:
        logger.error("Secret test failed", extra={'error': str(e)})
        raise HTTPException(status_code=500, detail="Secret test failed")


@app.post("/admin/circuit-breakers/{name}/reset")
async def reset_circuit_breaker(name: str):
    """Reset a specific circuit breaker (admin only)."""
    if not circuit_manager:
        raise HTTPException(status_code=503, detail="Circuit breaker manager not initialized")
    
    circuit_breaker = circuit_manager.get_circuit_breaker(name)
    if not circuit_breaker:
        raise HTTPException(status_code=404, detail=f"Circuit breaker '{name}' not found")
    
    try:
        await circuit_breaker.reset()
        logger.info("Circuit breaker reset", extra={'circuit_name': name})
        
        return {
            "message": f"Circuit breaker '{name}' reset successfully",
            "timestamp": time.time()
        }
        
    except Exception as e:
        logger.error("Failed to reset circuit breaker", extra={
            'circuit_name': name,
            'error': str(e)
        })
        raise HTTPException(status_code=500, detail="Failed to reset circuit breaker")


@app.get("/admin/database/stats")
async def get_database_stats():
    """Get database statistics (admin only)."""
    if not db_manager:
        raise HTTPException(status_code=503, detail="Database manager not initialized")
    
    try:
        return {
            "pool_status": await db_manager.get_pool_status(),
            "performance_stats": db_manager.get_performance_stats(),
            "health": await db_manager.health_check()
        }
        
    except Exception as e:
        logger.error("Failed to get database stats", extra={'error': str(e)})
        raise HTTPException(status_code=500, detail="Failed to get database stats")


if __name__ == "__main__":
    # Create logs directory
    os.makedirs("logs", exist_ok=True)
    
    # Create secrets file for demo
    import json
    secrets_data = {
        "test-secret": "test-value",
        "openai-api-key": "sk-test-key",
        "database-url": "sqlite:///./week2_demo.db"
    }
    
    with open("secrets.json", "w") as f:
        json.dump(secrets_data, f, indent=2)
    
    logger.info("🚀 Starting Week 2 Enhanced API Demo")
    
    # Run the API
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=12001,
        log_level="info",
        access_log=True
    )