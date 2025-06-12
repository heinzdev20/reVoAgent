#!/usr/bin/env python3
"""
reVoAgent Port Management and Conflict Resolution System
Comprehensive port management for Three-Engine Architecture
"""

import os
import sys
import socket
import subprocess
import time
import psutil
from typing import Dict, List, Optional, Tuple
from pathlib import Path
import json
import logging

class PortManager:
    """Advanced port management with conflict resolution"""
    
    def __init__(self):
        self.project_root = Path(__file__).parent
        self.config_file = self.project_root / 'port_config.json'
        self.default_ports = {
            'backend': 12001,
            'frontend': 12000,
            'postgres': 5432,
            'redis': 6379,
            'prometheus': 9090,
            'grafana': 3001,
            'elasticsearch': 9200,
            'kibana': 5601,
            'nginx': 80,
            'nginx_ssl': 443
        }
        self.port_ranges = {
            'backend': (12001, 12010),
            'frontend': (12000, 12010),
            'monitoring': (9000, 9100),
            'databases': (5400, 5500),
            'cache': (6300, 6400)
        }
        self.active_ports = {}
        self.setup_logging()
    
    def setup_logging(self):
        """Setup logging for port management"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger('PortManager')
    
    def is_port_available(self, port: int, host: str = 'localhost') -> bool:
        """Check if a port is available"""
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
                sock.settimeout(1)
                result = sock.connect_ex((host, port))
                return result != 0
        except Exception as e:
            self.logger.warning(f"Error checking port {port}: {e}")
            return False
    
    def find_available_port(self, start_port: int, end_port: int) -> Optional[int]:
        """Find the first available port in a range"""
        for port in range(start_port, end_port + 1):
            if self.is_port_available(port):
                return port
        return None
    
    def get_port_usage(self, port: int) -> List[Dict]:
        """Get detailed information about what's using a port"""
        usage_info = []
        
        try:
            for conn in psutil.net_connections():
                if conn.laddr.port == port:
                    try:
                        process = psutil.Process(conn.pid)
                        usage_info.append({
                            'pid': conn.pid,
                            'name': process.name(),
                            'cmdline': ' '.join(process.cmdline()),
                            'status': conn.status,
                            'type': conn.type.name if hasattr(conn.type, 'name') else str(conn.type)
                        })
                    except (psutil.NoSuchProcess, psutil.AccessDenied):
                        usage_info.append({
                            'pid': conn.pid,
                            'name': 'Unknown',
                            'cmdline': 'Access denied',
                            'status': conn.status,
                            'type': conn.type.name if hasattr(conn.type, 'name') else str(conn.type)
                        })
        except Exception as e:
            self.logger.error(f"Error getting port usage for {port}: {e}")
        
        return usage_info
    
    def kill_port_processes(self, port: int, force: bool = False) -> bool:
        """Kill processes using a specific port"""
        usage_info = self.get_port_usage(port)
        
        if not usage_info:
            self.logger.info(f"No processes found using port {port}")
            return True
        
        killed_processes = []
        
        for proc_info in usage_info:
            try:
                pid = proc_info['pid']
                process = psutil.Process(pid)
                
                self.logger.info(f"Killing process {pid} ({proc_info['name']}) using port {port}")
                
                if force:
                    process.kill()
                else:
                    process.terminate()
                
                # Wait for process to terminate
                try:
                    process.wait(timeout=5)
                    killed_processes.append(pid)
                except psutil.TimeoutExpired:
                    if not force:
                        self.logger.warning(f"Process {pid} didn't terminate, force killing...")
                        process.kill()
                        process.wait(timeout=2)
                        killed_processes.append(pid)
                
            except (psutil.NoSuchProcess, psutil.AccessDenied) as e:
                self.logger.warning(f"Could not kill process {proc_info['pid']}: {e}")
        
        # Verify port is now available
        time.sleep(1)
        if self.is_port_available(port):
            self.logger.info(f"Port {port} is now available")
            return True
        else:
            self.logger.error(f"Port {port} is still in use after killing processes")
            return False
    
    def resolve_port_conflict(self, service: str, preferred_port: int) -> int:
        """Resolve port conflicts for a service"""
        self.logger.info(f"Resolving port conflict for {service} on port {preferred_port}")
        
        # Check if preferred port is available
        if self.is_port_available(preferred_port):
            self.logger.info(f"Port {preferred_port} is available for {service}")
            return preferred_port
        
        # Get information about what's using the port
        usage_info = self.get_port_usage(preferred_port)
        self.logger.info(f"Port {preferred_port} is in use by: {usage_info}")
        
        # Check if it's our own service
        our_services = ['uvicorn', 'three_engine_main', 'vite', 'node']
        for proc_info in usage_info:
            if any(service_name in proc_info['cmdline'].lower() for service_name in our_services):
                self.logger.info(f"Port {preferred_port} is used by our service, attempting to reclaim...")
                if self.kill_port_processes(preferred_port):
                    return preferred_port
        
        # Find alternative port
        if service in self.port_ranges:
            start_port, end_port = self.port_ranges[service]
            alternative_port = self.find_available_port(start_port, end_port)
            
            if alternative_port:
                self.logger.info(f"Using alternative port {alternative_port} for {service}")
                return alternative_port
        
        # Find any available port in a reasonable range
        alternative_port = self.find_available_port(preferred_port + 1, preferred_port + 100)
        if alternative_port:
            self.logger.info(f"Using fallback port {alternative_port} for {service}")
            return alternative_port
        
        raise RuntimeError(f"Could not find available port for {service}")
    
    def allocate_ports(self) -> Dict[str, int]:
        """Allocate ports for all services with conflict resolution"""
        allocated_ports = {}
        
        for service, preferred_port in self.default_ports.items():
            try:
                allocated_port = self.resolve_port_conflict(service, preferred_port)
                allocated_ports[service] = allocated_port
                self.active_ports[service] = allocated_port
                self.logger.info(f"Allocated port {allocated_port} for {service}")
            except Exception as e:
                self.logger.error(f"Failed to allocate port for {service}: {e}")
                raise
        
        # Save configuration
        self.save_port_config(allocated_ports)
        return allocated_ports
    
    def save_port_config(self, ports: Dict[str, int]):
        """Save port configuration to file"""
        config = {
            'ports': ports,
            'timestamp': time.time(),
            'pid': os.getpid()
        }
        
        try:
            with open(self.config_file, 'w') as f:
                json.dump(config, f, indent=2)
            self.logger.info(f"Port configuration saved to {self.config_file}")
        except Exception as e:
            self.logger.error(f"Failed to save port configuration: {e}")
    
    def load_port_config(self) -> Optional[Dict[str, int]]:
        """Load port configuration from file"""
        try:
            if self.config_file.exists():
                with open(self.config_file, 'r') as f:
                    config = json.load(f)
                
                # Check if configuration is recent (within 1 hour)
                if time.time() - config.get('timestamp', 0) < 3600:
                    self.logger.info("Loaded existing port configuration")
                    return config.get('ports', {})
                else:
                    self.logger.info("Port configuration is stale, will regenerate")
        except Exception as e:
            self.logger.warning(f"Failed to load port configuration: {e}")
        
        return None
    
    def cleanup_ports(self):
        """Cleanup ports used by our services"""
        self.logger.info("Cleaning up allocated ports...")
        
        for service, port in self.active_ports.items():
            usage_info = self.get_port_usage(port)
            
            # Only kill our own processes
            our_services = ['uvicorn', 'three_engine_main', 'vite', 'node']
            for proc_info in usage_info:
                if any(service_name in proc_info['cmdline'].lower() for service_name in our_services):
                    try:
                        process = psutil.Process(proc_info['pid'])
                        self.logger.info(f"Terminating {service} process {proc_info['pid']}")
                        process.terminate()
                        process.wait(timeout=5)
                    except Exception as e:
                        self.logger.warning(f"Failed to terminate process {proc_info['pid']}: {e}")
        
        # Remove configuration file
        try:
            if self.config_file.exists():
                self.config_file.unlink()
                self.logger.info("Port configuration file removed")
        except Exception as e:
            self.logger.warning(f"Failed to remove port configuration file: {e}")
    
    def get_service_urls(self, ports: Dict[str, int]) -> Dict[str, str]:
        """Generate service URLs from allocated ports"""
        urls = {}
        
        if 'frontend' in ports:
            urls['frontend'] = f"http://localhost:{ports['frontend']}"
        
        if 'backend' in ports:
            urls['backend'] = f"http://localhost:{ports['backend']}"
            urls['api_docs'] = f"http://localhost:{ports['backend']}/docs"
            urls['health'] = f"http://localhost:{ports['backend']}/health"
        
        if 'grafana' in ports:
            urls['grafana'] = f"http://localhost:{ports['grafana']}"
        
        if 'prometheus' in ports:
            urls['prometheus'] = f"http://localhost:{ports['prometheus']}"
        
        if 'kibana' in ports:
            urls['kibana'] = f"http://localhost:{ports['kibana']}"
        
        return urls
    
    def print_port_report(self, ports: Dict[str, int]):
        """Print a comprehensive port allocation report"""
        print("\n" + "=" * 70)
        print("🔌 reVoAgent Port Allocation Report")
        print("=" * 70)
        
        print("\n📋 Service Ports:")
        for service, port in sorted(ports.items()):
            status = "✅ Available" if self.is_port_available(port) else "🔴 In Use"
            print(f"  {service:15} : {port:5} ({status})")
        
        print("\n🌐 Service URLs:")
        urls = self.get_service_urls(ports)
        for service, url in urls.items():
            print(f"  {service:15} : {url}")
        
        print("\n🔍 Port Usage Details:")
        for service, port in sorted(ports.items()):
            usage_info = self.get_port_usage(port)
            if usage_info:
                print(f"  Port {port} ({service}):")
                for proc in usage_info:
                    print(f"    PID {proc['pid']:6} : {proc['name']} - {proc['cmdline'][:50]}...")
        
        print("=" * 70)

def main():
    """Main entry point for port management"""
    import argparse
    
    parser = argparse.ArgumentParser(description='reVoAgent Port Manager')
    parser.add_argument('--allocate', action='store_true', help='Allocate ports for services')
    parser.add_argument('--cleanup', action='store_true', help='Cleanup allocated ports')
    parser.add_argument('--report', action='store_true', help='Show port allocation report')
    parser.add_argument('--kill-port', type=int, help='Kill processes using specific port')
    parser.add_argument('--force', action='store_true', help='Force kill processes')
    
    args = parser.parse_args()
    
    manager = PortManager()
    
    try:
        if args.cleanup:
            manager.cleanup_ports()
        
        elif args.kill_port:
            manager.kill_port_processes(args.kill_port, force=args.force)
        
        elif args.allocate:
            ports = manager.allocate_ports()
            manager.print_port_report(ports)
        
        elif args.report:
            # Load existing configuration or use defaults
            ports = manager.load_port_config() or manager.default_ports
            manager.print_port_report(ports)
        
        else:
            # Default: allocate ports and show report
            ports = manager.allocate_ports()
            manager.print_port_report(ports)
    
    except KeyboardInterrupt:
        print("\n🛑 Port management interrupted")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()