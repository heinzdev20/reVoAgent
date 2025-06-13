#!/usr/bin/env python3
"""
Phase 4 Comprehensive Monitoring & Continuous Improvement - Validation Script

This script validates all Phase 4 monitoring components:
1. System Metrics Collection
2. Application Metrics & Tracing
3. Performance Profiling
4. Alert Management
5. Load Testing
6. Continuous Optimization
7. Health Dashboard
8. Integrated Phase 4 System
"""

import asyncio
import json
import logging
import sys
import time
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Any

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Add packages to path
sys.path.insert(0, str(Path(__file__).parent))

async def test_system_metrics_collector():
    """Test System Metrics Collector"""
    logger.info("🔍 Testing System Metrics Collector...")
    
    try:
        from packages.monitoring.system_metrics import get_system_metrics_collector
        
        collector = await get_system_metrics_collector()
        
        # Test basic functionality
        assert collector is not None, "Failed to create system metrics collector"
        
        # Test metrics collection
        await collector._collect_metrics()
        
        # Test current metrics
        current_metrics = collector.get_current_metrics()
        if current_metrics:
            assert current_metrics.cpu_percent >= 0, "Invalid CPU percentage"
            assert current_metrics.memory_percent >= 0, "Invalid memory percentage"
            assert current_metrics.disk_percent >= 0, "Invalid disk percentage"
        
        # Test metrics summary
        summary = collector.get_metrics_summary()
        assert isinstance(summary, dict), "Invalid metrics summary format"
        assert 'status' in summary, "Missing status in summary"
        
        # Test performance trends
        trends = await collector.get_performance_trends(hours=1)
        assert isinstance(trends, dict), "Invalid trends format"
        
        logger.info("✅ System Metrics Collector: PASSED")
        return True
        
    except Exception as e:
        logger.error(f"❌ System Metrics Collector: FAILED - {e}")
        return False

async def test_application_metrics_collector():
    """Test Application Metrics Collector"""
    logger.info("🔍 Testing Application Metrics Collector...")
    
    try:
        from packages.monitoring.application_metrics import (
            get_app_metrics_collector, MetricType, TraceContext
        )
        
        collector = await get_app_metrics_collector()
        
        # Test basic functionality
        assert collector is not None, "Failed to create application metrics collector"
        
        # Test request tracing
        trace_id = collector.start_trace("test_operation")
        assert trace_id is not None, "Failed to start trace"
        
        collector.add_trace_tag(trace_id, "test_key", "test_value")
        collector.add_trace_log(trace_id, "Test log message")
        collector.finish_trace(trace_id, status_code=200)
        
        # Test business metrics
        collector.record_business_metric("test_counter", 1.0, MetricType.COUNTER)
        collector.set_gauge("test_gauge", 50.0)
        collector.record_timer("test_timer", 100.0)
        
        # Test context manager
        with TraceContext(collector, "context_test") as ctx_trace_id:
            assert ctx_trace_id is not None, "Failed to create trace context"
        
        # Test metrics aggregation
        await collector.aggregate_metrics()
        
        # Test metrics summary
        summary = collector.get_metrics_summary()
        assert isinstance(summary, dict), "Invalid metrics summary format"
        assert summary['business_metrics_count'] > 0, "No business metrics recorded"
        
        # Test API performance
        api_performance = collector.get_api_performance()
        assert isinstance(api_performance, dict), "Invalid API performance format"
        
        # Test alerts generation
        alerts = await collector.generate_alerts()
        assert isinstance(alerts, list), "Invalid alerts format"
        
        logger.info("✅ Application Metrics Collector: PASSED")
        return True
        
    except Exception as e:
        logger.error(f"❌ Application Metrics Collector: FAILED - {e}")
        return False

