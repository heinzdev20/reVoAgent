#!/usr/bin/env python3
"""
🚀 Production Backend Server Starter
Starts the enterprise backend with all services
"""

import asyncio
import uvicorn
import sys
import os
from pathlib import Path

# Add project paths
sys.path.append('src')
sys.path.append('apps')
sys.path.append('packages')

# Import our enterprise backend
from apps.backend.api.main import app

def start_production_server():
    """Start the production backend server"""
    print("🚀 STARTING PRODUCTION BACKEND SERVER")
    print("=" * 50)
    print("🔧 Port: 12001")
    print("🔧 Environment: Production")
    print("🔧 Features: 100-Agent Coordination, Three-Engine Architecture")
    print("🔧 Quality Gates: Enabled")
    print("🔧 Cost Optimization: Enabled")
    print("=" * 50)
    
    # Configure for production
    config = uvicorn.Config(
        app=app,
        host="0.0.0.0",
        port=12001,
        log_level="info",
        access_log=True,
        reload=False,  # Production mode
        workers=1,  # Single worker for now
    )
    
    server = uvicorn.Server(config)
    
    try:
        server.run()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Server error: {e}")

if __name__ == "__main__":
    start_production_server()