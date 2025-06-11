# /packages/ai/cognee_model_manager.py
"""
Enhanced Local AI Model Manager with Cognee Memory Integration
Extends existing LocalModelManager while preserving 100% cost optimization
"""

import os
import asyncio
import cognee
from typing import Dict, Any, Optional, List, Union
from dataclasses import dataclass, field
from enum import Enum
import logging
from datetime import datetime
import json

# Import existing components
from .local_model_manager import (
    LocalModelManager, ModelProvider, ModelConfig, 
    GenerationRequest, GenerationResponse
)

logger = logging.getLogger(__name__)

# Enhanced dataclasses for memory integration
@dataclass
class MemoryConfig:
    """Configuration for Cognee memory integration"""
    enable_memory: bool = True
    vector_db_provider: str = "lancedb"
    graph_db_provider: str = "networkx"
    relational_db_provider: str = "postgres"
    memory_cache_size: int = 1000
    auto_persist: bool = True
    context_window: int = 5
    similarity_threshold: float = 0.7

@dataclass
class MemoryEnabledRequest(GenerationRequest):
    """Extended request with memory capabilities"""
    agent_id: Optional[str] = None
    memory_tags: Optional[List[str]] = field(default_factory=list)
    context_query: Optional[str] = None
    include_memory_context: bool = True
    persist_response: bool = True
    session_id: Optional[str] = None
    memory_config: Optional[MemoryConfig] = None

@dataclass
class MemoryContext:
    """Memory context retrieved from Cognee"""
    relevant_knowledge: List[Dict[str, Any]] = field(default_factory=list)
    context_summary: str = ""
    knowledge_graph_entities: List[Dict[str, Any]] = field(default_factory=list)
    patterns_detected: List[str] = field(default_factory=list)
    agent_specific_context: Dict[str, Any] = field(default_factory=dict)
    retrieval_time: float = 0.0
    source_tags: List[str] = field(default_factory=list)

@dataclass
class MemoryEnabledResponse(GenerationResponse):
    """Enhanced response with memory metadata"""
    memory_context: Optional[MemoryContext] = None
    memory_updated: bool = False
    knowledge_entities_created: int = 0
    memory_retrieval_time: float = 0.0
    total_processing_time: float = 0.0

class CogneeIntegrationError(Exception):
    """Custom exception for Cognee integration issues"""
    pass

