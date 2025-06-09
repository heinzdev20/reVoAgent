"""Centralized Configuration Loader"""
import yaml
from pathlib import Path
from typing import Dict, Any
import os

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
    
    def load_all_config(self) -> Dict[str, Any]:
        """Load all configuration"""
        return {
            "environment": self.load_environment_config(),
            "agents": self.load_agents_config(),
            "engines": self.load_engines_config()
        }

# Global config instance
config = ConfigLoader()
