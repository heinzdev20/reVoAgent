#!/usr/bin/env python3
"""
Simple reVoAgent Dashboard Launcher

Launches the dashboard without full framework dependencies for demonstration.
"""

import asyncio
import logging
import sys
from pathlib import Path

# Add the src directory to the Python path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from revoagent.ui.web_dashboard.dashboard_server import DashboardServer
from revoagent.ui.web_dashboard.websocket_manager import WebSocketManager

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)


class SimpleMockFramework:
    """Simplified mock framework for dashboard demonstration."""
    
    def __init__(self):
        self.name = "reVoAgent"
        self.version = "1.0.0"
        logger.info("Initialized SimpleMockFramework")


async def main():
    """Main entry point for the simple dashboard."""
    logger.info("🚀 Starting reVoAgent Dashboard v1.0 Production (Simple Mode)")
    
    # Initialize mock framework
    framework = SimpleMockFramework()
    
    # Create dashboard server
    dashboard = DashboardServer(
        agent_framework=framework,
        host="0.0.0.0",
        port=12000
    )
    
    try:
        logger.info("Dashboard server starting on http://0.0.0.0:12000")
        logger.info("Access the dashboard at: https://work-1-rekgohnxrxqrmled.prod-runtime.all-hands.dev")
        
        # Start the server
        import uvicorn
        config = uvicorn.Config(
            app=dashboard.app,
            host=dashboard.host,
            port=dashboard.port,
            log_level="info",
            access_log=True
        )
        server = uvicorn.Server(config)
        await server.serve()
        
    except KeyboardInterrupt:
        logger.info("Dashboard server stopped by user")
    except Exception as e:
        logger.error(f"Error starting dashboard server: {e}")
        raise


if __name__ == "__main__":
    asyncio.run(main())