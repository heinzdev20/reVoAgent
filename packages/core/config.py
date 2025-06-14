"""Centralized Configuration Loader"""
import yaml
from pathlib import Path
from typing import Dict, Any, Optional
from dataclasses import dataclass
import os

@dataclass
class AgentConfig:
    """Configuration for individual agents."""
    max_concurrent_tasks: int = 5
    timeout: int = 300  # 5 minutes
    retry_count: int = 3
    memory_limit: int = 1024  # MB
    model: str = "deepseek-r1"  # Default model
    tools: list = None  # Available tools
    custom_parameters: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.custom_parameters is None:
            self.custom_parameters = {}
        if self.tools is None:
            self.tools = ["terminal", "profiler", "log_analyzer", "code_analyzer"]

@dataclass
class EngineConfig:
    """Configuration for engines."""
    name: str
    enabled: bool = True
    max_workers: int = 10
    memory_limit: int = 2048  # MB
    custom_settings: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.custom_settings is None:
            self.custom_settings = {}

@dataclass
class Config:
    """General configuration class."""
    environment: str = "development"
    debug: bool = True
    log_level: str = "INFO"
    agent_config: AgentConfig = None
    engine_config: EngineConfig = None
    
    def __post_init__(self):
        if self.agent_config is None:
            self.agent_config = AgentConfig()
        if self.engine_config is None:
            self.engine_config = EngineConfig(name="default")

# Global config instance
_global_config = None

def get_config() -> Config:
    """Get global configuration instance."""
    global _global_config
    if _global_config is None:
        _global_config = Config()
    return _global_config

class ConfigLoader:
    """Centralized configuration management"""
    
    def __init__(self, config_dir: str = "config"):
        self.config_dir = Path(config_dir)
        self.environment = os.getenv("REVOAGENT_ENV", "development")
        
    def load_environment_config(self) -> Dict[str, Any]:
        """Load environment-specific configuration"""
        env_file = self.config_dir / "environments" / f"{self.environment}.yaml"
        if env_file.exists():
            with open(env_file) as f:
                return yaml.safe_load(f)
        return {}
    
    def load_agents_config(self) -> Dict[str, Any]:
        """Load agents configuration"""
        agents_file = self.config_dir / "agents" / "default.yaml"
        if agents_file.exists():
            with open(agents_file) as f:
                return yaml.safe_load(f)
        return {}
    
    def load_engines_config(self) -> Dict[str, Any]:
        """Load engines configuration"""
        engines_file = self.config_dir / "engines" / "default.yaml"
        if engines_file.exists():
            with open(engines_file) as f:
                return yaml.safe_load(f)
        return {}
    
    def load_agent_config(self) -> Dict[str, Any]:
        """Load agent configuration (alias for load_agents_config)"""
        return self.load_agents_config()
    
    def load_engine_config(self) -> Dict[str, Any]:
        """Load engine configuration (alias for load_engines_config)"""
        return self.load_engines_config()
    
    def load_all_config(self) -> Dict[str, Any]:
        """Load all configuration"""
        return {
            "environment": self.load_environment_config(),
            "agents": self.load_agents_config(),
            "engines": self.load_engines_config()
        }

# Global config instance
config = ConfigLoader()
