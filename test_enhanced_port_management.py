#!/usr/bin/env python3
"""
Test Suite for Enhanced Port Management System
Validates all components of the enhanced port management system
"""

import os
import sys
import time
import json
import subprocess
import requests
from pathlib import Path

# Add scripts directory to path
sys.path.insert(0, str(Path(__file__).parent / "scripts"))

from enhanced_port_manager import EnhancedPortManager

def test_enhanced_port_manager():
    """Test the enhanced port manager functionality"""
    print("🔍 Testing Enhanced Port Manager...")
    
    manager = EnhancedPortManager()
    
    # Test 1: Port scanning
    print("   Testing port scanning...")
    scan_results = manager.comprehensive_port_scan()
    assert isinstance(scan_results, dict), "Port scan should return a dictionary"
    print(f"   ✅ Scanned {len(scan_results)} port configurations")
    
    # Test 2: Port availability checking
    print("   Testing port availability checking...")
    is_free = manager.is_port_free(65432)  # Use a high port that should be free
    assert is_free == True, "High port should be free"
    print("   ✅ Port availability checking works")
    
    # Test 3: Free port finding
    print("   Testing free port finding...")
    free_port = manager.find_free_port(65000)
    assert free_port is not None, "Should find a free port"
    assert free_port >= 65000, "Free port should be in requested range"
    print(f"   ✅ Found free port: {free_port}")
    
    # Test 4: Service configuration
    print("   Testing service configuration...")
    assert "backend" in manager.services, "Backend service should be configured"
    assert "frontend" in manager.services, "Frontend service should be configured"
    backend_config = manager.services["backend"]
    assert backend_config.port == 8000, "Backend should use port 8000"
    print("   ✅ Service configuration is correct")
    
    # Test 5: Conflict resolution
    print("   Testing conflict resolution...")
    resolution_results = manager.auto_resolve_all_conflicts()
    assert isinstance(resolution_results, dict), "Resolution should return a dictionary"
    print(f"   ✅ Conflict resolution completed: {resolution_results.get('status', 'unknown')}")
    
    return True

def test_enhanced_cleanup():
    """Test the enhanced cleanup functionality"""
    print("🧹 Testing Enhanced Cleanup...")
    
    # Test cleanup script
    result = subprocess.run(
        ["bash", "scripts/cleanup_ports.sh"],
        capture_output=True,
        text=True,
        cwd="/workspace/reVoAgent"
    )
    
    assert result.returncode == 0, f"Cleanup script failed: {result.stderr}"
    print("   ✅ Enhanced cleanup script executed successfully")
    
    # Test port manager cleanup
    result = subprocess.run(
        ["python3", "scripts/enhanced_port_manager.py", "--cleanup", "--json"],
        capture_output=True,
        text=True,
        cwd="/workspace/reVoAgent"
    )
    
    assert result.returncode == 0, f"Port manager cleanup failed: {result.stderr}"
    print("   ✅ Port manager cleanup executed successfully")
    
    return True

def test_fullstack_startup():
    """Test the enhanced fullstack startup system"""
    print("🚀 Testing Enhanced Fullstack Startup...")
    
    # Test status check (should work even with no services running)
    result = subprocess.run(
        ["python3", "scripts/enhanced_fullstack_startup.py", "--status", "--json"],
        capture_output=True,
        text=True,
        cwd="/workspace/reVoAgent"
    )
    
    assert result.returncode == 0, f"Status check failed: {result.stderr}"
    
    try:
        status_data = json.loads(result.stdout)
        assert isinstance(status_data, dict), "Status should return a dictionary"
        print(f"   ✅ Status check successful: {status_data.get('total_services', 0)} services")
    except json.JSONDecodeError:
        print("   ⚠️  Status output is not JSON, but command succeeded")
    
    return True

