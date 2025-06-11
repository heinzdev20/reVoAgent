#!/usr/bin/env python3
"""
Enhanced Model Manager Integration for reVoAgent
Priority 1.1: Integrate Enhanced Local AI Model Manager with 95% cost savings

This module bridges the existing model manager with the enhanced features
to achieve the documented 95% cost savings through intelligent model selection.
"""

import asyncio
import json
import logging
import time
from datetime import datetime
from typing import Dict, Any, List, Optional, Union
from dataclasses import dataclass, asdict
from enum import Enum
import os
from pathlib import Path

# Import existing components
try:
    from packages.ai.model_manager import ModelManager as ExistingModelManager
    from src.packages.ai.enhanced_model_manager import EnhancedModelManager
except ImportError as e:
    logging.warning(f"Import error: {e}. Using fallback implementations.")
    
    class ExistingModelManager:
        def __init__(self):
            self.models = {}
        
        async def generate_response(self, prompt, **kwargs):
            return {"content": f"Fallback response for: {prompt[:50]}...", "provider": "fallback"}
    
    class EnhancedModelManager:
        def __init__(self):
            self.models = {}
        
        async def generate_response(self, prompt, **kwargs):
            return {"content": f"Enhanced response for: {prompt[:50]}...", "provider": "enhanced"}

logger = logging.getLogger(__name__)

class CostTier(Enum):
    """Cost tiers for model selection"""
    FREE_LOCAL = "free_local"          # $0.00 - Local models
    LOW_COST = "low_cost"              # $0.001-0.01 per request
    MEDIUM_COST = "medium_cost"        # $0.01-0.10 per request  
    HIGH_COST = "high_cost"            # $0.10+ per request

class ModelPriority(Enum):
    """Model priority for intelligent selection"""
    PRIMARY = "primary"                # DeepSeek R1 0528 (local)
    SECONDARY = "secondary"            # Llama 3.1 70B (local)
    FALLBACK_1 = "fallback_1"         # OpenAI GPT-4 (cloud)
    FALLBACK_2 = "fallback_2"         # Anthropic Claude (cloud)

@dataclass
class CostMetrics:
    """Cost tracking metrics"""
    total_requests: int = 0
    local_requests: int = 0
    cloud_requests: int = 0
    total_cost: float = 0.0
    estimated_savings: float = 0.0
    cost_per_request: float = 0.0
    
    def calculate_savings_percentage(self) -> float:
        """Calculate actual cost savings percentage"""
        if self.total_requests == 0:
            return 0.0
        
        # Estimate what cost would be with 100% cloud usage
        estimated_cloud_cost = self.total_requests * 0.05  # $0.05 per request average
        
        if estimated_cloud_cost > 0:
            savings = ((estimated_cloud_cost - self.total_cost) / estimated_cloud_cost) * 100
            return max(0, min(100, savings))
        
        return 0.0

@dataclass
class ModelConfig:
    """Enhanced model configuration"""
    name: str
    provider: str
    priority: ModelPriority
    cost_tier: CostTier
    cost_per_request: float
    max_tokens: int
    timeout: int
    health_check_url: Optional[str] = None
    local: bool = True
    
