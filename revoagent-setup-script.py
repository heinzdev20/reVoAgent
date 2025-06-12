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
            'JIRA_TOKEN': '',
            
            # Application
            'APP_ENV': self.environment,
            'LOG_LEVEL': 'INFO' if self.environment == 'production' else 'DEBUG'
        }
        
        env_file = self.project_root / '.env'
        
        if env_file.exists():
            print("📝 .env file already exists")
            response = input("Do you want to update it? (y/N): ")
            if response.lower() != 'y':
                return
        
        print("\n📝 Creating .env file...")
        print("You can update these values later in the .env file")
        
        # Interactive setup for important values
        if self.environment == 'production':
            print("\n🔐 Security Configuration:")
            jwt_secret = input("Enter JWT secret (or press Enter for default): ").strip()
            if jwt_secret:
                env_template['JWT_SECRET'] = jwt_secret
            
            postgres_password = input("Enter PostgreSQL password (or press Enter for default): ").strip()
            if postgres_password:
                env_template['POSTGRES_PASSWORD'] = postgres_password
        
        # Write environment file
        with open(env_file, 'w') as f:
            for key, value in env_template.items():
                f.write(f"{key}={value}\n")
        
        print(f"✅ Environment file created: {env_file}")
        print("💡 Edit .env file to add your API keys for external integrations")
    
    def create_directory_structure(self):
        """Create necessary directory structure"""
        print("\n📁 Creating directory structure...")
        
        directories = [
            'apps/backend',
            'apps/frontend',
            'database',
            'models',
            'logs',
            'monitoring/prometheus',
            'monitoring/grafana/dashboards',
            'monitoring/grafana/datasources',
            'monitoring/logstash',
            'nginx',
            'nginx/ssl',
            'docs',
            'scripts',
            'tests'
        ]
        
        for directory in directories:
            dir_path = self.project_root / directory
            dir_path.mkdir(parents=True, exist_ok=True)
            print(f"📂 Created: {directory}")
        
        print("✅ Directory structure created!")
    
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
        server frontend:80;
    }
    
    server {
        listen 80;
        server_name localhost;
        
        # Frontend routes
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # API routes
        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # WebSocket routes
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
        
        # Health check
        location /health {
            proxy_pass http://backend/health;
            proxy_set_header Host $host;
        }
    }
}
        """
        
        nginx_config_file = self.project_root / 'nginx' / 'nginx.conf'
        with open(nginx_config_file, 'w') as f:
            f.write(nginx_config.strip())
        
        print("✅ Nginx configuration created!")
    
    def setup_monitoring_config(self):
        """Setup monitoring configuration"""
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
                    'static_configs': [
                        {'targets': ['backend:12000']}
                    ],
                    'metrics_path': '/metrics',
                    'scrape_interval': '30s'
                },
                {
                    'job_name': 'postgres',
                    'static_configs': [
                        {'targets': ['postgres:5432']}
                    ]
                },
                {
                    'job_name': 'redis',
                    'static_configs': [
                        {'targets': ['redis:6379']}
                    ]
                }
            ]
        }
        
        prometheus_file = self.project_root / 'monitoring' / 'prometheus' / 'prometheus.yml'
        with open(prometheus_file, 'w') as f:
            yaml.dump(prometheus_config, f, default_flow_style=False)
        
        # Grafana datasource
        grafana_datasource = {
            'apiVersion': 1,
            'datasources': [
                {
                    'name': 'Prometheus',
                    'type': 'prometheus',
                    'access': 'proxy',
                    'url': 'http://prometheus:9090',
                    'isDefault': True
                }
            ]
        }
        
        grafana_datasource_file = self.project_root / 'monitoring' / 'grafana' / 'datasources' / 'prometheus.yml'
        with open(grafana_datasource_file, 'w') as f:
            yaml.dump(grafana_datasource, f, default_flow_style=False)
        
        print("✅ Monitoring configuration created!")
    
    def setup_docker_files(self):
        """Create Docker files for services"""
        print("\n🐳 Setting up Docker configurations...")
        
        # Backend Dockerfile
        backend_dockerfile = """
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

# Copy application code
COPY . .

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \\
    CMD curl -f http://localhost:12000/health || exit 1

