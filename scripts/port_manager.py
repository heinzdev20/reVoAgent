#!/usr/bin/env python3
"""
Port Management Utility for reVoAgent
Provides comprehensive port checking and management with conflict resolution
"""

import socket
import subprocess
import sys
import argparse
import json
import psutil
import time
import os
from typing import List, Dict, Optional

class PortManager:
    def __init__(self):
        self.default_ports = {
            'backend': 12001,
            'frontend': 3000,
            'redis': 6379,
            'prometheus': 9090,
            'grafana': 3001,
            'postgres': 5432,
            'elasticsearch': 9200,
            'kibana': 5601
        }
        self.revoagent_processes = [
            'uvicorn', 'three_engine_main', 'vite', 'node', 
            'start_three_engine_system', 'revoagent'
        ]
    
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
        """Get detailed information about what's using a port"""
        info = {
            'port': port,
            'free': self.is_port_free(port),
            'processes': [],
            'revoagent_owned': False
        }
        
        if not info['free']:
            try:
                # Get detailed process information
                for conn in psutil.net_connections():
                    if conn.laddr.port == port:
                        try:
                            process = psutil.Process(conn.pid)
                            proc_info = {
                                'pid': conn.pid,
                                'name': process.name(),
                                'cmdline': ' '.join(process.cmdline()),
                                'status': conn.status
                            }
                            info['processes'].append(proc_info)
                            
                            # Check if it's a reVoAgent process
                            if any(revo_proc in proc_info['cmdline'].lower() 
                                   for revo_proc in self.revoagent_processes):
                                info['revoagent_owned'] = True
                                
                        except (psutil.NoSuchProcess, psutil.AccessDenied):
                            info['processes'].append({
                                'pid': conn.pid,
                                'name': 'Unknown',
                                'cmdline': 'Access denied',
                                'status': conn.status
                            })
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
    
    def kill_port_processes(self, ports: List[int], force: bool = False, 
                           revoagent_only: bool = True) -> Dict:
        """Kill processes using specified ports with enhanced safety"""
        results = {}
        
        for port in ports:
            port_info = self.get_port_info(port)
            killed_pids = []
            
            if port_info['free']:
                results[port] = 'already_free'
                continue
            
            for proc_info in port_info['processes']:
                try:
                    pid = proc_info['pid']
                    
                    # Safety check: only kill reVoAgent processes if revoagent_only is True
                    if revoagent_only and not any(revo_proc in proc_info['cmdline'].lower() 
                                                  for revo_proc in self.revoagent_processes):
                        print(f"⚠️  Skipping non-reVoAgent process {pid} on port {port}")
                        continue
                    
                    process = psutil.Process(pid)
                    print(f"🔄 Terminating process {pid} ({proc_info['name']}) on port {port}")
                    
                    if force:
                        process.kill()
                    else:
                        process.terminate()
                    
                    # Wait for process to terminate
                    try:
                        process.wait(timeout=5)
                        killed_pids.append(pid)
                    except psutil.TimeoutExpired:
                        if not force:
                            print(f"⚠️  Process {pid} didn't terminate, force killing...")
                            process.kill()
                            process.wait(timeout=2)
                            killed_pids.append(pid)
                
                except (psutil.NoSuchProcess, psutil.AccessDenied) as e:
                    print(f"⚠️  Could not kill process {proc_info['pid']}: {e}")
            
            # Verify port is now free
            time.sleep(1)
            if self.is_port_free(port):
                results[port] = f'freed (killed {len(killed_pids)} processes)'
            else:
                results[port] = f'still_occupied (killed {len(killed_pids)} processes)'
        
        return results
    
    def cleanup_revoagent_ports(self) -> Dict:
        """Clean up all ports used by reVoAgent processes"""
        print("🧹 Cleaning up reVoAgent ports...")
        
        occupied_ports = []
        for service, port in self.default_ports.items():
            port_info = self.get_port_info(port)
            if not port_info['free'] and port_info['revoagent_owned']:
                occupied_ports.append(port)
        
        if occupied_ports:
            print(f"🔍 Found reVoAgent processes on ports: {occupied_ports}")
            return self.kill_port_processes(occupied_ports, revoagent_only=True)
        else:
            print("✅ No reVoAgent processes found on default ports")
            return {}
    
    def resolve_port_conflicts(self) -> Dict:
        """Resolve port conflicts and suggest alternatives"""
        print("🔧 Resolving port conflicts...")
        
        resolved_ports = {}
        
        for service, preferred_port in self.default_ports.items():
            port_info = self.get_port_info(preferred_port)
            
            if port_info['free']:
                resolved_ports[service] = preferred_port
                print(f"✅ {service}: Port {preferred_port} is available")
            
            elif port_info['revoagent_owned']:
                print(f"🔄 {service}: Port {preferred_port} occupied by reVoAgent, reclaiming...")
                kill_result = self.kill_port_processes([preferred_port], revoagent_only=True)
                
                if self.is_port_free(preferred_port):
                    resolved_ports[service] = preferred_port
                    print(f"✅ {service}: Port {preferred_port} reclaimed")
                else:
                    # Find alternative
                    alt_port = self.find_free_port(preferred_port + 1)
                    resolved_ports[service] = alt_port
                    print(f"⚠️  {service}: Using alternative port {alt_port}")
            
            else:
                # Find alternative port
                alt_port = self.find_free_port(preferred_port + 1)
                resolved_ports[service] = alt_port
                print(f"🔀 {service}: Port {preferred_port} occupied by external process, using {alt_port}")
        
        return resolved_ports

