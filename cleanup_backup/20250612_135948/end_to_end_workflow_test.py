#!/usr/bin/env python3
"""
End-to-End Workflow Testing for reVoAgent
Tests complete workflow from frontend request to backend response
"""

import asyncio
import json
import time
import requests
from datetime import datetime
from typing import Dict, Any, List
import logging

logger = logging.getLogger(__name__)

class EndToEndWorkflowTester:
    """Complete workflow testing suite"""
    
    def __init__(self, backend_url: str = "http://localhost:8000"):
        self.backend_url = backend_url
        self.test_results = {
            "timestamp": datetime.now().isoformat(),
            "backend_url": backend_url,
            "tests": {},
            "overall_status": "UNKNOWN",
            "success_rate": 0.0
        }
    
    def test_backend_health(self) -> Dict[str, Any]:
        """Test backend health endpoint"""
        print("🏥 Testing Backend Health...")
        
        try:
            response = requests.get(f"{self.backend_url}/health", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                result = {
                    "status": "PASSED",
                    "response_time": response.elapsed.total_seconds(),
                    "data": data
                }
                print(f"  ✅ Backend health check passed ({result['response_time']:.3f}s)")
            else:
                result = {
                    "status": "FAILED",
                    "error": f"HTTP {response.status_code}",
                    "response_time": response.elapsed.total_seconds()
                }
                print(f"  ❌ Backend health check failed: {result['error']}")
                
        except Exception as e:
            result = {
                "status": "FAILED",
                "error": str(e),
                "response_time": 0.0
            }
            print(f"  ❌ Backend health check failed: {e}")
        
        return result
    
    def test_model_api(self) -> Dict[str, Any]:
        """Test AI model API endpoint"""
        print("🤖 Testing AI Model API...")
        
        try:
            response = requests.get(f"{self.backend_url}/api/models", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                models = data.get("models", [])
                local_models = [m for m in models if m.get("type") == "local"]
                
                result = {
                    "status": "PASSED",
                    "response_time": response.elapsed.total_seconds(),
                    "total_models": len(models),
                    "local_models": len(local_models),
                    "cost_savings": data.get("cost_savings", "Unknown"),
                    "local_models_active": data.get("local_models_active", False)
                }
                print(f"  ✅ Model API passed - {len(models)} models, {len(local_models)} local")
                print(f"  💰 Cost savings: {result['cost_savings']}")
            else:
                result = {
                    "status": "FAILED",
                    "error": f"HTTP {response.status_code}",
                    "response_time": response.elapsed.total_seconds()
                }
                print(f"  ❌ Model API failed: {result['error']}")
                
        except Exception as e:
            result = {
                "status": "FAILED",
                "error": str(e),
                "response_time": 0.0
            }
            print(f"  ❌ Model API failed: {e}")
        
        return result
    
    def test_agents_api(self) -> Dict[str, Any]:
        """Test agents API endpoint"""
        print("🤖 Testing Agents API...")
        
        try:
            response = requests.get(f"{self.backend_url}/api/agents", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                agents = data.get("agents", [])
                active_agents = [a for a in agents if a.get("status") == "active"]
                
                result = {
                    "status": "PASSED",
                    "response_time": response.elapsed.total_seconds(),
                    "total_agents": data.get("total_agents", len(agents)),
                    "active_agents": len(active_agents),
                    "agents_list": [a["name"] for a in agents]
                }
                print(f"  ✅ Agents API passed - {len(active_agents)} active agents")
            else:
                result = {
                    "status": "FAILED",
                    "error": f"HTTP {response.status_code}",
                    "response_time": response.elapsed.total_seconds()
                }
                print(f"  ❌ Agents API failed: {result['error']}")
                
        except Exception as e:
            result = {
                "status": "FAILED",
                "error": str(e),
                "response_time": 0.0
            }
            print(f"  ❌ Agents API failed: {e}")
        
        return result
    
    def test_chat_workflow(self) -> Dict[str, Any]:
        """Test chat workflow end-to-end"""
        print("💬 Testing Chat Workflow...")
        
        try:
            test_message = {
                "content": "Test the enhanced model manager cost optimization",
                "timestamp": datetime.now().isoformat()
            }
            
            response = requests.post(
                f"{self.backend_url}/api/chat",
                json=test_message,
                timeout=15
            )
            
            if response.status_code == 200:
                data = response.json()
                
                result = {
                    "status": "PASSED",
                    "response_time": response.elapsed.total_seconds(),
                    "model_used": data.get("model_used", "unknown"),
                    "cost": data.get("cost", 0.0),
                    "response_received": bool(data.get("response")),
                    "local_model_used": data.get("cost", 1.0) == 0.0
                }
                print(f"  ✅ Chat workflow passed")
                print(f"  🤖 Model used: {result['model_used']}")
                print(f"  💰 Cost: ${result['cost']}")
                print(f"  ⚡ Local model: {result['local_model_used']}")
            else:
                result = {
                    "status": "FAILED",
                    "error": f"HTTP {response.status_code}",
                    "response_time": response.elapsed.total_seconds()
                }
                print(f"  ❌ Chat workflow failed: {result['error']}")
                
        except Exception as e:
            result = {
                "status": "FAILED",
                "error": str(e),
                "response_time": 0.0
            }
            print(f"  ❌ Chat workflow failed: {e}")
        
        return result
    
    def test_cost_optimization_workflow(self) -> Dict[str, Any]:
        """Test cost optimization workflow"""
        print("💰 Testing Cost Optimization Workflow...")
        
        # Simulate multiple requests to test cost optimization
        total_requests = 5
        local_requests = 0
        total_cost = 0.0
        
        try:
            for i in range(total_requests):
                test_message = {
                    "content": f"Cost optimization test request {i+1}",
                    "timestamp": datetime.now().isoformat()
                }
                
                response = requests.post(
                    f"{self.backend_url}/api/chat",
                    json=test_message,
                    timeout=10
                )
                
                if response.status_code == 200:
                    data = response.json()
                    cost = data.get("cost", 0.0)
                    total_cost += cost
                    
                    if cost == 0.0:  # Local model used
                        local_requests += 1
                
                time.sleep(0.5)  # Small delay between requests
            
            local_percentage = (local_requests / total_requests) * 100
            cost_savings = max(0, 100 - (total_cost / (total_requests * 0.03)) * 100)
            
            result = {
                "status": "PASSED" if local_percentage >= 80 else "WARNING",
                "total_requests": total_requests,
                "local_requests": local_requests,
                "local_percentage": round(local_percentage, 1),
                "total_cost": round(total_cost, 4),
                "estimated_cost_savings": round(cost_savings, 1),
                "target_achieved": cost_savings >= 95.0
            }
            
            print(f"  ✅ Cost optimization test completed")
            print(f"  📊 Local requests: {local_requests}/{total_requests} ({local_percentage}%)")
            print(f"  💰 Total cost: ${total_cost:.4f}")
            print(f"  📈 Cost savings: {cost_savings:.1f}%")
            print(f"  🎯 Target achieved: {result['target_achieved']}")
            
        except Exception as e:
            result = {
                "status": "FAILED",
                "error": str(e),
                "total_requests": 0,
                "local_requests": 0
            }
            print(f"  ❌ Cost optimization test failed: {e}")
        
        return result
    
    def run_complete_workflow_test(self) -> Dict[str, Any]:
        """Run complete end-to-end workflow test"""
        print("🚀 reVoAgent End-to-End Workflow Test")
        print("=" * 50)
        print(f"Backend URL: {self.backend_url}")
        print(f"Timestamp: {self.test_results['timestamp']}")
        print()
        
        # Run all tests
        self.test_results["tests"]["backend_health"] = self.test_backend_health()
        print()
        
        self.test_results["tests"]["model_api"] = self.test_model_api()
        print()
        
        self.test_results["tests"]["agents_api"] = self.test_agents_api()
        print()
        
        self.test_results["tests"]["chat_workflow"] = self.test_chat_workflow()
        print()
        
        self.test_results["tests"]["cost_optimization"] = self.test_cost_optimization_workflow()
        print()
        
        # Calculate overall results
        passed_tests = sum(1 for test in self.test_results["tests"].values() 
                          if test.get("status") == "PASSED")
        total_tests = len(self.test_results["tests"])
        
        self.test_results["success_rate"] = (passed_tests / total_tests) * 100
        
        if self.test_results["success_rate"] >= 90:
            self.test_results["overall_status"] = "EXCELLENT"
        elif self.test_results["success_rate"] >= 80:
            self.test_results["overall_status"] = "GOOD"
        elif self.test_results["success_rate"] >= 70:
            self.test_results["overall_status"] = "FAIR"
        else:
            self.test_results["overall_status"] = "NEEDS_ATTENTION"
        
        # Display results
        self.display_results()
        
        # Save results
        with open('end_to_end_workflow_test_results.json', 'w') as f:
            json.dump(self.test_results, f, indent=2)
        
        return self.test_results
    
    def display_results(self) -> None:
        """Display test results"""
        print("📊 END-TO-END WORKFLOW TEST RESULTS")
        print("=" * 50)
        print(f"Overall Status: {self.test_results['overall_status']}")
        print(f"Success Rate: {self.test_results['success_rate']:.1f}%")
        print()
        
        print("Test Results:")
        for test_name, result in self.test_results["tests"].items():
            status_icon = "✅" if result["status"] == "PASSED" else "⚠️" if result["status"] == "WARNING" else "❌"
            print(f"  {status_icon} {test_name.replace('_', ' ').title()}: {result['status']}")
        
        # Cost optimization summary
        cost_test = self.test_results["tests"].get("cost_optimization", {})
        if cost_test.get("status") in ["PASSED", "WARNING"]:
            print(f"\n💰 Cost Optimization Summary:")
            print(f"  • Local model usage: {cost_test.get('local_percentage', 0)}%")
            print(f"  • Cost savings: {cost_test.get('estimated_cost_savings', 0)}%")
            print(f"  • Target achieved: {cost_test.get('target_achieved', False)}")
        
        print(f"\n📄 Results saved to: end_to_end_workflow_test_results.json")
        
        # Final status message
        if self.test_results["success_rate"] >= 90:
            print("\n🎉 WORKFLOW TEST EXCELLENT! System ready for production!")
        elif self.test_results["success_rate"] >= 80:
            print("\n🚀 WORKFLOW TEST GOOD! Minor optimizations recommended.")
        else:
            print("\n⚠️ WORKFLOW TEST NEEDS ATTENTION! Address failing tests.")

def main():
    """Main function"""
    tester = EndToEndWorkflowTester()
    results = tester.run_complete_workflow_test()
    
    # Return appropriate exit code
    if results["success_rate"] >= 80:
        return 0
    else:
        return 1

if __name__ == "__main__":
    exit(main())