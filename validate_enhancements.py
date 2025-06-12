#!/usr/bin/env python3
"""
Validation script for production readiness enhancements
Tests the implemented security headers, circuit breakers, and secrets management
"""

import asyncio
import sys
import time
from pathlib import Path

# Add packages to path
sys.path.insert(0, str(Path(__file__).parent))

async def test_security_middleware():
    """Test security middleware implementation"""
    print("🔒 Testing Security Middleware...")
    
    try:
        from apps.backend.middleware.security_middleware import (
            SecurityHeadersMiddleware,
            CORSSecurityMiddleware,
            RateLimitingMiddleware
        )
        
        # Test security headers configuration
        from fastapi import FastAPI
        from fastapi.testclient import TestClient
        
        app = FastAPI()
        app.add_middleware(SecurityHeadersMiddleware)
        
        @app.get("/test")
        async def test_endpoint():
            return {"message": "test"}
        
        client = TestClient(app)
        response = client.get("/test")
        
        # Check security headers
        required_headers = [
            "X-Content-Type-Options",
            "X-Frame-Options", 
            "X-XSS-Protection",
            "Strict-Transport-Security",
            "Content-Security-Policy"
        ]
        
        missing_headers = []
        for header in required_headers:
            if header not in response.headers:
                missing_headers.append(header)
        
        if missing_headers:
            print(f"❌ Missing security headers: {missing_headers}")
            return False
        else:
            print("✅ Security headers implemented correctly")
            return True
            
    except Exception as e:
        print(f"❌ Security middleware test failed: {str(e)}")
        return False

async def test_circuit_breaker():
    """Test circuit breaker implementation"""
    print("🔧 Testing Circuit Breaker...")
    
    try:
        from apps.backend.services.circuit_breaker_service import (
            CircuitBreaker,
            CircuitBreakerConfig,
            CircuitState
        )
        
        # Create circuit breaker
        config = CircuitBreakerConfig(failure_threshold=2, recovery_timeout=1)
        circuit = CircuitBreaker("test_circuit", config)
        
        # Test successful call
        async def success_func():
            return "success"
        
        result = await circuit.call(success_func)
        assert result == "success"
        assert circuit.stats.state == CircuitState.CLOSED
        
        # Test failure handling
        async def fail_func():
            raise Exception("Test failure")
        
        # Make failures to open circuit
        for i in range(2):
            try:
                await circuit.call(fail_func)
            except:
                pass
        
        # Circuit should be open
        assert circuit.stats.state == CircuitState.OPEN
        
        print("✅ Circuit breaker working correctly")
        return True
        
    except Exception as e:
        print(f"❌ Circuit breaker test failed: {str(e)}")
        return False

async def test_secrets_manager():
    """Test secrets manager implementation"""
    print("🔐 Testing Secrets Manager...")
    
    try:
        from apps.backend.security.secrets_manager import (
            EnvironmentSecretsManager,
            SecureSecretsManager
        )
        
        # Test environment secrets manager
        env_manager = EnvironmentSecretsManager()
        
        # Set and get a test secret
        await env_manager.set_secret("test_key", "test_value")
        retrieved_value = await env_manager.get_secret("test_key")
        
        assert retrieved_value == "test_value"
        
        # Test secure secrets manager with encryption
        secure_manager = SecureSecretsManager(env_manager)
        
        await secure_manager.set_secret("encrypted_key", "encrypted_value")
        decrypted_value = await secure_manager.get_secret("encrypted_key")
        
        assert decrypted_value == "encrypted_value"
        
        print("✅ Secrets manager working correctly")
        return True
        
    except Exception as e:
        print(f"❌ Secrets manager test failed: {str(e)}")
        return False

async def test_enhanced_api_integration():
    """Test enhanced API with security middleware"""
    print("🚀 Testing Enhanced API Integration...")
    
    try:
        from apps.backend.api.main import BackendApplication
        
        # Create backend application
        backend_app = BackendApplication()
        app = backend_app.get_app()
        
        # Test that middleware is properly configured
        middleware_names = [middleware.cls.__name__ for middleware in app.user_middleware]
        
        expected_middleware = [
            "SecurityHeadersMiddleware",
            "RateLimitingMiddleware", 
            "CORSSecurityMiddleware"
        ]
        
        missing_middleware = []
        for middleware_name in expected_middleware:
            if middleware_name not in middleware_names:
                missing_middleware.append(middleware_name)
        
        if missing_middleware:
            print(f"⚠️ Missing middleware: {missing_middleware}")
        else:
            print("✅ All security middleware properly integrated")
        
        return len(missing_middleware) == 0
        
    except Exception as e:
        print(f"❌ API integration test failed: {str(e)}")
        return False

async def test_performance_impact():
    """Test performance impact of enhancements"""
    print("⚡ Testing Performance Impact...")
    
    try:
        from fastapi import FastAPI
        from fastapi.testclient import TestClient
        from apps.backend.middleware.security_middleware import SecurityHeadersMiddleware
        
        # Test without middleware
        app_without = FastAPI()
        
        @app_without.get("/test")
        async def test_endpoint():
            return {"message": "test"}
        
        # Test with middleware
        app_with = FastAPI()
        app_with.add_middleware(SecurityHeadersMiddleware)
        
        @app_with.get("/test")
        async def test_endpoint_with_middleware():
            return {"message": "test"}
        
        client_without = TestClient(app_without)
        client_with = TestClient(app_with)
        
        # Measure performance
        iterations = 100
        
        # Without middleware
        start_time = time.time()
        for _ in range(iterations):
            response = client_without.get("/test")
            assert response.status_code == 200
        time_without = time.time() - start_time
        
        # With middleware
        start_time = time.time()
        for _ in range(iterations):
            response = client_with.get("/test")
            assert response.status_code == 200
        time_with = time.time() - start_time
        
        # Calculate overhead
        overhead_ms = ((time_with - time_without) / iterations) * 1000
        
        print(f"📊 Performance overhead: {overhead_ms:.2f}ms per request")
        
        # Should be minimal overhead (<5ms per request)
        if overhead_ms < 5.0:
            print("✅ Performance impact is acceptable")
            return True
        else:
            print("⚠️ Performance overhead is higher than expected")
            return False
            
    except Exception as e:
        print(f"❌ Performance test failed: {str(e)}")
        return False

async def main():
    """Run all validation tests"""
    print("🎯 PRODUCTION READINESS ENHANCEMENTS VALIDATION")
    print("=" * 60)
    
    tests = [
        ("Security Middleware", test_security_middleware),
        ("Circuit Breaker", test_circuit_breaker),
        ("Secrets Manager", test_secrets_manager),
        ("API Integration", test_enhanced_api_integration),
        ("Performance Impact", test_performance_impact)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"\n🧪 Running {test_name} test...")
        try:
            result = await test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} test failed with exception: {str(e)}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 VALIDATION RESULTS SUMMARY")
    print("=" * 60)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name:.<30} {status}")
        if result:
            passed += 1
    
    success_rate = (passed / total) * 100
    print(f"\nOverall Success Rate: {success_rate:.1f}% ({passed}/{total})")
    
    if success_rate >= 80:
        print("🎉 VALIDATION SUCCESSFUL - Enhancements are production ready!")
        return True
    else:
        print("⚠️ VALIDATION ISSUES - Some enhancements need attention")
        return False

if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)