"""
Dashboard Server - FastAPI-based Web Dashboard

Integrates xCodeAgent01 frontend capabilities with reVoAgent backend.
"""

import asyncio
import logging
from pathlib import Path
from typing import Dict, List, Optional, Any
import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
import json

from .api_routes import APIRoutes
from .websocket_manager import WebSocketManager

logger = logging.getLogger(__name__)


class DashboardServer:
    """Web dashboard server for reVoAgent platform."""
    
    def __init__(self, 
                 agent_framework,
                 host: str = "0.0.0.0",
                 port: int = 12000,
                 static_dir: Optional[Path] = None):
        self.agent_framework = agent_framework
        self.host = host
        self.port = port
        self.static_dir = static_dir or Path(__file__).parent / "static"
        
        # Create FastAPI app
        self.app = FastAPI(
            title="reVoAgent Dashboard",
            description="Agentic AI Coding System Platform Dashboard",
            version="1.0.0"
        )
        
        # Setup CORS
        self.app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
        
        # Initialize components
        self.websocket_manager = WebSocketManager()
        self.api_routes = APIRoutes(agent_framework, self.websocket_manager)
        
        # Setup routes
        self._setup_routes()
        self._setup_static_files()
        
        self.server_task: Optional[asyncio.Task] = None
    
    def _setup_routes(self):
        """Setup API routes."""
        # Include API routes
        self.app.include_router(
            self.api_routes.router,
            prefix="/api/v1"
        )
        
        # WebSocket endpoint
        @self.app.websocket("/ws")
        async def websocket_endpoint(websocket: WebSocket):
            await self.websocket_manager.connect(websocket)
            try:
                while True:
                    data = await websocket.receive_text()
                    message = json.loads(data)
                    await self.websocket_manager.handle_message(websocket, message)
            except WebSocketDisconnect:
                self.websocket_manager.disconnect(websocket)
        
        # Health check
        @self.app.get("/health")
        async def health_check():
            return {
                "status": "healthy",
                "service": "reVoAgent Dashboard",
                "version": "1.0.0"
            }
        
        # Root endpoint - serve dashboard
        @self.app.get("/")
        async def dashboard():
            return await self._serve_dashboard()
    
    def _setup_static_files(self):
        """Setup static file serving."""
        # Create static directory if it doesn't exist
        self.static_dir.mkdir(parents=True, exist_ok=True)
        
        # Create default dashboard if it doesn't exist
        dashboard_file = self.static_dir / "index.html"
        if not dashboard_file.exists():
            self._create_default_dashboard()
        
        # Mount static files
        self.app.mount("/static", StaticFiles(directory=str(self.static_dir)), name="static")
    
    async def _serve_dashboard(self):
        """Serve the main dashboard."""
        dashboard_file = self.static_dir / "index.html"
        if dashboard_file.exists():
            return FileResponse(str(dashboard_file))
        else:
            return HTMLResponse(self._get_default_dashboard_html())
    
    def _create_default_dashboard(self):
        """Create default dashboard HTML."""
        dashboard_html = self._get_default_dashboard_html()
        dashboard_file = self.static_dir / "index.html"
        
        with open(dashboard_file, 'w') as f:
            f.write(dashboard_html)
        
        # Create CSS file
        css_file = self.static_dir / "dashboard.css"
        with open(css_file, 'w') as f:
            f.write(self._get_dashboard_css())
        
        # Create JavaScript file
        js_file = self.static_dir / "dashboard.js"
        with open(js_file, 'w') as f:
            f.write(self._get_dashboard_js())
    
    def _get_default_dashboard_html(self) -> str:
        """Get default dashboard HTML."""
        return """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>reVoAgent Dashboard</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link href="/static/dashboard.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
</head>
<body class="bg-gray-100">
    <div id="app">
        <!-- Header -->
        <header class="bg-blue-600 text-white shadow-lg">
            <div class="container mx-auto px-4 py-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                        <h1 class="text-2xl font-bold">reVoAgent</h1>
                        <span class="text-blue-200">Agentic AI Coding System</span>
                    </div>
                    <div class="flex items-center space-x-4">
                        <div class="flex items-center space-x-2">
                            <div class="w-3 h-3 rounded-full" :class="systemStatus.color"></div>
                            <span>{{ systemStatus.text }}</span>
                        </div>
                        <button @click="refreshData" class="bg-blue-500 hover:bg-blue-700 px-4 py-2 rounded">
                            Refresh
                        </button>
                    </div>
                </div>
            </div>
        </header>

        <!-- Navigation -->
        <nav class="bg-white shadow-sm border-b">
            <div class="container mx-auto px-4">
                <div class="flex space-x-8">
                    <button 
                        v-for="tab in tabs" 
                        :key="tab.id"
                        @click="activeTab = tab.id"
                        :class="['py-4 px-2 border-b-2 font-medium text-sm', 
                                activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700']">
                        {{ tab.name }}
                    </button>
                </div>
            </div>
        </nav>

        <!-- Main Content -->
        <main class="container mx-auto px-4 py-8">
            <!-- Dashboard Tab -->
            <div v-if="activeTab === 'dashboard'" class="space-y-6">
                <!-- Stats Cards -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div class="bg-white p-6 rounded-lg shadow">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                    <span class="text-white text-sm font-bold">A</span>
                                </div>
                            </div>
                            <div class="ml-4">
                                <p class="text-sm font-medium text-gray-500">Active Agents</p>
                                <p class="text-2xl font-semibold text-gray-900">{{ stats.activeAgents }}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white p-6 rounded-lg shadow">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                    <span class="text-white text-sm font-bold">W</span>
                                </div>
                            </div>
                            <div class="ml-4">
                                <p class="text-sm font-medium text-gray-500">Running Workflows</p>
                                <p class="text-2xl font-semibold text-gray-900">{{ stats.runningWorkflows }}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white p-6 rounded-lg shadow">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <div class="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                                    <span class="text-white text-sm font-bold">T</span>
                                </div>
                            </div>
                            <div class="ml-4">
                                <p class="text-sm font-medium text-gray-500">Tasks Completed</p>
                                <p class="text-2xl font-semibold text-gray-900">{{ stats.tasksCompleted }}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white p-6 rounded-lg shadow">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <div class="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                                    <span class="text-white text-sm font-bold">M</span>
                                </div>
                            </div>
                            <div class="ml-4">
                                <p class="text-sm font-medium text-gray-500">Models Loaded</p>
                                <p class="text-2xl font-semibold text-gray-900">{{ stats.modelsLoaded }}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Charts -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="bg-white p-6 rounded-lg shadow">
                        <h3 class="text-lg font-medium text-gray-900 mb-4">System Performance</h3>
                        <canvas id="performanceChart" width="400" height="200"></canvas>
                    </div>
                    
                    <div class="bg-white p-6 rounded-lg shadow">
                        <h3 class="text-lg font-medium text-gray-900 mb-4">Agent Activity</h3>
                        <canvas id="activityChart" width="400" height="200"></canvas>
                    </div>
                </div>
            </div>

            <!-- Agents Tab -->
            <div v-if="activeTab === 'agents'" class="space-y-6">
                <div class="bg-white shadow rounded-lg">
                    <div class="px-4 py-5 sm:p-6">
                        <h3 class="text-lg leading-6 font-medium text-gray-900">Available Agents</h3>
                        <div class="mt-5">
                            <div class="grid grid-cols-1 gap-4">
                                <div v-for="agent in agents" :key="agent.id" class="border rounded-lg p-4">
                                    <div class="flex items-center justify-between">
                                        <div>
                                            <h4 class="text-lg font-medium">{{ agent.name }}</h4>
                                            <p class="text-gray-500">{{ agent.description }}</p>
                                            <div class="mt-2">
                                                <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                                                              agent.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800']">
                                                    {{ agent.status }}
                                                </span>
                                            </div>
                                        </div>
                                        <div class="flex space-x-2">
                                            <button @click="startAgent(agent.id)" 
                                                    :disabled="agent.status === 'active'"
                                                    class="bg-blue-500 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded">
                                                Start
                                            </button>
                                            <button @click="stopAgent(agent.id)"
                                                    :disabled="agent.status !== 'active'"
                                                    class="bg-red-500 hover:bg-red-700 disabled:bg-gray-300 text-white px-4 py-2 rounded">
                                                Stop
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Workflows Tab -->
            <div v-if="activeTab === 'workflows'" class="space-y-6">
                <div class="bg-white shadow rounded-lg">
                    <div class="px-4 py-5 sm:p-6">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-lg leading-6 font-medium text-gray-900">Workflows</h3>
                            <button @click="createWorkflow" class="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded">
                                Create Workflow
                            </button>
                        </div>
                        <div class="mt-5">
                            <div class="grid grid-cols-1 gap-4">
                                <div v-for="workflow in workflows" :key="workflow.id" class="border rounded-lg p-4">
                                    <div class="flex items-center justify-between">
                                        <div>
                                            <h4 class="text-lg font-medium">{{ workflow.name }}</h4>
                                            <p class="text-gray-500">{{ workflow.description }}</p>
                                            <div class="mt-2 flex items-center space-x-4">
                                                <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                                                              getWorkflowStatusClass(workflow.status)]">
                                                    {{ workflow.status }}
                                                </span>
                                                <span class="text-sm text-gray-500">
                                                    Progress: {{ Math.round(workflow.progress * 100) }}%
                                                </span>
                                            </div>
                                        </div>
                                        <div class="flex space-x-2">
                                            <button @click="startWorkflow(workflow.id)"
                                                    :disabled="workflow.status === 'running'"
                                                    class="bg-blue-500 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded">
                                                Start
                                            </button>
                                            <button @click="pauseWorkflow(workflow.id)"
                                                    :disabled="workflow.status !== 'running'"
                                                    class="bg-yellow-500 hover:bg-yellow-700 disabled:bg-gray-300 text-white px-4 py-2 rounded">
                                                Pause
                                            </button>
                                            <button @click="cancelWorkflow(workflow.id)"
                                                    class="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded">
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Models Tab -->
            <div v-if="activeTab === 'models'" class="space-y-6">
                <div class="bg-white shadow rounded-lg">
                    <div class="px-4 py-5 sm:p-6">
                        <h3 class="text-lg leading-6 font-medium text-gray-900">AI Models</h3>
                        <div class="mt-5">
                            <div class="grid grid-cols-1 gap-4">
                                <div v-for="model in models" :key="model.name" class="border rounded-lg p-4">
                                    <div class="flex items-center justify-between">
                                        <div>
                                            <h4 class="text-lg font-medium">{{ model.display_name }}</h4>
                                            <p class="text-gray-500">{{ model.description }}</p>
                                            <div class="mt-2">
                                                <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                                                              model.loaded ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800']">
                                                    {{ model.loaded ? 'Loaded' : 'Not Loaded' }}
                                                </span>
                                            </div>
                                        </div>
                                        <div class="flex space-x-2">
                                            <button @click="loadModel(model.name)"
                                                    :disabled="model.loaded"
                                                    class="bg-blue-500 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded">
                                                Load
                                            </button>
                                            <button @click="unloadModel(model.name)"
                                                    :disabled="!model.loaded"
                                                    class="bg-red-500 hover:bg-red-700 disabled:bg-gray-300 text-white px-4 py-2 rounded">
                                                Unload
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <script src="/static/dashboard.js"></script>
</body>
</html>
        """
    
    def _get_dashboard_css(self) -> str:
        """Get dashboard CSS."""
        return """
/* Custom dashboard styles */
.chart-container {
    position: relative;
    height: 300px;
}

.status-indicator {
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0.5;
    }
}

.agent-card {
    transition: transform 0.2s;
}

.agent-card:hover {
    transform: translateY(-2px);
}

.workflow-progress {
    background: linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%);
}
        """
    
    def _get_dashboard_js(self) -> str:
        """Get dashboard JavaScript."""
        return """
const { createApp } = Vue;

createApp({
    data() {
        return {
            activeTab: 'dashboard',
            tabs: [
                { id: 'dashboard', name: 'Dashboard' },
                { id: 'agents', name: 'Agents' },
                { id: 'workflows', name: 'Workflows' },
                { id: 'models', name: 'Models' }
            ],
            systemStatus: {
                text: 'Online',
                color: 'bg-green-500'
            },
            stats: {
                activeAgents: 0,
                runningWorkflows: 0,
                tasksCompleted: 0,
                modelsLoaded: 0
            },
            agents: [],
            workflows: [],
            models: [],
            websocket: null
        }
    },
    mounted() {
        this.initializeWebSocket();
        this.loadData();
        this.initializeCharts();
    },
    methods: {
        initializeWebSocket() {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = `${protocol}//${window.location.host}/ws`;
            
            this.websocket = new WebSocket(wsUrl);
            
            this.websocket.onopen = () => {
                console.log('WebSocket connected');
                this.systemStatus = { text: 'Online', color: 'bg-green-500' };
            };
            
            this.websocket.onmessage = (event) => {
                const message = JSON.parse(event.data);
                this.handleWebSocketMessage(message);
            };
            
            this.websocket.onclose = () => {
                console.log('WebSocket disconnected');
                this.systemStatus = { text: 'Offline', color: 'bg-red-500' };
                // Attempt to reconnect
                setTimeout(() => this.initializeWebSocket(), 5000);
            };
        },
        
        handleWebSocketMessage(message) {
            switch (message.type) {
                case 'stats_update':
                    this.stats = message.data;
                    break;
                case 'agent_status':
                    this.updateAgentStatus(message.data);
                    break;
                case 'workflow_update':
                    this.updateWorkflowStatus(message.data);
                    break;
            }
        },
        
        async loadData() {
            try {
                // Load stats
                const statsResponse = await fetch('/api/v1/stats');
                this.stats = await statsResponse.json();
                
                // Load agents
                const agentsResponse = await fetch('/api/v1/agents');
                this.agents = await agentsResponse.json();
                
                // Load workflows
                const workflowsResponse = await fetch('/api/v1/workflows');
                this.workflows = await workflowsResponse.json();
                
                // Load models
                const modelsResponse = await fetch('/api/v1/models');
                this.models = await modelsResponse.json();
                
            } catch (error) {
                console.error('Error loading data:', error);
            }
        },
        
        async refreshData() {
            await this.loadData();
        },
        
        async startAgent(agentId) {
            try {
                await fetch(`/api/v1/agents/${agentId}/start`, { method: 'POST' });
                await this.loadData();
            } catch (error) {
                console.error('Error starting agent:', error);
            }
        },
        
        async stopAgent(agentId) {
            try {
                await fetch(`/api/v1/agents/${agentId}/stop`, { method: 'POST' });
                await this.loadData();
            } catch (error) {
                console.error('Error stopping agent:', error);
            }
        },
        
        async startWorkflow(workflowId) {
            try {
                await fetch(`/api/v1/workflows/${workflowId}/start`, { method: 'POST' });
                await this.loadData();
            } catch (error) {
                console.error('Error starting workflow:', error);
            }
        },
        
        async pauseWorkflow(workflowId) {
            try {
                await fetch(`/api/v1/workflows/${workflowId}/pause`, { method: 'POST' });
                await this.loadData();
            } catch (error) {
                console.error('Error pausing workflow:', error);
            }
        },
        
        async cancelWorkflow(workflowId) {
            try {
                await fetch(`/api/v1/workflows/${workflowId}/cancel`, { method: 'POST' });
                await this.loadData();
            } catch (error) {
                console.error('Error cancelling workflow:', error);
            }
        },
        
        async loadModel(modelName) {
            try {
                await fetch(`/api/v1/models/${modelName}/load`, { method: 'POST' });
                await this.loadData();
            } catch (error) {
                console.error('Error loading model:', error);
            }
        },
        
        async unloadModel(modelName) {
            try {
                await fetch(`/api/v1/models/${modelName}/unload`, { method: 'POST' });
                await this.loadData();
            } catch (error) {
                console.error('Error unloading model:', error);
            }
        },
        
        createWorkflow() {
            // TODO: Implement workflow creation dialog
            alert('Workflow creation coming soon!');
        },
        
        updateAgentStatus(data) {
            const agent = this.agents.find(a => a.id === data.id);
            if (agent) {
                agent.status = data.status;
            }
        },
        
        updateWorkflowStatus(data) {
            const workflow = this.workflows.find(w => w.id === data.id);
            if (workflow) {
                workflow.status = data.status;
                workflow.progress = data.progress;
            }
        },
        
        getWorkflowStatusClass(status) {
            const classes = {
                'pending': 'bg-gray-100 text-gray-800',
                'running': 'bg-blue-100 text-blue-800',
                'paused': 'bg-yellow-100 text-yellow-800',
                'completed': 'bg-green-100 text-green-800',
                'failed': 'bg-red-100 text-red-800',
                'cancelled': 'bg-gray-100 text-gray-800'
            };
            return classes[status] || 'bg-gray-100 text-gray-800';
        },
        
        initializeCharts() {
            // Performance Chart
            const performanceCtx = document.getElementById('performanceChart').getContext('2d');
            new Chart(performanceCtx, {
                type: 'line',
                data: {
                    labels: ['1h ago', '45m ago', '30m ago', '15m ago', 'Now'],
                    datasets: [{
                        label: 'CPU Usage (%)',
                        data: [65, 59, 80, 81, 56],
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.1
                    }, {
                        label: 'Memory Usage (%)',
                        data: [28, 48, 40, 19, 86],
                        borderColor: 'rgb(16, 185, 129)',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100
                        }
                    }
                }
            });
            
            // Activity Chart
            const activityCtx = document.getElementById('activityChart').getContext('2d');
            new Chart(activityCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Code Generation', 'Debugging', 'Testing', 'Deployment'],
                    datasets: [{
                        data: [30, 25, 20, 25],
                        backgroundColor: [
                            'rgb(59, 130, 246)',
                            'rgb(16, 185, 129)',
                            'rgb(245, 158, 11)',
                            'rgb(239, 68, 68)'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }
    }
}).mount('#app');
        """
    
    async def start(self):
        """Start the dashboard server."""
        try:
            config = uvicorn.Config(
                self.app,
                host=self.host,
                port=self.port,
                log_level="info"
            )
            server = uvicorn.Server(config)
            
            self.server_task = asyncio.create_task(server.serve())
            logger.info(f"Dashboard server started at http://{self.host}:{self.port}")
            
            return True
            
        except Exception as e:
            logger.error(f"Error starting dashboard server: {e}")
            return False
    
    async def stop(self):
        """Stop the dashboard server."""
        if self.server_task:
            self.server_task.cancel()
            try:
                await self.server_task
            except asyncio.CancelledError:
                pass
            self.server_task = None
        
        logger.info("Dashboard server stopped")
    
    async def broadcast_update(self, message_type: str, data: Any):
        """Broadcast update to all connected clients."""
        await self.websocket_manager.broadcast({
            "type": message_type,
            "data": data
        })
    
    def get_server_info(self) -> Dict[str, Any]:
        """Get server information."""
        return {
            "host": self.host,
            "port": self.port,
            "url": f"http://{self.host}:{self.port}",
            "running": self.server_task is not None and not self.server_task.done()
        }