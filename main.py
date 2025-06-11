#!/usr/bin/env python3
"""
reVoAgent - Enterprise AI Development Platform
Main entry point for the refactored application
"""

import asyncio
import sys
import uvicorn
from pathlib import Path

# Add packages to path
sys.path.insert(0, str(Path(__file__).parent))

from apps.backend.api.main import create_app

async def main():
    """Main application entry point"""
    print("🚀 Starting reVoAgent Enterprise AI Platform (Refactored Backend)...")
    print("🔧 Features:")
    print("   - Enhanced AI Model Manager with 95% cost savings")
    print("   - 100-Agent Team Coordination")
    print("   - Real-time Quality Gates")
    print("   - Performance Monitoring Dashboard")
    print("   - Cost Optimization Router")
    
    app = await create_app()
    return app

if __name__ == "__main__":
    # Run with uvicorn for development
    uvicorn.run(
        "apps.backend.api.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