async def test_performance_profiler():
    """Test Performance Profiler"""
    logger.info("🔍 Testing Performance Profiler...")
    
    try:
        from packages.monitoring.performance_profiler import get_performance_profiler
        
        profiler = await get_performance_profiler()
        
        # Test basic functionality
        assert profiler is not None, "Failed to create performance profiler"
        
        # Test function profiling decorator
        @profiler.profile_function
        async def test_async_function():
            await asyncio.sleep(0.1)
            return "test_result"
        
        @profiler.profile_function
        def test_sync_function():
            time.sleep(0.05)
            return "sync_result"
        
        # Test decorated functions
        result1 = await test_async_function()
        assert result1 == "test_result", "Async function profiling failed"
        
        result2 = test_sync_function()
        assert result2 == "sync_result", "Sync function profiling failed"
        
        # Test performance summary
        summary = profiler.get_performance_summary()
        assert isinstance(summary, dict), "Invalid performance summary format"
        assert 'profiling_active' in summary, "Missing profiling status"
        
        # Test function performance
        func_performance = profiler.get_function_performance()
        assert isinstance(func_performance, dict), "Invalid function performance format"
        
        # Test optimization recommendations
        recommendations = profiler.get_optimization_recommendations()
        assert isinstance(recommendations, list), "Invalid recommendations format"
        
        logger.info("✅ Performance Profiler: PASSED")
        return True
        
    except Exception as e:
        logger.error(f"❌ Performance Profiler: FAILED - {e}")
        return False

async def test_alert_manager():
    """Test Alert Manager"""
    logger.info("🔍 Testing Alert Manager...")
    
    try:
        from packages.monitoring.alert_manager import (
            get_alert_manager, AlertRule, AlertSeverity, NotificationChannel
        )
        
        alert_manager = await get_alert_manager()
        
        # Test basic functionality
        assert alert_manager is not None, "Failed to create alert manager"
        
        # Test custom alert rule
        custom_rule = AlertRule(
            name="test_alert_rule",
            condition="cpu_percent > threshold",
            severity=AlertSeverity.WARNING,
            threshold=50.0,
            duration_minutes=1,
            channels=[NotificationChannel.WEBHOOK],
            description="Test alert rule"
        )
        
        alert_manager.add_alert_rule(custom_rule)
        
        # Test metric provider
        async def test_metric_provider():
            return {"cpu_percent": 60.0, "memory_percent": 70.0}
        
        alert_manager.add_metric_provider(test_metric_provider)
        
        # Test alert evaluation
        await alert_manager._evaluate_alerts()
        
        # Test alert summary
        summary = alert_manager.get_alert_summary()
        assert isinstance(summary, dict), "Invalid alert summary format"
        assert 'total_rules' in summary, "Missing total rules in summary"
        
        # Test active alerts
        active_alerts = alert_manager.get_active_alerts()
        assert isinstance(active_alerts, list), "Invalid active alerts format"
        
        # Test alert history
        alert_history = alert_manager.get_alert_history(hours=1)
        assert isinstance(alert_history, list), "Invalid alert history format"
        
        logger.info("✅ Alert Manager: PASSED")
        return True
        
    except Exception as e:
        logger.error(f"❌ Alert Manager: FAILED - {e}")
        return False

async def test_load_tester():
    """Test Load Tester"""
    logger.info("🔍 Testing Load Tester...")
    
    try:
        from packages.monitoring.load_tester import (
            get_load_tester, LoadTestConfig, LoadTestType
        )
        
        load_tester = await get_load_tester()
        
        # Test basic functionality
        assert load_tester is not None, "Failed to create load tester"
        
        # Test load test configuration
        test_config = LoadTestConfig(
            name="Test Load Test",
            test_type=LoadTestType.SMOKE,
            target_url="http://httpbin.org/get",  # Use public test endpoint
            duration_seconds=10,
            concurrent_users=2,
            ramp_up_seconds=2,
            ramp_down_seconds=2
        )
        
        # Start load test
        test_id = await load_tester.run_load_test(test_config)
        assert test_id is not None, "Failed to start load test"
        
        # Wait a bit for test to start
        await asyncio.sleep(3)
        
        # Test status checking
        status = load_tester.get_test_status(test_id)
        assert status is not None, "Failed to get test status"
        assert 'test_id' in status, "Missing test_id in status"
        
        # Test summary
        summary = load_tester.get_load_test_summary()
        assert isinstance(summary, dict), "Invalid load test summary format"
        assert 'running_tests' in summary, "Missing running tests in summary"
        
        # Wait for test to complete (or timeout)
        timeout = 30
        while timeout > 0 and test_id in load_tester.running_tests:
            await asyncio.sleep(1)
            timeout -= 1
        
        logger.info("✅ Load Tester: PASSED")
        return True
        
    except Exception as e:
        logger.error(f"❌ Load Tester: FAILED - {e}")
        return False

