"""
Security Report Generator
Generates comprehensive security reports from various security scan results
"""

import json
import os
import sys
from datetime import datetime
from typing import Dict, List, Any
from pathlib import Path

def load_scan_results() -> Dict[str, Any]:
    """Load all available security scan results"""
    results = {
        "bandit": None,
        "safety": None,
        "pip_audit": None,
        "trivy": None,
        "penetration_test": None,
        "compliance": None
    }
    
    # Load Bandit results
    if os.path.exists("bandit-report.json"):
        try:
            with open("bandit-report.json", "r") as f:
                results["bandit"] = json.load(f)
        except Exception as e:
            print(f"Warning: Could not load Bandit results: {e}")
    
    # Load Safety results
    if os.path.exists("safety-report.json"):
        try:
            with open("safety-report.json", "r") as f:
                results["safety"] = json.load(f)
        except Exception as e:
            print(f"Warning: Could not load Safety results: {e}")
    
    # Load pip-audit results
    if os.path.exists("pip-audit-report.json"):
        try:
            with open("pip-audit-report.json", "r") as f:
                results["pip_audit"] = json.load(f)
        except Exception as e:
            print(f"Warning: Could not load pip-audit results: {e}")
    
    # Load Trivy results
    if os.path.exists("trivy-container-results.sarif"):
        try:
            with open("trivy-container-results.sarif", "r") as f:
                results["trivy"] = json.load(f)
        except Exception as e:
            print(f"Warning: Could not load Trivy results: {e}")
    
    # Load penetration test results
    if os.path.exists("penetration_test_results.json"):
        try:
            with open("penetration_test_results.json", "r") as f:
                results["penetration_test"] = json.load(f)
        except Exception as e:
            print(f"Warning: Could not load penetration test results: {e}")
    
    # Load compliance results
    if os.path.exists("compliance_validation_results.json"):
        try:
            with open("compliance_validation_results.json", "r") as f:
                results["compliance"] = json.load(f)
        except Exception as e:
            print(f"Warning: Could not load compliance results: {e}")
    
    return results

def analyze_bandit_results(bandit_data: Dict[str, Any]) -> Dict[str, Any]:
    """Analyze Bandit SAST results"""
    if not bandit_data:
        return {"status": "not_run", "issues": 0}
    
    issues = bandit_data.get("results", [])
    
    severity_counts = {
        "HIGH": len([i for i in issues if i.get("issue_severity") == "HIGH"]),
        "MEDIUM": len([i for i in issues if i.get("issue_severity") == "MEDIUM"]),
        "LOW": len([i for i in issues if i.get("issue_severity") == "LOW"])
    }
    
    return {
        "status": "completed",
        "total_issues": len(issues),
        "severity_counts": severity_counts,
        "files_scanned": len(bandit_data.get("metrics", {}).get("_totals", {}).get("loc", 0))
    }

def analyze_dependency_results(safety_data: Dict[str, Any], pip_audit_data: Dict[str, Any]) -> Dict[str, Any]:
    """Analyze dependency vulnerability results"""
    vulnerabilities = []
    
    # Process Safety results
    if safety_data:
        safety_vulns = safety_data.get("vulnerabilities", [])
        for vuln in safety_vulns:
            vulnerabilities.append({
                "source": "safety",
                "package": vuln.get("package_name"),
                "vulnerability_id": vuln.get("vulnerability_id"),
                "severity": vuln.get("severity", "UNKNOWN")
            })
    
    # Process pip-audit results
    if pip_audit_data:
        pip_vulns = pip_audit_data.get("vulnerabilities", [])
        for vuln in pip_vulns:
            vulnerabilities.append({
                "source": "pip-audit",
                "package": vuln.get("package"),
                "vulnerability_id": vuln.get("id"),
                "severity": vuln.get("severity", "UNKNOWN")
            })
    
    severity_counts = {
        "CRITICAL": len([v for v in vulnerabilities if v["severity"] == "CRITICAL"]),
        "HIGH": len([v for v in vulnerabilities if v["severity"] == "HIGH"]),
        "MEDIUM": len([v for v in vulnerabilities if v["severity"] == "MEDIUM"]),
        "LOW": len([v for v in vulnerabilities if v["severity"] == "LOW"])
    }
    
    return {
        "total_vulnerabilities": len(vulnerabilities),
        "severity_counts": severity_counts,
        "unique_packages": len(set(v["package"] for v in vulnerabilities if v["package"]))
    }

