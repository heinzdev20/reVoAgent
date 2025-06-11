#!/usr/bin/env python3
"""
reVoAgent Security Validation Suite
Comprehensive security hardening validation for production deployment
"""

import os
import sys
import json
import subprocess
import yaml
from pathlib import Path
from typing import Dict, List, Any
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class SecurityValidator:
    """Comprehensive security validation for reVoAgent platform"""
    
    def __init__(self):
        self.results = {
            "overall_score": 0,
            "categories": {},
            "vulnerabilities": [],
            "recommendations": []
        }
        
    def validate_all(self) -> Dict[str, Any]:
        """Run all security validations"""
        logger.info("🔒 Starting comprehensive security validation...")
        
        # Run all validation categories
        self.validate_container_security()
        self.validate_kubernetes_security()
        self.validate_network_security()
        self.validate_authentication_security()
        self.validate_data_security()
        self.validate_api_security()
        self.validate_dependency_security()
        
        # Calculate overall score
        self.calculate_overall_score()
        
        return self.results
    
    def validate_container_security(self):
        """Validate Docker container security"""
        logger.info("🐳 Validating container security...")
        
        score = 0
        max_score = 100
        issues = []
        
        # Check Dockerfile security
        dockerfile_path = Path("Dockerfile")
        if dockerfile_path.exists():
            with open(dockerfile_path, 'r') as f:
                dockerfile_content = f.read()
                
            # Check for non-root user
            if "USER" in dockerfile_content and "root" not in dockerfile_content.split("USER")[-1]:
                score += 20
                logger.info("✅ Non-root user configured")
            else:
                issues.append("Container runs as root user")
                
            # Check for health checks
            if "HEALTHCHECK" in dockerfile_content:
                score += 15
                logger.info("✅ Health check configured")
            else:
                issues.append("No health check configured")
                
            # Check for minimal base image
            if any(base in dockerfile_content for base in ["alpine", "slim", "distroless"]):
                score += 15
                logger.info("✅ Minimal base image used")
            else:
                issues.append("Consider using minimal base image")
                
            # Check for secrets in Dockerfile
            if any(secret in dockerfile_content.upper() for secret in ["PASSWORD", "SECRET", "KEY", "TOKEN"]):
                issues.append("Potential secrets in Dockerfile")
            else:
                score += 20
                logger.info("✅ No hardcoded secrets in Dockerfile")
                
            # Check for COPY/ADD security
            if "--chown=" in dockerfile_content:
                score += 10
                logger.info("✅ Proper file ownership configured")
            else:
                issues.append("Consider explicit file ownership")
                
            # Check for multi-stage build
            if dockerfile_content.count("FROM") > 1:
                score += 20
                logger.info("✅ Multi-stage build used")
            else:
                issues.append("Consider multi-stage build for security")
        else:
            issues.append("Dockerfile not found")
            
        self.results["categories"]["container_security"] = {
            "score": score,
            "max_score": max_score,
            "issues": issues
        }
    
    def validate_kubernetes_security(self):
        """Validate Kubernetes security configurations"""
        logger.info("☸️ Validating Kubernetes security...")
        
        score = 0
        max_score = 100
        issues = []
        
        # Check for Kubernetes manifests
        k8s_files = list(Path(".").glob("**/*.yaml")) + list(Path(".").glob("**/*.yml"))
        k8s_manifests = []
        
        for file_path in k8s_files:
            try:
                with open(file_path, 'r') as f:
                    content = yaml.safe_load_all(f)
                    for doc in content:
                        if doc and doc.get("kind") in ["Deployment", "Pod", "Service", "Ingress"]:
                            k8s_manifests.append((file_path, doc))
            except:
                continue
                
        if k8s_manifests:
            for file_path, manifest in k8s_manifests:
                kind = manifest.get("kind")
                
                if kind in ["Deployment", "Pod"]:
                    spec = manifest.get("spec", {})
                    template = spec.get("template", {})
                    pod_spec = template.get("spec", {})
                    containers = pod_spec.get("containers", [])
                    
                    for container in containers:
                        security_context = container.get("securityContext", {})
                        
                        # Check for non-root user
                        if security_context.get("runAsNonRoot"):
                            score += 10
                            logger.info("✅ Container runs as non-root")
                        else:
                            issues.append(f"Container in {file_path} may run as root")
                            
                        # Check for read-only root filesystem
                        if security_context.get("readOnlyRootFilesystem"):
                            score += 10
                            logger.info("✅ Read-only root filesystem")
                        else:
                            issues.append(f"Container in {file_path} has writable root filesystem")
                            
                        # Check for privilege escalation
                        if not security_context.get("allowPrivilegeEscalation", True):
                            score += 10
                            logger.info("✅ Privilege escalation disabled")
                        else:
                            issues.append(f"Container in {file_path} allows privilege escalation")
                            
                        # Check for capabilities
                        if "capabilities" in security_context:
                            score += 10
                            logger.info("✅ Container capabilities configured")
                        else:
                            issues.append(f"Container in {file_path} uses default capabilities")
                            
                        # Check resource limits
                        resources = container.get("resources", {})
                        if "limits" in resources:
                            score += 10
                            logger.info("✅ Resource limits configured")
                        else:
                            issues.append(f"Container in {file_path} has no resource limits")
                            
                # Check for network policies
                if kind == "NetworkPolicy":
                    score += 20
                    logger.info("✅ Network policy found")
                    
            # Check for RBAC
            rbac_files = [f for f in k8s_files if "rbac" in str(f).lower()]
            if rbac_files:
                score += 20
                logger.info("✅ RBAC configuration found")
            else:
                issues.append("No RBAC configuration found")
        else:
            issues.append("No Kubernetes manifests found")
            
        self.results["categories"]["kubernetes_security"] = {
            "score": score,
            "max_score": max_score,
            "issues": issues
        }
    
    def validate_network_security(self):
        """Validate network security configurations"""
        logger.info("🌐 Validating network security...")
        
        score = 0
        max_score = 100
        issues = []
        
        # Check for TLS/SSL configuration
        nginx_configs = list(Path(".").glob("**/*nginx*")) + list(Path(".").glob("**/*ssl*"))
        if nginx_configs:
            score += 30
            logger.info("✅ TLS/SSL configuration found")
        else:
            issues.append("No TLS/SSL configuration found")
            
        # Check for network policies in Kubernetes
        network_policies = []
        for file_path in Path(".").glob("**/*.yaml"):
            try:
                with open(file_path, 'r') as f:
                    content = yaml.safe_load_all(f)
                    for doc in content:
                        if doc and doc.get("kind") == "NetworkPolicy":
                            network_policies.append(doc)
            except:
                continue
                
        if network_policies:
            score += 40
            logger.info("✅ Network policies configured")
        else:
            issues.append("No network policies found")
            
        # Check for ingress security
        ingress_configs = []
        for file_path in Path(".").glob("**/*.yaml"):
            try:
                with open(file_path, 'r') as f:
                    content = yaml.safe_load_all(f)
                    for doc in content:
                        if doc and doc.get("kind") == "Ingress":
                            ingress_configs.append(doc)
            except:
                continue
                
        if ingress_configs:
            for ingress in ingress_configs:
                annotations = ingress.get("metadata", {}).get("annotations", {})
                if any("ssl" in key.lower() or "tls" in key.lower() for key in annotations.keys()):
                    score += 30
                    logger.info("✅ Ingress TLS configured")
                    break
            else:
                issues.append("Ingress found but no TLS configuration")
        
        self.results["categories"]["network_security"] = {
            "score": score,
            "max_score": max_score,
            "issues": issues
        }
    
    def validate_authentication_security(self):
        """Validate authentication and authorization security"""
        logger.info("🔐 Validating authentication security...")
        
        score = 0
        max_score = 100
        issues = []
        
        # Check for JWT configuration
        config_files = list(Path(".").glob("**/*.py")) + list(Path(".").glob("**/*.yaml"))
        jwt_found = False
        
        for file_path in config_files:
            try:
                with open(file_path, 'r') as f:
                    content = f.read()
                    if "JWT" in content.upper() or "jwt" in content:
                        jwt_found = True
                        break
            except:
                continue
                
        if jwt_found:
            score += 30
            logger.info("✅ JWT authentication configured")
        else:
            issues.append("No JWT authentication found")
            
        # Check for RBAC
        rbac_found = False
        for file_path in config_files:
            try:
                with open(file_path, 'r') as f:
                    content = f.read()
                    if "RBAC" in content.upper() or "role" in content.lower():
                        rbac_found = True
                        break
            except:
                continue
                
        if rbac_found:
            score += 30
            logger.info("✅ RBAC configuration found")
        else:
            issues.append("No RBAC configuration found")
            
        # Check for rate limiting
        rate_limit_found = False
        for file_path in config_files:
            try:
                with open(file_path, 'r') as f:
                    content = f.read()
                    if "rate" in content.lower() and "limit" in content.lower():
                        rate_limit_found = True
                        break
            except:
                continue
                
        if rate_limit_found:
            score += 20
            logger.info("✅ Rate limiting configured")
        else:
            issues.append("No rate limiting found")
            
        # Check for session security
        session_security_found = False
        for file_path in config_files:
            try:
                with open(file_path, 'r') as f:
                    content = f.read()
                    if "session" in content.lower() and ("secure" in content.lower() or "httponly" in content.lower()):
                        session_security_found = True
                        break
            except:
                continue
                
        if session_security_found:
            score += 20
            logger.info("✅ Session security configured")
        else:
            issues.append("No session security configuration found")
            
        self.results["categories"]["authentication_security"] = {
            "score": score,
            "max_score": max_score,
            "issues": issues
        }
    
    def validate_data_security(self):
        """Validate data security and encryption"""
        logger.info("🔒 Validating data security...")
        
        score = 0
        max_score = 100
        issues = []
        
        # Check for encryption configuration
        encryption_found = False
        config_files = list(Path(".").glob("**/*.py")) + list(Path(".").glob("**/*.yaml"))
        
        for file_path in config_files:
            try:
                with open(file_path, 'r') as f:
                    content = f.read()
                    if any(term in content.lower() for term in ["encrypt", "bcrypt", "hash", "cipher"]):
                        encryption_found = True
                        break
            except:
                continue
                
        if encryption_found:
            score += 40
            logger.info("✅ Encryption configuration found")
        else:
            issues.append("No encryption configuration found")
            
        # Check for secrets management
        secrets_found = False
        for file_path in Path(".").glob("**/*.yaml"):
            try:
                with open(file_path, 'r') as f:
                    content = yaml.safe_load_all(f)
                    for doc in content:
                        if doc and doc.get("kind") == "Secret":
                            secrets_found = True
                            break
            except:
                continue
                
        if secrets_found:
            score += 30
            logger.info("✅ Kubernetes secrets configured")
        else:
            issues.append("No Kubernetes secrets found")
            
        # Check for database security
        db_security_found = False
        for file_path in config_files:
            try:
                with open(file_path, 'r') as f:
                    content = f.read()
                    if "database" in content.lower() and ("ssl" in content.lower() or "tls" in content.lower()):
                        db_security_found = True
                        break
            except:
                continue
                
        if db_security_found:
            score += 30
            logger.info("✅ Database security configured")
        else:
            issues.append("No database security configuration found")
            
        self.results["categories"]["data_security"] = {
            "score": score,
            "max_score": max_score,
            "issues": issues
        }
    
    def validate_api_security(self):
        """Validate API security configurations"""
        logger.info("🔌 Validating API security...")
        
        score = 0
        max_score = 100
        issues = []
        
        # Check for CORS configuration
        cors_found = False
        api_files = list(Path(".").glob("**/*api*.py")) + list(Path(".").glob("**/*server*.py"))
        
        for file_path in api_files:
            try:
                with open(file_path, 'r') as f:
                    content = f.read()
                    if "CORS" in content or "cors" in content:
                        cors_found = True
                        break
            except:
                continue
                
        if cors_found:
            score += 20
            logger.info("✅ CORS configuration found")
        else:
            issues.append("No CORS configuration found")
            
        # Check for input validation
        validation_found = False
        for file_path in api_files:
            try:
                with open(file_path, 'r') as f:
                    content = f.read()
                    if any(term in content for term in ["pydantic", "validate", "schema"]):
                        validation_found = True
                        break
            except:
                continue
                
        if validation_found:
            score += 30
            logger.info("✅ Input validation configured")
        else:
            issues.append("No input validation found")
            
        # Check for API versioning
        versioning_found = False
        for file_path in api_files:
            try:
                with open(file_path, 'r') as f:
                    content = f.read()
                    if "/v1" in content or "/api/v" in content:
                        versioning_found = True
                        break
            except:
                continue
                
        if versioning_found:
            score += 20
            logger.info("✅ API versioning found")
        else:
            issues.append("No API versioning found")
            
        # Check for OpenAPI/Swagger documentation
        openapi_found = False
        for file_path in api_files:
            try:
                with open(file_path, 'r') as f:
                    content = f.read()
                    if "openapi" in content.lower() or "swagger" in content.lower():
                        openapi_found = True
                        break
            except:
                continue
                
        if openapi_found:
            score += 30
            logger.info("✅ OpenAPI documentation found")
        else:
            issues.append("No OpenAPI documentation found")
            
        self.results["categories"]["api_security"] = {
            "score": score,
            "max_score": max_score,
            "issues": issues
        }
    
    def validate_dependency_security(self):
        """Validate dependency security"""
        logger.info("📦 Validating dependency security...")
        
        score = 0
        max_score = 100
        issues = []
        
        # Check for requirements files
        req_files = ["requirements.txt", "pyproject.toml", "Pipfile"]
        found_req_files = [f for f in req_files if Path(f).exists()]
        
        if found_req_files:
            score += 30
            logger.info(f"✅ Requirements files found: {found_req_files}")
            
            # Check for pinned versions
            pinned_versions = False
            for req_file in found_req_files:
                try:
                    with open(req_file, 'r') as f:
                        content = f.read()
                        if "==" in content or "~=" in content:
                            pinned_versions = True
                            break
                except:
                    continue
                    
            if pinned_versions:
                score += 30
                logger.info("✅ Pinned dependency versions found")
            else:
                issues.append("Dependencies not pinned to specific versions")
        else:
            issues.append("No requirements files found")
            
        # Check for security scanning tools
        security_tools = [".github/workflows", "security", "bandit", "safety"]
        security_config_found = False
        
        for tool in security_tools:
            if Path(tool).exists() or any(tool in str(p) for p in Path(".").rglob("*")):
                security_config_found = True
                break
                
        if security_config_found:
            score += 40
            logger.info("✅ Security scanning tools configured")
        else:
            issues.append("No security scanning tools found")
            
        self.results["categories"]["dependency_security"] = {
            "score": score,
            "max_score": max_score,
            "issues": issues
        }
    
    def calculate_overall_score(self):
        """Calculate overall security score"""
        total_score = 0
        total_max_score = 0
        
        for category, data in self.results["categories"].items():
            total_score += data["score"]
            total_max_score += data["max_score"]
            
        if total_max_score > 0:
            self.results["overall_score"] = round((total_score / total_max_score) * 100, 2)
        else:
            self.results["overall_score"] = 0
            
        # Generate recommendations
        self.generate_recommendations()
    
    def generate_recommendations(self):
        """Generate security recommendations"""
        recommendations = []
        
        for category, data in self.results["categories"].items():
            if data["score"] < data["max_score"] * 0.8:  # Less than 80%
                recommendations.append(f"Improve {category.replace('_', ' ')}: {', '.join(data['issues'][:3])}")
                
        self.results["recommendations"] = recommendations
    
    def generate_report(self) -> str:
        """Generate security validation report"""
        report = f"""
🔒 reVoAgent Security Validation Report
=====================================

Overall Security Score: {self.results['overall_score']}/100

Category Breakdown:
"""
        
        for category, data in self.results["categories"].items():
            percentage = round((data["score"] / data["max_score"]) * 100, 1)
            status = "✅ GOOD" if percentage >= 80 else "⚠️ NEEDS IMPROVEMENT" if percentage >= 60 else "❌ CRITICAL"
            
            report += f"""
{category.replace('_', ' ').title()}: {data['score']}/{data['max_score']} ({percentage}%) {status}
Issues: {len(data['issues'])}
"""
            
            if data["issues"]:
                for issue in data["issues"][:3]:  # Show top 3 issues
                    report += f"  - {issue}\n"
                    
        if self.results["recommendations"]:
            report += f"""
🎯 Top Recommendations:
"""
            for i, rec in enumerate(self.results["recommendations"][:5], 1):
                report += f"{i}. {rec}\n"
                
        return report

def main():
    """Main security validation function"""
    print("🔒 reVoAgent Security Validation Suite")
    print("=" * 50)
    
    validator = SecurityValidator()
    results = validator.validate_all()
    
    # Generate and display report
    report = validator.generate_report()
    print(report)
    
    # Save results to file
    with open("security_validation_results.json", "w") as f:
        json.dump(results, f, indent=2)
        
    print(f"\n📊 Detailed results saved to: security_validation_results.json")
    
    # Return exit code based on score
    if results["overall_score"] >= 80:
        print("🎉 Security validation PASSED!")
        return 0
    elif results["overall_score"] >= 60:
        print("⚠️ Security validation PASSED with warnings")
        return 0
    else:
        print("❌ Security validation FAILED - Critical issues found")
        return 1

if __name__ == "__main__":
    sys.exit(main())