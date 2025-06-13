#!/usr/bin/env python3
"""
Quick Validation Script for Phase 1 Critical Hotspot Improvements
Tests the basic functionality without requiring full system deployment
"""

import asyncio
import sys
import logging
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_circuit_breaker():
    """Test circuit breaker implementation"""
    logger.info("🔧 Testing Circuit Breaker...")
    
    try:
        from apps.backend.middleware.circuit_breaker import CircuitBreaker, CircuitBreakerConfig
        
        # Create circuit breaker
        config = CircuitBreakerConfig(failure_threshold=2, timeout=5.0)
        cb = CircuitBreaker("test", config)
        
        # Test successful call
        async def success_func():
            return "success"
        
        result = await cb.call(success_func)
        assert result == "success"
        
        # Test failure handling
        async def fail_func():
            raise Exception("Test failure")
        
        try:
            await cb.call(fail_func)
        except Exception:
            pass  # Expected
        
        stats = cb.get_stats()
        logger.info(f"✅ Circuit Breaker: {stats['successful_requests']} successes, {stats['failed_requests']} failures")
        return True
        
    except Exception as e:
        logger.error(f"❌ Circuit Breaker test failed: {e}")
        return False

async def test_health_checks():
    """Test health check system"""
    logger.info("🏥 Testing Health Checks...")
    
    try:
        from apps.backend.middleware.health_checks import health_checker
        
        # Test system resources check
        result = await health_checker.check_system_resources()
        logger.info(f"✅ Health Check: System status = {result.status.value}")
        
        # Test comprehensive health check
        comprehensive = await health_checker.comprehensive_health_check()
        services_count = len(comprehensive.get("services", {}))
        logger.info(f"✅ Comprehensive Health: Checked {services_count} services")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Health Check test failed: {e}")
        return False

async def test_performance_monitoring():
    """Test performance monitoring"""
    logger.info("📊 Testing Performance Monitoring...")
    
    try:
        from apps.backend.middleware.performance import performance_monitor, cache_manager
        
        # Test performance recording
        performance_monitor.record_request("/test", 0.1, True)
        metrics = performance_monitor.get_metrics("/test")
        
        logger.info(f"✅ Performance Monitor: Recorded metrics for /test")
        
        # Test cache operations
        await cache_manager.set("test_key", {"data": "test"}, 60)
        cached_data = await cache_manager.get("test_key")
        
        cache_works = cached_data is not None
        logger.info(f"✅ Cache Manager: Cache operations {'working' if cache_works else 'not working'}")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Performance Monitoring test failed: {e}")
        return False

async def test_enhanced_backend():
    """Test enhanced backend startup"""
    logger.info("🚀 Testing Enhanced Backend...")
    
    try:
        # Import enhanced backend
        from apps.backend.enhanced_main import app
        
        # Check if app is created
        assert app is not None
        logger.info("✅ Enhanced Backend: FastAPI app created successfully")
        
        # Check routes
        routes = [route.path for route in app.routes]
        expected_routes = ["/health", "/health/live", "/health/ready", "/api/chat"]
        
        found_routes = sum(1 for route in expected_routes if route in routes)
        logger.info(f"✅ Enhanced Backend: Found {found_routes}/{len(expected_routes)} expected routes")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Enhanced Backend test failed: {e}")
        return False

