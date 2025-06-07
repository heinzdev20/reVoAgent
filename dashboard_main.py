#!/usr/bin/env python3
"""
reVoAgent Dashboard Main Entry Point

Launches the comprehensive dashboard system following the ASCII wireframe design.
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


class MockAgentFramework:
    """Mock agent framework for demonstration purposes."""
    
    def __init__(self):
        self.agents = {}
        self.workflows = {}
        self.models = {}
    
    def get_agent_status(self, agent_id: str):
        return self.agents.get(agent_id, {"status": "unknown"})
    
    def start_agent(self, agent_id: str):
        if agent_id in self.agents:
            self.agents[agent_id]["status"] = "active"
            return True
        return False
    
    def stop_agent(self, agent_id: str):
        if agent_id in self.agents:
            self.agents[agent_id]["status"] = "idle"
            return True
        return False


async def main():
    """Main entry point for the dashboard."""
    logger.info("🚀 Starting reVoAgent Dashboard v1.0 Production")
    
    # Initialize mock agent framework
    agent_framework = MockAgentFramework()
    
    # Create dashboard server
    dashboard = DashboardServer(
        agent_framework=agent_framework,
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