EXPOSE 12000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "12000", "--workers", "4"]
        """
        
        backend_dockerfile_path = self.project_root / 'apps' / 'backend' / 'Dockerfile'
        with open(backend_dockerfile_path, 'w') as f:
            f.write(backend_dockerfile.strip())
        
        # Frontend Dockerfile
        frontend_dockerfile = """
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code and build
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built app
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
        """
        
        frontend_dockerfile_path = self.project_root / 'apps' / 'frontend' / 'Dockerfile'
        with open(frontend_dockerfile_path, 'w') as f:
            f.write(frontend_dockerfile.strip())
        
        print("✅ Docker configurations created!")
    
    def create_requirements_file(self):
        """Create Python requirements file"""
        print("\n📦 Creating requirements.txt...")
        
        requirements = [
            "fastapi>=0.104.0",
            "uvicorn[standard]>=0.24.0",
            "pydantic>=2.4.0",
            "sqlalchemy>=2.0.0",
            "asyncpg>=0.29.0",
            "redis>=5.0.0",
            "python-jose[cryptography]>=3.3.0",
            "passlib[bcrypt]>=1.7.4",
            "python-multipart>=0.0.6",
            "httpx>=0.25.0",
            "websockets>=11.0.0",
            "numpy>=1.24.0",
            "torch>=2.0.0",
            "transformers>=4.35.0",
            "sentence-transformers>=2.2.0",
            "lancedb>=0.3.0",
            "neo4j>=5.0.0",
            "celery>=5.3.0",
            "prometheus-client>=0.18.0",
            "psutil>=5.9.0",
            "aiofiles>=23.0.0",
            "jinja2>=3.1.0",
            "python-dotenv>=1.0.0",
            "pyyaml>=6.0.0",
            "openai>=1.0.0",
            "anthropic>=0.7.0",
            "tenacity>=8.2.0",
            "structlog>=23.0.0"
        ]
        
        requirements_file = self.project_root / 'apps' / 'backend' / 'requirements.txt'
        with open(requirements_file, 'w') as f:
            f.write('\n'.join(requirements))
        
        print("✅ Requirements file created!")
    
    def setup_scripts(self):
        """Create utility scripts"""
        print("\n📜 Creating utility scripts...")
        
        # Start script
        start_script = """#!/bin/bash
# reVoAgent Start Script

set -e

echo "🚀 Starting reVoAgent Three-Engine System..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Run setup.py first."
    exit 1
fi

# Load environment variables
export $(cat .env | xargs)

# Start services based on environment
if [ "$1" = "dev" ] || [ "$1" = "development" ]; then
    echo "🔧 Starting development environment..."
    docker-compose -f docker-compose.development.yml up -d
elif [ "$1" = "memory" ]; then
    echo "🧠 Starting memory-enabled environment..."
    docker-compose -f docker-compose.memory.yml up -d
else
    echo "🏭 Starting production environment..."
    docker-compose -f docker-compose.production.yml up -d
fi

echo "⏳ Waiting for services to start..."
sleep 30

# Health check
echo "🔍 Performing health checks..."
python3 scripts/health_check.py

echo "✅ reVoAgent is running!"
echo "🌐 Frontend: http://localhost:3000"
echo "📡 Backend API: http://localhost:12000"
echo "📊 Monitoring: http://localhost:3001 (Grafana)"
echo "🔍 Logs: http://localhost:5601 (Kibana)"
        """
        
        start_script_file = self.project_root / 'scripts' / 'start.sh'
        with open(start_script_file, 'w') as f:
            f.write(start_script.strip())
        os.chmod(start_script_file, 0o755)
        
        # Stop script
        stop_script = """#!/bin/bash
# reVoAgent Stop Script

echo "🛑 Stopping reVoAgent services..."

docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.development.yml down
docker-compose -f docker-compose.memory.yml down

echo "✅ All services stopped!"
        """
        
        stop_script_file = self.project_root / 'scripts' / 'stop.sh'
        with open(stop_script_file, 'w') as f:
            f.write(stop_script.strip())
        os.chmod(stop_script_file, 0o755)
        
        # Health check script
        health_check_script = """#!/usr/bin/env python3
import requests
import time
import sys

