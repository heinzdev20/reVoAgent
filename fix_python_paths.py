#!/usr/bin/env python3
"""
Fix Python import paths for reVoAgent
Run this script to fix import issues
"""

import os
import sys
from pathlib import Path

# Add project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

# Create __init__.py files where missing
init_files = [
    "packages/__init__.py",
    "packages/ai/__init__.py",
    "packages/core/__init__.py",
    "packages/agents/__init__.py",
    "packages/engines/__init__.py",
    "packages/integrations/__init__.py",
    "packages/memory/__init__.py",
    "packages/tools/__init__.py",
    "apps/__init__.py",
    "apps/backend/__init__.py",
]

for init_file in init_files:
    init_path = project_root / init_file
    init_path.parent.mkdir(parents=True, exist_ok=True)
    if not init_path.exists():
        init_path.write_text('# Auto-generated __init__.py\n')
        print(f"✅ Created {init_file}")

print("🐍 Python paths fixed!")
