"""
Compliance Validation Suite
SOC2, GDPR, and other compliance checks for reVoAgent platform
"""

import json
import logging
import os
import re
import time
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, asdict
import hashlib
import subprocess
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class ComplianceResult:
    control_id: str
    control_name: str
    framework: str  # SOC2, GDPR, ISO27001, etc.
    category: str
    status: str     # COMPLIANT, NON_COMPLIANT, PARTIAL, NOT_APPLICABLE
    severity: str   # LOW, MEDIUM, HIGH, CRITICAL
    description: str
    evidence: str
    remediation: str
    timestamp: str

class ComplianceValidator:
    def __init__(self, project_root: str = "/workspace/reVoAgent"):
        self.project_root = Path(project_root)
        self.results: List[ComplianceResult] = []
        
    def add_result(self, control_id: str, control_name: str, framework: str,
                   category: str, status: str, severity: str, description: str,
                   evidence: str = "", remediation: str = ""):
        """Add a compliance validation result"""
        result = ComplianceResult(
            control_id=control_id,
            control_name=control_name,
            framework=framework,
            category=category,
            status=status,
            severity=severity,
            description=description,
            evidence=evidence,
            remediation=remediation,
            timestamp=datetime.now().isoformat()
        )
        self.results.append(result)
    
    def validate_soc2_controls(self) -> None:
        """Validate SOC2 Type II controls"""
        logger.info("🏛️ Validating SOC2 controls...")
        
        # CC1.1 - Entity demonstrates commitment to integrity and ethical values
        self.validate_code_of_conduct()
        
        # CC2.1 - Management establishes structures, reporting lines, authorities and responsibilities
        self.validate_organizational_structure()
        
        # CC3.1 - Entity specifies objectives with sufficient clarity
        self.validate_security_objectives()
        
        # CC7.1 - Entity uses relevant information to support the functioning of internal control
        self.validate_monitoring_controls()
        
        # CC8.1 - Entity evaluates and communicates internal control deficiencies
        self.validate_incident_response()
        
        # A1.1 - Entity authorizes, modifies, or removes access
        self.validate_access_controls()
        
        # A1.2 - Entity creates and maintains an inventory of system components
        self.validate_asset_inventory()
    
    def validate_gdpr_compliance(self) -> None:
        """Validate GDPR compliance requirements"""
        logger.info("🇪🇺 Validating GDPR compliance...")
        
        # Article 5 - Principles of processing
        self.validate_data_processing_principles()
        
        # Article 32 - Security of processing
        self.validate_data_security()
    
    def validate_code_of_conduct(self) -> None:
        """SOC2 CC1.1 - Code of conduct and ethics"""
        code_files = [
            "CODE_OF_CONDUCT.md",
            "ETHICS.md",
            "docs/CODE_OF_CONDUCT.md"
        ]
        
        found_code = False
        for file_path in code_files:
            full_path = self.project_root / file_path
            if full_path.exists():
                found_code = True
                break
        
        if found_code:
            self.add_result(
                control_id="CC1.1",
                control_name="Code of Conduct",
                framework="SOC2",
                category="Control Environment",
                status="COMPLIANT",
                severity="LOW",
                description="Code of conduct documented",
                evidence=f"Found code of conduct at {file_path}",
                remediation=""
            )
        else:
            self.add_result(
                control_id="CC1.1",
                control_name="Code of Conduct",
                framework="SOC2",
                category="Control Environment",
                status="NON_COMPLIANT",
                severity="MEDIUM",
                description="No code of conduct found",
                evidence="Searched for CODE_OF_CONDUCT.md and related files",
                remediation="Create and document code of conduct and ethical guidelines"
            )
    
    def validate_access_controls(self) -> None:
        """SOC2 A1.1 - Access control implementation"""
        # Check for authentication implementation
        auth_files = list(self.project_root.rglob("*auth*"))
        security_files = list(self.project_root.rglob("*security*"))
        
        if auth_files or security_files:
            # Check for specific security features
            security_features = []
            
            # Check for JWT implementation
            if any("jwt" in str(f).lower() for f in auth_files + security_files):
                security_features.append("JWT authentication")
            
            # Check for RBAC
            if any("rbac" in str(f).lower() or "role" in str(f).lower() for f in auth_files + security_files):
                security_features.append("Role-based access control")
            
            # Check for password policies
            if any("password" in str(f).lower() for f in auth_files + security_files):
                security_features.append("Password policies")
            
            if security_features:
                self.add_result(
                    control_id="A1.1",
                    control_name="Access Controls",
                    framework="SOC2",
                    category="Access",
                    status="COMPLIANT",
                    severity="LOW",
                    description="Access controls implemented",
                    evidence=f"Security features found: {', '.join(security_features)}",
                    remediation=""
                )
            else:
                self.add_result(
                    control_id="A1.1",
                    control_name="Access Controls",
                    framework="SOC2",
                    category="Access",
                    status="PARTIAL",
                    severity="MEDIUM",
                    description="Basic access controls present but incomplete",
                    evidence="Authentication files found but missing advanced features",
                    remediation="Implement comprehensive access controls including RBAC and MFA"
                )
        else:
            self.add_result(
                control_id="A1.1",
                control_name="Access Controls",
                framework="SOC2",
                category="Access",
                status="NON_COMPLIANT",
                severity="HIGH",
                description="No access controls found",
                evidence="No authentication or security files detected",
                remediation="Implement comprehensive access control system"
            )
    
    def validate_data_processing_principles(self) -> None:
        """GDPR Article 5 - Data processing principles"""
        privacy_files = [
            "PRIVACY_POLICY.md",
            "docs/PRIVACY.md",
            "privacy.md",
            "data_processing.md"
        ]
        
        found_privacy = False
        for file_path in privacy_files:
            full_path = self.project_root / file_path
            if full_path.exists():
                found_privacy = True
                # Check content for GDPR principles
                content = full_path.read_text().lower()
                principles = {
                    "lawfulness": "lawful" in content,
                    "fairness": "fair" in content,
                    "transparency": "transparent" in content,
                    "purpose_limitation": "purpose" in content,
                    "data_minimisation": "minimal" in content or "necessary" in content,
                    "accuracy": "accurate" in content,
                    "storage_limitation": "retention" in content or "storage" in content,
                    "integrity": "security" in content or "integrity" in content
                }
                
                compliant_principles = sum(principles.values())
                if compliant_principles >= 6:
                    status = "COMPLIANT"
                    severity = "LOW"
                elif compliant_principles >= 4:
                    status = "PARTIAL"
                    severity = "MEDIUM"
                else:
                    status = "NON_COMPLIANT"
                    severity = "HIGH"
                
                self.add_result(
                    control_id="GDPR-5",
                    control_name="Data Processing Principles",
                    framework="GDPR",
                    category="Data Protection",
                    status=status,
                    severity=severity,
                    description=f"Privacy policy addresses {compliant_principles}/8 GDPR principles",
                    evidence=f"Found privacy policy at {file_path}",
                    remediation="Ensure privacy policy addresses all GDPR principles" if status != "COMPLIANT" else ""
                )
                break
        
        if not found_privacy:
            self.add_result(
                control_id="GDPR-5",
                control_name="Data Processing Principles",
                framework="GDPR",
                category="Data Protection",
                status="NON_COMPLIANT",
                severity="CRITICAL",
                description="No privacy policy found",
                evidence="Searched for privacy policy documents",
                remediation="Create comprehensive privacy policy addressing all GDPR principles"
            )
    
    def validate_data_security(self) -> None:
        """GDPR Article 32 - Security of processing"""
        security_measures = {
            "encryption": False,
            "access_controls": False,
            "logging": False,
            "monitoring": False,
            "backup": False,
            "incident_response": False
        }
        
        # Check for encryption
        encryption_files = list(self.project_root.rglob("*encrypt*")) + list(self.project_root.rglob("*crypto*"))
        if encryption_files:
            security_measures["encryption"] = True
        
        # Check for access controls
        auth_files = list(self.project_root.rglob("*auth*")) + list(self.project_root.rglob("*security*"))
        if auth_files:
            security_measures["access_controls"] = True
        
        # Check for logging
        log_files = list(self.project_root.rglob("*log*")) + list(self.project_root.rglob("*audit*"))
        if log_files:
            security_measures["logging"] = True
        
        # Check for monitoring
        monitor_files = list(self.project_root.rglob("*monitor*")) + list(self.project_root.rglob("*alert*"))
        if monitor_files:
            security_measures["monitoring"] = True
        
        # Check for backup
        backup_files = list(self.project_root.rglob("*backup*")) + list(self.project_root.rglob("*recovery*"))
        if backup_files:
            security_measures["backup"] = True
        
        # Check for incident response
        incident_files = list(self.project_root.rglob("*incident*")) + list(self.project_root.rglob("*response*"))
        if incident_files:
            security_measures["incident_response"] = True
        
        implemented_measures = sum(security_measures.values())
        total_measures = len(security_measures)
        
        if implemented_measures >= 5:
            status = "COMPLIANT"
            severity = "LOW"
        elif implemented_measures >= 3:
            status = "PARTIAL"
            severity = "MEDIUM"
        else:
            status = "NON_COMPLIANT"
            severity = "HIGH"
        
        self.add_result(
            control_id="GDPR-32",
            control_name="Security of Processing",
            framework="GDPR",
            category="Data Security",
            status=status,
            severity=severity,
            description=f"Implemented {implemented_measures}/{total_measures} security measures",
            evidence=f"Security measures: {[k for k, v in security_measures.items() if v]}",
            remediation="Implement missing security measures" if status != "COMPLIANT" else ""
        )
    
    def validate_organizational_structure(self) -> None:
        """SOC2 CC2.1 - Organizational structure"""
        org_files = [
            "ORGANIZATION.md",
            "docs/ORGANIZATION.md",
            "TEAM.md",
            "docs/TEAM.md",
            "GOVERNANCE.md"
        ]
        
        found_org = any((self.project_root / f).exists() for f in org_files)
        
        if found_org:
            self.add_result(
                control_id="CC2.1",
                control_name="Organizational Structure",
                framework="SOC2",
                category="Control Environment",
                status="COMPLIANT",
                severity="LOW",
                description="Organizational structure documented",
                evidence="Found organizational documentation",
                remediation=""
            )
        else:
            self.add_result(
                control_id="CC2.1",
                control_name="Organizational Structure",
                framework="SOC2",
                category="Control Environment",
                status="NON_COMPLIANT",
                severity="MEDIUM",
                description="No organizational structure documentation",
                evidence="No organizational files found",
                remediation="Document organizational structure and responsibilities"
            )
    
    def validate_security_objectives(self) -> None:
        """SOC2 CC3.1 - Security objectives"""
        security_docs = [
            "SECURITY.md",
            "docs/SECURITY.md",
            "security/README.md",
            "SECURITY_POLICY.md"
        ]
        
        found_security = any((self.project_root / f).exists() for f in security_docs)
        
        if found_security:
            self.add_result(
                control_id="CC3.1",
                control_name="Security Objectives",
                framework="SOC2",
                category="Control Environment",
                status="COMPLIANT",
                severity="LOW",
                description="Security objectives documented",
                evidence="Found security documentation",
                remediation=""
            )
        else:
            self.add_result(
                control_id="CC3.1",
                control_name="Security Objectives",
                framework="SOC2",
                category="Control Environment",
                status="NON_COMPLIANT",
                severity="MEDIUM",
                description="No security objectives documentation",
                evidence="No security policy files found",
                remediation="Document security objectives and policies"
            )
    
    def validate_monitoring_controls(self) -> None:
        """SOC2 CC7.1 - Monitoring controls"""
        monitoring_dirs = ["monitoring", "logs", "metrics"]
        monitoring_files = []
        
        for dir_name in monitoring_dirs:
            dir_path = self.project_root / dir_name
            if dir_path.exists() and dir_path.is_dir():
                monitoring_files.extend(list(dir_path.rglob("*")))
        
        if monitoring_files:
            self.add_result(
                control_id="CC7.1",
                control_name="Monitoring Controls",
                framework="SOC2",
                category="Monitoring Activities",
                status="COMPLIANT",
                severity="LOW",
                description="Monitoring controls implemented",
                evidence=f"Found {len(monitoring_files)} monitoring files",
                remediation=""
            )
        else:
            self.add_result(
                control_id="CC7.1",
                control_name="Monitoring Controls",
                framework="SOC2",
                category="Monitoring Activities",
                status="NON_COMPLIANT",
                severity="HIGH",
                description="No monitoring controls found",
                evidence="No monitoring directories or files detected",
                remediation="Implement comprehensive monitoring and logging"
            )
    
    def validate_incident_response(self) -> None:
        """SOC2 CC8.1 - Incident response"""
        incident_files = [
            "INCIDENT_RESPONSE.md",
            "docs/INCIDENT_RESPONSE.md",
            "security/incident_response.md",
            "SECURITY_INCIDENT.md"
        ]
        
        found_incident = any((self.project_root / f).exists() for f in incident_files)
        
        if found_incident:
            self.add_result(
                control_id="CC8.1",
                control_name="Incident Response",
                framework="SOC2",
                category="Control Activities",
                status="COMPLIANT",
                severity="LOW",
                description="Incident response procedures documented",
                evidence="Found incident response documentation",
                remediation=""
            )
        else:
            self.add_result(
                control_id="CC8.1",
                control_name="Incident Response",
                framework="SOC2",
                category="Control Activities",
                status="NON_COMPLIANT",
                severity="HIGH",
                description="No incident response procedures",
                evidence="No incident response documentation found",
                remediation="Create incident response procedures and documentation"
            )
    
    def validate_asset_inventory(self) -> None:
        """SOC2 A1.2 - Asset inventory"""
        # Check for asset inventory files
        inventory_files = [
            "ASSETS.md",
            "docs/ASSETS.md",
            "inventory.json",
            "assets.json"
        ]
        
        found_inventory = any((self.project_root / f).exists() for f in inventory_files)
        
        # Also check for dependency files which serve as software inventory
        dependency_files = [
            "requirements.txt",
            "package.json",
            "pyproject.toml",
            "Pipfile"
        ]
        
        found_dependencies = any((self.project_root / f).exists() for f in dependency_files)
        
        if found_inventory and found_dependencies:
            status = "COMPLIANT"
            severity = "LOW"
            description = "Asset inventory maintained"
        elif found_dependencies:
            status = "PARTIAL"
            severity = "MEDIUM"
            description = "Software dependencies tracked but no comprehensive asset inventory"
        else:
            status = "NON_COMPLIANT"
            severity = "MEDIUM"
            description = "No asset inventory found"
        
        self.add_result(
            control_id="A1.2",
            control_name="Asset Inventory",
            framework="SOC2",
            category="Access",
            status=status,
            severity=severity,
            description=description,
            evidence=f"Dependencies: {found_dependencies}, Inventory: {found_inventory}",
            remediation="Maintain comprehensive asset inventory" if status != "COMPLIANT" else ""
        )
    
    def run_all_validations(self) -> Dict[str, Any]:
        """Run all compliance validations"""
        logger.info("🚀 Starting Compliance Validation Suite...")
        
        start_time = time.time()
        
        # Run all validations
        self.validate_soc2_controls()
        self.validate_gdpr_compliance()
        
        # Calculate metrics
        total_duration = time.time() - start_time
        total_controls = len(self.results)
        
        compliant = len([r for r in self.results if r.status == "COMPLIANT"])
        non_compliant = len([r for r in self.results if r.status == "NON_COMPLIANT"])
        partial = len([r for r in self.results if r.status == "PARTIAL"])
        not_applicable = len([r for r in self.results if r.status == "NOT_APPLICABLE"])
        
        critical_issues = len([r for r in self.results if r.severity == "CRITICAL" and r.status == "NON_COMPLIANT"])
        high_issues = len([r for r in self.results if r.severity == "HIGH" and r.status == "NON_COMPLIANT"])
        
        # Calculate compliance score
        compliance_score = (compliant + (partial * 0.5)) / total_controls * 100
        
        # Generate summary
        summary = {
            "validation_suite": "Compliance Validation",
            "timestamp": datetime.now().isoformat(),
            "duration": total_duration,
            "total_controls": total_controls,
            "compliant": compliant,
            "non_compliant": non_compliant,
            "partial": partial,
            "not_applicable": not_applicable,
            "compliance_score": compliance_score,
            "critical_issues": critical_issues,
            "high_issues": high_issues,
            "overall_status": "COMPLIANT" if critical_issues == 0 and high_issues == 0 else "NON_COMPLIANT",
            "results": [asdict(result) for result in self.results]
        }
        
        # Save results
        with open("compliance_validation_results.json", "w") as f:
            json.dump(summary, f, indent=2)
        
        # Print summary
        print("\n" + "="*80)
        print("🏛️ COMPLIANCE VALIDATION SUMMARY")
        print("="*80)
        print(f"⏱️  Duration: {total_duration:.2f} seconds")
        print(f"📋 Total Controls: {total_controls}")
        print(f"✅ Compliant: {compliant}")
        print(f"❌ Non-Compliant: {non_compliant}")
        print(f"⚠️  Partial: {partial}")
        print(f"➖ Not Applicable: {not_applicable}")
        print(f"📊 Compliance Score: {compliance_score:.1f}%")
        print(f"🚨 Critical Issues: {critical_issues}")
        print(f"🔴 High Issues: {high_issues}")
        print(f"🎉 Overall Status: {summary['overall_status']}")
        print("="*80)
        
        # Print detailed results by framework
        frameworks = set(r.framework for r in self.results)
        for framework in frameworks:
            framework_results = [r for r in self.results if r.framework == framework]
            framework_compliant = len([r for r in framework_results if r.status == "COMPLIANT"])
            framework_total = len(framework_results)
            framework_score = framework_compliant / framework_total * 100
            
            print(f"\n📋 {framework} Compliance: {framework_score:.1f}% ({framework_compliant}/{framework_total})")
            
            for result in framework_results:
                status_icon = {"COMPLIANT": "✅", "NON_COMPLIANT": "❌", "PARTIAL": "⚠️", "NOT_APPLICABLE": "➖"}[result.status]
                severity_icon = {"CRITICAL": "🚨", "HIGH": "🔴", "MEDIUM": "🟡", "LOW": "🟢"}[result.severity]
                
                print(f"  {status_icon} {severity_icon} {result.control_id}: {result.control_name}")
                if result.status != "COMPLIANT" and result.remediation:
                    print(f"    Remediation: {result.remediation}")
        
        return summary

def main():
    """Main function to run compliance validation"""
    validator = ComplianceValidator()
    
    try:
        results = validator.run_all_validations()
        
        # Exit with appropriate code
        if results["overall_status"] == "COMPLIANT":
            print("🎉 All critical compliance requirements met!")
            exit(0)
        else:
            print("❌ Critical compliance issues found!")
            exit(1)
            
    except Exception as e:
        logger.error(f"Compliance validation failed: {e}")
        exit(1)

if __name__ == "__main__":
    main()