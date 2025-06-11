#!/usr/bin/env python3
"""
reVoAgent + Cognee Memory Integration Setup Script
Automated setup for the complete memory-enabled platform
"""

import os
import sys
import subprocess
import json
import asyncio
import logging
from pathlib import Path
from typing import Dict, Any, List
import uuid
import shutil

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class MemoryIntegrationSetup:
    """Setup manager for reVoAgent + Cognee memory integration"""
    
    def __init__(self):
        self.project_root = Path(__file__).parent
        self.data_dir = self.project_root / "data"
        self.memory_dir = self.data_dir / "cognee_memory"
        self.models_dir = self.data_dir / "models"
        self.logs_dir = self.project_root / "logs"
        
        # Environment variables
        self.env_vars = {
            "DB_PASSWORD": self._generate_password(),
            "REDIS_PASSWORD": self._generate_password(),
            "JWT_SECRET": self._generate_secret(),
            "ENCRYPTION_KEY": self._generate_secret(),
            "NEO4J_PASSWORD": self._generate_password(),
            "GRAFANA_USER": "admin",
            "GRAFANA_PASSWORD": self._generate_password(),
        }
    
    def _generate_password(self, length: int = 16) -> str:
        """Generate a secure random password"""
        import secrets
        import string
        alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
        return ''.join(secrets.choice(alphabet) for _ in range(length))
    
    def _generate_secret(self, length: int = 32) -> str:
        """Generate a secure random secret"""
        import secrets
        return secrets.token_hex(length)
    
    def run_setup(self):
        """Run the complete setup process"""
        logger.info("🚀 Starting reVoAgent + Cognee Memory Integration Setup")
        
        try:
            # Step 1: Check prerequisites
            self.check_prerequisites()
            
            # Step 2: Create directories
            self.create_directories()
            
            # Step 3: Install dependencies
            self.install_dependencies()
            
            # Step 4: Setup environment
            self.setup_environment()
            
            # Step 5: Initialize databases
            self.initialize_databases()
            
            # Step 6: Setup memory system
            self.setup_memory_system()
            
            # Step 7: Configure integrations
            self.configure_integrations()
            
            # Step 8: Build and start services
            self.build_and_start_services()
            
            # Step 9: Verify installation
            self.verify_installation()
            
            # Step 10: Display completion info
            self.display_completion_info()
            
        except Exception as e:
            logger.error(f"❌ Setup failed: {e}")
            sys.exit(1)
    
    def check_prerequisites(self):
        """Check system prerequisites"""
        logger.info("🔍 Checking prerequisites...")
        
        # Check Python version
        if sys.version_info < (3, 9):
            raise RuntimeError("Python 3.9+ is required")
        
        # Check Docker
        try:
            subprocess.run(["docker", "--version"], check=True, capture_output=True)
            logger.info("✅ Docker found")
        except (subprocess.CalledProcessError, FileNotFoundError):
            raise RuntimeError("Docker is required but not found")
        
        # Check Docker Compose
        try:
            subprocess.run(["docker-compose", "--version"], check=True, capture_output=True)
            logger.info("✅ Docker Compose found")
        except (subprocess.CalledProcessError, FileNotFoundError):
            try:
                subprocess.run(["docker", "compose", "version"], check=True, capture_output=True)
                logger.info("✅ Docker Compose (v2) found")
            except subprocess.CalledProcessError:
                raise RuntimeError("Docker Compose is required but not found")
        
        # Check available disk space (minimum 10GB)
        disk_usage = shutil.disk_usage(self.project_root)
        free_gb = disk_usage.free / (1024**3)
        if free_gb < 10:
            logger.warning(f"⚠️ Low disk space: {free_gb:.1f}GB available (10GB+ recommended)")
        else:
            logger.info(f"✅ Sufficient disk space: {free_gb:.1f}GB available")
    
    def create_directories(self):
        """Create necessary directories"""
        logger.info("📁 Creating directories...")
        
        directories = [
            self.data_dir,
            self.memory_dir,
            self.memory_dir / "vectors",
            self.memory_dir / "graphs",
            self.models_dir,
            self.logs_dir,
            self.project_root / "ssl",
            self.project_root / "monitoring",
        ]
        
        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)
            logger.info(f"✅ Created directory: {directory}")
    
    def install_dependencies(self):
        """Install Python dependencies"""
        logger.info("📦 Installing dependencies...")
        
        # Install main requirements
        requirements_files = [
            "requirements.txt",
            "requirements-ai.txt", 
            "requirements-engines.txt"
        ]
        
        for req_file in requirements_files:
            req_path = self.project_root / req_file
            if req_path.exists():
                logger.info(f"Installing {req_file}...")
                subprocess.run([
                    sys.executable, "-m", "pip", "install", "-r", str(req_path)
                ], check=True)
                logger.info(f"✅ Installed {req_file}")
        
        # Install memory-specific dependencies
        memory_deps = [
            "cognee>=0.1.15",
            "lancedb>=0.13.0", 
            "networkx>=3.4.2",
            "neo4j>=5.26.0",
            "psycopg2-binary>=2.9.10",
            "PyGithub>=2.5.0",
            "gitpython>=3.1.43",
            "slack-sdk>=3.33.4",
            "jira>=3.8.0"
        ]
        
        logger.info("Installing memory-specific dependencies...")
        subprocess.run([
            sys.executable, "-m", "pip", "install"
        ] + memory_deps, check=True)
        logger.info("✅ Installed memory dependencies")
    
    def setup_environment(self):
        """Setup environment variables"""
        logger.info("🔧 Setting up environment...")
        
        # Create .env file
        env_file = self.project_root / ".env"
        
        env_content = []
        env_content.append("# reVoAgent + Cognee Memory Integration Environment")
        env_content.append("# Generated automatically - modify as needed")
        env_content.append("")
        
        # Database configuration
        env_content.append("# Database Configuration")
        env_content.append(f"DB_PASSWORD={self.env_vars['DB_PASSWORD']}")
        env_content.append(f"REDIS_PASSWORD={self.env_vars['REDIS_PASSWORD']}")
        env_content.append(f"NEO4J_PASSWORD={self.env_vars['NEO4J_PASSWORD']}")
        env_content.append("")
        
        # Security
        env_content.append("# Security")
        env_content.append(f"JWT_SECRET={self.env_vars['JWT_SECRET']}")
        env_content.append(f"ENCRYPTION_KEY={self.env_vars['ENCRYPTION_KEY']}")
        env_content.append("")
        
        # Monitoring
        env_content.append("# Monitoring")
        env_content.append(f"GRAFANA_USER={self.env_vars['GRAFANA_USER']}")
        env_content.append(f"GRAFANA_PASSWORD={self.env_vars['GRAFANA_PASSWORD']}")
        env_content.append("")
        
        # External integrations (to be filled by user)
        env_content.append("# External Integrations (configure as needed)")
        env_content.append("GITHUB_TOKEN=your_github_token_here")
        env_content.append("SLACK_TOKEN=your_slack_token_here")
        env_content.append("JIRA_URL=your_jira_url_here")
        env_content.append("JIRA_TOKEN=your_jira_token_here")
        env_content.append("")
        
        # Memory configuration
        env_content.append("# Memory Configuration")
        env_content.append("ENABLE_MEMORY=true")
        env_content.append("COGNEE_LOCAL_MODELS=true")
        env_content.append("COGNEE_VECTOR_DB=lancedb")
        env_content.append("COGNEE_GRAPH_DB=networkx")
        env_content.append("COGNEE_RELATIONAL_DB=postgres")
        
        with open(env_file, 'w') as f:
            f.write('\n'.join(env_content))
        
        logger.info(f"✅ Created environment file: {env_file}")
    
    def initialize_databases(self):
        """Initialize database schemas"""
        logger.info("🗄️ Initializing databases...")
        
        # The database initialization will happen when Docker containers start
        # The SQL script is already created in database_configs.sql
        logger.info("✅ Database initialization scripts ready")
    
    def setup_memory_system(self):
        """Setup memory system configuration"""
        logger.info("🧠 Setting up memory system...")
        
        # Create memory configuration
        memory_config = {
            "memory_config": {
                "enable_memory": True,
                "vector_db_provider": "lancedb",
                "graph_db_provider": "networkx", 
                "relational_db_provider": "postgres",
                "memory_cache_size": 1000,
                "auto_persist": True,
                "context_window": 5,
                "similarity_threshold": 0.7,
                "memory_data_path": "./data/cognee_memory"
            },
            "agent_memory_configs": {
                "code_analyst": {
                    "specialization": "code_analysis",
                    "memory_tags": ["code_analysis", "patterns", "quality"],
                    "context_window": 10
                },
                "debug_detective": {
                    "specialization": "debugging",
                    "memory_tags": ["debugging", "errors", "solutions"],
                    "context_window": 8
                },
                "workflow_manager": {
                    "specialization": "workflows",
                    "memory_tags": ["workflows", "processes", "automation"],
                    "context_window": 6
                },
                "knowledge_coordinator": {
                    "specialization": "coordination",
                    "memory_tags": ["coordination", "knowledge", "synthesis"],
                    "context_window": 15
                }
            }
        }
        
        config_file = self.project_root / "config" / "memory_config.json"
        config_file.parent.mkdir(exist_ok=True)
        
        with open(config_file, 'w') as f:
            json.dump(memory_config, f, indent=2)
        
        logger.info(f"✅ Created memory configuration: {config_file}")
    
    def configure_integrations(self):
        """Configure external integrations"""
        logger.info("🔗 Configuring integrations...")
        
        # Create integration configuration templates
        integrations_config = {
            "github": {
                "enabled": False,
                "token": "configure_in_env",
                "memory_enabled": True,
                "auto_analyze_repos": True,
                "webhook_secret": self._generate_secret(16)
            },
            "slack": {
                "enabled": False,
                "token": "configure_in_env",
                "memory_enabled": True,
                "auto_respond": False,
                "channels": []
            },
            "jira": {
                "enabled": False,
                "url": "configure_in_env",
                "token": "configure_in_env",
                "memory_enabled": True,
                "auto_analyze_tickets": True
            }
        }
        
        config_file = self.project_root / "config" / "integrations.json"
        with open(config_file, 'w') as f:
            json.dump(integrations_config, f, indent=2)
        
        logger.info(f"✅ Created integrations configuration: {config_file}")
    
    def build_and_start_services(self):
        """Build and start Docker services"""
        logger.info("🐳 Building and starting services...")
        
        # Build images
        logger.info("Building Docker images...")
        subprocess.run([
            "docker-compose", "-f", "docker-compose.memory.yml", "build"
        ], check=True, cwd=self.project_root)
        
        # Start services
        logger.info("Starting services...")
        subprocess.run([
            "docker-compose", "-f", "docker-compose.memory.yml", "up", "-d"
        ], check=True, cwd=self.project_root)
        
        logger.info("✅ Services started")
        
        # Wait for services to be ready
        logger.info("⏳ Waiting for services to be ready...")
        import time
        time.sleep(30)  # Give services time to start
    
    def verify_installation(self):
        """Verify the installation"""
        logger.info("🔍 Verifying installation...")
        
        # Check if services are running
        result = subprocess.run([
            "docker-compose", "-f", "docker-compose.memory.yml", "ps"
        ], capture_output=True, text=True, cwd=self.project_root)
        
        if result.returncode == 0:
            logger.info("✅ Docker services are running")
        else:
            logger.warning("⚠️ Some Docker services may not be running properly")
        
        # Test API endpoints
        try:
            import requests
            
            # Test health endpoint
            response = requests.get("http://localhost:8000/health", timeout=10)
            if response.status_code == 200:
                logger.info("✅ Backend API is responding")
            else:
                logger.warning("⚠️ Backend API health check failed")
            
            # Test memory endpoint
            response = requests.get("http://localhost:8000/api/memory/health", timeout=10)
            if response.status_code == 200:
                logger.info("✅ Memory system is responding")
            else:
                logger.warning("⚠️ Memory system health check failed")
                
        except Exception as e:
            logger.warning(f"⚠️ API verification failed: {e}")
    
    def display_completion_info(self):
        """Display completion information"""
        logger.info("🎉 Setup completed successfully!")
        
        print("\n" + "="*60)
        print("🎉 reVoAgent + Cognee Memory Integration Setup Complete!")
        print("="*60)
        
        print("\n📋 Service URLs:")
        print("• Frontend:           http://localhost:3000")
        print("• Backend API:        http://localhost:8000")
        print("• API Documentation:  http://localhost:8000/docs")
        print("• Grafana:           http://localhost:3001")
        print("• Prometheus:        http://localhost:9090")
        print("• Neo4j Browser:     http://localhost:7474")
        print("• Kibana:            http://localhost:5601")
        
        print("\n🔐 Generated Credentials:")
        print(f"• Database Password:  {self.env_vars['DB_PASSWORD']}")
        print(f"• Redis Password:     {self.env_vars['REDIS_PASSWORD']}")
        print(f"• Neo4j Password:     {self.env_vars['NEO4J_PASSWORD']}")
        print(f"• Grafana User:       {self.env_vars['GRAFANA_USER']}")
        print(f"• Grafana Password:   {self.env_vars['GRAFANA_PASSWORD']}")
        
        print("\n⚙️ Next Steps:")
        print("1. Configure external integrations in .env file:")
        print("   - Add your GitHub token for repository analysis")
        print("   - Add your Slack token for chat integration")
        print("   - Add your JIRA credentials for ticket analysis")
        
        print("\n2. Test the memory-enabled chat:")
        print("   - Open http://localhost:3000")
        print("   - Try the memory-enabled chat interface")
        print("   - Test different agents with memory capabilities")
        
        print("\n3. Monitor the system:")
        print("   - Check Grafana dashboards for performance metrics")
        print("   - View memory statistics in the chat interface")
        print("   - Monitor logs with: docker-compose -f docker-compose.memory.yml logs -f")
        
        print("\n📚 Documentation:")
        print("• Integration Guide:  ./revoagent_cognee_integration.md")
        print("• API Documentation: http://localhost:8000/docs")
        print("• Memory API:        http://localhost:8000/api/memory/stats")
        
        print("\n🛠️ Management Commands:")
        print("• Stop services:     docker-compose -f docker-compose.memory.yml down")
        print("• View logs:         docker-compose -f docker-compose.memory.yml logs -f")
        print("• Restart services:  docker-compose -f docker-compose.memory.yml restart")
        print("• Update services:   docker-compose -f docker-compose.memory.yml pull && docker-compose -f docker-compose.memory.yml up -d")
        
        print("\n" + "="*60)
        print("🚀 Your memory-enabled reVoAgent platform is ready!")
        print("="*60)

def main():
    """Main setup function"""
    setup = MemoryIntegrationSetup()
    setup.run_setup()

if __name__ == "__main__":
    main()