def analyze_penetration_results(pen_test_data: Dict[str, Any]) -> Dict[str, Any]:
    """Analyze penetration test results"""
    if not pen_test_data:
        return {"status": "not_run"}
    
    results = pen_test_data.get("results", [])
    
    severity_counts = {
        "CRITICAL": len([r for r in results if r.get("severity") == "CRITICAL" and r.get("status") == "FAIL"]),
        "HIGH": len([r for r in results if r.get("severity") == "HIGH" and r.get("status") == "FAIL"]),
        "MEDIUM": len([r for r in results if r.get("severity") == "MEDIUM" and r.get("status") == "FAIL"]),
        "LOW": len([r for r in results if r.get("severity") == "LOW" and r.get("status") == "FAIL"])
    }
    
    return {
        "status": "completed",
        "security_score": pen_test_data.get("security_score", 0),
        "total_tests": pen_test_data.get("total_tests", 0),
        "passed_tests": pen_test_data.get("passed_tests", 0),
        "failed_tests": pen_test_data.get("failed_tests", 0),
        "severity_counts": severity_counts
    }

def analyze_compliance_results(compliance_data: Dict[str, Any]) -> Dict[str, Any]:
    """Analyze compliance validation results"""
    if not compliance_data:
        return {"status": "not_run"}
    
    return {
        "status": "completed",
        "compliance_score": compliance_data.get("compliance_score", 0),
        "total_controls": compliance_data.get("total_controls", 0),
        "compliant": compliance_data.get("compliant", 0),
        "non_compliant": compliance_data.get("non_compliant", 0),
        "critical_issues": compliance_data.get("critical_issues", 0),
        "high_issues": compliance_data.get("high_issues", 0)
    }

def calculate_overall_security_score(analysis: Dict[str, Any]) -> int:
    """Calculate overall security score"""
    score = 100
    
    # Deduct points for SAST issues
    bandit = analysis.get("sast", {})
    if bandit.get("status") == "completed":
        severity_counts = bandit.get("severity_counts", {})
        score -= severity_counts.get("HIGH", 0) * 10
        score -= severity_counts.get("MEDIUM", 0) * 5
        score -= severity_counts.get("LOW", 0) * 1
    
    # Deduct points for dependency vulnerabilities
    deps = analysis.get("dependencies", {})
    severity_counts = deps.get("severity_counts", {})
    score -= severity_counts.get("CRITICAL", 0) * 25
    score -= severity_counts.get("HIGH", 0) * 15
    score -= severity_counts.get("MEDIUM", 0) * 5
    score -= severity_counts.get("LOW", 0) * 1
    
    # Deduct points for penetration test failures
    pen_test = analysis.get("penetration_test", {})
    if pen_test.get("status") == "completed":
        severity_counts = pen_test.get("severity_counts", {})
        score -= severity_counts.get("CRITICAL", 0) * 30
        score -= severity_counts.get("HIGH", 0) * 20
        score -= severity_counts.get("MEDIUM", 0) * 10
        score -= severity_counts.get("LOW", 0) * 2
    
    # Factor in compliance score
    compliance = analysis.get("compliance", {})
    if compliance.get("status") == "completed":
        compliance_score = compliance.get("compliance_score", 100)
        score = (score + compliance_score) / 2
    
    return max(0, min(100, int(score)))

