"""
API Routes for reVoAgent Dashboard

Provides REST API endpoints for the web dashboard interface.
"""

import asyncio
import logging
import time
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
import psutil
import json

# Import AI components
try:
    from ...ai.model_manager import model_manager
    from ...agents.enhanced_code_generator import enhanced_code_generator
    AI_ENABLED = True
except ImportError as e:
    logging.warning(f"AI components not available: {e}")
    model_manager = None
    enhanced_code_generator = None
    AI_ENABLED = False

logger = logging.getLogger(__name__)


class TaskRequest(BaseModel):
    """Request model for creating tasks."""
    agent_type: str
    description: str
    parameters: Optional[Dict[str, Any]] = {}
    priority: int = 1


class WorkflowRequest(BaseModel):
    """Request model for creating workflows."""
    name: str

class CodeGenRequest(BaseModel):
    """Request model for code generation."""
    task_description: str
    template_id: str = "rest_api"
    language: str = "python"
    framework: str = "fastapi"
    database: str = "postgresql"
    features: List[str] = ["auth", "tests", "docs", "docker"]


class ModelRequest(BaseModel):
    """Request model for model operations."""
    model_name: str
    action: str  # load, unload, switch
    parameters: Optional[Dict[str, Any]] = {}


class APIRoutes:
    """API routes handler for the dashboard."""
    
    def __init__(self, agent_framework, websocket_manager):
        self.agent_framework = agent_framework
        self.websocket_manager = websocket_manager
        self.router = APIRouter()
        self._setup_routes()
        
        # Mock data for demonstration
        self._init_mock_data()
    
    def _init_mock_data(self):
        """Initialize mock data for demonstration."""
        self.mock_agents = [
            {
                "id": "code-gen-1",
                "name": "Enhanced Code Generator",
                "type": "code_generator",
                "status": "active",
                "description": "AI-powered code generation with OpenHands integration",
                "model": "DeepSeek R1",
                "performance": 94,
                "tasks_completed": 156,
                "uptime": "99.9%"
            },
            {
                "id": "debug-agent-1",
                "name": "Debug Agent",
                "type": "debugging",
                "status": "idle",
                "description": "Automated issue detection and resolution",
                "model": "CodeLlama 70B",
                "performance": 87,
                "tasks_completed": 89,
                "uptime": "98.5%"
            },
            {
                "id": "browser-agent-1",
                "name": "Browser Agent",
                "type": "browser",
                "status": "active",
                "description": "Web automation with Playwright + AI",
                "model": "Mistral 7B",
                "performance": 91,
                "tasks_completed": 234,
                "uptime": "97.8%"
            },
            {
                "id": "test-agent-1",
                "name": "Testing Agent",
                "type": "testing",
                "status": "idle",
                "description": "Comprehensive test generation and execution",
                "model": "DeepSeek Coder",
                "performance": 89,
                "tasks_completed": 67,
                "uptime": "99.2%"
            },
            {
                "id": "deploy-agent-1",
                "name": "Deploy Agent",
                "type": "deployment",
                "status": "active",
                "description": "Docker + K8s + Monitoring deployment",
                "model": "Llama 3.2 8B",
                "performance": 92,
                "tasks_completed": 45,
                "uptime": "98.9%"
            }
        ]
        
        self.mock_workflows = [
            {
                "id": "microservices-1",
                "name": "Microservices Architecture",
                "description": "8 agents parallel execution",
                "status": "running",
                "progress": 0.67,
                "agents": ["code-gen-1", "debug-agent-1", "test-agent-1", "deploy-agent-1"],
                "started_at": datetime.now() - timedelta(minutes=15),
                "estimated_completion": datetime.now() + timedelta(minutes=8)
            },
            {
                "id": "web-scraping-1",
                "name": "Web Scraping System",
                "description": "3 agents for data extraction",
                "status": "completed",
                "progress": 1.0,
                "agents": ["browser-agent-1", "code-gen-1"],
                "started_at": datetime.now() - timedelta(hours=2),
                "estimated_completion": datetime.now() - timedelta(hours=1)
            },
            {
                "id": "api-generation-1",
                "name": "API Generation",
                "description": "5 agents for FastAPI development",
                "status": "running",
                "progress": 0.45,
                "agents": ["code-gen-1", "test-agent-1", "deploy-agent-1"],
                "started_at": datetime.now() - timedelta(minutes=30),
                "estimated_completion": datetime.now() + timedelta(minutes=20)
            }
        ]
        
        self.mock_models = [
            {
                "name": "DeepSeek R1 0528",
                "size": "70B",
                "type": "Code",
                "status": "loaded",
                "performance": 94,
                "memory_usage": "18.2GB",
                "gpu_util": 78,
                "tokens_per_sec": 2340,
                "latency": 847
            },
            {
                "name": "CodeLlama 70B",
                "size": "70B",
                "type": "Code",
                "status": "loaded",
                "performance": 78,
                "memory_usage": "16.8GB",
                "gpu_util": 65,
                "tokens_per_sec": 1890,
                "latency": 1120
            },
            {
                "name": "Mistral 7B",
                "size": "7B",
                "type": "General",
                "status": "loaded",
                "performance": 67,
                "memory_usage": "4.2GB",
                "gpu_util": 23,
                "tokens_per_sec": 3200,
                "latency": 456
            },
            {
                "name": "DeepSeek Coder",
                "size": "6.7B",
                "type": "Code",
                "status": "available",
                "performance": 56,
                "memory_usage": "0GB",
                "gpu_util": 0,
                "tokens_per_sec": 0,
                "latency": 0
            }
        ]
        
        self.mock_integrations = {
            "openhands": {"status": "healthy", "response_time": 234, "success_rate": 99.8},
            "vllm": {"status": "healthy", "response_time": 156, "success_rate": 99.9},
            "docker": {"status": "healthy", "response_time": 89, "success_rate": 98.7},
            "all_hands": {"status": "connected", "response_time": 345, "success_rate": 99.2},
            "browser": {"status": "running", "response_time": 567, "success_rate": 97.0},
            "git": {"status": "active", "response_time": 123, "success_rate": 99.5}
        }
    
    def _setup_routes(self):
        """Setup all API routes."""
        
        @self.router.get("/dashboard/stats")
        async def get_dashboard_stats():
            """Get dashboard statistics."""
            try:
                # Get system metrics
                cpu_percent = psutil.cpu_percent(interval=1)
                memory = psutil.virtual_memory()
                disk = psutil.disk_usage('/')
                
                # Count active agents
                active_agents = len([a for a in self.mock_agents if a["status"] == "active"])
                running_workflows = len([w for w in self.mock_workflows if w["status"] == "running"])
                tasks_completed = sum(a["tasks_completed"] for a in self.mock_agents)
                models_loaded = len([m for m in self.mock_models if m["status"] == "loaded"])
                
                return {
                    "active_agents": active_agents,
                    "running_workflows": running_workflows,
                    "tasks_completed": tasks_completed,
                    "models_loaded": models_loaded,
                    "success_rate": 98.5,
                    "api_cost": 0,
                    "uptime": "99.9%",
                    "response_time": 847,
                    "system_metrics": {
                        "cpu_usage": cpu_percent,
                        "memory_usage": memory.percent,
                        "disk_usage": disk.percent,
                        "gpu_memory": 56,  # Mock GPU usage
                        "network_io": 23,
                        "disk_io": 34
                    }
                }
            except Exception as e:
                logger.error(f"Error getting dashboard stats: {e}")
                raise HTTPException(status_code=500, detail=str(e))
        
        @self.router.get("/agents")
        async def get_agents():
            """Get all agents."""
            return {"agents": self.mock_agents}
        
        @self.router.get("/agents/{agent_id}")
        async def get_agent(agent_id: str):
            """Get specific agent details."""
            agent = next((a for a in self.mock_agents if a["id"] == agent_id), None)
            if not agent:
                raise HTTPException(status_code=404, detail="Agent not found")
            return agent
        
        @self.router.post("/agents/{agent_id}/start")
        async def start_agent(agent_id: str):
            """Start an agent."""
            agent = next((a for a in self.mock_agents if a["id"] == agent_id), None)
            if not agent:
                raise HTTPException(status_code=404, detail="Agent not found")
            
            agent["status"] = "active"
            await self.websocket_manager.broadcast({
                "type": "agent_status_changed",
                "agent_id": agent_id,
                "status": "active"
            })
            
            return {"message": f"Agent {agent_id} started successfully"}
        
        @self.router.post("/agents/{agent_id}/stop")
        async def stop_agent(agent_id: str):
            """Stop an agent."""
            agent = next((a for a in self.mock_agents if a["id"] == agent_id), None)
            if not agent:
                raise HTTPException(status_code=404, detail="Agent not found")
            
            agent["status"] = "idle"
            await self.websocket_manager.broadcast({
                "type": "agent_status_changed",
                "agent_id": agent_id,
                "status": "idle"
            })
            
            return {"message": f"Agent {agent_id} stopped successfully"}
        
        @self.router.get("/workflows")
        async def get_workflows():
            """Get all workflows."""
            return {"workflows": self.mock_workflows}
        
        @self.router.post("/workflows")
        async def create_workflow(workflow: WorkflowRequest):
            """Create a new workflow."""
            new_workflow = {
                "id": f"workflow-{len(self.mock_workflows) + 1}",
                "name": workflow.name,
                "description": workflow.description,
                "status": "pending",
                "progress": 0.0,
                "agents": workflow.agents,
                "started_at": datetime.now(),
                "estimated_completion": datetime.now() + timedelta(minutes=30)
            }
            
            self.mock_workflows.append(new_workflow)
            
            await self.websocket_manager.broadcast({
                "type": "workflow_created",
                "workflow": new_workflow
            })
            
            return new_workflow
        
        @self.router.post("/workflows/{workflow_id}/start")
        async def start_workflow(workflow_id: str):
            """Start a workflow."""
            workflow = next((w for w in self.mock_workflows if w["id"] == workflow_id), None)
            if not workflow:
                raise HTTPException(status_code=404, detail="Workflow not found")
            
            workflow["status"] = "running"
            workflow["started_at"] = datetime.now()
            
            await self.websocket_manager.broadcast({
                "type": "workflow_started",
                "workflow_id": workflow_id
            })
            
            return {"message": f"Workflow {workflow_id} started successfully"}
        
        @self.router.post("/workflows/{workflow_id}/stop")
        async def stop_workflow(workflow_id: str):
            """Stop a workflow."""
            workflow = next((w for w in self.mock_workflows if w["id"] == workflow_id), None)
            if not workflow:
                raise HTTPException(status_code=404, detail="Workflow not found")
            
            workflow["status"] = "stopped"
            
            await self.websocket_manager.broadcast({
                "type": "workflow_stopped",
                "workflow_id": workflow_id
            })
            
            return {"message": f"Workflow {workflow_id} stopped successfully"}
        
        @self.router.get("/models")
        async def get_models():
            """Get all models."""
            return {"models": self.mock_models}
        
        @self.router.post("/models/load")
        async def load_model(model_request: ModelRequest):
            """Load a model."""
            model = next((m for m in self.mock_models if m["name"] == model_request.model_name), None)
            if not model:
                raise HTTPException(status_code=404, detail="Model not found")
            
            model["status"] = "loaded"
            
            await self.websocket_manager.broadcast({
                "type": "model_loaded",
                "model_name": model_request.model_name
            })
            
            return {"message": f"Model {model_request.model_name} loaded successfully"}
        
        @self.router.post("/models/unload")
        async def unload_model(model_request: ModelRequest):
            """Unload a model."""
            model = next((m for m in self.mock_models if m["name"] == model_request.model_name), None)
            if not model:
                raise HTTPException(status_code=404, detail="Model not found")
            
            model["status"] = "available"
            model["memory_usage"] = "0GB"
            model["gpu_util"] = 0
            
            await self.websocket_manager.broadcast({
                "type": "model_unloaded",
                "model_name": model_request.model_name
            })
            
            return {"message": f"Model {model_request.model_name} unloaded successfully"}
        
        @self.router.get("/integrations/status")
        async def get_integration_status():
            """Get integration status."""
            return {"integrations": self.mock_integrations}
        
        @self.router.get("/system/metrics")
        async def get_system_metrics():
            """Get detailed system metrics."""
            try:
                # Get system information
                cpu_percent = psutil.cpu_percent(interval=1)
                memory = psutil.virtual_memory()
                disk = psutil.disk_usage('/')
                network = psutil.net_io_counters()
                
                return {
                    "timestamp": datetime.now().isoformat(),
                    "cpu": {
                        "usage_percent": cpu_percent,
                        "cores": psutil.cpu_count(),
                        "frequency": psutil.cpu_freq()._asdict() if psutil.cpu_freq() else None
                    },
                    "memory": {
                        "total": memory.total,
                        "available": memory.available,
                        "percent": memory.percent,
                        "used": memory.used,
                        "free": memory.free
                    },
                    "disk": {
                        "total": disk.total,
                        "used": disk.used,
                        "free": disk.free,
                        "percent": disk.percent
                    },
                    "network": {
                        "bytes_sent": network.bytes_sent,
                        "bytes_recv": network.bytes_recv,
                        "packets_sent": network.packets_sent,
                        "packets_recv": network.packets_recv
                    },
                    "gpu": {
                        "memory_percent": 56,  # Mock GPU data
                        "utilization": 78,
                        "temperature": 65
                    }
                }
            except Exception as e:
                logger.error(f"Error getting system metrics: {e}")
                raise HTTPException(status_code=500, detail=str(e))
        
        @self.router.get("/activity/recent")
        async def get_recent_activity():
            """Get recent activity feed."""
            activities = [
                {
                    "id": 1,
                    "type": "code_generation",
                    "title": "Enhanced Code Gen: FastAPI+Auth+Tests ✓",
                    "description": "OpenHands Integration • Quality Score: 94%",
                    "timestamp": datetime.now() - timedelta(minutes=2),
                    "status": "completed",
                    "agent": "code-gen-1"
                },
                {
                    "id": 2,
                    "type": "workflow",
                    "title": "Workflow Engine: 8 agents parallel execution ✓",
                    "description": "Microservices architecture • Resource optimized",
                    "timestamp": datetime.now() - timedelta(minutes=8),
                    "status": "completed",
                    "agent": "workflow-engine"
                },
                {
                    "id": 3,
                    "type": "debugging",
                    "title": "Debug Agent: 5 critical issues resolved ✓",
                    "description": "Memory leaks fixed • Performance improved 34%",
                    "timestamp": datetime.now() - timedelta(minutes=15),
                    "status": "completed",
                    "agent": "debug-agent-1"
                },
                {
                    "id": 4,
                    "type": "testing",
                    "title": "Browser Agent: E2E testing completed ✓",
                    "description": "Playwright + AI • 47 test cases passed",
                    "timestamp": datetime.now() - timedelta(minutes=23),
                    "status": "completed",
                    "agent": "browser-agent-1"
                },
                {
                    "id": 5,
                    "type": "deployment",
                    "title": "Deploy Agent: Production deployment ✓",
                    "description": "Docker + K8s + Monitoring • Zero downtime",
                    "timestamp": datetime.now() - timedelta(minutes=35),
                    "status": "completed",
                    "agent": "deploy-agent-1"
                }
            ]
            
            return {"activities": activities}
        
        @self.router.post("/tasks")
        async def create_task(task: TaskRequest, background_tasks: BackgroundTasks):
            """Create a new task."""
            task_id = f"task-{int(time.time())}"
            
            # Add background task to simulate processing
            background_tasks.add_task(self._process_task, task_id, task)
            
            await self.websocket_manager.broadcast({
                "type": "task_created",
                "task_id": task_id,
                "agent_type": task.agent_type,
                "description": task.description
            })
            
            return {
                "task_id": task_id,
                "status": "created",
                "message": "Task created successfully"
            }
        
        @self.router.get("/health")
        async def health_check():
            """Health check endpoint."""
            return {
                "status": "healthy",
                "timestamp": datetime.now().isoformat(),
                "version": "1.0.0",
                "services": {
                    "api": "healthy",
                    "websocket": "healthy",
                    "agents": "healthy",
                    "models": "healthy"
                }
            }
        
        # Enhanced Code Generator Endpoints
        @self.router.post("/codegen/start")
        async def start_code_generation(request: CodeGenRequest):
            """Start enhanced code generation process."""
            if not AI_ENABLED or not enhanced_code_generator:
                # Fallback to mock response
                task_id = f"mock_task_{int(time.time())}"
                return {
                    "task_id": task_id,
                    "message": "Code generation started (mock mode)",
                    "estimated_completion": "4 minutes"
                }
            
            try:
                task_id = await enhanced_code_generator.start_generation(
                    task_description=request.task_description,
                    template_id=request.template_id,
                    language=request.language,
                    framework=request.framework,
                    database=request.database,
                    features=request.features
                )
                
                return {
                    "task_id": task_id,
                    "message": "Code generation started successfully",
                    "estimated_completion": "4 minutes"
                }
            except Exception as e:
                logger.error(f"Error starting code generation: {e}")
                raise HTTPException(status_code=500, detail=str(e))
        
        @self.router.get("/codegen/progress/{task_id}")
        async def get_code_generation_progress(task_id: str):
            """Get code generation progress."""
            if not AI_ENABLED or not enhanced_code_generator:
                # Mock progress response
                return {
                    "task_id": task_id,
                    "current_phase": "api_endpoints",
                    "phases": {
                        "architecture_planning": {"name": "Architecture Planning", "progress": 100, "status": "completed"},
                        "database_models": {"name": "Database Models", "progress": 100, "status": "completed"},
                        "api_endpoints": {"name": "API Endpoints", "progress": 75, "status": "in_progress"},
                        "authentication": {"name": "Authentication", "progress": 45, "status": "in_progress"},
                        "tests_documentation": {"name": "Tests & Documentation", "progress": 0, "status": "pending"}
                    },
                    "estimated_completion": "4 minutes",
                    "quality_score": 94.0,
                    "files_generated": ["models.py", "routers/", "services/"]
                }
            
            progress = enhanced_code_generator.get_generation_progress(task_id)
            if not progress:
                raise HTTPException(status_code=404, detail="Task not found")
            
            return progress
        
        @self.router.get("/codegen/templates")
        async def get_code_generation_templates():
            """Get available code generation templates."""
            if not AI_ENABLED or not enhanced_code_generator:
                # Mock templates
                return {
                    "templates": [
                        {
                            "id": "rest_api",
                            "name": "REST API",
                            "description": "Complete REST API with authentication and database",
                            "language": "python",
                            "framework": "fastapi",
                            "features": ["auth", "tests", "docs", "docker", "cicd"]
                        },
                        {
                            "id": "web_app",
                            "name": "Web App",
                            "description": "Full-stack web application",
                            "language": "typescript",
                            "framework": "react",
                            "features": ["auth", "tests", "docs", "docker", "cicd"]
                        }
                    ]
                }
            
            templates = enhanced_code_generator.get_available_templates()
            return {"templates": templates}
        
        # Enhanced Architecture Endpoints
        @self.router.post("/enhanced/process")
        async def process_enhanced_request(request: dict):
            """Process request using Enhanced Architecture (3-engine system)."""
            try:
                from revoagent.engines.enhanced_architecture import EnhancedArchitecture, EnhancedRequest
                from revoagent.engines.parallel_mind_engine import TaskPriority
                
                # Initialize Enhanced Architecture if not already done
                if not hasattr(self, '_enhanced_architecture'):
                    self._enhanced_architecture = EnhancedArchitecture()
                
                # Create enhanced request
                enhanced_request = EnhancedRequest(
                    id=request.get("id", str(uuid.uuid4())),
                    description=request.get("description", ""),
                    request_type=request.get("request_type", "code_generation"),
                    requirements=request.get("requirements", {}),
                    constraints=request.get("constraints", {}),
                    priority=TaskPriority.NORMAL,
                    use_memory=request.get("use_memory", True),
                    use_creativity=request.get("use_creativity", True),
                    use_parallel=request.get("use_parallel", True)
                )
                
                # Process with Enhanced Architecture
                response = await self._enhanced_architecture.process_request(enhanced_request)
                
                return {
                    "request_id": response.request_id,
                    "success": response.success,
                    "results": response.results,
                    "memory_insights": response.memory_insights,
                    "creative_solutions": [
                        {
                            "id": sol.id,
                            "description": sol.description,
                            "creativity_score": sol.creativity_score,
                            "innovation_level": sol.innovation_level,
                            "code_snippets": sol.code_snippets
                        } for sol in response.creative_solutions
                    ],
                    "execution_stats": response.parallel_execution_stats,
                    "execution_time": response.total_execution_time,
                    "quality_score": response.quality_score,
                    "innovation_level": response.innovation_level
                }
                
            except Exception as e:
                logger.error(f"Enhanced Architecture processing failed: {e}")
                raise HTTPException(status_code=500, detail=str(e))
        
        @self.router.get("/enhanced/status")
        async def get_enhanced_status():
            """Get Enhanced Architecture system status."""
            try:
                from revoagent.engines.enhanced_architecture import EnhancedArchitecture
                
                if not hasattr(self, '_enhanced_architecture'):
                    self._enhanced_architecture = EnhancedArchitecture()
                
                status = await self._enhanced_architecture.get_system_status()
                return status
                
            except Exception as e:
                logger.error(f"Failed to get enhanced status: {e}")
                return {
                    "enhanced_architecture": {"status": "error", "error": str(e)},
                    "perfect_recall_engine": {"status": "unknown"},
                    "parallel_mind_engine": {"status": "unknown"},
                    "creative_engine": {"status": "unknown"}
                }
        
        @self.router.get("/enhanced/metrics")
        async def get_enhanced_metrics():
            """Get Enhanced Architecture performance metrics."""
            try:
                from revoagent.engines.enhanced_architecture import EnhancedArchitecture
                
                if not hasattr(self, '_enhanced_architecture'):
                    self._enhanced_architecture = EnhancedArchitecture()
                
                status = await self._enhanced_architecture.get_system_status()
                
                return {
                    "system_metrics": status["enhanced_architecture"]["system_metrics"],
                    "memory_stats": {
                        "total_memories": status["perfect_recall_engine"]["total_memories"],
                        "knowledge_graph_entities": status["perfect_recall_engine"]["knowledge_graph_entities"]
                    },
                    "parallel_stats": {
                        "active_tasks": status["parallel_mind_engine"]["active_tasks"],
                        "completed_tasks": status["parallel_mind_engine"]["completed_tasks"],
                        "success_rate": status["parallel_mind_engine"]["performance_metrics"]["success_rate"]
                    },
                    "creativity_stats": {
                        "total_solutions": status["creative_engine"]["total_solutions"],
                        "average_creativity": status["creative_engine"]["average_creativity"],
                        "innovation_distribution": status["creative_engine"]["innovation_distribution"]
                    }
                }
                
            except Exception as e:
                logger.error(f"Failed to get enhanced metrics: {e}")
                return {"error": str(e)}

        # AI Model Management Endpoints
        @self.router.get("/ai/models")
        async def get_ai_models():
            """Get AI model information."""
            if not AI_ENABLED or not model_manager:
                return {
                    "models": [
                        {
                            "id": "deepseek-r1-0528",
                            "name": "DeepSeek R1 0528",
                            "type": "deepseek-r1",
                            "size": "70B",
                            "status": "unloaded",
                            "performance_score": 94.0
                        }
                    ],
                    "active_model": None,
                    "system_stats": {
                        "cpu_percent": 25,
                        "memory_percent": 45,
                        "gpu_memory_used": 0,
                        "loaded_models": 0
                    }
                }
            
            model_info = model_manager.get_model_info()
            system_stats = model_manager.get_system_stats()
            
            return {
                "models": [info.__dict__ for info in model_info.values()],
                "active_model": model_manager.active_model,
                "system_stats": system_stats
            }
        
        @self.router.post("/ai/models/{model_id}/load")
        async def load_ai_model(model_id: str):
            """Load an AI model."""
            if not AI_ENABLED or not model_manager:
                return {"message": f"Model {model_id} loaded (mock mode)"}
            
            success = await model_manager.load_model(model_id)
            if success:
                return {"message": f"Model {model_id} loaded successfully"}
            else:
                raise HTTPException(status_code=500, detail=f"Failed to load model {model_id}")
        
        @self.router.post("/ai/models/{model_id}/unload")
        async def unload_ai_model(model_id: str):
            """Unload an AI model."""
            if not AI_ENABLED or not model_manager:
                return {"message": f"Model {model_id} unloaded (mock mode)"}
            
            success = await model_manager.unload_model(model_id)
            if success:
                return {"message": f"Model {model_id} unloaded successfully"}
            else:
                raise HTTPException(status_code=500, detail=f"Failed to unload model {model_id}")
        
        @self.router.post("/ai/generate")
        async def generate_text(request: dict):
            """Generate text using AI model."""
            if not AI_ENABLED or not model_manager:
                return {
                    "generated_text": f"Mock AI response for: {request.get('prompt', 'No prompt provided')}",
                    "model_used": "mock_model"
                }
            
            prompt = request.get("prompt", "")
            if not prompt:
                raise HTTPException(status_code=400, detail="Prompt is required")
            
            try:
                generated_text = await model_manager.generate_text(prompt, **request.get("parameters", {}))
                return {
                    "generated_text": generated_text,
                    "model_used": model_manager.active_model
                }
            except Exception as e:
                logger.error(f"Error generating text: {e}")
                raise HTTPException(status_code=500, detail=str(e))
    
    async def _process_task(self, task_id: str, task: TaskRequest):
        """Simulate task processing."""
        await asyncio.sleep(2)  # Simulate processing time
        
        await self.websocket_manager.broadcast({
            "type": "task_completed",
            "task_id": task_id,
            "status": "completed",
            "result": f"Task {task_id} completed successfully"
        })