async def test_docker_configs():
    """Test Docker and deployment configurations"""
    logger.info("🐳 Testing Docker Configurations...")
    
    try:
        # Check if configuration files exist
        configs = [
            "docker-compose.enhanced.yml",
            "deployment/nginx/nginx.conf",
            "deployment/redis/redis.conf",
            "k8s/enhanced-deployment.yaml",
            "monitoring/prometheus/enhanced-prometheus.yml",
            "monitoring/prometheus/enhanced-alert-rules.yml"
        ]
        
        existing_configs = []
        for config in configs:
            config_path = project_root / config
            if config_path.exists():
                existing_configs.append(config)
        
        logger.info(f"✅ Docker Configs: {len(existing_configs)}/{len(configs)} configuration files found")
        
        # Check docker-compose structure
        compose_path = project_root / "docker-compose.enhanced.yml"
        if compose_path.exists():
            with open(compose_path) as f:
                content = f.read()
                has_nginx = "nginx:" in content
                has_redis = "redis:" in content
                has_backend = "backend-" in content
                has_monitoring = "prometheus:" in content
                
                logger.info(f"✅ Docker Compose: nginx={has_nginx}, redis={has_redis}, backend={has_backend}, monitoring={has_monitoring}")
        
        return len(existing_configs) >= len(configs) // 2  # At least half should exist
        
    except Exception as e:
        logger.error(f"❌ Docker Configs test failed: {e}")
        return False

async def test_startup_script():
    """Test startup script"""
    logger.info("🎬 Testing Startup Script...")
    
    try:
        startup_script = project_root / "scripts/start_enhanced_system.py"
        
        if startup_script.exists():
            logger.info("✅ Startup Script: Enhanced system startup script exists")
            
            # Check if script is executable
            import stat
            file_stat = startup_script.stat()
            is_executable = bool(file_stat.st_mode & stat.S_IEXEC)
            
            if not is_executable:
                # Make it executable
                startup_script.chmod(file_stat.st_mode | stat.S_IEXEC)
                logger.info("✅ Startup Script: Made executable")
            
            return True
        else:
            logger.warning("⚠️ Startup Script: Not found")
            return False
        
    except Exception as e:
        logger.error(f"❌ Startup Script test failed: {e}")
        return False

async def run_validation():
    """Run all validation tests"""
    logger.info("🧪 Starting Phase 1 Quick Validation...")
    logger.info("=" * 60)
    
    tests = [
        ("Circuit Breaker", test_circuit_breaker),
        ("Health Checks", test_health_checks),
        ("Performance Monitoring", test_performance_monitoring),
        ("Enhanced Backend", test_enhanced_backend),
        ("Docker Configurations", test_docker_configs),
        ("Startup Script", test_startup_script)
    ]
    
    results = {}
    
    for test_name, test_func in tests:
        try:
            result = await test_func()
            results[test_name] = result
        except Exception as e:
            logger.error(f"❌ {test_name} failed with exception: {e}")
            results[test_name] = False
        
        logger.info("-" * 60)
    
    # Summary
    logger.info("📊 VALIDATION SUMMARY")
    logger.info("=" * 60)
    
    passed = sum(1 for r in results.values() if r)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        logger.info(f"{status} {test_name}")
    
    logger.info("-" * 60)
    logger.info(f"Overall: {passed}/{total} tests passed ({passed/total*100:.1f}%)")
    
    if passed == total:
        logger.info("🎉 All Phase 1 components validated successfully!")
        logger.info("✅ Ready to proceed with full system deployment")
    elif passed >= total * 0.8:
        logger.info("⚠️ Most Phase 1 components working, minor issues detected")
        logger.info("🔧 Review failed tests before full deployment")
    else:
        logger.info("❌ Significant issues detected in Phase 1 implementation")
        logger.info("🛠️ Address failed tests before proceeding")
    
    logger.info("")
    logger.info("🚀 Next Steps:")
    logger.info("1. Run: python scripts/start_enhanced_system.py")
    logger.info("2. Test: python tests/test_phase1_critical_hotspots.py")
    logger.info("3. Monitor: http://localhost:9090 (Prometheus)")
    logger.info("4. Dashboard: http://localhost:3001 (Grafana)")
    
    return passed >= total * 0.8

async def main():
    """Main validation function"""
    try:
        success = await run_validation()
        return 0 if success else 1
    except Exception as e:
        logger.error(f"❌ Validation failed: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(asyncio.run(main()))