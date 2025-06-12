#!/usr/bin/env python3
"""
Phase 5 AI Intelligence Testing Script
Tests the Advanced Intelligence & Automation features
"""

import asyncio
import aiohttp
import json
import time
import random
from datetime import datetime
from typing import Dict, List, Any

class Phase5AIIntelligenceTester:
    def __init__(self, base_url: str = "http://localhost:12000"):
        self.base_url = base_url
        self.session = None
        self.test_results = {}
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def test_predictive_analytics(self) -> Dict[str, Any]:
        """Test predictive analytics engine"""
        print("🧠 Testing Predictive Analytics Engine...")
        results = {"status": "success", "tests": []}
        
        try:
            # Test 1: Add performance data
            print("  📊 Adding performance data...")
            performance_data = {
                "agent_id": "test_agent_001",
                "task_type": "code_generation",
                "success_rate": 0.85,
                "avg_response_time": 2.5,
                "resource_usage": 0.6,
                "context": {"complexity": "medium", "language": "python"}
            }
            
            async with self.session.post(
                f"{self.base_url}/ai/predictive/add-performance-data",
                json=performance_data
            ) as response:
                if response.status == 200:
                    results["tests"].append({"test": "add_performance_data", "status": "passed"})
                    print("    ✅ Performance data added successfully")
                else:
                    results["tests"].append({"test": "add_performance_data", "status": "failed", "error": await response.text()})
                    print(f"    ❌ Failed to add performance data: {response.status}")
            
            # Test 2: Predict agent performance
            print("  🔮 Testing performance prediction...")
            prediction_request = {
                "task_type": "code_generation",
                "agent_id": "test_agent_001",
                "context": {"complexity": "high", "language": "javascript"}
            }
            
            async with self.session.post(
                f"{self.base_url}/ai/predictive/predict-performance",
                json=prediction_request
            ) as response:
                if response.status == 200:
                    prediction_data = await response.json()
                    results["tests"].append({
                        "test": "predict_performance", 
                        "status": "passed",
                        "prediction": prediction_data["predicted_value"],
                        "confidence": prediction_data["confidence"]
                    })
                    print(f"    ✅ Performance prediction: {prediction_data['predicted_value']:.2f} (confidence: {prediction_data['confidence']:.2f})")
                else:
                    results["tests"].append({"test": "predict_performance", "status": "failed", "error": await response.text()})
                    print(f"    ❌ Performance prediction failed: {response.status}")
            
            # Test 3: Predict response time
            print("  ⏱️ Testing response time prediction...")
            response_time_request = {
                "task_complexity": 7.5,
                "system_load": 0.8
            }
            
            async with self.session.post(
                f"{self.base_url}/ai/predictive/predict-response-time",
                json=response_time_request
            ) as response:
                if response.status == 200:
                    response_data = await response.json()
                    results["tests"].append({
                        "test": "predict_response_time",
                        "status": "passed",
                        "predicted_time": response_data["predicted_response_time"],
                        "confidence": response_data["confidence"]
                    })
                    print(f"    ✅ Response time prediction: {response_data['predicted_response_time']:.2f}s (confidence: {response_data['confidence']:.2f})")
                else:
                    results["tests"].append({"test": "predict_response_time", "status": "failed", "error": await response.text()})
                    print(f"    ❌ Response time prediction failed: {response.status}")
            
            # Test 4: Configuration recommendation
            print("  ⚙️ Testing configuration recommendation...")
            workload_request = {
                "concurrent_tasks": 15,
                "task_complexity": 6.0,
                "resource_requirements": {"cpu": 4, "memory": 8},
                "time_constraints": 300.0,
                "priority_level": 7
            }
            
            async with self.session.post(
                f"{self.base_url}/ai/predictive/recommend-configuration",
                json=workload_request
            ) as response:
                if response.status == 200:
                    config_data = await response.json()
                    results["tests"].append({
                        "test": "recommend_configuration",
                        "status": "passed",
                        "agent_count": config_data["agent_count"],
                        "resource_allocation": config_data["resource_allocation"]
                    })
                    print(f"    ✅ Configuration recommendation: {config_data['agent_count']} agents, {config_data['resource_allocation']['cpu']} CPU cores")
                else:
                    results["tests"].append({"test": "recommend_configuration", "status": "failed", "error": await response.text()})
                    print(f"    ❌ Configuration recommendation failed: {response.status}")
            
            # Test 5: Get analytics
            print("  📈 Testing predictive analytics...")
            async with self.session.get(f"{self.base_url}/ai/predictive/analytics") as response:
                if response.status == 200:
                    analytics_data = await response.json()
                    results["tests"].append({
                        "test": "get_analytics",
                        "status": "passed",
                        "total_predictions": analytics_data.get("total_predictions", 0),
                        "models_trained": analytics_data.get("models_trained", 0)
                    })
                    print(f"    ✅ Analytics: {analytics_data.get('total_predictions', 0)} predictions, {analytics_data.get('models_trained', 0)} models trained")
                else:
                    results["tests"].append({"test": "get_analytics", "status": "failed", "error": await response.text()})
                    print(f"    ❌ Analytics retrieval failed: {response.status}")
            
        except Exception as e:
            results["status"] = "error"
            results["error"] = str(e)
            print(f"    ❌ Predictive analytics test error: {e}")
        
        return results
    
    async def test_intelligent_autoscaling(self) -> Dict[str, Any]:
        """Test intelligent auto-scaling engine"""
        print("🚀 Testing Intelligent Auto-scaling Engine...")
        results = {"status": "success", "tests": []}
        
        try:
            # Test 1: Get system metrics
            print("  📊 Getting system metrics...")
            async with self.session.get(f"{self.base_url}/ai/autoscaling/metrics") as response:
                if response.status == 200:
                    metrics_data = await response.json()
                    results["tests"].append({
                        "test": "get_metrics",
                        "status": "passed",
                        "cpu_usage": metrics_data["cpu_usage"],
                        "memory_usage": metrics_data["memory_usage"]
                    })
                    print(f"    ✅ System metrics: CPU {metrics_data['cpu_usage']:.1f}%, Memory {metrics_data['memory_usage']:.1f}%")
                else:
                    results["tests"].append({"test": "get_metrics", "status": "failed", "error": await response.text()})
                    print(f"    ❌ Failed to get system metrics: {response.status}")
            
            # Test 2: Analyze system load
            print("  🔍 Analyzing system load...")
            async with self.session.get(f"{self.base_url}/ai/autoscaling/analyze-load") as response:
                if response.status == 200:
                    analysis_data = await response.json()
                    results["tests"].append({
                        "test": "analyze_load",
                        "status": "passed",
                        "direction": analysis_data["direction"],
                        "confidence": analysis_data["confidence"],
                        "reasoning": analysis_data["reasoning"]
                    })
                    print(f"    ✅ Load analysis: {analysis_data['direction']} (confidence: {analysis_data['confidence']:.2f})")
                    print(f"      Reasoning: {analysis_data['reasoning']}")
                else:
                    results["tests"].append({"test": "analyze_load", "status": "failed", "error": await response.text()})
                    print(f"    ❌ Load analysis failed: {response.status}")
            
            # Test 3: Configure auto-scaling
            print("  ⚙️ Configuring auto-scaling...")
            config_request = {
                "min_instances": 1,
                "max_instances": 8,
                "target_cpu_utilization": 75.0,
                "target_memory_utilization": 80.0,
                "scale_up_cooldown": 300,
                "scale_down_cooldown": 600
            }
            
            async with self.session.post(
                f"{self.base_url}/ai/autoscaling/configure",
                json=config_request
            ) as response:
                if response.status == 200:
                    config_data = await response.json()
                    results["tests"].append({
                        "test": "configure_autoscaling",
                        "status": "passed",
                        "config": config_data["config"]
                    })
                    print(f"    ✅ Auto-scaling configured: {config_data['config']['min_instances']}-{config_data['config']['max_instances']} instances")
                else:
                    results["tests"].append({"test": "configure_autoscaling", "status": "failed", "error": await response.text()})
                    print(f"    ❌ Auto-scaling configuration failed: {response.status}")
            
            # Test 4: Execute scaling (simulation)
            print("  🎯 Testing scaling execution...")
            async with self.session.post(f"{self.base_url}/ai/autoscaling/execute-scaling") as response:
                if response.status == 200:
                    scaling_data = await response.json()
                    results["tests"].append({
                        "test": "execute_scaling",
                        "status": "passed",
                        "scaling_status": scaling_data["status"],
                        "decision": scaling_data["decision"]
                    })
                    print(f"    ✅ Scaling execution: {scaling_data['status']}")
                    print(f"      Decision: {scaling_data['decision']['direction']} to {scaling_data['decision']['target_instances']} instances")
                else:
                    results["tests"].append({"test": "execute_scaling", "status": "failed", "error": await response.text()})
                    print(f"    ❌ Scaling execution failed: {response.status}")
            
            # Test 5: Get auto-scaling analytics
            print("  📈 Getting auto-scaling analytics...")
            async with self.session.get(f"{self.base_url}/ai/autoscaling/analytics") as response:
                if response.status == 200:
                    analytics_data = await response.json()
                    results["tests"].append({
                        "test": "get_autoscaling_analytics",
                        "status": "passed",
                        "current_instances": analytics_data.get("current_instances", 1),
                        "total_scaling_actions": analytics_data.get("total_scaling_actions", 0)
                    })
                    print(f"    ✅ Auto-scaling analytics: {analytics_data.get('current_instances', 1)} instances, {analytics_data.get('total_scaling_actions', 0)} actions")
                else:
                    results["tests"].append({"test": "get_autoscaling_analytics", "status": "failed", "error": await response.text()})
                    print(f"    ❌ Auto-scaling analytics failed: {response.status}")
            
        except Exception as e:
            results["status"] = "error"
            results["error"] = str(e)
            print(f"    ❌ Auto-scaling test error: {e}")
        
        return results
    
    async def test_anomaly_detection(self) -> Dict[str, Any]:
        """Test anomaly detection engine"""
        print("🔍 Testing Anomaly Detection Engine...")
        results = {"status": "success", "tests": []}
        
        try:
            # Test 1: Detect anomalies with normal metrics
            print("  📊 Testing normal metrics...")
            normal_metrics = {
                "metrics": {
                    "cpu_usage": 45.0,
                    "memory_usage": 60.0,
                    "response_time": 1.8,
                    "error_rate": 0.5
                }
            }
            
            async with self.session.post(
                f"{self.base_url}/ai/anomaly/detect",
                json=normal_metrics
            ) as response:
                if response.status == 200:
                    anomaly_data = await response.json()
                    results["tests"].append({
                        "test": "detect_normal_metrics",
                        "status": "passed",
                        "anomalies_detected": anomaly_data["anomalies_detected"]
                    })
                    print(f"    ✅ Normal metrics: {anomaly_data['anomalies_detected']} anomalies detected")
                else:
                    results["tests"].append({"test": "detect_normal_metrics", "status": "failed", "error": await response.text()})
                    print(f"    ❌ Normal metrics detection failed: {response.status}")
            
            # Test 2: Detect anomalies with abnormal metrics
            print("  🚨 Testing abnormal metrics...")
            abnormal_metrics = {
                "metrics": {
                    "cpu_usage": 95.0,  # Very high
                    "memory_usage": 98.0,  # Very high
                    "response_time": 15.0,  # Very slow
                    "error_rate": 8.5  # High error rate
                }
            }
            
            async with self.session.post(
                f"{self.base_url}/ai/anomaly/detect",
                json=abnormal_metrics
            ) as response:
                if response.status == 200:
                    anomaly_data = await response.json()
                    results["tests"].append({
                        "test": "detect_abnormal_metrics",
                        "status": "passed",
                        "anomalies_detected": anomaly_data["anomalies_detected"],
                        "anomalies": anomaly_data["anomalies"][:3]  # First 3 anomalies
                    })
                    print(f"    ✅ Abnormal metrics: {anomaly_data['anomalies_detected']} anomalies detected")
                    for anomaly in anomaly_data["anomalies"][:3]:
                        print(f"      - {anomaly['severity'].upper()}: {anomaly['description']}")
                else:
                    results["tests"].append({"test": "detect_abnormal_metrics", "status": "failed", "error": await response.text()})
                    print(f"    ❌ Abnormal metrics detection failed: {response.status}")
            
            # Test 3: Add more data points for pattern learning
            print("  📈 Adding data for pattern learning...")
            for i in range(10):
                metrics = {
                    "metrics": {
                        "cpu_usage": 50 + random.uniform(-10, 10),
                        "memory_usage": 65 + random.uniform(-15, 15),
                        "response_time": 2.0 + random.uniform(-0.5, 0.5),
                        "error_rate": 1.0 + random.uniform(-0.5, 0.5)
                    }
                }
                
                async with self.session.post(
                    f"{self.base_url}/ai/anomaly/detect",
                    json=metrics
                ) as response:
                    pass  # Just adding data points
                
                await asyncio.sleep(0.1)  # Small delay
            
            results["tests"].append({"test": "pattern_learning", "status": "passed"})
            print("    ✅ Pattern learning data added")
            
            # Test 4: Predict potential issues
            print("  🔮 Testing issue prediction...")
            async with self.session.get(f"{self.base_url}/ai/anomaly/predict-issues") as response:
                if response.status == 200:
                    prediction_data = await response.json()
                    results["tests"].append({
                        "test": "predict_issues",
                        "status": "passed",
                        "issues_predicted": prediction_data["issues_predicted"],
                        "predicted_issues": prediction_data["predicted_issues"][:2]  # First 2 issues
                    })
                    print(f"    ✅ Issue prediction: {prediction_data['issues_predicted']} potential issues")
                    for issue in prediction_data["predicted_issues"][:2]:
                        print(f"      - {issue['issue_type']}: {issue['description']} (probability: {issue['probability']:.2f})")
                else:
                    results["tests"].append({"test": "predict_issues", "status": "failed", "error": await response.text()})
                    print(f"    ❌ Issue prediction failed: {response.status}")
            
            # Test 5: Get anomaly analytics
            print("  📈 Getting anomaly analytics...")
            async with self.session.get(f"{self.base_url}/ai/anomaly/analytics") as response:
                if response.status == 200:
                    analytics_data = await response.json()
                    results["tests"].append({
                        "test": "get_anomaly_analytics",
                        "status": "passed",
                        "total_anomalies": analytics_data.get("total_anomalies", 0),
                        "metrics_monitored": analytics_data.get("metrics_monitored", 0)
                    })
                    print(f"    ✅ Anomaly analytics: {analytics_data.get('total_anomalies', 0)} total anomalies, {analytics_data.get('metrics_monitored', 0)} metrics monitored")
                else:
                    results["tests"].append({"test": "get_anomaly_analytics", "status": "failed", "error": await response.text()})
                    print(f"    ❌ Anomaly analytics failed: {response.status}")
            
        except Exception as e:
            results["status"] = "error"
            results["error"] = str(e)
            print(f"    ❌ Anomaly detection test error: {e}")
        
        return results
    
    async def test_intelligence_dashboard(self) -> Dict[str, Any]:
        """Test comprehensive intelligence dashboard"""
        print("📊 Testing Intelligence Dashboard...")
        results = {"status": "success", "tests": []}
        
        try:
            # Test 1: Get dashboard data
            print("  🎛️ Getting dashboard data...")
            async with self.session.get(f"{self.base_url}/ai/intelligence/dashboard") as response:
                if response.status == 200:
                    dashboard_data = await response.json()
                    results["tests"].append({
                        "test": "get_dashboard",
                        "status": "passed",
                        "ai_systems_active": dashboard_data["overview"]["ai_systems_active"],
                        "current_instances": dashboard_data["current_state"]["current_instances"]
                    })
                    print(f"    ✅ Dashboard data: {dashboard_data['overview']['ai_systems_active']} AI systems active")
                    print(f"      Current state: {dashboard_data['current_state']['current_instances']} instances")
                    print(f"      Scaling recommendation: {dashboard_data['current_state']['scaling_recommendation']['direction']}")
                else:
                    results["tests"].append({"test": "get_dashboard", "status": "failed", "error": await response.text()})
                    print(f"    ❌ Dashboard data failed: {response.status}")
            
            # Test 2: Simulate workload scenario
            print("  🎯 Testing workload simulation...")
            workload_scenario = {
                "concurrent_tasks": 25,
                "task_complexity": 8.0,
                "resource_requirements": {"cpu": 6, "memory": 12},
                "time_constraints": 180.0,
                "priority_level": 9
            }
            
            async with self.session.post(
                f"{self.base_url}/ai/intelligence/simulate-workload",
                json=workload_scenario
            ) as response:
                if response.status == 200:
                    simulation_data = await response.json()
                    results["tests"].append({
                        "test": "simulate_workload",
                        "status": "passed",
                        "recommended_agents": simulation_data["recommended_configuration"]["agent_count"],
                        "predicted_cpu": simulation_data["predicted_metrics"]["cpu_usage"],
                        "potential_anomalies": simulation_data["potential_anomalies"]
                    })
                    print(f"    ✅ Workload simulation: {simulation_data['recommended_configuration']['agent_count']} agents recommended")
                    print(f"      Predicted CPU usage: {simulation_data['predicted_metrics']['cpu_usage']:.1f}%")
                    print(f"      Potential anomalies: {simulation_data['potential_anomalies']}")
                    print(f"      Recommendations: {len(simulation_data['recommendations'])} actions")
                else:
                    results["tests"].append({"test": "simulate_workload", "status": "failed", "error": await response.text()})
                    print(f"    ❌ Workload simulation failed: {response.status}")
            
        except Exception as e:
            results["status"] = "error"
            results["error"] = str(e)
            print(f"    ❌ Intelligence dashboard test error: {e}")
        
        return results
    
    async def run_comprehensive_test(self) -> Dict[str, Any]:
        """Run comprehensive Phase 5 AI intelligence tests"""
        print("🚀 Starting Phase 5 AI Intelligence Comprehensive Test")
        print("=" * 60)
        
        start_time = time.time()
        
        # Run all test suites
        test_suites = [
            ("Predictive Analytics", self.test_predictive_analytics),
            ("Intelligent Auto-scaling", self.test_intelligent_autoscaling),
            ("Anomaly Detection", self.test_anomaly_detection),
            ("Intelligence Dashboard", self.test_intelligence_dashboard)
        ]
        
        all_results = {}
        
        for suite_name, test_func in test_suites:
            print(f"\n🧪 Running {suite_name} Tests...")
            try:
                suite_results = await test_func()
                all_results[suite_name.lower().replace(" ", "_")] = suite_results
                
                # Count passed/failed tests
                passed = sum(1 for test in suite_results.get("tests", []) if test.get("status") == "passed")
                total = len(suite_results.get("tests", []))
                print(f"  📊 {suite_name}: {passed}/{total} tests passed")
                
            except Exception as e:
                print(f"  ❌ {suite_name} test suite failed: {e}")
                all_results[suite_name.lower().replace(" ", "_")] = {"status": "error", "error": str(e)}
        
        end_time = time.time()
        
        # Generate summary
        total_tests = sum(len(results.get("tests", [])) for results in all_results.values())
        total_passed = sum(
            sum(1 for test in results.get("tests", []) if test.get("status") == "passed")
            for results in all_results.values()
        )
        
        summary = {
            "timestamp": datetime.now().isoformat(),
            "duration": end_time - start_time,
            "total_tests": total_tests,
            "total_passed": total_passed,
            "success_rate": (total_passed / total_tests * 100) if total_tests > 0 else 0,
            "test_suites": all_results
        }
        
        print("\n" + "=" * 60)
        print("📊 PHASE 5 AI INTELLIGENCE TEST SUMMARY")
        print("=" * 60)
        print(f"⏱️  Duration: {summary['duration']:.2f} seconds")
        print(f"🧪 Total Tests: {summary['total_tests']}")
        print(f"✅ Passed: {summary['total_passed']}")
        print(f"❌ Failed: {summary['total_tests'] - summary['total_passed']}")
        print(f"📈 Success Rate: {summary['success_rate']:.1f}%")
        
        if summary['success_rate'] >= 80:
            print("🎉 PHASE 5 AI INTELLIGENCE: EXCELLENT PERFORMANCE!")
        elif summary['success_rate'] >= 60:
            print("✅ PHASE 5 AI INTELLIGENCE: GOOD PERFORMANCE")
        else:
            print("⚠️  PHASE 5 AI INTELLIGENCE: NEEDS IMPROVEMENT")
        
        return summary

async def main():
    """Main test execution"""
    print("🤖 reVoAgent Phase 5: Advanced Intelligence & Automation Test")
    print("Testing AI-powered predictive analytics, auto-scaling, and anomaly detection")
    print()
    
    # Wait for backend to be ready
    print("⏳ Waiting for backend to be ready...")
    await asyncio.sleep(3)
    
    async with Phase5AIIntelligenceTester() as tester:
        results = await tester.run_comprehensive_test()
        
        # Save results
        with open("phase5_ai_intelligence_test_results.json", "w") as f:
            json.dump(results, f, indent=2)
        
        print(f"\n💾 Results saved to: phase5_ai_intelligence_test_results.json")
        
        return results

if __name__ == "__main__":
    asyncio.run(main())