class CogneeModelManager(LocalModelManager):
    """
    Enhanced LocalModelManager with Cognee memory capabilities
    Maintains 100% cost optimization while adding persistent memory
    """
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        
        # Memory configuration
        self.memory_config = MemoryConfig(**config.get("memory_config", {}))
        self.cognee_initialized = False
        self.memory_stats = {
            "total_queries": 0,
            "cache_hits": 0,
            "knowledge_entities": 0,
            "memory_updates": 0
        }
        
        # Agent-specific memory configurations
        self.agent_memory_configs = config.get("agent_memory_configs", {})
        
    async def initialize(self):
        """Initialize models and Cognee memory system"""
        # Initialize parent model manager
        await super().initialize()
        
        # Initialize Cognee memory if enabled
        if self.memory_config.enable_memory:
            await self._initialize_cognee_memory()
        
        logger.info("🧠 CogneeModelManager initialization complete")
    
    async def _initialize_cognee_memory(self):
        """Initialize Cognee with local model configuration"""
        try:
            logger.info("🚀 Initializing Cognee memory system...")
            
            # Configure Cognee to use local models instead of OpenAI
            await self._configure_cognee_local_models()
            
            # Configure vector database
            await self._configure_vector_database()
            
            # Configure graph database
            await self._configure_graph_database()
            
            # Configure relational database
            await self._configure_relational_database()
            
            # Test Cognee functionality
            await self._test_cognee_functionality()
            
            self.cognee_initialized = True
            logger.info("✅ Cognee memory system initialized with local models")
            
        except Exception as e:
            logger.error(f"❌ Cognee initialization failed: {e}")
            # Gracefully degrade to non-memory mode
            self.memory_config.enable_memory = False
            logger.warning("⚠️ Continuing without memory capabilities")
    
    async def _configure_cognee_local_models(self):
        """Configure Cognee to use reVoAgent's local models"""
        
        # Create local model endpoint configuration
        local_endpoint = "http://localhost:8000/v1/chat/completions"
        
        # Configure LLM to use local models
        cognee.config.set_llm_config({
            "provider": "openai",  # Use OpenAI-compatible interface
            "model": "local-deepseek-r1",
            "api_endpoint": local_endpoint,
            "api_key": "local-key",  # Dummy key for local models
            "max_tokens": self.config.get("max_tokens", 4096),
            "temperature": 0.7
        })
        
        # Configure embeddings to use local models
        cognee.config.set_embedding_config({
            "provider": "local",
            "model": "local-embeddings",
            "api_endpoint": f"{local_endpoint}/embeddings",
            "api_key": "local-key",
            "dimensions": 1536  # Adjust based on local embedding model
        })
        
        logger.info("🔧 Configured Cognee to use local models")
    
    async def _configure_vector_database(self):
        """Configure local vector database"""
        vector_config = {
            "provider": self.memory_config.vector_db_provider,
            "path": "./data/cognee_vectors",
            "cache_size": self.memory_config.memory_cache_size
        }
        
        if self.memory_config.vector_db_provider == "lancedb":
            vector_config.update({
                "table_name": "revoagent_memory",
                "metric": "cosine"
            })
        
        cognee.config.set_vector_db_config(vector_config)
        logger.info(f"🗄️ Configured vector database: {self.memory_config.vector_db_provider}")
    
    async def _configure_graph_database(self):
        """Configure local graph database"""
        graph_config = {
            "provider": self.memory_config.graph_db_provider,
            "path": "./data/cognee_graphs"
        }
        
        if self.memory_config.graph_db_provider == "neo4j":
            graph_config.update({
                "url": os.getenv("NEO4J_URL", "bolt://localhost:7687"),
                "username": os.getenv("NEO4J_USERNAME", "neo4j"),
                "password": os.getenv("NEO4J_PASSWORD", "password")
            })
        
        cognee.config.set_graph_db_config(graph_config)
        logger.info(f"📊 Configured graph database: {self.memory_config.graph_db_provider}")
    
    async def _configure_relational_database(self):
        """Configure relational database for Cognee"""
        db_config = {
            "provider": self.memory_config.relational_db_provider,
            "host": os.getenv("DB_HOST", "localhost"),
            "port": int(os.getenv("DB_PORT", "5432")),
            "database": os.getenv("DB_NAME", "revoagent_memory"),
            "username": os.getenv("DB_USERNAME", "revoagent"),
            "password": os.getenv("DB_PASSWORD", "secure_password")
        }
        
        cognee.config.set_db_config(db_config)
        logger.info(f"💾 Configured relational database: {self.memory_config.relational_db_provider}")
    
    async def _test_cognee_functionality(self):
        """Test basic Cognee functionality"""
        try:
            # Test basic add and search
            test_content = "reVoAgent initialization test for Cognee integration"
            await cognee.add(test_content, dataset_name="initialization_test")
            await cognee.cognify()
            
            # Test search
            results = await cognee.search(
                query_text="reVoAgent test",
                query_type="insights"
            )
            
            logger.info(f"🧪 Cognee test successful - found {len(results)} results")
            
        except Exception as e:
            raise CogneeIntegrationError(f"Cognee functionality test failed: {e}")
    
    async def generate_with_memory(
        self, 
        request: MemoryEnabledRequest
    ) -> MemoryEnabledResponse:
        """
        Generate response with memory context and persistence
        Maintains cost optimization while adding memory capabilities
        """
        start_time = datetime.now()
        
        try:
            # 1. Retrieve memory context if enabled
            memory_context = None
            if (request.include_memory_context and 
                self.memory_config.enable_memory and 
                self.cognee_initialized):
                
                memory_context = await self._retrieve_memory_context(request)
            
            # 2. Enhance prompt with memory context
            enhanced_request = self._enhance_request_with_memory(
                request, memory_context
            )
            
            # 3. Generate response using existing model manager
            base_response = await super().generate(enhanced_request)
            
            # 4. Persist response to memory if enabled
            memory_updated = False
            entities_created = 0
            
            if (request.persist_response and 
                self.memory_config.enable_memory and 
                self.cognee_initialized):
                
                memory_result = await self._persist_to_memory(
                    request, base_response
                )
                memory_updated = memory_result["updated"]
                entities_created = memory_result["entities_created"]
            
            # 5. Create enhanced response
            total_time = (datetime.now() - start_time).total_seconds()
            
            return MemoryEnabledResponse(
                content=base_response.content,
                provider=base_response.provider,
                tokens_used=base_response.tokens_used,
                generation_time=base_response.generation_time,
                cost=base_response.cost,  # Maintain $0.00 for local models
                reasoning_steps=base_response.reasoning_steps,
                memory_context=memory_context,
                memory_updated=memory_updated,
                knowledge_entities_created=entities_created,
                memory_retrieval_time=memory_context.retrieval_time if memory_context else 0.0,
                total_processing_time=total_time
            )
            
        except Exception as e:
            logger.error(f"Memory-enabled generation failed: {e}")
            
            # Fallback to regular generation without memory
            base_response = await super().generate(request)
            
            return MemoryEnabledResponse(
                content=base_response.content,
                provider=base_response.provider,
                tokens_used=base_response.tokens_used,
                generation_time=base_response.generation_time,
                cost=base_response.cost,
                reasoning_steps=base_response.reasoning_steps,
                memory_context=None,
                memory_updated=False,
                knowledge_entities_created=0,
                memory_retrieval_time=0.0,
                total_processing_time=(datetime.now() - start_time).total_seconds()
            )
    
    async def _retrieve_memory_context(
        self, 
        request: MemoryEnabledRequest
    ) -> MemoryContext:
        """Retrieve relevant memory context for the request"""
        retrieval_start = datetime.now()
        
        try:
            # Prepare search query
            search_query = request.context_query or request.prompt
            
            # Add agent-specific context if available
            if request.agent_id:
                search_query = f"agent:{request.agent_id} {search_query}"
            
            # Add tags to search
            if request.memory_tags:
                tag_query = " ".join([f"tag:{tag}" for tag in request.memory_tags])
                search_query = f"{search_query} {tag_query}"
            
            # Search for relevant knowledge
            search_results = await cognee.search(
                query_text=search_query,
                query_type="insights"
            )
            
            # Filter and process results
            filtered_results = self._filter_memory_results(
                search_results, request
            )
            
            # Extract entities and patterns
            entities = self._extract_entities(filtered_results)
            patterns = self._detect_patterns(filtered_results, request.agent_id)
            
            # Generate context summary
            context_summary = await self._generate_context_summary(
                filtered_results, request
            )
            
            # Get agent-specific context
            agent_context = await self._get_agent_specific_context(
                request.agent_id, search_query
            )
            
            retrieval_time = (datetime.now() - retrieval_start).total_seconds()
            
            # Update stats
            self.memory_stats["total_queries"] += 1
            if filtered_results:
                self.memory_stats["cache_hits"] += 1
            
            return MemoryContext(
                relevant_knowledge=filtered_results[:self.memory_config.context_window],
                context_summary=context_summary,
                knowledge_graph_entities=entities,
                patterns_detected=patterns,
                agent_specific_context=agent_context,
                retrieval_time=retrieval_time,
                source_tags=request.memory_tags or []
            )
            
        except Exception as e:
            logger.warning(f"Memory context retrieval failed: {e}")
            return MemoryContext(
                retrieval_time=(datetime.now() - retrieval_start).total_seconds()
            )
    
    def _enhance_request_with_memory(
        self, 
        request: MemoryEnabledRequest, 
        memory_context: Optional[MemoryContext]
    ) -> GenerationRequest:
        """Enhance the request prompt with memory context"""
        
        if not memory_context or not memory_context.relevant_knowledge:
            return request
        
        # Build context section
        context_sections = []
        
        # Add relevant knowledge
        if memory_context.relevant_knowledge:
            knowledge_items = []
            for item in memory_context.relevant_knowledge[:3]:  # Top 3 items
                if isinstance(item, dict):
                    knowledge_items.append(f"- {item.get('description', str(item))}")
                else:
                    knowledge_items.append(f"- {str(item)}")
            
            context_sections.append(
                f"Relevant Knowledge:\n" + "\n".join(knowledge_items)
            )
        
        # Add patterns
        if memory_context.patterns_detected:
            patterns_text = "Detected Patterns:\n" + "\n".join([
                f"- {pattern}" for pattern in memory_context.patterns_detected[:3]
            ])
            context_sections.append(patterns_text)
        
        # Add agent-specific context
        if memory_context.agent_specific_context:
            agent_context = memory_context.agent_specific_context
            if agent_context.get("recent_interactions"):
                context_sections.append(
                    f"Recent Agent Context:\n- {agent_context['recent_interactions']}"
                )
        
        # Enhance system prompt
        enhanced_system_prompt = request.system_prompt or ""
        if context_sections:
            memory_context_text = "\n\n".join(context_sections)
            enhanced_system_prompt += f"\n\nMemory Context:\n{memory_context_text}\n\nUse this context to provide more informed and consistent responses."
        
        # Create enhanced request
        return GenerationRequest(
            prompt=request.prompt,
            max_tokens=request.max_tokens,
            temperature=request.temperature,
            task_type=request.task_type,
            system_prompt=enhanced_system_prompt,
            preferred_provider=request.preferred_provider
        )
    
    async def _persist_to_memory(
        self, 
        request: MemoryEnabledRequest, 
        response: GenerationResponse
    ) -> Dict[str, Any]:
        """Persist interaction to memory"""
        try:
            # Create memory entry
            memory_entry = {
                "prompt": request.prompt,
                "response": response.content,
                "agent_id": request.agent_id,
                "session_id": request.session_id,
                "tags": request.memory_tags or [],
                "task_type": request.task_type,
                "provider": response.provider.value,
                "cost": response.cost,
                "timestamp": datetime.now().isoformat(),
                "reasoning_steps": response.reasoning_steps or []
            }
            
            # Add to cognee with appropriate dataset
            dataset_name = f"agent_{request.agent_id}" if request.agent_id else "general"
            
            await cognee.add(
                data=json.dumps(memory_entry),
                dataset_name=dataset_name
            )
            
            # Update knowledge graph
            await cognee.cognify()
            
            # Update stats
            self.memory_stats["memory_updates"] += 1
            
            logger.debug(f"Memory updated for agent: {request.agent_id}")
            
            return {
                "updated": True,
                "entities_created": 1,  # Simplified for now
                "dataset": dataset_name
            }
            
        except Exception as e:
            logger.warning(f"Memory persistence failed: {e}")
            return {
                "updated": False,
                "entities_created": 0,
                "error": str(e)
            }
    
    def _filter_memory_results(
        self, 
        results: List[Any], 
        request: MemoryEnabledRequest
    ) -> List[Dict[str, Any]]:
        """Filter memory results based on request criteria"""
        
        filtered = []
        
        for result in results:
            # Convert result to dict if needed
            if not isinstance(result, dict):
                if hasattr(result, '__dict__'):
                    result_dict = result.__dict__
                else:
                    result_dict = {"content": str(result)}
            else:
                result_dict = result
            
            # Filter by agent if specified
            if request.agent_id:
                result_agent = result_dict.get("agent_id")
                if result_agent and result_agent != request.agent_id:
                    continue
            
            # Filter by tags if specified
            if request.memory_tags:
                result_tags = result_dict.get("tags", [])
                if not any(tag in result_tags for tag in request.memory_tags):
                    continue
            
            # Apply similarity threshold
            confidence = result_dict.get("confidence", 1.0)
            if confidence < self.memory_config.similarity_threshold:
                continue
            
            filtered.append(result_dict)
        
        return filtered
    
    def _extract_entities(self, results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Extract entities from memory results"""
        entities = []
        
        for result in results:
            # Extract entities based on result structure
            if "entities" in result:
                entities.extend(result["entities"])
            elif "id" in result and "name" in result:
                entities.append({
                    "id": result["id"],
                    "name": result["name"],
                    "type": result.get("type", "unknown")
                })
        
        # Remove duplicates
        seen_ids = set()
        unique_entities = []
        for entity in entities:
            entity_id = entity.get("id")
            if entity_id and entity_id not in seen_ids:
                seen_ids.add(entity_id)
                unique_entities.append(entity)
        
        return unique_entities
    
    def _detect_patterns(
        self, 
        results: List[Dict[str, Any]], 
        agent_id: Optional[str]
    ) -> List[str]:
        """Detect patterns in memory results"""
        patterns = []
        
        if not results:
            return patterns
        
        # Analyze common themes
        themes = {}
        for result in results:
            # Extract keywords/themes from result
            content = result.get("content", "")
            if isinstance(content, str):
                words = content.lower().split()
                for word in words:
                    if len(word) > 4:  # Filter short words
                        themes[word] = themes.get(word, 0) + 1
        
        # Identify top themes as patterns
        sorted_themes = sorted(themes.items(), key=lambda x: x[1], reverse=True)
        for theme, count in sorted_themes[:3]:
            if count > 1:
                patterns.append(f"Common theme: {theme} (mentioned {count} times)")
        
        # Add agent-specific patterns
        if agent_id:
            agent_results = [r for r in results if r.get("agent_id") == agent_id]
            if len(agent_results) > 1:
                patterns.append(f"Multiple interactions with {agent_id}")
        
        return patterns
    
    async def _generate_context_summary(
        self, 
        results: List[Dict[str, Any]], 
        request: MemoryEnabledRequest
    ) -> str:
        """Generate a summary of the memory context"""
        
        if not results:
            return "No relevant context found."
        
        # Create summary based on results
        summary_parts = []
        
        # Count by agent
        agent_counts = {}
        for result in results:
            agent = result.get("agent_id", "unknown")
            agent_counts[agent] = agent_counts.get(agent, 0) + 1
        
        if agent_counts:
            agent_summary = ", ".join([
                f"{agent}: {count}" for agent, count in agent_counts.items()
            ])
            summary_parts.append(f"Previous interactions: {agent_summary}")
        
        # Add task type summary
        task_types = set(result.get("task_type") for result in results)
        task_types.discard(None)
        if task_types:
            summary_parts.append(f"Related tasks: {', '.join(task_types)}")
        
        return "; ".join(summary_parts) if summary_parts else "Context available from previous interactions."
    
    async def _get_agent_specific_context(
        self, 
        agent_id: Optional[str], 
        query: str
    ) -> Dict[str, Any]:
        """Get agent-specific memory context"""
        
        if not agent_id:
            return {}
        
        try:
            # Search for agent-specific interactions
            agent_query = f"agent_id:{agent_id}"
            agent_results = await cognee.search(
                query_text=agent_query,
                query_type="insights"
            )
            
            # Process agent-specific results
            recent_interactions = []
            for result in agent_results[-3:]:  # Last 3 interactions
                if isinstance(result, dict):
                    interaction = result.get("prompt", "")
                    if interaction:
                        recent_interactions.append(interaction[:100] + "...")
            
            return {
                "recent_interactions": "; ".join(recent_interactions),
                "interaction_count": len(agent_results),
                "agent_id": agent_id
            }
            
        except Exception as e:
            logger.warning(f"Failed to get agent-specific context: {e}")
            return {}
    
    # Batch processing methods
    async def batch_process_with_memory(
        self, 
        requests: List[MemoryEnabledRequest],
        batch_size: int = 10
    ) -> List[MemoryEnabledResponse]:
        """Process multiple requests with memory in batches"""
        
        responses = []
        
        for i in range(0, len(requests), batch_size):
            batch = requests[i:i + batch_size]
            
            # Process batch concurrently
            batch_tasks = [
                self.generate_with_memory(request) 
                for request in batch
            ]
            
            batch_responses = await asyncio.gather(*batch_tasks)
            responses.extend(batch_responses)
            
            # Brief pause between batches to prevent overload
            if i + batch_size < len(requests):
                await asyncio.sleep(0.1)
        
        return responses
    
    # Knowledge management methods
    async def query_knowledge_graph(
        self, 
        query: str, 
        query_type: str = "insights",
        filters: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Query the knowledge graph directly"""
        
        try:
            results = await cognee.search(
                query_text=query,
                query_type=query_type
            )
            
            # Apply filters if provided
            if filters:
                results = self._apply_knowledge_filters(results, filters)
            
            return {
                "results": results,
                "query": query,
                "query_type": query_type,
                "result_count": len(results),
                "filters_applied": filters or {}
            }
            
        except Exception as e:
            logger.error(f"Knowledge graph query failed: {e}")
            return {
                "results": [],
                "query": query,
                "error": str(e)
            }
    
    def _apply_knowledge_filters(
        self, 
        results: List[Any], 
        filters: Dict[str, Any]
    ) -> List[Any]:
        """Apply filters to knowledge graph results"""
        
        filtered = results
        
        # Filter by agent
        if "agent_id" in filters:
            agent_id = filters["agent_id"]
            filtered = [
                r for r in filtered 
                if isinstance(r, dict) and r.get("agent_id") == agent_id
            ]
        
        # Filter by tags
        if "tags" in filters:
            tags = filters["tags"]
            filtered = [
                r for r in filtered 
                if isinstance(r, dict) and 
                any(tag in r.get("tags", []) for tag in tags)
            ]
        
        # Filter by time range
        if "start_time" in filters or "end_time" in filters:
            # Implement time-based filtering
            pass
        
        return filtered
    
    async def clear_agent_memory(self, agent_id: str) -> Dict[str, Any]:
        """Clear memory for a specific agent"""
        
        try:
            # This would require implementing a delete function in cognee
            # For now, we'll mark it as cleared in our tracking
            logger.info(f"Clearing memory for agent: {agent_id}")
            
            return {
                "agent_id": agent_id,
                "cleared": True,
                "message": "Memory clear requested (implementation pending)"
            }
            
        except Exception as e:
            logger.error(f"Failed to clear agent memory: {e}")
            return {
                "agent_id": agent_id,
                "cleared": False,
                "error": str(e)
            }
    
    def get_memory_statistics(self) -> Dict[str, Any]:
        """Get comprehensive memory system statistics"""
        
        return {
            "memory_enabled": self.memory_config.enable_memory,
            "cognee_initialized": self.cognee_initialized,
            "statistics": self.memory_stats,
            "configuration": {
                "vector_db": self.memory_config.vector_db_provider,
                "graph_db": self.memory_config.graph_db_provider,
                "relational_db": self.memory_config.relational_db_provider,
                "cache_size": self.memory_config.memory_cache_size,
                "auto_persist": self.memory_config.auto_persist
            },
            "performance": {
                "cache_hit_rate": (
                    self.memory_stats["cache_hits"] / 
                    max(self.memory_stats["total_queries"], 1)
                ) * 100,
                "total_entities": self.memory_stats["knowledge_entities"]
            }
        }

# Factory function for easy integration
def create_memory_enabled_model_manager(config: Dict[str, Any]) -> CogneeModelManager:
    """Create a memory-enabled model manager with optimized configuration"""
    
    # Merge with default memory configuration
    default_memory_config = {
        "memory_config": {
            "enable_memory": True,
            "vector_db_provider": "lancedb",
            "graph_db_provider": "networkx",
            "relational_db_provider": "postgres",
            "memory_cache_size": 1000,
            "auto_persist": True,
            "context_window": 5,
            "similarity_threshold": 0.7
        }
    }
    
    # Merge configurations
    merged_config = {**config, **default_memory_config}
    
    return CogneeModelManager(merged_config)