async def test_continuous_optimizer():
    """Test Continuous Optimizer"""
    logger.info("🔍 Testing Continuous Optimizer...")
    
    try:
        from packages.monitoring.continuous_optimizer import (
            get_continuous_optimizer, OptimizationType, OptimizationPriority
        )
        
        optimizer = await get_continuous_optimizer()
        
        # Test basic functionality
        assert optimizer is not None, "Failed to create continuous optimizer"
        
        # Test metric provider
        async def test_metric_provider():
            return {
                "cpu_percent": 85.0,  # High CPU to trigger optimization
                "memory_percent": 70.0,
                "avg_response_time_ms": 1500.0
            }
        
        optimizer.add_metric_provider(test_metric_provider)
        
        # Test optimization analysis
        await optimizer._run_optimization_analysis()
        
        # Test optimization summary
        summary = optimizer.get_optimization_summary()
        assert isinstance(summary, dict), "Invalid optimization summary format"
        assert 'is_running' in summary, "Missing running status in summary"
        
        # Test recommendations
        recommendations = optimizer.get_recommendations()
        assert isinstance(recommendations, list), "Invalid recommendations format"
        
        # Test performance trends
        trends = optimizer.get_performance_trends()
        assert isinstance(trends, dict), "Invalid performance trends format"
        
        # Test optimization results
        results = optimizer.get_optimization_results()
        assert isinstance(results, list), "Invalid optimization results format"
        
        logger.info("✅ Continuous Optimizer: PASSED")
        return True
        
    except Exception as e:
        logger.error(f"❌ Continuous Optimizer: FAILED - {e}")
        return False

async def test_health_dashboard():
    """Test Health Dashboard"""
    logger.info("🔍 Testing Health Dashboard...")
    
    try:
        from packages.monitoring.health_dashboard import (
            get_health_dashboard, DashboardWidget, ComponentType, HealthStatus
        )
        
        dashboard = await get_health_dashboard()
        
        # Test basic functionality
        assert dashboard is not None, "Failed to create health dashboard"
        
        # Test metric provider
        async def test_metric_provider():
            return {
                "cpu_percent": 45.0,
                "memory_percent": 60.0,
                "disk_percent": 30.0,
                "avg_response_time_ms": 200.0
            }
        
        dashboard.add_metric_provider("test_metrics", test_metric_provider)
        
        # Test custom widget
        custom_widget = DashboardWidget(
            id="test_widget",
            title="Test Widget",
            widget_type="metrics_display",
            data_source="test_metrics",
            config={"refresh_rate": 30},
            position={"x": 0, "y": 0, "width": 4, "height": 3},
            refresh_interval=30
        )
        
        dashboard.add_widget(custom_widget)
        
        # Test dashboard update
        await dashboard._update_dashboard_data()
        
        # Test dashboard configuration
        config = dashboard.get_dashboard_config()
        assert isinstance(config, dict), "Invalid dashboard config format"
        assert 'widgets' in config, "Missing widgets in config"
        
        # Test system overview
        overview = dashboard.get_system_overview()
        assert isinstance(overview, dict), "Invalid system overview format"
        assert 'overall_status' in overview, "Missing overall status"
        
        # Test component health data
        health_data = dashboard.get_component_health_data()
        assert isinstance(health_data, dict), "Invalid component health data format"
        assert 'components' in health_data, "Missing components in health data"
        
        # Test metrics data
        metrics_data = dashboard.get_metrics_data(time_range_hours=1)
        assert isinstance(metrics_data, dict), "Invalid metrics data format"
        
        # Test widget data
        widget_data = dashboard.get_widget_data("test_widget")
        assert isinstance(widget_data, dict), "Invalid widget data format"
        
        # Test dashboard summary
        summary = dashboard.get_dashboard_summary()
        assert isinstance(summary, dict), "Invalid dashboard summary format"
        assert 'is_running' in summary, "Missing running status in summary"
        
        logger.info("✅ Health Dashboard: PASSED")
        return True
        
    except Exception as e:
        logger.error(f"❌ Health Dashboard: FAILED - {e}")
        return False

