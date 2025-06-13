#!/usr/bin/env python3
"""
Enhanced Port Manager and Conflict Resolution System for reVoAgent
Provides intelligent port management, conflict detection, and automatic resolution
"""

import socket
import subprocess
import sys
import argparse
import json
import psutil
import time
import os
import signal
import threading
import logging
from typing import List, Dict, Optional, Tuple, Set
from dataclasses import dataclass, asdict
from pathlib import Path
import yaml
import requests
from contextlib import contextmanager

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('/workspace/reVoAgent/logs/port_manager.log', mode='a')
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class ServiceConfig:
    """Configuration for a service"""
    name: str
    port: int
    alternative_ports: List[int]
    process_patterns: List[str]
    health_check_url: Optional[str] = None
    startup_command: Optional[str] = None
    working_directory: Optional[str] = None
    environment: Optional[Dict[str, str]] = None
    dependencies: List[str] = None
    critical: bool = True
    auto_restart: bool = True
    max_restart_attempts: int = 3

@dataclass
class ProcessInfo:
    """Information about a process using a port"""
    pid: int
    name: str
    cmdline: str
    status: str
    cpu_percent: float
    memory_percent: float
    create_time: float
    is_revoagent: bool
    service_type: Optional[str] = None

@dataclass
class PortStatus:
    """Status of a port"""
    port: int
    is_free: bool
    processes: List[ProcessInfo]
    service_name: Optional[str] = None
    conflict_level: str = "none"  # none, low, medium, high, critical
    resolution_strategy: Optional[str] = None

