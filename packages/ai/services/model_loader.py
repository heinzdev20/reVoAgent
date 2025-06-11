"""
Model Loader Service

Focused service for loading and unloading AI models with proper resource management.
"""

import asyncio
import threading
from typing import Dict, Optional, Any
from dataclasses import dataclass
from enum import Enum
try:
    import torch
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False
    torch = None

import gc

from ..schemas import ModelConfig, ModelInfo, ModelType, ModelStatus
from ...core.logging_config import get_logger, log_async_function_call

logger = get_logger(__name__)


class ModelLoader:
    """
    Focused service for AI model loading and unloading.
    
    Responsibilities:
    - Load models from various providers
    - Unload models and clean up resources
    - Track model loading status
    - Handle loading errors gracefully
    """
    
    def __init__(self):
        self.models: Dict[str, Any] = {}
        self.model_info: Dict[str, ModelInfo] = {}
        self.lock = threading.Lock()
        
    @log_async_function_call
    async def load_model(self, model_id: str, config: ModelConfig) -> bool:
        """
        Load a specific model with proper error handling and resource management.
        
        Args:
            model_id: Unique identifier for the model
            config: Model configuration
            
        Returns:
            bool: True if successful, False otherwise
        """
        with self.lock:
            if model_id in self.models:
                logger.info(f"Model {model_id} already loaded")
                return True
            
            # Update status to loading
            if model_id in self.model_info:
                self.model_info[model_id].status = ModelStatus.LOADING
            
            try:
                logger.info(
                    "Loading model",
                    extra={
                        'model_id': model_id,
                        'model_type': config.model_type.value,
                        'model_path': config.model_path,
                        'device': config.device
                    }
                )
                
                # Load model based on type
                model = await self._load_model_by_type(config)
                
                if model:
                    self.models[model_id] = model
                    
                    # Update model info
                    if model_id in self.model_info:
                        self.model_info[model_id].status = ModelStatus.LOADED
                        self.model_info[model_id].memory_usage = self._get_model_memory_usage(model)
                        self.model_info[model_id].gpu_memory = self._get_model_gpu_memory(model)
                    
                    logger.info(f"Successfully loaded model {model_id}")
                    return True
                else:
                    # Model failed to load
                    if model_id in self.model_info:
                        self.model_info[model_id].status = ModelStatus.ERROR
                        self.model_info[model_id].error_message = "Failed to load model"
                    logger.error(f"Failed to load model {model_id}")
                    return False
                
            except Exception as e:
                logger.error(f"Failed to load model {model_id}: {str(e)}")
                if model_id in self.model_info:
                    self.model_info[model_id].status = ModelStatus.ERROR
                    self.model_info[model_id].error_message = str(e)
                return False
    
    async def unload_model(self, model_id: str) -> bool:
        """
        Unload a specific model and clean up resources.
        
        Args:
            model_id: ID of the model to unload
            
        Returns:
            bool: True if successful, False otherwise
        """
        with self.lock:
            if model_id not in self.models:
                logger.warning(f"Model {model_id} not loaded")
                return True
            
            try:
                model = self.models[model_id]
                
                # Call model's unload method if available
                if hasattr(model, 'unload'):
                    await model.unload()
                
                # Remove from memory
                del self.models[model_id]
                
                # Clean up GPU memory
                await self._cleanup_gpu_memory()
                
                # Force garbage collection
                gc.collect()
                
                # Update model info
                if model_id in self.model_info:
                    self.model_info[model_id].status = ModelStatus.UNLOADED
                    self.model_info[model_id].memory_usage = 0.0
                    self.model_info[model_id].gpu_memory = 0.0
                
                logger.info(f"Successfully unloaded model {model_id}")
                return True
                
            except Exception as e:
                logger.error(f"Failed to unload model {model_id}: {str(e)}")
                return False
    
    async def _load_model_by_type(self, config: ModelConfig) -> Optional[Any]:
        """Load model based on its type."""
        try:
            if config.model_type == ModelType.DEEPSEEK_R1:
                from ..cpu_optimized_deepseek import CPUOptimizedDeepSeek
                model = CPUOptimizedDeepSeek()
                success = await model.load()
                return model if success else None
                
            elif config.model_type == ModelType.LLAMA:
                from ..llama_integration import LlamaModel
                model = LlamaModel(config)
                success = await model.load()
                return model if success else None
                
            elif config.model_type == ModelType.OPENAI:
                from ..openai_integration import OpenAIModel
                model = OpenAIModel(config)
                success = await model.load()
                return model if success else None
                
            else:
                raise ValueError(f"Unsupported model type: {config.model_type}")
                
        except ImportError as e:
            logger.error(f"Failed to import model class: {e}")
            return None
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            return None
    
    async def _cleanup_gpu_memory(self):
        """Clean up GPU memory after model unloading."""
        if TORCH_AVAILABLE and torch.cuda.is_available():
            torch.cuda.empty_cache()
            torch.cuda.synchronize()
    
    def _get_model_memory_usage(self, model) -> float:
        """Get model memory usage in GB."""
        try:
            if hasattr(model, 'get_memory_usage'):
                return model.get_memory_usage()
            return 0.0
        except Exception:
            return 0.0
    
    def _get_model_gpu_memory(self, model) -> float:
        """Get model GPU memory usage in GB."""
        try:
            if TORCH_AVAILABLE and torch.cuda.is_available() and hasattr(model, 'model'):
                return torch.cuda.memory_allocated() / (1024**3)
            return 0.0
        except Exception:
            return 0.0
    
    def get_loaded_models(self) -> Dict[str, Any]:
        """Get dictionary of currently loaded models."""
        return self.models.copy()
    
    def is_model_loaded(self, model_id: str) -> bool:
        """Check if a model is currently loaded."""
        return model_id in self.models
    
    def get_model_status(self, model_id: str) -> Optional[ModelStatus]:
        """Get the current status of a model."""
        if model_id in self.model_info:
            return self.model_info[model_id].status
        return None
    
    def register_model_info(self, model_id: str, model_info: ModelInfo):
        """Register model information."""
        self.model_info[model_id] = model_info