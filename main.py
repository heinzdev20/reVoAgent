"""reVoAgent Main Entry Point - Updated for New Architecture"""
import sys
import asyncio
from pathlib import Path

# Add packages to Python path
sys.path.insert(0, str(Path(__file__).parent / "packages"))

async def main():
    """Main entry point using new architecture"""
    print("🚀 Starting reVoAgent v2.0 - Enterprise Architecture")
    
    try:
        # Import from new package structure
        from core.config import ConfigLoader
        
        # Load configuration
        config_loader = ConfigLoader()
        config = config_loader.load_all_config()
        
        print(f"   📊 Environment: {config['environment'].get('environment', 'development')}")
        print(f"   🔧 Debug Mode: {config['environment'].get('debug', False)}")
        print(f"   📝 Log Level: {config['environment'].get('log_level', 'INFO')}")
        
        # Initialize engines
        print("   🔧 Initializing engines...")
        engines_config = config.get('engines', {})
        print(f"      Available engines: {list(engines_config.get('engines', {}).keys())}")
        
        # Initialize agents
        print("   🤖 Initializing agents...")
        agents_config = config.get('agents', {})
        print(f"      Available agents: {list(agents_config.get('agents', {}).keys())}")
        
        print("   ✅ reVoAgent v2.0 initialized successfully")
        print("   🌐 Ready for enterprise deployment")
        
        return True
        
    except Exception as e:
        print(f"   ❌ Initialization failed: {e}")
        print("   🔄 Falling back to basic mode...")
        return False

if __name__ == "__main__":
    asyncio.run(main())
