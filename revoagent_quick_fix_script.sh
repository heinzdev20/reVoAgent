#!/bin/bash

# reVoAgent Quick Fix Deployment Script
# This script addresses the main technical issues preventing full-stack deployment

set -e  # Exit on any error

echo "🚀 reVoAgent Quick Fix Deployment Starting..."

# Check if we're in the right directory
if [[ ! -f "README.md" ]] || [[ ! -d "apps" ]]; then
    echo "❌ Please run this script from the reVoAgent root directory"
    exit 1
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "🔍 Checking prerequisites..."
if ! command_exists python3; then
    echo "❌ Python 3 is required but not installed"
    exit 1
fi

if ! command_exists node; then
    echo "❌ Node.js is required but not installed"
    exit 1
fi

if ! command_exists docker; then
    echo "❌ Docker is required but not installed"
    exit 1
fi

# Create virtual environment
echo "🐍 Setting up Python virtual environment..."
python3 -m venv revoagent_env
source revoagent_env/bin/activate

# Create fixed requirements.txt
echo "📦 Creating fixed requirements.txt..."
cat > requirements_fixed.txt << 'EOF'
# AI/ML Core
torch>=2.2.0
transformers>=4.35.0
accelerate>=0.24.0
sentence-transformers>=2.2.2

# Backend Framework
fastapi>=0.104.1
uvicorn[standard]>=0.24.0
websockets>=12.0
pydantic>=2.4.2

# Database & Cache
asyncpg>=0.29.0
redis>=5.0.1
sqlalchemy>=2.0.23

# Memory Integration (with fallback handling)
networkx>=3.2.1
psutil>=5.9.6

# Authentication & Security
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.4
python-multipart>=0.0.6

# Monitoring & Logging
prometheus-client>=0.19.0
structlog>=23.2.0

# Additional dependencies
aiofiles>=23.2.1
python-dotenv>=1.0.0
EOF

# Install Python dependencies
echo "⬇️ Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements_fixed.txt

# Install optional Cognee if available
echo "🧠 Installing optional memory dependencies..."
pip install cognee==0.1.15 lancedb==0.3.4 || {
    echo "⚠️ Optional memory dependencies failed to install, will use fallback memory"
}

# Setup databases with Docker
echo "🐘 Starting PostgreSQL database..."
docker run -d --name postgres-revoagent \
    -e POSTGRES_DB=revoagent \
    -e POSTGRES_USER=revoagent \
    -e POSTGRES_PASSWORD=revoagent_pass \
    -p 5432:5432 \
    --restart unless-stopped \
    postgres:15 || {
    echo "⚠️ PostgreSQL container already exists, attempting to start..."
    docker start postgres-revoagent || echo "⚠️ Could not start PostgreSQL"
}

echo "🔴 Starting Redis cache..."
docker run -d --name redis-revoagent \
    -p 6379:6379 \
    --restart unless-stopped \
    redis:7-alpine || {
    echo "⚠️ Redis container already exists, attempting to start..."
    docker start redis-revoagent || echo "⚠️ Could not start Redis"
}

# Wait for databases to be ready
echo "⏳ Waiting for databases to be ready..."
sleep 10

# Create environment file
echo "🔧 Creating environment configuration..."
cat > .env << 'EOF'
DATABASE_URL=postgresql+asyncpg://revoagent:revoagent_pass@localhost:5432/revoagent
REDIS_URL=redis://localhost:6379
JWT_SECRET=revoagent-secret-key-change-in-production
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
EOF

# Create enhanced model manager
echo "🤖 Creating enhanced model manager..."
mkdir -p packages/ai
cat > packages/ai/enhanced_local_model_manager.py << 'EOF'
import os
import asyncio
import torch
from typing import Dict, Any, Optional, List
import logging
from dataclasses import dataclass
from enum import Enum
import gc
from concurrent.futures import ThreadPoolExecutor
import psutil

logger = logging.getLogger(__name__)

class ModelProvider(Enum):
    DEEPSEEK_R1 = "deepseek_r1_0528"
    LLAMA_LOCAL = "llama_local"
    OPENAI_BACKUP = "openai"
    ANTHROPIC_BACKUP = "anthropic"
    FALLBACK_MOCK = "mock"

@dataclass
class GenerationRequest:
    prompt: str
    max_tokens: int = 1024
    temperature: float = 0.7
    task_type: str = "general"
    system_prompt: Optional[str] = None
    preferred_provider: Optional[ModelProvider] = None