def main():
    parser = argparse.ArgumentParser(description='reVoAgent Enhanced Port Manager')
    parser.add_argument('--check', action='store_true', help='Check all default ports')
    parser.add_argument('--suggest', action='store_true', help='Suggest alternative ports')
    parser.add_argument('--port', type=int, help='Check specific port')
    parser.add_argument('--find-free', type=int, help='Find free port starting from given number')
    parser.add_argument('--cleanup', action='store_true', help='Clean up reVoAgent ports')
    parser.add_argument('--resolve', action='store_true', help='Resolve port conflicts')
    parser.add_argument('--kill', type=int, nargs='+', help='Kill processes on specific ports')
    parser.add_argument('--force', action='store_true', help='Force kill processes')
    parser.add_argument('--all-processes', action='store_true', help='Include non-reVoAgent processes')
    parser.add_argument('--json', action='store_true', help='Output in JSON format')
    
    args = parser.parse_args()
    manager = PortManager()
    
    if args.cleanup:
        results = manager.cleanup_revoagent_ports()
        if args.json:
            print(json.dumps(results, indent=2))
        else:
            print("✅ Cleanup completed")
            for port, result in results.items():
                print(f"  Port {port}: {result}")
    
    elif args.resolve:
        resolved_ports = manager.resolve_port_conflicts()
        if args.json:
            print(json.dumps(resolved_ports, indent=2))
        else:
            print("\n🎯 Resolved Port Configuration:")
            print("=" * 40)
            for service, port in resolved_ports.items():
                print(f"  {service:12}: {port}")
    
    elif args.kill:
        revoagent_only = not args.all_processes
        results = manager.kill_port_processes(args.kill, args.force, revoagent_only)
        if args.json:
            print(json.dumps(results, indent=2))
        else:
            print("🔄 Process termination results:")
            for port, result in results.items():
                print(f"  Port {port}: {result}")
    
    elif args.check:
        results = manager.check_all_ports()
        if args.json:
            print(json.dumps(results, indent=2))
        else:
            print("🔍 Port Status Check")
            print("=" * 40)
            for service, info in results.items():
                status = "🟢 FREE" if info['free'] else "🔴 IN USE"
                revo_owned = " (reVoAgent)" if info.get('revoagent_owned') else ""
                print(f"{service:12} (port {info['port']:5}): {status}{revo_owned}")
                
                if not info['free'] and info.get('processes'):
                    for proc in info['processes'][:2]:  # Show first 2 processes
                        print(f"    └─ PID {proc['pid']}: {proc['name']}")
    
    elif args.suggest:
        suggestions = manager.suggest_ports()
        if args.json:
            print(json.dumps(suggestions, indent=2))
        else:
            print("💡 Port Suggestions")
            print("=" * 40)
            for service, info in suggestions.items():
                if info['status'] == 'conflict':
                    print(f"{service:12}: {info['current']} → {info['suggested']} (conflict resolved)")
                else:
                    print(f"{service:12}: {info['current']} (available)")
    
    elif args.port:
        info = manager.get_port_info(args.port)
        if args.json:
            print(json.dumps(info, indent=2))
        else:
            status = "FREE" if info['free'] else "IN USE"
            revo_owned = " (reVoAgent owned)" if info.get('revoagent_owned') else ""
            print(f"Port {args.port}: {status}{revo_owned}")
            
            if not info['free'] and info.get('processes'):
                print("Processes:")
                for proc in info['processes']:
                    print(f"  PID {proc['pid']:6}: {proc['name']} - {proc['cmdline'][:60]}...")
    
    elif args.find_free:
        free_port = manager.find_free_port(args.find_free)
        if free_port:
            print(free_port)
        else:
            print("No free ports found", file=sys.stderr)
            sys.exit(1)
    
    else:
        # Default: show status and resolve conflicts
        print("🔍 reVoAgent Port Manager")
        print("=" * 40)
        
        results = manager.check_all_ports()
        conflicts = sum(1 for info in results.values() if not info['free'])
        
        if conflicts > 0:
            print(f"⚠️  Found {conflicts} port conflicts")
            print("\nResolving conflicts...")
            resolved_ports = manager.resolve_port_conflicts()
            print("\n🎯 Recommended Configuration:")
            for service, port in resolved_ports.items():
                print(f"  {service:12}: {port}")
        else:
            print("✅ All ports are available")
            for service, info in results.items():
                print(f"  {service:12}: {info['port']}")
        
        parser.print_help()

if __name__ == '__main__':
    main()