#!/usr/bin/env python3
"""
reVoAgent - Revolutionary Agentic Coding System Platform

Main entry point for the reVoAgent platform with integrated DeepSeek R1 support.
"""

import asyncio
import logging
import sys
import os
from pathlib import Path
import argparse

# Add src to path for imports
sys.path.insert(0, str(Path(__file__).parent / "src"))

from revoagent.core.framework import AgentFramework, TaskRequest
from revoagent.core.config import get_config
from revoagent.ui.cli import CLI
from revoagent.ui.web_dashboard import DashboardServer
from revoagent.model_layer.deepseek_provider import DeepSeekProvider, SystemDetector
from revoagent.model_layer.model_selector import ModelSelector, ModelSelectorCLI
from revoagent.platform_core.resource_manager import ResourceManager
from revoagent.platform_core.workflow_engine import WorkflowEngine


async def setup_model_provider(args) -> DeepSeekProvider:
    """Setup the AI model provider."""
    logger = logging.getLogger(__name__)
    
    if args.interactive_model_selection:
        # Interactive model selection
        logger.info("Starting interactive model selection...")
        cli_selector = ModelSelectorCLI()
        config = await cli_selector.run_interactive_selection()
        
        if config:
            selector = ModelSelector()
            provider = await selector.create_provider(
                config['model_name'],
                config['execution_mode'], 
                config['model_format']
            )
            if provider:
                logger.info("Model provider initialized successfully")
                return provider
            else:
                logger.error("Failed to initialize selected model")
                return None
        else:
            logger.info("No model selected, using default")
    
    # Auto-detect and setup DeepSeek provider
    logger.info("Auto-detecting optimal model configuration...")
    
    # Detect system capabilities
    capabilities = SystemDetector.detect_system()
    logger.info(f"System detected: {capabilities.cpu_cores} CPU cores, "
               f"{capabilities.total_ram_gb:.1f}GB RAM, "
               f"GPU: {capabilities.has_gpu} ({capabilities.gpu_name})")
    
    # Create provider with auto-detected settings
    execution_mode = None
    if args.cpu_only:
        execution_mode = "cpu"
    elif args.gpu_only and capabilities.has_gpu:
        execution_mode = "gpu"
    
    provider = DeepSeekProvider(execution_mode)
    
    logger.info("Initializing DeepSeek R1 model...")
    success = await provider.initialize()
    
    if success:
        logger.info("✅ DeepSeek R1 model loaded successfully!")
        
        # Show system info
        system_info = provider.get_system_info()
        logger.info(f"Using: {system_info['config']['execution_mode']} mode "
                   f"with {system_info['config']['model_format']} format")
        
        return provider
    else:
        logger.error("❌ Failed to load DeepSeek R1 model")
        return None


async def start_web_dashboard(framework, args):
    """Start the web dashboard if requested."""
    if not args.web_dashboard:
        return None
    
    logger = logging.getLogger(__name__)
    logger.info("Starting web dashboard...")
    
    dashboard = DashboardServer(
        agent_framework=framework,
        host=args.host,
        port=args.port
    )
    
    success = await dashboard.start()
    if success:
        logger.info(f"✅ Web dashboard started at http://{args.host}:{args.port}")
        return dashboard
    else:
        logger.error("❌ Failed to start web dashboard")
        return None


