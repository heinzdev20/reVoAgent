#!/usr/bin/env python3
"""
🚀 reVoAgent Integrated System Launcher
=====================================

This script launches the complete reVoAgent system with:
- Backend API server with enterprise security
- Frontend React application with glassmorphism UI
- Real-time WebSocket communication
- Cost-optimized AI model management
- Production-ready monitoring

Usage:
    python start_integrated_system.py [--port-backend 12001] [--port-frontend 12000]
"""

import asyncio
import subprocess
import sys
import time
import signal
import os
import json
from pathlib import Path
from typing import Optional, List
import logging
from concurrent.futures import ThreadPoolExecutor

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class IntegratedSystemLauncher:
    """Launches and manages the complete reVoAgent system"""
    
    def __init__(self, backend_port: int = 12001, frontend_port: int = 12000):
        self.backend_port = backend_port
        self.frontend_port = frontend_port
        self.processes: List[subprocess.Popen] = []
        self.running = False
        
        # Set up signal handlers for graceful shutdown
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)
    
    def _signal_handler(self, signum, frame):
        """Handle shutdown signals gracefully"""
        logger.info(f"🛑 Received signal {signum}, shutting down...")
        self.shutdown()
        sys.exit(0)
    
    def check_dependencies(self) -> bool:
        """Check if all required dependencies are available"""
        logger.info("🔍 Checking system dependencies...")
        
        # Check Python dependencies
        try:
            import fastapi
            import uvicorn
            import websockets
            logger.info("✅ Python dependencies available")
        except ImportError as e:
            logger.error(f"❌ Missing Python dependency: {e}")
            return False
        
        # Check Node.js and npm
        try:
            result = subprocess.run(['node', '--version'], capture_output=True, text=True)
            if result.returncode == 0:
                logger.info(f"✅ Node.js available: {result.stdout.strip()}")
            else:
                logger.error("❌ Node.js not available")
                return False
        except FileNotFoundError:
            logger.error("❌ Node.js not found")
            return False
        
        try:
            result = subprocess.run(['npm', '--version'], capture_output=True, text=True)
            if result.returncode == 0:
                logger.info(f"✅ npm available: {result.stdout.strip()}")
            else:
                logger.error("❌ npm not available")
                return False
        except FileNotFoundError:
            logger.error("❌ npm not found")
            return False
        
        return True
    
    def setup_environment(self):
        """Set up the environment for the integrated system"""
        logger.info("🔧 Setting up environment...")
        
        # Set Python path
        current_dir = Path(__file__).parent
        python_path = f"{current_dir}/src:{current_dir}"
        os.environ['PYTHONPATH'] = python_path
        
        # Set environment variables
        os.environ['REVO_BACKEND_PORT'] = str(self.backend_port)
        os.environ['REVO_FRONTEND_PORT'] = str(self.frontend_port)
        os.environ['REVO_ENVIRONMENT'] = 'development'
        
        logger.info(f"✅ Environment configured - Backend: {self.backend_port}, Frontend: {self.frontend_port}")
    
    def install_frontend_dependencies(self) -> bool:
        """Install frontend dependencies if needed"""
        frontend_dir = Path(__file__).parent / "frontend"
        package_json = frontend_dir / "package.json"
        node_modules = frontend_dir / "node_modules"
        
        if not package_json.exists():
            logger.error("❌ Frontend package.json not found")
            return False
        
        if not node_modules.exists():
            logger.info("📦 Installing frontend dependencies...")
            try:
                result = subprocess.run(
                    ['npm', 'install'],
                    cwd=frontend_dir,
                    capture_output=True,
                    text=True,
                    timeout=300  # 5 minutes timeout
                )
                if result.returncode == 0:
                    logger.info("✅ Frontend dependencies installed")
                    return True
                else:
                    logger.error(f"❌ Failed to install frontend dependencies: {result.stderr}")
                    return False
            except subprocess.TimeoutExpired:
                logger.error("❌ Frontend dependency installation timed out")
                return False
            except Exception as e:
                logger.error(f"❌ Error installing frontend dependencies: {e}")
                return False
        else:
            logger.info("✅ Frontend dependencies already installed")
            return True
    
    def start_backend(self) -> Optional[subprocess.Popen]:
        """Start the backend API server"""
        logger.info("🚀 Starting backend API server...")
        
        try:
            # Create the backend startup script
            backend_script = f"""
import sys
import os
sys.path.insert(0, '{Path(__file__).parent}/src')
sys.path.insert(0, '{Path(__file__).parent}')

from packages.api.enterprise_api_server import EnterpriseAPIServer
import asyncio
import uvicorn

async def main():
    # Initialize the enterprise API server
    api_server = EnterpriseAPIServer()
    
    # Configure uvicorn
    config = uvicorn.Config(
        app=api_server.app,
        host="0.0.0.0",
        port={self.backend_port},
        log_level="info",
        reload=False,
        access_log=True
    )
    
    server = uvicorn.Server(config)
    await server.serve()

if __name__ == "__main__":
    asyncio.run(main())
"""
            
            # Write the script to a temporary file
            script_path = Path(__file__).parent / "temp_backend_start.py"
            with open(script_path, 'w') as f:
                f.write(backend_script)
            
            # Start the backend process
            process = subprocess.Popen(
                [sys.executable, str(script_path)],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                bufsize=1,
                universal_newlines=True
            )
            
            self.processes.append(process)
            logger.info(f"✅ Backend started on port {self.backend_port} (PID: {process.pid})")
            return process
            
        except Exception as e:
            logger.error(f"❌ Failed to start backend: {e}")
            return None
    
    def start_frontend(self) -> Optional[subprocess.Popen]:
        """Start the frontend development server"""
        logger.info("🎨 Starting frontend development server...")
        
        frontend_dir = Path(__file__).parent / "frontend"
        
        try:
            # Update vite config to use the correct ports
            vite_config = f"""
import {{ defineConfig }} from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({{
  plugins: [react()],
  server: {{
    host: '0.0.0.0',
    port: {self.frontend_port},
    strictPort: true,
    cors: true,
    allowedHosts: ['*'],
    proxy: {{
      '/api': {{
        target: 'http://localhost:{self.backend_port}',
        changeOrigin: true,
        secure: false
      }},
      '/ws': {{
        target: 'ws://localhost:{self.backend_port}',
        ws: true,
        changeOrigin: true
      }}
    }}
  }},
  resolve: {{
    alias: {{
      '@': path.resolve(__dirname, './src')
    }}
  }},
  build: {{
    outDir: 'dist',
    sourcemap: true
  }}
}})
"""
            
            vite_config_path = frontend_dir / "vite.config.ts"
            with open(vite_config_path, 'w') as f:
                f.write(vite_config)
            
            # Start the frontend process
            process = subprocess.Popen(
                ['npm', 'run', 'dev'],
                cwd=frontend_dir,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                bufsize=1,
                universal_newlines=True
            )
            
            self.processes.append(process)
            logger.info(f"✅ Frontend started on port {self.frontend_port} (PID: {process.pid})")
            return process
            
        except Exception as e:
            logger.error(f"❌ Failed to start frontend: {e}")
            return None
    
    def wait_for_services(self, timeout: int = 60) -> bool:
        """Wait for services to be ready"""
        logger.info("⏳ Waiting for services to be ready...")
        
        import requests
        import time
        
        start_time = time.time()
        
        # Wait for backend
        backend_ready = False
        while not backend_ready and (time.time() - start_time) < timeout:
            try:
                response = requests.get(f"http://localhost:{self.backend_port}/health", timeout=5)
                if response.status_code == 200:
                    backend_ready = True
                    logger.info("✅ Backend is ready")
                else:
                    time.sleep(2)
            except:
                time.sleep(2)
        
        if not backend_ready:
            logger.error("❌ Backend failed to start within timeout")
            return False
        
        # Wait for frontend (check if port is responding)
        frontend_ready = False
        while not frontend_ready and (time.time() - start_time) < timeout:
            try:
                response = requests.get(f"http://localhost:{self.frontend_port}", timeout=5)
                if response.status_code in [200, 404]:  # 404 is OK for SPA
                    frontend_ready = True
                    logger.info("✅ Frontend is ready")
                else:
                    time.sleep(2)
            except:
                time.sleep(2)
        
        if not frontend_ready:
            logger.error("❌ Frontend failed to start within timeout")
            return False
        
        return True
    
    def monitor_processes(self):
        """Monitor running processes and restart if needed"""
        while self.running:
            for i, process in enumerate(self.processes):
                if process.poll() is not None:
                    logger.warning(f"⚠️ Process {i} (PID: {process.pid}) has stopped")
                    # Could implement restart logic here
            time.sleep(5)
    
    def display_status(self):
        """Display system status and URLs"""
        logger.info("🎉 reVoAgent Integrated System is running!")
        logger.info("=" * 60)
        logger.info(f"🌐 Frontend URL: http://localhost:{self.frontend_port}")
        logger.info(f"🔧 Backend API: http://localhost:{self.backend_port}")
        logger.info(f"📚 API Docs: http://localhost:{self.backend_port}/docs")
        logger.info(f"🔍 Health Check: http://localhost:{self.backend_port}/health")
        logger.info("=" * 60)
        logger.info("💡 Features Available:")
        logger.info("   ✅ Enterprise Security Framework")
        logger.info("   ✅ Glassmorphism UI Design")
        logger.info("   ✅ Cost-Optimized AI Models")
        logger.info("   ✅ Real-time Communication")
        logger.info("   ✅ Advanced Workflow Engine")
        logger.info("=" * 60)
        logger.info("🛑 Press Ctrl+C to stop the system")
    
    def shutdown(self):
        """Shutdown all processes gracefully"""
        logger.info("🛑 Shutting down integrated system...")
        self.running = False
        
        for i, process in enumerate(self.processes):
            if process.poll() is None:
                logger.info(f"🛑 Stopping process {i} (PID: {process.pid})")
                process.terminate()
                
                # Wait for graceful shutdown
                try:
                    process.wait(timeout=10)
                    logger.info(f"✅ Process {i} stopped gracefully")
                except subprocess.TimeoutExpired:
                    logger.warning(f"⚠️ Force killing process {i}")
                    process.kill()
        
        # Clean up temporary files
        temp_script = Path(__file__).parent / "temp_backend_start.py"
        if temp_script.exists():
            temp_script.unlink()
        
        logger.info("✅ System shutdown complete")
    
    def run(self):
        """Run the integrated system"""
        logger.info("🚀 Starting reVoAgent Integrated System...")
        
        # Check dependencies
        if not self.check_dependencies():
            logger.error("❌ Dependency check failed")
            return False
        
        # Setup environment
        self.setup_environment()
        
        # Install frontend dependencies
        if not self.install_frontend_dependencies():
            logger.error("❌ Frontend setup failed")
            return False
        
        # Start backend
        backend_process = self.start_backend()
        if not backend_process:
            logger.error("❌ Backend startup failed")
            return False
        
        # Start frontend
        frontend_process = self.start_frontend()
        if not frontend_process:
            logger.error("❌ Frontend startup failed")
            self.shutdown()
            return False
        
        # Wait for services to be ready
        if not self.wait_for_services():
            logger.error("❌ Services failed to start properly")
            self.shutdown()
            return False
        
        # Display status
        self.display_status()
        
        # Set running flag and start monitoring
        self.running = True
        
        try:
            # Monitor processes in a separate thread
            with ThreadPoolExecutor(max_workers=1) as executor:
                monitor_future = executor.submit(self.monitor_processes)
                
                # Keep main thread alive
                while self.running:
                    time.sleep(1)
                    
        except KeyboardInterrupt:
            logger.info("🛑 Received keyboard interrupt")
        finally:
            self.shutdown()
        
        return True

def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description="reVoAgent Integrated System Launcher")
    parser.add_argument("--port-backend", type=int, default=12001, help="Backend port (default: 12001)")
    parser.add_argument("--port-frontend", type=int, default=12000, help="Frontend port (default: 12000)")
    
    args = parser.parse_args()
    
    launcher = IntegratedSystemLauncher(
        backend_port=args.port_backend,
        frontend_port=args.port_frontend
    )
    
    success = launcher.run()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()