#!/usr/bin/env python3
"""
Quick Performance Validation for reVoAgent Phase 3 Completion
"""

import psutil
import time
import json
from datetime import datetime

def collect_system_metrics():
    """Collect current system performance metrics"""
    return {
        "timestamp": datetime.now().isoformat(),
        "cpu": {
            "usage_percent": psutil.cpu_percent(interval=1),
            "count": psutil.cpu_count(),
            "frequency": psutil.cpu_freq()._asdict() if psutil.cpu_freq() else None
        },
        "memory": {
            "total_gb": round(psutil.virtual_memory().total / (1024**3), 2),
            "available_gb": round(psutil.virtual_memory().available / (1024**3), 2),
            "usage_percent": psutil.virtual_memory().percent
        },
        "disk": {
            "total_gb": round(psutil.disk_usage('/').total / (1024**3), 2),
            "free_gb": round(psutil.disk_usage('/').free / (1024**3), 2),
            "usage_percent": psutil.disk_usage('/').percent
        },
        "network": dict(psutil.net_io_counters()._asdict()) if psutil.net_io_counters() else {}
    }

def generate_performance_recommendations():
    """Generate performance optimization recommendations"""
    metrics = collect_system_metrics()
    recommendations = []
    
    # CPU recommendations
    if metrics["cpu"]["usage_percent"] > 80:
        recommendations.append({
            "category": "CPU",
            "priority": "HIGH",
            "issue": f"High CPU usage: {metrics['cpu']['usage_percent']}%",
            "recommendation": "Consider scaling horizontally or optimizing CPU-intensive operations"
        })
    
    # Memory recommendations
    if metrics["memory"]["usage_percent"] > 85:
        recommendations.append({
            "category": "Memory",
            "priority": "HIGH", 
            "issue": f"High memory usage: {metrics['memory']['usage_percent']}%",
            "recommendation": "Implement memory caching optimization or increase available memory"
        })
    
    # Disk recommendations
    if metrics["disk"]["usage_percent"] > 90:
        recommendations.append({
            "category": "Disk",
            "priority": "MEDIUM",
            "issue": f"High disk usage: {metrics['disk']['usage_percent']}%",
            "recommendation": "Clean up logs and temporary files, consider disk expansion"
        })
    
    return {
        "system_metrics": metrics,
        "recommendations": recommendations,
        "performance_score": calculate_performance_score(metrics),
        "status": "HEALTHY" if len(recommendations) == 0 else "NEEDS_ATTENTION"
    }

def calculate_performance_score(metrics):
    """Calculate overall performance score (0-100)"""
    cpu_score = max(0, 100 - metrics["cpu"]["usage_percent"])
    memory_score = max(0, 100 - metrics["memory"]["usage_percent"])
    disk_score = max(0, 100 - metrics["disk"]["usage_percent"])
    
    return round((cpu_score + memory_score + disk_score) / 3, 1)

def main():
    print("🚀 reVoAgent Quick Performance Validation")
    print("=" * 50)
    
    # Collect performance data
    performance_data = generate_performance_recommendations()
    
    # Display results
    print(f"📊 Performance Score: {performance_data['performance_score']}/100")
    print(f"🔍 Status: {performance_data['status']}")
    print()
    
    print("📈 System Metrics:")
    metrics = performance_data['system_metrics']
    print(f"  CPU Usage: {metrics['cpu']['usage_percent']}%")
    print(f"  Memory Usage: {metrics['memory']['usage_percent']}% ({metrics['memory']['available_gb']}GB available)")
    print(f"  Disk Usage: {metrics['disk']['usage_percent']}% ({metrics['disk']['free_gb']}GB free)")
    print()
    
    if performance_data['recommendations']:
        print("⚠️  Recommendations:")
        for rec in performance_data['recommendations']:
            print(f"  [{rec['priority']}] {rec['category']}: {rec['recommendation']}")
    else:
        print("✅ No performance issues detected!")
    
    # Save results
    with open('/workspace/reVoAgent/performance/performance_validation_results.json', 'w') as f:
        json.dump(performance_data, f, indent=2)
    
    print(f"\n📄 Results saved to: performance/performance_validation_results.json")
    
    return performance_data['performance_score'] >= 70

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)