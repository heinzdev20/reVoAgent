#!/usr/bin/env python3
"""
Enhanced AI Model Manager for reVoAgent
Cost-optimized AI model management with intelligent fallback hierarchy

This module implements an enhanced AI model management system featuring:
- DeepSeek R1 0528 (primary local/opensource model)
- Llama (secondary local model)
- OpenAI (fallback cloud model)
- Anthropic (fallback cloud model)
- Intelligent cost optimization and model selection
- Performance monitoring and health checks
- Automatic failover and load balancing
"""

import asyncio
import aiohttp
import json
import time
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Union
from dataclasses import dataclass, field
from enum import Enum
import subprocess
import psutil
import os
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ModelType(Enum):
    """AI model types"""
    LOCAL_OPENSOURCE = "local_opensource"  # DeepSeek R1
    LOCAL_COMMERCIAL = "local_commercial"  # Llama
    CLOUD_OPENAI = "cloud_openai"         # OpenAI
    CLOUD_ANTHROPIC = "cloud_anthropic"   # Anthropic

class ModelStatus(Enum):
    """Model availability status"""
    AVAILABLE = "available"
    UNAVAILABLE = "unavailable"
    LOADING = "loading"
    ERROR = "error"
    MAINTENANCE = "maintenance"

@dataclass
class ModelConfig:
    """AI model configuration"""
    model_id: str
    name: str
    model_type: ModelType
    priority: int  # Lower number = higher priority
    cost_per_token: float  # Cost in USD per 1000 tokens
    max_tokens: int
    context_length: int
    local_path: Optional[str] = None
    api_endpoint: Optional[str] = None
    api_key: Optional[str] = None
    health_check_url: Optional[str] = None
    memory_requirement: Optional[int] = None  # MB
    gpu_requirement: bool = False
    status: ModelStatus = ModelStatus.UNAVAILABLE
    last_health_check: Optional[datetime] = None
    error_count: int = 0
    success_count: int = 0
    average_response_time: float = 0.0

@dataclass
class GenerationRequest:
    """AI generation request"""
    prompt: str
    model_preference: Optional[str] = "auto"
    max_tokens: int = 1000
    temperature: float = 0.7
    force_local: bool = True
    fallback_allowed: bool = True
    cost_limit: Optional[float] = None  # Maximum cost in USD

@dataclass
class GenerationResponse:
    """AI generation response"""
    content: str
    model_used: str
    model_type: ModelType
    tokens_used: int
    cost: float
    response_time: float
    success: bool
    error_message: Optional[str] = None
    fallback_used: bool = False

