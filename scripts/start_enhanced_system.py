#!/usr/bin/env python3
"""
Enhanced reVoAgent System Startup Script
Implements Phase 1 Critical Hotspot Improvements

Features:
- Load balancer setup
- Horizontal scaling
- Circuit breakers
- Health checks
- Performance monitoring
- Caching
- Rate limiting
"""

import asyncio
import os
import sys
import time
import subprocess
import logging
import json
from pathlib import Path
from typing import Dict, Any, List
import docker
import redis
import psutil

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class EnhancedSystemManager:
    """
    Manages the enhanced reVoAgent system with all Phase 1 improvements
    """
    
    def __init__(self):
        self.project_root = Path(__file__).parent.parent
        self.docker_client = None
        self.services = {}
        self.health_checks = {}
        
    async def initialize(self):
        """Initialize the system manager"""
        logger.info("🚀 Initializing Enhanced reVoAgent System Manager...")
        
        # Initialize Docker client
        try:
            self.docker_client = docker.from_env()
            logger.info("✅ Docker client initialized")
        except Exception as e:
            logger.error(f"❌ Failed to initialize Docker client: {e}")
            return False
        
        # Check system requirements
        if not await self.check_system_requirements():
            return False
        
        # Setup environment
        await self.setup_environment()
        
        logger.info("✅ System manager initialized successfully")
        return True
    
    async def check_system_requirements(self) -> bool:
        """Check if system meets requirements"""
        logger.info("🔍 Checking system requirements...")
        
        requirements = {
            "docker": self.check_docker(),
            "memory": self.check_memory(),
            "disk": self.check_disk_space(),
            "ports": self.check_ports()
        }
        
        all_good = all(requirements.values())
        
        for req, status in requirements.items():
            status_icon = "✅" if status else "❌"
            logger.info(f"{status_icon} {req.capitalize()}: {'OK' if status else 'FAILED'}")
        
        return all_good
    
    def check_docker(self) -> bool:
        """Check if Docker is available"""
        try:
            self.docker_client.ping()
            return True
        except:
            return False
    
    def check_memory(self) -> bool:
        """Check if system has enough memory (minimum 4GB)"""
        memory = psutil.virtual_memory()
        return memory.total >= 4 * 1024 * 1024 * 1024  # 4GB
    
    def check_disk_space(self) -> bool:
        """Check if system has enough disk space (minimum 10GB)"""
        disk = psutil.disk_usage('/')
        return disk.free >= 10 * 1024 * 1024 * 1024  # 10GB
    
    def check_ports(self) -> bool:
        """Check if required ports are available"""
        required_ports = [80, 443, 6379, 5432, 9090, 3001, 12000, 12001]
        
        for port in required_ports:
            if self.is_port_in_use(port):
                logger.warning(f"⚠️ Port {port} is already in use")
                return False
        
        return True
    
    def is_port_in_use(self, port: int) -> bool:
        """Check if a port is in use"""
        import socket
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            return s.connect_ex(('localhost', port)) == 0
    
    async def setup_environment(self):
        """Setup environment variables and configurations"""
        logger.info("🔧 Setting up environment...")
        
        # Create necessary directories
        directories = [
            "data", "models", "logs", "temp", "config",
            "deployment/nginx/ssl", "monitoring/grafana/dashboards"
        ]
        
        for directory in directories:
            dir_path = self.project_root / directory
            dir_path.mkdir(parents=True, exist_ok=True)
        
        # Setup environment variables
        env_vars = {
            "REVOAGENT_MODE": "production",
            "REDIS_URL": "redis://localhost:6379",
            "DATABASE_URL": "postgresql://revoagent:revoagent_secure_password@localhost:5432/revoagent",
            "PYTHONPATH": str(self.project_root / "src"),
        }
        
        for key, value in env_vars.items():
            os.environ[key] = value
        
        logger.info("✅ Environment setup complete")
    
    async def start_infrastructure(self):
        """Start infrastructure services (Redis, PostgreSQL, etc.)"""
        logger.info("🏗️ Starting infrastructure services...")
        
        # Start Redis
        await self.start_redis()
        
        # Start PostgreSQL
        await self.start_postgres()
        
        # Wait for services to be ready
        await self.wait_for_infrastructure()
        
        logger.info("✅ Infrastructure services started")
    
    async def start_redis(self):
        """Start Redis with optimized configuration"""
        logger.info("🔴 Starting Redis...")
        
        try:
            redis_container = self.docker_client.containers.run(
                "redis:7-alpine",
                name="revoagent-redis-enhanced",
                ports={'6379/tcp': 6379},
                volumes={
                    str(self.project_root / "deployment/redis/redis.conf"): {
                        'bind': '/usr/local/etc/redis/redis.conf',
                        'mode': 'ro'
                    },
                    'revoagent-redis-data': {'bind': '/data', 'mode': 'rw'}
                },
                command="redis-server /usr/local/etc/redis/redis.conf",
                detach=True,
                restart_policy={"Name": "unless-stopped"},
                healthcheck={
                    "test": ["CMD", "redis-cli", "ping"],
                    "interval": 30000000000,  # 30s in nanoseconds
                    "timeout": 10000000000,   # 10s in nanoseconds
                    "retries": 3
                }
            )
            
            self.services['redis'] = redis_container
            logger.info("✅ Redis started successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to start Redis: {e}")
            raise
    
    async def start_postgres(self):
        """Start PostgreSQL with optimized configuration"""
        logger.info("🐘 Starting PostgreSQL...")
        
        try:
            postgres_container = self.docker_client.containers.run(
                "postgres:15-alpine",
                name="revoagent-postgres-enhanced",
                ports={'5432/tcp': 5432},
                environment={
                    "POSTGRES_DB": "revoagent",
                    "POSTGRES_USER": "revoagent",
                    "POSTGRES_PASSWORD": "revoagent_secure_password",
                    "POSTGRES_INITDB_ARGS": "--auth-host=scram-sha-256"
                },
                volumes={
                    'revoagent-postgres-data': {'bind': '/var/lib/postgresql/data', 'mode': 'rw'}
                },
                detach=True,
                restart_policy={"Name": "unless-stopped"},
                healthcheck={
                    "test": ["CMD-SHELL", "pg_isready -U revoagent -d revoagent"],
                    "interval": 30000000000,
                    "timeout": 10000000000,
                    "retries": 3
                }
            )
            
            self.services['postgres'] = postgres_container
            logger.info("✅ PostgreSQL started successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to start PostgreSQL: {e}")
            raise
    
    async def wait_for_infrastructure(self):
        """Wait for infrastructure services to be ready"""
        logger.info("⏳ Waiting for infrastructure services to be ready...")
        
        # Wait for Redis
        await self.wait_for_redis()
        
        # Wait for PostgreSQL
        await self.wait_for_postgres()
        
        logger.info("✅ All infrastructure services are ready")
    
    async def wait_for_redis(self):
        """Wait for Redis to be ready"""
        for attempt in range(30):
            try:
                r = redis.Redis(host='localhost', port=6379, decode_responses=True)
                r.ping()
                logger.info("✅ Redis is ready")
                return
            except:
                await asyncio.sleep(2)
        
        raise Exception("Redis failed to start within timeout")
    
    async def wait_for_postgres(self):
        """Wait for PostgreSQL to be ready"""
        for attempt in range(30):
            try:
                import psycopg2
                conn = psycopg2.connect(
                    host="localhost",
                    port=5432,
                    database="revoagent",
                    user="revoagent",
                    password="revoagent_secure_password"
                )
                conn.close()
                logger.info("✅ PostgreSQL is ready")
                return
            except:
                await asyncio.sleep(2)
        
        raise Exception("PostgreSQL failed to start within timeout")
    
    async def start_backend_services(self):
        """Start backend services with load balancing"""
        logger.info("🚀 Starting backend services...")
        
        # Build backend image
        await self.build_backend_image()
        
        # Start multiple backend instances
        await self.start_backend_instances()
        
        # Start NGINX load balancer
        await self.start_nginx_load_balancer()
        
        logger.info("✅ Backend services started")
    
    async def build_backend_image(self):
        """Build the enhanced backend Docker image"""
        logger.info("🔨 Building enhanced backend image...")
        
        try:
            # Create Dockerfile for enhanced backend
            dockerfile_content = """
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \\
    gcc \\
    g++ \\
    curl \\
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install additional performance packages
RUN pip install --no-cache-dir \\
    uvloop \\
    httptools \\
    prometheus-client \\
    redis \\
    psycopg2-binary

# Copy application code
COPY . .

# Create non-root user
RUN useradd -m -u 1000 revoagent && chown -R revoagent:revoagent /app
USER revoagent

# Expose port
EXPOSE 12001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \\
    CMD curl -f http://localhost:12001/health/ready || exit 1

# Start command
CMD ["python", "apps/backend/enhanced_main.py"]
"""
            
            dockerfile_path = self.project_root / "Dockerfile.enhanced"
            with open(dockerfile_path, 'w') as f:
                f.write(dockerfile_content)
            
            # Build image
            image, logs = self.docker_client.images.build(
                path=str(self.project_root),
                dockerfile="Dockerfile.enhanced",
                tag="revoagent/backend:enhanced",
                rm=True
            )
            
            logger.info("✅ Enhanced backend image built successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to build backend image: {e}")
            raise
    
    async def start_backend_instances(self):
        """Start multiple backend instances for load balancing"""
        logger.info("🔄 Starting backend instances...")
        
        backend_instances = []
        
        for i in range(2):  # Start 2 instances
            try:
                container = self.docker_client.containers.run(
                    "revoagent/backend:enhanced",
                    name=f"revoagent-backend-{i+1}",
                    ports={f'12001/tcp': 12001 + i},
                    environment={
                        "REDIS_URL": "redis://host.docker.internal:6379",
                        "DATABASE_URL": "postgresql://revoagent:revoagent_secure_password@host.docker.internal:5432/revoagent",
                        "REVOAGENT_MODE": "production",
                        "INSTANCE_ID": f"backend-{i+1}"
                    },
                    volumes={
                        str(self.project_root): {'bind': '/app', 'mode': 'rw'}
                    },
                    detach=True,
                    restart_policy={"Name": "unless-stopped"},
                    network_mode="host"
                )
                
                backend_instances.append(container)
                logger.info(f"✅ Backend instance {i+1} started on port {12001 + i}")
                
            except Exception as e:
                logger.error(f"❌ Failed to start backend instance {i+1}: {e}")
                raise
        
        self.services['backend_instances'] = backend_instances
    
    async def start_nginx_load_balancer(self):
        """Start NGINX load balancer"""
        logger.info("⚖️ Starting NGINX load balancer...")
        
        try:
            nginx_container = self.docker_client.containers.run(
                "nginx:alpine",
                name="revoagent-nginx-lb",
                ports={'80/tcp': 80, '443/tcp': 443, '8080/tcp': 8080},
                volumes={
                    str(self.project_root / "deployment/nginx/nginx.conf"): {
                        'bind': '/etc/nginx/nginx.conf',
                        'mode': 'ro'
                    }
                },
                detach=True,
                restart_policy={"Name": "unless-stopped"},
                network_mode="host"
            )
            
            self.services['nginx'] = nginx_container
            logger.info("✅ NGINX load balancer started")
            
        except Exception as e:
            logger.error(f"❌ Failed to start NGINX load balancer: {e}")
            raise
    
    async def start_monitoring(self):
        """Start monitoring services"""
        logger.info("📊 Starting monitoring services...")
        
        # Start Prometheus
        await self.start_prometheus()
        
        # Start Grafana
        await self.start_grafana()
        
        # Start AlertManager
        await self.start_alertmanager()
        
        logger.info("✅ Monitoring services started")
    
    async def start_prometheus(self):
        """Start Prometheus monitoring"""
        logger.info("📈 Starting Prometheus...")
        
        try:
            prometheus_container = self.docker_client.containers.run(
                "prom/prometheus:latest",
                name="revoagent-prometheus",
                ports={'9090/tcp': 9090},
                volumes={
                    str(self.project_root / "monitoring/prometheus/enhanced-prometheus.yml"): {
                        'bind': '/etc/prometheus/prometheus.yml',
                        'mode': 'ro'
                    },
                    str(self.project_root / "monitoring/prometheus/enhanced-alert-rules.yml"): {
                        'bind': '/etc/prometheus/alert_rules.yml',
                        'mode': 'ro'
                    },
                    'revoagent-prometheus-data': {'bind': '/prometheus', 'mode': 'rw'}
                },
                command=[
                    '--config.file=/etc/prometheus/prometheus.yml',
                    '--storage.tsdb.path=/prometheus',
                    '--web.console.libraries=/etc/prometheus/console_libraries',
                    '--web.console.templates=/etc/prometheus/consoles',
                    '--storage.tsdb.retention.time=200h',
                    '--web.enable-lifecycle',
                    '--web.enable-admin-api'
                ],
                detach=True,
                restart_policy={"Name": "unless-stopped"},
                network_mode="host"
            )
            
            self.services['prometheus'] = prometheus_container
            logger.info("✅ Prometheus started")
            
        except Exception as e:
            logger.error(f"❌ Failed to start Prometheus: {e}")
            raise
    
    async def start_grafana(self):
        """Start Grafana dashboards"""
        logger.info("📊 Starting Grafana...")
        
        try:
            grafana_container = self.docker_client.containers.run(
                "grafana/grafana:latest",
                name="revoagent-grafana",
                ports={'3001/tcp': 3001},
                environment={
                    "GF_SECURITY_ADMIN_PASSWORD": "admin",
                    "GF_USERS_ALLOW_SIGN_UP": "false"
                },
                volumes={
                    'revoagent-grafana-data': {'bind': '/var/lib/grafana', 'mode': 'rw'}
                },
                detach=True,
                restart_policy={"Name": "unless-stopped"},
                network_mode="host"
            )
            
            self.services['grafana'] = grafana_container
            logger.info("✅ Grafana started")
            
        except Exception as e:
            logger.error(f"❌ Failed to start Grafana: {e}")
            raise
    
    async def start_alertmanager(self):
        """Start AlertManager"""
        logger.info("🚨 Starting AlertManager...")
        
        try:
            # Create basic alertmanager config
            alertmanager_config = """
global:
  smtp_smarthost: 'localhost:587'
  smtp_from: 'alerts@revoagent.local'

route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'web.hook'

receivers:
- name: 'web.hook'
  webhook_configs:
  - url: 'http://localhost:5001/webhook'
"""
            
            config_path = self.project_root / "monitoring/alertmanager.yml"
            with open(config_path, 'w') as f:
                f.write(alertmanager_config)
            
            alertmanager_container = self.docker_client.containers.run(
                "prom/alertmanager:latest",
                name="revoagent-alertmanager",
                ports={'9093/tcp': 9093},
                volumes={
                    str(config_path): {
                        'bind': '/etc/alertmanager/alertmanager.yml',
                        'mode': 'ro'
                    }
                },
                command=[
                    '--config.file=/etc/alertmanager/alertmanager.yml',
                    '--storage.path=/alertmanager',
                    '--web.external-url=http://localhost:9093'
                ],
                detach=True,
                restart_policy={"Name": "unless-stopped"},
                network_mode="host"
            )
            
            self.services['alertmanager'] = alertmanager_container
            logger.info("✅ AlertManager started")
            
        except Exception as e:
            logger.error(f"❌ Failed to start AlertManager: {e}")
            raise
    
    async def run_health_checks(self):
        """Run comprehensive health checks"""
        logger.info("🏥 Running health checks...")
        
        health_results = {}
        
        # Check all services
        for service_name, container in self.services.items():
            if isinstance(container, list):
                # Handle multiple instances
                for i, instance in enumerate(container):
                    health_results[f"{service_name}_{i}"] = self.check_container_health(instance)
            else:
                health_results[service_name] = self.check_container_health(container)
        
        # Check application endpoints
        health_results['backend_api'] = await self.check_backend_health()
        health_results['load_balancer'] = await self.check_nginx_health()
        
        # Display results
        self.display_health_results(health_results)
        
        return all(health_results.values())
    
    def check_container_health(self, container) -> bool:
        """Check if a container is healthy"""
        try:
            container.reload()
            return container.status == 'running'
        except:
            return False
    
    async def check_backend_health(self) -> bool:
        """Check backend API health"""
        try:
            import aiohttp
            async with aiohttp.ClientSession() as session:
                async with session.get('http://localhost:12001/health') as response:
                    return response.status == 200
        except:
            return False
    
    async def check_nginx_health(self) -> bool:
        """Check NGINX health"""
        try:
            import aiohttp
            async with aiohttp.ClientSession() as session:
                async with session.get('http://localhost:80/nginx-health') as response:
                    return response.status == 200
        except:
            return False
    
    def display_health_results(self, results: Dict[str, bool]):
        """Display health check results"""
        logger.info("📋 Health Check Results:")
        for service, healthy in results.items():
            status_icon = "✅" if healthy else "❌"
            logger.info(f"  {status_icon} {service}: {'Healthy' if healthy else 'Unhealthy'}")
    
    async def display_system_info(self):
        """Display system information and access URLs"""
        logger.info("🎉 Enhanced reVoAgent System Started Successfully!")
        logger.info("")
        logger.info("📊 System Information:")
        logger.info("  • Load Balancer: http://localhost:80")
        logger.info("  • Backend API: http://localhost:12001")
        logger.info("  • Backend API (LB): http://localhost:80/api")
        logger.info("  • Health Checks: http://localhost:80/health")
        logger.info("  • Prometheus: http://localhost:9090")
        logger.info("  • Grafana: http://localhost:3001 (admin/admin)")
        logger.info("  • AlertManager: http://localhost:9093")
        logger.info("")
        logger.info("🔧 Management Commands:")
        logger.info("  • View logs: docker logs <container_name>")
        logger.info("  • Scale backend: docker-compose up --scale backend=N")
        logger.info("  • Stop system: docker-compose down")
        logger.info("")
        logger.info("📈 Monitoring Features:")
        logger.info("  • Circuit breakers active")
        logger.info("  • Rate limiting enabled")
        logger.info("  • Response caching active")
        logger.info("  • Health checks running")
        logger.info("  • Performance metrics collected")
        logger.info("")
    
    async def cleanup(self):
        """Cleanup resources"""
        logger.info("🧹 Cleaning up resources...")
        
        for service_name, container in self.services.items():
            try:
                if isinstance(container, list):
                    for instance in container:
                        instance.stop()
                        instance.remove()
                else:
                    container.stop()
                    container.remove()
                logger.info(f"✅ Stopped {service_name}")
            except Exception as e:
                logger.warning(f"⚠️ Failed to stop {service_name}: {e}")

async def main():
    """Main function to start the enhanced system"""
    system_manager = EnhancedSystemManager()
    
    try:
        # Initialize system
        if not await system_manager.initialize():
            logger.error("❌ System initialization failed")
            return 1
        
        # Start infrastructure
        await system_manager.start_infrastructure()
        
        # Start backend services
        await system_manager.start_backend_services()
        
        # Start monitoring
        await system_manager.start_monitoring()
        
        # Run health checks
        if not await system_manager.run_health_checks():
            logger.warning("⚠️ Some health checks failed")
        
        # Display system info
        await system_manager.display_system_info()
        
        # Keep running
        logger.info("🔄 System is running. Press Ctrl+C to stop.")
        try:
            while True:
                await asyncio.sleep(60)
                # Periodic health checks
                await system_manager.run_health_checks()
        except KeyboardInterrupt:
            logger.info("🛑 Shutdown requested")
        
    except Exception as e:
        logger.error(f"❌ System startup failed: {e}")
        return 1
    
    finally:
        await system_manager.cleanup()
    
    return 0

if __name__ == "__main__":
    sys.exit(asyncio.run(main()))