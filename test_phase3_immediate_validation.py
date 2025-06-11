#!/usr/bin/env python3
"""
Phase 3 Immediate Actions Validation
Quick validation of backend API, WebSocket, agents, performance, and security
"""

import asyncio
import aiohttp
import websockets
import json
import time
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class Phase3Validator:
    def __init__(self):
        self.backend_url = "http://localhost:8000"
        self.websocket_url = "ws://localhost:8000"
        self.results = {}
    
    async def validate_backend_api(self):
        """Validate Backend API Connection"""
        logger.info("🔧 Validating Backend API Connection...")
        
        endpoints = [
            "/health",
            "/api/models", 
            "/api/agents",
            "/api/metrics/system",
            "/api/security/status",
            "/api/analytics/costs"
        ]
        
        successful = 0
        total = len(endpoints)
        
        async with aiohttp.ClientSession() as session:
            for endpoint in endpoints:
                try:
                    start_time = time.time()
                    async with session.get(f"{self.backend_url}{endpoint}") as response:
                        response_time = (time.time() - start_time) * 1000
                        
                        if response.status == 200:
                            successful += 1
                            logger.info(f"✅ {endpoint}: {response.status} ({response_time:.1f}ms)")
                        else:
                            logger.warning(f"⚠️ {endpoint}: {response.status}")
                            
                except Exception as e:
                    logger.error(f"❌ {endpoint}: {str(e)}")
        
        success_rate = (successful / total) * 100
        self.results["backend_api"] = {
            "success_rate": success_rate,
            "successful_endpoints": successful,
            "total_endpoints": total,
            "status": "passed" if success_rate >= 80 else "failed"
        }
        
        logger.info(f"🔧 Backend API: {success_rate:.1f}% success rate")
        return success_rate >= 80
    
    async def validate_websocket(self):
        """Validate WebSocket Connection"""
        logger.info("📡 Validating WebSocket Connection...")
        
        try:
            async with websockets.connect(f"{self.websocket_url}/ws") as websocket:
                logger.info("✅ WebSocket connection established")
                
                # Send test message
                test_message = {
                    "type": "test",
                    "data": {"message": "Phase 3 validation test"},
                    "timestamp": datetime.now().isoformat()
                }
                
                await websocket.send(json.dumps(test_message))
                logger.info("✅ WebSocket message sent")
                
                # Receive response
                try:
                    response = await asyncio.wait_for(websocket.recv(), timeout=10.0)
                    logger.info("✅ WebSocket message received")
                    
                    self.results["websocket"] = {
                        "connection": True,
                        "messaging": True,
                        "status": "passed"
                    }
                    
                    logger.info("📡 WebSocket: Connection and messaging successful")
                    return True
                    
                except asyncio.TimeoutError:
                    logger.warning("⚠️ WebSocket message timeout")
                    self.results["websocket"] = {
                        "connection": True,
                        "messaging": False,
                        "status": "partial"
                    }
                    return False
                    
        except Exception as e:
            logger.error(f"❌ WebSocket validation failed: {e}")
            self.results["websocket"] = {
                "connection": False,
                "messaging": False,
                "status": "failed"
            }
            return False
    
    async def validate_agent_coordination(self):
        """Validate 100-Agent Coordination"""
        logger.info("🤖 Validating Agent Coordination...")
        
        async with aiohttp.ClientSession() as session:
            try:
                # Get all agents
                async with session.get(f"{self.backend_url}/api/agents") as response:
                    if response.status == 200:
                        data = await response.json()
                        total_agents = len(data.get("data", []))
                        logger.info(f"✅ Total agents: {total_agents}")
                        
                        # Get agents by type
                        claude_count = 0
                        gemini_count = 0
                        openhands_count = 0
                        
                        for agent_type, var_name in [("claude", "claude_count"), ("gemini", "gemini_count"), ("openhands", "openhands_count")]:
                            async with session.get(f"{self.backend_url}/api/agents?type={agent_type}") as type_response:
                                if type_response.status == 200:
                                    type_data = await type_response.json()
                                    count = len(type_data.get("data", []))
                                    locals()[var_name] = count
                                    logger.info(f"✅ {agent_type.title()} agents: {count}")
                        
                        # Check coordination endpoint
                        async with session.get(f"{self.backend_url}/api/coordination") as coord_response:
                            coordination_working = coord_response.status == 200
                            if coordination_working:
                                logger.info("✅ Agent coordination system operational")
                            else:
                                logger.warning("⚠️ Agent coordination system not responding")
                        
                        self.results["agent_coordination"] = {
                            "total_agents": total_agents,
                            "claude_agents": claude_count,
                            "gemini_agents": gemini_count,
                            "openhands_agents": openhands_count,
                            "coordination_system": coordination_working,
                            "target_agents": 100,
                            "coverage_percent": (total_agents / 100) * 100,
                            "status": "passed" if total_agents >= 80 else "partial" if total_agents >= 50 else "failed"
                        }
                        
                        logger.info(f"🤖 Agent Coordination: {total_agents}/100 agents ({(total_agents/100)*100:.1f}%)")
                        return total_agents >= 80
                        
            except Exception as e:
                logger.error(f"❌ Agent coordination validation failed: {e}")
                self.results["agent_coordination"] = {
                    "total_agents": 0,
                    "status": "failed"
                }
                return False
    
    async def validate_performance(self):
        """Validate Performance Optimization"""
        logger.info("⚡ Validating Performance Optimization...")
        
        async with aiohttp.ClientSession() as session:
            try:
                # Test response times
                response_times = []
                for i in range(5):
                    start_time = time.time()
                    async with session.get(f"{self.backend_url}/api/metrics/performance") as response:
                        response_time = (time.time() - start_time) * 1000
                        response_times.append(response_time)
                        
                        if i == 0 and response.status == 200:
                            data = await response.json()
                            perf_data = data.get("data", {})
                
                avg_response_time = sum(response_times) / len(response_times)
                
                # Get system metrics
                async with session.get(f"{self.backend_url}/api/metrics/system") as response:
                    system_data = {}
                    if response.status == 200:
                        data = await response.json()
                        system_data = data.get("data", {})
                
                # Performance targets
                response_time_ok = avg_response_time < 200  # <200ms
                uptime_ok = system_data.get("uptime_percentage", 0) > 99  # >99%
                
                # Cost optimization
                async with session.get(f"{self.backend_url}/api/analytics/cost-optimization") as response:
                    cost_ok = False
                    if response.status == 200:
                        data = await response.json()
                        cost_data = data.get("data", {})
                        savings = cost_data.get("savings_percentage", 0)
                        cost_ok = savings >= 90  # >90% savings
                
                performance_score = sum([response_time_ok, uptime_ok, cost_ok]) / 3 * 100
                
                self.results["performance"] = {
                    "avg_response_time": avg_response_time,
                    "response_time_target": response_time_ok,
                    "uptime_target": uptime_ok,
                    "cost_optimization": cost_ok,
                    "performance_score": performance_score,
                    "status": "passed" if performance_score >= 70 else "failed"
                }
                
                logger.info(f"⚡ Performance: {performance_score:.1f}% (Response: {avg_response_time:.1f}ms)")
                return performance_score >= 70
                
            except Exception as e:
                logger.error(f"❌ Performance validation failed: {e}")
                self.results["performance"] = {"status": "failed"}
                return False
    
    async def validate_security(self):
        """Validate Security and Compliance"""
        logger.info("🛡️ Validating Security and Compliance...")
        
        async with aiohttp.ClientSession() as session:
            try:
                # Security status
                async with session.get(f"{self.backend_url}/api/security/status") as response:
                    security_ok = False
                    security_score = 0
                    
                    if response.status == 200:
                        data = await response.json()
                        security_data = data.get("data", {})
                        security_score = security_data.get("overall_score", 0)
                        critical_vulns = security_data.get("vulnerabilities", {}).get("critical", 1)
                        
                        security_ok = security_score >= 95 and critical_vulns == 0
                        
                        if security_ok:
                            logger.info(f"✅ Security score: {security_score}% (0 critical vulnerabilities)")
                        else:
                            logger.warning(f"⚠️ Security score: {security_score}% ({critical_vulns} critical vulnerabilities)")
                
                # Compliance status
                async with session.get(f"{self.backend_url}/api/compliance/status") as response:
                    compliance_ok = False
                    
                    if response.status == 200:
                        data = await response.json()
                        compliance_data = data.get("data", {})
                        
                        compliant_frameworks = sum(
                            1 for framework_data in compliance_data.values()
                            if isinstance(framework_data, dict) and framework_data.get("status") == "compliant"
                        )
                        
                        compliance_ok = compliant_frameworks >= 3  # At least 3 frameworks compliant
                        
                        if compliance_ok:
                            logger.info(f"✅ Compliance: {compliant_frameworks} frameworks compliant")
                        else:
                            logger.warning(f"⚠️ Compliance: Only {compliant_frameworks} frameworks compliant")
                
                security_overall = security_ok and compliance_ok
                
                self.results["security"] = {
                    "security_score": security_score,
                    "security_target": security_ok,
                    "compliance_target": compliance_ok,
                    "overall_security": security_overall,
                    "status": "passed" if security_overall else "failed"
                }
                
                logger.info(f"🛡️ Security: {'Passed' if security_overall else 'Failed'}")
                return security_overall
                
            except Exception as e:
                logger.error(f"❌ Security validation failed: {e}")
                self.results["security"] = {"status": "failed"}
                return False
    
    async def run_validation(self):
        """Run all validations"""
        logger.info("🚀 Starting Phase 3 Immediate Actions Validation")
        logger.info("=" * 60)
        
        start_time = time.time()
        
        # Run validations
        validations = [
            ("Backend API Connection", self.validate_backend_api),
            ("WebSocket Validation", self.validate_websocket),
            ("Agent Coordination", self.validate_agent_coordination),
            ("Performance Optimization", self.validate_performance),
            ("Security Compliance", self.validate_security)
        ]
        
        passed = 0
        total = len(validations)
        
        for name, validation_func in validations:
            try:
                result = await validation_func()
                if result:
                    passed += 1
            except Exception as e:
                logger.error(f"❌ {name} validation failed: {e}")
        
        # Calculate results
        duration = time.time() - start_time
        success_rate = (passed / total) * 100
        overall_status = "PASSED" if success_rate >= 80 else "FAILED"
        
        # Summary
        logger.info("\n" + "=" * 60)
        logger.info("📊 PHASE 3 IMMEDIATE ACTIONS VALIDATION SUMMARY")
        logger.info("=" * 60)
        
        status_emoji = "✅" if overall_status == "PASSED" else "❌"
        logger.info(f"{status_emoji} Overall Status: {overall_status}")
        logger.info(f"📈 Success Rate: {success_rate:.1f}%")
        logger.info(f"⏱️ Duration: {duration:.1f} seconds")
        logger.info(f"✅ Passed: {passed}/{total} validations")
        
        # Individual results
        logger.info("\n📋 Validation Results:")
        for name, _ in validations:
            key = name.lower().replace(" ", "_")
            result = self.results.get(key, {})
            status = result.get("status", "unknown")
            emoji = "✅" if status == "passed" else "⚠️" if status == "partial" else "❌"
            logger.info(f"  {emoji} {name}: {status.upper()}")
        
        # Save results
        self.results["summary"] = {
            "overall_status": overall_status,
            "success_rate": success_rate,
            "passed_validations": passed,
            "total_validations": total,
            "duration_seconds": duration,
            "timestamp": datetime.now().isoformat()
        }
        
        # Save to file
        with open("phase3_validation_results.json", "w") as f:
            json.dump(self.results, f, indent=2)
        
        logger.info(f"\n💾 Results saved to: phase3_validation_results.json")
        logger.info("=" * 60)
        
        return overall_status == "PASSED"

async def main():
    validator = Phase3Validator()
    success = await validator.run_validation()
    return 0 if success else 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    exit(exit_code)