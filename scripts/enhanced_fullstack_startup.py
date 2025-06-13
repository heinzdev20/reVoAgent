#!/usr/bin/env python3
"""
Enhanced Full Stack Startup Script for reVoAgent
Intelligent startup with automatic port conflict resolution and health monitoring
"""

import os
import sys
import time
import json
import signal
import subprocess
import threading
import logging
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import requests
import psutil

# Add the scripts directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

from enhanced_port_manager import EnhancedPortManager, ServiceConfig

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('/workspace/reVoAgent/logs/fullstack_startup.log', mode='a')
    ]
)
logger = logging.getLogger(__name__)

class FullStackManager:
    """Enhanced full stack manager with intelligent startup and monitoring"""
    
    def __init__(self):
        self.project_root = Path("/workspace/reVoAgent")
        self.logs_dir = self.project_root / "logs"
        self.logs_dir.mkdir(exist_ok=True)
        
        # Initialize port manager
        self.port_manager = EnhancedPortManager()
        
        # Runtime state
        self.running_services: Dict[str, Dict] = {}
        self.startup_order = ["backend", "frontend"]  # Dependencies handled automatically
        self.shutdown_handlers = []
        self.monitoring_active = False
        self.monitor_thread = None
        
        # Register shutdown handler
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)
    
    def _signal_handler(self, signum, frame):
        """Handle shutdown signals gracefully"""
        logger.info(f"Received signal {signum}, shutting down gracefully...")
        self.shutdown_all_services()
        sys.exit(0)
    
    def pre_startup_checks(self) -> bool:
        """Perform comprehensive pre-startup checks"""
        logger.info("🔍 Performing pre-startup checks...")
        
        checks_passed = True
        
        # Check if project structure exists
        required_paths = [
            self.project_root / "simple_backend_server.py",
            self.project_root / "frontend" / "package.json",
            self.project_root / "frontend" / "src"
        ]
        
        for path in required_paths:
            if not path.exists():
                logger.error(f"❌ Required path missing: {path}")
                checks_passed = False
            else:
                logger.debug(f"✅ Found: {path}")
        
        # Check Python dependencies
        try:
            import fastapi
            import uvicorn
            logger.debug("✅ Python dependencies available")
        except ImportError as e:
            logger.error(f"❌ Missing Python dependencies: {e}")
            checks_passed = False
        
        # Check Node.js and npm
        try:
            result = subprocess.run(["node", "--version"], capture_output=True, text=True)
            if result.returncode == 0:
                logger.debug(f"✅ Node.js version: {result.stdout.strip()}")
            else:
                logger.error("❌ Node.js not available")
                checks_passed = False
        except FileNotFoundError:
            logger.error("❌ Node.js not found")
            checks_passed = False
        
        # Check npm dependencies
        frontend_node_modules = self.project_root / "frontend" / "node_modules"
        if not frontend_node_modules.exists():
            logger.warning("⚠️  Frontend dependencies not installed, will install during startup")
        
        # Resolve port conflicts
        logger.info("🔧 Resolving port conflicts...")
        conflict_results = self.port_manager.auto_resolve_all_conflicts()
        
        conflicts_found = conflict_results.get("conflicts_found", 0)
        conflicts_resolved = conflict_results.get("conflicts_resolved", 0)
        
        if conflicts_found > 0:
            logger.info(f"✅ Resolved {conflicts_resolved}/{conflicts_found} port conflicts")
        else:
            logger.info("✅ No port conflicts detected")
        
        return checks_passed
    
    def install_frontend_dependencies(self) -> bool:
        """Install frontend dependencies if needed"""
        frontend_dir = self.project_root / "frontend"
        node_modules = frontend_dir / "node_modules"
        
        if node_modules.exists():
            logger.info("✅ Frontend dependencies already installed")
            return True
        
        logger.info("📦 Installing frontend dependencies...")
        
        try:
            process = subprocess.Popen(
                ["npm", "install"],
                cwd=frontend_dir,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            stdout, stderr = process.communicate(timeout=300)  # 5 minute timeout
            
            if process.returncode == 0:
                logger.info("✅ Frontend dependencies installed successfully")
                return True
            else:
                logger.error(f"❌ Failed to install frontend dependencies: {stderr}")
                return False
                
        except subprocess.TimeoutExpired:
            logger.error("❌ Frontend dependency installation timed out")
            process.kill()
            return False
        except Exception as e:
            logger.error(f"❌ Error installing frontend dependencies: {e}")
            return False
    
    def start_service(self, service_name: str, port: Optional[int] = None) -> bool:
        """Start a specific service with enhanced error handling"""
        if service_name not in self.port_manager.services:
            logger.error(f"❌ Unknown service: {service_name}")
            return False
        
        service_config = self.port_manager.services[service_name]
        
        # Determine port to use
        if port is None:
            port = service_config.port
            if not self.port_manager.is_port_free(port):
                # Try to resolve conflict
                conflict_result = self.port_manager.resolve_port_conflict(port)
                if conflict_result.get("new_port"):
                    port = conflict_result["new_port"]
                elif conflict_result.get("status") == "terminated":
                    # Port should be free now
                    pass
                else:
                    # Find alternative port
                    port = self.port_manager.find_free_port(port)
                    if port is None:
                        logger.error(f"❌ Could not find free port for {service_name}")
                        return False
        
        logger.info(f"🚀 Starting {service_name} on port {port}...")
        
        # Special handling for different services
        if service_name == "backend":
            return self._start_backend_service(port)
        elif service_name == "frontend":
            return self._start_frontend_service(port)
        else:
            return self._start_generic_service(service_name, port)
    
    def _start_backend_service(self, port: int) -> bool:
        """Start the backend service"""
        try:
            # Prepare environment
            env = os.environ.copy()
            env["PORT"] = str(port)
            env["HOST"] = "0.0.0.0"
            
            # Start backend process
            cmd = ["python", "simple_backend_server.py"]
            
            process = subprocess.Popen(
                cmd,
                cwd=self.project_root,
                env=env,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            # Store process info
            self.running_services["backend"] = {
                "process": process,
                "port": port,
                "pid": process.pid,
                "start_time": time.time(),
                "health_url": f"http://localhost:{port}/health"
            }
            
            # Wait for service to be ready
            if self._wait_for_service_health("backend", timeout=30):
                logger.info(f"✅ Backend started successfully on port {port} (PID: {process.pid})")
                return True
            else:
                logger.error("❌ Backend failed to become healthy")
                self._stop_service("backend")
                return False
                
        except Exception as e:
            logger.error(f"❌ Failed to start backend: {e}")
            return False
    
    def _start_frontend_service(self, port: int) -> bool:
        """Start the frontend service"""
        try:
            frontend_dir = self.project_root / "frontend"
            
            # Ensure dependencies are installed
            if not self.install_frontend_dependencies():
                return False
            
            # Prepare environment
            env = os.environ.copy()
            env["PORT"] = str(port)
            env["HOST"] = "0.0.0.0"
            
            # Start frontend process
            cmd = ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", str(port)]
            
            process = subprocess.Popen(
                cmd,
                cwd=frontend_dir,
                env=env,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            # Store process info
            self.running_services["frontend"] = {
                "process": process,
                "port": port,
                "pid": process.pid,
                "start_time": time.time(),
                "health_url": f"http://localhost:{port}"
            }
            
            # Wait for service to be ready
            if self._wait_for_service_health("frontend", timeout=60):
                logger.info(f"✅ Frontend started successfully on port {port} (PID: {process.pid})")
                return True
            else:
                logger.error("❌ Frontend failed to become healthy")
                self._stop_service("frontend")
                return False
                
        except Exception as e:
            logger.error(f"❌ Failed to start frontend: {e}")
            return False
    
    def _start_generic_service(self, service_name: str, port: int) -> bool:
        """Start a generic service using port manager configuration"""
        return self.port_manager._start_service(service_name, port)
    
    def _wait_for_service_health(self, service_name: str, timeout: int = 30) -> bool:
        """Wait for a service to become healthy"""
        if service_name not in self.running_services:
            return False
        
        service_info = self.running_services[service_name]
        health_url = service_info.get("health_url")
        
        if not health_url:
            # If no health URL, just check if process is running
            time.sleep(5)
            return service_info["process"].poll() is None
        
        start_time = time.time()
        attempt = 1
        
        while time.time() - start_time < timeout:
            try:
                # Check if process is still running
                if service_info["process"].poll() is not None:
                    logger.error(f"❌ {service_name} process died during startup")
                    return False
                
                # Try health check
                response = requests.get(health_url, timeout=5)
                if response.status_code == 200:
                    logger.info(f"✅ {service_name} health check passed")
                    return True
                
            except requests.exceptions.RequestException:
                pass  # Expected during startup
            
            logger.debug(f"⏳ Waiting for {service_name} to be ready... (attempt {attempt})")
            time.sleep(2)
            attempt += 1
        
        logger.error(f"❌ {service_name} health check timed out after {timeout} seconds")
        return False
    
    def _stop_service(self, service_name: str) -> bool:
        """Stop a specific service gracefully"""
        if service_name not in self.running_services:
            logger.warning(f"⚠️  Service {service_name} is not running")
            return True
        
        service_info = self.running_services[service_name]
        process = service_info["process"]
        
        logger.info(f"🛑 Stopping {service_name} (PID: {service_info['pid']})...")
        
        try:
            # Try graceful termination first
            process.terminate()
            
            # Wait for process to terminate
            try:
                process.wait(timeout=10)
                logger.info(f"✅ {service_name} stopped gracefully")
            except subprocess.TimeoutExpired:
                logger.warning(f"⚠️  {service_name} didn't stop gracefully, force killing...")
                process.kill()
                process.wait(timeout=5)
                logger.info(f"✅ {service_name} force stopped")
            
            # Remove from running services
            del self.running_services[service_name]
            return True
            
        except Exception as e:
            logger.error(f"❌ Error stopping {service_name}: {e}")
            return False
    
    def start_all_services(self) -> bool:
        """Start all services in the correct order"""
        logger.info("🚀 Starting all reVoAgent services...")
        
        # Perform pre-startup checks
        if not self.pre_startup_checks():
            logger.error("❌ Pre-startup checks failed")
            return False
        
        # Start services in dependency order
        for service_name in self.startup_order:
            if not self.start_service(service_name):
                logger.error(f"❌ Failed to start {service_name}, aborting startup")
                self.shutdown_all_services()
                return False
            
            # Brief pause between services
            time.sleep(2)
        
        # Start monitoring
        self.start_monitoring()
        
        # Display startup summary
        self._display_startup_summary()
        
        logger.info("🎉 All services started successfully!")
        return True
    
    def shutdown_all_services(self) -> None:
        """Shutdown all services gracefully"""
        logger.info("🛑 Shutting down all services...")
        
        # Stop monitoring first
        self.stop_monitoring()
        
        # Stop services in reverse order
        for service_name in reversed(self.startup_order):
            if service_name in self.running_services:
                self._stop_service(service_name)
        
        # Clean up any remaining processes
        self._cleanup_remaining_processes()
        
        logger.info("✅ All services stopped")
    
    def _cleanup_remaining_processes(self) -> None:
        """Clean up any remaining reVoAgent processes"""
        try:
            cleanup_result = self.port_manager.cleanup_revoagent_ports()
            if cleanup_result:
                logger.info("🧹 Cleaned up remaining processes")
        except Exception as e:
            logger.warning(f"⚠️  Error during cleanup: {e}")
    
    def start_monitoring(self) -> None:
        """Start service health monitoring"""
        if self.monitoring_active:
            return
        
        self.monitoring_active = True
        self.monitor_thread = threading.Thread(target=self._monitoring_loop, daemon=True)
        self.monitor_thread.start()
        logger.info("🔍 Started service monitoring")
    
    def stop_monitoring(self) -> None:
        """Stop service health monitoring"""
        self.monitoring_active = False
        if self.monitor_thread:
            self.monitor_thread.join(timeout=5)
        logger.info("🛑 Stopped service monitoring")
    
    def _monitoring_loop(self) -> None:
        """Main monitoring loop"""
        while self.monitoring_active:
            try:
                # Check health of all running services
                for service_name, service_info in list(self.running_services.items()):
                    if not self._check_service_health(service_name):
                        logger.warning(f"⚠️  {service_name} health check failed")
                        
                        # Attempt restart if auto-restart is enabled
                        service_config = self.port_manager.services.get(service_name)
                        if service_config and service_config.auto_restart:
                            logger.info(f"🔄 Attempting to restart {service_name}")
                            self._restart_service(service_name)
                
                # Check for port conflicts
                scan_results = self.port_manager.comprehensive_port_scan()
                conflicts = [
                    status for status in scan_results.values() 
                    if not status.is_free and status.conflict_level in ["high", "critical"]
                ]
                
                if conflicts:
                    logger.warning(f"⚠️  Detected {len(conflicts)} port conflicts")
                    # Auto-resolve if configured
                    if self.port_manager.config["monitoring"]["auto_resolve_conflicts"]:
                        self.port_manager.auto_resolve_all_conflicts()
                
                time.sleep(30)  # Check every 30 seconds
                
            except Exception as e:
                logger.error(f"❌ Error in monitoring loop: {e}")
                time.sleep(30)
    
    def _check_service_health(self, service_name: str) -> bool:
        """Check health of a specific service"""
        if service_name not in self.running_services:
            return False
        
        service_info = self.running_services[service_name]
        
        # Check if process is still running
        if service_info["process"].poll() is not None:
            logger.error(f"❌ {service_name} process has died")
            return False
        
        # Try health check if URL is available
        health_url = service_info.get("health_url")
        if health_url:
            try:
                response = requests.get(health_url, timeout=10)
                return response.status_code == 200
            except requests.exceptions.RequestException:
                return False
        
        return True
    
    def _restart_service(self, service_name: str) -> bool:
        """Restart a specific service"""
        logger.info(f"🔄 Restarting {service_name}...")
        
        # Stop the service
        if not self._stop_service(service_name):
            logger.error(f"❌ Failed to stop {service_name} for restart")
            return False
        
        # Wait a moment
        time.sleep(5)
        
        # Start the service again
        return self.start_service(service_name)
    
    def _display_startup_summary(self) -> None:
        """Display startup summary"""
        print("\n" + "="*60)
        print("🎉 reVoAgent Full Stack Started Successfully!")
        print("="*60)
        print()
        
        print("📊 Service Status:")
        for service_name, service_info in self.running_services.items():
            port = service_info["port"]
            pid = service_info["pid"]
            uptime = int(time.time() - service_info["start_time"])
            print(f"   ✅ {service_name:12} | Port: {port:5} | PID: {pid:6} | Uptime: {uptime}s")
        
        print()
        print("🌐 Access URLs:")
        if "frontend" in self.running_services:
            frontend_port = self.running_services["frontend"]["port"]
            print(f"   Frontend:  http://localhost:{frontend_port}")
        
        if "backend" in self.running_services:
            backend_port = self.running_services["backend"]["port"]
            print(f"   Backend:   http://localhost:{backend_port}")
            print(f"   API Docs:  http://localhost:{backend_port}/docs")
            print(f"   Health:    http://localhost:{backend_port}/health")
        
        print()
        print("📁 Logs:")
        print(f"   Startup:   {self.logs_dir}/fullstack_startup.log")
        print(f"   Port Mgr:  {self.logs_dir}/port_manager.log")
        
        print()
        print("🛑 To stop all services:")
        print("   Ctrl+C or run: python scripts/enhanced_fullstack_startup.py --stop")
        print()
    
    def get_status(self) -> Dict:
        """Get current status of all services"""
        status = {
            "timestamp": time.time(),
            "services": {},
            "monitoring_active": self.monitoring_active,
            "total_services": len(self.running_services)
        }
        
        for service_name, service_info in self.running_services.items():
            status["services"][service_name] = {
                "port": service_info["port"],
                "pid": service_info["pid"],
                "uptime": int(time.time() - service_info["start_time"]),
                "healthy": self._check_service_health(service_name)
            }
        
        return status

def main():
    """Main CLI interface"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Enhanced reVoAgent Full Stack Manager')
    parser.add_argument('--start', action='store_true', help='Start all services')
    parser.add_argument('--stop', action='store_true', help='Stop all services')
    parser.add_argument('--restart', action='store_true', help='Restart all services')
    parser.add_argument('--status', action='store_true', help='Show service status')
    parser.add_argument('--service', type=str, help='Operate on specific service')
    parser.add_argument('--port', type=int, help='Use specific port')
    parser.add_argument('--monitor', action='store_true', help='Start monitoring mode')
    parser.add_argument('--json', action='store_true', help='Output in JSON format')
    parser.add_argument('--verbose', action='store_true', help='Verbose output')
    
    args = parser.parse_args()
    
    # Set logging level
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    # Initialize manager
    manager = FullStackManager()
    
    try:
        if args.stop:
            manager.shutdown_all_services()
        
        elif args.restart:
            manager.shutdown_all_services()
            time.sleep(5)
            success = manager.start_all_services()
            if not success:
                sys.exit(1)
        
        elif args.status:
            status = manager.get_status()
            if args.json:
                print(json.dumps(status, indent=2))
            else:
                print("📊 Service Status:")
                for service_name, service_info in status["services"].items():
                    health_icon = "✅" if service_info["healthy"] else "❌"
                    print(f"   {health_icon} {service_name:12} | Port: {service_info['port']:5} | "
                          f"PID: {service_info['pid']:6} | Uptime: {service_info['uptime']}s")
        
        elif args.service:
            if args.stop:
                manager._stop_service(args.service)
            else:
                success = manager.start_service(args.service, args.port)
                if not success:
                    sys.exit(1)
        
        elif args.monitor:
            print("🔍 Starting monitoring mode (Ctrl+C to stop)...")
            manager.start_monitoring()
            try:
                while True:
                    time.sleep(1)
            except KeyboardInterrupt:
                print("\n🛑 Stopping monitoring...")
                manager.stop_monitoring()
        
        else:
            # Default: start all services
            success = manager.start_all_services()
            if success:
                print("✅ Full stack started successfully!")
                print("Press Ctrl+C to stop all services...")
                try:
                    while True:
                        time.sleep(1)
                except KeyboardInterrupt:
                    print("\n🛑 Shutting down...")
                    manager.shutdown_all_services()
            else:
                print("❌ Failed to start full stack")
                sys.exit(1)
    
    except KeyboardInterrupt:
        print("\n🛑 Operation cancelled")
        manager.shutdown_all_services()
    except Exception as e:
        logger.error(f"❌ Error: {e}")
        if args.verbose:
            import traceback
            traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()