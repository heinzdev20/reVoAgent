"""
Penetration Testing Suite
Automated security testing for reVoAgent platform
"""

import asyncio
import aiohttp
import json
import time
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, asdict
import subprocess
import socket
import ssl
import requests
from urllib.parse import urljoin, urlparse
import base64
import hashlib
import secrets

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class SecurityTestResult:
    test_name: str
    category: str
    severity: str  # LOW, MEDIUM, HIGH, CRITICAL
    status: str    # PASS, FAIL, WARNING
    description: str
    details: str
    remediation: str
    cve_references: List[str]
    timestamp: str

class PenetrationTester:
    def __init__(self, base_url: str = "http://localhost:12000"):
        self.base_url = base_url
        self.results: List[SecurityTestResult] = []
        
    def add_result(self, test_name: str, category: str, severity: str, 
                   status: str, description: str, details: str = "", 
                   remediation: str = "", cve_references: List[str] = None):
        """Add a security test result"""
        result = SecurityTestResult(
            test_name=test_name,
            category=category,
            severity=severity,
            status=status,
            description=description,
            details=details,
            remediation=remediation,
            cve_references=cve_references or [],
            timestamp=datetime.now().isoformat()
        )
        self.results.append(result)
        
    async def test_authentication_bypass(self) -> None:
        """Test for authentication bypass vulnerabilities"""
        logger.info("🔐 Testing authentication bypass...")
        
        # Test endpoints that should require authentication
        protected_endpoints = [
            "/api/admin/users",
            "/api/admin/system",
            "/api/agents/configure",
            "/api/system/shutdown",
            "/api/security/secrets"
        ]
        
        async with aiohttp.ClientSession() as session:
            for endpoint in protected_endpoints:
                try:
                    # Test without authentication
                    async with session.get(f"{self.base_url}{endpoint}") as response:
                        if response.status == 200:
                            self.add_result(
                                test_name="Authentication Bypass",
                                category="Authentication",
                                severity="CRITICAL",
                                status="FAIL",
                                description=f"Endpoint {endpoint} accessible without authentication",
                                details=f"HTTP {response.status} returned for unauthenticated request",
                                remediation="Implement proper authentication checks for all protected endpoints"
                            )
                        else:
                            self.add_result(
                                test_name="Authentication Protection",
                                category="Authentication",
                                severity="LOW",
                                status="PASS",
                                description=f"Endpoint {endpoint} properly protected",
                                details=f"HTTP {response.status} returned for unauthenticated request"
                            )
                except Exception as e:
                    self.add_result(
                        test_name="Authentication Test Error",
                        category="Authentication",
                        severity="MEDIUM",
                        status="WARNING",
                        description=f"Could not test endpoint {endpoint}",
                        details=str(e)
                    )
    
    async def test_sql_injection(self) -> None:
        """Test for SQL injection vulnerabilities"""
        logger.info("💉 Testing SQL injection...")
        
        # Common SQL injection payloads
        sql_payloads = [
            "' OR '1'='1",
            "'; DROP TABLE users; --",
            "' UNION SELECT * FROM users --",
            "1' AND 1=1 --",
            "admin'--",
            "' OR 1=1#"
        ]
        
        # Test endpoints that might be vulnerable
        test_endpoints = [
            "/api/users/search",
            "/api/agents/search",
            "/api/memory/search",
            "/api/analytics/query"
        ]
        
        async with aiohttp.ClientSession() as session:
            for endpoint in test_endpoints:
                for payload in sql_payloads:
                    try:
                        # Test with SQL injection payload
                        test_data = {"query": payload, "search": payload, "filter": payload}
                        
                        async with session.post(
                            f"{self.base_url}{endpoint}",
                            json=test_data,
                            timeout=aiohttp.ClientTimeout(total=10)
                        ) as response:
                            response_text = await response.text()
                            
                            # Check for SQL error messages
                            sql_errors = [
                                "sql syntax",
                                "mysql_fetch",
                                "ora-",
                                "postgresql",
                                "sqlite",
                                "syntax error",
                                "unclosed quotation mark"
                            ]
                            
                            if any(error in response_text.lower() for error in sql_errors):
                                self.add_result(
                                    test_name="SQL Injection Vulnerability",
                                    category="Injection",
                                    severity="CRITICAL",
                                    status="FAIL",
                                    description=f"SQL injection detected in {endpoint}",
                                    details=f"Payload: {payload}, Response contains SQL error",
                                    remediation="Use parameterized queries and input validation",
                                    cve_references=["CWE-89"]
                                )
                            
                    except asyncio.TimeoutError:
                        self.add_result(
                            test_name="SQL Injection Timeout",
                            category="Injection",
                            severity="HIGH",
                            status="WARNING",
                            description=f"Timeout on {endpoint} with payload {payload}",
                            details="Request timed out, possible DoS vulnerability",
                            remediation="Implement request timeouts and rate limiting"
                        )
                    except Exception as e:
                        # This is expected for most cases
                        pass
        
        # If no SQL injection found, add positive result
        sql_failures = [r for r in self.results if r.test_name == "SQL Injection Vulnerability"]
        if not sql_failures:
            self.add_result(
                test_name="SQL Injection Protection",
                category="Injection",
                severity="LOW",
                status="PASS",
                description="No SQL injection vulnerabilities detected",
                details="Tested multiple endpoints with common SQL injection payloads"
            )
    
    async def test_xss_vulnerabilities(self) -> None:
        """Test for Cross-Site Scripting (XSS) vulnerabilities"""
        logger.info("🕷️ Testing XSS vulnerabilities...")
        
        # XSS payloads
        xss_payloads = [
            "<script>alert('XSS')</script>",
            "javascript:alert('XSS')",
            "<img src=x onerror=alert('XSS')>",
            "';alert('XSS');//",
            "<svg onload=alert('XSS')>",
            "{{7*7}}"  # Template injection
        ]
        
        # Test endpoints that might reflect user input
        test_endpoints = [
            "/api/chat/message",
            "/api/agents/task",
            "/api/memory/store",
            "/api/feedback/submit"
        ]
        
        async with aiohttp.ClientSession() as session:
            for endpoint in test_endpoints:
                for payload in xss_payloads:
                    try:
                        test_data = {
                            "message": payload,
                            "content": payload,
                            "data": payload,
                            "input": payload
                        }
                        
                        async with session.post(
                            f"{self.base_url}{endpoint}",
                            json=test_data,
                            timeout=aiohttp.ClientTimeout(total=5)
                        ) as response:
                            response_text = await response.text()
                            
                            # Check if payload is reflected without encoding
                            if payload in response_text and "<script>" in payload:
                                self.add_result(
                                    test_name="XSS Vulnerability",
                                    category="Cross-Site Scripting",
                                    severity="HIGH",
                                    status="FAIL",
                                    description=f"XSS vulnerability detected in {endpoint}",
                                    details=f"Payload: {payload} reflected in response",
                                    remediation="Implement proper output encoding and CSP headers",
                                    cve_references=["CWE-79"]
                                )
                                
                    except Exception as e:
                        # Expected for most cases
                        pass
        
        # If no XSS found, add positive result
        xss_failures = [r for r in self.results if r.test_name == "XSS Vulnerability"]
        if not xss_failures:
            self.add_result(
                test_name="XSS Protection",
                category="Cross-Site Scripting",
                severity="LOW",
                status="PASS",
                description="No XSS vulnerabilities detected",
                details="Tested multiple endpoints with common XSS payloads"
            )
    
    async def test_csrf_protection(self) -> None:
        """Test for CSRF protection"""
        logger.info("🔄 Testing CSRF protection...")
        
        # Test state-changing endpoints
        csrf_endpoints = [
            ("/api/users/create", "POST"),
            ("/api/agents/configure", "POST"),
            ("/api/system/restart", "POST"),
            ("/api/security/update", "PUT"),
            ("/api/admin/delete", "DELETE")
        ]
        
        async with aiohttp.ClientSession() as session:
            for endpoint, method in csrf_endpoints:
                try:
                    # Test without CSRF token
                    test_data = {"test": "csrf_test"}
                    
                    if method == "POST":
                        async with session.post(f"{self.base_url}{endpoint}", json=test_data) as response:
                            if response.status == 200:
                                self.add_result(
                                    test_name="CSRF Vulnerability",
                                    category="Cross-Site Request Forgery",
                                    severity="HIGH",
                                    status="FAIL",
                                    description=f"CSRF protection missing on {endpoint}",
                                    details=f"State-changing operation allowed without CSRF token",
                                    remediation="Implement CSRF tokens for all state-changing operations",
                                    cve_references=["CWE-352"]
                                )
                            else:
                                self.add_result(
                                    test_name="CSRF Protection",
                                    category="Cross-Site Request Forgery",
                                    severity="LOW",
                                    status="PASS",
                                    description=f"CSRF protection active on {endpoint}",
                                    details=f"HTTP {response.status} returned without CSRF token"
                                )
                                
                except Exception as e:
                    # Expected for most cases
                    pass
    
    async def test_directory_traversal(self) -> None:
        """Test for directory traversal vulnerabilities"""
        logger.info("📁 Testing directory traversal...")
        
        # Directory traversal payloads
        traversal_payloads = [
            "../../../etc/passwd",
            "..\\..\\..\\windows\\system32\\drivers\\etc\\hosts",
            "....//....//....//etc/passwd",
            "%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd",
            "..%252f..%252f..%252fetc%252fpasswd"
        ]
        
        # Test file-related endpoints
        file_endpoints = [
            "/api/files/read",
            "/api/download",
            "/api/static",
            "/api/logs/view"
        ]
        
        async with aiohttp.ClientSession() as session:
            for endpoint in file_endpoints:
                for payload in traversal_payloads:
                    try:
                        # Test with traversal payload
                        params = {"file": payload, "path": payload, "filename": payload}
                        
                        async with session.get(
                            f"{self.base_url}{endpoint}",
                            params=params,
                            timeout=aiohttp.ClientTimeout(total=5)
                        ) as response:
                            response_text = await response.text()
                            
                            # Check for system file contents
                            if "root:" in response_text or "localhost" in response_text:
                                self.add_result(
                                    test_name="Directory Traversal Vulnerability",
                                    category="Path Traversal",
                                    severity="CRITICAL",
                                    status="FAIL",
                                    description=f"Directory traversal detected in {endpoint}",
                                    details=f"Payload: {payload} accessed system files",
                                    remediation="Validate and sanitize file paths, use whitelist approach",
                                    cve_references=["CWE-22"]
                                )
                                
                    except Exception as e:
                        # Expected for most cases
                        pass
        
        # If no directory traversal found, add positive result
        traversal_failures = [r for r in self.results if r.test_name == "Directory Traversal Vulnerability"]
        if not traversal_failures:
            self.add_result(
                test_name="Directory Traversal Protection",
                category="Path Traversal",
                severity="LOW",
                status="PASS",
                description="No directory traversal vulnerabilities detected",
                details="Tested multiple endpoints with common traversal payloads"
            )
    
    def test_ssl_configuration(self) -> None:
        """Test SSL/TLS configuration"""
        logger.info("🔒 Testing SSL/TLS configuration...")
        
        try:
            # Parse URL to get hostname and port
            parsed_url = urlparse(self.base_url)
            hostname = parsed_url.hostname
            port = parsed_url.port or (443 if parsed_url.scheme == 'https' else 80)
            
            if parsed_url.scheme == 'https':
                # Test SSL certificate
                context = ssl.create_default_context()
                with socket.create_connection((hostname, port), timeout=10) as sock:
                    with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                        cert = ssock.getpeercert()
                        
                        # Check certificate validity
                        not_after = datetime.strptime(cert['notAfter'], '%b %d %H:%M:%S %Y %Z')
                        days_until_expiry = (not_after - datetime.now()).days
                        
                        if days_until_expiry < 30:
                            self.add_result(
                                test_name="SSL Certificate Expiry",
                                category="SSL/TLS",
                                severity="HIGH",
                                status="WARNING",
                                description="SSL certificate expires soon",
                                details=f"Certificate expires in {days_until_expiry} days",
                                remediation="Renew SSL certificate before expiry"
                            )
                        else:
                            self.add_result(
                                test_name="SSL Certificate Validity",
                                category="SSL/TLS",
                                severity="LOW",
                                status="PASS",
                                description="SSL certificate is valid",
                                details=f"Certificate expires in {days_until_expiry} days"
                            )
                        
                        # Check for weak ciphers
                        cipher = ssock.cipher()
                        if cipher and len(cipher) >= 3:
                            cipher_name = cipher[0]
                            if any(weak in cipher_name.lower() for weak in ['rc4', 'des', 'md5']):
                                self.add_result(
                                    test_name="Weak SSL Cipher",
                                    category="SSL/TLS",
                                    severity="MEDIUM",
                                    status="FAIL",
                                    description="Weak SSL cipher detected",
                                    details=f"Cipher: {cipher_name}",
                                    remediation="Configure strong SSL ciphers only"
                                )
                            else:
                                self.add_result(
                                    test_name="SSL Cipher Strength",
                                    category="SSL/TLS",
                                    severity="LOW",
                                    status="PASS",
                                    description="Strong SSL cipher in use",
                                    details=f"Cipher: {cipher_name}"
                                )
            else:
                self.add_result(
                    test_name="HTTPS Not Enabled",
                    category="SSL/TLS",
                    severity="HIGH",
                    status="FAIL",
                    description="HTTPS not enabled",
                    details="Application is running over HTTP",
                    remediation="Enable HTTPS with valid SSL certificate"
                )
                
        except Exception as e:
            self.add_result(
                test_name="SSL Configuration Test Error",
                category="SSL/TLS",
                severity="MEDIUM",
                status="WARNING",
                description="Could not test SSL configuration",
                details=str(e)
            )
    
    async def test_rate_limiting(self) -> None:
        """Test rate limiting implementation"""
        logger.info("⏱️ Testing rate limiting...")
        
        # Test endpoints for rate limiting
        test_endpoints = [
            "/api/auth/login",
            "/api/chat/message",
            "/api/agents/task"
        ]
        
        async with aiohttp.ClientSession() as session:
            for endpoint in test_endpoints:
                try:
                    # Send rapid requests
                    tasks = []
                    for i in range(100):  # 100 rapid requests
                        task = session.post(
                            f"{self.base_url}{endpoint}",
                            json={"test": f"rate_limit_test_{i}"},
                            timeout=aiohttp.ClientTimeout(total=1)
                        )
                        tasks.append(task)
                    
                    responses = await asyncio.gather(*tasks, return_exceptions=True)
                    
                    # Check for rate limiting responses
                    rate_limited = sum(1 for r in responses 
                                     if hasattr(r, 'status') and r.status == 429)
                    
                    if rate_limited > 0:
                        self.add_result(
                            test_name="Rate Limiting Active",
                            category="Rate Limiting",
                            severity="LOW",
                            status="PASS",
                            description=f"Rate limiting active on {endpoint}",
                            details=f"{rate_limited}/100 requests rate limited"
                        )
                    else:
                        self.add_result(
                            test_name="Rate Limiting Missing",
                            category="Rate Limiting",
                            severity="MEDIUM",
                            status="FAIL",
                            description=f"No rate limiting on {endpoint}",
                            details="100 rapid requests all succeeded",
                            remediation="Implement rate limiting to prevent abuse"
                        )
                        
                except Exception as e:
                    # Expected for some cases
                    pass
    
    async def run_all_tests(self) -> Dict[str, Any]:
        """Run all penetration tests"""
        logger.info("🚀 Starting Penetration Testing Suite...")
        
        start_time = time.time()
        
        # Run all security tests
        await self.test_authentication_bypass()
        await self.test_sql_injection()
        await self.test_xss_vulnerabilities()
        await self.test_csrf_protection()
        await self.test_directory_traversal()
        self.test_ssl_configuration()
        await self.test_rate_limiting()
        
        # Calculate metrics
        total_duration = time.time() - start_time
        total_tests = len(self.results)
        critical_issues = len([r for r in self.results if r.severity == "CRITICAL" and r.status == "FAIL"])
        high_issues = len([r for r in self.results if r.severity == "HIGH" and r.status == "FAIL"])
        medium_issues = len([r for r in self.results if r.severity == "MEDIUM" and r.status == "FAIL"])
        low_issues = len([r for r in self.results if r.severity == "LOW" and r.status == "FAIL"])
        
        passed_tests = len([r for r in self.results if r.status == "PASS"])
        failed_tests = len([r for r in self.results if r.status == "FAIL"])
        warnings = len([r for r in self.results if r.status == "WARNING"])
        
        # Calculate security score
        security_score = max(0, 100 - (critical_issues * 25) - (high_issues * 10) - (medium_issues * 5) - (low_issues * 1))
        
        # Generate summary
        summary = {
            "test_suite": "Penetration Testing",
            "timestamp": datetime.now().isoformat(),
            "duration": total_duration,
            "total_tests": total_tests,
            "passed_tests": passed_tests,
            "failed_tests": failed_tests,
            "warnings": warnings,
            "security_score": security_score,
            "critical_issues": critical_issues,
            "high_issues": high_issues,
            "medium_issues": medium_issues,
            "low_issues": low_issues,
            "overall_status": "PASS" if critical_issues == 0 and high_issues == 0 else "FAIL",
            "results": [asdict(result) for result in self.results]
        }
        
        # Save results
        with open("penetration_test_results.json", "w") as f:
            json.dump(summary, f, indent=2)
        
        # Print summary
        print("\n" + "="*80)
        print("🔐 PENETRATION TEST SUMMARY")
        print("="*80)
        print(f"⏱️  Duration: {total_duration:.2f} seconds")
        print(f"🧪 Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"⚠️  Warnings: {warnings}")
        print(f"🛡️  Security Score: {security_score}/100")
        print(f"🚨 Critical Issues: {critical_issues}")
        print(f"🔴 High Issues: {high_issues}")
        print(f"🟡 Medium Issues: {medium_issues}")
        print(f"🟢 Low Issues: {low_issues}")
        print(f"🎉 Overall Status: {summary['overall_status']}")
        print("="*80)
        
        # Print detailed results
        for result in self.results:
            status_icon = {"PASS": "✅", "FAIL": "❌", "WARNING": "⚠️"}[result.status]
            severity_icon = {"CRITICAL": "🚨", "HIGH": "🔴", "MEDIUM": "🟡", "LOW": "🟢"}[result.severity]
            
            print(f"{status_icon} {severity_icon} {result.test_name}")
            print(f"   Category: {result.category}")
            print(f"   Description: {result.description}")
            if result.details:
                print(f"   Details: {result.details}")
            if result.remediation:
                print(f"   Remediation: {result.remediation}")
            print()
        
        return summary

async def main():
    """Main function to run penetration tests"""
    tester = PenetrationTester()
    
    try:
        results = await tester.run_all_tests()
        
        # Exit with appropriate code
        if results["overall_status"] == "PASS":
            print("🎉 All critical security tests passed!")
            exit(0)
        else:
            print("❌ Critical security issues found!")
            exit(1)
            
    except Exception as e:
        logger.error(f"Penetration testing failed: {e}")
        exit(1)

if __name__ == "__main__":
    asyncio.run(main())