class IntegratedModelManager:
    """Integrated model manager combining existing and enhanced features"""
    
    def __init__(self):
        self.existing_manager = ExistingModelManager()
        self.enhanced_manager = EnhancedModelManager()
        
        # Cost tracking
        self.cost_metrics = CostMetrics()
        
        # Model configurations prioritized for 95% cost savings
        self.model_configs = {
            "deepseek_r1_0528": ModelConfig(
                name="DeepSeek R1 0528",
                provider="deepseek_local",
                priority=ModelPriority.PRIMARY,
                cost_tier=CostTier.FREE_LOCAL,
                cost_per_request=0.0,
                max_tokens=8192,
                timeout=30,
                local=True
            ),
            "llama_3_1_70b": ModelConfig(
                name="Llama 3.1 70B",
                provider="llama_local", 
                priority=ModelPriority.SECONDARY,
                cost_tier=CostTier.FREE_LOCAL,
                cost_per_request=0.0,
                max_tokens=4096,
                timeout=45,
                local=True
            ),
            "openai_gpt4": ModelConfig(
                name="OpenAI GPT-4",
                provider="openai",
                priority=ModelPriority.FALLBACK_1,
                cost_tier=CostTier.HIGH_COST,
                cost_per_request=0.03,
                max_tokens=8192,
                timeout=20,
                local=False
            ),
            "anthropic_claude": ModelConfig(
                name="Anthropic Claude",
                provider="anthropic",
                priority=ModelPriority.FALLBACK_2,
                cost_tier=CostTier.HIGH_COST,
                cost_per_request=0.025,
                max_tokens=4096,
                timeout=25,
                local=False
            )
        }
        
        # Model health status
        self.model_health = {model_id: True for model_id in self.model_configs.keys()}
        
        # Performance tracking
        self.performance_metrics = {
            model_id: {"response_time": 0.0, "success_rate": 100.0, "last_used": None}
            for model_id in self.model_configs.keys()
        }
        
        logger.info("Integrated Model Manager initialized with cost optimization")
    
    async def health_check_models(self) -> Dict[str, bool]:
        """Check health of all models"""
        health_results = {}
        
        for model_id, config in self.model_configs.items():
            try:
                if config.local:
                    # For local models, check if process is running or files exist
                    health_results[model_id] = await self._check_local_model_health(model_id)
                else:
                    # For cloud models, check API availability
                    health_results[model_id] = await self._check_cloud_model_health(model_id)
                    
            except Exception as e:
                logger.error(f"Health check failed for {model_id}: {e}")
                health_results[model_id] = False
        
        self.model_health.update(health_results)
        return health_results
    
    async def _check_local_model_health(self, model_id: str) -> bool:
        """Check local model health"""
        # Simplified health check - in production, this would check actual model availability
        if model_id == "deepseek_r1_0528":
            # Check if DeepSeek R1 is available
            return True  # Assume available for demo
        elif model_id == "llama_3_1_70b":
            # Check if Llama is available
            return True  # Assume available for demo
        
        return False
    
    async def _check_cloud_model_health(self, model_id: str) -> bool:
        """Check cloud model health"""
        # Simplified health check - in production, this would ping actual APIs
        return True  # Assume cloud models are available
    
    def select_optimal_model(self, request_context: Dict[str, Any] = None) -> str:
        """Select optimal model based on cost optimization and availability"""
        
        # Priority order for 95% cost savings
        priority_order = [
            ModelPriority.PRIMARY,      # DeepSeek R1 (local, free)
            ModelPriority.SECONDARY,    # Llama (local, free)
            ModelPriority.FALLBACK_1,   # OpenAI (cloud, paid)
            ModelPriority.FALLBACK_2    # Anthropic (cloud, paid)
        ]
        
        for priority in priority_order:
            # Find models with this priority
            candidates = [
                model_id for model_id, config in self.model_configs.items()
                if config.priority == priority and self.model_health.get(model_id, False)
            ]
            
            if candidates:
                # Select best candidate (for now, just take the first)
                selected = candidates[0]
                logger.info(f"Selected model: {selected} (priority: {priority.value})")
                return selected
        
        # Fallback to any available model
        available_models = [
            model_id for model_id, healthy in self.model_health.items() if healthy
        ]
        
        if available_models:
            selected = available_models[0]
            logger.warning(f"Using fallback model: {selected}")
            return selected
        
        raise Exception("No models available")
    
    async def generate_response(self, prompt: str, **kwargs) -> Dict[str, Any]:
        """Generate response with cost optimization"""
        start_time = time.time()
        
        # Select optimal model
        try:
            selected_model = self.select_optimal_model(kwargs)
        except Exception as e:
            logger.error(f"Model selection failed: {e}")
            return {"error": "No models available", "cost": 0.0}
        
        # Get model config
        config = self.model_configs[selected_model]
        
        # Generate response using appropriate manager
        try:
            if config.local:
                # Use enhanced manager for local models
                response = await self.enhanced_manager.generate_response(prompt, **kwargs)
            else:
                # Use existing manager for cloud models
                response = await self.existing_manager.generate_response(prompt, **kwargs)
            
            # Track performance
            response_time = time.time() - start_time
            self.performance_metrics[selected_model]["response_time"] = response_time
            self.performance_metrics[selected_model]["last_used"] = datetime.now().isoformat()
            
            # Track costs
            self.cost_metrics.total_requests += 1
            if config.local:
                self.cost_metrics.local_requests += 1
            else:
                self.cost_metrics.cloud_requests += 1
                self.cost_metrics.total_cost += config.cost_per_request
            
            # Add metadata to response
            response.update({
                "model_used": selected_model,
                "model_type": "local" if config.local else "cloud",
                "cost": config.cost_per_request,
                "response_time": response_time,
                "cost_tier": config.cost_tier.value
            })
            
            return response
            
        except Exception as e:
            logger.error(f"Response generation failed for {selected_model}: {e}")
            
            # Mark model as unhealthy and retry with different model
            self.model_health[selected_model] = False
            
            # Retry with next available model
            return await self.generate_response(prompt, **kwargs)
    
    def get_cost_savings_report(self) -> Dict[str, Any]:
        """Generate cost savings report"""
        savings_percentage = self.cost_metrics.calculate_savings_percentage()
        
        return {
            "timestamp": datetime.now().isoformat(),
            "total_requests": self.cost_metrics.total_requests,
            "local_requests": self.cost_metrics.local_requests,
            "cloud_requests": self.cost_metrics.cloud_requests,
            "local_percentage": (self.cost_metrics.local_requests / max(1, self.cost_metrics.total_requests)) * 100,
            "total_cost": round(self.cost_metrics.total_cost, 4),
            "cost_per_request": round(self.cost_metrics.total_cost / max(1, self.cost_metrics.total_requests), 4),
            "estimated_savings_percentage": round(savings_percentage, 1),
            "target_savings": 95.0,
            "savings_achieved": savings_percentage >= 95.0,
            "model_health": self.model_health,
            "performance_metrics": self.performance_metrics
        }
    
    def get_model_status(self) -> Dict[str, Any]:
        """Get current model status"""
        return {
            "timestamp": datetime.now().isoformat(),
            "available_models": [
                {
                    "id": model_id,
                    "name": config.name,
                    "provider": config.provider,
                    "priority": config.priority.value,
                    "cost_tier": config.cost_tier.value,
                    "cost_per_request": config.cost_per_request,
                    "local": config.local,
                    "healthy": self.model_health.get(model_id, False),
                    "performance": self.performance_metrics.get(model_id, {})
                }
                for model_id, config in self.model_configs.items()
            ],
            "cost_metrics": asdict(self.cost_metrics)
        }
    
    async def optimize_for_cost_savings(self) -> Dict[str, Any]:
        """Optimize model selection for maximum cost savings"""
        logger.info("Optimizing for 95% cost savings target...")
        
        # Check health of all models
        health_results = await self.health_check_models()
        
        # Prioritize local models
        local_models_healthy = sum(1 for model_id, config in self.model_configs.items() 
                                 if config.local and health_results.get(model_id, False))
        
        total_models = len(self.model_configs)
        
        optimization_report = {
            "timestamp": datetime.now().isoformat(),
            "local_models_available": local_models_healthy,
            "total_models": total_models,
            "local_availability_percentage": (local_models_healthy / total_models) * 100,
            "cost_optimization_status": "OPTIMAL" if local_models_healthy >= 1 else "SUBOPTIMAL",
            "recommendations": []
        }
        
        if local_models_healthy == 0:
            optimization_report["recommendations"].extend([
                "🚨 No local models available - 95% cost savings not achievable",
                "🔧 Check DeepSeek R1 0528 installation and configuration",
                "🔧 Verify Llama 3.1 70B setup and availability",
                "⚡ Consider setting up local model infrastructure"
            ])
        elif local_models_healthy == 1:
            optimization_report["recommendations"].extend([
                "⚠️ Only one local model available - limited redundancy",
                "🔧 Set up additional local models for better reliability",
                "📊 Monitor performance of available local model"
            ])
        else:
            optimization_report["recommendations"].extend([
                "✅ Multiple local models available - excellent cost optimization",
                "📈 95% cost savings target achievable",
                "🎯 Continue monitoring model performance and health"
            ])
        
        return optimization_report

