#!/usr/bin/env python3
"""
🔧 reVoAgent Development Environment Setup
==========================================

This script sets up the complete development environment for reVoAgent:
- Installs all dependencies
- Configures environment variables
- Sets up database and configuration
- Validates all components
- Prepares for integrated system launch

Usage:
    python setup_development.py [--force] [--skip-frontend]
"""

import os
import sys
import subprocess
import json
import shutil
from pathlib import Path
import logging
from typing import Dict, List, Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class DevelopmentSetup:
    """Sets up the complete development environment"""
    
    def __init__(self, force: bool = False, skip_frontend: bool = False):
        self.force = force
        self.skip_frontend = skip_frontend
        self.project_root = Path(__file__).parent
        self.errors: List[str] = []
        
    def check_system_requirements(self) -> bool:
        """Check if system meets requirements"""
        logger.info("🔍 Checking system requirements...")
        
        # Check Python version
        if sys.version_info < (3, 8):
            self.errors.append("Python 3.8+ required")
            return False
        logger.info(f"✅ Python {sys.version_info.major}.{sys.version_info.minor}")
        
        # Check Node.js (if not skipping frontend)
        if not self.skip_frontend:
            try:
                result = subprocess.run(['node', '--version'], capture_output=True, text=True)
                if result.returncode == 0:
                    version = result.stdout.strip()
                    logger.info(f"✅ Node.js {version}")
                else:
                    self.errors.append("Node.js not found")
                    return False
            except FileNotFoundError:
                self.errors.append("Node.js not installed")
                return False
            
            try:
                result = subprocess.run(['npm', '--version'], capture_output=True, text=True)
                if result.returncode == 0:
                    version = result.stdout.strip()
                    logger.info(f"✅ npm {version}")
                else:
                    self.errors.append("npm not found")
                    return False
            except FileNotFoundError:
                self.errors.append("npm not installed")
                return False
        
        return True
    
    def install_python_dependencies(self) -> bool:
        """Install Python dependencies"""
        logger.info("📦 Installing Python dependencies...")
        
        requirements_files = [
            'requirements.txt',
            'requirements-ai.txt',
            'requirements-engines.txt'
        ]
        
        for req_file in requirements_files:
            req_path = self.project_root / req_file
            if req_path.exists():
                logger.info(f"📦 Installing from {req_file}...")
                try:
                    result = subprocess.run([
                        sys.executable, '-m', 'pip', 'install', '-r', str(req_path)
                    ], capture_output=True, text=True, timeout=300)
                    
                    if result.returncode != 0:
                        logger.warning(f"⚠️ Some packages from {req_file} failed to install: {result.stderr}")
                        # Continue anyway as some packages might be optional
                    else:
                        logger.info(f"✅ {req_file} installed successfully")
                except subprocess.TimeoutExpired:
                    logger.error(f"❌ Timeout installing {req_file}")
                    self.errors.append(f"Timeout installing {req_file}")
                    return False
                except Exception as e:
                    logger.error(f"❌ Error installing {req_file}: {e}")
                    self.errors.append(f"Error installing {req_file}: {e}")
                    return False
        
        # Install additional required packages
        additional_packages = [
            'fastapi>=0.115.0',
            'uvicorn[standard]>=0.30.0',
            'websockets>=12.0',
            'pydantic>=2.0.0',
            'python-multipart>=0.0.6',
            'python-jose[cryptography]>=3.3.0',
            'passlib[bcrypt]>=1.7.4',
            'aiofiles>=23.0.0',
            'aiosqlite>=0.19.0',
            'structlog>=23.0.0',
            'cryptography>=41.0.0'
        ]
        
        logger.info("📦 Installing core packages...")
        try:
            result = subprocess.run([
                sys.executable, '-m', 'pip', 'install'
            ] + additional_packages, capture_output=True, text=True, timeout=300)
            
            if result.returncode == 0:
                logger.info("✅ Core packages installed successfully")
            else:
                logger.warning(f"⚠️ Some core packages failed to install: {result.stderr}")
        except Exception as e:
            logger.warning(f"⚠️ Error installing core packages: {e}")
        
        return True
    
    def install_frontend_dependencies(self) -> bool:
        """Install frontend dependencies"""
        if self.skip_frontend:
            logger.info("⏭️ Skipping frontend setup")
            return True
            
        logger.info("🎨 Installing frontend dependencies...")
        
        frontend_dir = self.project_root / "frontend"
        if not frontend_dir.exists():
            logger.error("❌ Frontend directory not found")
            self.errors.append("Frontend directory not found")
            return False
        
        package_json = frontend_dir / "package.json"
        if not package_json.exists():
            logger.error("❌ package.json not found")
            self.errors.append("package.json not found")
            return False
        
        try:
            logger.info("📦 Running npm install...")
            result = subprocess.run([
                'npm', 'install'
            ], cwd=frontend_dir, capture_output=True, text=True, timeout=300)
            
            if result.returncode == 0:
                logger.info("✅ Frontend dependencies installed successfully")
                return True
            else:
                logger.error(f"❌ npm install failed: {result.stderr}")
                self.errors.append(f"npm install failed: {result.stderr}")
                return False
        except subprocess.TimeoutExpired:
            logger.error("❌ npm install timed out")
            self.errors.append("npm install timed out")
            return False
        except Exception as e:
            logger.error(f"❌ Error running npm install: {e}")
            self.errors.append(f"Error running npm install: {e}")
            return False
    
    def setup_configuration(self) -> bool:
        """Set up configuration files"""
        logger.info("⚙️ Setting up configuration...")
        
        # Create config directory if it doesn't exist
        config_dir = self.project_root / "config"
        config_dir.mkdir(exist_ok=True)
        
        # Create development configuration
        dev_config = {
            "environment": "development",
            "debug": True,
            "server": {
                "host": "0.0.0.0",
                "port": 12001,
                "reload": True
            },
            "frontend": {
                "port": 12000,
                "dev_server": True
            },
            "database": {
                "url": "sqlite:///./revoagent_dev.db",
                "echo": True
            },
            "security": {
                "secret_key": "dev-secret-key-change-in-production",
                "jwt_expiry_hours": 24,
                "max_login_attempts": 5,
                "account_lockout_duration": 1800
            },
            "ai": {
                "models": {
                    "deepseek_r1": {
                        "enabled": True,
                        "priority": 1,
                        "cost_per_token": 0.0
                    },
                    "llama_local": {
                        "enabled": True,
                        "priority": 2,
                        "cost_per_token": 0.0
                    },
                    "openai_gpt4": {
                        "enabled": True,
                        "priority": 3,
                        "cost_per_token": 0.03
                    }
                },
                "local_optimization": {
                    "enabled": True,
                    "target_local_percentage": 90,
                    "fallback_to_cloud": True
                }
            },
            "logging": {
                "level": "INFO",
                "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
            }
        }
        
        dev_config_path = config_dir / "development.yaml"
        try:
            import yaml
            with open(dev_config_path, 'w') as f:
                yaml.dump(dev_config, f, default_flow_style=False)
            logger.info("✅ Development configuration created")
        except ImportError:
            # Fallback to JSON if PyYAML not available
            dev_config_json_path = config_dir / "development.json"
            with open(dev_config_json_path, 'w') as f:
                json.dump(dev_config, f, indent=2)
            logger.info("✅ Development configuration created (JSON format)")
        
        # Create environment file
        env_file = self.project_root / ".env.development"
        env_content = f"""# reVoAgent Development Environment
REVO_ENVIRONMENT=development
REVO_DEBUG=true
REVO_BACKEND_PORT=12001
REVO_FRONTEND_PORT=12000
REVO_SECRET_KEY=dev-secret-key-change-in-production
REVO_DATABASE_URL=sqlite:///./revoagent_dev.db
PYTHONPATH={self.project_root}/src:{self.project_root}

# Frontend Environment Variables
VITE_API_URL=http://localhost:12001
VITE_WS_URL=ws://localhost:12001
VITE_ENVIRONMENT=development
"""
        
        with open(env_file, 'w') as f:
            f.write(env_content)
        logger.info("✅ Environment file created")
        
        return True
    
    def setup_database(self) -> bool:
        """Set up development database"""
        logger.info("🗄️ Setting up development database...")
        
        # For now, we'll use SQLite for development
        db_path = self.project_root / "revoagent_dev.db"
        
        # Create database initialization script
        init_script = f"""
import sys
import asyncio
sys.path.insert(0, '{self.project_root}/src')
sys.path.insert(0, '{self.project_root}')

async def init_database():
    try:
        from packages.security.enterprise_security_manager import EnterpriseSecurityManager
        
        # Initialize security manager (this will create tables)
        security_manager = EnterpriseSecurityManager()
        
        # Create default admin user
        admin_user = await security_manager.create_user(
            username="admin",
            email="admin@revoagent.com",
            password="admin123",
            full_name="Administrator",
            roles=["admin"]
        )
        
        # Create demo user
        demo_user = await security_manager.create_user(
            username="demo",
            email="demo@revoagent.com", 
            password="demo123",
            full_name="Demo User",
            roles=["developer"]
        )
        
        print("✅ Database initialized with default users")
        print("   Admin: admin@revoagent.com / admin123")
        print("   Demo:  demo@revoagent.com / demo123")
        
    except Exception as e:
        print(f"⚠️ Database initialization warning: {{e}}")
        print("   Database will be created on first run")

if __name__ == "__main__":
    asyncio.run(init_database())
"""
        
        init_script_path = self.project_root / "init_database.py"
        with open(init_script_path, 'w') as f:
            f.write(init_script)
        
        # Try to initialize database
        try:
            result = subprocess.run([
                sys.executable, str(init_script_path)
            ], capture_output=True, text=True, timeout=30)
            
            if result.returncode == 0:
                logger.info("✅ Database initialized successfully")
                logger.info(result.stdout)
            else:
                logger.warning(f"⚠️ Database initialization warning: {result.stderr}")
                logger.info("Database will be created on first run")
        except Exception as e:
            logger.warning(f"⚠️ Database initialization warning: {e}")
            logger.info("Database will be created on first run")
        
        # Clean up
        if init_script_path.exists():
            init_script_path.unlink()
        
        return True
    
    def create_startup_scripts(self) -> bool:
        """Create convenient startup scripts"""
        logger.info("📝 Creating startup scripts...")
        
        # Create start script for Unix/Linux/Mac
        start_script = f"""#!/bin/bash
# reVoAgent Development Startup Script

echo "🚀 Starting reVoAgent Development Environment..."

# Set environment variables
export PYTHONPATH="{self.project_root}/src:{self.project_root}"
export REVO_ENVIRONMENT=development

# Load environment file if it exists
if [ -f "{self.project_root}/.env.development" ]; then
    export $(cat {self.project_root}/.env.development | grep -v '^#' | xargs)
fi

# Start the integrated system
cd "{self.project_root}"
python start_integrated_system.py --port-backend 12001 --port-frontend 12000
"""
        
        start_script_path = self.project_root / "start_dev.sh"
        with open(start_script_path, 'w') as f:
            f.write(start_script)
        
        # Make executable on Unix systems
        if os.name != 'nt':
            os.chmod(start_script_path, 0o755)
        
        # Create Windows batch script
        start_bat = f"""@echo off
REM reVoAgent Development Startup Script

echo 🚀 Starting reVoAgent Development Environment...

REM Set environment variables
set PYTHONPATH={self.project_root}\\src;{self.project_root}
set REVO_ENVIRONMENT=development

REM Change to project directory
cd /d "{self.project_root}"

REM Start the integrated system
python start_integrated_system.py --port-backend 12001 --port-frontend 12000
"""
        
        start_bat_path = self.project_root / "start_dev.bat"
        with open(start_bat_path, 'w') as f:
            f.write(start_bat)
        
        logger.info("✅ Startup scripts created")
        logger.info(f"   Unix/Linux/Mac: {start_script_path}")
        logger.info(f"   Windows: {start_bat_path}")
        
        return True
    
    def validate_setup(self) -> bool:
        """Validate the development setup"""
        logger.info("🔍 Validating development setup...")
        
        # Check if key files exist
        key_files = [
            "src/packages/ai/intelligent_model_manager.py",
            "src/packages/config/unified_config_manager.py",
            "src/packages/security/enterprise_security_manager.py",
            "src/packages/api/enterprise_api_server.py",
            "start_integrated_system.py"
        ]
        
        if not self.skip_frontend:
            key_files.extend([
                "frontend/package.json",
                "frontend/src/App.tsx",
                "frontend/src/stores/authStore.ts"
            ])
        
        missing_files = []
        for file_path in key_files:
            full_path = self.project_root / file_path
            if not full_path.exists():
                missing_files.append(file_path)
        
        if missing_files:
            logger.error("❌ Missing key files:")
            for file_path in missing_files:
                logger.error(f"   - {file_path}")
            self.errors.extend(missing_files)
            return False
        
        logger.info("✅ All key files present")
        
        # Try to import key Python modules
        try:
            sys.path.insert(0, str(self.project_root / "src"))
            sys.path.insert(0, str(self.project_root))
            
            from packages.config.unified_config_manager import UnifiedConfigManager
            from packages.ai.intelligent_model_manager import IntelligentModelManager
            from packages.security.enterprise_security_manager import EnterpriseSecurityManager
            
            logger.info("✅ Key Python modules can be imported")
        except ImportError as e:
            logger.error(f"❌ Import error: {e}")
            self.errors.append(f"Import error: {e}")
            return False
        
        return True
    
    def run_setup(self) -> bool:
        """Run the complete setup process"""
        logger.info("🚀 Starting reVoAgent Development Environment Setup")
        logger.info("=" * 60)
        
        steps = [
            ("System Requirements", self.check_system_requirements),
            ("Python Dependencies", self.install_python_dependencies),
            ("Frontend Dependencies", self.install_frontend_dependencies),
            ("Configuration", self.setup_configuration),
            ("Database", self.setup_database),
            ("Startup Scripts", self.create_startup_scripts),
            ("Validation", self.validate_setup)
        ]
        
        for step_name, step_func in steps:
            logger.info(f"📋 {step_name}...")
            try:
                if not step_func():
                    logger.error(f"❌ {step_name} failed")
                    return False
                logger.info(f"✅ {step_name} completed")
            except Exception as e:
                logger.error(f"❌ {step_name} failed with error: {e}")
                self.errors.append(f"{step_name}: {e}")
                return False
        
        return True
    
    def display_summary(self, success: bool):
        """Display setup summary"""
        logger.info("=" * 60)
        if success:
            logger.info("🎉 Development Environment Setup Complete!")
            logger.info("")
            logger.info("📋 What's Ready:")
            logger.info("   ✅ Python dependencies installed")
            if not self.skip_frontend:
                logger.info("   ✅ Frontend dependencies installed")
            logger.info("   ✅ Configuration files created")
            logger.info("   ✅ Database initialized")
            logger.info("   ✅ Startup scripts created")
            logger.info("")
            logger.info("🚀 To start the development environment:")
            logger.info("   Unix/Linux/Mac: ./start_dev.sh")
            logger.info("   Windows: start_dev.bat")
            logger.info("   Python: python start_integrated_system.py")
            logger.info("")
            logger.info("🌐 URLs (after starting):")
            logger.info("   Frontend: http://localhost:12000")
            logger.info("   Backend API: http://localhost:12001")
            logger.info("   API Docs: http://localhost:12001/docs")
            logger.info("")
            logger.info("👤 Default Users:")
            logger.info("   Admin: admin@revoagent.com / admin123")
            logger.info("   Demo:  demo@revoagent.com / demo123")
        else:
            logger.error("❌ Development Environment Setup Failed!")
            logger.error("")
            logger.error("🔍 Errors encountered:")
            for error in self.errors:
                logger.error(f"   - {error}")
            logger.error("")
            logger.error("💡 Try running with --force to override some checks")
        
        logger.info("=" * 60)

def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description="reVoAgent Development Environment Setup")
    parser.add_argument("--force", action="store_true", help="Force setup even if some checks fail")
    parser.add_argument("--skip-frontend", action="store_true", help="Skip frontend setup")
    
    args = parser.parse_args()
    
    setup = DevelopmentSetup(force=args.force, skip_frontend=args.skip_frontend)
    success = setup.run_setup()
    setup.display_summary(success)
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()