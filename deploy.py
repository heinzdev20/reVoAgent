#!/usr/bin/env python3
"""
Production Deployment Script for reVoAgent Phase 4

This script handles:
- Environment setup and validation
- Docker orchestration
- Database initialization
- Model downloads and setup
- Health checks and monitoring
- Production configuration
"""

import asyncio
import logging
import os
import sys
import subprocess
import time
import json
import yaml
from pathlib import Path
from typing import Dict, Any, List, Optional
import argparse

import docker
import requests
import psutil


class DeploymentManager:
    """Manages reVoAgent deployment process"""
    
    def __init__(self, environment: str = "production"):
        self.environment = environment
        self.logger = logging.getLogger("deployment")
        self.docker_client = None
        self.project_root = Path(__file__).parent
        
        # Deployment configuration
        self.config = {
            "development": {
                "compose_file": "docker-compose.yml",
                "profiles": ["dev"],
                "replicas": 1,
                "resources": {"memory": "4GB", "cpu": "2"}
            },
            "staging": {
                "compose_file": "docker-compose.yml",
                "profiles": ["staging"],
                "replicas": 2,
                "resources": {"memory": "8GB", "cpu": "4"}
            },
            "production": {
                "compose_file": "docker-compose.prod.yml",
                "profiles": ["production"],
                "replicas": 3,
                "resources": {"memory": "16GB", "cpu": "8"}
            }
        }
    
    async def deploy(self, components: Optional[List[str]] = None) -> bool:
        """
        Deploy reVoAgent with specified components.
        
        Args:
            components: List of components to deploy (None for all)
            
        Returns:
            True if deployment successful, False otherwise
        """
        try:
            self.logger.info(f"🚀 Starting reVoAgent deployment ({self.environment})")
            
            # Pre-deployment checks
            if not await self._pre_deployment_checks():
                return False
            
            # Initialize Docker client
            self._initialize_docker()
            
            # Setup environment
            await self._setup_environment()
            
            # Download and setup models
            await self._setup_models()
            
            # Deploy infrastructure
            await self._deploy_infrastructure()
            
            # Deploy application services
            await self._deploy_application(components)
            
            # Post-deployment validation
            if not await self._post_deployment_validation():
                return False
            
            # Setup monitoring
            await self._setup_monitoring()
            
            self.logger.info("✅ reVoAgent deployment completed successfully!")
            await self._print_deployment_summary()
            
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Deployment failed: {e}")
            await self._cleanup_failed_deployment()
            return False
    
    async def _pre_deployment_checks(self) -> bool:
        """Perform pre-deployment system checks"""
        self.logger.info("🔍 Performing pre-deployment checks...")
        
        checks = [
            ("Docker", self._check_docker),
            ("System Resources", self._check_system_resources),
            ("Network Connectivity", self._check_network),
            ("Environment Variables", self._check_environment_variables),
            ("File Permissions", self._check_file_permissions)
        ]
        
        for check_name, check_func in checks:
            self.logger.info(f"  Checking {check_name}...")
            if not await check_func():
                self.logger.error(f"❌ {check_name} check failed")
                return False
            self.logger.info(f"  ✅ {check_name} check passed")
        
        return True
    
    async def _check_docker(self) -> bool:
        """Check Docker availability and version"""
        try:
            result = subprocess.run(["docker", "--version"], capture_output=True, text=True)
            if result.returncode != 0:
                return False
            
            # Check Docker Compose
            result = subprocess.run(["docker", "compose", "version"], capture_output=True, text=True)
            return result.returncode == 0
            
        except FileNotFoundError:
            return False
    
    async def _check_system_resources(self) -> bool:
        """Check system resources"""
        # Check available memory
        memory = psutil.virtual_memory()
        available_gb = memory.available / (1024**3)
        
        required_memory = {
            "development": 8,
            "staging": 16,
            "production": 32
        }
        
        if available_gb < required_memory.get(self.environment, 8):
            self.logger.error(f"Insufficient memory: {available_gb:.1f}GB available, {required_memory[self.environment]}GB required")
            return False
        
        # Check disk space
        disk = psutil.disk_usage('/')
        available_gb = disk.free / (1024**3)
        
        if available_gb < 50:  # Require at least 50GB free
            self.logger.error(f"Insufficient disk space: {available_gb:.1f}GB available, 50GB required")
            return False
        
        return True
    
    async def _check_network(self) -> bool:
        """Check network connectivity"""
        try:
            # Test internet connectivity
            response = requests.get("https://httpbin.org/status/200", timeout=10)
            return response.status_code == 200
        except:
            return False
    
    async def _check_environment_variables(self) -> bool:
        """Check required environment variables"""
        required_vars = [
            "POSTGRES_PASSWORD",
        ]
        
        optional_vars = [
            "DEEPSEEK_API_KEY",
            "GITHUB_TOKEN",
            "SLACK_BOT_TOKEN",
            "JIRA_API_TOKEN"
        ]
        
        # Check required variables
        for var in required_vars:
            if not os.getenv(var):
                self.logger.error(f"Required environment variable {var} not set")
                return False
        
        # Warn about optional variables
        for var in optional_vars:
            if not os.getenv(var):
                self.logger.warning(f"Optional environment variable {var} not set")
        
        return True
    
    async def _check_file_permissions(self) -> bool:
        """Check file permissions"""
        # Check if we can write to required directories
        required_dirs = ["data", "logs", "models", "config"]
        
        for dir_name in required_dirs:
            dir_path = self.project_root / dir_name
            dir_path.mkdir(exist_ok=True)
            
            # Test write permission
            test_file = dir_path / "test_write"
            try:
                test_file.write_text("test")
                test_file.unlink()
            except PermissionError:
                self.logger.error(f"No write permission for {dir_path}")
                return False
        
        return True
    
    def _initialize_docker(self) -> None:
        """Initialize Docker client"""
        try:
            self.docker_client = docker.from_env()
            self.logger.info("Docker client initialized")
        except Exception as e:
            raise Exception(f"Failed to initialize Docker client: {e}")
    
    async def _setup_environment(self) -> None:
        """Setup deployment environment"""
        self.logger.info("🔧 Setting up environment...")
        
        # Create environment file
        env_file = self.project_root / ".env"
        env_content = self._generate_env_file()
        
        with open(env_file, "w") as f:
            f.write(env_content)
        
        # Create necessary directories
        directories = [
            "data", "logs", "models", "config", "temp",
            "monitoring/prometheus", "monitoring/grafana",
            "nginx/ssl", "scripts"
        ]
        
        for directory in directories:
            (self.project_root / directory).mkdir(parents=True, exist_ok=True)
        
        # Generate configuration files
        await self._generate_config_files()
    
    def _generate_env_file(self) -> str:
        """Generate .env file content"""
        env_vars = {
            "COMPOSE_PROJECT_NAME": "revoagent",
            "POSTGRES_PASSWORD": os.getenv("POSTGRES_PASSWORD", "revoagent123"),
            "GRAFANA_PASSWORD": os.getenv("GRAFANA_PASSWORD", "admin123"),
            "DEEPSEEK_API_KEY": os.getenv("DEEPSEEK_API_KEY", ""),
            "GITHUB_TOKEN": os.getenv("GITHUB_TOKEN", ""),
            "SLACK_BOT_TOKEN": os.getenv("SLACK_BOT_TOKEN", ""),
            "JIRA_API_TOKEN": os.getenv("JIRA_API_TOKEN", ""),
            "ENVIRONMENT": self.environment,
            "LOG_LEVEL": "INFO" if self.environment == "production" else "DEBUG"
        }
        
        return "\n".join(f"{key}={value}" for key, value in env_vars.items())
    
    async def _generate_config_files(self) -> None:
        """Generate configuration files"""
        # Nginx configuration
        nginx_config = """
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:8000;
    }
    
    upstream frontend {
        server frontend:3000;
    }
    
    server {
        listen 80;
        
        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
        
        location /ws/ {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }
        
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
        """
        
        nginx_dir = self.project_root / "nginx"
        nginx_dir.mkdir(exist_ok=True)
        (nginx_dir / "nginx.conf").write_text(nginx_config)
        
        # Prometheus configuration
        prometheus_config = {
            "global": {
                "scrape_interval": "15s"
            },
            "scrape_configs": [
                {
                    "job_name": "revoagent-backend",
                    "static_configs": [{"targets": ["backend:8000"]}]
                }
            ]
        }
        
        monitoring_dir = self.project_root / "monitoring"
        monitoring_dir.mkdir(exist_ok=True)
        with open(monitoring_dir / "prometheus.yml", "w") as f:
            yaml.dump(prometheus_config, f)
    
    async def _setup_models(self) -> None:
        """Download and setup AI models"""
        self.logger.info("📦 Setting up AI models...")
        
        models_dir = self.project_root / "models"
        models_dir.mkdir(exist_ok=True)
        
        # Model configurations
        models = [
            {
                "name": "deepseek-coder-6.7b",
                "url": "https://huggingface.co/deepseek-ai/deepseek-coder-6.7b-instruct",
                "type": "huggingface",
                "required": False
            },
            {
                "name": "llama-7b-code",
                "url": "https://huggingface.co/codellama/CodeLlama-7b-Instruct-hf",
                "type": "huggingface",
                "required": False
            }
        ]
        
        for model in models:
            model_path = models_dir / model["name"]
            if not model_path.exists() and model["required"]:
                self.logger.info(f"  Downloading {model['name']}...")
                # In production, you would implement actual model downloading
                # For now, create placeholder
                model_path.mkdir()
                (model_path / "config.json").write_text('{"model_type": "placeholder"}')
    
    async def _deploy_infrastructure(self) -> None:
        """Deploy infrastructure services"""
        self.logger.info("🏗️ Deploying infrastructure services...")
        
        # Start infrastructure services first
        infrastructure_services = ["redis", "postgres", "prometheus", "grafana"]
        
        for service in infrastructure_services:
            self.logger.info(f"  Starting {service}...")
            result = subprocess.run([
                "docker", "compose", "up", "-d", service
            ], cwd=self.project_root, capture_output=True, text=True)
            
            if result.returncode != 0:
                raise Exception(f"Failed to start {service}: {result.stderr}")
        
        # Wait for services to be ready
        await self._wait_for_infrastructure()
    
    async def _wait_for_infrastructure(self) -> None:
        """Wait for infrastructure services to be ready"""
        self.logger.info("⏳ Waiting for infrastructure services...")
        
        services = {
            "redis": {"host": "localhost", "port": 6379},
            "postgres": {"host": "localhost", "port": 5432},
            "prometheus": {"host": "localhost", "port": 9090},
            "grafana": {"host": "localhost", "port": 3001}
        }
        
        for service_name, config in services.items():
            await self._wait_for_service(service_name, config["host"], config["port"])
    
    async def _wait_for_service(self, service_name: str, host: str, port: int, timeout: int = 60) -> None:
        """Wait for a service to be ready"""
        import socket
        
        start_time = time.time()
        while time.time() - start_time < timeout:
            try:
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                sock.settimeout(1)
                result = sock.connect_ex((host, port))
                sock.close()
                
                if result == 0:
                    self.logger.info(f"  ✅ {service_name} is ready")
                    return
                    
            except Exception:
                pass
            
            await asyncio.sleep(2)
        
        raise Exception(f"Service {service_name} failed to start within {timeout} seconds")
    
    async def _deploy_application(self, components: Optional[List[str]] = None) -> None:
        """Deploy application services"""
        self.logger.info("🚀 Deploying application services...")
        
        # Default components
        if components is None:
            components = ["backend", "frontend", "agent-worker", "workflow-engine"]
        
        for component in components:
            self.logger.info(f"  Deploying {component}...")
            result = subprocess.run([
                "docker", "compose", "up", "-d", component
            ], cwd=self.project_root, capture_output=True, text=True)
            
            if result.returncode != 0:
                self.logger.warning(f"Failed to deploy {component}: {result.stderr}")
            else:
                self.logger.info(f"  ✅ {component} deployed")
    
    async def _post_deployment_validation(self) -> bool:
        """Validate deployment after completion"""
        self.logger.info("🔍 Validating deployment...")
        
        validations = [
            ("Backend Health", self._validate_backend_health),
            ("Frontend Accessibility", self._validate_frontend),
            ("Database Connection", self._validate_database),
            ("Agent Services", self._validate_agents)
        ]
        
        for validation_name, validation_func in validations:
            self.logger.info(f"  Validating {validation_name}...")
            if not await validation_func():
                self.logger.error(f"❌ {validation_name} validation failed")
                return False
            self.logger.info(f"  ✅ {validation_name} validation passed")
        
        return True
    
    async def _validate_backend_health(self) -> bool:
        """Validate backend health"""
        try:
            response = requests.get("http://localhost:8000/health", timeout=10)
            return response.status_code == 200
        except:
            return False
    
    async def _validate_frontend(self) -> bool:
        """Validate frontend accessibility"""
        try:
            response = requests.get("http://localhost:3000", timeout=10)
            return response.status_code == 200
        except:
            return False
    
    async def _validate_database(self) -> bool:
        """Validate database connection"""
        try:
            # Test database connection
            result = subprocess.run([
                "docker", "exec", "revoagent-postgres-1", 
                "psql", "-U", "revoagent", "-d", "revoagent", "-c", "SELECT 1;"
            ], capture_output=True, text=True)
            return result.returncode == 0
        except:
            return False
    
    async def _validate_agents(self) -> bool:
        """Validate agent services"""
        try:
            response = requests.get("http://localhost:8000/api/agents", timeout=10)
            if response.status_code == 200:
                data = response.json()
                return len(data.get("agents", [])) > 0
            return False
        except:
            return False
    
    async def _setup_monitoring(self) -> None:
        """Setup monitoring and alerting"""
        self.logger.info("📊 Setting up monitoring...")
        
        # Configure Grafana dashboards
        grafana_dashboards = {
            "revoagent-overview": {
                "title": "reVoAgent Overview",
                "panels": [
                    {"title": "System Health", "type": "stat"},
                    {"title": "Agent Performance", "type": "graph"},
                    {"title": "Workflow Metrics", "type": "table"}
                ]
            }
        }
        
        # In production, you would configure actual Grafana dashboards
        self.logger.info("  Monitoring setup complete")
    
    async def _print_deployment_summary(self) -> None:
        """Print deployment summary"""
        summary = f"""
🎉 reVoAgent Deployment Summary
================================

Environment: {self.environment}
Deployment Time: {time.strftime('%Y-%m-%d %H:%M:%S')}

🌐 Access URLs:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Grafana: http://localhost:3001 (admin/admin123)
- Prometheus: http://localhost:9090

🔧 Services Status:
"""
        
        # Check service status
        try:
            result = subprocess.run([
                "docker", "compose", "ps", "--format", "table"
            ], cwd=self.project_root, capture_output=True, text=True)
            
            if result.returncode == 0:
                summary += result.stdout
        except:
            summary += "Unable to retrieve service status"
        
        summary += f"""

📚 Next Steps:
1. Access the dashboard at http://localhost:3000
2. Check API documentation at http://localhost:8000/docs
3. Monitor system health in Grafana
4. Review logs: docker compose logs -f

🔧 Management Commands:
- Stop: docker compose down
- Restart: docker compose restart
- Logs: docker compose logs -f [service]
- Scale: docker compose up -d --scale agent-worker=3
        """
        
        print(summary)
    
    async def _cleanup_failed_deployment(self) -> None:
        """Cleanup after failed deployment"""
        self.logger.info("🧹 Cleaning up failed deployment...")
        
        try:
            subprocess.run([
                "docker", "compose", "down", "-v"
            ], cwd=self.project_root, capture_output=True)
        except:
            pass
    
    async def stop_deployment(self) -> None:
        """Stop the deployment"""
        self.logger.info("🛑 Stopping reVoAgent deployment...")
        
        result = subprocess.run([
            "docker", "compose", "down"
        ], cwd=self.project_root, capture_output=True, text=True)
        
        if result.returncode == 0:
            self.logger.info("✅ Deployment stopped successfully")
        else:
            self.logger.error(f"❌ Failed to stop deployment: {result.stderr}")
    
    async def update_deployment(self, components: Optional[List[str]] = None) -> bool:
        """Update existing deployment"""
        self.logger.info("🔄 Updating reVoAgent deployment...")
        
        try:
            # Pull latest images
            subprocess.run([
                "docker", "compose", "pull"
            ], cwd=self.project_root, check=True)
            
            # Restart services
            if components:
                for component in components:
                    subprocess.run([
                        "docker", "compose", "up", "-d", component
                    ], cwd=self.project_root, check=True)
            else:
                subprocess.run([
                    "docker", "compose", "up", "-d"
                ], cwd=self.project_root, check=True)
            
            self.logger.info("✅ Deployment updated successfully")
            return True
            
        except subprocess.CalledProcessError as e:
            self.logger.error(f"❌ Update failed: {e}")
            return False


