#!/usr/bin/env python3
"""
Test script to verify critical fixes are working
Tests the core functionality without heavy dependencies
"""

import asyncio
import json
import logging
import sys
import time
from pathlib import Path

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def test_port_configuration():
    """Test that port configuration is correct"""
    logger.info("Testing port configuration...")
    
    # Check backend main.py
    backend_main = Path("src/backend/main.py")
    if backend_main.exists():
        with open(backend_main) as f:
            content = f.read()
            if "port=12001" in content:
                logger.info("✅ Backend port correctly set to 12001")
                return True
            else:
                logger.error("❌ Backend port not set to 12001")
                return False
    else:
        logger.error("❌ Backend main.py not found")
        return False

def test_frontend_configuration():
    """Test that frontend configuration is correct"""
    logger.info("Testing frontend configuration...")
    
    # Check vite.config.ts
    vite_config = Path("frontend/vite.config.ts")
    if vite_config.exists():
        with open(vite_config) as f:
            content = f.read()
            if "port: 12000" in content and "localhost:12001" in content:
                logger.info("✅ Frontend configuration correct")
                return True
            else:
                logger.error("❌ Frontend configuration incorrect")
                return False
    else:
        logger.error("❌ Frontend vite.config.ts not found")
        return False

def test_unified_app():
    """Test that UnifiedApp exists and is properly configured"""
    logger.info("Testing UnifiedApp...")
    
    # Check UnifiedApp.tsx
    unified_app = Path("frontend/src/UnifiedApp.tsx")
    if unified_app.exists():
        with open(unified_app) as f:
            content = f.read()
            if "UnifiedApp" in content and "ErrorBoundary" in content:
                logger.info("✅ UnifiedApp exists with error handling")
                return True
            else:
                logger.error("❌ UnifiedApp missing features")
                return False
    else:
        logger.error("❌ UnifiedApp.tsx not found")
        return False

def test_main_tsx_updated():
    """Test that main.tsx uses UnifiedApp"""
    logger.info("Testing main.tsx update...")
    
    # Check main.tsx
    main_tsx = Path("frontend/src/main.tsx")
    if main_tsx.exists():
        with open(main_tsx) as f:
            content = f.read()
            if "UnifiedApp" in content and "unifiedWebSocketService" in content:
                logger.info("✅ main.tsx updated to use UnifiedApp")
                return True
            else:
                logger.error("❌ main.tsx not updated")
                return False
    else:
        logger.error("❌ main.tsx not found")
        return False

def test_unified_websocket_service():
    """Test that unified WebSocket service exists"""
    logger.info("Testing unified WebSocket service...")
    
    # Check unifiedWebSocketService.ts
    ws_service = Path("frontend/src/services/unifiedWebSocketService.ts")
    if ws_service.exists():
        with open(ws_service) as f:
            content = f.read()
            if "UnifiedWebSocketService" in content and "ConnectionState" in content:
                logger.info("✅ Unified WebSocket service exists")
                return True
            else:
                logger.error("❌ Unified WebSocket service incomplete")
                return False
    else:
        logger.error("❌ Unified WebSocket service not found")
        return False

def test_memory_service():
    """Test that unified memory service exists"""
    logger.info("Testing unified memory service...")
    
    # Check unified memory service
    memory_service = Path("src/packages/memory/unified_memory_service.py")
    if memory_service.exists():
        with open(memory_service) as f:
            content = f.read()
            if "UnifiedMemoryService" in content and "graceful degradation" in content:
                logger.info("✅ Unified memory service exists")
                return True
            else:
                logger.error("❌ Unified memory service incomplete")
                return False
    else:
        logger.error("❌ Unified memory service not found")
        return False

def test_docker_configuration():
    """Test that Docker configuration is updated"""
    logger.info("Testing Docker configuration...")
    
    # Check docker-compose.yml
    docker_compose = Path("docker-compose.yml")
    if docker_compose.exists():
        with open(docker_compose) as f:
            content = f.read()
            if "12001:12001" in content and "12000:12000" in content:
                logger.info("✅ Docker configuration updated")
                return True
            else:
                logger.error("❌ Docker configuration not updated")
                return False
    else:
        logger.error("❌ docker-compose.yml not found")
        return False

def test_setup_scripts():
    """Test that setup scripts exist"""
    logger.info("Testing setup scripts...")
    
    # Check setup script
    setup_script = Path("scripts/setup_environment.py")
    if setup_script.exists():
        with open(setup_script) as f:
            content = f.read()
            if "EnvironmentSetup" in content and "automated" in content.lower():
                logger.info("✅ Setup scripts exist")
                return True
            else:
                logger.error("❌ Setup scripts incomplete")
                return False
    else:
        logger.error("❌ Setup scripts not found")
        return False

async def test_memory_service_functionality():
    """Test basic memory service functionality"""
    logger.info("Testing memory service functionality...")
    
    try:
        # Import the memory service
        sys.path.insert(0, "src")
        from packages.memory.unified_memory_service import unified_memory_service
        
        # Initialize the service
        if await unified_memory_service.initialize():
            logger.info("✅ Memory service initialized successfully")
            
            # Test basic operations
            entry_id = await unified_memory_service.store("Test content", {"test": True})
            if entry_id:
                logger.info("✅ Memory service can store data")
                
                # Test retrieval
                entry = await unified_memory_service.retrieve(entry_id)
                if entry and entry.content == "Test content":
                    logger.info("✅ Memory service can retrieve data")
                    return True
                else:
                    logger.error("❌ Memory service retrieval failed")
                    return False
            else:
                logger.error("❌ Memory service storage failed")
                return False
        else:
            logger.error("❌ Memory service initialization failed")
            return False
    except Exception as e:
        logger.error(f"❌ Memory service test failed: {e}")
        return False

def main():
    """Run all tests"""
    logger.info("🚀 Running critical fixes validation...")
    
    tests = [
        ("Port Configuration", test_port_configuration),
        ("Frontend Configuration", test_frontend_configuration),
        ("UnifiedApp", test_unified_app),
        ("Main.tsx Update", test_main_tsx_updated),
        ("Unified WebSocket Service", test_unified_websocket_service),
        ("Unified Memory Service", test_memory_service),
        ("Docker Configuration", test_docker_configuration),
        ("Setup Scripts", test_setup_scripts),
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            logger.error(f"❌ {test_name} test failed with exception: {e}")
            results.append((test_name, False))
    
    # Run async tests
    async_tests = [
        ("Memory Service Functionality", test_memory_service_functionality),
    ]
    
    for test_name, test_func in async_tests:
        try:
            result = asyncio.run(test_func())
            results.append((test_name, result))
        except Exception as e:
            logger.error(f"❌ {test_name} test failed with exception: {e}")
            results.append((test_name, False))
    
    # Summary
    logger.info("\n" + "="*60)
    logger.info("CRITICAL FIXES VALIDATION SUMMARY")
    logger.info("="*60)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        logger.info(f"{test_name:<30} {status}")
        if result:
            passed += 1
    
    logger.info("="*60)
    logger.info(f"TOTAL: {passed}/{total} tests passed ({passed/total*100:.1f}%)")
    
    if passed == total:
        logger.info("🎉 ALL CRITICAL FIXES VALIDATED SUCCESSFULLY!")
        logger.info("\nNext steps:")
        logger.info("1. Install Node.js dependencies: cd frontend && npm install")
        logger.info("2. Start backend: python src/backend/main.py")
        logger.info("3. Start frontend: cd frontend && npm run dev")
        logger.info("4. Access application at http://localhost:12000")
        return True
    else:
        logger.error("❌ Some critical fixes failed validation")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)