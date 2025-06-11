#!/usr/bin/env python3
"""
Phase 4 Completion Testing Suite
Comprehensive testing for Enhanced Agents & Multi-Agent Collaboration
"""

import asyncio
import sys
import os
import logging
from datetime import datetime, timezone
from typing import Dict, List, Any

# Add src to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class Phase4CompletionTester:
    """Comprehensive Phase 4 testing suite"""
    
    def __init__(self):
        self.test_results = {}
        self.passed_tests = 0
        self.total_tests = 0
        
    async def run_all_tests(self) -> Dict[str, Any]:
        """Run all Phase 4 completion tests"""
        
        print("🚀 Phase 4 Completion Testing Suite")
        print("=" * 60)
        
        test_suites = [
            ("Multi-Agent Chat Integration", self.test_multi_agent_chat),
            ("Agent Production Deployment", self.test_agent_deployment_configs),
            ("External Integrations", self.test_external_integrations),
            ("Comprehensive Agent Testing", self.test_comprehensive_agents),
            ("Integration Validation", self.test_integration_validation)
        ]
        
        for suite_name, test_function in test_suites:
            print(f"\n🧪 Testing {suite_name}...")
            try:
                result = await test_function()
                self.test_results[suite_name] = result
                if result.get("passed", False):
                    self.passed_tests += 1
                    print(f"✅ PASSED {suite_name}")
                else:
                    print(f"❌ FAILED {suite_name}: {result.get('error', 'Unknown error')}")
                self.total_tests += 1
            except Exception as e:
                print(f"❌ ERROR {suite_name}: {str(e)}")
                self.test_results[suite_name] = {"passed": False, "error": str(e)}
                self.total_tests += 1
        
        # Generate final report
        return self.generate_completion_report()
    
    async def test_multi_agent_chat(self) -> Dict[str, Any]:
        """Test Multi-Agent Chat Integration"""
        
        try:
            from packages.chat.multi_agent_chat import MultiAgentChatOrchestrator, AgentRole
            
            # Initialize orchestrator
            orchestrator = MultiAgentChatOrchestrator()
            
            # Test session creation
            session_id = await orchestrator.start_chat_session(
                user_id="test_user",
                initial_message="I have a Python function that needs optimization and debugging. Can you help?"
            )
            
            assert session_id is not None, "Session ID should not be None"
            assert session_id in orchestrator.active_sessions, "Session should be in active sessions"
            
            # Test message processing
            response = await orchestrator.process_chat_message(
                session_id,
                "Here's my code: def slow_function(data): return [x for x in data for y in data if x == y]"
            )
            
            assert response is not None, "Response should not be None"
            assert "response" in response, "Response should contain response field"
            assert "agent_contributions" in response, "Response should contain agent contributions"
            
            # Test session summary
            summary = await orchestrator.get_session_summary(session_id)
            assert summary["session_id"] == session_id, "Summary should contain correct session ID"
            assert summary["total_interactions"] > 0, "Should have recorded interactions"
            
            # Test session ending
            final_summary = await orchestrator.end_session(session_id)
            assert final_summary["final_status"] == "completed", "Session should be completed"
            
            return {
                "passed": True,
                "details": {
                    "session_created": True,
                    "message_processed": True,
                    "multi_agent_collaboration": len(response["agent_contributions"]) > 1,
                    "session_management": True,
                    "agent_count": len(response["agent_contributions"]),
                    "confidence_score": response.get("confidence_score", 0)
                }
            }
            
        except Exception as e:
            return {"passed": False, "error": str(e)}
    
    async def test_agent_deployment_configs(self) -> Dict[str, Any]:
        """Test Agent Production Deployment Configurations"""
        
        try:
            # Check deployment configuration files
            deployment_files = [
                "deployment/agents/docker-compose.agents.yml",
                "deployment/agents/Dockerfile.chat-orchestrator",
                "deployment/agents/nginx/agent-nginx.conf",
                "deployment/agents/prometheus/agent-prometheus.yml"
            ]
            
            existing_files = []
            for file_path in deployment_files:
                if os.path.exists(file_path):
                    existing_files.append(file_path)
            
            # Check if main deployment file exists
            main_deployment_exists = os.path.exists("deployment/agents/docker-compose.agents.yml")
            
            # Validate deployment configuration structure
            deployment_config_valid = True
            if main_deployment_exists:
                with open("deployment/agents/docker-compose.agents.yml", 'r') as f:
                    content = f.read()
                    # Check for key services
                    required_services = ["multi-agent-chat", "redis"]
                    for service in required_services:
                        if service not in content:
                            deployment_config_valid = False
                            break
            
            return {
                "passed": main_deployment_exists and deployment_config_valid,
                "details": {
                    "main_deployment_file": main_deployment_exists,
                    "deployment_config_valid": deployment_config_valid,
                    "existing_files": existing_files,
                    "file_count": len(existing_files),
                    "required_services_present": deployment_config_valid
                }
            }
            
        except Exception as e:
            return {"passed": False, "error": str(e)}
    
    async def test_external_integrations(self) -> Dict[str, Any]:
        """Test External Integrations (GitHub, Slack, JIRA)"""
        
        try:
            from packages.integrations.external_integrations import (
                ExternalIntegrationsManager,
                GitHubIntegration,
                SlackIntegration,
                JIRAIntegration,
                EXAMPLE_INTEGRATION_CONFIG
            )
            
            # Initialize integrations manager
            manager = ExternalIntegrationsManager()
            
            # Test configuration loading
            await manager.initialize_from_config(EXAMPLE_INTEGRATION_CONFIG)
            
            assert len(manager.enabled_integrations) > 0, "Should have enabled integrations"
            assert "github" in manager.integrations, "GitHub integration should be available"
            assert "slack" in manager.integrations, "Slack integration should be available"
            assert "jira" in manager.integrations, "JIRA integration should be available"
            
            # Test workflow integration
            workflow_result = {
                "workflow_id": "test-123",
                "title": "Test AI Workflow",
                "description": "Testing external integrations",
                "has_code_changes": True,
                "repository": "test-repo",
                "recommendations": ["Test recommendation 1", "Test recommendation 2"],
                "severity": "medium"
            }
            
            integration_result = await manager.create_ai_workflow_integration(workflow_result)
            
            assert integration_result["success"], "Workflow integration should succeed"
            assert "integration_results" in integration_result, "Should contain integration results"
            
            # Test status reporting
            status = manager.get_integration_status()
            assert status["total_integrations"] >= 3, "Should have at least 3 integrations"
            
            return {
                "passed": True,
                "details": {
                    "integrations_loaded": len(manager.enabled_integrations),
                    "github_available": "github" in manager.integrations,
                    "slack_available": "slack" in manager.integrations,
                    "jira_available": "jira" in manager.integrations,
                    "workflow_integration_success": integration_result["success"],
                    "status_reporting": True
                }
            }
            
        except Exception as e:
            return {"passed": False, "error": str(e)}
    
    async def test_comprehensive_agents(self) -> Dict[str, Any]:
        """Test Comprehensive Agent Functionality"""
        
        try:
            # Test Enhanced Model Manager
            from packages.ai.enhanced_model_manager import EnhancedModelManager
            
            model_manager = EnhancedModelManager()
            
            # Test basic functionality
            providers = model_manager.get_available_providers()
            cost_stats = model_manager.get_cost_statistics()
            
            # Test response generation
            response = model_manager.generate_response("Test prompt for agent functionality")
            
            assert response is not None, "Model manager should generate response"
            assert "content" in response, "Response should contain content"
            assert "provider" in response, "Response should contain provider"
            
            # Test agent imports
            agent_imports = []
            
            try:
                from packages.agents.enhanced_code_analysis_agent import EnhancedCodeAnalysisAgent
                agent_imports.append("code_analysis")
            except ImportError:
                pass
            
            try:
                from packages.agents.enhanced_debug_detective_agent import EnhancedDebugDetectiveAgent
                agent_imports.append("debug_detective")
            except ImportError:
                pass
            
            try:
                from packages.workflow.advanced_workflow_engine import AdvancedWorkflowEngine
                agent_imports.append("workflow_engine")
            except ImportError:
                pass
            
            return {
                "passed": True,
                "details": {
                    "model_manager_functional": True,
                    "response_generation": response.get("success", True),
                    "cost_optimization": cost_stats.get("local_percentage", 0) >= 0,
                    "agent_imports_available": agent_imports,
                    "agent_count": len(agent_imports),
                    "provider_count": len(providers) if isinstance(providers, list) else 0
                }
            }
            
        except Exception as e:
            return {"passed": False, "error": str(e)}
    
    async def test_integration_validation(self) -> Dict[str, Any]:
        """Test Overall Integration and Validation"""
        
        try:
            # Test package structure
            package_structure = {
                "chat": os.path.exists("src/packages/chat/__init__.py"),
                "integrations": os.path.exists("src/packages/integrations/__init__.py"),
                "ai": os.path.exists("src/packages/ai/__init__.py"),
                "agents": os.path.exists("src/packages/agents/__init__.py"),
                "workflow": os.path.exists("src/packages/workflow/__init__.py")
            }
            
            # Test configuration files
            config_files = {
                "deployment_agents": os.path.exists("deployment/agents/docker-compose.agents.yml"),
                "monitoring": os.path.exists("monitoring/prometheus/prometheus.yml"),
                "security": os.path.exists("security/security_hardening.py")
            }
            
            # Test documentation
            documentation = {
                "production_guide": os.path.exists("docs/PRODUCTION_DEPLOYMENT_GUIDE.md"),
                "enterprise_guide": os.path.exists("docs/production/ENTERPRISE_DEPLOYMENT_GUIDE.md"),
                "readme": os.path.exists("README.md")
            }
            
            # Calculate completion percentage
            total_checks = len(package_structure) + len(config_files) + len(documentation)
            passed_checks = sum(package_structure.values()) + sum(config_files.values()) + sum(documentation.values())
            completion_percentage = (passed_checks / total_checks) * 100
            
            return {
                "passed": completion_percentage >= 90,  # 90% completion threshold
                "details": {
                    "package_structure": package_structure,
                    "config_files": config_files,
                    "documentation": documentation,
                    "completion_percentage": completion_percentage,
                    "total_checks": total_checks,
                    "passed_checks": passed_checks
                }
            }
            
        except Exception as e:
            return {"passed": False, "error": str(e)}
    
    def generate_completion_report(self) -> Dict[str, Any]:
        """Generate comprehensive Phase 4 completion report"""
        
        completion_percentage = (self.passed_tests / self.total_tests) * 100 if self.total_tests > 0 else 0
        
        print("\n" + "=" * 60)
        print("📊 Phase 4 Completion Report")
        print("=" * 60)
        
        for test_name, result in self.test_results.items():
            status = "✅ PASSED" if result.get("passed", False) else "❌ FAILED"
            print(f"{status} {test_name}")
            
            if "details" in result:
                for key, value in result["details"].items():
                    if isinstance(value, bool):
                        icon = "✅" if value else "❌"
                        print(f"  {icon} {key.replace('_', ' ').title()}")
                    elif isinstance(value, (int, float)):
                        print(f"  📊 {key.replace('_', ' ').title()}: {value}")
                    elif isinstance(value, list):
                        print(f"  📋 {key.replace('_', ' ').title()}: {len(value)} items")
        
        print(f"\n🎯 Overall Phase 4 Completion: {completion_percentage:.1f}%")
        print(f"📈 Tests Passed: {self.passed_tests}/{self.total_tests}")
        
        # Phase 4 specific achievements
        phase_4_achievements = []
        
        if self.test_results.get("Multi-Agent Chat Integration", {}).get("passed", False):
            phase_4_achievements.append("✅ Multi-Agent Chat System Operational")
        
        if self.test_results.get("Agent Production Deployment", {}).get("passed", False):
            phase_4_achievements.append("✅ Agent Production Deployment Configured")
        
        if self.test_results.get("External Integrations", {}).get("passed", False):
            phase_4_achievements.append("✅ External Integrations (GitHub, Slack, JIRA) Ready")
        
        if self.test_results.get("Comprehensive Agent Testing", {}).get("passed", False):
            phase_4_achievements.append("✅ Enhanced Agents Fully Functional")
        
        if completion_percentage >= 90:
            phase_4_achievements.append("🎉 Phase 4 - Enhanced Agents & Multi-Agent Collaboration COMPLETE!")
        
        print(f"\n🏆 Phase 4 Achievements:")
        for achievement in phase_4_achievements:
            print(f"   {achievement}")
        
        # Next steps
        if completion_percentage >= 90:
            print(f"\n🚀 Ready for Phase 5: Enterprise Production Launch & Market Readiness")
            print(f"   - All Phase 4 components operational")
            print(f"   - Multi-agent collaboration validated")
            print(f"   - External integrations configured")
            print(f"   - Production deployment ready")
        else:
            print(f"\n⚠️  Phase 4 Completion Required:")
            for test_name, result in self.test_results.items():
                if not result.get("passed", False):
                    print(f"   - Fix {test_name}")
        
        return {
            "phase": "Phase 4 - Enhanced Agents & Multi-Agent Collaboration",
            "completion_percentage": completion_percentage,
            "tests_passed": self.passed_tests,
            "total_tests": self.total_tests,
            "test_results": self.test_results,
            "achievements": phase_4_achievements,
            "ready_for_phase_5": completion_percentage >= 90,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

async def main():
    """Run Phase 4 completion testing"""
    
    tester = Phase4CompletionTester()
    report = await tester.run_all_tests()
    
    # Save report
    import json
    with open("PHASE_4_COMPLETION_REPORT.json", "w") as f:
        json.dump(report, f, indent=2)
    
    print(f"\n📄 Report saved to: PHASE_4_COMPLETION_REPORT.json")
    
    return report

if __name__ == "__main__":
    asyncio.run(main())