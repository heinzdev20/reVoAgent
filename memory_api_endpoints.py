# /backend/api/memory_endpoints.py
"""
Memory-enhanced API endpoints for reVoAgent + Cognee integration
Extends existing FastAPI application with memory capabilities
"""

from fastapi import APIRouter, HTTPException, Depends, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
import asyncio
import json
from datetime import datetime
import uuid

# Import your existing components
from ..auth import get_current_user, verify_api_key
from ..models import User
from packages.ai.cognee_model_manager import (
    CogneeModelManager, MemoryEnabledRequest, MemoryEnabledResponse,
    MemoryConfig, MemoryContext
)

# Create router
memory_router = APIRouter(prefix="/api/memory", tags=["memory"])
chat_router = APIRouter(prefix="/api/chat", tags=["chat-memory"])

# Pydantic models for API
class MemoryChatRequest(BaseModel):
    content: str
    agents: List[str] = Field(default_factory=list)
    session_id: Optional[str] = None
    include_memory_context: bool = True
    memory_tags: Optional[List[str]] = Field(default_factory=list)
    persist_response: bool = True
    max_tokens: int = 1024
    temperature: float = 0.7

class MemoryChatResponse(BaseModel):
    responses: List[Dict[str, Any]]
    memory_context: Optional[Dict[str, Any]] = None
    session_id: str
    cost_breakdown: Dict[str, float]
    performance_metrics: Dict[str, Any]
    total_processing_time: float

class KnowledgeQueryRequest(BaseModel):
    query: str
    query_type: str = "insights"
    agent_filter: Optional[str] = None
    tags_filter: Optional[List[str]] = Field(default_factory=list)
    limit: int = 10

class KnowledgeQueryResponse(BaseModel):
    results: List[Dict[str, Any]]
    query: str
    total_results: int
    query_time: float
    knowledge_graph_stats: Dict[str, Any]

class BatchProcessRequest(BaseModel):
    requests: List[MemoryChatRequest]
    batch_size: int = 10
    concurrent: bool = True

class MemoryStatsResponse(BaseModel):
    memory_enabled: bool
    cognee_initialized: bool
    statistics: Dict[str, Any]
    configuration: Dict[str, Any]
    performance: Dict[str, Any]

# Global memory manager instance
memory_manager: Optional[CogneeModelManager] = None

def get_memory_manager() -> CogneeModelManager:
    """Get the global memory manager instance"""
    global memory_manager
    if memory_manager is None:
        raise HTTPException(
            status_code=503, 
            detail="Memory manager not initialized"
        )
    return memory_manager

async def initialize_memory_manager(config: Dict[str, Any]):
    """Initialize the global memory manager"""
    global memory_manager
    from packages.ai.cognee_model_manager import create_memory_enabled_model_manager
    
    memory_manager = create_memory_enabled_model_manager(config)
    await memory_manager.initialize()

