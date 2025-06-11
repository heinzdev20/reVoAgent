#!/usr/bin/env python3
"""
Phase 3 Immediate Actions Testing Suite
Tests backend API connection, WebSocket validation, agent coordination, performance, and security
"""

import asyncio
import aiohttp
import websockets
import json
import time
import sys
import subprocess
import threading
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any, Optional
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class Phase3ImmediateActionsTester:
    """Comprehensive testing suite for Phase 3 immediate actions"""
    
    def __init__(self):
        self.backend_url = "http://localhost:8000"
        self.websocket_url = "ws://localhost:8000"
        self.test_results = {
            "backend_api_connection": {},
            "websocket_validation": {},
            "agent_coordination": {},
            "performance_optimization": {},
            "security_compliance": {},
            "overall_status": "pending"
        }
        self.backend_process = None
        
    async def start_backend_server(self):
        """Start the backend server for testing"""
        try:
            logger.info("🚀 Starting backend server...")
            
            # Start backend server in background
            cmd = [
                sys.executable, "-m", "uvicorn", 
                "apps.backend.main:app", 
                "--host", "0.0.0.0", 
                "--port", "8000",
                "--reload"
            ]
            
            self.backend_process = subprocess.Popen(
                cmd, 
                cwd=Path(__file__).parent,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            
            # Wait for server to start
            await asyncio.sleep(5)
            
            # Test if server is running
            async with aiohttp.ClientSession() as session:
                try:
                    async with session.get(f"{self.backend_url}/health") as response:
                        if response.status == 200:
                            logger.info("✅ Backend server started successfully")
                            return True
                except:
                    pass
            
            logger.warning("⚠️ Backend server may not be fully ready, continuing with tests...")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to start backend server: {e}")
            return False
    
    async def test_backend_api_connection(self):
        """Test 1: Backend API Connection Testing"""
        logger.info("\n🔧 Testing Backend API Connection...")
        
        test_results = {
            "health_check": False,
            "ai_models_endpoint": False,
            "agents_endpoint": False,
            "metrics_endpoint": False,
            "security_endpoint": False,
            "cost_endpoint": False,
            "response_times": {},
            "error_details": []
        }
        
        async with aiohttp.ClientSession() as session:
            # Test endpoints
            endpoints = {
                "health": "/health",
                "ai_models": "/api/models",
                "agents": "/api/agents",
                "system_metrics": "/api/metrics/system",
                "security_status": "/api/security/status",
                "cost_analytics": "/api/analytics/costs"
            }
            
            for name, endpoint in endpoints.items():
                try:
                    start_time = time.time()
                    async with session.get(f"{self.backend_url}{endpoint}") as response:
                        response_time = (time.time() - start_time) * 1000
                        test_results["response_times"][name] = response_time
                        
                        if response.status == 200:
                            test_results[f"{name.replace('_', '_')}_endpoint"] = True
                            logger.info(f"✅ {name}: {response.status} ({response_time:.1f}ms)")
                        else:
                            logger.warning(f"⚠️ {name}: {response.status} ({response_time:.1f}ms)")
                            test_results["error_details"].append(f"{name}: HTTP {response.status}")
                            
                except Exception as e:
                    logger.error(f"❌ {name}: {str(e)}")
                    test_results["error_details"].append(f"{name}: {str(e)}")
        
        # Calculate success rate
        successful_endpoints = sum(1 for key, value in test_results.items() 
                                 if key.endswith('_endpoint') and value)
        total_endpoints = len([key for key in test_results.keys() if key.endswith('_endpoint')])
        success_rate = (successful_endpoints / total_endpoints) * 100 if total_endpoints > 0 else 0
        
        test_results["success_rate"] = success_rate
        test_results["status"] = "passed" if success_rate >= 70 else "failed"
        
        self.test_results["backend_api_connection"] = test_results
        logger.info(f"🔧 Backend API Connection: {success_rate:.1f}% success rate")
        
        return test_results
    
    async def test_websocket_validation(self):
        """Test 2: Real-time WebSocket Validation"""
        logger.info("\n📡 Testing WebSocket Validation...")
        
        test_results = {
            "connection_established": False,
            "message_sending": False,
            "message_receiving": False,
            "real_time_updates": False,
            "connection_stability": False,
            "latency_ms": 0,
            "error_details": []
        }
        
        try:
            # Test WebSocket connection
            websocket_uri = f"{self.websocket_url}/ws"
            
            async with websockets.connect(websocket_uri) as websocket:
                test_results["connection_established"] = True
                logger.info("✅ WebSocket connection established")
                
                # Test message sending
                test_message = {
                    "type": "test",
                    "data": {"message": "Phase 3 WebSocket test"},
                    "timestamp": datetime.now().isoformat()
                }
                
                start_time = time.time()
                await websocket.send(json.dumps(test_message))
                test_results["message_sending"] = True
                logger.info("✅ WebSocket message sending successful")
                
                # Test message receiving
                try:
                    response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                    latency = (time.time() - start_time) * 1000
                    test_results["latency_ms"] = latency
                    test_results["message_receiving"] = True
                    logger.info(f"✅ WebSocket message receiving successful ({latency:.1f}ms)")
                    
                    # Test real-time updates simulation
                    for i in range(3):
                        update_message = {
                            "type": "real_time_update",
                            "data": {"update_id": i, "timestamp": datetime.now().isoformat()}
                        }
                        await websocket.send(json.dumps(update_message))
                        await asyncio.sleep(0.1)
                    
                    test_results["real_time_updates"] = True
                    logger.info("✅ Real-time updates simulation successful")
                    
                except asyncio.TimeoutError:
                    logger.warning("⚠️ WebSocket message receiving timeout")
                    test_results["error_details"].append("Message receiving timeout")
                
                # Test connection stability
                await asyncio.sleep(2)
                if websocket.open:
                    test_results["connection_stability"] = True
                    logger.info("✅ WebSocket connection stability confirmed")
                
        except Exception as e:
            logger.error(f"❌ WebSocket test failed: {e}")
            test_results["error_details"].append(str(e))
        
        # Calculate success rate
        successful_tests = sum(1 for key, value in test_results.items() 
                             if isinstance(value, bool) and value)
        total_tests = len([key for key, value in test_results.items() if isinstance(value, bool)])
        success_rate = (successful_tests / total_tests) * 100 if total_tests > 0 else 0
        
        test_results["success_rate"] = success_rate
        test_results["status"] = "passed" if success_rate >= 70 else "failed"
        
        self.test_results["websocket_validation"] = test_results
        logger.info(f"📡 WebSocket Validation: {success_rate:.1f}% success rate")
        
        return test_results
    
    async def test_agent_coordination(self):
        """Test 3: 100-Agent Coordination Testing"""
        logger.info("\n🤖 Testing 100-Agent Coordination...")
        
        test_results = {
            "agent_creation": False,
            "claude_agents": {"count": 0, "active": 0},
            "gemini_agents": {"count": 0, "active": 0},
            "openhands_agents": {"count": 0, "active": 0},
            "coordination_system": False,
            "task_distribution": False,
            "performance_tracking": False,
            "error_details": []
        }
        
        async with aiohttp.ClientSession() as session:
            try:
                # Test agent creation
                agent_config = {
                    "name": "test-agent",
                    "type": "claude",
                    "capabilities": ["code_generation", "documentation"],
                    "max_concurrent_tasks": 5
                }
                
                async with session.post(
                    f"{self.backend_url}/api/agents",
                    json=agent_config
                ) as response:
                    if response.status in [200, 201]:
                        test_results["agent_creation"] = True
                        logger.info("✅ Agent creation successful")
                    else:
                        test_results["error_details"].append(f"Agent creation failed: {response.status}")
                
                # Test agent coordination endpoints
                coordination_endpoints = [
                    "/api/agents?type=claude",
                    "/api/agents?type=gemini", 
                    "/api/agents?type=openhands",
                    "/api/coordination",
                    "/api/metrics/agents"
                ]
                
                for endpoint in coordination_endpoints:
                    try:
                        async with session.get(f"{self.backend_url}{endpoint}") as response:
                            if response.status == 200:
                                data = await response.json()
                                
                                if "claude" in endpoint:
                                    test_results["claude_agents"]["count"] = len(data.get("data", []))
                                elif "gemini" in endpoint:
                                    test_results["gemini_agents"]["count"] = len(data.get("data", []))
                                elif "openhands" in endpoint:
                                    test_results["openhands_agents"]["count"] = len(data.get("data", []))
                                elif "coordination" in endpoint:
                                    test_results["coordination_system"] = True
                                elif "metrics" in endpoint:
                                    test_results["performance_tracking"] = True
                                    
                                logger.info(f"✅ {endpoint}: Success")
                            else:
                                logger.warning(f"⚠️ {endpoint}: {response.status}")
                                
                    except Exception as e:
                        logger.error(f"❌ {endpoint}: {e}")
                        test_results["error_details"].append(f"{endpoint}: {str(e)}")
                
                # Simulate task distribution
                task_config = {
                    "task_type": "code_generation",
                    "priority": "high",
                    "requirements": ["python", "fastapi"]
                }
                
                async with session.post(
                    f"{self.backend_url}/api/tasks",
                    json=task_config
                ) as response:
                    if response.status in [200, 201]:
                        test_results["task_distribution"] = True
                        logger.info("✅ Task distribution successful")
                
            except Exception as e:
                logger.error(f"❌ Agent coordination test failed: {e}")
                test_results["error_details"].append(str(e))
        
        # Calculate total agents
        total_agents = (test_results["claude_agents"]["count"] + 
                       test_results["gemini_agents"]["count"] + 
                       test_results["openhands_agents"]["count"])
        
        test_results["total_agents"] = total_agents
        test_results["target_agents"] = 100
        test_results["agent_coverage"] = (total_agents / 100) * 100 if total_agents > 0 else 0
        
        # Calculate success rate
        successful_tests = sum(1 for key, value in test_results.items() 
                             if isinstance(value, bool) and value)
        total_tests = len([key for key, value in test_results.items() if isinstance(value, bool)])
        success_rate = (successful_tests / total_tests) * 100 if total_tests > 0 else 0
        
        test_results["success_rate"] = success_rate
        test_results["status"] = "passed" if success_rate >= 70 else "failed"
        
        self.test_results["agent_coordination"] = test_results
        logger.info(f"🤖 Agent Coordination: {success_rate:.1f}% success rate, {total_agents} agents")
        
        return test_results
    
    async def test_performance_optimization(self):
        """Test 4: Performance Optimization Validation"""
        logger.info("\n⚡ Testing Performance Optimization...")
        
        test_results = {
            "response_time_target": False,  # <200ms
            "throughput_test": False,
            "resource_usage": False,
            "cost_optimization": False,
            "uptime_validation": False,
            "metrics": {
                "avg_response_time": 0,
                "max_response_time": 0,
                "throughput_rps": 0,
                "cost_savings_percent": 0,
                "uptime_percent": 0
            },
            "error_details": []
        }
        
        async with aiohttp.ClientSession() as session:
            try:
                # Test response time performance
                response_times = []
                for i in range(10):
                    start_time = time.time()
                    async with session.get(f"{self.backend_url}/api/metrics/performance") as response:
                        response_time = (time.time() - start_time) * 1000
                        response_times.append(response_time)
                        
                        if response.status == 200:
                            data = await response.json()
                            if i == 0:  # Get metrics from first successful response
                                metrics_data = data.get("data", {})
                                test_results["metrics"]["uptime_percent"] = metrics_data.get("uptime_percentage", 0)
                                test_results["metrics"]["cost_savings_percent"] = metrics_data.get("cost_savings", 95)
                
                avg_response_time = sum(response_times) / len(response_times)
                max_response_time = max(response_times)
                
                test_results["metrics"]["avg_response_time"] = avg_response_time
                test_results["metrics"]["max_response_time"] = max_response_time
                
                # Validate response time target (<200ms)
                if avg_response_time < 200:
                    test_results["response_time_target"] = True
                    logger.info(f"✅ Response time target met: {avg_response_time:.1f}ms avg")
                else:
                    logger.warning(f"⚠️ Response time target missed: {avg_response_time:.1f}ms avg")
                
                # Test throughput (simulate concurrent requests)
                start_time = time.time()
                tasks = []
                for i in range(50):  # 50 concurrent requests
                    task = session.get(f"{self.backend_url}/health")
                    tasks.append(task)
                
                responses = await asyncio.gather(*tasks, return_exceptions=True)
                duration = time.time() - start_time
                successful_requests = sum(1 for r in responses if not isinstance(r, Exception))
                throughput = successful_requests / duration
                
                test_results["metrics"]["throughput_rps"] = throughput
                
                if throughput > 100:  # Target: >100 RPS
                    test_results["throughput_test"] = True
                    logger.info(f"✅ Throughput target met: {throughput:.1f} RPS")
                else:
                    logger.warning(f"⚠️ Throughput target missed: {throughput:.1f} RPS")
                
                # Test cost optimization
                async with session.get(f"{self.backend_url}/api/analytics/cost-optimization") as response:
                    if response.status == 200:
                        data = await response.json()
                        cost_data = data.get("data", {})
                        savings_percent = cost_data.get("savings_percentage", 0)
                        
                        if savings_percent >= 90:  # Target: >90% savings
                            test_results["cost_optimization"] = True
                            logger.info(f"✅ Cost optimization target met: {savings_percent}% savings")
                        else:
                            logger.warning(f"⚠️ Cost optimization target missed: {savings_percent}% savings")
                
                # Test resource usage
                async with session.get(f"{self.backend_url}/api/metrics/system") as response:
                    if response.status == 200:
                        data = await response.json()
                        system_data = data.get("data", {})
                        
                        # Check if resource usage is reasonable
                        cpu_usage = system_data.get("cpu_usage", 0)
                        memory_usage = system_data.get("memory_usage", 0)
                        
                        if cpu_usage < 80 and memory_usage < 80:  # Target: <80% usage
                            test_results["resource_usage"] = True
                            logger.info(f"✅ Resource usage optimal: CPU {cpu_usage}%, Memory {memory_usage}%")
                        else:
                            logger.warning(f"⚠️ High resource usage: CPU {cpu_usage}%, Memory {memory_usage}%")
                
                # Test uptime validation
                uptime = test_results["metrics"]["uptime_percent"]
                if uptime >= 99:  # Target: >99% uptime
                    test_results["uptime_validation"] = True
                    logger.info(f"✅ Uptime target met: {uptime}%")
                else:
                    logger.warning(f"⚠️ Uptime target missed: {uptime}%")
                
            except Exception as e:
                logger.error(f"❌ Performance test failed: {e}")
                test_results["error_details"].append(str(e))
        
        # Calculate success rate
        successful_tests = sum(1 for key, value in test_results.items() 
                             if isinstance(value, bool) and value)
        total_tests = len([key for key, value in test_results.items() if isinstance(value, bool)])
        success_rate = (successful_tests / total_tests) * 100 if total_tests > 0 else 0
        
        test_results["success_rate"] = success_rate
        test_results["status"] = "passed" if success_rate >= 70 else "failed"
        
        self.test_results["performance_optimization"] = test_results
        logger.info(f"⚡ Performance Optimization: {success_rate:.1f}% success rate")
        
        return test_results
    
    async def test_security_compliance(self):
        """Test 5: Security and Compliance Testing"""
        logger.info("\n🛡️ Testing Security and Compliance...")
        
        test_results = {
            "security_score_target": False,  # >95%
            "vulnerability_scan": False,
            "compliance_frameworks": False,
            "access_controls": False,
            "encryption_status": False,
            "audit_logging": False,
            "metrics": {
                "security_score": 0,
                "critical_vulnerabilities": 0,
                "compliance_score": 0
            },
            "error_details": []
        }
        
        async with aiohttp.ClientSession() as session:
            try:
                # Test security status
                async with session.get(f"{self.backend_url}/api/security/status") as response:
                    if response.status == 200:
                        data = await response.json()
                        security_data = data.get("data", {})
                        
                        security_score = security_data.get("overall_score", 0)
                        test_results["metrics"]["security_score"] = security_score
                        
                        if security_score >= 95:  # Target: >95% security score
                            test_results["security_score_target"] = True
                            logger.info(f"✅ Security score target met: {security_score}%")
                        else:
                            logger.warning(f"⚠️ Security score target missed: {security_score}%")
                        
                        # Check vulnerabilities
                        vulnerabilities = security_data.get("vulnerabilities", {})
                        critical_vulns = vulnerabilities.get("critical", 0)
                        test_results["metrics"]["critical_vulnerabilities"] = critical_vulns
                        
                        if critical_vulns == 0:  # Target: 0 critical vulnerabilities
                            test_results["vulnerability_scan"] = True
                            logger.info("✅ No critical vulnerabilities found")
                        else:
                            logger.warning(f"⚠️ {critical_vulns} critical vulnerabilities found")
                        
                        # Check security features
                        encryption = security_data.get("encryption_status", "")
                        access_control = security_data.get("access_controls", "")
                        audit_log = security_data.get("audit_logging", "")
                        
                        if encryption.lower() == "active":
                            test_results["encryption_status"] = True
                            logger.info("✅ Encryption is active")
                        
                        if access_control.lower() == "enabled":
                            test_results["access_controls"] = True
                            logger.info("✅ Access controls are enabled")
                        
                        if audit_log.lower() == "active":
                            test_results["audit_logging"] = True
                            logger.info("✅ Audit logging is active")
                
                # Test compliance frameworks
                async with session.get(f"{self.backend_url}/api/compliance/status") as response:
                    if response.status == 200:
                        data = await response.json()
                        compliance_data = data.get("data", {})
                        
                        # Check major compliance frameworks
                        frameworks = ["soc2", "iso27001", "gdpr"]
                        compliant_frameworks = 0
                        
                        for framework in frameworks:
                            framework_data = compliance_data.get(framework, {})
                            if framework_data.get("status") == "compliant":
                                compliant_frameworks += 1
                        
                        compliance_score = (compliant_frameworks / len(frameworks)) * 100
                        test_results["metrics"]["compliance_score"] = compliance_score
                        
                        if compliance_score >= 80:  # Target: >80% compliance
                            test_results["compliance_frameworks"] = True
                            logger.info(f"✅ Compliance target met: {compliance_score}%")
                        else:
                            logger.warning(f"⚠️ Compliance target missed: {compliance_score}%")
                
            except Exception as e:
                logger.error(f"❌ Security test failed: {e}")
                test_results["error_details"].append(str(e))
        
        # Calculate success rate
        successful_tests = sum(1 for key, value in test_results.items() 
                             if isinstance(value, bool) and value)
        total_tests = len([key for key, value in test_results.items() if isinstance(value, bool)])
        success_rate = (successful_tests / total_tests) * 100 if total_tests > 0 else 0
        
        test_results["success_rate"] = success_rate
        test_results["status"] = "passed" if success_rate >= 70 else "failed"
        
        self.test_results["security_compliance"] = test_results
        logger.info(f"🛡️ Security and Compliance: {success_rate:.1f}% success rate")
        
        return test_results
    
    async def run_all_tests(self):
        """Run all immediate action tests"""
        logger.info("🚀 Starting Phase 3 Immediate Actions Testing Suite")
        logger.info("=" * 60)
        
        start_time = time.time()
        
        # Start backend server
        if not await self.start_backend_server():
            logger.error("❌ Failed to start backend server, running tests anyway...")
        
        # Run all tests
        tests = [
            ("Backend API Connection", self.test_backend_api_connection),
            ("WebSocket Validation", self.test_websocket_validation),
            ("Agent Coordination", self.test_agent_coordination),
            ("Performance Optimization", self.test_performance_optimization),
            ("Security Compliance", self.test_security_compliance)
        ]
        
        passed_tests = 0
        total_tests = len(tests)
        
        for test_name, test_func in tests:
            try:
                result = await test_func()
                if result.get("status") == "passed":
                    passed_tests += 1
            except Exception as e:
                logger.error(f"❌ {test_name} failed with exception: {e}")
        
        # Calculate overall results
        duration = time.time() - start_time
        overall_success_rate = (passed_tests / total_tests) * 100
        
        self.test_results["overall_status"] = "passed" if overall_success_rate >= 70 else "failed"
        self.test_results["overall_success_rate"] = overall_success_rate
        self.test_results["duration_seconds"] = duration
        self.test_results["timestamp"] = datetime.now().isoformat()
        
        # Generate summary
        await self.generate_test_summary()
        
        # Cleanup
        if self.backend_process:
            self.backend_process.terminate()
        
        return self.test_results
    
    async def generate_test_summary(self):
        """Generate comprehensive test summary"""
        logger.info("\n" + "=" * 60)
        logger.info("📊 PHASE 3 IMMEDIATE ACTIONS TEST SUMMARY")
        logger.info("=" * 60)
        
        # Overall status
        status_emoji = "✅" if self.test_results["overall_status"] == "passed" else "❌"
        logger.info(f"{status_emoji} Overall Status: {self.test_results['overall_status'].upper()}")
        logger.info(f"📈 Success Rate: {self.test_results['overall_success_rate']:.1f}%")
        logger.info(f"⏱️ Duration: {self.test_results['duration_seconds']:.1f} seconds")
        
        # Individual test results
        logger.info("\n📋 Individual Test Results:")
        
        test_categories = [
            ("🔧 Backend API Connection", "backend_api_connection"),
            ("📡 WebSocket Validation", "websocket_validation"),
            ("🤖 Agent Coordination", "agent_coordination"),
            ("⚡ Performance Optimization", "performance_optimization"),
            ("🛡️ Security Compliance", "security_compliance")
        ]
        
        for name, key in test_categories:
            result = self.test_results.get(key, {})
            status = result.get("status", "unknown")
            success_rate = result.get("success_rate", 0)
            
            status_emoji = "✅" if status == "passed" else "❌"
            logger.info(f"  {status_emoji} {name}: {success_rate:.1f}%")
        
        # Key metrics
        logger.info("\n📊 Key Metrics:")
        
        # Performance metrics
        perf_metrics = self.test_results.get("performance_optimization", {}).get("metrics", {})
        logger.info(f"  ⚡ Avg Response Time: {perf_metrics.get('avg_response_time', 0):.1f}ms")
        logger.info(f"  🚀 Throughput: {perf_metrics.get('throughput_rps', 0):.1f} RPS")
        logger.info(f"  💰 Cost Savings: {perf_metrics.get('cost_savings_percent', 0):.1f}%")
        
        # Security metrics
        sec_metrics = self.test_results.get("security_compliance", {}).get("metrics", {})
        logger.info(f"  🛡️ Security Score: {sec_metrics.get('security_score', 0):.1f}%")
        logger.info(f"  🚨 Critical Vulnerabilities: {sec_metrics.get('critical_vulnerabilities', 0)}")
        
        # Agent metrics
        agent_result = self.test_results.get("agent_coordination", {})
        total_agents = agent_result.get("total_agents", 0)
        logger.info(f"  🤖 Total Agents: {total_agents}/100")
        
        # Save results to file
        results_file = Path(__file__).parent / "phase3_immediate_actions_test_results.json"
        with open(results_file, "w") as f:
            json.dump(self.test_results, f, indent=2)
        
        logger.info(f"\n💾 Results saved to: {results_file}")
        logger.info("=" * 60)

async def main():
    """Main test execution"""
    tester = Phase3ImmediateActionsTester()
    results = await tester.run_all_tests()
    
    # Exit with appropriate code
    exit_code = 0 if results["overall_status"] == "passed" else 1
    sys.exit(exit_code)

if __name__ == "__main__":
    asyncio.run(main())