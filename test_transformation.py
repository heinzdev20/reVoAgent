#!/usr/bin/env python3
"""
reVoAgent Transformation Test Script
Tests the new transformation components

This script demonstrates the new components implemented as part of the
comprehensive transformation strategy.
"""

import asyncio
import sys
import os
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from packages.ai.intelligent_model_manager import (
    IntelligentModelManager,
    IntelligentGenerationRequest,
    ModelProvider
)
from packages.config.unified_config_manager import (
    UnifiedConfigurationManager,
    Environment
)

async def test_configuration_manager():
    """Test the Unified Configuration Manager"""
    print("🔧 Testing Unified Configuration Manager...")
    
    try:
        # Initialize configuration manager
        config_manager = UnifiedConfigurationManager(
            config_dir="config",
            environment="development"
        )
        
        config = await config_manager.initialize()
        
        print(f"✅ Environment: {config.environment.value}")
        print(f"✅ Database Host: {config.database.host}")
        print(f"✅ Server Port: {config.server.port}")
        print(f"✅ AI Models: {list(config.ai_models.keys())}")
        
        return True
        
    except Exception as e:
        print(f"❌ Configuration Manager test failed: {e}")
        return False

async def test_intelligent_model_manager():
    """Test the Intelligent Model Manager"""
    print("\n🤖 Testing Intelligent Model Manager...")
    
    try:
        # Configuration for the model manager
        config = {
            "deepseek_r1_path": "deepseek-ai/deepseek-r1-distill-qwen-1.5b",
            "llama_path": "meta-llama/Llama-2-7b-chat-hf",
        }
        
        # Initialize the model manager
        manager = IntelligentModelManager(config)
        await manager.initialize()
        
        print(f"✅ Available Providers: {[p.value for p in manager.available_providers]}")
        
        # Test generation
        request = IntelligentGenerationRequest(
            prompt="Write a Python function to calculate fibonacci numbers",
            task_type="code_generation",
            quality_threshold=0.8
        )
        
        response = await manager.generate_intelligent(request)
        
        print(f"✅ Provider: {response.provider.value}")
        print(f"✅ Quality Score: {response.quality_score:.2f}")
        print(f"✅ Cost: ${response.cost:.4f}")
        
        # Test cost analysis
        cost_analysis = manager.get_cost_analysis()
        print(f"✅ Local Percentage: {cost_analysis['local_percentage']:.1f}%")
        
        return True
        
    except Exception as e:
        print(f"❌ Intelligent Model Manager test failed: {e}")
        return False

async def main():
    """Main test function"""
    print("🚀 reVoAgent Transformation Test Suite")
    print("=" * 50)
    
    test_results = []
    
    # Test configuration manager
    result1 = await test_configuration_manager()
    test_results.append(("Configuration Manager", result1))
    
    # Test intelligent model manager
    result2 = await test_intelligent_model_manager()
    test_results.append(("Intelligent Model Manager", result2))
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Test Results Summary:")
    
    passed = 0
    total = len(test_results)
    
    for test_name, result in test_results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{status} {test_name}")
        if result:
            passed += 1
    
    print(f"\n🎯 Overall: {passed}/{total} tests passed ({(passed/total)*100:.1f}%)")
    
    if passed == total:
        print("🎉 All transformation components are working correctly!")
        print("🚀 Ready to proceed with next phase of transformation.")
    else:
        print("⚠️ Some components need attention before proceeding.")
    
    return passed == total

if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)