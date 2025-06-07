#!/usr/bin/env python3
"""
reVoAgent - Revolutionary Agentic Coding System Platform

Main entry point for the reVoAgent platform.
"""

import asyncio
import logging
import sys
from pathlib import Path

# Add src to path for imports
sys.path.insert(0, str(Path(__file__).parent / "src"))

from revoagent.core.framework import AgentFramework, TaskRequest
from revoagent.core.config import get_config
from revoagent.ui.cli import CLI


async def main():
    """Main entry point for reVoAgent."""
    # Setup logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    logger = logging.getLogger(__name__)
    logger.info("Starting reVoAgent platform...")
    
    try:
        # Load configuration
        config = get_config()
        logger.info(f"Loaded configuration: {config.platform.name} v{config.platform.version}")
        
        # Initialize framework
        framework = AgentFramework(config)
        logger.info("Agent framework initialized")
        
        # Start CLI interface
        cli = CLI(framework)
        await cli.start()
        
    except KeyboardInterrupt:
        logger.info("Received interrupt signal, shutting down...")
    except Exception as e:
        logger.error(f"Error in main: {e}")
        raise
    finally:
        # Cleanup
        if 'framework' in locals():
            await framework.shutdown()
        logger.info("reVoAgent platform stopped")


if __name__ == "__main__":
    asyncio.run(main())