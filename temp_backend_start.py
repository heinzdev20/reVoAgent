
import sys
import os
sys.path.insert(0, '/workspace/reVoAgent/src')
sys.path.insert(0, '/workspace/reVoAgent')

from packages.api.enterprise_api_server import EnterpriseAPIServer
import asyncio
import uvicorn

async def main():
    # Initialize the enterprise API server
    api_server = EnterpriseAPIServer()
    
    # Configure uvicorn
    config = uvicorn.Config(
        app=api_server.app,
        host="0.0.0.0",
        port=12001,
        log_level="info",
        reload=False,
        access_log=True
    )
    
    server = uvicorn.Server(config)
    await server.serve()

if __name__ == "__main__":
    asyncio.run(main())
