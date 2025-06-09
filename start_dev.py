#!/usr/bin/env python3
"""Development Startup Script"""
import os
import sys
from pathlib import Path

# Set environment
os.environ["REVOAGENT_ENV"] = "development"

# Add packages to path
sys.path.insert(0, str(Path(__file__).parent / "packages"))

if __name__ == "__main__":
    from main import main
    import asyncio
    asyncio.run(main())
