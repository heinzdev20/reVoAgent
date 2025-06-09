#!/usr/bin/env python3
"""
Three-Engine Monitoring Script for reVoAgent
Real-time monitoring of Perfect Recall, Parallel Mind, and Creative Engine
"""

import asyncio
import json
import time
import psutil
import websockets
from datetime import datetime
from typing import Dict, List, Any
from dataclasses import dataclass, asdict
import argparse
import sys
import os

# Add src to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

@dataclass
class EngineMetrics:
    """Engine performance metrics"""
    name: str
    status: str
    response_time: float
    memory_usage: float
    cpu_usage: float
    active_tasks: int
    success_rate: float
    error_count: int
    timestamp: str

@dataclass
class PerfectRecallMetrics(EngineMetrics):
    """Perfect Recall Engine specific metrics"""
    retrieval_time: float
    context_size: int
    memory_hits: int
    memory_misses: int
    
@dataclass
class ParallelMindMetrics(EngineMetrics):
    """Parallel Mind Engine specific metrics"""
    active_workers: int
    queue_size: int
    worker_utilization: float
    task_throughput: float

@dataclass
class CreativeEngineMetrics(EngineMetrics):
    """Creative Engine specific metrics"""
    solutions_generated: int
    innovation_score: float
    creativity_level: float
    solution_diversity: float