async def main():
    """Main entry point for reVoAgent."""
    # Parse command line arguments
    parser = argparse.ArgumentParser(description="reVoAgent - Agentic AI Coding System Platform")
    parser.add_argument("--mode", choices=["cli", "web", "both"], default="both",
                       help="Interface mode (default: both)")
    parser.add_argument("--host", default="0.0.0.0", 
                       help="Host for web dashboard (default: 0.0.0.0)")
    parser.add_argument("--port", type=int, default=12000,
                       help="Port for web dashboard (default: 12000)")
    parser.add_argument("--cpu-only", action="store_true",
                       help="Force CPU-only execution")
    parser.add_argument("--gpu-only", action="store_true", 
                       help="Force GPU execution (if available)")
    parser.add_argument("--interactive-model-selection", action="store_true",
                       help="Run interactive model selection")
    parser.add_argument("--log-level", choices=["DEBUG", "INFO", "WARNING", "ERROR"], 
                       default="INFO", help="Logging level")
    parser.add_argument("--workspace-dir", type=str, default="./workspace",
                       help="Workspace directory")
    parser.add_argument("--config-file", type=str, 
                       help="Custom configuration file")
    
    args = parser.parse_args()
    
    # Setup logging
    logging.basicConfig(
        level=getattr(logging, args.log_level),
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    logger = logging.getLogger(__name__)
    logger.info("🚀 Starting reVoAgent platform...")
    
    # Set environment variables
    os.environ["WORKSPACE_DIR"] = args.workspace_dir
    
    try:
        # Load configuration
        config = get_config(args.config_file)
        logger.info(f"Loaded configuration: {config.platform.name} v{config.platform.version}")
        
        # Setup model provider
        model_provider = await setup_model_provider(args)
        if not model_provider:
            logger.error("Failed to setup model provider. Exiting.")
            return 1
        
        # Initialize resource manager
        logger.info("Initializing resource manager...")
        resource_manager = ResourceManager()
        await resource_manager.start()
        
        # Initialize workflow engine
        logger.info("Initializing workflow engine...")
        workflow_engine = WorkflowEngine(None)  # Will be set after framework init
        
        # Initialize framework
        logger.info("Initializing agent framework...")
        framework = AgentFramework(config)
        framework.model_provider = model_provider
        framework.resource_manager = resource_manager
        framework.workflow_engine = workflow_engine
        workflow_engine.agent_framework = framework
        
        await framework.start()
        logger.info("✅ Agent framework initialized")
        
        # Start services based on mode
        dashboard = None
        cli = None
        
        if args.mode in ["web", "both"]:
            dashboard = await start_web_dashboard(framework, args)
        
        if args.mode in ["cli", "both"]:
            logger.info("Starting CLI interface...")
            cli = CLI(framework)
        
        # Show startup summary
        print("\n" + "="*60)
        print("🎉 reVoAgent Platform Started Successfully!")
        print("="*60)
        
        # Show system info
        system_info = model_provider.get_system_info()
        print(f"🤖 AI Model: {system_info['config']['model_name']}")
        print(f"⚙️  Execution: {system_info['config']['execution_mode']} mode")
        print(f"📦 Format: {system_info['config']['model_format']}")
        
        if dashboard:
            print(f"🌐 Web Dashboard: http://{args.host}:{args.port}")
        
        if cli:
            print(f"💻 CLI Interface: Available")
        
        print(f"📁 Workspace: {args.workspace_dir}")
        print("="*60)
        
        # Test model
        if not args.interactive_model_selection:
            print("\n🧪 Testing AI model...")
            try:
                test_response = await model_provider.generate_simple(
                    "Hello! Please introduce yourself briefly."
                )
                print(f"✅ Model test successful!")
                print(f"🤖 Response: {test_response[:100]}...")
            except Exception as e:
                print(f"⚠️  Model test failed: {e}")
        
        print("\n🚀 Ready for agentic AI coding tasks!")
        print("Press Ctrl+C to stop all services\n")
        
        # Start CLI if requested
        if cli:
            await cli.start()
        else:
            # Keep running for web-only mode
            try:
                while True:
                    await asyncio.sleep(1)
            except KeyboardInterrupt:
                pass
        
    except KeyboardInterrupt:
        logger.info("Received interrupt signal, shutting down...")
    except Exception as e:
        logger.error(f"Error in main: {e}")
        import traceback
        traceback.print_exc()
        return 1
    finally:
        # Cleanup
        logger.info("🛑 Shutting down reVoAgent platform...")
        
        if 'dashboard' in locals() and dashboard:
            await dashboard.stop()
        
        if 'framework' in locals():
            await framework.shutdown()
        
        if 'resource_manager' in locals():
            await resource_manager.stop()
        
        if 'workflow_engine' in locals():
            await workflow_engine.shutdown()
        
        if 'model_provider' in locals():
            model_provider.shutdown()
        
        logger.info("✅ reVoAgent platform stopped")
    
    return 0


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)