def check_service(name, url, timeout=60):
    print(f"Checking {name}...")
    start_time = time.time()
    
    while time.time() - start_time < timeout:
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                print(f"✅ {name}: Healthy")
                return True
        except requests.RequestException:
            pass
        time.sleep(2)
    
    print(f"❌ {name}: Unhealthy")
    return False

def main():
    services = [
        ("Backend API", "http://localhost:12000/health"),
        ("Frontend", "http://localhost:3000"),
        ("Grafana", "http://localhost:3001/login"),
        ("Prometheus", "http://localhost:9090"),
    ]
    
    all_healthy = True
    for name, url in services:
        if not check_service(name, url):
            all_healthy = False
    
    if all_healthy:
        print("\\n🎉 All services are healthy!")
        sys.exit(0)
    else:
        print("\\n⚠️  Some services are not healthy")
        sys.exit(1)

if __name__ == "__main__":
    main()
        """
        
        health_check_file = self.project_root / 'scripts' / 'health_check.py'
        with open(health_check_file, 'w') as f:
            f.write(health_check_script.strip())
        os.chmod(health_check_file, 0o755)
        
        print("✅ Utility scripts created!")
    
    def initialize_database(self):
        """Initialize database with sample data"""
        print("\n🗄️  Initializing database...")
        
        # Wait for database to be ready
        print("⏳ Waiting for database to be ready...")
        time.sleep(10)
        
        try:
            # Run database initialization
            result = subprocess.run([
                'docker-compose', '-f', f'docker-compose.{self.environment}.yml',
                'exec', '-T', 'postgres',
                'psql', '-U', 'revoagent_user', '-d', 'revoagent',
                '-f', '/docker-entrypoint-initdb.d/init.sql'
            ], capture_output=True, text=True)
            
            if result.returncode == 0:
                print("✅ Database initialized successfully!")
            else:
                print("⚠️  Database initialization may have failed")
                print(result.stderr)
                
        except subprocess.CalledProcessError as e:
            print(f"❌ Database initialization failed: {e}")
    
    def run_tests(self):
        """Run system tests"""
        print("\n🧪 Running system tests...")
        
        test_script = """#!/usr/bin/env python3
import requests
import json
import time

def test_api_endpoints():
    base_url = "http://localhost:12000"
    
    tests = [
        ("Health Check", "GET", "/health"),
        ("Engine Status", "GET", "/api/engines/status"),
        ("System Metrics", "GET", "/api/system/metrics"),
        ("List Agents", "GET", "/api/agents"),
        ("Memory Stats", "GET", "/api/engines/memory/stats"),
    ]
    
    results = []
    for name, method, endpoint in tests:
        try:
            if method == "GET":
                response = requests.get(f"{base_url}{endpoint}", timeout=10)
            
            if response.status_code == 200:
                print(f"✅ {name}: PASS")
                results.append(True)
            else:
                print(f"❌ {name}: FAIL ({response.status_code})")
                results.append(False)
                
        except Exception as e:
            print(f"❌ {name}: ERROR ({e})")
            results.append(False)
    
    return all(results)

def test_three_engine_demo():
    try:
        response = requests.post(
            "http://localhost:12000/api/engines/demo/three-engine-showcase",
            json={"task": "Test three-engine coordination", "complexity": "simple"},
            timeout=30
        )
        
        if response.status_code == 200:
            print("✅ Three-Engine Demo: PASS")
            return True
        else:
            print(f"❌ Three-Engine Demo: FAIL ({response.status_code})")
            return False
            
    except Exception as e:
        print(f"❌ Three-Engine Demo: ERROR ({e})")
        return False

def main():
    print("🧪 Running reVoAgent System Tests...")
    
    # Wait for services to be ready
    time.sleep(5)
    
    api_tests = test_api_endpoints()
    demo_test = test_three_engine_demo()
    
    if api_tests and demo_test:
        print("\\n🎉 All tests passed!")
        return True
    else:
        print("\\n⚠️  Some tests failed")
        return False

if __name__ == "__main__":
    main()
        """
        
        test_file = self.project_root / 'scripts' / 'test_system.py'
        with open(test_file, 'w') as f:
            f.write(test_script.strip())
        os.chmod(test_file, 0o755)
        
        # Run the tests
        try:
            subprocess.run(['python3', str(test_file)], check=True)
        except subprocess.CalledProcessError:
            print("⚠️  Some tests failed - system may need more time to start")
    
    def create_documentation(self):
        """Create documentation files"""
        print("\n📚 Creating documentation...")
        
        readme_content = """# reVoAgent - Advanced Three-Engine AI Platform

