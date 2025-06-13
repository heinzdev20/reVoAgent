#!/usr/bin/env python3
"""
Phase 1 Features Demonstration Script
Shows the enhanced reVoAgent system capabilities in action
"""

import asyncio
import aiohttp
import time
import json
import logging
from pathlib import Path
import sys

# Add project root to path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class Phase1Demo:
    """
    Demonstrates Phase 1 critical hotspot improvements
    """
    
    def __init__(self):
        self.base_url = "http://localhost:12001"
        self.lb_url = "http://localhost:80"
    
    async def run_demo(self):
        """Run the complete Phase 1 demonstration"""
        logger.info("🎬 Starting Phase 1 Features Demonstration")
        logger.info("=" * 60)
        
        demos = [
            ("🔧 Circuit Breaker Demo", self.demo_circuit_breaker),
            ("🏥 Health Check Demo", self.demo_health_checks),
            ("📊 Performance Monitoring Demo", self.demo_performance_monitoring),
            ("⚖️ Load Balancer Demo", self.demo_load_balancing),
            ("💾 Caching System Demo", self.demo_caching),
            ("🚦 Rate Limiting Demo", self.demo_rate_limiting),
            ("📈 Monitoring Integration Demo", self.demo_monitoring),
            ("🛡️ Resilience Demo", self.demo_resilience)
        ]
        
        for demo_name, demo_func in demos:
            logger.info(f"\n{demo_name}")
            logger.info("-" * 40)
            try:
                await demo_func()
                logger.info("✅ Demo completed successfully")
            except Exception as e:
                logger.error(f"❌ Demo failed: {e}")
            
            await asyncio.sleep(1)  # Brief pause between demos
        
        logger.info("\n🎉 Phase 1 Demonstration Complete!")
        logger.info("=" * 60)
    
    async def demo_circuit_breaker(self):
        """Demonstrate circuit breaker functionality"""
        from apps.backend.middleware.circuit_breaker import CircuitBreaker, CircuitBreakerConfig
        
        # Create a circuit breaker for demo
        config = CircuitBreakerConfig(failure_threshold=3, timeout=5.0)
        cb = CircuitBreaker("demo_service", config)
        
        logger.info("Creating circuit breaker with 3 failure threshold...")
        
        # Simulate successful calls
        async def success_call():
            await asyncio.sleep(0.1)
            return "Success"
        
        for i in range(2):
            result = await cb.call(success_call)
            logger.info(f"  Call {i+1}: {result}")
        
        # Simulate failures
        async def failing_call():
            raise Exception("Service unavailable")
        
        logger.info("Simulating service failures...")
        for i in range(4):
            try:
                await cb.call(failing_call)
            except Exception as e:
                logger.info(f"  Failure {i+1}: Circuit breaker caught: {type(e).__name__}")
        
        # Show circuit breaker stats
        stats = cb.get_stats()
        logger.info(f"Circuit breaker state: {stats['state']}")
        logger.info(f"Success rate: {stats['success_rate']:.2%}")
    
    async def demo_health_checks(self):
        """Demonstrate health check system"""
        try:
            async with aiohttp.ClientSession() as session:
                # Test liveness probe
                async with session.get(f"{self.base_url}/health/live") as response:
                    data = await response.json()
                    logger.info(f"Liveness check: {data['status']}")
                
                # Test readiness probe
                async with session.get(f"{self.base_url}/health/ready") as response:
                    data = await response.json()
                    logger.info(f"Readiness check: {data['status']}")
                
                # Test comprehensive health
                async with session.get(f"{self.base_url}/health") as response:
                    data = await response.json()
                    services = data.get('services', {})
                    logger.info(f"Comprehensive health: {len(services)} services checked")
                    
                    for service, status in services.items():
                        service_status = status.get('status', 'unknown')
                        logger.info(f"  {service}: {service_status}")
        
        except Exception as e:
            logger.warning(f"Health check demo requires running backend: {e}")
    
    async def demo_performance_monitoring(self):
        """Demonstrate performance monitoring"""
        from apps.backend.middleware.performance import performance_monitor
        
        # Simulate some requests
        logger.info("Recording performance metrics...")
        
        endpoints = ["/api/chat", "/api/models", "/health"]
        
        for endpoint in endpoints:
            # Simulate request timing
            response_time = 0.05 + (hash(endpoint) % 100) / 1000  # Simulated response time
            performance_monitor.record_request(endpoint, response_time, True)
            logger.info(f"  {endpoint}: {response_time:.3f}s")
        
        # Get metrics
        metrics = performance_monitor.get_metrics()
        logger.info(f"Collected metrics for {len(metrics)} endpoints")
        
        for endpoint, metric in metrics.items():
            if metric['request_count'] > 0:
                logger.info(f"  {endpoint}: {metric['request_count']} requests, "
                          f"avg {metric['avg_response_time']:.3f}s")
    
    async def demo_load_balancing(self):
        """Demonstrate load balancing"""
        try:
            logger.info("Testing load balancer distribution...")
            
            response_times = []
            
            async with aiohttp.ClientSession() as session:
                # Make multiple requests through load balancer
                for i in range(5):
                    start_time = time.time()
                    try:
                        async with session.get(f"{self.lb_url}/api/health", timeout=5) as response:
                            response_time = time.time() - start_time
                            response_times.append(response_time)
                            logger.info(f"  Request {i+1}: {response.status} in {response_time:.3f}s")
                    except Exception as e:
                        logger.info(f"  Request {i+1}: Failed - {e}")
            
            if response_times:
                avg_time = sum(response_times) / len(response_times)
                logger.info(f"Average response time: {avg_time:.3f}s")
        
        except Exception as e:
            logger.warning(f"Load balancer demo requires NGINX running: {e}")
    
    async def demo_caching(self):
        """Demonstrate caching system"""
        from apps.backend.middleware.performance import cache_manager
        
        logger.info("Testing cache operations...")
        
        # Test data
        test_data = {
            "user_id": 12345,
            "preferences": {"theme": "dark", "language": "en"},
            "timestamp": time.time()
        }
        
        # Set cache
        cache_key = "demo_user_12345"
        set_result = await cache_manager.set(cache_key, test_data, ttl=300)
        logger.info(f"Cache set: {set_result}")
        
        # Get from cache
        cached_data = await cache_manager.get(cache_key)
        cache_hit = cached_data is not None
        logger.info(f"Cache get: {'HIT' if cache_hit else 'MISS'}")
        
        if cache_hit:
            logger.info(f"Cached data: {cached_data['user_id']}, theme: {cached_data['preferences']['theme']}")
        
        # Test cache performance
        start_time = time.time()
        for i in range(10):
            await cache_manager.get(cache_key)
        cache_time = time.time() - start_time
        logger.info(f"10 cache operations: {cache_time:.3f}s ({cache_time/10*1000:.1f}ms avg)")
    
    async def demo_rate_limiting(self):
        """Demonstrate rate limiting"""
        from apps.backend.middleware.performance import rate_limiter
        
        logger.info("Testing rate limiting...")
        
        test_key = "demo_client_123"
        limit = 3
        window = 60
        
        logger.info(f"Rate limit: {limit} requests per {window} seconds")
        
        allowed_count = 0
        denied_count = 0
        
        # Test rate limiting
        for i in range(6):
            allowed = await rate_limiter.is_allowed(test_key, limit, window)
            if allowed:
                allowed_count += 1
                logger.info(f"  Request {i+1}: ALLOWED")
            else:
                denied_count += 1
                logger.info(f"  Request {i+1}: DENIED (rate limited)")
        
        logger.info(f"Results: {allowed_count} allowed, {denied_count} denied")
    
    async def demo_monitoring(self):
        """Demonstrate monitoring integration"""
        try:
            async with aiohttp.ClientSession() as session:
                # Test metrics endpoint
                async with session.get(f"{self.base_url}/metrics") as response:
                    metrics_text = await response.text()
                    has_metrics = "revoagent_" in metrics_text
                    logger.info(f"Prometheus metrics: {'Available' if has_metrics else 'Not available'}")
                
                # Test performance endpoint
                async with session.get(f"{self.base_url}/api/performance") as response:
                    perf_data = await response.json()
                    logger.info(f"Performance data: {len(perf_data)} categories")
                    
                    if 'circuit_breakers' in perf_data:
                        cb_count = len(perf_data['circuit_breakers'])
                        logger.info(f"  Circuit breakers: {cb_count} active")
                    
                    if 'active_websockets' in perf_data:
                        ws_count = perf_data['active_websockets']
                        logger.info(f"  WebSocket connections: {ws_count}")
        
        except Exception as e:
            logger.warning(f"Monitoring demo requires running backend: {e}")
    
    async def demo_resilience(self):
        """Demonstrate system resilience"""
        logger.info("Testing system resilience...")
        
        # Test concurrent requests
        async def make_request(session, request_id):
            try:
                async with session.get(f"{self.base_url}/health", timeout=2) as response:
                    return f"Request {request_id}: {response.status}"
            except Exception as e:
                return f"Request {request_id}: Failed ({type(e).__name__})"
        
        try:
            async with aiohttp.ClientSession() as session:
                # Make 10 concurrent requests
                tasks = [make_request(session, i+1) for i in range(10)]
                results = await asyncio.gather(*tasks, return_exceptions=True)
                
                success_count = sum(1 for r in results if "200" in str(r))
                logger.info(f"Concurrent load test: {success_count}/10 requests succeeded")
                
                for result in results[:3]:  # Show first 3 results
                    logger.info(f"  {result}")
        
        except Exception as e:
            logger.warning(f"Resilience demo requires running backend: {e}")
    
    async def show_system_status(self):
        """Show current system status"""
        logger.info("\n📊 CURRENT SYSTEM STATUS")
        logger.info("=" * 40)
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.base_url}/health") as response:
                    health_data = await response.json()
                    
                    logger.info(f"Overall Status: {health_data.get('status', 'unknown').upper()}")
                    
                    services = health_data.get('services', {})
                    for service, status in services.items():
                        service_status = status.get('status', 'unknown')
                        response_time = status.get('response_time', 0)
                        logger.info(f"  {service}: {service_status} ({response_time:.3f}s)")
                    
                    summary = health_data.get('summary', {})
                    if summary:
                        total = summary.get('total_services', 0)
                        healthy = summary.get('healthy_services', 0)
                        logger.info(f"Service Health: {healthy}/{total} services healthy")
        
        except Exception as e:
            logger.warning(f"Could not get system status: {e}")
            logger.info("💡 Start the backend with: python apps/backend/enhanced_main.py")

async def main():
    """Main demo function"""
    demo = Phase1Demo()
    
    logger.info("🎭 reVoAgent Phase 1 Features Demonstration")
    logger.info("🔥 Critical Hotspot Improvements Showcase")
    logger.info("")
    
    # Show current system status
    await demo.show_system_status()
    
    # Run the demonstration
    await demo.run_demo()
    
    logger.info("\n🚀 Phase 1 Implementation Highlights:")
    logger.info("✅ Circuit Breaker Pattern - Resilient service calls")
    logger.info("✅ Health Check System - Comprehensive monitoring")
    logger.info("✅ Performance Optimization - Caching and compression")
    logger.info("✅ Load Balancing - NGINX with failover")
    logger.info("✅ Rate Limiting - API protection")
    logger.info("✅ Monitoring Integration - Prometheus metrics")
    logger.info("✅ System Resilience - Graceful degradation")
    logger.info("")
    logger.info("🎯 Ready for Phase 2: Multi-Agent Communication Optimization")

if __name__ == "__main__":
    asyncio.run(main())