class EnhancedPortManager:
    """Enhanced port manager with intelligent conflict resolution"""
    
    def __init__(self, config_path: Optional[str] = None):
        self.project_root = Path("/workspace/reVoAgent")
        self.logs_dir = self.project_root / "logs"
        self.logs_dir.mkdir(exist_ok=True)
        
        # Load configuration
        self.config = self._load_config(config_path)
        self.services = self._load_services_config()
        
        # Runtime state
        self.monitored_processes: Dict[str, int] = {}
        self.port_reservations: Dict[int, str] = {}
        self.conflict_history: List[Dict] = []
        
        # Monitoring thread
        self._monitoring_active = False
        self._monitor_thread = None
        
    def _load_config(self, config_path: Optional[str]) -> Dict:
        """Load configuration from file or use defaults"""
        default_config = {
            "monitoring": {
                "enabled": True,
                "interval": 30,
                "auto_resolve_conflicts": True,
                "notification_webhook": None
            },
            "conflict_resolution": {
                "strategy": "intelligent",  # conservative, aggressive, intelligent
                "allow_port_migration": True,
                "preserve_external_processes": True,
                "max_alternative_ports": 10
            },
            "health_checks": {
                "enabled": True,
                "timeout": 10,
                "retry_attempts": 3,
                "retry_delay": 2
            },
            "logging": {
                "level": "INFO",
                "max_file_size": "10MB",
                "backup_count": 5
            }
        }
        
        if config_path and Path(config_path).exists():
            try:
                with open(config_path, 'r') as f:
                    user_config = yaml.safe_load(f)
                    default_config.update(user_config)
            except Exception as e:
                logger.warning(f"Failed to load config from {config_path}: {e}")
        
        return default_config
    
    def _load_services_config(self) -> Dict[str, ServiceConfig]:
        """Load services configuration"""
        services = {
            "backend": ServiceConfig(
                name="backend",
                port=8000,
                alternative_ports=[8001, 8002, 8003, 12001, 12002],
                process_patterns=[
                    "python.*simple_backend_server",
                    "python.*apps/backend/main",
                    "uvicorn.*main:app",
                    "python.*main.py.*8000"
                ],
                health_check_url="http://localhost:{port}/health",
                startup_command="python simple_backend_server.py",
                working_directory=str(self.project_root),
                critical=True
            ),
            "frontend": ServiceConfig(
                name="frontend",
                port=12000,
                alternative_ports=[3000, 3001, 3002, 12000, 12001, 14000, 14001],
                process_patterns=[
                    "npm.*dev",
                    "vite.*--port.*{port}",
                    "node.*vite.*{port}",
                    "yarn.*dev"
                ],
                health_check_url="http://localhost:{port}",
                startup_command="npm run dev -- --host 0.0.0.0 --port {port}",
                working_directory=str(self.project_root / "frontend"),
                dependencies=["backend"],
                critical=True
            ),
            "memory_api": ServiceConfig(
                name="memory_api",
                port=8001,
                alternative_ports=[8002, 8003, 8004, 8005],
                process_patterns=[
                    "python.*memory.*api",
                    "python.*cognee.*server"
                ],
                health_check_url="http://localhost:{port}/api/memory/health",
                critical=False
            ),
            "three_engine": ServiceConfig(
                name="three_engine",
                port=8002,
                alternative_ports=[8003, 8004, 8005, 8006],
                process_patterns=[
                    "python.*three_engine",
                    "python.*start_three_engine"
                ],
                health_check_url="http://localhost:{port}/engines/status",
                critical=False
            ),
            "websocket": ServiceConfig(
                name="websocket",
                port=8080,
                alternative_ports=[8081, 8082, 8083, 8084],
                process_patterns=[
                    "python.*websocket",
                    "node.*socket.io"
                ],
                critical=False
            )
        }
        
        return services
    
    def is_port_free(self, port: int, host: str = 'localhost') -> bool:
        """Check if a port is free with enhanced detection"""
        try:
            # Try to bind to the port
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
                sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
                sock.bind((host, port))
                return True
        except OSError:
            return False
    
    def find_free_port(self, start_port: int = 8000, max_attempts: int = 100, 
                      exclude_ports: Set[int] = None) -> Optional[int]:
        """Find the next available port with exclusion list"""
        exclude_ports = exclude_ports or set()
        
        for port in range(start_port, start_port + max_attempts):
            if port in exclude_ports:
                continue
            if self.is_port_free(port):
                return port
        return None
    
    def get_detailed_port_info(self, port: int) -> PortStatus:
        """Get comprehensive information about a port"""
        processes = []
        is_free = self.is_port_free(port)
        
        if not is_free:
            try:
                for conn in psutil.net_connections():
                    if hasattr(conn, 'laddr') and conn.laddr and conn.laddr.port == port:
                        try:
                            process = psutil.Process(conn.pid)
                            cmdline = ' '.join(process.cmdline())
                            
                            # Determine if it's a reVoAgent process
                            is_revoagent = self._is_revoagent_process(cmdline)
                            service_type = self._identify_service_type(cmdline, port)
                            
                            proc_info = ProcessInfo(
                                pid=conn.pid,
                                name=process.name(),
                                cmdline=cmdline,
                                status=conn.status,
                                cpu_percent=process.cpu_percent(),
                                memory_percent=process.memory_percent(),
                                create_time=process.create_time(),
                                is_revoagent=is_revoagent,
                                service_type=service_type
                            )
                            processes.append(proc_info)
                            
                        except (psutil.NoSuchProcess, psutil.AccessDenied) as e:
                            logger.warning(f"Could not get process info for PID {conn.pid}: {e}")
                            
            except Exception as e:
                logger.error(f"Error getting port info for {port}: {e}")
        
        # Determine conflict level and resolution strategy
        conflict_level = self._assess_conflict_level(port, processes)
        resolution_strategy = self._determine_resolution_strategy(port, processes, conflict_level)
        service_name = self._get_service_name_for_port(port)
        
        return PortStatus(
            port=port,
            is_free=is_free,
            processes=processes,
            service_name=service_name,
            conflict_level=conflict_level,
            resolution_strategy=resolution_strategy
        )
    
    def _is_revoagent_process(self, cmdline: str) -> bool:
        """Determine if a process belongs to reVoAgent"""
        revoagent_indicators = [
            'revoagent', 'simple_backend_server', 'three_engine',
            'apps/backend/main', 'frontend/src', 'vite.*reVoAgent',
            'npm.*dev.*reVoAgent', 'cognee', 'memory.*api'
        ]
        
        cmdline_lower = cmdline.lower()
        return any(indicator in cmdline_lower for indicator in revoagent_indicators)
    
    def _identify_service_type(self, cmdline: str, port: int) -> Optional[str]:
        """Identify which reVoAgent service a process belongs to"""
        for service_name, service_config in self.services.items():
            if port == service_config.port:
                return service_name
            
            for pattern in service_config.process_patterns:
                pattern_formatted = pattern.format(port=port)
                if self._matches_pattern(cmdline, pattern_formatted):
                    return service_name
        
        return None
    
    def _matches_pattern(self, text: str, pattern: str) -> bool:
        """Check if text matches a pattern (simple regex-like matching)"""
        import re
        try:
            return bool(re.search(pattern, text, re.IGNORECASE))
        except re.error:
            return pattern.lower() in text.lower()
    
    def _assess_conflict_level(self, port: int, processes: List[ProcessInfo]) -> str:
        """Assess the severity of a port conflict"""
        if not processes:
            return "none"
        
        # Check if it's a critical service port
        service_name = self._get_service_name_for_port(port)
        is_critical_port = service_name and self.services.get(service_name, {}).critical
        
        # Check process characteristics
        has_external_process = any(not proc.is_revoagent for proc in processes)
        has_high_resource_usage = any(
            proc.cpu_percent > 50 or proc.memory_percent > 30 
            for proc in processes
        )
        
        if is_critical_port and has_external_process:
            return "critical"
        elif has_external_process:
            return "high"
        elif has_high_resource_usage:
            return "medium"
        else:
            return "low"
    
    def _determine_resolution_strategy(self, port: int, processes: List[ProcessInfo], 
                                     conflict_level: str) -> Optional[str]:
        """Determine the best resolution strategy for a conflict"""
        if not processes:
            return None
        
        strategy = self.config["conflict_resolution"]["strategy"]
        preserve_external = self.config["conflict_resolution"]["preserve_external_processes"]
        
        has_external = any(not proc.is_revoagent for proc in processes)
        has_revoagent = any(proc.is_revoagent for proc in processes)
        
        if strategy == "conservative":
            if has_external and preserve_external:
                return "migrate_service"
            elif has_revoagent:
                return "restart_revoagent"
            else:
                return "migrate_service"
        
        elif strategy == "aggressive":
            if conflict_level in ["critical", "high"]:
                return "terminate_conflicting"
            else:
                return "restart_revoagent"
        
        else:  # intelligent
            if has_external and preserve_external:
                return "migrate_service"
            elif has_revoagent and not has_external:
                return "restart_revoagent"
            elif conflict_level == "critical":
                return "terminate_conflicting"
            else:
                return "migrate_service"
    
    def _get_service_name_for_port(self, port: int) -> Optional[str]:
        """Get the service name that should use this port"""
        for service_name, service_config in self.services.items():
            if port == service_config.port or port in service_config.alternative_ports:
                return service_name
        return None
    
    def resolve_port_conflict(self, port: int, strategy: Optional[str] = None) -> Dict:
        """Resolve a specific port conflict"""
        port_status = self.get_detailed_port_info(port)
        
        if port_status.is_free:
            return {"status": "no_conflict", "port": port}
        
        strategy = strategy or port_status.resolution_strategy
        service_name = port_status.service_name
        
        logger.info(f"Resolving conflict on port {port} using strategy: {strategy}")
        
        result = {"port": port, "strategy": strategy, "actions": []}
        
        try:
            if strategy == "migrate_service":
                new_port = self._migrate_service(service_name, port)
                result["new_port"] = new_port
                result["status"] = "migrated"
                result["actions"].append(f"Migrated {service_name} to port {new_port}")
            
            elif strategy == "restart_revoagent":
                self._restart_revoagent_processes(port_status.processes)
                result["status"] = "restarted"
                result["actions"].append("Restarted reVoAgent processes")
            
            elif strategy == "terminate_conflicting":
                terminated = self._terminate_processes(port_status.processes)
                result["status"] = "terminated"
                result["actions"].append(f"Terminated {len(terminated)} processes")
                result["terminated_pids"] = terminated
            
            else:
                result["status"] = "no_action"
                result["reason"] = "No suitable resolution strategy"
            
            # Record conflict in history
            self.conflict_history.append({
                "timestamp": time.time(),
                "port": port,
                "strategy": strategy,
                "result": result,
                "processes": [asdict(proc) for proc in port_status.processes]
            })
            
        except Exception as e:
            logger.error(f"Failed to resolve conflict on port {port}: {e}")
            result["status"] = "failed"
            result["error"] = str(e)
        
        return result
    
    def _migrate_service(self, service_name: str, current_port: int) -> Optional[int]:
        """Migrate a service to an alternative port"""
        if not service_name or service_name not in self.services:
            return None
        
        service_config = self.services[service_name]
        
        # Find a free alternative port
        for alt_port in service_config.alternative_ports:
            if self.is_port_free(alt_port):
                logger.info(f"Migrating {service_name} from {current_port} to {alt_port}")
                
                # Update port reservation
                self.port_reservations[alt_port] = service_name
                if current_port in self.port_reservations:
                    del self.port_reservations[current_port]
                
                return alt_port
        
        # If no predefined alternatives, find any free port
        start_port = max(service_config.alternative_ports) + 1 if service_config.alternative_ports else current_port + 1
        free_port = self.find_free_port(start_port)
        
        if free_port:
            logger.info(f"Migrating {service_name} from {current_port} to {free_port} (dynamic)")
            self.port_reservations[free_port] = service_name
            return free_port
        
        return None
    
    def _restart_revoagent_processes(self, processes: List[ProcessInfo]) -> List[int]:
        """Restart reVoAgent processes gracefully"""
        restarted_pids = []
        
        for proc in processes:
            if proc.is_revoagent:
                try:
                    logger.info(f"Restarting reVoAgent process {proc.pid} ({proc.name})")
                    
                    # Try graceful termination first
                    process = psutil.Process(proc.pid)
                    process.terminate()
                    
                    # Wait for termination
                    try:
                        process.wait(timeout=10)
                    except psutil.TimeoutExpired:
                        logger.warning(f"Process {proc.pid} didn't terminate gracefully, force killing")
                        process.kill()
                        process.wait(timeout=5)
                    
                    restarted_pids.append(proc.pid)
                    
                    # If it's a known service, attempt to restart it
                    if proc.service_type and proc.service_type in self.services:
                        self._start_service(proc.service_type)
                    
                except (psutil.NoSuchProcess, psutil.AccessDenied) as e:
                    logger.warning(f"Could not restart process {proc.pid}: {e}")
        
        return restarted_pids
    
    def _terminate_processes(self, processes: List[ProcessInfo], force: bool = False) -> List[int]:
        """Terminate processes with safety checks"""
        terminated_pids = []
        
        for proc in processes:
            try:
                # Safety check for critical system processes
                if self._is_critical_system_process(proc):
                    logger.warning(f"Skipping critical system process {proc.pid} ({proc.name})")
                    continue
                
                logger.info(f"Terminating process {proc.pid} ({proc.name})")
                
                process = psutil.Process(proc.pid)
                
                if force:
                    process.kill()
                else:
                    process.terminate()
                
                # Wait for termination
                try:
                    process.wait(timeout=10)
                    terminated_pids.append(proc.pid)
                except psutil.TimeoutExpired:
                    if not force:
                        logger.warning(f"Process {proc.pid} didn't terminate, force killing")
                        process.kill()
                        process.wait(timeout=5)
                        terminated_pids.append(proc.pid)
                
            except (psutil.NoSuchProcess, psutil.AccessDenied) as e:
                logger.warning(f"Could not terminate process {proc.pid}: {e}")
        
        return terminated_pids
    
    def cleanup_revoagent_ports(self) -> Dict:
        """Clean up all ports used by reVoAgent processes"""
        logger.info("🧹 Cleaning up reVoAgent ports...")
        
        occupied_ports = []
        for service_name, service_config in self.services.items():
            port_info = self.get_detailed_port_info(service_config.port)
            if not port_info.is_free:
                # Check if any processes are reVoAgent-owned
                has_revoagent = any(proc.is_revoagent for proc in port_info.processes)
                if has_revoagent:
                    occupied_ports.append(service_config.port)
        
        if occupied_ports:
            logger.info(f"🔍 Found reVoAgent processes on ports: {occupied_ports}")
            results = {}
            for port in occupied_ports:
                port_info = self.get_detailed_port_info(port)
                revoagent_processes = [proc for proc in port_info.processes if proc.is_revoagent]
                if revoagent_processes:
                    terminated_pids = self._terminate_processes(revoagent_processes)
                    results[port] = f"freed (killed {len(terminated_pids)} processes)"
                else:
                    results[port] = "no_revoagent_processes"
            return results
        else:
            logger.info("✅ No reVoAgent processes found on default ports")
            return {}
    
    def _is_critical_system_process(self, proc: ProcessInfo) -> bool:
        """Check if a process is critical to the system"""
        critical_processes = [
            'systemd', 'kernel', 'init', 'ssh', 'dbus', 'networkmanager',
            'docker', 'containerd', 'kubelet', 'postgres', 'redis-server'
        ]
        
        return any(critical in proc.name.lower() for critical in critical_processes)
    
    def _start_service(self, service_name: str, port: Optional[int] = None) -> bool:
        """Start a service with the given configuration"""
        if service_name not in self.services:
            logger.error(f"Unknown service: {service_name}")
            return False
        
        service_config = self.services[service_name]
        
        if not service_config.startup_command:
            logger.warning(f"No startup command defined for {service_name}")
            return False
        
        # Use provided port or find a free one
        if port is None:
            port = service_config.port
            if not self.is_port_free(port):
                port = self.find_free_port(port)
                if port is None:
                    logger.error(f"Could not find free port for {service_name}")
                    return False
        
        # Format command with port
        command = service_config.startup_command.format(port=port)
        working_dir = service_config.working_directory or str(self.project_root)
        
        try:
            logger.info(f"Starting {service_name} on port {port}: {command}")
            
            # Start process
            env = os.environ.copy()
            if service_config.environment:
                env.update(service_config.environment)
            
            process = subprocess.Popen(
                command.split(),
                cwd=working_dir,
                env=env,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            
            # Store process info
            self.monitored_processes[service_name] = process.pid
            self.port_reservations[port] = service_name
            
            # Wait a moment and check if process is still running
            time.sleep(2)
            if process.poll() is None:
                logger.info(f"Successfully started {service_name} (PID: {process.pid})")
                return True
            else:
                stdout, stderr = process.communicate()
                logger.error(f"Failed to start {service_name}: {stderr.decode()}")
                return False
                
        except Exception as e:
            logger.error(f"Error starting {service_name}: {e}")
            return False
    
    def health_check_service(self, service_name: str, port: Optional[int] = None) -> bool:
        """Perform health check on a service"""
        if service_name not in self.services:
            return False
        
        service_config = self.services[service_name]
        
        if not service_config.health_check_url:
            # If no health check URL, just check if port is in use
            check_port = port or service_config.port
            return not self.is_port_free(check_port)
        
        check_port = port or service_config.port
        health_url = service_config.health_check_url.format(port=check_port)
        
        try:
            response = requests.get(
                health_url, 
                timeout=self.config["health_checks"]["timeout"]
            )
            return response.status_code == 200
        except Exception as e:
            logger.debug(f"Health check failed for {service_name}: {e}")
            return False
    
    def comprehensive_port_scan(self) -> Dict[str, PortStatus]:
        """Perform comprehensive scan of all service ports"""
        results = {}
        
        for service_name, service_config in self.services.items():
            # Check primary port
            port_status = self.get_detailed_port_info(service_config.port)
            results[f"{service_name}_primary"] = port_status
            
            # Check alternative ports if primary is occupied
            if not port_status.is_free:
                for alt_port in service_config.alternative_ports[:3]:  # Check first 3 alternatives
                    alt_status = self.get_detailed_port_info(alt_port)
                    if alt_status.is_free:
                        results[f"{service_name}_alt_{alt_port}"] = alt_status
                        break
        
        return results
    
    def auto_resolve_all_conflicts(self) -> Dict:
        """Automatically resolve all detected port conflicts"""
        logger.info("Starting automatic conflict resolution...")
        
        scan_results = self.comprehensive_port_scan()
        conflicts = {
            name: status for name, status in scan_results.items() 
            if not status.is_free and status.conflict_level != "none"
        }
        
        if not conflicts:
            logger.info("No conflicts detected")
            return {"status": "no_conflicts", "conflicts_resolved": 0}
        
        logger.info(f"Found {len(conflicts)} conflicts to resolve")
        
        resolution_results = {}
        resolved_count = 0
        
        # Sort conflicts by severity (critical first)
        severity_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
        sorted_conflicts = sorted(
            conflicts.items(),
            key=lambda x: severity_order.get(x[1].conflict_level, 4)
        )
        
        for conflict_name, port_status in sorted_conflicts:
            try:
                result = self.resolve_port_conflict(port_status.port)
                resolution_results[conflict_name] = result
                
                if result["status"] in ["migrated", "restarted", "terminated"]:
                    resolved_count += 1
                    logger.info(f"Resolved conflict: {conflict_name}")
                
            except Exception as e:
                logger.error(f"Failed to resolve conflict {conflict_name}: {e}")
                resolution_results[conflict_name] = {"status": "failed", "error": str(e)}
        
        return {
            "status": "completed",
            "conflicts_found": len(conflicts),
            "conflicts_resolved": resolved_count,
            "results": resolution_results
        }
    
    def start_monitoring(self) -> None:
        """Start continuous port monitoring"""
        if self._monitoring_active:
            logger.warning("Monitoring is already active")
            return
        
        self._monitoring_active = True
        self._monitor_thread = threading.Thread(target=self._monitoring_loop, daemon=True)
        self._monitor_thread.start()
        logger.info("Started port monitoring")
    
    def stop_monitoring(self) -> None:
        """Stop continuous port monitoring"""
        self._monitoring_active = False
        if self._monitor_thread:
            self._monitor_thread.join(timeout=5)
        logger.info("Stopped port monitoring")
    
    def _monitoring_loop(self) -> None:
        """Main monitoring loop"""
        interval = self.config["monitoring"]["interval"]
        auto_resolve = self.config["monitoring"]["auto_resolve_conflicts"]
        
        while self._monitoring_active:
            try:
                # Check for conflicts
                scan_results = self.comprehensive_port_scan()
                conflicts = [
                    status for status in scan_results.values() 
                    if not status.is_free and status.conflict_level in ["high", "critical"]
                ]
                
                if conflicts and auto_resolve:
                    logger.info(f"Detected {len(conflicts)} high-priority conflicts, auto-resolving...")
                    self.auto_resolve_all_conflicts()
                
                # Check health of monitored services
                for service_name in self.monitored_processes:
                    if not self.health_check_service(service_name):
                        logger.warning(f"Health check failed for {service_name}")
                
                time.sleep(interval)
                
            except Exception as e:
                logger.error(f"Error in monitoring loop: {e}")
                time.sleep(interval)
    
    def generate_port_report(self) -> Dict:
        """Generate comprehensive port usage report"""
        scan_results = self.comprehensive_port_scan()
        
        report = {
            "timestamp": time.time(),
            "total_ports_checked": len(scan_results),
            "free_ports": sum(1 for status in scan_results.values() if status.is_free),
            "occupied_ports": sum(1 for status in scan_results.values() if not status.is_free),
            "conflicts_by_level": {},
            "revoagent_processes": 0,
            "external_processes": 0,
            "services_status": {},
            "recommendations": []
        }
        
        # Analyze conflicts by level
        for status in scan_results.values():
            level = status.conflict_level
            if level not in report["conflicts_by_level"]:
                report["conflicts_by_level"][level] = 0
            report["conflicts_by_level"][level] += 1
        
        # Count process types
        for status in scan_results.values():
            for proc in status.processes:
                if proc.is_revoagent:
                    report["revoagent_processes"] += 1
                else:
                    report["external_processes"] += 1
        
        # Service status
        for service_name in self.services:
            is_healthy = self.health_check_service(service_name)
            report["services_status"][service_name] = {
                "healthy": is_healthy,
                "port": self.services[service_name].port
            }
        
        # Generate recommendations
        if report["conflicts_by_level"].get("critical", 0) > 0:
            report["recommendations"].append("Critical port conflicts detected - immediate resolution required")
        
        if report["external_processes"] > report["revoagent_processes"]:
            report["recommendations"].append("Consider using alternative ports to avoid external conflicts")
        
        if not all(status["healthy"] for status in report["services_status"].values()):
            report["recommendations"].append("Some services are unhealthy - check logs and restart if needed")
        
        return report
    
    def export_configuration(self, filepath: str) -> None:
        """Export current configuration to file"""
        config_data = {
            "services": {name: asdict(config) for name, config in self.services.items()},
            "port_reservations": self.port_reservations,
            "conflict_history": self.conflict_history[-10:],  # Last 10 conflicts
            "config": self.config
        }
        
        with open(filepath, 'w') as f:
            yaml.dump(config_data, f, default_flow_style=False)
        
        logger.info(f"Configuration exported to {filepath}")

def main():
    """Main CLI interface"""
    parser = argparse.ArgumentParser(description='Enhanced reVoAgent Port Manager')
    
    # Basic operations
    parser.add_argument('--scan', action='store_true', help='Comprehensive port scan')
    parser.add_argument('--resolve', action='store_true', help='Auto-resolve all conflicts')
    parser.add_argument('--cleanup', action='store_true', help='Clean up reVoAgent ports')
    parser.add_argument('--monitor', action='store_true', help='Start continuous monitoring')
    parser.add_argument('--report', action='store_true', help='Generate detailed report')
    
    # Specific operations
    parser.add_argument('--port', type=int, help='Check specific port')
    parser.add_argument('--service', type=str, help='Check specific service')
    parser.add_argument('--kill-port', type=int, help='Kill processes on specific port')
    parser.add_argument('--start-service', type=str, help='Start specific service')
    parser.add_argument('--health-check', type=str, help='Health check for service')
    
    # Configuration
    parser.add_argument('--config', type=str, help='Configuration file path')
    parser.add_argument('--export-config', type=str, help='Export configuration to file')
    
    # Output options
    parser.add_argument('--json', action='store_true', help='Output in JSON format')
    parser.add_argument('--verbose', action='store_true', help='Verbose output')
    
    args = parser.parse_args()
    
    # Set logging level
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    # Initialize manager
    manager = EnhancedPortManager(args.config)
    
    try:
        if args.cleanup:
            results = manager.cleanup_revoagent_ports()
            if args.json:
                print(json.dumps(results, indent=2))
            else:
                print("✅ Cleanup completed")
                for port, result in results.items():
                    print(f"  Port {port}: {result}")
        
        elif args.scan:
            results = manager.comprehensive_port_scan()
            if args.json:
                print(json.dumps({name: asdict(status) for name, status in results.items()}, indent=2))
            else:
                print("🔍 Comprehensive Port Scan Results")
                print("=" * 50)
                for name, status in results.items():
                    status_icon = "🟢" if status.is_free else "🔴"
                    conflict_info = f" ({status.conflict_level})" if status.conflict_level != "none" else ""
                    print(f"{status_icon} {name}: Port {status.port}{conflict_info}")
                    
                    if status.processes:
                        for proc in status.processes[:2]:  # Show first 2 processes
                            revo_indicator = "🤖" if proc.is_revoagent else "🔧"
                            print(f"    {revo_indicator} PID {proc.pid}: {proc.name}")
        
        elif args.resolve:
            results = manager.auto_resolve_all_conflicts()
            if args.json:
                print(json.dumps(results, indent=2))
            else:
                print(f"🔧 Conflict Resolution Complete")
                print(f"   Conflicts found: {results['conflicts_found']}")
                print(f"   Conflicts resolved: {results['conflicts_resolved']}")
        
        elif args.monitor:
            print("🔍 Starting continuous monitoring (Ctrl+C to stop)...")
            manager.start_monitoring()
            try:
                while True:
                    time.sleep(1)
            except KeyboardInterrupt:
                print("\n🛑 Stopping monitoring...")
                manager.stop_monitoring()
        
        elif args.report:
            report = manager.generate_port_report()
            if args.json:
                print(json.dumps(report, indent=2))
            else:
                print("📊 Port Usage Report")
                print("=" * 30)
                print(f"Total ports checked: {report['total_ports_checked']}")
                print(f"Free ports: {report['free_ports']}")
                print(f"Occupied ports: {report['occupied_ports']}")
                print(f"reVoAgent processes: {report['revoagent_processes']}")
                print(f"External processes: {report['external_processes']}")
                
                if report['recommendations']:
                    print("\n💡 Recommendations:")
                    for rec in report['recommendations']:
                        print(f"   • {rec}")
        
        elif args.port:
            status = manager.get_detailed_port_info(args.port)
            if args.json:
                print(json.dumps(asdict(status), indent=2))
            else:
                status_text = "FREE" if status.is_free else "OCCUPIED"
                print(f"Port {args.port}: {status_text}")
                if status.processes:
                    print("Processes:")
                    for proc in status.processes:
                        revo_indicator = "🤖" if proc.is_revoagent else "🔧"
                        print(f"  {revo_indicator} PID {proc.pid}: {proc.name} - {proc.cmdline[:60]}...")
        
        elif args.service:
            if args.service in manager.services:
                is_healthy = manager.health_check_service(args.service)
                service_config = manager.services[args.service]
                port_status = manager.get_detailed_port_info(service_config.port)
                
                print(f"Service: {args.service}")
                print(f"Port: {service_config.port}")
                print(f"Health: {'✅ Healthy' if is_healthy else '❌ Unhealthy'}")
                print(f"Port Status: {'🟢 Free' if port_status.is_free else '🔴 Occupied'}")
            else:
                print(f"Unknown service: {args.service}")
                print(f"Available services: {', '.join(manager.services.keys())}")
        
        elif args.kill_port:
            status = manager.get_detailed_port_info(args.kill_port)
            if status.processes:
                terminated = manager._terminate_processes(status.processes)
                print(f"Terminated {len(terminated)} processes on port {args.kill_port}")
            else:
                print(f"No processes found on port {args.kill_port}")
        
        elif args.start_service:
            if args.start_service in manager.services:
                success = manager._start_service(args.start_service)
                if success:
                    print(f"✅ Started {args.start_service}")
                else:
                    print(f"❌ Failed to start {args.start_service}")
            else:
                print(f"Unknown service: {args.start_service}")
        
        elif args.health_check:
            if args.health_check in manager.services:
                is_healthy = manager.health_check_service(args.health_check)
                print(f"{args.health_check}: {'✅ Healthy' if is_healthy else '❌ Unhealthy'}")
            else:
                print(f"Unknown service: {args.health_check}")
        
        elif args.export_config:
            manager.export_configuration(args.export_config)
            print(f"Configuration exported to {args.export_config}")
        
        else:
            # Default: show status and basic recommendations
            print("🔍 Enhanced reVoAgent Port Manager")
            print("=" * 40)
            
            scan_results = manager.comprehensive_port_scan()
            conflicts = sum(1 for status in scan_results.values() if not status.is_free)
            
            if conflicts > 0:
                print(f"⚠️  Found {conflicts} port conflicts")
                print("Run with --resolve to auto-fix conflicts")
            else:
                print("✅ No port conflicts detected")
            
            print("\nService Status:")
            for service_name in manager.services:
                is_healthy = manager.health_check_service(service_name)
                port = manager.services[service_name].port
                status_icon = "✅" if is_healthy else "❌"
                print(f"  {status_icon} {service_name:12} (port {port})")
            
            print(f"\nUse --help for more options")
    
    except KeyboardInterrupt:
        print("\n🛑 Operation cancelled")
    except Exception as e:
        logger.error(f"Error: {e}")
        if args.verbose:
            import traceback
            traceback.print_exc()

if __name__ == '__main__':
    main()