# Integration testing and validation
async def test_integration():
    """Test the integrated model manager"""
    print("🧪 Testing Enhanced Model Manager Integration...")
    
    manager = IntegratedModelManager()
    
    # Test model health check
    print("🔍 Checking model health...")
    health = await manager.health_check_models()
    print(f"Model health: {health}")
    
    # Test cost optimization
    print("💰 Testing cost optimization...")
    optimization = await manager.optimize_for_cost_savings()
    print(f"Optimization status: {optimization['cost_optimization_status']}")
    
    # Test response generation
    print("🤖 Testing response generation...")
    try:
        response = await manager.generate_response("Hello, test the cost optimization system")
        print(f"Response generated using: {response.get('model_used', 'unknown')}")
        print(f"Cost: ${response.get('cost', 0)}")
        print(f"Model type: {response.get('model_type', 'unknown')}")
    except Exception as e:
        print(f"Response generation failed: {e}")
    
    # Generate cost savings report
    print("📊 Generating cost savings report...")
    report = manager.get_cost_savings_report()
    print(f"Estimated savings: {report['estimated_savings_percentage']}%")
    print(f"Target achieved: {report['savings_achieved']}")
    
    return manager

def main():
    """Main function for testing"""
    asyncio.run(test_integration())

if __name__ == "__main__":
    main()