def generate_html_report(analysis: Dict[str, Any], overall_score: int) -> str:
    """Generate HTML security report"""
    
    # Determine risk level and color
    if overall_score >= 90:
        risk_level = "LOW"
        risk_color = "#28a745"
    elif overall_score >= 70:
        risk_level = "MEDIUM"
        risk_color = "#ffc107"
    elif overall_score >= 50:
        risk_level = "HIGH"
        risk_color = "#fd7e14"
    else:
        risk_level = "CRITICAL"
        risk_color = "#dc3545"
    
    html = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>reVoAgent Security Report</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f8f9fa;
        }}
        .container {{
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }}
        .header {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }}
        .header h1 {{
            margin: 0;
            font-size: 2.5em;
        }}
        .header p {{
            margin: 10px 0 0 0;
            opacity: 0.9;
        }}
        .score-section {{
            padding: 30px;
            text-align: center;
            border-bottom: 1px solid #eee;
        }}
        .score-circle {{
            width: 150px;
            height: 150px;
            border-radius: 50%;
            background: conic-gradient(
                {risk_color} 0deg,
                {risk_color} {overall_score * 3.6}deg,
                #e9ecef {overall_score * 3.6}deg,
                #e9ecef 360deg
            );
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            position: relative;
        }}
        .score-circle::before {{
            content: '';
            width: 120px;
            height: 120px;
            border-radius: 50%;
            background: white;
            position: absolute;
        }}
        .score-text {{
            position: relative;
            z-index: 1;
            font-size: 2em;
            font-weight: bold;
            color: {risk_color};
        }}
        .risk-level {{
            font-size: 1.5em;
            font-weight: bold;
            color: {risk_color};
            margin-bottom: 10px;
        }}
        .content {{
            padding: 30px;
        }}
        .section {{
            margin-bottom: 40px;
        }}
        .section h2 {{
            color: #333;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }}
        .grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }}
        .card {{
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            border-left: 4px solid #667eea;
        }}
        .card h3 {{
            margin-top: 0;
            color: #333;
        }}
        .status-badge {{
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8em;
            font-weight: bold;
            text-transform: uppercase;
        }}
        .status-completed {{
            background: #d4edda;
            color: #155724;
        }}
        .status-not-run {{
            background: #f8d7da;
            color: #721c24;
        }}
        .severity-high {{
            color: #dc3545;
            font-weight: bold;
        }}
        .severity-medium {{
            color: #fd7e14;
            font-weight: bold;
        }}
        .severity-low {{
            color: #28a745;
            font-weight: bold;
        }}
        .recommendations {{
            background: #e7f3ff;
            border-left: 4px solid #007bff;
            padding: 20px;
            border-radius: 0 8px 8px 0;
        }}
        .footer {{
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
            border-top: 1px solid #eee;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }}
        th, td {{
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }}
        th {{
            background-color: #f8f9fa;
            font-weight: bold;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛡️ reVoAgent Security Report</h1>
            <p>Comprehensive Security Assessment</p>
            <p>Generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}</p>
        </div>
        
        <div class="score-section">
            <div class="score-circle">
                <div class="score-text">{overall_score}</div>
            </div>
            <div class="risk-level">Risk Level: {risk_level}</div>
            <p>Overall Security Score</p>
        </div>
        
        <div class="content">
            <div class="section">
                <h2>📊 Executive Summary</h2>
                <div class="grid">
                    <div class="card">
                        <h3>🔍 Static Analysis (SAST)</h3>
                        <span class="status-badge status-{analysis.get('sast', {}).get('status', 'not_run').replace('_', '-')}">
                            {analysis.get('sast', {}).get('status', 'Not Run').replace('_', ' ').title()}
                        </span>
                        <p><strong>Issues Found:</strong> {analysis.get('sast', {}).get('total_issues', 'N/A')}</p>
                        <p><strong>Files Scanned:</strong> {analysis.get('sast', {}).get('files_scanned', 'N/A')}</p>
                    </div>
                    
                    <div class="card">
                        <h3>📦 Dependency Vulnerabilities</h3>
                        <p><strong>Total Vulnerabilities:</strong> {analysis.get('dependencies', {}).get('total_vulnerabilities', 0)}</p>
                        <p><strong>Affected Packages:</strong> {analysis.get('dependencies', {}).get('unique_packages', 0)}</p>
                        <p><strong>Critical:</strong> <span class="severity-high">{analysis.get('dependencies', {}).get('severity_counts', {}).get('CRITICAL', 0)}</span></p>
                    </div>
                    
                    <div class="card">
                        <h3>🔐 Penetration Testing</h3>
                        <span class="status-badge status-{analysis.get('penetration_test', {}).get('status', 'not_run').replace('_', '-')}">
                            {analysis.get('penetration_test', {}).get('status', 'Not Run').replace('_', ' ').title()}
                        </span>
                        <p><strong>Security Score:</strong> {analysis.get('penetration_test', {}).get('security_score', 'N/A')}/100</p>
                        <p><strong>Tests Passed:</strong> {analysis.get('penetration_test', {}).get('passed_tests', 'N/A')}/{analysis.get('penetration_test', {}).get('total_tests', 'N/A')}</p>
                    </div>
                    
                    <div class="card">
                        <h3>📋 Compliance</h3>
                        <span class="status-badge status-{analysis.get('compliance', {}).get('status', 'not_run').replace('_', '-')}">
                            {analysis.get('compliance', {}).get('status', 'Not Run').replace('_', ' ').title()}
                        </span>
                        <p><strong>Compliance Score:</strong> {analysis.get('compliance', {}).get('compliance_score', 'N/A'):.1f}%</p>
                        <p><strong>Controls Compliant:</strong> {analysis.get('compliance', {}).get('compliant', 'N/A')}/{analysis.get('compliance', {}).get('total_controls', 'N/A')}</p>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h2>🚨 Critical Findings</h2>
    """
    
    # Add critical findings
    critical_findings = []
    
    # Check for critical dependency vulnerabilities
    deps = analysis.get('dependencies', {})
    if deps.get('severity_counts', {}).get('CRITICAL', 0) > 0:
        critical_findings.append(f"🔴 {deps['severity_counts']['CRITICAL']} critical dependency vulnerabilities found")
    
    # Check for critical penetration test failures
    pen_test = analysis.get('penetration_test', {})
    if pen_test.get('severity_counts', {}).get('CRITICAL', 0) > 0:
        critical_findings.append(f"🔴 {pen_test['severity_counts']['CRITICAL']} critical security vulnerabilities found")
    
    # Check for critical compliance issues
    compliance = analysis.get('compliance', {})
    if compliance.get('critical_issues', 0) > 0:
        critical_findings.append(f"🔴 {compliance['critical_issues']} critical compliance issues found")
    
    if critical_findings:
        html += "<ul>"
        for finding in critical_findings:
            html += f"<li class='severity-high'>{finding}</li>"
        html += "</ul>"
    else:
        html += "<p style='color: #28a745; font-weight: bold;'>✅ No critical security issues found!</p>"
    
    html += f"""
            </div>
            
            <div class="section">
                <h2>📈 Detailed Analysis</h2>
                
                <h3>🔍 Static Application Security Testing (SAST)</h3>
    """
    
    # SAST details
    sast = analysis.get('sast', {})
    if sast.get('status') == 'completed':
        html += f"""
                <table>
                    <tr><th>Severity</th><th>Count</th></tr>
                    <tr><td>High</td><td class="severity-high">{sast.get('severity_counts', {}).get('HIGH', 0)}</td></tr>
                    <tr><td>Medium</td><td class="severity-medium">{sast.get('severity_counts', {}).get('MEDIUM', 0)}</td></tr>
                    <tr><td>Low</td><td class="severity-low">{sast.get('severity_counts', {}).get('LOW', 0)}</td></tr>
                </table>
        """
    else:
        html += "<p>SAST scan not completed.</p>"
    
    html += """
                <h3>📦 Dependency Vulnerabilities</h3>
    """
    
    # Dependency details
    if deps.get('total_vulnerabilities', 0) > 0:
        html += f"""
                <table>
                    <tr><th>Severity</th><th>Count</th></tr>
                    <tr><td>Critical</td><td class="severity-high">{deps.get('severity_counts', {}).get('CRITICAL', 0)}</td></tr>
                    <tr><td>High</td><td class="severity-high">{deps.get('severity_counts', {}).get('HIGH', 0)}</td></tr>
                    <tr><td>Medium</td><td class="severity-medium">{deps.get('severity_counts', {}).get('MEDIUM', 0)}</td></tr>
                    <tr><td>Low</td><td class="severity-low">{deps.get('severity_counts', {}).get('LOW', 0)}</td></tr>
                </table>
        """
    else:
        html += "<p style='color: #28a745;'>✅ No dependency vulnerabilities found!</p>"
    
    html += f"""
            </div>
            
            <div class="section">
                <h2>💡 Recommendations</h2>
                <div class="recommendations">
                    <h3>Immediate Actions Required:</h3>
                    <ul>
    """
    
    # Generate recommendations
    recommendations = []
    
    if deps.get('severity_counts', {}).get('CRITICAL', 0) > 0:
        recommendations.append("Update all packages with critical vulnerabilities immediately")
    
    if sast.get('severity_counts', {}).get('HIGH', 0) > 0:
        recommendations.append("Review and fix high-severity code security issues")
    
    if pen_test.get('severity_counts', {}).get('CRITICAL', 0) > 0:
        recommendations.append("Address critical security vulnerabilities found in penetration testing")
    
    if compliance.get('critical_issues', 0) > 0:
        recommendations.append("Implement missing critical compliance controls")
    
    if overall_score < 70:
        recommendations.append("Conduct comprehensive security review and implement security hardening measures")
    
    if not recommendations:
        recommendations.append("Continue regular security monitoring and maintain current security posture")
    
    for rec in recommendations:
        html += f"<li>{rec}</li>"
    
    html += f"""
                    </ul>
                    
                    <h3>Long-term Security Improvements:</h3>
                    <ul>
                        <li>Implement automated security scanning in CI/CD pipeline</li>
                        <li>Regular penetration testing and security assessments</li>
                        <li>Security awareness training for development team</li>
                        <li>Implement security monitoring and incident response procedures</li>
                        <li>Regular compliance audits and control reviews</li>
                    </ul>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p>This report was generated automatically by the reVoAgent Security Assessment Suite.</p>
            <p>For questions or concerns, please contact the security team.</p>
        </div>
    </div>
</body>
</html>
    """
    
    return html

def generate_summary_markdown() -> str:
    """Generate summary for PR comments"""
    scan_results = load_scan_results()
    
    # Quick analysis
    has_critical = False
    has_high = False
    total_issues = 0
    
    # Check bandit results
    if scan_results.get("bandit"):
        bandit_issues = scan_results["bandit"].get("results", [])
        high_issues = [i for i in bandit_issues if i.get("issue_severity") == "HIGH"]
        if high_issues:
            has_high = True
        total_issues += len(bandit_issues)
    
    # Check dependency results
    if scan_results.get("safety"):
        safety_vulns = scan_results["safety"].get("vulnerabilities", [])
        critical_vulns = [v for v in safety_vulns if v.get("severity") == "CRITICAL"]
        if critical_vulns:
            has_critical = True
        total_issues += len(safety_vulns)
    
    # Determine status
    if has_critical:
        status = "🚨 CRITICAL ISSUES FOUND"
        emoji = "🚨"
    elif has_high:
        status = "⚠️ HIGH SEVERITY ISSUES FOUND"
        emoji = "⚠️"
    elif total_issues > 0:
        status = "⚠️ SECURITY ISSUES FOUND"
        emoji = "⚠️"
    else:
        status = "✅ NO CRITICAL ISSUES FOUND"
        emoji = "✅"
    
    summary = f"""
## {emoji} Security Scan Summary

**Status:** {status}
**Total Issues:** {total_issues}

### Scan Results:
- **SAST (Bandit):** {'✅ Completed' if scan_results.get('bandit') else '❌ Not Run'}
- **Dependency Scan:** {'✅ Completed' if scan_results.get('safety') or scan_results.get('pip_audit') else '❌ Not Run'}
- **Container Scan:** {'✅ Completed' if scan_results.get('trivy') else '❌ Not Run'}

### Next Steps:
{f'- 🚨 **IMMEDIATE ACTION REQUIRED:** Review and fix critical security issues' if has_critical else ''}
{f'- ⚠️ Review and address high severity issues' if has_high else ''}
- 📋 Review full security report for detailed findings
- 🔄 Re-run security scans after fixes

For detailed results, check the security report artifact.
    """
    
    return summary

def main():
    """Main function"""
    print("🔍 Generating security report...")
    
    # Load all scan results
    scan_results = load_scan_results()
    
    # Analyze results
    analysis = {
        "sast": analyze_bandit_results(scan_results.get("bandit")),
        "dependencies": analyze_dependency_results(
            scan_results.get("safety"), 
            scan_results.get("pip_audit")
        ),
        "penetration_test": analyze_penetration_results(scan_results.get("penetration_test")),
        "compliance": analyze_compliance_results(scan_results.get("compliance"))
    }
    
    # Calculate overall score
    overall_score = calculate_overall_security_score(analysis)
    
    # Generate HTML report
    html_report = generate_html_report(analysis, overall_score)
    
    # Save HTML report
    with open("security-report.html", "w") as f:
        f.write(html_report)
    
    # Generate summary for PR comments
    summary = generate_summary_markdown()
    with open("security-summary.md", "w") as f:
        f.write(summary)
    
    # Save analysis results
    report_data = {
        "timestamp": datetime.now().isoformat(),
        "overall_score": overall_score,
        "analysis": analysis,
        "scan_results_available": {k: v is not None for k, v in scan_results.items()}
    }
    
    with open("security-report.json", "w") as f:
        json.dump(report_data, f, indent=2)
    
    print(f"✅ Security report generated successfully!")
    print(f"📊 Overall Security Score: {overall_score}/100")
    print(f"📄 HTML Report: security-report.html")
    print(f"📋 Summary: security-summary.md")
    
    # Exit with appropriate code
    if overall_score < 50:
        print("🚨 CRITICAL: Security score below 50!")
        sys.exit(2)
    elif overall_score < 70:
        print("⚠️ WARNING: Security score below 70!")
        sys.exit(1)
    else:
        print("✅ Security score acceptable")
        sys.exit(0)

if __name__ == "__main__":
    main()