@dataclass
class GenerationResponse:
    content: str
    provider: ModelProvider
    tokens_used: int
    generation_time: float
    cost: float = 0.0
    reasoning_steps: Optional[List[str]] = None

@dataclass
class SystemResources:
    total_memory: float
    available_memory: float
    gpu_available: bool
    gpu_memory: float = 0.0
    cpu_cores: int = 1

class EnhancedLocalModelManager:
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.models = {}
        self.tokenizers = {}
        self.executor = ThreadPoolExecutor(max_workers=2)
        self.resources = self._check_system_resources()
        self.initialization_lock = asyncio.Lock()
        self.available_providers = []
        
    def _check_system_resources(self) -> SystemResources:
        """Check available system resources for optimal model loading"""
        memory = psutil.virtual_memory()
        
        resources = SystemResources(
            total_memory=memory.total / (1024**3),  # GB
            available_memory=memory.available / (1024**3),  # GB
            gpu_available=torch.cuda.is_available(),
            cpu_cores=psutil.cpu_count()
        )
        
        if resources.gpu_available:
            resources.gpu_memory = torch.cuda.get_device_properties(0).total_memory / (1024**3)
            
        logger.info(f"System Resources: {resources}")
        return resources
    
    async def initialize_with_fallback(self):
        """Initialize models with intelligent fallback based on resources"""
        async with self.initialization_lock:
            logger.info("🤖 Initializing AI models with resource-aware fallback...")
            
            # Always add mock fallback first
            self.available_providers.append(ModelProvider.FALLBACK_MOCK)
            
            # Try to initialize real models
            await self._try_initialize_deepseek()
            await self._try_initialize_api_providers()
            
            logger.info(f"✅ Available providers: {[p.value for p in self.available_providers]}")
    
    async def _try_initialize_deepseek(self):
        """Try to initialize DeepSeek R1 with fallback"""
        try:
            if self.resources.available_memory > 2.0:  # 2GB minimum
                logger.info("📥 Attempting to load DeepSeek R1...")
                
                # Try to import transformers
                from transformers import AutoTokenizer, AutoModelForCausalLM
                
                model_name = "deepseek-ai/deepseek-r1-distill-qwen-1.5b"
                
                # Simple CPU-based loading for compatibility
                tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
                model = AutoModelForCausalLM.from_pretrained(
                    model_name,
                    torch_dtype=torch.float32,
                    device_map="cpu",
                    trust_remote_code=True,
                    low_cpu_mem_usage=True
                )
                
                self.tokenizers[ModelProvider.DEEPSEEK_R1] = tokenizer
                self.models[ModelProvider.DEEPSEEK_R1] = model
                self.available_providers.append(ModelProvider.DEEPSEEK_R1)
                
                logger.info("✅ DeepSeek R1 loaded successfully")
                
        except Exception as e:
            logger.warning(f"⚠️ DeepSeek R1 failed to load: {e}")
            logger.info("💡 Consider installing: pip install torch transformers accelerate")
    
    async def _try_initialize_api_providers(self):
        """Try to initialize API providers"""
        if self.config.get("openai_api_key"):
            self.available_providers.append(ModelProvider.OPENAI_BACKUP)
            logger.info("✅ OpenAI backup enabled")
        
        if self.config.get("anthropic_api_key"):
            self.available_providers.append(ModelProvider.ANTHROPIC_BACKUP)
            logger.info("✅ Anthropic backup enabled")
    
    async def generate(self, request: GenerationRequest) -> GenerationResponse:
        """Generate response using best available provider"""
        for provider in self.available_providers:
            try:
                if provider == ModelProvider.DEEPSEEK_R1:
                    return await self._generate_deepseek(request)
                elif provider == ModelProvider.FALLBACK_MOCK:
                    return await self._generate_mock(request)
                # Add other providers as needed
            except Exception as e:
                logger.warning(f"Provider {provider.value} failed: {e}")
                continue
        
        # If all fail, return error response
        return GenerationResponse(
            content="⚠️ All AI providers unavailable. Please check configuration.",
            provider=ModelProvider.FALLBACK_MOCK,
            tokens_used=0,
            generation_time=0,
            cost=0.0
        )
    
    async def _generate_deepseek(self, request: GenerationRequest) -> GenerationResponse:
        """Generate with DeepSeek R1"""
        model = self.models[ModelProvider.DEEPSEEK_R1]
        tokenizer = self.tokenizers[ModelProvider.DEEPSEEK_R1]
        
        # Format prompt
        system_prompt = request.system_prompt or "You are a helpful AI assistant."
        formatted_prompt = f"System: {system_prompt}\nUser: {request.prompt}\nAssistant:"
        
        # Tokenize and generate
        inputs = tokenizer(formatted_prompt, return_tensors="pt")
        
        with torch.no_grad():
            outputs = model.generate(
                inputs.input_ids,
                max_new_tokens=min(request.max_tokens, 512),  # Limit for stability
                temperature=request.temperature,
                do_sample=True,
                pad_token_id=tokenizer.eos_token_id
            )
        
        # Decode response
        response_text = tokenizer.decode(outputs[0][inputs.input_ids.shape[1]:], skip_special_tokens=True)
        
        return GenerationResponse(
            content=response_text.strip(),
            provider=ModelProvider.DEEPSEEK_R1,
            tokens_used=len(outputs[0]),
            generation_time=1.0,  # Placeholder
            cost=0.0
        )
    
    async def _generate_mock(self, request: GenerationRequest) -> GenerationResponse:
        """Mock generation for testing"""
        mock_responses = [
            "I'm a mock AI assistant. The real models are currently unavailable.",
            "This is a fallback response. Please configure your AI providers.",
            "Mock response: I understand your request but I'm running in fallback mode."
        ]
        
        import random
        response = random.choice(mock_responses)
        
        return GenerationResponse(
            content=response,
            provider=ModelProvider.FALLBACK_MOCK,
            tokens_used=len(response.split()),
            generation_time=0.1,
            cost=0.0
        )
    
    async def health_check(self) -> Dict[str, Any]:
        """Check model manager health"""
        return {
            "status": "healthy",
            "available_providers": [p.value for p in self.available_providers],
            "resources": {
                "memory_gb": self.resources.available_memory,
                "gpu_available": self.resources.gpu_available,
                "cpu_cores": self.resources.cpu_cores
            }
        }