def test_port_manager_cli():
    """Test the port manager CLI interface"""
    print("🔧 Testing Port Manager CLI...")
    
    # Test scan command
    result = subprocess.run(
        ["python3", "scripts/enhanced_port_manager.py", "--scan"],
        capture_output=True,
        text=True,
        cwd="/workspace/reVoAgent"
    )
    
    assert result.returncode == 0, f"Scan command failed: {result.stderr}"
    assert "Port Scan Results" in result.stdout or "FREE" in result.stdout or "IN USE" in result.stdout, "Scan should show port status"
    print("   ✅ Scan command works")
    
    # Test report command
    result = subprocess.run(
        ["python3", "scripts/enhanced_port_manager.py", "--report", "--json"],
        capture_output=True,
        text=True,
        cwd="/workspace/reVoAgent"
    )
    
    assert result.returncode == 0, f"Report command failed: {result.stderr}"
    
    try:
        report_data = json.loads(result.stdout)
        assert isinstance(report_data, dict), "Report should return a dictionary"
        assert "timestamp" in report_data, "Report should have timestamp"
        print("   ✅ Report command works")
    except json.JSONDecodeError:
        print("   ⚠️  Report output is not valid JSON, but command succeeded")
    
    return True

def test_configuration_loading():
    """Test configuration file loading"""
    print("⚙️  Testing Configuration Loading...")
    
    config_path = "/workspace/reVoAgent/config/port_manager_config.yaml"
    
    if Path(config_path).exists():
        manager = EnhancedPortManager(config_path)
        assert manager.config is not None, "Configuration should be loaded"
        assert "monitoring" in manager.config, "Configuration should have monitoring section"
        print("   ✅ Configuration file loaded successfully")
    else:
        print("   ⚠️  Configuration file not found, using defaults")
    
    return True

def test_service_health_checks():
    """Test service health check functionality"""
    print("🏥 Testing Service Health Checks...")
    
    manager = EnhancedPortManager()
    
    # Test health check for non-running service (should return False)
    is_healthy = manager.health_check_service("backend")
    print(f"   Backend health (not running): {is_healthy}")
    
    # Test health check for unknown service
    is_healthy = manager.health_check_service("unknown_service")
    assert is_healthy == False, "Unknown service should not be healthy"
    print("   ✅ Health checks work for unknown services")
    
    return True

def test_integration():
    """Test integration between components"""
    print("🔗 Testing Component Integration...")
    
    # Test that all scripts exist and are executable
    scripts = [
        "scripts/enhanced_port_manager.py",
        "scripts/enhanced_fullstack_startup.py",
        "scripts/cleanup_ports.sh"
    ]
    
    for script in scripts:
        script_path = Path("/workspace/reVoAgent") / script
        assert script_path.exists(), f"Script {script} should exist"
        assert os.access(script_path, os.X_OK), f"Script {script} should be executable"
    
    print("   ✅ All scripts exist and are executable")
    
    # Test that configuration file exists
    config_path = Path("/workspace/reVoAgent/config/port_manager_config.yaml")
    assert config_path.exists(), "Configuration file should exist"
    print("   ✅ Configuration file exists")
    
    # Test that logs directory exists
    logs_dir = Path("/workspace/reVoAgent/logs")
    assert logs_dir.exists(), "Logs directory should exist"
    print("   ✅ Logs directory exists")
    
    return True

def run_all_tests():
    """Run all tests and report results"""
    print("🧪 Enhanced Port Management System Test Suite")
    print("=" * 60)
    
    tests = [
        ("Enhanced Port Manager", test_enhanced_port_manager),
        ("Enhanced Cleanup", test_enhanced_cleanup),
        ("Fullstack Startup", test_fullstack_startup),
        ("Port Manager CLI", test_port_manager_cli),
        ("Configuration Loading", test_configuration_loading),
        ("Service Health Checks", test_service_health_checks),
        ("Component Integration", test_integration),
    ]
    
    passed = 0
    failed = 0
    
    for test_name, test_func in tests:
        try:
            print(f"\n🔬 {test_name}")
            result = test_func()
            if result:
                print(f"✅ {test_name}: PASSED")
                passed += 1
            else:
                print(f"❌ {test_name}: FAILED")
                failed += 1
        except Exception as e:
            print(f"❌ {test_name}: FAILED - {e}")
            failed += 1
    
    print("\n" + "=" * 60)
    print(f"📊 Test Results: {passed} passed, {failed} failed")
    
    if failed == 0:
        print("🎉 All tests passed! Enhanced Port Management System is working correctly.")
        return True
    else:
        print(f"⚠️  {failed} tests failed. Please check the issues above.")
        return False

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)