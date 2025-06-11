#!/usr/bin/env python3
"""
reVoAgent - Enterprise AI Development Platform
Main entry point for the application
"""

import asyncio
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from backend.main import create_app

async def main():
    """Main application entry point"""
    app = await create_app()
    return app

if __name__ == "__main__":
    print("🚀 Starting reVoAgent Enterprise AI Platform...")
    asyncio.run(main())