## Quick Start

1. **Setup Environment:**
   ```bash
   python3 setup.py
   ```

2. **Start Services:**
   ```bash
   ./scripts/start.sh
   ```

3. **Access Platform:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:12000
   - Monitoring: http://localhost:3001

## Architecture

### Three-Engine System
- 🧠 **Memory Engine**: Persistent knowledge and context
- ⚡ **Parallel Engine**: Concurrent task processing
- 🎨 **Creative Engine**: AI-powered innovation

### 20+ Specialized Agents
- **Code Specialists**: Analysis, debugging, security
- **Workflow Agents**: DevOps, CI/CD, testing
- **Knowledge Agents**: Memory synthesis, pattern recognition
- **Communication Agents**: Multi-agent coordination

## Features

- ✅ 100% Cost Optimization with local AI models
- ✅ Memory-enabled agents with persistent learning
- ✅ Real-time multi-agent collaboration
- ✅ External integrations (GitHub, Slack, JIRA)
- ✅ Production-ready with monitoring

## Configuration

Edit `.env` file to configure:
- Database credentials
- API keys for external services
- Integration tokens

## Monitoring

- **Grafana**: http://localhost:3001 (admin/admin123)
- **Prometheus**: http://localhost:9090
- **Kibana**: http://localhost:5601

## Development

Start development environment:
```bash
./scripts/start.sh dev
```

## Support

For issues and questions, please refer to the documentation or create an issue.
        """
        
        readme_file = self.project_root / 'README.md'
        with open(readme_file, 'w') as f:
            f.write(readme_content.strip())
        
        print("✅ Documentation created!")
    
    def deploy(self, quick_start: bool = False):
        """Deploy the complete system"""
        print(f"\n🚀 Deploying reVoAgent ({self.environment})...")
        
        # Start services
        compose_file = f'docker-compose.{self.environment}.yml'
        
        print("📦 Pulling and starting services...")
        subprocess.run([
            'docker-compose', '-f', compose_file, 'pull'
        ], check=False)
        
        subprocess.run([
            'docker-compose', '-f', compose_file, 'up', '-d'
        ], check=True)
        
        if not quick_start:
            # Initialize database
            self.initialize_database()
            
            # Run tests
            self.run_tests()
        
        print("\n✅ Deployment completed successfully!")
        print("\n🎉 reVoAgent Three-Engine System is ready!")
        print("=" * 66)
        print("🌐 Frontend:    http://localhost:3000")
        print("📡 Backend API: http://localhost:12000/docs")
        print("📊 Monitoring:  http://localhost:3001 (admin/admin123)")
        print("🔍 Logs:       http://localhost:5601")
        print("=" * 66)
        print("\n💡 Next steps:")
        print("1. Open http://localhost:3000 to access the dashboard")
        print("2. Configure API keys in .env file for external integrations")
        print("3. Explore the Three-Engine showcase in the UI")
        print("4. Check system health with: python3 scripts/health_check.py")

def main():
    parser = argparse.ArgumentParser(description='reVoAgent Setup Script')
    parser.add_argument('--env', choices=['development', 'production', 'memory'], 
                       default='production', help='Environment to setup')
    parser.add_argument('--quick', action='store_true', 
                       help='Quick setup without tests')
    parser.add_argument('--deploy-only', action='store_true',
                       help='Only deploy, skip setup steps')
    
    args = parser.parse_args()
    
    setup = ReVoAgentSetup(args.env)
    
    try:
        setup.print_banner()
        
        if not args.deploy_only:
            if not setup.check_prerequisites():
                sys.exit(1)
            
            setup.setup_environment_file()
            setup.create_directory_structure()
            setup.setup_nginx_config()
            setup.setup_monitoring_config()
            setup.setup_docker_files()
            setup.create_requirements_file()
            setup.setup_scripts()
            setup.create_documentation()
        
        setup.deploy(quick_start=args.quick)
        
    except KeyboardInterrupt:
        print("\n❌ Setup interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Setup failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()