# Enhanced Chat Endpoints
@chat_router.post("/memory-enabled", response_model=MemoryChatResponse)
async def memory_enabled_chat(
    request: MemoryChatRequest,
    current_user: User = Depends(get_current_user),
    manager: CogneeModelManager = Depends(get_memory_manager)
):
    """
    Enhanced chat endpoint with memory capabilities
    Maintains cost optimization while adding persistent memory
    """
    try:
        start_time = datetime.now()
        
        # Generate session ID if not provided
        session_id = request.session_id or str(uuid.uuid4())
        
        # Process with each requested agent
        responses = []
        total_cost = 0.0
        
        for agent_id in request.agents or ["general"]:
            # Create memory-enabled request
            memory_request = MemoryEnabledRequest(
                prompt=request.content,
                agent_id=agent_id,
                memory_tags=request.memory_tags,
                include_memory_context=request.include_memory_context,
                persist_response=request.persist_response,
                session_id=session_id,
                max_tokens=request.max_tokens,
                temperature=request.temperature,
                task_type=agent_id
            )
            
            # Generate response with memory
            response = await manager.generate_with_memory(memory_request)
            
            # Track cost (should remain $0.00 for local models)
            total_cost += response.cost
            
            responses.append({
                "agent_id": agent_id,
                "content": response.content,
                "provider": response.provider.value,
                "tokens_used": response.tokens_used,
                "generation_time": response.generation_time,
                "cost": response.cost,
                "memory_updated": response.memory_updated,
                "knowledge_entities_created": response.knowledge_entities_created,
                "reasoning_steps": response.reasoning_steps or []
            })
        
        # Aggregate memory context from first response
        memory_context = None
        if responses and responses[0].get("memory_context"):
            memory_context = {
                "relevant_knowledge": responses[0]["memory_context"].relevant_knowledge,
                "context_summary": responses[0]["memory_context"].context_summary,
                "patterns_detected": responses[0]["memory_context"].patterns_detected
            }
        
        total_time = (datetime.now() - start_time).total_seconds()
        
        return MemoryChatResponse(
            responses=responses,
            memory_context=memory_context,
            session_id=session_id,
            cost_breakdown={
                "total_cost": total_cost,
                "local_model_cost": 0.0,  # Always $0.00
                "cloud_fallback_cost": total_cost  # Only if fallback used
            },
            performance_metrics={
                "total_processing_time": total_time,
                "average_response_time": total_time / len(responses),
                "agents_used": len(responses),
                "memory_enabled": request.include_memory_context
            },
            total_processing_time=total_time
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Memory chat failed: {str(e)}")

@chat_router.post("/multi-agent/memory-enabled", response_model=MemoryChatResponse)
async def memory_enabled_multi_agent_chat(
    request: MemoryChatRequest,
    current_user: User = Depends(get_current_user),
    manager: CogneeModelManager = Depends(get_memory_manager)
):
    """
    Multi-agent collaboration with shared memory context
    """
    try:
        # Use the same endpoint but with collaboration logic
        # First, get shared memory context
        session_id = request.session_id or str(uuid.uuid4())
        
        # Create initial memory request to get shared context
        context_request = MemoryEnabledRequest(
            prompt=request.content,
            session_id=session_id,
            memory_tags=request.memory_tags + ["multi_agent_collaboration"],
            include_memory_context=True,
            persist_response=False  # Don't persist the context query
        )
        
        # Get shared memory context
        if request.include_memory_context:
            shared_context = await manager._retrieve_memory_context(context_request)
        else:
            shared_context = None
        
        # Process with all agents using shared context
        responses = []
        for agent_id in request.agents:
            agent_request = MemoryEnabledRequest(
                prompt=request.content,
                agent_id=agent_id,
                memory_tags=request.memory_tags + ["multi_agent", f"collaboration_{session_id}"],
                include_memory_context=False,  # Use shared context instead
                persist_response=request.persist_response,
                session_id=session_id,
                max_tokens=request.max_tokens,
                temperature=request.temperature,
                task_type=f"multi_agent_{agent_id}"
            )
            
            # Manually add shared context to request
            if shared_context:
                enhanced_prompt = f"""
                Shared Memory Context:
                {shared_context.context_summary}
                
                Relevant Knowledge:
                {chr(10).join([str(k) for k in shared_context.relevant_knowledge[:3]])}
                
                Collaborate with other agents on this task:
                {request.content}
                """
                agent_request.prompt = enhanced_prompt
            
            response = await manager.generate_with_memory(agent_request)
            
            responses.append({
                "agent_id": agent_id,
                "content": response.content,
                "provider": response.provider.value,
                "tokens_used": response.tokens_used,
                "generation_time": response.generation_time,
                "cost": response.cost,
                "memory_updated": response.memory_updated,
                "shared_context_used": shared_context is not None
            })
        
        return MemoryChatResponse(
            responses=responses,
            memory_context=shared_context.__dict__ if shared_context else None,
            session_id=session_id,
            cost_breakdown={"total_cost": sum(r["cost"] for r in responses)},
            performance_metrics={"collaboration_mode": True},
            total_processing_time=sum(r["generation_time"] for r in responses)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Multi-agent memory chat failed: {str(e)}")

# Memory Management Endpoints
@memory_router.post("/query", response_model=KnowledgeQueryResponse)
async def query_knowledge_graph(
    request: KnowledgeQueryRequest,
    current_user: User = Depends(get_current_user),
    manager: CogneeModelManager = Depends(get_memory_manager)
):
    """Query the knowledge graph directly"""
    try:
        start_time = datetime.now()
        
        # Prepare filters
        filters = {}
        if request.agent_filter:
            filters["agent_id"] = request.agent_filter
        if request.tags_filter:
            filters["tags"] = request.tags_filter
        
        # Query knowledge graph
        result = await manager.query_knowledge_graph(
            query=request.query,
            query_type=request.query_type,
            filters=filters
        )
        
        query_time = (datetime.now() - start_time).total_seconds()
        
        return KnowledgeQueryResponse(
            results=result["results"][:request.limit],
            query=request.query,
            total_results=len(result["results"]),
            query_time=query_time,
            knowledge_graph_stats={
                "filters_applied": result.get("filters_applied", {}),
                "query_type": request.query_type
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Knowledge query failed: {str(e)}")

@memory_router.get("/stats", response_model=MemoryStatsResponse)
async def get_memory_statistics(
    current_user: User = Depends(get_current_user),
    manager: CogneeModelManager = Depends(get_memory_manager)
):
    """Get comprehensive memory system statistics"""
    try:
        stats = manager.get_memory_statistics()
        
        return MemoryStatsResponse(
            memory_enabled=stats["memory_enabled"],
            cognee_initialized=stats["cognee_initialized"],
            statistics=stats["statistics"],
            configuration=stats["configuration"],
            performance=stats["performance"]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get memory stats: {str(e)}")

@memory_router.delete("/agents/{agent_id}")
async def clear_agent_memory(
    agent_id: str,
    current_user: User = Depends(get_current_user),
    manager: CogneeModelManager = Depends(get_memory_manager)
):
    """Clear memory for a specific agent"""
    try:
        result = await manager.clear_agent_memory(agent_id)
        return JSONResponse(content=result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to clear agent memory: {str(e)}")

@memory_router.post("/batch-process")
async def batch_process_with_memory(
    request: BatchProcessRequest,
    current_user: User = Depends(get_current_user),
    manager: CogneeModelManager = Depends(get_memory_manager)
):
    """Process multiple requests with memory in batches"""
    try:
        # Convert requests to MemoryEnabledRequest objects
        memory_requests = []
        for req in request.requests:
            memory_req = MemoryEnabledRequest(
                prompt=req.content,
                agent_id=req.agents[0] if req.agents else "general",
                memory_tags=req.memory_tags,
                include_memory_context=req.include_memory_context,
                persist_response=req.persist_response,
                session_id=req.session_id or str(uuid.uuid4()),
                max_tokens=req.max_tokens,
                temperature=req.temperature
            )
            memory_requests.append(memory_req)
        
        # Process batch
        responses = await manager.batch_process_with_memory(
            memory_requests, 
            batch_size=request.batch_size
        )
        
        # Format responses
        formatted_responses = []
        for response in responses:
            formatted_responses.append({
                "content": response.content,
                "provider": response.provider.value,
                "cost": response.cost,
                "memory_updated": response.memory_updated,
                "processing_time": response.total_processing_time
            })
        
        return {
            "processed_count": len(formatted_responses),
            "total_cost": sum(r["cost"] for r in formatted_responses),
            "batch_size": request.batch_size,
            "responses": formatted_responses
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch processing failed: {str(e)}")

# WebSocket handlers for real-time memory interactions
class MemoryWebSocketManager:
    """Manage WebSocket connections for memory-enabled real-time chat"""
    
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.session_contexts: Dict[str, Dict[str, Any]] = {}
    
    async def connect(self, websocket: WebSocket, session_id: str):
        await websocket.accept()
        self.active_connections[session_id] = websocket
        self.session_contexts[session_id] = {
            "connected_at": datetime.now().isoformat(),
            "message_count": 0
        }
    
    def disconnect(self, session_id: str):
        if session_id in self.active_connections:
            del self.active_connections[session_id]
        if session_id in self.session_contexts:
            del self.session_contexts[session_id]
    
    async def send_personal_message(self, message: dict, session_id: str):
        if session_id in self.active_connections:
            await self.active_connections[session_id].send_json(message)
    
    async def broadcast_to_session(self, message: dict, session_id: str):
        await self.send_personal_message(message, session_id)

memory_ws_manager = MemoryWebSocketManager()

@memory_router.websocket("/ws/{session_id}")
async def memory_websocket_endpoint(
    websocket: WebSocket, 
    session_id: str,
    manager: CogneeModelManager = Depends(get_memory_manager)
):
    """WebSocket endpoint for real-time memory-enabled chat"""
    await memory_ws_manager.connect(websocket, session_id)
    
    try:
        while True:
            # Receive message
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            message_type = message_data.get("type")
            
            if message_type == "memory_chat":
                await handle_memory_chat_ws(
                    websocket, session_id, message_data, manager
                )
            elif message_type == "knowledge_query":
                await handle_knowledge_query_ws(
                    websocket, session_id, message_data, manager
                )
            elif message_type == "get_session_context":
                await handle_session_context_ws(
                    websocket, session_id, message_data, manager
                )
            
    except WebSocketDisconnect:
        memory_ws_manager.disconnect(session_id)

async def handle_memory_chat_ws(
    websocket: WebSocket, 
    session_id: str, 
    message_data: dict,
    manager: CogneeModelManager
):
    """Handle memory-enabled chat via WebSocket"""
    try:
        content = message_data.get("content", "")
        agents = message_data.get("agents", ["general"])
        include_memory = message_data.get("include_memory_context", True)
        memory_tags = message_data.get("memory_tags", [])
        
        # Process with memory
        responses = []
        for agent_id in agents:
            memory_request = MemoryEnabledRequest(
                prompt=content,
                agent_id=agent_id,
                memory_tags=memory_tags,
                include_memory_context=include_memory,
                persist_response=True,
                session_id=session_id
            )
            
            response = await manager.generate_with_memory(memory_request)
            
            responses.append({
                "agent_id": agent_id,
                "content": response.content,
                "provider": response.provider.value,
                "cost": response.cost,
                "memory_updated": response.memory_updated,
                "memory_context": response.memory_context.__dict__ if response.memory_context else None
            })
        
        # Send response
        await memory_ws_manager.send_personal_message({
            "type": "memory_chat_response",
            "session_id": session_id,
            "responses": responses,
            "timestamp": datetime.now().isoformat()
        }, session_id)
        
    except Exception as e:
        await memory_ws_manager.send_personal_message({
            "type": "error",
            "message": f"Memory chat failed: {str(e)}"
        }, session_id)

async def handle_knowledge_query_ws(
    websocket: WebSocket,
    session_id: str,
    message_data: dict,
    manager: CogneeModelManager
):
    """Handle knowledge graph queries via WebSocket"""
    try:
        query = message_data.get("query", "")
        query_type = message_data.get("query_type", "insights")
        agent_filter = message_data.get("agent_filter")
        tags_filter = message_data.get("tags_filter", [])
        
        # Prepare filters
        filters = {}
        if agent_filter:
            filters["agent_id"] = agent_filter
        if tags_filter:
            filters["tags"] = tags_filter
        
        # Query knowledge graph
        result = await manager.query_knowledge_graph(
            query=query,
            query_type=query_type,
            filters=filters
        )
        
        # Send response
        await memory_ws_manager.send_personal_message({
            "type": "knowledge_query_response",
            "session_id": session_id,
            "query": query,
            "results": result["results"][:10],  # Limit for WebSocket
            "total_results": len(result["results"]),
            "timestamp": datetime.now().isoformat()
        }, session_id)
        
    except Exception as e:
        await memory_ws_manager.send_personal_message({
            "type": "error",
            "message": f"Knowledge query failed: {str(e)}"
        }, session_id)

async def handle_session_context_ws(
    websocket: WebSocket,
    session_id: str,
    message_data: dict,
    manager: CogneeModelManager
):
    """Handle session context requests via WebSocket"""
    try:
        # Get session context from memory
        context_query = f"session_id:{session_id}"
        
        result = await manager.query_knowledge_graph(
            query=context_query,
            query_type="insights"
        )
        
        # Send session context
        await memory_ws_manager.send_personal_message({
            "type": "session_context_response",
            "session_id": session_id,
            "context": result["results"],
            "session_stats": memory_ws_manager.session_contexts.get(session_id, {}),
            "timestamp": datetime.now().isoformat()
        }, session_id)
        
    except Exception as e:
        await memory_ws_manager.send_personal_message({
            "type": "error",
            "message": f"Session context failed: {str(e)}"
        }, session_id)

# Health check endpoint for memory system
@memory_router.get("/health")
async def memory_health_check(
    manager: CogneeModelManager = Depends(get_memory_manager)
):
    """Health check for memory system"""
    try:
        stats = manager.get_memory_statistics()
        
        health_status = {
            "memory_system": "healthy" if stats["cognee_initialized"] else "degraded",
            "memory_enabled": stats["memory_enabled"],
            "cognee_initialized": stats["cognee_initialized"],
            "performance": stats["performance"],
            "timestamp": datetime.now().isoformat()
        }
        
        return JSONResponse(
            content=health_status,
            status_code=200 if stats["cognee_initialized"] else 503
        )
        
    except Exception as e:
        return JSONResponse(
            content={
                "memory_system": "unhealthy",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            },
            status_code=503
        )