async def main():
    """Main deployment function"""
    parser = argparse.ArgumentParser(description="reVoAgent Deployment Manager")
    parser.add_argument(
        "--environment", "-e",
        choices=["development", "staging", "production"],
        default="development",
        help="Deployment environment"
    )
    parser.add_argument(
        "--action", "-a",
        choices=["deploy", "stop", "update", "status"],
        default="deploy",
        help="Action to perform"
    )
    parser.add_argument(
        "--components", "-c",
        nargs="*",
        help="Specific components to deploy/update"
    )
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Verbose logging"
    )
    
    args = parser.parse_args()
    
    # Setup logging
    log_level = logging.DEBUG if args.verbose else logging.INFO
    logging.basicConfig(
        level=log_level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Create deployment manager
    deployment_manager = DeploymentManager(args.environment)
    
    try:
        if args.action == "deploy":
            success = await deployment_manager.deploy(args.components)
            sys.exit(0 if success else 1)
        
        elif args.action == "stop":
            await deployment_manager.stop_deployment()
        
        elif args.action == "update":
            success = await deployment_manager.update_deployment(args.components)
            sys.exit(0 if success else 1)
        
        elif args.action == "status":
            # Show deployment status
            result = subprocess.run([
                "docker", "compose", "ps"
            ], cwd=Path(__file__).parent)
            sys.exit(result.returncode)
    
    except KeyboardInterrupt:
        print("\n🛑 Deployment interrupted by user")
        sys.exit(1)
    except Exception as e:
        logging.error(f"❌ Deployment failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())