async def test_phase4_monitoring_system():
    """Test Integrated Phase 4 Monitoring System"""
    logger.info("🔍 Testing Phase 4 Monitoring System Integration...")
    
    try:
        from packages.monitoring.phase4_monitoring import (
            get_phase4_monitoring_system, Phase4Config
        )
        
        # Test with custom configuration
        config = Phase4Config(
            system_metrics_interval=10.0,
            app_metrics_retention_hours=48,
            load_testing_enabled=False,  # Disable for testing
            auto_optimization_enabled=False  # Disable for testing
        )
        
        monitoring_system = await get_phase4_monitoring_system(config)
        
        # Test basic functionality
        assert monitoring_system is not None, "Failed to create Phase 4 monitoring system"
        
        # Test initialization
        await monitoring_system.initialize()
        assert monitoring_system.system_metrics is not None, "System metrics not initialized"
        assert monitoring_system.app_metrics is not None, "App metrics not initialized"
        assert monitoring_system.performance_profiler is not None, "Performance profiler not initialized"
        assert monitoring_system.alert_manager is not None, "Alert manager not initialized"
        assert monitoring_system.load_tester is not None, "Load tester not initialized"
        assert monitoring_system.continuous_optimizer is not None, "Continuous optimizer not initialized"
        assert monitoring_system.health_dashboard is not None, "Health dashboard not initialized"
        
        # Test monitoring status
        status = await monitoring_system.get_monitoring_status()
        assert status is not None, "Failed to get monitoring status"
        assert hasattr(status, 'is_running'), "Missing is_running in status"
        assert hasattr(status, 'components_status'), "Missing components_status in status"
        
        # Test system summary
        summary = monitoring_system.get_system_summary()
        assert isinstance(summary, dict), "Invalid system summary format"
        assert 'phase4_monitoring' in summary, "Missing phase4_monitoring in summary"
        
        # Test health check
        health_check = await monitoring_system._perform_health_check()
        assert isinstance(health_check, dict), "Invalid health check format"
        assert 'overall_status' in health_check, "Missing overall_status in health check"
        
        # Test component integration
        assert monitoring_system.metric_providers_registered, "Metric providers not registered"
        
        logger.info("✅ Phase 4 Monitoring System: PASSED")
        return True
        
    except Exception as e:
        logger.error(f"❌ Phase 4 Monitoring System: FAILED - {e}")
        return False

async def test_end_to_end_integration():
    """Test End-to-End Integration"""
    logger.info("🔍 Testing End-to-End Integration...")
    
    try:
        from packages.monitoring.phase4_monitoring import get_phase4_monitoring_system, Phase4Config
        from packages.monitoring.application_metrics import MetricType
        
        # Create monitoring system with minimal configuration
        config = Phase4Config(
            system_metrics_interval=5.0,
            load_testing_enabled=False,
            auto_optimization_enabled=False
        )
        
        monitoring_system = await get_phase4_monitoring_system(config)
        await monitoring_system.initialize()
        
        # Simulate application activity
        app_metrics = monitoring_system.app_metrics
        
        # Record some business metrics
        app_metrics.record_business_metric("user_registrations", 5.0, MetricType.COUNTER)
        app_metrics.record_business_metric("active_sessions", 150.0, MetricType.GAUGE)
        app_metrics.record_timer("api_response_time", 250.0)
        
        # Start a trace
        trace_id = app_metrics.start_trace("user_login")
        app_metrics.add_trace_tag(trace_id, "user_id", "test_user_123")
        app_metrics.add_trace_tag(trace_id, "endpoint", "/api/v1/auth/login")
        app_metrics.finish_trace(trace_id, status_code=200)
        
        # Trigger metrics aggregation
        await app_metrics.aggregate_metrics()
        
        # Collect system metrics
        await monitoring_system.system_metrics._collect_metrics()
        
        # Update dashboard data
        await monitoring_system.health_dashboard._update_dashboard_data()
        
        # Run optimization analysis
        await monitoring_system.continuous_optimizer._run_optimization_analysis()
        
        # Evaluate alerts
        await monitoring_system.alert_manager._evaluate_alerts()
        
        # Get comprehensive status
        final_status = await monitoring_system.get_monitoring_status()
        final_summary = monitoring_system.get_system_summary()
        
        # Validate integration
        assert final_status.total_metrics_collected > 0, "No metrics collected"
        assert len(final_summary) > 1, "Insufficient summary data"
        
        # Validate component communication
        dashboard_overview = monitoring_system.health_dashboard.get_system_overview()
        assert dashboard_overview['total_components'] > 0, "No components in dashboard"
        
        optimizer_summary = monitoring_system.continuous_optimizer.get_optimization_summary()
        assert 'metrics_tracked' in optimizer_summary, "Optimizer not tracking metrics"
        
        logger.info("✅ End-to-End Integration: PASSED")
        return True
        
    except Exception as e:
        logger.error(f"❌ End-to-End Integration: FAILED - {e}")
        return False

