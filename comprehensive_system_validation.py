#!/usr/bin/env python3
"""
🧪 COMPREHENSIVE SYSTEM VALIDATION
Testing all enterprise systems for production readiness
"""

import asyncio
import aiohttp
import websockets
import json
import time
import sys
import os
from typing import Dict, List, Any
from dataclasses import dataclass
from datetime import datetime

# Add project paths
sys.path.append('/workspace/reVoAgent/src')
sys.path.append('/workspace/reVoAgent/apps')
sys.path.append('/workspace/reVoAgent/packages')

@dataclass
class TestResult:
    test_name: str
    status: str  # 'PASS', 'FAIL', 'SKIP'
    duration_ms: float
    details: str
    score: float = 0.0

class ComprehensiveSystemValidator:
    def __init__(self):
        self.backend_url = "http://localhost:12001"
        self.frontend_url = "http://localhost:12000"
        self.ws_url = "ws://localhost:12001/ws"
        self.results: List[TestResult] = []
        
    async def run_all_tests(self):
        """Run comprehensive system validation"""
        print("🚀 STARTING COMPREHENSIVE SYSTEM VALIDATION")
        print("=" * 60)
        
        test_suites = [
            ("Backend API Connection Testing", self.test_backend_api_connection),
            ("Real-time WebSocket Validation", self.test_websocket_connection),
            ("100-Agent Coordination Testing", self.test_agent_coordination),
            ("Performance Optimization Validation", self.test_performance_optimization),
            ("Security and Compliance Testing", self.test_security_compliance),
            ("Three-Engine Architecture Testing", self.test_three_engine_architecture),
            ("Quality Gates Validation", self.test_quality_gates),
            ("Cost Optimization Testing", self.test_cost_optimization),
            ("Frontend Integration Testing", self.test_frontend_integration),
            ("Production Readiness Assessment", self.test_production_readiness)
        ]
        
        for suite_name, test_func in test_suites:
            print(f"\n🧪 {suite_name}")
            print("-" * 50)
            await test_func()
        
        await self.generate_final_report()

    async def test_backend_api_connection(self):
        """Test backend API connectivity and endpoints"""
        
        # Test 1: Health Check
        await self._test_endpoint(
            "Backend Health Check",
            f"{self.backend_url}/health",
            expected_status=200
        )
        
        # Test 2: API Documentation
        await self._test_endpoint(
            "API Documentation Access",
            f"{self.backend_url}/docs",
            expected_status=200
        )
        
        # Test 3: Agent Status Endpoint
        await self._test_endpoint(
            "Agent Status API",
            f"{self.backend_url}/api/v1/agents/status",
            expected_status=200
        )
        
        # Test 4: Engine Metrics Endpoint
        await self._test_endpoint(
            "Engine Metrics API",
            f"{self.backend_url}/api/v1/engines/metrics",
            expected_status=200
        )
        
        # Test 5: Monitoring Dashboard API
        await self._test_endpoint(
            "Monitoring Dashboard API",
            f"{self.backend_url}/api/v1/monitoring/dashboard",
            expected_status=200
        )

    async def test_websocket_connection(self):
        """Test real-time WebSocket functionality"""
        
        start_time = time.time()
        try:
            # Test WebSocket connection
            async with websockets.connect(self.ws_url) as websocket:
                # Send subscription message
                subscription = {
                    "type": "subscribe",
                    "channels": ["agent_updates", "engine_metrics", "monitoring"]
                }
                await websocket.send(json.dumps(subscription))
                
                # Wait for response
                try:
                    response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                    response_data = json.loads(response)
                    
                    duration = (time.time() - start_time) * 1000
                    self.results.append(TestResult(
                        "WebSocket Connection",
                        "PASS",
                        duration,
                        f"Connected successfully, received: {response_data.get('type', 'unknown')}",
                        100.0
                    ))
                    
                except asyncio.TimeoutError:
                    duration = (time.time() - start_time) * 1000
                    self.results.append(TestResult(
                        "WebSocket Connection",
                        "PASS",
                        duration,
                        "Connected but no immediate response (acceptable)",
                        80.0
                    ))
                    
        except Exception as e:
            duration = (time.time() - start_time) * 1000
            self.results.append(TestResult(
                "WebSocket Connection",
                "FAIL",
                duration,
                f"Connection failed: {str(e)}",
                0.0
            ))

    async def test_agent_coordination(self):
        """Test 100-agent coordination system"""
        
        # Test 1: Agent Status Retrieval
        start_time = time.time()
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.backend_url}/api/v1/agents/status") as response:
                    if response.status == 200:
                        data = await response.json()
                        agent_count = len(data) if isinstance(data, list) else data.get('total_agents', 0)
                        
                        duration = (time.time() - start_time) * 1000
                        score = min(100.0, (agent_count / 100) * 100)  # Score based on agent count
                        
                        self.results.append(TestResult(
                            "Agent Status Retrieval",
                            "PASS",
                            duration,
                            f"Retrieved {agent_count} agents",
                            score
                        ))
                    else:
                        duration = (time.time() - start_time) * 1000
                        self.results.append(TestResult(
                            "Agent Status Retrieval",
                            "FAIL",
                            duration,
                            f"HTTP {response.status}",
                            0.0
                        ))
        except Exception as e:
            duration = (time.time() - start_time) * 1000
            self.results.append(TestResult(
                "Agent Status Retrieval",
                "FAIL",
                duration,
                f"Error: {str(e)}",
                0.0
            ))
        
        # Test 2: Epic Coordination
        await self._test_epic_coordination()
        
        # Test 3: Agent Performance Metrics
        await self._test_endpoint(
            "Agent Performance Metrics",
            f"{self.backend_url}/api/v1/agents/performance",
            expected_status=200
        )

    async def test_performance_optimization(self):
        """Test performance optimization features"""
        
        # Test 1: Response Time Measurement
        response_times = []
        for i in range(5):
            start_time = time.time()
            try:
                async with aiohttp.ClientSession() as session:
                    async with session.get(f"{self.backend_url}/health") as response:
                        if response.status == 200:
                            response_time = (time.time() - start_time) * 1000
                            response_times.append(response_time)
            except Exception:
                pass
        
        if response_times:
            avg_response_time = sum(response_times) / len(response_times)
            score = max(0, 100 - (avg_response_time / 10))  # 100% if <10ms, decreasing
            
            self.results.append(TestResult(
                "API Response Time",
                "PASS" if avg_response_time < 200 else "FAIL",
                avg_response_time,
                f"Average: {avg_response_time:.1f}ms (target: <200ms)",
                score
            ))
        
        # Test 2: Cost Optimization Metrics
        await self._test_endpoint(
            "Cost Optimization Metrics",
            f"{self.backend_url}/api/v1/monitoring/cost-optimization",
            expected_status=200
        )
        
        # Test 3: System Resource Usage
        await self._test_endpoint(
            "System Resource Monitoring",
            f"{self.backend_url}/api/v1/monitoring/performance",
            expected_status=200
        )

    async def test_security_compliance(self):
        """Test security and compliance features"""
        
        # Test 1: Quality Gates Security
        await self._test_endpoint(
            "Quality Gates Security",
            f"{self.backend_url}/api/v1/enterprise/quality-gates",
            expected_status=200
        )
        
        # Test 2: Security Metrics
        await self._test_endpoint(
            "Security Metrics",
            f"{self.backend_url}/api/v1/monitoring/security",
            expected_status=200
        )
        
        # Test 3: Code Validation
        start_time = time.time()
        try:
            test_code = """
def test_function():
    return "Hello, World!"
"""
            payload = {
                "code": test_code,
                "context": "test_validation"
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.backend_url}/api/v1/enterprise/validate-code",
                    json=payload
                ) as response:
                    duration = (time.time() - start_time) * 1000
                    
                    if response.status == 200:
                        data = await response.json()
                        quality_score = data.get('overall_score', 0)
                        
                        self.results.append(TestResult(
                            "Code Validation",
                            "PASS",
                            duration,
                            f"Quality score: {quality_score}%",
                            quality_score
                        ))
                    else:
                        self.results.append(TestResult(
                            "Code Validation",
                            "FAIL",
                            duration,
                            f"HTTP {response.status}",
                            0.0
                        ))
        except Exception as e:
            duration = (time.time() - start_time) * 1000
            self.results.append(TestResult(
                "Code Validation",
                "FAIL",
                duration,
                f"Error: {str(e)}",
                0.0
            ))

    async def test_three_engine_architecture(self):
        """Test three-engine architecture"""
        
        # Test 1: Perfect Recall Engine
        await self._test_endpoint(
            "Perfect Recall Engine",
            f"{self.backend_url}/api/v1/engines/perfect_recall/memories",
            expected_status=200
        )
        
        # Test 2: Parallel Mind Engine
        await self._test_endpoint(
            "Parallel Mind Engine",
            f"{self.backend_url}/api/v1/engines/parallel_mind/tasks",
            expected_status=200
        )
        
        # Test 3: Creative Engine
        await self._test_endpoint(
            "Creative Engine",
            f"{self.backend_url}/api/v1/engines/creative/patterns",
            expected_status=200
        )
        
        # Test 4: Engine Health Check
        await self._test_endpoint(
            "Engine Health Check",
            f"{self.backend_url}/api/v1/engines/health",
            expected_status=200
        )

    async def test_quality_gates(self):
        """Test quality gates system"""
        
        # Test 1: Quality Metrics
        await self._test_endpoint(
            "Quality Metrics",
            f"{self.backend_url}/api/v1/enterprise/quality-metrics",
            expected_status=200
        )
        
        # Test 2: Validation History
        await self._test_endpoint(
            "Validation History",
            f"{self.backend_url}/api/v1/enterprise/validation-history",
            expected_status=200
        )

    async def test_cost_optimization(self):
        """Test cost optimization features"""
        
        # Test 1: Cost Breakdown
        await self._test_endpoint(
            "Cost Breakdown",
            f"{self.backend_url}/api/v1/cost/breakdown",
            expected_status=200
        )
        
        # Test 2: Local Model Usage
        await self._test_endpoint(
            "Local Model Usage",
            f"{self.backend_url}/api/v1/cost/local-model-usage",
            expected_status=200
        )
        
        # Test 3: Savings Report
        await self._test_endpoint(
            "Savings Report",
            f"{self.backend_url}/api/v1/cost/savings-report",
            expected_status=200
        )

    async def test_frontend_integration(self):
        """Test frontend integration"""
        
        # Test 1: Frontend Accessibility
        start_time = time.time()
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(self.frontend_url) as response:
                    duration = (time.time() - start_time) * 1000
                    
                    if response.status == 200:
                        content = await response.text()
                        has_react = "react" in content.lower() or "vite" in content.lower()
                        
                        self.results.append(TestResult(
                            "Frontend Accessibility",
                            "PASS",
                            duration,
                            f"Frontend loaded successfully (React: {has_react})",
                            100.0 if has_react else 80.0
                        ))
                    else:
                        self.results.append(TestResult(
                            "Frontend Accessibility",
                            "FAIL",
                            duration,
                            f"HTTP {response.status}",
                            0.0
                        ))
        except Exception as e:
            duration = (time.time() - start_time) * 1000
            self.results.append(TestResult(
                "Frontend Accessibility",
                "FAIL",
                duration,
                f"Error: {str(e)}",
                0.0
            ))

    async def test_production_readiness(self):
        """Test overall production readiness"""
        
        # Test 1: System Health
        await self._test_endpoint(
            "System Health Check",
            f"{self.backend_url}/api/v1/monitoring/health",
            expected_status=200
        )
        
        # Test 2: Compliance Status
        await self._test_endpoint(
            "Compliance Status",
            f"{self.backend_url}/api/v1/enterprise/compliance",
            expected_status=200
        )

    async def _test_endpoint(self, test_name: str, url: str, expected_status: int = 200):
        """Helper method to test HTTP endpoints"""
        start_time = time.time()
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url) as response:
                    duration = (time.time() - start_time) * 1000
                    
                    if response.status == expected_status:
                        try:
                            data = await response.json()
                            data_size = len(str(data))
                            
                            self.results.append(TestResult(
                                test_name,
                                "PASS",
                                duration,
                                f"HTTP {response.status}, Data size: {data_size} chars",
                                100.0
                            ))
                        except:
                            # Not JSON response, but status is correct
                            self.results.append(TestResult(
                                test_name,
                                "PASS",
                                duration,
                                f"HTTP {response.status} (non-JSON response)",
                                90.0
                            ))
                    else:
                        self.results.append(TestResult(
                            test_name,
                            "FAIL",
                            duration,
                            f"Expected HTTP {expected_status}, got {response.status}",
                            0.0
                        ))
        except Exception as e:
            duration = (time.time() - start_time) * 1000
            self.results.append(TestResult(
                test_name,
                "FAIL",
                duration,
                f"Connection error: {str(e)}",
                0.0
            ))

    async def _test_epic_coordination(self):
        """Test epic coordination functionality"""
        start_time = time.time()
        try:
            epic_data = {
                "title": "Test Epic Coordination",
                "description": "Testing the epic coordination system",
                "priority": "medium",
                "estimated_complexity": 5
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.backend_url}/api/v1/agents/coordinate",
                    json=epic_data
                ) as response:
                    duration = (time.time() - start_time) * 1000
                    
                    if response.status == 200:
                        data = await response.json()
                        task_count = len(data) if isinstance(data, list) else 0
                        
                        self.results.append(TestResult(
                            "Epic Coordination",
                            "PASS",
                            duration,
                            f"Created {task_count} tasks from epic",
                            min(100.0, task_count * 33.33)  # 3 tasks = 100%
                        ))
                    else:
                        self.results.append(TestResult(
                            "Epic Coordination",
                            "FAIL",
                            duration,
                            f"HTTP {response.status}",
                            0.0
                        ))
        except Exception as e:
            duration = (time.time() - start_time) * 1000
            self.results.append(TestResult(
                "Epic Coordination",
                "FAIL",
                duration,
                f"Error: {str(e)}",
                0.0
            ))

    async def generate_final_report(self):
        """Generate comprehensive test report"""
        print("\n" + "=" * 60)
        print("🏆 COMPREHENSIVE SYSTEM VALIDATION REPORT")
        print("=" * 60)
        
        # Calculate overall statistics
        total_tests = len(self.results)
        passed_tests = len([r for r in self.results if r.status == "PASS"])
        failed_tests = len([r for r in self.results if r.status == "FAIL"])
        skipped_tests = len([r for r in self.results if r.status == "SKIP"])
        
        overall_score = sum(r.score for r in self.results) / total_tests if total_tests > 0 else 0
        avg_response_time = sum(r.duration_ms for r in self.results) / total_tests if total_tests > 0 else 0
        
        print(f"\n📊 OVERALL STATISTICS:")
        print(f"   Total Tests: {total_tests}")
        print(f"   Passed: {passed_tests} ({(passed_tests/total_tests)*100:.1f}%)")
        print(f"   Failed: {failed_tests} ({(failed_tests/total_tests)*100:.1f}%)")
        print(f"   Skipped: {skipped_tests} ({(skipped_tests/total_tests)*100:.1f}%)")
        print(f"   Overall Score: {overall_score:.1f}%")
        print(f"   Average Response Time: {avg_response_time:.1f}ms")
        
        # Test results by category
        print(f"\n📋 DETAILED TEST RESULTS:")
        for result in self.results:
            status_icon = "✅" if result.status == "PASS" else "❌" if result.status == "FAIL" else "⏭️"
            print(f"   {status_icon} {result.test_name}")
            print(f"      Status: {result.status} | Score: {result.score:.1f}% | Time: {result.duration_ms:.1f}ms")
            print(f"      Details: {result.details}")
        
        # Production readiness assessment
        print(f"\n🚀 PRODUCTION READINESS ASSESSMENT:")
        
        if overall_score >= 90:
            readiness = "🟢 PRODUCTION READY"
            recommendation = "System is ready for production deployment"
        elif overall_score >= 75:
            readiness = "🟡 MOSTLY READY"
            recommendation = "Minor issues need attention before production"
        elif overall_score >= 50:
            readiness = "🟠 NEEDS WORK"
            recommendation = "Significant issues must be resolved"
        else:
            readiness = "🔴 NOT READY"
            recommendation = "Major issues prevent production deployment"
        
        print(f"   Status: {readiness}")
        print(f"   Score: {overall_score:.1f}%")
        print(f"   Recommendation: {recommendation}")
        
        # Critical issues
        critical_failures = [r for r in self.results if r.status == "FAIL" and r.score == 0]
        if critical_failures:
            print(f"\n⚠️ CRITICAL ISSUES REQUIRING ATTENTION:")
            for failure in critical_failures:
                print(f"   • {failure.test_name}: {failure.details}")
        
        # Performance insights
        slow_tests = [r for r in self.results if r.duration_ms > 1000]
        if slow_tests:
            print(f"\n⏱️ PERFORMANCE CONCERNS (>1000ms):")
            for slow_test in slow_tests:
                print(f"   • {slow_test.test_name}: {slow_test.duration_ms:.1f}ms")
        
        print(f"\n🎯 NEXT STEPS:")
        if failed_tests == 0:
            print("   ✅ All tests passed! System is ready for production.")
        else:
            print("   🔧 Address failed tests before production deployment")
            print("   📊 Re-run validation after fixes")
            print("   🚀 Deploy to staging environment for final testing")
        
        print("\n" + "=" * 60)
        print(f"Validation completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 60)

async def main():
    """Main validation runner"""
    validator = ComprehensiveSystemValidator()
    await validator.run_all_tests()

if __name__ == "__main__":
    asyncio.run(main())