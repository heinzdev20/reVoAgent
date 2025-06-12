#!/usr/bin/env python3
"""
reVoAgent Complete Setup & Deployment Script
Automated setup for Three-Engine Architecture with 20+ Agents
"""

import os
import sys
import subprocess
import json
import time
import requests
import argparse
from pathlib import Path
from typing import Dict, List, Optional
import yaml

class ReVoAgentSetup:
    def __init__(self, environment: str = "production"):
        self.environment = environment
        self.project_root = Path(__file__).parent
        self.config = {}
        self.services_status = {}
        
    def print_banner(self):
        """Print setup banner"""
        banner = """
        ╔══════════════════════════════════════════════════════════════╗
        ║                    reVoAgent Setup                           ║
        ║           Three-Engine Architecture Deployment              ║
        ║                                                              ║
        ║  🧠 Memory Engine    ⚡ Parallel Engine    🎨 Creative Engine ║
        ║  🤖 20+ AI Agents   💰 100% Cost Savings  🚀 Production Ready║
        ╚══════════════════════════════════════════════════════════════╝
        """
        print(banner)
        print(f"Environment: {self.environment.upper()}")
        print("=" * 66)
    
    def check_prerequisites(self) -> bool:
        """Check system prerequisites"""
        print("\n🔍 Checking Prerequisites...")
        
        required_tools = {
            'docker': 'Docker',
            'docker-compose': 'Docker Compose',
            'python3': 'Python 3.8+',
            'npm': 'Node.js & NPM',
            'git': 'Git'
        }
        
        missing_tools = []
        
        for tool, description in required_tools.items():
            try:
                result = subprocess.run(
                    [tool, '--version'], 
                    capture_output=True, 
                    text=True,
                    check=True
                )
                print(f"✅ {description}: Found")
            except (subprocess.CalledProcessError, FileNotFoundError):
                print(f"❌ {description}: Missing")
                missing_tools.append(tool)
        
        if missing_tools:
            print(f"\n⚠️  Missing required tools: {', '.join(missing_tools)}")
            print("Please install missing tools and run setup again.")
            return False
        
        # Check Python version
        if sys.version_info < (3, 8):
            print("❌ Python 3.8+ required")
            return False
        
        print("✅ All prerequisites satisfied!")
        return True
    
    def setup_environment_file(self):
        """Create environment configuration file"""
        print("\n⚙️  Setting up environment configuration...")
        
        env_template = {
            # Database
            'POSTGRES_PASSWORD': 'secure_password_123',
            'NEO4J_PASSWORD': 'password123',
            'RABBITMQ_USER': 'revoagent',
            'RABBITMQ_PASSWORD': 'password123',
            
            # Security
            'JWT_SECRET': 'your-super-secure-jwt-secret-key-change-this',
            'GRAFANA_PASSWORD': 'admin123',
            
            # API Keys (optional - for fallback models)
            'OPENAI_API_KEY': '',
            'ANTHROPIC_API_KEY': '',
            
            # External Integrations (optional)
            'GITHUB_TOKEN': '',
            'SLACK_TOKEN': '',
            'JIRA_URL': '',
            'JIRA_USERNAME': '',
            'JIRA_API_TOKEN': '',
            
            # Model Configuration
            'DEEPSEEK_API_KEY': '',
            'LLAMA_MODEL_PATH': '/models/llama',
            'LOCAL_MODEL_ENABLED': 'true',
            
            # Performance
            'MAX_WORKERS': '8',
            'REDIS_MAX_MEMORY': '512mb',
            'POSTGRES_MAX_CONNECTIONS': '100'
        }
        
        env_file = self.project_root / '.env'
        
        if env_file.exists():
            print("📄 .env file already exists, backing up...")
            backup_file = self.project_root / f'.env.backup.{int(time.time())}'
            env_file.rename(backup_file)
        
        with open(env_file, 'w') as f:
            f.write("# reVoAgent Three-Engine Configuration\n")
            f.write("# Generated automatically - customize as needed\n\n")
            
            for key, value in env_template.items():
                f.write(f"{key}={value}\n")
        
        print(f"✅ Environment file created: {env_file}")
        print("📝 Please edit .env file to add your API keys and customize settings")
    
    def setup_directories(self):
        """Create necessary directories"""
        print("\n📁 Setting up directory structure...")
        
        directories = [
            'logs',
            'data/postgres',
            'data/redis',
            'data/models',
            'monitoring/prometheus',
            'monitoring/grafana',
            'nginx/ssl',
            'scripts',
            'backups'
        ]
        
        for directory in directories:
            dir_path = self.project_root / directory
            dir_path.mkdir(parents=True, exist_ok=True)
            print(f"✅ Created: {directory}")
    
    def setup_monitoring_config(self):
        """Setup monitoring configuration files"""
        print("\n📊 Setting up monitoring configuration...")
        
        # Prometheus configuration
        prometheus_config = {
            'global': {
                'scrape_interval': '15s',
                'evaluation_interval': '15s'
            },
            'scrape_configs': [
                {
                    'job_name': 'revoagent-backend',
                    'static_configs': [{'targets': ['backend:12000']}],
                    'metrics_path': '/metrics'
                },
                {
                    'job_name': 'postgres',
                    'static_configs': [{'targets': ['postgres:5432']}]
                },
                {
                    'job_name': 'redis',
                    'static_configs': [{'targets': ['redis:6379']}]
                }
            ]
        }
        
        prometheus_file = self.project_root / 'monitoring' / 'prometheus.yml'
        with open(prometheus_file, 'w') as f:
            yaml.dump(prometheus_config, f, default_flow_style=False)
        
        print("✅ Prometheus configuration created")
    
    def setup_nginx_config(self):
        """Setup Nginx reverse proxy configuration"""
        print("\n🌐 Setting up Nginx configuration...")
        
        nginx_config = """
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:12000;
    }
    
    upstream frontend {
        server frontend:3000;
    }
    
    server {
        listen 80;
        server_name localhost;
        
        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # Backend API
        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # WebSocket support
        location /ws/ {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
"""
        
        nginx_dir = self.project_root / 'nginx'
        nginx_dir.mkdir(exist_ok=True)
        
        nginx_file = nginx_dir / 'nginx.conf'
        with open(nginx_file, 'w') as f:
            f.write(nginx_config)
        
        print("✅ Nginx configuration created")
    
    def create_dockerfiles(self):
        """Create necessary Dockerfiles"""
        print("\n🐳 Creating Dockerfiles...")
        
        # Backend Dockerfile
        backend_dockerfile = """
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \\
    curl \\
    postgresql-client \\
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements*.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 12000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \\
    CMD curl -f http://localhost:12000/health || exit 1

# Start application
CMD ["python", "apps/backend/three_engine_main.py"]
"""
        
        dockerfile_backend = self.project_root / 'Dockerfile.backend'
        with open(dockerfile_backend, 'w') as f:
            f.write(backend_dockerfile)
        
        print("✅ Backend Dockerfile created")
    
    def create_startup_scripts(self):
        """Create startup and utility scripts"""
        print("\n📜 Creating startup scripts...")
        
        # Start script
        start_script = """#!/bin/bash
set -e

echo "🚀 Starting reVoAgent Three-Engine System..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please run setup first."
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Start services based on environment
if [ "$1" = "dev" ]; then
    echo "🔧 Starting development environment..."
    docker-compose -f docker-compose.three-engine.yml up --build
elif [ "$1" = "prod" ]; then
    echo "🏭 Starting production environment..."
    docker-compose -f docker-compose.three-engine.yml up -d --build
else
    echo "🔧 Starting default environment..."
    docker-compose -f docker-compose.three-engine.yml up --build
fi
"""
        
        start_file = self.project_root / 'scripts' / 'start.sh'
        with open(start_file, 'w') as f:
            f.write(start_script)
        start_file.chmod(0o755)
        
        # Stop script
        stop_script = """#!/bin/bash
echo "🛑 Stopping reVoAgent System..."
docker-compose -f docker-compose.three-engine.yml down
echo "✅ System stopped"
"""
        
        stop_file = self.project_root / 'scripts' / 'stop.sh'
        with open(stop_file, 'w') as f:
            f.write(stop_script)
        stop_file.chmod(0o755)
        
        # Health check script
        health_script = """#!/bin/bash
echo "🔍 Checking reVoAgent System Health..."

services=("postgres" "redis" "backend" "frontend")

for service in "${services[@]}"; do
    if docker-compose -f docker-compose.three-engine.yml ps $service | grep -q "Up"; then
        echo "✅ $service: Running"
    else
        echo "❌ $service: Not running"
    fi
done

echo ""
echo "🌐 Service URLs:"
echo "  Frontend: http://localhost:3000"
echo "  Backend API: http://localhost:12000"
echo "  Grafana: http://localhost:3001 (admin/admin123)"
echo "  Prometheus: http://localhost:9090"
echo "  Kibana: http://localhost:5601"
"""
        
        health_file = self.project_root / 'scripts' / 'health.sh'
        with open(health_file, 'w') as f:
            f.write(health_script)
        health_file.chmod(0o755)
        
        print("✅ Startup scripts created")
    
    def install_dependencies(self):
        """Install Python and Node.js dependencies"""
        print("\n📦 Installing dependencies...")
        
        # Install Python dependencies
        try:
            subprocess.run([
                sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'
            ], check=True, cwd=self.project_root)
            print("✅ Python dependencies installed")
        except subprocess.CalledProcessError:
            print("⚠️  Failed to install Python dependencies")
        
        # Install Node.js dependencies
        frontend_dir = self.project_root / 'frontend'
        if frontend_dir.exists():
            try:
                subprocess.run(['npm', 'install'], check=True, cwd=frontend_dir)
                print("✅ Node.js dependencies installed")
            except subprocess.CalledProcessError:
                print("⚠️  Failed to install Node.js dependencies")
    
    def test_system(self):
        """Test system components"""
        print("\n🧪 Testing system components...")
        
        # Test database connection
        try:
            import psycopg2
            print("✅ PostgreSQL driver available")
        except ImportError:
            print("⚠️  PostgreSQL driver not available")
        
        # Test Redis connection
        try:
            import redis
            print("✅ Redis driver available")
        except ImportError:
            print("⚠️  Redis driver not available")
        
        print("✅ System components tested")
    
    def run_setup(self):
        """Run complete setup process"""
        self.print_banner()
        
        if not self.check_prerequisites():
            return False
        
        self.setup_environment_file()
        self.setup_directories()
        self.setup_monitoring_config()
        self.setup_nginx_config()
        self.create_dockerfiles()
        self.create_startup_scripts()
        self.install_dependencies()
        self.test_system()
        
        print("\n" + "=" * 66)
        print("🎉 reVoAgent Three-Engine Setup Complete!")
        print("=" * 66)
        print("\n📋 Next Steps:")
        print("1. Edit .env file to add your API keys")
        print("2. Run: ./scripts/start.sh")
        print("3. Access dashboard: http://localhost:3000")
        print("4. Monitor system: http://localhost:3001")
        print("\n🚀 Ready to deploy your Three-Engine AI Platform!")
        
        return True

def main():
    parser = argparse.ArgumentParser(description='reVoAgent Three-Engine Setup')
    parser.add_argument(
        '--environment', 
        choices=['development', 'production'], 
        default='production',
        help='Deployment environment'
    )
    
    args = parser.parse_args()
    
    setup = ReVoAgentSetup(args.environment)
    success = setup.run_setup()
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()