async def run_comprehensive_validation():
    """Run comprehensive Phase 4 validation"""
    logger.info("🚀 Starting Phase 4 Comprehensive Monitoring & Continuous Improvement Validation")
    logger.info("=" * 80)
    
    start_time = datetime.now()
    test_results = {}
    
    # Define test cases
    test_cases = [
        ("System Metrics Collector", test_system_metrics_collector),
        ("Application Metrics Collector", test_application_metrics_collector),
        ("Performance Profiler", test_performance_profiler),
        ("Alert Manager", test_alert_manager),
        ("Load Tester", test_load_tester),
        ("Continuous Optimizer", test_continuous_optimizer),
        ("Health Dashboard", test_health_dashboard),
        ("Phase 4 Monitoring System", test_phase4_monitoring_system),
        ("End-to-End Integration", test_end_to_end_integration)
    ]
    
    # Run test cases
    passed_tests = 0
    total_tests = len(test_cases)
    
    for test_name, test_func in test_cases:
        try:
            logger.info(f"\n📋 Running: {test_name}")
            result = await test_func()
            test_results[test_name] = result
            if result:
                passed_tests += 1
        except Exception as e:
            logger.error(f"❌ {test_name}: FAILED with exception - {e}")
            test_results[test_name] = False
    
    # Calculate results
    end_time = datetime.now()
    duration = (end_time - start_time).total_seconds()
    success_rate = (passed_tests / total_tests) * 100
    
    # Generate summary
    logger.info("\n" + "=" * 80)
    logger.info("📊 PHASE 4 VALIDATION SUMMARY")
    logger.info("=" * 80)
    
    for test_name, result in test_results.items():
        status = "✅ PASSED" if result else "❌ FAILED"
        logger.info(f"{test_name}: {status}")
    
    logger.info(f"\n📈 Overall Results:")
    logger.info(f"   Tests Passed: {passed_tests}/{total_tests}")
    logger.info(f"   Success Rate: {success_rate:.1f}%")
    logger.info(f"   Duration: {duration:.2f} seconds")
    
    # Detailed results
    validation_results = {
        "timestamp": datetime.now().isoformat(),
        "phase": "Phase 4 - Comprehensive Monitoring & Continuous Improvement",
        "total_tests": total_tests,
        "passed_tests": passed_tests,
        "failed_tests": total_tests - passed_tests,
        "success_rate": success_rate,
        "duration_seconds": duration,
        "test_results": test_results,
        "summary": {
            "system_metrics_collector": test_results.get("System Metrics Collector", False),
            "application_metrics_collector": test_results.get("Application Metrics Collector", False),
            "performance_profiler": test_results.get("Performance Profiler", False),
            "alert_manager": test_results.get("Alert Manager", False),
            "load_tester": test_results.get("Load Tester", False),
            "continuous_optimizer": test_results.get("Continuous Optimizer", False),
            "health_dashboard": test_results.get("Health Dashboard", False),
            "phase4_monitoring_system": test_results.get("Phase 4 Monitoring System", False),
            "end_to_end_integration": test_results.get("End-to-End Integration", False)
        }
    }
    
    # Save results
    results_file = Path("phase4_monitoring_validation_results.json")
    with open(results_file, 'w') as f:
        json.dump(validation_results, f, indent=2)
    
    logger.info(f"\n💾 Results saved to: {results_file}")
    
    if success_rate == 100:
        logger.info("\n🎉 ALL TESTS PASSED! Phase 4 implementation is fully validated.")
        logger.info("✅ Ready for production deployment of comprehensive monitoring system.")
    elif success_rate >= 80:
        logger.info(f"\n⚠️  Most tests passed ({success_rate:.1f}%). Review failed tests before deployment.")
    else:
        logger.info(f"\n❌ Significant issues detected ({success_rate:.1f}% success). Address failures before proceeding.")
    
    return validation_results

if __name__ == "__main__":
    # Run validation
    results = asyncio.run(run_comprehensive_validation())
    
    # Exit with appropriate code
    if results["success_rate"] == 100:
        sys.exit(0)
    else:
        sys.exit(1)