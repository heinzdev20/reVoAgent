#!/usr/bin/env python3
"""
Enhanced Backend Startup Script
Part of reVoAgent Next Phase Implementation
"""

import sys
import os
import asyncio
import logging
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def check_dependencies():
    """Check if required dependencies are installed"""
    required_packages = [
        'fastapi',
        'uvicorn',
        'websockets',
        'psutil',
        'aioredis'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package)
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        logger.error(f"Missing required packages: {', '.join(missing_packages)}")
        logger.info("Please install missing packages with: pip install " + " ".join(missing_packages))
        return False
    
    return True

def setup_environment():
    """Set up environment variables and configuration"""
    # Set default environment variables if not already set
    env_vars = {
        'REVOAGENT_ENV': 'development',
        'REVOAGENT_LOG_LEVEL': 'INFO',
        'REVOAGENT_HOST': '0.0.0.0',
        'REVOAGENT_PORT': '12000',
        'REDIS_URL': 'redis://localhost:6379'
    }
    
    for key, default_value in env_vars.items():
        if key not in os.environ:
            os.environ[key] = default_value
            logger.info(f"Set {key}={default_value}")

def main():
    """Main startup function"""
    logger.info("🚀 Starting reVoAgent Enhanced Backend...")
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Setup environment
    setup_environment()
    
    # Import and run the enhanced backend
    try:
        import uvicorn
        from apps.backend.enhanced_main import app
        
        host = os.environ.get('REVOAGENT_HOST', '0.0.0.0')
        port = int(os.environ.get('REVOAGENT_PORT', 12000))
        
        logger.info(f"Starting server on {host}:{port}")
        logger.info("Enhanced features enabled:")
        logger.info("  ✅ Real-time WebSocket communication")
        logger.info("  ✅ Agent coordination and monitoring")
        logger.info("  ✅ Production monitoring and alerting")
        logger.info("  ✅ Three-engine architecture")
        logger.info("  ✅ Memory integration")
        
        uvicorn.run(
            app,
            host=host,
            port=port,
            reload=False,
            log_level=os.environ.get('REVOAGENT_LOG_LEVEL', 'info').lower(),
            access_log=True
        )
        
    except ImportError as e:
        logger.error(f"Failed to import required modules: {e}")
        logger.info("Please ensure all dependencies are installed and the project structure is correct")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Failed to start server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()