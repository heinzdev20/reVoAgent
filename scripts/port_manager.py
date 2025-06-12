#!/usr/bin/env python3
"""
Port Management Utility for reVoAgent
Provides comprehensive port checking and management
"""

import socket
import subprocess
import sys
import argparse
import json
from typing import List, Dict, Optional

class PortManager:
    def __init__(self):
        self.default_ports = {
            'backend': 12001,
            'frontend': 12000,
            'redis': 6379,
            'prometheus': 9090,
            'grafana': 3001
        }
    
    def is_port_free(self, port: int, host: str = 'localhost') -> bool:
        """Check if a port is free"""
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
                sock.bind((host, port))
                return True
        except OSError:
            return False
    
    def find_free_port(self, start_port: int = 12000, max_attempts: int = 100) -> Optional[int]:
        """Find the next available port starting from start_port"""
        for port in range(start_port, start_port + max_attempts):
            if self.is_port_free(port):
                return port
        return None
    
    def get_port_info(self, port: int) -> Dict:
        """Get information about what's using a port"""
        info = {
            'port': port,
            'free': self.is_port_free(port),
            'process': None,
            'pid': None
        }
        
        if not info['free']:
            try:
                # Try to find process using the port
                result = subprocess.run(
                    ['python3', '-c', f'''
import socket
import os
try:
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect(("localhost", {port}))
    s.close()
    print("Connected successfully")
except Exception as e:
    print(f"Connection failed: {{e}}")
'''],
                    capture_output=True,
                    text=True
                )
                info['status'] = result.stdout.strip()
            except Exception as e:
                info['error'] = str(e)
        
        return info
    
    def check_all_ports(self) -> Dict:
        """Check status of all default ports"""
        results = {}
        for service, port in self.default_ports.items():
            results[service] = self.get_port_info(port)
        return results
    
    def suggest_ports(self) -> Dict:
        """Suggest alternative ports if defaults are taken"""
        suggestions = {}
        for service, port in self.default_ports.items():
            if not self.is_port_free(port):
                free_port = self.find_free_port(port + 1)
                suggestions[service] = {
                    'current': port,
                    'suggested': free_port,
                    'status': 'conflict'
                }
            else:
                suggestions[service] = {
                    'current': port,
                    'suggested': port,
                    'status': 'available'
                }
        return suggestions
    
    def kill_port_processes(self, ports: List[int]) -> Dict:
        """Kill processes using specified ports"""
        results = {}
        for port in ports:
            try:
                # This is a simplified approach - in production you'd want more sophisticated process management
                subprocess.run(['fuser', '-k', f'{port}/tcp'], 
                             capture_output=True, check=False)
                results[port] = 'killed'
            except Exception as e:
                results[port] = f'error: {e}'
        return results

def main():
    parser = argparse.ArgumentParser(description='reVoAgent Port Manager')
    parser.add_argument('--check', action='store_true', help='Check all default ports')
    parser.add_argument('--suggest', action='store_true', help='Suggest alternative ports')
    parser.add_argument('--port', type=int, help='Check specific port')
    parser.add_argument('--find-free', type=int, help='Find free port starting from given number')
    parser.add_argument('--json', action='store_true', help='Output in JSON format')
    
    args = parser.parse_args()
    manager = PortManager()
    
    if args.check:
        results = manager.check_all_ports()
        if args.json:
            print(json.dumps(results, indent=2))
        else:
            print("🔍 Port Status Check")
            print("==================")
            for service, info in results.items():
                status = "🟢 FREE" if info['free'] else "🔴 IN USE"
                print(f"{service:10} (port {info['port']:5}): {status}")
    
    elif args.suggest:
        suggestions = manager.suggest_ports()
        if args.json:
            print(json.dumps(suggestions, indent=2))
        else:
            print("💡 Port Suggestions")
            print("==================")
            for service, info in suggestions.items():
                if info['status'] == 'conflict':
                    print(f"{service:10}: {info['current']} → {info['suggested']} (conflict resolved)")
                else:
                    print(f"{service:10}: {info['current']} (available)")
    
    elif args.port:
        info = manager.get_port_info(args.port)
        if args.json:
            print(json.dumps(info, indent=2))
        else:
            status = "FREE" if info['free'] else "IN USE"
            print(f"Port {args.port}: {status}")
    
    elif args.find_free:
        free_port = manager.find_free_port(args.find_free)
        if free_port:
            print(free_port)
        else:
            print("No free ports found", file=sys.stderr)
            sys.exit(1)
    
    else:
        parser.print_help()

if __name__ == '__main__':
    main()