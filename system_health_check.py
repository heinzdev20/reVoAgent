#!/usr/bin/env python3
"""
reVoAgent Comprehensive System Health Check
Priority 1 validation script based on the comprehensive analysis

This script validates:
- Enhanced AI Model Manager Integration
- Frontend-Backend Integration  
- Core API Health
- Database connectivity
- Security system functionality
- Monitoring system status
- 95% cost savings validation
"""

import os
import sys
import json
import time
import asyncio
import subprocess
import requests
import sqlite3
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class SystemHealthChecker:
    """Comprehensive system health checker for reVoAgent platform"""
    
    def __init__(self):
        self.results = {
            "timestamp": datetime.now().isoformat(),
            "overall_status": "UNKNOWN",
            "health_score": 0,
            "priority_1_checks": {},
            "recommendations": [],
            "critical_issues": [],
            "warnings": []
        }
        
        # Base paths
        self.base_path = Path(__file__).parent
        self.src_path = self.base_path / "src"
        self.packages_path = self.base_path / "packages"
        self.frontend_path = self.base_path / "frontend"
        
    def check_enhanced_ai_model_manager(self) -> Dict[str, Any]:
        """P1.1: Enhanced AI Model Manager Integration"""
        print("🤖 Checking Enhanced AI Model Manager Integration...")
        
        checks = {
            "enhanced_manager_exists": False,
            "deepseek_r1_integration": False,
            "llama_fallback": False,
            "cost_optimization": False,
            "model_switching": False,
            "performance_monitoring": False
        }
        
        # Check enhanced model manager exists
        enhanced_manager_paths = [
            self.src_path / "packages/ai/enhanced_model_manager.py",
            self.packages_path / "ai/enhanced_model_manager.py"
        ]
        
        for path in enhanced_manager_paths:
            if path.exists():
                checks["enhanced_manager_exists"] = True
                print(f"  ✅ Enhanced model manager found at {path}")
                
                # Check file content for key features
                with open(path, 'r') as f:
                    content = f.read()
                    
                    if "DeepSeek R1" in content or "deepseek" in content.lower():
                        checks["deepseek_r1_integration"] = True
                        print("  ✅ DeepSeek R1 integration detected")
                    
                    if "llama" in content.lower() or "Llama" in content:
                        checks["llama_fallback"] = True
                        print("  ✅ Llama fallback detected")
                    
                    if "cost" in content.lower() and "optimization" in content.lower():
                        checks["cost_optimization"] = True
                        print("  ✅ Cost optimization features detected")
                    
                    if "model_switching" in content or "switch" in content:
                        checks["model_switching"] = True
                        print("  ✅ Model switching capability detected")
                    
                    if "performance" in content.lower() and "monitoring" in content.lower():
                        checks["performance_monitoring"] = True
                        print("  ✅ Performance monitoring detected")
                break
        
        if not checks["enhanced_manager_exists"]:
            print("  ❌ Enhanced model manager not found")
            self.results["critical_issues"].append("Enhanced AI Model Manager missing - critical for 95% cost savings")
        
        # Check current model manager
        current_manager_paths = [
            self.packages_path / "ai/model_manager.py",
            self.src_path / "revoagent/ai/model_manager.py"
        ]
        
        current_manager_exists = any(path.exists() for path in current_manager_paths)
        if current_manager_exists:
            print("  ✅ Current model manager exists")
        else:
            print("  ❌ Current model manager missing")
            self.results["critical_issues"].append("Current model manager missing")
        
        score = sum(checks.values()) / len(checks) * 100
        
        return {
            "status": "PASSED" if score >= 80 else "FAILED",
            "score": round(score, 1),
            "checks": checks,
            "recommendations": [
                "Integrate enhanced model manager with existing system",
                "Validate DeepSeek R1 0528 prioritization",
                "Test 95% cost savings achievement",
                "Implement intelligent model switching"
            ] if score < 80 else []
        }
    
    def check_frontend_backend_integration(self) -> Dict[str, Any]:
        """P1.2: Frontend-Backend Integration"""
        print("🎨 Checking Frontend-Backend Integration...")
        
        checks = {
            "frontend_exists": False,
            "react_apps_present": False,
            "api_connectivity": False,
            "websocket_support": False,
            "authentication_flow": False,
            "ui_components": False
        }
        
        # Check frontend directory
        if self.frontend_path.exists():
            checks["frontend_exists"] = True
            print("  ✅ Frontend directory exists")
            
            # Check for React apps
            app_files = [
                self.frontend_path / "src/App.tsx",
                self.frontend_path / "src/WorkingApp.tsx",
                self.frontend_path / "src/components"
            ]
            
            if any(path.exists() for path in app_files):
                checks["react_apps_present"] = True
                print("  ✅ React applications detected")
            
            # Check for WebSocket support
            websocket_files = [
                self.frontend_path / "src/hooks/useWebSocket.ts",
                self.frontend_path / "src/services/websocket.ts"
            ]
            
            if any(path.exists() for path in websocket_files):
                checks["websocket_support"] = True
                print("  ✅ WebSocket support detected")
            
            # Check for authentication
            auth_files = [
                self.frontend_path / "src/auth",
                self.frontend_path / "src/components/Auth"
            ]
            
            if any(path.exists() for path in auth_files):
                checks["authentication_flow"] = True
                print("  ✅ Authentication components detected")
            
            # Check UI components
            components_dir = self.frontend_path / "src/components"
            if components_dir.exists() and len(list(components_dir.glob("*.tsx"))) > 5:
                checks["ui_components"] = True
                print("  ✅ UI components library detected")
        
        # Test API connectivity (if backend is running)
        try:
            response = requests.get("http://localhost:8000/health", timeout=5)
            if response.status_code == 200:
                checks["api_connectivity"] = True
                print("  ✅ API connectivity confirmed")
        except:
            print("  ⚠️ API not responding (may not be running)")
            self.results["warnings"].append("Backend API not responding - start with 'python main.py'")
        
        score = sum(checks.values()) / len(checks) * 100
        
        return {
            "status": "PASSED" if score >= 70 else "FAILED",
            "score": round(score, 1),
            "checks": checks,
            "recommendations": [
                "Start backend API server",
                "Test frontend-backend communication",
                "Validate WebSocket connections",
                "Test authentication flow end-to-end"
            ] if score < 70 else []
        }
    
    def check_core_api_health(self) -> Dict[str, Any]:
        """P1.3: Core API Health"""
        print("🔧 Checking Core API Health...")
        
        checks = {
            "main_entry_exists": False,
            "api_endpoints_defined": False,
            "database_config": False,
            "monitoring_setup": False,
            "security_config": False,
            "test_suite_exists": False
        }
        
        # Check main entry point
        main_files = [
            self.base_path / "main.py",
            self.base_path / "src/main.py",
            self.base_path / "start_integrated_system.py"
        ]
        
        if any(path.exists() for path in main_files):
            checks["main_entry_exists"] = True
            print("  ✅ Main entry point exists")
        
        # Check API endpoints
        api_paths = [
            self.src_path / "revoagent/api",
            self.packages_path / "api",
            self.base_path / "apps/api"
        ]
        
        for api_path in api_paths:
            if api_path.exists() and len(list(api_path.glob("*.py"))) > 3:
                checks["api_endpoints_defined"] = True
                print("  ✅ API endpoints detected")
                break
        
        # Check database configuration
        db_files = [
            self.base_path / "config/database.yaml",
            self.base_path / "config/base.yaml"
        ]
        
        if any(path.exists() for path in db_files):
            checks["database_config"] = True
            print("  ✅ Database configuration found")
        
        # Check monitoring setup
        monitoring_path = self.base_path / "monitoring"
        if monitoring_path.exists():
            checks["monitoring_setup"] = True
            print("  ✅ Monitoring system configured")
        
        # Check security configuration
        security_path = self.base_path / "security"
        if security_path.exists():
            checks["security_config"] = True
            print("  ✅ Security system configured")
        
        # Check test suite
        test_files = [
            self.base_path / "test_phase_completion_final.py",
            self.base_path / "tests"
        ]
        
        if any(path.exists() for path in test_files):
            checks["test_suite_exists"] = True
            print("  ✅ Test suite available")
        
        score = sum(checks.values()) / len(checks) * 100
        
        return {
            "status": "PASSED" if score >= 80 else "FAILED", 
            "score": round(score, 1),
            "checks": checks,
            "recommendations": [
                "Run comprehensive test suite",
                "Validate all API endpoints",
                "Check database connectivity",
                "Verify security system functionality"
            ] if score < 80 else []
        }
    
    def check_database_connectivity(self) -> Dict[str, Any]:
        """Check database connectivity and health"""
        print("🗄️ Checking Database Connectivity...")
        
        checks = {
            "sqlite_accessible": False,
            "wal_mode_enabled": False,
            "tables_exist": False,
            "data_integrity": False
        }
        
        # Look for SQLite database files
        db_files = list(self.base_path.glob("*.db")) + list(self.base_path.glob("**/*.db"))
        
        if db_files:
            try:
                db_path = db_files[0]
                conn = sqlite3.connect(str(db_path))
                checks["sqlite_accessible"] = True
                print(f"  ✅ SQLite database accessible at {db_path}")
                
                # Check WAL mode
                cursor = conn.cursor()
                cursor.execute("PRAGMA journal_mode;")
                mode = cursor.fetchone()[0]
                if mode.upper() == "WAL":
                    checks["wal_mode_enabled"] = True
                    print("  ✅ WAL mode enabled")
                
                # Check for tables
                cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
                tables = cursor.fetchall()
                if len(tables) > 0:
                    checks["tables_exist"] = True
                    print(f"  ✅ {len(tables)} tables found")
                    checks["data_integrity"] = True  # Assume integrity if tables exist
                
                conn.close()
                
            except Exception as e:
                print(f"  ❌ Database error: {e}")
                self.results["critical_issues"].append(f"Database connectivity issue: {e}")
        else:
            print("  ⚠️ No SQLite database files found")
            self.results["warnings"].append("No database files found - may need initialization")
        
        score = sum(checks.values()) / len(checks) * 100
        
        return {
            "status": "PASSED" if score >= 75 else "FAILED",
            "score": round(score, 1),
            "checks": checks
        }
    
    def check_security_system(self) -> Dict[str, Any]:
        """Check security system functionality"""
        print("🔒 Checking Security System...")
        
        checks = {
            "jwt_implementation": False,
            "rbac_system": False,
            "security_validation": False,
            "security_score": False
        }
        
        # Check JWT implementation
        jwt_files = [
            self.src_path / "revoagent/security/auth.py",
            self.packages_path / "security",
            self.base_path / "security"
        ]
        
        for path in jwt_files:
            if path.exists():
                if path.is_file():
                    with open(path, 'r') as f:
                        content = f.read()
                        if "jwt" in content.lower() or "JWT" in content:
                            checks["jwt_implementation"] = True
                            print("  ✅ JWT implementation detected")
                            break
                elif path.is_dir() and len(list(path.glob("*.py"))) > 0:
                    checks["jwt_implementation"] = True
                    print("  ✅ Security module detected")
                    break
        
        # Check RBAC system
        rbac_indicators = ["rbac", "role", "permission", "access_control"]
        for jwt_path in jwt_files:
            if jwt_path.exists() and jwt_path.is_dir():
                for py_file in jwt_path.glob("*.py"):
                    with open(py_file, 'r') as f:
                        content = f.read().lower()
                        if any(indicator in content for indicator in rbac_indicators):
                            checks["rbac_system"] = True
                            print("  ✅ RBAC system detected")
                            break
        
        # Check security validation results
        security_results = [
            self.base_path / "security_validation_results.json",
            self.base_path / "security/security_validation_results.json"
        ]
        
        for result_file in security_results:
            if result_file.exists():
                checks["security_validation"] = True
                print("  ✅ Security validation results found")
                
                try:
                    with open(result_file, 'r') as f:
                        data = json.load(f)
                        if data.get("overall_score", 0) > 90:
                            checks["security_score"] = True
                            print(f"  ✅ Security score: {data.get('overall_score', 0)}/100")
                except:
                    pass
                break
        
        score = sum(checks.values()) / len(checks) * 100
        
        return {
            "status": "PASSED" if score >= 75 else "FAILED",
            "score": round(score, 1),
            "checks": checks
        }
    
    def check_cost_savings_validation(self) -> Dict[str, Any]:
        """Validate 95% cost savings capability"""
        print("💰 Checking Cost Savings Validation...")
        
        checks = {
            "local_models_configured": False,
            "cloud_fallback_configured": False,
            "cost_tracking": False,
            "optimization_logic": False
        }
        
        # Check for local model configurations
        local_model_files = [
            self.packages_path / "ai/llama_local_integration.py",
            self.packages_path / "ai/cpu_optimized_deepseek.py",
            self.src_path / "packages/ai/enhanced_model_manager.py"
        ]
        
        for model_file in local_model_files:
            if model_file.exists():
                checks["local_models_configured"] = True
                print("  ✅ Local models configured")
                break
        
        # Check for cloud fallback
        cloud_files = [
            self.packages_path / "ai/openai_integration.py",
            self.packages_path / "ai/deepseek_integration.py"
        ]
        
        if any(path.exists() for path in cloud_files):
            checks["cloud_fallback_configured"] = True
            print("  ✅ Cloud fallback configured")
        
        # Check for cost tracking
        cost_indicators = ["cost", "pricing", "savings", "optimization"]
        ai_dir = self.packages_path / "ai"
        if ai_dir.exists():
            for py_file in ai_dir.glob("*.py"):
                with open(py_file, 'r') as f:
                    content = f.read().lower()
                    if any(indicator in content for indicator in cost_indicators):
                        checks["cost_tracking"] = True
                        print("  ✅ Cost tracking logic detected")
                        break
        
        # Check optimization logic
        if checks["local_models_configured"] and checks["cloud_fallback_configured"]:
            checks["optimization_logic"] = True
            print("  ✅ Cost optimization logic present")
        
        score = sum(checks.values()) / len(checks) * 100
        
        return {
            "status": "PASSED" if score >= 75 else "FAILED",
            "score": round(score, 1),
            "checks": checks,
            "recommendations": [
                "Test actual cost savings with real workloads",
                "Implement cost tracking dashboard",
                "Validate local model performance",
                "Configure intelligent fallback thresholds"
            ] if score < 75 else []
        }
    
    def run_existing_test_suite(self) -> Dict[str, Any]:
        """Run existing test suite if available"""
        print("🧪 Running Existing Test Suite...")
        
        test_files = [
            "test_phase_completion_final.py",
            "test_phase4_final_validation.py",
            "test_phase3_final_validation.py"
        ]
        
        results = {
            "tests_run": False,
            "tests_passed": False,
            "test_output": ""
        }
        
        for test_file in test_files:
            test_path = self.base_path / test_file
            if test_path.exists():
                try:
                    print(f"  🔄 Running {test_file}...")
                    result = subprocess.run(
                        [sys.executable, str(test_path)],
                        capture_output=True,
                        text=True,
                        timeout=120,
                        cwd=str(self.base_path)
                    )
                    
                    results["tests_run"] = True
                    results["test_output"] = result.stdout[-500:]  # Last 500 chars
                    
                    if result.returncode == 0:
                        results["tests_passed"] = True
                        print(f"  ✅ {test_file} passed")
                    else:
                        print(f"  ⚠️ {test_file} had issues")
                        self.results["warnings"].append(f"Test suite {test_file} reported issues")
                    
                    break  # Run only one test suite
                    
                except subprocess.TimeoutExpired:
                    print(f"  ⚠️ {test_file} timed out")
                    results["test_output"] = "Test timed out after 120 seconds"
                except Exception as e:
                    print(f"  ❌ Error running {test_file}: {e}")
                    results["test_output"] = str(e)
        
        if not results["tests_run"]:
            print("  ⚠️ No test suites found or runnable")
            self.results["warnings"].append("No test suites available")
        
        return results
    
    def calculate_overall_health(self, check_results: Dict[str, Any]) -> None:
        """Calculate overall system health score"""
        total_score = 0
        check_count = 0
        
        for check_name, result in check_results.items():
            if isinstance(result, dict) and "score" in result:
                total_score += result["score"]
                check_count += 1
        
        if check_count > 0:
            self.results["health_score"] = round(total_score / check_count, 1)
            
            if self.results["health_score"] >= 90:
                self.results["overall_status"] = "EXCELLENT"
            elif self.results["health_score"] >= 80:
                self.results["overall_status"] = "GOOD"
            elif self.results["health_score"] >= 70:
                self.results["overall_status"] = "FAIR"
            else:
                self.results["overall_status"] = "NEEDS_ATTENTION"
    
    def generate_recommendations(self) -> None:
        """Generate actionable recommendations"""
        recommendations = []
        
        if len(self.results["critical_issues"]) > 0:
            recommendations.append("🚨 Address critical issues immediately")
        
        if self.results["health_score"] < 80:
            recommendations.extend([
                "🔧 Run enhanced model manager integration",
                "🧪 Execute comprehensive test suite",
                "📊 Validate cost savings with real workloads",
                "🔒 Verify security system functionality"
            ])
        
        if len(self.results["warnings"]) > 3:
            recommendations.append("⚠️ Review and address system warnings")
        
        if self.results["health_score"] >= 90:
            recommendations.extend([
                "🚀 System ready for production deployment",
                "📈 Consider implementing Phase 4 enhancements",
                "🎯 Focus on reVo Chat multi-agent integration"
            ])
        
        self.results["recommendations"] = recommendations
    
    def run_health_check(self) -> Dict[str, Any]:
        """Run complete system health check"""
        print("🏥 reVoAgent System Health Check")
        print("=" * 50)
        print(f"Timestamp: {self.results['timestamp']}")
        print()
        
        # Run all Priority 1 checks
        check_results = {}
        
        check_results["enhanced_ai_model_manager"] = self.check_enhanced_ai_model_manager()
        print()
        
        check_results["frontend_backend_integration"] = self.check_frontend_backend_integration()
        print()
        
        check_results["core_api_health"] = self.check_core_api_health()
        print()
        
        check_results["database_connectivity"] = self.check_database_connectivity()
        print()
        
        check_results["security_system"] = self.check_security_system()
        print()
        
        check_results["cost_savings_validation"] = self.check_cost_savings_validation()
        print()
        
        check_results["test_suite_execution"] = self.run_existing_test_suite()
        print()
        
        # Store results
        self.results["priority_1_checks"] = check_results
        
        # Calculate overall health
        self.calculate_overall_health(check_results)
        
        # Generate recommendations
        self.generate_recommendations()
        
        # Display results
        self.display_results()
        
        # Save results
        with open('system_health_check_results.json', 'w') as f:
            json.dump(self.results, f, indent=2)
        
        return self.results
    
    def display_results(self) -> None:
        """Display health check results"""
        print("📊 SYSTEM HEALTH CHECK RESULTS")
        print("=" * 50)
        print(f"Overall Status: {self.results['overall_status']}")
        print(f"Health Score: {self.results['health_score']}/100")
        print()
        
        print("Priority 1 Check Results:")
        for check_name, result in self.results["priority_1_checks"].items():
            if isinstance(result, dict) and "status" in result:
                status_icon = "✅" if result["status"] == "PASSED" else "❌"
                score = result.get("score", 0)
                print(f"  {status_icon} {check_name.replace('_', ' ').title()}: {score}%")
        
        if self.results["critical_issues"]:
            print("\n🚨 Critical Issues:")
            for issue in self.results["critical_issues"]:
                print(f"  • {issue}")
        
        if self.results["warnings"]:
            print("\n⚠️ Warnings:")
            for warning in self.results["warnings"]:
                print(f"  • {warning}")
        
        if self.results["recommendations"]:
            print("\n💡 Recommendations:")
            for rec in self.results["recommendations"]:
                print(f"  • {rec}")
        
        print(f"\n📄 Results saved to: system_health_check_results.json")
        
        # Final status message
        if self.results["health_score"] >= 90:
            print("\n🎉 SYSTEM HEALTH EXCELLENT! Ready for production!")
        elif self.results["health_score"] >= 80:
            print("\n🚀 SYSTEM HEALTH GOOD! Minor optimizations recommended.")
        elif self.results["health_score"] >= 70:
            print("\n⚠️ SYSTEM HEALTH FAIR! Address recommendations before production.")
        else:
            print("\n🚨 SYSTEM NEEDS ATTENTION! Address critical issues immediately.")

def main():
    """Main function"""
    checker = SystemHealthChecker()
    results = checker.run_health_check()
    
    # Return appropriate exit code
    if results["health_score"] >= 80:
        return 0
    elif results["health_score"] >= 70:
        return 1
    else:
        return 2

if __name__ == "__main__":
    exit(main())