EOF

# Create enhanced backend server
echo "🖥️ Creating enhanced backend server..."
mkdir -p apps/backend
cat > apps/backend/main.py << 'EOF'
import asyncio
import os
import sys
from pathlib import Path
from typing import Dict, Any, Optional
import logging
from datetime import datetime

# Add project root to path
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uvicorn
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import our enhanced model manager
try:
    from packages.ai.enhanced_local_model_manager import (
        EnhancedLocalModelManager, 
        GenerationRequest, 
        ModelProvider
    )
except ImportError:
    logger.warning("Could not import enhanced model manager, using fallback")
    EnhancedLocalModelManager = None

app = FastAPI(
    title="reVoAgent Enhanced Backend",
    description="Enhanced backend with intelligent AI model fallbacks",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model manager
model_manager: Optional[EnhancedLocalModelManager] = None

class ChatRequest(BaseModel):
    content: str
    system_prompt: Optional[str] = None
    max_tokens: int = 1024
    temperature: float = 0.7

class ChatResponse(BaseModel):
    content: str
    provider: str
    tokens_used: int
    generation_time: float

@app.on_event("startup")
async def startup_event():
    """Initialize the application"""
    global model_manager
    
    logger.info("🚀 Starting reVoAgent Enhanced Backend...")
    
    # Initialize model manager
    if EnhancedLocalModelManager:
        config = {
            "openai_api_key": os.getenv("OPENAI_API_KEY"),
            "anthropic_api_key": os.getenv("ANTHROPIC_API_KEY"),
        }
        
        model_manager = EnhancedLocalModelManager(config)
        await model_manager.initialize_with_fallback()
    
    logger.info("✅ Backend initialization complete")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    health_data = {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "services": {
            "backend": "running",
            "database": "checking...",
            "redis": "checking...",
            "ai_models": "checking..."
        }
    }
    
    # Check model manager
    if model_manager:
        try:
            model_health = await model_manager.health_check()
            health_data["services"]["ai_models"] = model_health["status"]
            health_data["ai_providers"] = model_health.get("available_providers", [])
        except Exception as e:
            health_data["services"]["ai_models"] = f"error: {str(e)}"
    else:
        health_data["services"]["ai_models"] = "not_initialized"
    
    return health_data

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """Chat endpoint with AI model integration"""
    try:
        if not model_manager:
            raise HTTPException(status_code=503, detail="AI models not available")
        
        # Create generation request
        gen_request = GenerationRequest(
            prompt=request.content,
            system_prompt=request.system_prompt,
            max_tokens=request.max_tokens,
            temperature=request.temperature
        )
        
        # Generate response
        response = await model_manager.generate(gen_request)
        
        return ChatResponse(
            content=response.content,
            provider=response.provider.value,
            tokens_used=response.tokens_used,
            generation_time=response.generation_time
        )
        
    except Exception as e:
        logger.error(f"Chat endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/models")
async def list_models():
    """List available AI models"""
    if not model_manager:
        return {"models": [], "status": "not_initialized"}
    
    try:
        health = await model_manager.health_check()
        return {
            "models": health.get("available_providers", []),
            "status": health["status"],
            "resources": health.get("resources", {})
        }
    except Exception as e:
        return {"models": [], "status": f"error: {str(e)}"}

@app.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket):
    """WebSocket endpoint for real-time chat"""
    await websocket.accept()
    
    try:
        while True:
            # Receive message
            data = await websocket.receive_json()
            
            if not model_manager:
                await websocket.send_json({
                    "error": "AI models not available",
                    "type": "error"
                })
                continue
            
            # Process chat request
            try:
                gen_request = GenerationRequest(
                    prompt=data.get("content", ""),
                    system_prompt=data.get("system_prompt"),
                    max_tokens=data.get("max_tokens", 1024),
                    temperature=data.get("temperature", 0.7)
                )
                
                response = await model_manager.generate(gen_request)
                
                await websocket.send_json({
                    "content": response.content,
                    "provider": response.provider.value,
                    "tokens_used": response.tokens_used,
                    "generation_time": response.generation_time,
                    "type": "response"
                })
                
            except Exception as e:
                await websocket.send_json({
                    "error": str(e),
                    "type": "error"
                })
                
    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
