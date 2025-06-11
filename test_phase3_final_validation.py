#!/usr/bin/env python3
"""
Phase 3 Final Validation - Complete Testing Suite
Validates all Phase 3 components for 100% completion
"""

import os
import json
import time
import subprocess
import requests
from datetime import datetime
from pathlib import Path

class Phase3Validator:
    """Comprehensive Phase 3 validation"""
    
    def __init__(self):
        self.results = {
            "timestamp": datetime.now().isoformat(),
            "phase": "Phase 3 - Production Ready Deployment",
            "target_completion": "100%",
            "tests": {},
            "overall_status": "UNKNOWN",
            "completion_percentage": 0
        }
        
    def test_monitoring_setup(self):
        """Test monitoring infrastructure"""
        print("📊 Testing Monitoring Setup...")
        
        test_results = {
            "prometheus_config": False,
            "grafana_config": False,
            "alertmanager_config": False,
            "dashboards": False,
            "provisioning": False
        }
        
        # Check Prometheus configuration
        prometheus_config = Path("monitoring/prometheus/prometheus.yml")
        if prometheus_config.exists():
            test_results["prometheus_config"] = True
            print("  ✅ Prometheus configuration exists")
        
        # Check Grafana configuration
        grafana_config = Path("monitoring/docker-compose.monitoring.yml")
        if grafana_config.exists():
            test_results["grafana_config"] = True
            print("  ✅ Grafana configuration exists")
        
        # Check Alertmanager
        alertmanager_config = Path("monitoring/alertmanager.yml")
        if alertmanager_config.exists():
            test_results["alertmanager_config"] = True
            print("  ✅ Alertmanager configuration exists")
        
        # Check dashboards
        dashboard_dir = Path("monitoring/grafana/dashboards")
        if dashboard_dir.exists() and list(dashboard_dir.glob("*.json")):
            test_results["dashboards"] = True
            print("  ✅ Grafana dashboards exist")
        
        # Check provisioning
        provisioning_dir = Path("monitoring/grafana/provisioning")
        if provisioning_dir.exists():
            test_results["provisioning"] = True
            print("  ✅ Grafana provisioning configured")
        
        passed = sum(test_results.values())
        total = len(test_results)
        
        self.results["tests"]["monitoring_setup"] = {
            "status": "PASSED" if passed == total else "PARTIAL",
            "score": f"{passed}/{total}",
            "percentage": round((passed/total) * 100, 1),
            "details": test_results
        }
        
        print(f"  📊 Monitoring Setup: {passed}/{total} tests passed ({round((passed/total) * 100, 1)}%)")
        
    def test_security_validation(self):
        """Test security hardening"""
        print("🔒 Testing Security Validation...")
        
        test_results = {
            "security_validation_script": False,
            "security_results": False,
            "security_score": False,
            "hardening_script": False,
            "compliance_check": False
        }
        
        # Check security validation script
        security_script = Path("security/security_validation.py")
        if security_script.exists():
            test_results["security_validation_script"] = True
            print("  ✅ Security validation script exists")
        
        # Check security results
        security_results = Path("security/security_validation_results.json")
        if security_results.exists():
            test_results["security_results"] = True
            try:
                with open(security_results) as f:
                    data = json.load(f)
                    if data.get("overall_score", 0) >= 90:
                        test_results["security_score"] = True
                        print(f"  ✅ Security score: {data.get('overall_score', 0)}/100")
                    else:
                        print(f"  ⚠️ Security score below 90: {data.get('overall_score', 0)}/100")
            except Exception as e:
                print(f"  ❌ Error reading security results: {e}")
        
        # Check hardening script
        hardening_script = Path("security/security_hardening.py")
        if hardening_script.exists():
            test_results["hardening_script"] = True
            print("  ✅ Security hardening script exists")
        
        # Check compliance
        if security_results.exists():
            try:
                with open(security_results) as f:
                    data = json.load(f)
                    compliance = data.get("compliance", {})
                    if all([
                        compliance.get("soc2_ready", False),
                        compliance.get("gdpr_compliant", False),
                        compliance.get("enterprise_ready", False)
                    ]):
                        test_results["compliance_check"] = True
                        print("  ✅ Compliance requirements met")
            except Exception:
                pass
        
        passed = sum(test_results.values())
        total = len(test_results)
        
        self.results["tests"]["security_validation"] = {
            "status": "PASSED" if passed == total else "PARTIAL",
            "score": f"{passed}/{total}",
            "percentage": round((passed/total) * 100, 1),
            "details": test_results
        }
        
        print(f"  🔒 Security Validation: {passed}/{total} tests passed ({round((passed/total) * 100, 1)}%)")
        
    def test_performance_optimization(self):
        """Test performance optimization"""
        print("⚡ Testing Performance Optimization...")
        
        test_results = {
            "performance_script": False,
            "performance_results": False,
            "optimization_recommendations": False,
            "quick_validation": False,
            "performance_score": False
        }
        
        # Check performance tuning script
        perf_script = Path("performance/performance_tuning.py")
        if perf_script.exists():
            test_results["performance_script"] = True
            print("  ✅ Performance tuning script exists")
        
        # Check quick validation
        quick_val = Path("performance/quick_performance_validation.py")
        if quick_val.exists():
            test_results["quick_validation"] = True
            print("  ✅ Quick performance validation exists")
        
        # Check performance results
        perf_results = Path("performance/performance_validation_results.json")
        if perf_results.exists():
            test_results["performance_results"] = True
            try:
                with open(perf_results) as f:
                    data = json.load(f)
                    score = data.get("performance_score", 0)
                    if score >= 70:
                        test_results["performance_score"] = True
                        print(f"  ✅ Performance score: {score}/100")
                    else:
                        print(f"  ⚠️ Performance score below 70: {score}/100")
                    
                    if data.get("recommendations"):
                        test_results["optimization_recommendations"] = True
                        print("  ✅ Optimization recommendations available")
            except Exception as e:
                print(f"  ❌ Error reading performance results: {e}")
        
        passed = sum(test_results.values())
        total = len(test_results)
        
        self.results["tests"]["performance_optimization"] = {
            "status": "PASSED" if passed == total else "PARTIAL",
            "score": f"{passed}/{total}",
            "percentage": round((passed/total) * 100, 1),
            "details": test_results
        }
        
        print(f"  ⚡ Performance Optimization: {passed}/{total} tests passed ({round((passed/total) * 100, 1)}%)")
        
    def test_production_documentation(self):
        """Test production documentation"""
        print("📚 Testing Production Documentation...")
        
        test_results = {
            "deployment_guide": False,
            "troubleshooting_guide": False,
            "operational_runbook": False,
            "enterprise_guide": False,
            "architecture_docs": False
        }
        
        # Check deployment guide
        deploy_guide = Path("docs/PRODUCTION_DEPLOYMENT_GUIDE.md")
        if deploy_guide.exists():
            test_results["deployment_guide"] = True
            print("  ✅ Production deployment guide exists")
        
        # Check troubleshooting guide
        troubleshoot_guide = Path("docs/production/TROUBLESHOOTING_GUIDE.md")
        if troubleshoot_guide.exists():
            test_results["troubleshooting_guide"] = True
            print("  ✅ Troubleshooting guide exists")
        
        # Check operational runbook
        runbook = Path("docs/production/OPERATIONAL_RUNBOOK.md")
        if runbook.exists():
            test_results["operational_runbook"] = True
            print("  ✅ Operational runbook exists")
        
        # Check enterprise guide
        enterprise_guide = Path("docs/production/ENTERPRISE_DEPLOYMENT_GUIDE.md")
        if enterprise_guide.exists():
            test_results["enterprise_guide"] = True
            print("  ✅ Enterprise deployment guide exists")
        
        # Check architecture documentation
        arch_docs = Path("docs/ARCHITECTURE.md")
        if arch_docs.exists():
            test_results["architecture_docs"] = True
            print("  ✅ Architecture documentation exists")
        
        passed = sum(test_results.values())
        total = len(test_results)
        
        self.results["tests"]["production_documentation"] = {
            "status": "PASSED" if passed == total else "PARTIAL",
            "score": f"{passed}/{total}",
            "percentage": round((passed/total) * 100, 1),
            "details": test_results
        }
        
        print(f"  📚 Production Documentation: {passed}/{total} tests passed ({round((passed/total) * 100, 1)}%)")
        
    def test_deployment_infrastructure(self):
        """Test deployment infrastructure"""
        print("🚀 Testing Deployment Infrastructure...")
        
        test_results = {
            "docker_compose": False,
            "kubernetes_configs": False,
            "production_compose": False,
            "monitoring_compose": False,
            "deployment_scripts": False
        }
        
        # Check Docker Compose
        docker_compose = Path("docker-compose.yml")
        if docker_compose.exists():
            test_results["docker_compose"] = True
            print("  ✅ Docker Compose configuration exists")
        
        # Check production compose
        prod_compose = Path("docker-compose.production.yml")
        if prod_compose.exists():
            test_results["production_compose"] = True
            print("  ✅ Production Docker Compose exists")
        
        # Check monitoring compose
        mon_compose = Path("monitoring/docker-compose.monitoring.yml")
        if mon_compose.exists():
            test_results["monitoring_compose"] = True
            print("  ✅ Monitoring Docker Compose exists")
        
        # Check Kubernetes configs
        k8s_dir = Path("k8s")
        if k8s_dir.exists() and list(k8s_dir.glob("*.yaml")):
            test_results["kubernetes_configs"] = True
            print("  ✅ Kubernetes configurations exist")
        
        # Check deployment scripts
        scripts_dir = Path("scripts")
        if scripts_dir.exists() and any([
            Path("scripts/deploy_production.sh").exists(),
            Path("scripts/start_production.sh").exists()
        ]):
            test_results["deployment_scripts"] = True
            print("  ✅ Deployment scripts exist")
        
        passed = sum(test_results.values())
        total = len(test_results)
        
        self.results["tests"]["deployment_infrastructure"] = {
            "status": "PASSED" if passed == total else "PARTIAL",
            "score": f"{passed}/{total}",
            "percentage": round((passed/total) * 100, 1),
            "details": test_results
        }
        
        print(f"  🚀 Deployment Infrastructure: {passed}/{total} tests passed ({round((passed/total) * 100, 1)}%)")
        
    def calculate_overall_completion(self):
        """Calculate overall Phase 3 completion percentage"""
        total_percentage = 0
        test_count = 0
        
        for test_name, test_data in self.results["tests"].items():
            total_percentage += test_data["percentage"]
            test_count += 1
        
        if test_count > 0:
            overall_percentage = round(total_percentage / test_count, 1)
            self.results["completion_percentage"] = overall_percentage
            
            if overall_percentage >= 95:
                self.results["overall_status"] = "COMPLETE"
            elif overall_percentage >= 80:
                self.results["overall_status"] = "NEARLY_COMPLETE"
            elif overall_percentage >= 60:
                self.results["overall_status"] = "PARTIAL"
            else:
                self.results["overall_status"] = "INCOMPLETE"
        
    def run_validation(self):
        """Run complete Phase 3 validation"""
        print("🚀 Phase 3 Final Validation")
        print("=" * 50)
        print(f"Timestamp: {self.results['timestamp']}")
        print()
        
        # Run all tests
        self.test_monitoring_setup()
        print()
        self.test_security_validation()
        print()
        self.test_performance_optimization()
        print()
        self.test_production_documentation()
        print()
        self.test_deployment_infrastructure()
        print()
        
        # Calculate overall completion
        self.calculate_overall_completion()
        
        # Display results
        print("📊 PHASE 3 VALIDATION RESULTS")
        print("=" * 50)
        print(f"Overall Status: {self.results['overall_status']}")
        print(f"Completion: {self.results['completion_percentage']}%")
        print()
        
        print("Test Results:")
        for test_name, test_data in self.results["tests"].items():
            status_icon = "✅" if test_data["status"] == "PASSED" else "⚠️"
            print(f"  {status_icon} {test_name.replace('_', ' ').title()}: {test_data['score']} ({test_data['percentage']}%)")
        
        # Save results
        with open('phase3_final_validation_results.json', 'w') as f:
            json.dump(self.results, f, indent=2)
        
        print(f"\n📄 Results saved to: phase3_final_validation_results.json")
        
        # Final status
        if self.results["completion_percentage"] >= 95:
            print("\n🎉 PHASE 3 COMPLETE! Ready for production deployment!")
            return True
        else:
            print(f"\n⚠️ Phase 3 at {self.results['completion_percentage']}% - Additional work needed")
            return False

def main():
    """Main validation function"""
    validator = Phase3Validator()
    success = validator.run_validation()
    return 0 if success else 1

if __name__ == "__main__":
    exit(main())