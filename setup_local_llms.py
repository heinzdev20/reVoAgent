"""
Setup Script for Local LLM Servers
Helps set up DeepSeek R1 0528 and Llama for local development
"""

import asyncio
import json
import os
import subprocess
import sys
import time
from pathlib import Path
from typing import Dict, Any, Optional
import httpx

class LLMServerSetup:
    """Setup and manage local LLM servers."""
    
    def __init__(self):
        self.deepseek_port = 8001
        self.llama_port = 11434
        self.deepseek_endpoint = f"http://localhost:{self.deepseek_port}"
        self.llama_endpoint = f"http://localhost:{self.llama_port}"
    
    def print_banner(self):
        """Print setup banner."""
        print("🚀 ReVo AI Local LLM Setup")
        print("=" * 50)
        print("Setting up local LLM servers for cost optimization:")
        print("  🧠 DeepSeek R1 0528 (Primary)")
        print("  🦙 Llama 3.1 8B (Secondary)")
        print("=" * 50)
    
    def check_requirements(self) -> Dict[str, bool]:
        """Check system requirements."""
        print("\n📋 Checking system requirements...")
        
        requirements = {
            "python": False,
            "docker": False,
            "curl": False,
            "git": False
        }
        
        # Check Python
        try:
            result = subprocess.run([sys.executable, "--version"], capture_output=True, text=True)
            if result.returncode == 0:
                requirements["python"] = True
                print(f"  ✅ Python: {result.stdout.strip()}")
            else:
                print("  ❌ Python: Not found")
        except:
            print("  ❌ Python: Not found")
        
        # Check Docker
        try:
            result = subprocess.run(["docker", "--version"], capture_output=True, text=True)
            if result.returncode == 0:
                requirements["docker"] = True
                print(f"  ✅ Docker: {result.stdout.strip()}")
            else:
                print("  ❌ Docker: Not found")
        except:
            print("  ❌ Docker: Not found")
        
        # Check curl
        try:
            result = subprocess.run(["curl", "--version"], capture_output=True, text=True)
            if result.returncode == 0:
                requirements["curl"] = True
                print("  ✅ curl: Available")
            else:
                print("  ❌ curl: Not found")
        except:
            print("  ❌ curl: Not found")
        
        # Check git
        try:
            result = subprocess.run(["git", "--version"], capture_output=True, text=True)
            if result.returncode == 0:
                requirements["git"] = True
                print(f"  ✅ Git: {result.stdout.strip()}")
            else:
                print("  ❌ Git: Not found")
        except:
            print("  ❌ Git: Not found")
        
        return requirements
    
    def setup_ollama(self) -> bool:
        """Setup Ollama for Llama models."""
        print("\n🦙 Setting up Ollama for Llama models...")
        
        # Check if Ollama is already installed
        try:
            result = subprocess.run(["ollama", "--version"], capture_output=True, text=True)
            if result.returncode == 0:
                print("  ✅ Ollama already installed")
                return self.setup_llama_model()
        except:
            pass
        
        print("  📥 Installing Ollama...")
        
        # Install Ollama (Linux/macOS)
        if sys.platform.startswith("linux") or sys.platform == "darwin":
            try:
                result = subprocess.run([
                    "curl", "-fsSL", "https://ollama.ai/install.sh"
                ], capture_output=True, text=True)
                
                if result.returncode == 0:
                    # Run the install script
                    install_process = subprocess.run(
                        ["sh"], 
                        input=result.stdout, 
                        text=True, 
                        capture_output=True
                    )
                    
                    if install_process.returncode == 0:
                        print("  ✅ Ollama installed successfully")
                        return self.setup_llama_model()
                    else:
                        print(f"  ❌ Ollama installation failed: {install_process.stderr}")
                        return False
                else:
                    print("  ❌ Failed to download Ollama installer")
                    return False
            except Exception as e:
                print(f"  ❌ Error installing Ollama: {e}")
                return False
        else:
            print("  ⚠️  Please install Ollama manually from https://ollama.ai/")
            print("     Then run this script again")
            return False
    
    def setup_llama_model(self) -> bool:
        """Setup Llama model in Ollama."""
        print("  📦 Setting up Llama 3.1 8B model...")
        
        try:
            # Start Ollama service
            print("  🔄 Starting Ollama service...")
            subprocess.Popen(["ollama", "serve"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            time.sleep(5)  # Wait for service to start
            
            # Pull Llama model
            print("  📥 Downloading Llama 3.1 8B model (this may take a while)...")
            result = subprocess.run(
                ["ollama", "pull", "llama3.1:8b"], 
                capture_output=True, 
                text=True,
                timeout=1800  # 30 minutes timeout
            )
            
            if result.returncode == 0:
                print("  ✅ Llama 3.1 8B model ready")
                return True
            else:
                print(f"  ❌ Failed to download Llama model: {result.stderr}")
                return False
                
        except subprocess.TimeoutExpired:
            print("  ⏰ Model download timed out. Please try again with a better internet connection.")
            return False
        except Exception as e:
            print(f"  ❌ Error setting up Llama model: {e}")
            return False
    
    def setup_deepseek_docker(self) -> bool:
        """Setup DeepSeek R1 0528 using Docker."""
        print("\n🧠 Setting up DeepSeek R1 0528...")
        
        # Check if Docker is available
        try:
            subprocess.run(["docker", "--version"], capture_output=True, check=True)
        except:
            print("  ❌ Docker is required for DeepSeek setup")
            return False
        
        # Create Docker run command for DeepSeek
        docker_cmd = [
            "docker", "run", "-d",
            "--name", "deepseek-r1",
            "-p", f"{self.deepseek_port}:8000",
            "--gpus", "all",  # Use GPU if available
            "-e", "MODEL_NAME=deepseek-r1-0528",
            "deepseek/deepseek-r1:latest"
        ]
        
        try:
            print("  🐳 Starting DeepSeek Docker container...")
            result = subprocess.run(docker_cmd, capture_output=True, text=True)
            
            if result.returncode == 0:
                print("  ✅ DeepSeek container started")
                print("  ⏳ Waiting for model to load...")
                time.sleep(30)  # Wait for model to load
                return True
            else:
                print(f"  ❌ Failed to start DeepSeek container: {result.stderr}")
                
                # Try alternative setup
                return self.setup_deepseek_alternative()
                
        except Exception as e:
            print(f"  ❌ Error starting DeepSeek: {e}")
            return self.setup_deepseek_alternative()
    
    def setup_deepseek_alternative(self) -> bool:
        """Alternative DeepSeek setup using vLLM or similar."""
        print("  🔄 Trying alternative DeepSeek setup...")
        
        # For now, we'll create a mock server for testing
        print("  ⚠️  Creating mock DeepSeek server for testing...")
        
        mock_server_code = '''
import json
import time
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uvicorn

app = FastAPI(title="Mock DeepSeek R1 Server")

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    model: str
    messages: List[ChatMessage]
    max_tokens: Optional[int] = 4000
    temperature: Optional[float] = 0.7
    tools: Optional[List[Dict[str, Any]]] = None
    tool_choice: Optional[str] = None

@app.post("/v1/chat/completions")
async def chat_completions(request: ChatRequest):
    # Simulate processing time
    await asyncio.sleep(0.5)
    
    # Get the last user message
    user_message = ""
    for msg in reversed(request.messages):
        if msg.role == "user":
            user_message = msg.content
            break
    
    # Generate response based on tools
    if request.tools and any("run_terminal_command" in str(tool) for tool in request.tools):
        # Function calling response
        if "ls" in user_message.lower() or "list" in user_message.lower():
            return {
                "choices": [{
                    "message": {
                        "content": "",
                        "tool_calls": [{
                            "function": {
                                "name": "run_terminal_command",
                                "arguments": json.dumps({"command": "ls -la"})
                            }
                        }]
                    }
                }],
                "usage": {"total_tokens": 50},
                "model": "deepseek-r1-0528-mock"
            }
    
    # Regular response
    responses = [
        "Hello! I'm DeepSeek R1 0528, ready to help you with development tasks.",
        "I understand your request. How can I assist you with coding today?",
        "I'm here to help with your development needs. What would you like me to do?",
        f"I received your message: '{user_message}'. How can I help you further?"
    ]
    
    import random
    response_content = random.choice(responses)
    
    return {
        "choices": [{
            "message": {
                "content": response_content,
                "tool_calls": None
            }
        }],
        "usage": {"total_tokens": len(response_content.split()) + len(user_message.split())},
        "model": "deepseek-r1-0528-mock"
    }

@app.get("/health")
async def health():
    return {"status": "healthy", "model": "deepseek-r1-0528-mock"}

if __name__ == "__main__":
    import asyncio
    uvicorn.run(app, host="0.0.0.0", port=8001)
'''
        
        # Write mock server to file
        mock_server_path = Path("mock_deepseek_server.py")
        with open(mock_server_path, "w") as f:
            f.write(mock_server_code)
        
        print(f"  📝 Mock server created at {mock_server_path}")
        print("  🚀 To start the mock DeepSeek server, run:")
        print(f"     python {mock_server_path}")
        
        return True
    
    async def test_servers(self) -> Dict[str, bool]:
        """Test if LLM servers are responding."""
        print("\n🧪 Testing LLM servers...")
        
        results = {
            "deepseek": False,
            "llama": False
        }
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            # Test DeepSeek
            try:
                response = await client.get(f"{self.deepseek_endpoint}/health")
                if response.status_code == 200:
                    results["deepseek"] = True
                    print("  ✅ DeepSeek server responding")
                else:
                    print(f"  ❌ DeepSeek server error: {response.status_code}")
            except Exception as e:
                print(f"  ❌ DeepSeek server not responding: {e}")
            
            # Test Llama (Ollama)
            try:
                response = await client.get(f"{self.llama_endpoint}/api/tags")
                if response.status_code == 200:
                    results["llama"] = True
                    print("  ✅ Llama server responding")
                else:
                    print(f"  ❌ Llama server error: {response.status_code}")
            except Exception as e:
                print(f"  ❌ Llama server not responding: {e}")
        
        return results
    
    def create_env_file(self):
        """Create .env file with LLM configurations."""
        print("\n📝 Creating .env file...")
        
        env_content = f"""# ReVo AI LLM Configuration

# DeepSeek R1 0528 Local (Primary - Free)
DEEPSEEK_ENDPOINT={self.deepseek_endpoint}
DEEPSEEK_MODEL=deepseek-r1-0528
DEEPSEEK_MAX_TOKENS=4000
DEEPSEEK_TEMPERATURE=0.7
DEEPSEEK_TIMEOUT=30
DEEPSEEK_ENABLED=true

# Llama Local (Secondary - Free)
LLAMA_ENDPOINT={self.llama_endpoint}
LLAMA_MODEL=llama3.1:8b
LLAMA_MAX_TOKENS=4000
LLAMA_TEMPERATURE=0.7
LLAMA_TIMEOUT=45
LLAMA_ENABLED=true

# OpenAI (Fallback - Paid) - Add your API key
# OPENAI_API_KEY=your_openai_api_key_here
# OPENAI_MODEL=gpt-4-turbo-preview
# OPENAI_MAX_TOKENS=4000
# OPENAI_TEMPERATURE=0.7
# OPENAI_TIMEOUT=30
# OPENAI_ENABLED=true
# OPENAI_COST_PER_TOKEN=0.00003

# Anthropic (Emergency Fallback - Paid) - Add your API key
# ANTHROPIC_API_KEY=your_anthropic_api_key_here
# ANTHROPIC_MODEL=claude-3-sonnet-20240229
# ANTHROPIC_MAX_TOKENS=4000
# ANTHROPIC_TEMPERATURE=0.7
# ANTHROPIC_TIMEOUT=30
# ANTHROPIC_ENABLED=true
# ANTHROPIC_COST_PER_TOKEN=0.000015
"""
        
        env_path = Path(".env")
        with open(env_path, "w") as f:
            f.write(env_content)
        
        print(f"  ✅ Environment file created at {env_path}")
        print("  💡 You can add OpenAI/Anthropic API keys for fallback support")
    
    def print_next_steps(self, test_results: Dict[str, bool]):
        """Print next steps for the user."""
        print("\n🎯 Next Steps:")
        print("=" * 30)
        
        if test_results["deepseek"] and test_results["llama"]:
            print("✅ All local LLM servers are ready!")
            print("🚀 You can now start the ReVo AI server:")
            print("   python test_revo_ai_server.py")
        else:
            print("⚠️  Some servers need attention:")
            
            if not test_results["deepseek"]:
                print("🧠 DeepSeek:")
                print("   - Start the mock server: python mock_deepseek_server.py")
                print("   - Or set up real DeepSeek R1 0528 server")
            
            if not test_results["llama"]:
                print("🦙 Llama:")
                print("   - Start Ollama: ollama serve")
                print("   - Pull model: ollama pull llama3.1:8b")
        
        print("\n📊 Test the setup:")
        print("   - Health check: curl http://localhost:8000/health")
        print("   - LLM test: curl -X POST http://localhost:8000/test/llm")
        print("   - Web interface: http://localhost:8000/test")
        
        print("\n💰 Cost Optimization:")
        print("   - Local models (DeepSeek + Llama): $0.00")
        print("   - OpenAI fallback: ~$0.03 per 1K tokens")
        print("   - Anthropic fallback: ~$0.015 per 1K tokens")

async def main():
    """Main setup function."""
    setup = LLMServerSetup()
    setup.print_banner()
    
    # Check requirements
    requirements = setup.check_requirements()
    
    if not requirements["python"]:
        print("\n❌ Python is required but not found. Please install Python 3.8+")
        return
    
    # Setup Ollama and Llama
    if requirements["curl"]:
        llama_success = setup.setup_ollama()
    else:
        print("\n⚠️  curl not found. Please install Ollama manually from https://ollama.ai/")
        llama_success = False
    
    # Setup DeepSeek
    if requirements["docker"]:
        deepseek_success = setup.setup_deepseek_docker()
    else:
        print("\n⚠️  Docker not found. Setting up mock DeepSeek server...")
        deepseek_success = setup.setup_deepseek_alternative()
    
    # Test servers
    test_results = await setup.test_servers()
    
    # Create environment file
    setup.create_env_file()
    
    # Print next steps
    setup.print_next_steps(test_results)

if __name__ == "__main__":
    asyncio.run(main())