EOF

# Create memory integration with fallback
echo "🧠 Creating memory integration..."
mkdir -p packages/memory
cat > packages/memory/enhanced_memory_manager.py << 'EOF'
import asyncio
import logging
from typing import Dict, Any, List, Optional
from dataclasses import dataclass
from datetime import datetime
import json
import os

logger = logging.getLogger(__name__)

@dataclass
class MemoryEntry:
    id: str
    content: str
    embedding: List[float]
    metadata: Dict[str, Any]
    timestamp: datetime
    agent_id: str

class EnhancedMemoryManager:
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.cognee_client = None
        self.memory_store = {}  # Fallback in-memory store
        self.initialized = False
        
    async def initialize(self):
        """Initialize memory system with Cognee fallback"""
        try:
            # Try to initialize Cognee
            import cognee
            await cognee.prune.prune_data()
            await cognee.prune.prune_system(metadata=True)
            
            self.cognee_client = cognee
            self.initialized = True
            logger.info("✅ Cognee memory system initialized")
            
        except Exception as e:
            logger.warning(f"⚠️ Cognee initialization failed: {e}")
            logger.info("💡 Using fallback memory system")
            self.initialized = True
    
    async def store_memory(self, agent_id: str, content: str, metadata: Dict[str, Any] = None) -> str:
        """Store a memory entry"""
        if not self.initialized:
            await self.initialize()
        
        memory_id = f"{agent_id}_{datetime.now().timestamp()}"
        
        if self.cognee_client:
            try:
                # Use Cognee for storage
                await self.cognee_client.add(content, metadata=metadata or {})
                logger.info(f"✅ Memory stored via Cognee: {memory_id}")
                return memory_id
            except Exception as e:
                logger.error(f"Cognee storage failed: {e}")
                # Fall through to fallback storage
        
        # Fallback storage
        self.memory_store[memory_id] = {
            "content": content,
            "metadata": metadata or {},
            "timestamp": datetime.now().isoformat()
        }
        
        logger.info(f"✅ Memory stored via fallback: {memory_id}")
        return memory_id
    
    async def retrieve_memory(self, agent_id: str, query: str, limit: int = 5) -> List[MemoryEntry]:
        """Retrieve relevant memories for an agent"""
        if not self.initialized:
            return []
        
        if self.cognee_client:
            try:
                # Use Cognee for retrieval
                results = await self.cognee_client.search(query, limit=limit)
                return self._format_cognee_results(results, agent_id)
            except Exception as e:
                logger.error(f"Cognee retrieval failed: {e}")
                return await self._retrieve_fallback(agent_id, query, limit)
        else:
            return await self._retrieve_fallback(agent_id, query, limit)
    
    async def _retrieve_fallback(self, agent_id: str, query: str, limit: int) -> List[MemoryEntry]:
        """Fallback memory retrieval"""
        results = []
        for memory_id, data in self.memory_store.items():
            if agent_id in memory_id and query.lower() in data["content"].lower():
                results.append(MemoryEntry(
                    id=memory_id,
                    content=data["content"],
                    embedding=[],
                    metadata=data["metadata"],
                    timestamp=datetime.fromisoformat(data["timestamp"]),
                    agent_id=agent_id
                ))
        return results[:limit]
    
    def _format_cognee_results(self, results: List, agent_id: str) -> List[MemoryEntry]:
        """Format Cognee results to MemoryEntry objects"""
        formatted = []
        for result in results:
            formatted.append(MemoryEntry(
                id=str(result.get("id", "")),
                content=result.get("content", ""),
                embedding=result.get("embedding", []),
                metadata=result.get("metadata", {}),
                timestamp=datetime.now(),
                agent_id=agent_id
            ))
        return formatted
    
    async def health_check(self) -> Dict[str, Any]:
        """Check memory system health"""
        if not self.initialized:
            return {"status": "not_initialized"}
        
        try:
            if self.cognee_client:
                # Test Cognee connection
                await self.cognee_client.search("test", limit=1)
                return {"status": "healthy", "backend": "cognee"}
            else:
                # Test fallback storage
                test_count = len(self.memory_store)
                return {"status": "healthy", "backend": "fallback", "entries": test_count}
        except Exception as e:
            return {"status": "unhealthy", "error": str(e)}
