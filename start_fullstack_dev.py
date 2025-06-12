#!/usr/bin/env python3
"""
reVoAgent Full Stack Development Startup Script
Uses port manager and existing working components
"""

import os
import sys
import time
import subprocess
import requests
import json
from pathlib import Path

class FullStackManager:
    def __init__(self):
        self.project_root = Path(__file__).parent
        self.backend_port = 12001
        self.frontend_port = 12000
        self.backend_process = None
        self.frontend_process = None
        
    def setup_logging(self):
        """Ensure logs directory exists"""
        logs_dir = self.project_root / "logs"
        logs_dir.mkdir(exist_ok=True)
        return logs_dir
    
    def run_port_manager(self, action):
        """Run port manager with specified action"""
        print(f"🔌 Running port manager: {action}")
        result = subprocess.run([
            sys.executable, "port_manager.py", f"--{action}"
        ], cwd=self.project_root, capture_output=True, text=True)
        
        if result.returncode != 0:
            print(f"❌ Port manager {action} failed: {result.stderr}")
            return False
        print(f"✅ Port manager {action} completed")
        return True
    
    def wait_for_service(self, url, service_name, max_attempts=30):
        """Wait for service to be ready"""
        print(f"⏳ Waiting for {service_name} to be ready...")
        
        for attempt in range(1, max_attempts + 1):
            try:
                response = requests.get(url, timeout=2)
                if response.status_code == 200:
                    print(f"✅ {service_name} is ready!")
                    return True
            except requests.exceptions.RequestException:
                pass
            
            print(f"   Attempt {attempt}/{max_attempts}...")
            time.sleep(1)
        
        print(f"❌ {service_name} failed to start within {max_attempts} seconds")
        return False
    
    def start_backend(self):
        """Start the backend server"""
        print(f"🖥️  Starting Backend on port {self.backend_port}...")
        
        logs_dir = self.setup_logging()
        backend_log = logs_dir / "backend.log"
        
        # Use the working simple_dev_server.py
        cmd = [
            sys.executable, "-c", f"""
import uvicorn
import sys
sys.path.append('.')
from simple_dev_server import app
uvicorn.run(app, host='0.0.0.0', port={self.backend_port})
"""
        ]
        
        with open(backend_log, 'w') as log_file:
            self.backend_process = subprocess.Popen(
                cmd,
                cwd=self.project_root,
                stdout=log_file,
                stderr=subprocess.STDOUT
            )
        
        print(f"Backend PID: {self.backend_process.pid}")
        
        # Wait for backend to be ready
        if not self.wait_for_service(f"http://localhost:{self.backend_port}/health", "Backend"):
            self.cleanup()
            return False
        
        return True
    
    def start_frontend(self):
        """Start the frontend server"""
        print(f"🌐 Starting Frontend on port {self.frontend_port}...")
        
        logs_dir = self.setup_logging()
        frontend_log = logs_dir / "frontend.log"
        frontend_dir = self.project_root / "frontend"
        
        # Check if node_modules exist
        if not (frontend_dir / "node_modules").exists():
            print("📦 Installing frontend dependencies...")
            result = subprocess.run(["npm", "install"], cwd=frontend_dir)
            if result.returncode != 0:
                print("❌ Failed to install frontend dependencies")
                return False
        
        # Start frontend
        cmd = ["npm", "run", "dev", "--", "--port", str(self.frontend_port), "--host", "0.0.0.0"]
        
        with open(frontend_log, 'w') as log_file:
            self.frontend_process = subprocess.Popen(
                cmd,
                cwd=frontend_dir,
                stdout=log_file,
                stderr=subprocess.STDOUT
            )
        
        print(f"Frontend PID: {self.frontend_process.pid}")
        
        # Wait for frontend to be ready
        if not self.wait_for_service(f"http://localhost:{self.frontend_port}", "Frontend"):
            self.cleanup()
            return False
        
        return True
    
    def save_pids(self):
        """Save process IDs for cleanup"""
        logs_dir = self.setup_logging()
        
        if self.backend_process:
            with open(logs_dir / "backend.pid", 'w') as f:
                f.write(str(self.backend_process.pid))
        
        if self.frontend_process:
            with open(logs_dir / "frontend.pid", 'w') as f:
                f.write(str(self.frontend_process.pid))
    
    def test_services(self):
        """Test that services are working"""
        print("🧪 Testing services...")
        
        try:
            # Test backend health
            response = requests.get(f"http://localhost:{self.backend_port}/health")
            health_data = response.json()
            print("Backend health check:")
            print(json.dumps(health_data, indent=2))
            
            # Test frontend
            response = requests.get(f"http://localhost:{self.frontend_port}")
            if response.status_code == 200:
                print("✅ Frontend is responding")
            
            return True
        except Exception as e:
            print(f"❌ Service test failed: {e}")
            return False
    
    def cleanup(self):
        """Cleanup processes"""
        if self.backend_process:
            self.backend_process.terminate()
        if self.frontend_process:
            self.frontend_process.terminate()
    
    def start_fullstack(self):
        """Start the full stack"""
        print("🚀 Starting reVoAgent Full Stack...")
        print("=" * 50)
        
        # Step 1: Cleanup and allocate ports
        print("🧹 Step 1: Setting up port management...")
        if not self.run_port_manager("cleanup"):
            return False
        if not self.run_port_manager("allocate"):
            return False
        
        # Step 2: Start backend
        print("🖥️  Step 2: Starting backend...")
        if not self.start_backend():
            return False
        
        # Step 3: Start frontend
        print("🌐 Step 3: Starting frontend...")
        if not self.start_frontend():
            return False
        
        # Step 4: Save PIDs
        print("💾 Step 4: Saving process information...")
        self.save_pids()
        
        # Step 5: Test services
        print("🔍 Step 5: Testing services...")
        if not self.test_services():
            return False
        
        # Step 6: Success message
        print("\n🎉 reVoAgent Full Stack Started Successfully!")
        print("=" * 50)
        print(f"📊 Service Status:")
        print(f"   Backend:  http://localhost:{self.backend_port} (PID: {self.backend_process.pid})")
        print(f"   Frontend: http://localhost:{self.frontend_port} (PID: {self.frontend_process.pid})")
        print(f"\n🌐 Access URLs:")
        print(f"   Frontend:  http://localhost:{self.frontend_port}")
        print(f"   Backend:   http://localhost:{self.backend_port}")
        print(f"   API Docs:  http://localhost:{self.backend_port}/docs")
        print(f"   Health:    http://localhost:{self.backend_port}/health")
        print(f"\n📁 Logs:")
        print(f"   Backend:   {self.project_root}/logs/backend.log")
        print(f"   Frontend:  {self.project_root}/logs/frontend.log")
        print(f"\n🛑 To stop services:")
        print(f"   python3 port_manager.py --cleanup")
        print("\n✅ Full stack is ready for development!")
        
        return True

def main():
    manager = FullStackManager()
    try:
        success = manager.start_fullstack()
        if not success:
            print("❌ Failed to start full stack")
            manager.cleanup()
            sys.exit(1)
    except KeyboardInterrupt:
        print("\n🛑 Interrupted by user")
        manager.cleanup()
        sys.exit(0)
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        manager.cleanup()
        sys.exit(1)

if __name__ == "__main__":
    main()