class EngineMonitor:
    """Three-Engine monitoring system"""
    
    def __init__(self, config_path: str = "config/engines.yaml"):
        self.config_path = config_path
        self.engines = {
            "perfect_recall": "🔵",
            "parallel_mind": "🟣", 
            "creative_engine": "🩷"
        }
        self.metrics_history = []
        self.websocket_clients = set()
        
    async def start_monitoring(self, interval: int = 5):
        """Start the monitoring loop"""
        print("🧠 Starting Three-Engine Monitoring System")
        print("=" * 50)
        
        # Start WebSocket server for real-time updates
        websocket_task = asyncio.create_task(
            self.start_websocket_server()
        )
        
        # Start monitoring loop
        monitor_task = asyncio.create_task(
            self.monitoring_loop(interval)
        )
        
        try:
            await asyncio.gather(websocket_task, monitor_task)
        except KeyboardInterrupt:
            print("\n🛑 Monitoring stopped by user")
        except Exception as e:
            print(f"❌ Monitoring error: {e}")
    
    async def monitoring_loop(self, interval: int):
        """Main monitoring loop"""
        while True:
            try:
                # Collect metrics from all engines
                metrics = await self.collect_all_metrics()
                
                # Display metrics
                self.display_metrics(metrics)
                
                # Store metrics history
                self.metrics_history.append({
                    'timestamp': datetime.now().isoformat(),
                    'metrics': metrics
                })
                
                # Keep only last 1000 entries
                if len(self.metrics_history) > 1000:
                    self.metrics_history = self.metrics_history[-1000:]
                
                # Send to WebSocket clients
                await self.broadcast_metrics(metrics)
                
                # Check for alerts
                await self.check_alerts(metrics)
                
                await asyncio.sleep(interval)
                
            except Exception as e:
                print(f"❌ Error in monitoring loop: {e}")
                await asyncio.sleep(interval)
    
    async def collect_all_metrics(self) -> Dict[str, Any]:
        """Collect metrics from all three engines"""
        metrics = {}
        
        # Collect Perfect Recall metrics
        metrics['perfect_recall'] = await self.collect_perfect_recall_metrics()
        
        # Collect Parallel Mind metrics  
        metrics['parallel_mind'] = await self.collect_parallel_mind_metrics()
        
        # Collect Creative Engine metrics
        metrics['creative_engine'] = await self.collect_creative_engine_metrics()
        
        # System-wide metrics
        metrics['system'] = await self.collect_system_metrics()
        
        return metrics
    
    async def collect_perfect_recall_metrics(self) -> PerfectRecallMetrics:
        """Collect Perfect Recall Engine metrics"""
        # Simulate metrics collection (replace with actual implementation)
        return PerfectRecallMetrics(
            name="Perfect Recall Engine",
            status="active",
            response_time=0.085,  # < 100ms target
            memory_usage=2.1,  # GB
            cpu_usage=15.3,  # %
            active_tasks=3,
            success_rate=99.7,  # %
            error_count=2,
            timestamp=datetime.now().isoformat(),
            retrieval_time=0.085,
            context_size=28000,
            memory_hits=1247,
            memory_misses=15
        )
    
    async def collect_parallel_mind_metrics(self) -> ParallelMindMetrics:
        """Collect Parallel Mind Engine metrics"""
        # Simulate metrics collection (replace with actual implementation)
        return ParallelMindMetrics(
            name="Parallel Mind Engine",
            status="active",
            response_time=1.2,
            memory_usage=3.8,  # GB
            cpu_usage=68.5,  # %
            active_tasks=12,
            success_rate=98.9,  # %
            error_count=5,
            timestamp=datetime.now().isoformat(),
            active_workers=8,
            queue_size=24,
            worker_utilization=85.2,
            task_throughput=15.7  # tasks/minute
        )
    
    async def collect_creative_engine_metrics(self) -> CreativeEngineMetrics:
        """Collect Creative Engine metrics"""
        # Simulate metrics collection (replace with actual implementation)
        return CreativeEngineMetrics(
            name="Creative Engine",
            status="active",
            response_time=2.8,
            memory_usage=1.9,  # GB
            cpu_usage=42.1,  # %
            active_tasks=2,
            success_rate=96.4,  # %
            error_count=8,
            timestamp=datetime.now().isoformat(),
            solutions_generated=5,
            innovation_score=0.78,
            creativity_level=0.8,
            solution_diversity=0.85
        )
    
    async def collect_system_metrics(self) -> Dict[str, Any]:
        """Collect system-wide metrics"""
        return {
            'total_memory': psutil.virtual_memory().total / (1024**3),  # GB
            'available_memory': psutil.virtual_memory().available / (1024**3),  # GB
            'cpu_count': psutil.cpu_count(),
            'cpu_usage': psutil.cpu_percent(interval=1),
            'disk_usage': psutil.disk_usage('/').percent,
            'network_io': psutil.net_io_counters()._asdict(),
            'timestamp': datetime.now().isoformat()
        }
    
    def display_metrics(self, metrics: Dict[str, Any]):
        """Display metrics in terminal"""
        # Clear screen
        os.system('clear' if os.name == 'posix' else 'cls')
        
        print("🧠 reVoAgent Three-Engine Monitoring Dashboard")
        print("=" * 60)
        print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print()
        
        # Perfect Recall Engine
        pr = metrics['perfect_recall']
        print(f"🔵 {pr.name}")
        print(f"   Status: {pr.status.upper()}")
        print(f"   Response Time: {pr.response_time:.3f}s (Target: <0.100s)")
        print(f"   Memory Usage: {pr.memory_usage:.1f}GB")
        print(f"   CPU Usage: {pr.cpu_usage:.1f}%")
        print(f"   Retrieval Time: {pr.retrieval_time:.3f}s")
        print(f"   Context Size: {pr.context_size:,} tokens")
        print(f"   Cache Hit Rate: {(pr.memory_hits/(pr.memory_hits+pr.memory_misses)*100):.1f}%")
        print()
        
        # Parallel Mind Engine
        pm = metrics['parallel_mind']
        print(f"🟣 {pm.name}")
        print(f"   Status: {pm.status.upper()}")
        print(f"   Response Time: {pm.response_time:.3f}s")
        print(f"   Memory Usage: {pm.memory_usage:.1f}GB")
        print(f"   CPU Usage: {pm.cpu_usage:.1f}%")
        print(f"   Active Workers: {pm.active_workers}/16")
        print(f"   Queue Size: {pm.queue_size}")
        print(f"   Worker Utilization: {pm.worker_utilization:.1f}%")
        print(f"   Throughput: {pm.task_throughput:.1f} tasks/min")
        print()
        
        # Creative Engine
        ce = metrics['creative_engine']
        print(f"🩷 {ce.name}")
        print(f"   Status: {ce.status.upper()}")
        print(f"   Response Time: {ce.response_time:.3f}s")
        print(f"   Memory Usage: {ce.memory_usage:.1f}GB")
        print(f"   CPU Usage: {ce.cpu_usage:.1f}%")
        print(f"   Solutions Generated: {ce.solutions_generated}")
        print(f"   Innovation Score: {ce.innovation_score:.2f}")
        print(f"   Creativity Level: {ce.creativity_level:.2f}")
        print(f"   Solution Diversity: {ce.solution_diversity:.2f}")
        print()
        
        # System Metrics
        sys_metrics = metrics['system']
        print("💻 System Metrics")
        print(f"   Total Memory: {sys_metrics['total_memory']:.1f}GB")
        print(f"   Available Memory: {sys_metrics['available_memory']:.1f}GB")
        print(f"   CPU Usage: {sys_metrics['cpu_usage']:.1f}%")
        print(f"   Disk Usage: {sys_metrics['disk_usage']:.1f}%")
        print()
        
        # Overall Health
        overall_health = self.calculate_overall_health(metrics)
        health_emoji = "🟢" if overall_health > 90 else "🟡" if overall_health > 70 else "🔴"
        print(f"{health_emoji} Overall System Health: {overall_health:.1f}%")
        print("=" * 60)
    
    def calculate_overall_health(self, metrics: Dict[str, Any]) -> float:
        """Calculate overall system health score"""
        scores = []
        
        # Perfect Recall health
        pr = metrics['perfect_recall']
        pr_health = (
            (100 if pr.response_time < 0.1 else max(0, 100 - (pr.response_time - 0.1) * 1000)) * 0.3 +
            pr.success_rate * 0.4 +
            (100 - pr.cpu_usage) * 0.3
        )
        scores.append(pr_health)
        
        # Parallel Mind health
        pm = metrics['parallel_mind']
        pm_health = (
            pm.success_rate * 0.4 +
            pm.worker_utilization * 0.3 +
            (100 - pm.cpu_usage) * 0.3
        )
        scores.append(pm_health)
        
        # Creative Engine health
        ce = metrics['creative_engine']
        ce_health = (
            ce.success_rate * 0.4 +
            ce.innovation_score * 100 * 0.3 +
            (100 - ce.cpu_usage) * 0.3
        )
        scores.append(ce_health)
        
        return sum(scores) / len(scores)
    
    async def check_alerts(self, metrics: Dict[str, Any]):
        """Check for alert conditions"""
        alerts = []
        
        # Check Perfect Recall alerts
        pr = metrics['perfect_recall']
        if pr.response_time > 0.1:
            alerts.append(f"🔵 Perfect Recall response time high: {pr.response_time:.3f}s")
        
        # Check Parallel Mind alerts
        pm = metrics['parallel_mind']
        if pm.worker_utilization > 90:
            alerts.append(f"🟣 Parallel Mind worker utilization high: {pm.worker_utilization:.1f}%")
        
        # Check Creative Engine alerts
        ce = metrics['creative_engine']
        if ce.innovation_score < 0.5:
            alerts.append(f"🩷 Creative Engine innovation score low: {ce.innovation_score:.2f}")
        
        # Check system alerts
        sys_metrics = metrics['system']
        if sys_metrics['available_memory'] < 1.0:
            alerts.append(f"💻 Low available memory: {sys_metrics['available_memory']:.1f}GB")
        
        if alerts:
            print("🚨 ALERTS:")
            for alert in alerts:
                print(f"   {alert}")
            print()
    
    async def start_websocket_server(self):
        """Start WebSocket server for real-time updates"""
        async def handle_client(websocket, path):
            self.websocket_clients.add(websocket)
            try:
                await websocket.wait_closed()
            finally:
                self.websocket_clients.remove(websocket)
        
        try:
            await websockets.serve(handle_client, "localhost", 8765)
            print("🌐 WebSocket server started on ws://localhost:8765")
        except Exception as e:
            print(f"❌ Failed to start WebSocket server: {e}")
    
    async def broadcast_metrics(self, metrics: Dict[str, Any]):
        """Broadcast metrics to WebSocket clients"""
        if self.websocket_clients:
            message = json.dumps(metrics, default=str)
            disconnected = set()
            
            for client in self.websocket_clients:
                try:
                    await client.send(message)
                except websockets.exceptions.ConnectionClosed:
                    disconnected.add(client)
            
            # Remove disconnected clients
            self.websocket_clients -= disconnected

def main():
    """Main function"""
    parser = argparse.ArgumentParser(description="Three-Engine Monitoring System")
    parser.add_argument("--interval", type=int, default=5, help="Monitoring interval in seconds")
    parser.add_argument("--config", type=str, default="config/engines.yaml", help="Engine configuration file")
    
    args = parser.parse_args()
    
    monitor = EngineMonitor(args.config)
    
    try:
        asyncio.run(monitor.start_monitoring(args.interval))
    except KeyboardInterrupt:
        print("\n👋 Monitoring stopped")
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()