EOF

# Create startup scripts
echo "🚀 Creating startup scripts..."

cat > start_revoagent.sh << 'EOF'
#!/bin/bash

echo "🚀 Starting reVoAgent Enhanced System..."

# Activate virtual environment
source revoagent_env/bin/activate

# Set environment variables
export DATABASE_URL="postgresql+asyncpg://revoagent:revoagent_pass@localhost:5432/revoagent"
export REDIS_URL="redis://localhost:6379"
export JWT_SECRET="revoagent-secret-key-change-in-production"

# Start backend
echo "🖥️ Starting backend server..."
cd apps/backend
python main.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 5

# Start frontend if available
if [ -d "../../frontend" ]; then
    echo "🌐 Starting frontend..."
    cd ../../frontend
    npm start &
    FRONTEND_PID=$!
fi

echo "✅ reVoAgent system started!"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo "Health check: curl http://localhost:8000/health"

# Wait for processes
wait $BACKEND_PID
EOF

cat > test_revoagent.sh << 'EOF'
#!/bin/bash

echo "🧪 Testing reVoAgent deployment..."

# Test backend health
echo "Testing backend health..."
curl -s http://localhost:8000/health | jq '.' || echo "❌ Backend health check failed"

# Test chat endpoint
echo "Testing chat endpoint..."
curl -s -X POST http://localhost:8000/api/chat \
    -H "Content-Type: application/json" \
    -d '{"content": "Hello, test message"}' | jq '.' || echo "❌ Chat endpoint failed"

# Test models endpoint
echo "Testing models endpoint..."
curl -s http://localhost:8000/api/models | jq '.' || echo "❌ Models endpoint failed"

echo "✅ Testing complete!"
EOF

chmod +x start_revoagent.sh test_revoagent.sh

# Create frontend configuration if frontend exists
if [ -d "frontend" ]; then
    echo "🌐 Configuring frontend..."
    
    # Create frontend environment file
    cat > frontend/.env.local << 'EOF'
REACT_APP_API_URL=http://localhost:8000
REACT_APP_WS_URL=ws://localhost:8000
REACT_APP_ENV=development
EOF

    # Install frontend dependencies
    cd frontend
    npm install || echo "⚠️ Frontend npm install failed"
    cd ..
fi

echo "✅ reVoAgent Quick Fix Deployment Complete!"
echo ""
echo "🚀 Next Steps:"
echo "1. Start the system: ./start_revoagent.sh"
echo "2. Test deployment: ./test_revoagent.sh"
echo "3. Access backend: http://localhost:8000"
echo "4. Access frontend: http://localhost:3000"
echo ""
echo "📋 Health Check: curl http://localhost:8000/health"
echo "💬 Test Chat: curl -X POST http://localhost:8000/api/chat -H 'Content-Type: application/json' -d '{\"content\": \"Hello\"}'"