class EnhancedModelManager:
    """
    Enhanced AI Model Manager
    
    Provides intelligent model selection with cost optimization,
    automatic failover, and comprehensive monitoring.
    """
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """Initialize the enhanced model manager"""
        self.config = config or {}
        
        # Model configurations
        self.models: Dict[str, ModelConfig] = {}
        
        # Performance metrics
        self.metrics = {
            "total_requests": 0,
            "successful_requests": 0,
            "failed_requests": 0,
            "total_cost": 0.0,
            "cost_saved": 0.0,  # Savings from using local models
            "local_usage_percentage": 0.0,
            "average_response_time": 0.0,
            "model_usage": {}
        }
        
        # Health monitoring
        self.health_check_interval = 300  # 5 minutes
        self.health_check_task = None
        
        # Initialize models
        self._initialize_models()
        
        logger.info("🤖 Enhanced AI Model Manager initialized")
        logger.info(f"📊 Configured {len(self.models)} AI models")

    def _initialize_models(self):
        """Initialize AI model configurations"""
        
        # 1. DeepSeek R1 0528 (Primary - Local/Opensource)
        self.models["deepseek-r1"] = ModelConfig(
            model_id="deepseek-r1",
            name="DeepSeek R1 0528",
            model_type=ModelType.LOCAL_OPENSOURCE,
            priority=1,  # Highest priority
            cost_per_token=0.0,  # Free local model
            max_tokens=4000,
            context_length=32768,
            local_path=self.config.get("deepseek_path", "/models/deepseek-r1"),
            health_check_url="http://localhost:8001/health",
            memory_requirement=8192,  # 8GB RAM
            gpu_requirement=True
        )
        
        # 2. Llama (Secondary - Local)
        self.models["llama"] = ModelConfig(
            model_id="llama",
            name="Llama 3.1 70B",
            model_type=ModelType.LOCAL_COMMERCIAL,
            priority=2,
            cost_per_token=0.0,  # Free local model
            max_tokens=4000,
            context_length=8192,
            local_path=self.config.get("llama_path", "/models/llama-3.1-70b"),
            health_check_url="http://localhost:8002/health",
            memory_requirement=16384,  # 16GB RAM
            gpu_requirement=True
        )
        
        # 3. OpenAI (Fallback - Cloud)
        self.models["openai-gpt4"] = ModelConfig(
            model_id="openai-gpt4",
            name="OpenAI GPT-4",
            model_type=ModelType.CLOUD_OPENAI,
            priority=3,
            cost_per_token=0.03,  # $30 per 1M tokens
            max_tokens=4000,
            context_length=8192,
            api_endpoint="https://api.openai.com/v1/chat/completions",
            api_key=self.config.get("openai_api_key"),
            health_check_url="https://api.openai.com/v1/models"
        )
        
        # 4. Anthropic (Fallback - Cloud)
        self.models["anthropic-claude"] = ModelConfig(
            model_id="anthropic-claude",
            name="Anthropic Claude 3.5 Sonnet",
            model_type=ModelType.CLOUD_ANTHROPIC,
            priority=4,
            cost_per_token=0.015,  # $15 per 1M tokens
            max_tokens=4000,
            context_length=200000,
            api_endpoint="https://api.anthropic.com/v1/messages",
            api_key=self.config.get("anthropic_api_key"),
            health_check_url="https://api.anthropic.com/v1/messages"
        )
        
        # Health monitoring will be started when needed
        # self.health_check_task will be created when start_health_monitoring() is called
    
    def start_health_monitoring(self):
        """Start health monitoring (call this in an async context)"""
        try:
            if self.health_check_task is None:
                self.health_check_task = asyncio.create_task(self._health_monitor())
                logger.info("🔍 Health monitoring started")
        except RuntimeError:
            # No event loop running, health monitoring will be started later
            logger.info("⏳ Health monitoring will start when event loop is available")
    
    def stop_health_monitoring(self):
        """Stop health monitoring"""
        if self.health_check_task:
            self.health_check_task.cancel()
            self.health_check_task = None
            logger.info("🛑 Health monitoring stopped")

    async def _health_monitor(self):
        """Monitor model health and availability"""
        while True:
            try:
                for model_id, model in self.models.items():
                    await self._check_model_health(model)
                
                await asyncio.sleep(self.health_check_interval)
                
            except Exception as e:
                logger.error(f"Error in health monitor: {e}")
                await asyncio.sleep(60)

    async def _check_model_health(self, model: ModelConfig):
        """Check individual model health"""
        try:
            if model.model_type in [ModelType.LOCAL_OPENSOURCE, ModelType.LOCAL_COMMERCIAL]:
                # Check local model health
                await self._check_local_model_health(model)
            else:
                # Check cloud model health
                await self._check_cloud_model_health(model)
                
            model.last_health_check = datetime.now(timezone.utc)
            
        except Exception as e:
            logger.error(f"Health check failed for {model.name}: {e}")
            model.status = ModelStatus.ERROR
            model.error_count += 1

    async def _check_local_model_health(self, model: ModelConfig):
        """Check local model health"""
        # Check if model files exist
        if model.local_path and not os.path.exists(model.local_path):
            model.status = ModelStatus.UNAVAILABLE
            return
        
        # Check system resources
        memory = psutil.virtual_memory()
        available_memory = memory.available // (1024 * 1024)  # MB
        
        if model.memory_requirement and available_memory < model.memory_requirement:
            model.status = ModelStatus.UNAVAILABLE
            logger.warning(f"Insufficient memory for {model.name}: {available_memory}MB < {model.memory_requirement}MB")
            return
        
        # Check GPU availability if required
        if model.gpu_requirement:
            try:
                import torch
                if not torch.cuda.is_available():
                    model.status = ModelStatus.UNAVAILABLE
                    logger.warning(f"GPU required but not available for {model.name}")
                    return
            except ImportError:
                logger.warning("PyTorch not available for GPU check")
        
        # Check health endpoint if available
        if model.health_check_url:
            try:
                async with aiohttp.ClientSession() as session:
                    async with session.get(model.health_check_url, timeout=5) as response:
                        if response.status == 200:
                            model.status = ModelStatus.AVAILABLE
                        else:
                            model.status = ModelStatus.UNAVAILABLE
            except:
                model.status = ModelStatus.UNAVAILABLE
        else:
            # Assume available if no health check URL
            model.status = ModelStatus.AVAILABLE

    async def _check_cloud_model_health(self, model: ModelConfig):
        """Check cloud model health"""
        if not model.api_key:
            model.status = ModelStatus.UNAVAILABLE
            return
        
        try:
            headers = {}
            if model.model_type == ModelType.CLOUD_OPENAI:
                headers["Authorization"] = f"Bearer {model.api_key}"
            elif model.model_type == ModelType.CLOUD_ANTHROPIC:
                headers["x-api-key"] = model.api_key
                headers["anthropic-version"] = "2023-06-01"
            
            async with aiohttp.ClientSession() as session:
                async with session.get(model.health_check_url, headers=headers, timeout=10) as response:
                    if response.status in [200, 401]:  # 401 means API is working but key might be invalid
                        model.status = ModelStatus.AVAILABLE
                    else:
                        model.status = ModelStatus.UNAVAILABLE
                        
        except Exception as e:
            logger.error(f"Cloud health check failed for {model.name}: {e}")
            model.status = ModelStatus.UNAVAILABLE

    async def generate_response(self, request: GenerationRequest) -> GenerationResponse:
        """Generate AI response with intelligent model selection"""
        start_time = time.time()
        self.metrics["total_requests"] += 1
        
        # Select best available model
        selected_model = await self._select_model(request)
        
        if not selected_model:
            self.metrics["failed_requests"] += 1
            return GenerationResponse(
                content="",
                model_used="none",
                model_type=ModelType.LOCAL_OPENSOURCE,
                tokens_used=0,
                cost=0.0,
                response_time=time.time() - start_time,
                success=False,
                error_message="No available models"
            )
        
        # Generate response
        try:
            response = await self._generate_with_model(selected_model, request)
            response.response_time = time.time() - start_time
            
            # Update metrics
            self.metrics["successful_requests"] += 1
            self.metrics["total_cost"] += response.cost
            
            # Calculate cost savings
            if selected_model.model_type in [ModelType.LOCAL_OPENSOURCE, ModelType.LOCAL_COMMERCIAL]:
                # Estimate what it would have cost with cloud models
                cloud_cost = response.tokens_used * 0.03 / 1000  # Assume GPT-4 pricing
                self.metrics["cost_saved"] += cloud_cost
            
            # Update model metrics
            selected_model.success_count += 1
            selected_model.average_response_time = (
                (selected_model.average_response_time * (selected_model.success_count - 1) + response.response_time) /
                selected_model.success_count
            )
            
            # Update usage statistics
            model_id = selected_model.model_id
            if model_id not in self.metrics["model_usage"]:
                self.metrics["model_usage"][model_id] = 0
            self.metrics["model_usage"][model_id] += 1
            
            # Calculate local usage percentage
            local_usage = sum(
                count for model_id, count in self.metrics["model_usage"].items()
                if self.models[model_id].model_type in [ModelType.LOCAL_OPENSOURCE, ModelType.LOCAL_COMMERCIAL]
            )
            self.metrics["local_usage_percentage"] = (local_usage / self.metrics["total_requests"]) * 100
            
            logger.info(f"✅ Generated response using {selected_model.name} (cost: ${response.cost:.4f})")
            return response
            
        except Exception as e:
            self.metrics["failed_requests"] += 1
            selected_model.error_count += 1
            
            # Try fallback if allowed
            if request.fallback_allowed and selected_model.priority < 4:
                logger.warning(f"Model {selected_model.name} failed, trying fallback...")
                fallback_request = GenerationRequest(
                    prompt=request.prompt,
                    model_preference="auto",
                    max_tokens=request.max_tokens,
                    temperature=request.temperature,
                    force_local=False,  # Allow cloud fallback
                    fallback_allowed=False  # Prevent infinite recursion
                )
                
                fallback_response = await self.generate_response(fallback_request)
                fallback_response.fallback_used = True
                return fallback_response
            
            return GenerationResponse(
                content="",
                model_used=selected_model.model_id,
                model_type=selected_model.model_type,
                tokens_used=0,
                cost=0.0,
                response_time=time.time() - start_time,
                success=False,
                error_message=str(e)
            )

    async def _select_model(self, request: GenerationRequest) -> Optional[ModelConfig]:
        """Select the best available model based on request preferences"""
        
        # If specific model requested
        if request.model_preference and request.model_preference != "auto":
            if request.model_preference in self.models:
                model = self.models[request.model_preference]
                if model.status == ModelStatus.AVAILABLE:
                    return model
        
        # Auto-selection based on priority and constraints
        available_models = [
            model for model in self.models.values()
            if model.status == ModelStatus.AVAILABLE
        ]
        
        # Filter by local preference
        if request.force_local:
            local_models = [
                model for model in available_models
                if model.model_type in [ModelType.LOCAL_OPENSOURCE, ModelType.LOCAL_COMMERCIAL]
            ]
            if local_models:
                available_models = local_models
        
        # Filter by cost limit
        if request.cost_limit:
            cost_filtered = [
                model for model in available_models
                if model.cost_per_token * request.max_tokens / 1000 <= request.cost_limit
            ]
            if cost_filtered:
                available_models = cost_filtered
        
        # Sort by priority (lower number = higher priority)
        available_models.sort(key=lambda m: m.priority)
        
        return available_models[0] if available_models else None

    async def _generate_with_model(self, model: ModelConfig, request: GenerationRequest) -> GenerationResponse:
        """Generate response with specific model"""
        
        if model.model_type in [ModelType.LOCAL_OPENSOURCE, ModelType.LOCAL_COMMERCIAL]:
            return await self._generate_local(model, request)
        elif model.model_type == ModelType.CLOUD_OPENAI:
            return await self._generate_openai(model, request)
        elif model.model_type == ModelType.CLOUD_ANTHROPIC:
            return await self._generate_anthropic(model, request)
        else:
            raise ValueError(f"Unsupported model type: {model.model_type}")

    async def _generate_local(self, model: ModelConfig, request: GenerationRequest) -> GenerationResponse:
        """Generate response with local model"""
        
        # For demo purposes, simulate local model response
        # In production, this would interface with actual local model APIs
        
        await asyncio.sleep(0.5)  # Simulate processing time
        
        # Simulate response based on model
        if model.model_id == "deepseek-r1":
            content = f"[DeepSeek R1 Response] {request.prompt[:50]}... (Generated locally with DeepSeek R1 0528)"
        elif model.model_id == "llama":
            content = f"[Llama Response] {request.prompt[:50]}... (Generated locally with Llama 3.1 70B)"
        else:
            content = f"[Local Model Response] {request.prompt[:50]}..."
        
        tokens_used = min(len(content.split()) * 1.3, request.max_tokens)  # Rough token estimate
        
        return GenerationResponse(
            content=content,
            model_used=model.model_id,
            model_type=model.model_type,
            tokens_used=int(tokens_used),
            cost=0.0,  # Local models are free
            response_time=0.0,  # Will be set by caller
            success=True
        )

    async def _generate_openai(self, model: ModelConfig, request: GenerationRequest) -> GenerationResponse:
        """Generate response with OpenAI model"""
        
        headers = {
            "Authorization": f"Bearer {model.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "gpt-4",
            "messages": [{"role": "user", "content": request.prompt}],
            "max_tokens": request.max_tokens,
            "temperature": request.temperature
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(model.api_endpoint, headers=headers, json=payload) as response:
                if response.status == 200:
                    data = await response.json()
                    content = data["choices"][0]["message"]["content"]
                    tokens_used = data["usage"]["total_tokens"]
                    cost = tokens_used * model.cost_per_token / 1000
                    
                    return GenerationResponse(
                        content=content,
                        model_used=model.model_id,
                        model_type=model.model_type,
                        tokens_used=tokens_used,
                        cost=cost,
                        response_time=0.0,
                        success=True
                    )
                else:
                    error_text = await response.text()
                    raise Exception(f"OpenAI API error: {response.status} - {error_text}")

    async def _generate_anthropic(self, model: ModelConfig, request: GenerationRequest) -> GenerationResponse:
        """Generate response with Anthropic model"""
        
        headers = {
            "x-api-key": model.api_key,
            "Content-Type": "application/json",
            "anthropic-version": "2023-06-01"
        }
        
        payload = {
            "model": "claude-3-5-sonnet-20241022",
            "max_tokens": request.max_tokens,
            "temperature": request.temperature,
            "messages": [{"role": "user", "content": request.prompt}]
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(model.api_endpoint, headers=headers, json=payload) as response:
                if response.status == 200:
                    data = await response.json()
                    content = data["content"][0]["text"]
                    tokens_used = data["usage"]["input_tokens"] + data["usage"]["output_tokens"]
                    cost = tokens_used * model.cost_per_token / 1000
                    
                    return GenerationResponse(
                        content=content,
                        model_used=model.model_id,
                        model_type=model.model_type,
                        tokens_used=tokens_used,
                        cost=cost,
                        response_time=0.0,
                        success=True
                    )
                else:
                    error_text = await response.text()
                    raise Exception(f"Anthropic API error: {response.status} - {error_text}")

    async def list_available_models(self) -> List[Dict[str, Any]]:
        """List all available models with their status"""
        models = []
        
        for model in self.models.values():
            models.append({
                "model_id": model.model_id,
                "name": model.name,
                "type": model.model_type.value,
                "priority": model.priority,
                "status": model.status.value,
                "cost_per_token": model.cost_per_token,
                "max_tokens": model.max_tokens,
                "context_length": model.context_length,
                "success_rate": (
                    model.success_count / max(model.success_count + model.error_count, 1)
                ) * 100,
                "average_response_time": model.average_response_time
            })
        
        return sorted(models, key=lambda m: m["priority"])
    
    def get_available_providers(self) -> List[str]:
        """Get list of available model providers (sync method for compatibility)"""
        return [model.model_id for model in self.models.values() if model.status == ModelStatus.AVAILABLE]
    
    def get_cost_statistics(self) -> Dict[str, Any]:
        """Get cost optimization statistics (sync method for compatibility)"""
        total_requests = self.metrics["successful_requests"] + self.metrics["failed_requests"]
        local_requests = sum(
            model.success_count for model in self.models.values()
            if model.model_type in [ModelType.LOCAL_OPENSOURCE, ModelType.LOCAL_COMMERCIAL]
        )
        
        local_percentage = (local_requests / max(total_requests, 1)) * 100
        
        return {
            "total_requests": total_requests,
            "local_requests": local_requests,
            "local_percentage": local_percentage,
            "total_cost": self.metrics["total_cost"],
            "cost_savings": max(0, (total_requests * 0.03) - self.metrics["total_cost"]),  # Estimated savings vs OpenAI
            "average_cost_per_request": self.metrics["total_cost"] / max(total_requests, 1)
        }
    
    def generate_response(self, prompt: str, **kwargs) -> Dict[str, Any]:
        """Generate response (sync method for compatibility)"""
        # For compatibility, return a simple response without async processing
        # In production, this would run the async version in an event loop
        
        # Simulate model selection and response
        available_models = [model for model in self.models.values()]
        if available_models:
            # Use highest priority model
            model = min(available_models, key=lambda m: m.priority)
            provider = model.model_id
            
            # Simulate local model usage for cost optimization
            if model.model_type in [ModelType.LOCAL_OPENSOURCE, ModelType.LOCAL_COMMERCIAL]:
                cost = 0.0
                quality_score = 0.85  # High quality for local models
            else:
                cost = 0.03  # Cloud model cost
                quality_score = 0.90  # Slightly higher quality for cloud
        else:
            provider = "fallback"
            cost = 0.0
            quality_score = 0.80
        
        return {
            "content": f"[{provider.upper()} Response] {prompt[:50]}... (Generated with cost optimization)",
            "provider": provider,
            "cost": cost,
            "quality_score": quality_score,
            "tokens_used": len(prompt.split()) * 2,  # Rough estimate
            "success": True
        }

    async def get_metrics(self) -> Dict[str, Any]:
        """Get comprehensive model manager metrics"""
        
        # Calculate average response time
        if self.metrics["successful_requests"] > 0:
            total_time = sum(
                model.average_response_time * model.success_count
                for model in self.models.values()
            )
            self.metrics["average_response_time"] = total_time / self.metrics["successful_requests"]
        
        return {
            "requests": {
                "total": self.metrics["total_requests"],
                "successful": self.metrics["successful_requests"],
                "failed": self.metrics["failed_requests"],
                "success_rate": (
                    self.metrics["successful_requests"] / max(self.metrics["total_requests"], 1)
                ) * 100
            },
            "cost_optimization": {
                "total_cost": self.metrics["total_cost"],
                "cost_saved": self.metrics["cost_saved"],
                "local_usage_percentage": self.metrics["local_usage_percentage"],
                "savings_rate": (
                    self.metrics["cost_saved"] / max(self.metrics["cost_saved"] + self.metrics["total_cost"], 1)
                ) * 100
            },
            "performance": {
                "average_response_time": self.metrics["average_response_time"]
            },
            "model_usage": self.metrics["model_usage"],
            "model_health": {
                model_id: {
                    "status": model.status.value,
                    "success_count": model.success_count,
                    "error_count": model.error_count,
                    "last_health_check": model.last_health_check.isoformat() if model.last_health_check else None
                }
                for model_id, model in self.models.items()
            }
        }

    async def shutdown(self):
        """Shutdown the model manager"""
        logger.info("🛑 Shutting down Enhanced Model Manager...")
        
        if self.health_check_task:
            self.health_check_task.cancel()
        
        logger.info("🛑 Enhanced Model Manager shutdown complete")

# Example usage and testing
async def main():
    """Example usage of Enhanced Model Manager"""
    
    print("🤖 Enhanced AI Model Manager Demo")
    print("=" * 50)
    
    # Configuration with API keys (use environment variables in production)
    config = {
        "deepseek_path": "/models/deepseek-r1",
        "llama_path": "/models/llama-3.1-70b",
        "openai_api_key": os.getenv("OPENAI_API_KEY"),
        "anthropic_api_key": os.getenv("ANTHROPIC_API_KEY")
    }
    
    # Initialize model manager
    manager = EnhancedModelManager(config)
    
    print("✅ Enhanced Model Manager initialized")
    
    # List available models
    models = await manager.list_available_models()
    print(f"📋 Available models:")
    for model in models:
        print(f"   - {model['name']} ({model['model_id']}) - {model['status']}")
    
    # Test generation request
    request = GenerationRequest(
        prompt="Explain the benefits of local AI models for cost optimization",
        model_preference="auto",
        max_tokens=500,
        temperature=0.7,
        force_local=True
    )
    
    print(f"\n🔄 Generating response...")
    response = await manager.generate_response(request)
    
    print(f"✅ Response generated:")
    print(f"   - Model used: {response.model_used}")
    print(f"   - Model type: {response.model_type.value}")
    print(f"   - Tokens: {response.tokens_used}")
    print(f"   - Cost: ${response.cost:.4f}")
    print(f"   - Response time: {response.response_time:.2f}s")
    print(f"   - Success: {response.success}")
    
    # Get metrics
    metrics = await manager.get_metrics()
    print(f"\n📊 Model Manager Metrics:")
    print(f"   - Total requests: {metrics['requests']['total']}")
    print(f"   - Success rate: {metrics['requests']['success_rate']:.1f}%")
    print(f"   - Local usage: {metrics['cost_optimization']['local_usage_percentage']:.1f}%")
    print(f"   - Cost saved: ${metrics['cost_optimization']['cost_saved']:.4f}")
    
    await manager.shutdown()

if __name__ == "__main__":
    asyncio.run(main())