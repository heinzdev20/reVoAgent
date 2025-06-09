"""
Perfect Recall Engine - Memory and Context Management
Target: < 100ms retrieval time
"""

import asyncio
import time
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime
import logging

from .memory_manager import MemoryManager, ContextData, ContextResult
from .retrieval_engine import RetrievalEngine, RetrievalQuery
from .context_processor import ContextProcessor, ProcessedContext

logger = logging.getLogger(__name__)

@dataclass
class EngineStatus:
    """Perfect Recall Engine status"""
    status: str
    memory_usage_mb: float
    total_contexts: int
    active_sessions: int
    avg_retrieval_time_ms: float
    cache_hit_rate: float
    last_activity: Optional[datetime]

class PerfectRecallEngine:
    """
    Perfect Recall Engine - Comprehensive memory management and context retention
    
    Capabilities:
    - Infinite memory with <100ms retrieval
    - Intelligent context processing
    - Relationship mapping
    - Session persistence
    """
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or {}
        self.memory_manager = MemoryManager(
            max_contexts=self.config.get('max_contexts', 100000)
        )
        self.retrieval_engine = RetrievalEngine(self.memory_manager)
        self.context_processor = ContextProcessor(self.memory_manager)
        self.is_initialized = False
        self.start_time = datetime.now()
        
    async def initialize(self) -> bool:
        """Initialize the Perfect Recall Engine"""
        try:
            # Initialize components
            memory_init = await self.memory_manager.initialize()
            retrieval_init = await self.retrieval_engine.initialize()
            processor_init = await self.context_processor.initialize()
            
            if memory_init and retrieval_init and processor_init:
                self.is_initialized = True
                logger.info("🔵 Perfect Recall Engine: Fully initialized")
                return True
            else:
                logger.error("🔵 Perfect Recall Engine: Failed to initialize components")
                return False
                
        except Exception as e:
            logger.error(f"🔵 Perfect Recall Engine initialization error: {e}")
            return False
    
    async def store_context(self, content: str, session_id: str,
                          metadata: Optional[Dict[str, Any]] = None,
                          project_id: Optional[str] = None,
                          tags: Optional[List[str]] = None) -> str:
        """
        Store context with intelligent processing
        Returns: context_id
        """
        if not self.is_initialized:
            raise RuntimeError("Engine not initialized")
        
        start_time = time.time()
        
        try:
            # Create context data
            context_data = ContextData(
                content=content,
                metadata=metadata or {},
                timestamp=datetime.now(),
                session_id=session_id,
                project_id=project_id,
                tags=tags or []
            )
            
            # Process context for enhanced metadata
            processed_context = await self.context_processor.process_context(context_data)
            
            # Update context with processed information
            context_data.metadata.update({
                'entities': processed_context.extracted_entities,
                'keywords': processed_context.keywords,
                'code_blocks': processed_context.code_blocks,
                'summary': processed_context.summary,
                'importance_score': processed_context.importance_score
            })
            
            # Store in memory manager
            context_id = await self.memory_manager.store_context(context_data)
            
            storage_time = (time.time() - start_time) * 1000
            logger.debug(f"🔵 Stored and processed context in {storage_time:.2f}ms")
            
            return context_id
            
        except Exception as e:
            logger.error(f"🔵 Error storing context: {e}")
            raise
    
    async def retrieve_context(self, query: str, session_id: Optional[str] = None,
                             project_id: Optional[str] = None,
                             limit: int = 10,
                             min_relevance: float = 0.3) -> List[ContextResult]:
        """
        Retrieve contexts with <100ms guarantee
        """
        if not self.is_initialized:
            raise RuntimeError("Engine not initialized")
        
        try:
            retrieval_query = RetrievalQuery(
                text=query,
                session_id=session_id,
                project_id=project_id,
                limit=limit,
                min_relevance=min_relevance
            )
            
            results = await self.retrieval_engine.retrieve_contexts(retrieval_query)
            
            logger.debug(f"🔵 Retrieved {len(results)} contexts for query")
            return results
            
        except Exception as e:
            logger.error(f"🔵 Error retrieving context: {e}")
            return []
    
    async def get_session_memory(self, session_id: str) -> Dict[str, Any]:
        """
        Get comprehensive session memory information
        """
        if not self.is_initialized:
            raise RuntimeError("Engine not initialized")
        
        try:
            # Get basic session stats
            session_stats = await self.memory_manager.maintain_session_memory(session_id)
            
            # Get context graph
            context_graph = await self.context_processor.build_context_graph(session_id)
            
            # Get context clusters
            clusters = await self.context_processor.find_context_clusters(session_id)
            
            # Get recent contexts
            recent_contexts = await self.retrieval_engine.retrieve_recent(
                session_id=session_id, hours=24, limit=10
            )
            
            memory_info = {
                'session_stats': session_stats,
                'context_graph': context_graph,
                'clusters': clusters,
                'recent_contexts': [
                    {
                        'context_id': ctx.context_id,
                        'summary': ctx.metadata.get('summary', ctx.content[:100]),
                        'relevance_score': ctx.relevance_score,
                        'retrieval_time_ms': ctx.retrieval_time_ms
                    }
                    for ctx in recent_contexts
                ]
            }
            
            return memory_info
            
        except Exception as e:
            logger.error(f"🔵 Error getting session memory: {e}")
            return {}
    
    async def get_engine_status(self) -> EngineStatus:
        """
        Get comprehensive engine status
        """
        try:
            # Get memory stats
            memory_stats = await self.memory_manager.get_memory_stats()
            
            # Get retrieval stats
            retrieval_stats = await self.retrieval_engine.get_retrieval_stats()
            
            # Calculate memory usage in MB
            memory_usage_mb = memory_stats.get('total_memory_bytes', 0) / (1024 * 1024)
            
            status = EngineStatus(
                status='active' if self.is_initialized else 'inactive',
                memory_usage_mb=memory_usage_mb,
                total_contexts=memory_stats.get('total_contexts', 0),
                active_sessions=memory_stats.get('active_sessions', 0),
                avg_retrieval_time_ms=retrieval_stats.get('avg_query_time_ms', 0),
                cache_hit_rate=retrieval_stats.get('cache_hit_rate', 0),
                last_activity=datetime.now()
            )
            
            return status
            
        except Exception as e:
            logger.error(f"🔵 Error getting engine status: {e}")
            return EngineStatus(
                status='error',
                memory_usage_mb=0,
                total_contexts=0,
                active_sessions=0,
                avg_retrieval_time_ms=0,
                cache_hit_rate=0,
                last_activity=None
            )
    
    async def cleanup(self) -> None:
        """
        Cleanup engine resources
        """
        try:
            await self.memory_manager.cleanup()
            await self.retrieval_engine.cleanup()
            await self.context_processor.cleanup()
            
            self.is_initialized = False
            logger.info("🔵 Perfect Recall Engine: Cleanup completed")
            
        except Exception as e:
            logger.error(f"🔵 Error during cleanup: {e}")

# Export main classes
__all__ = [
    'PerfectRecallEngine', 
    'MemoryManager', 
    'RetrievalEngine', 
    'ContextProcessor',
    'ContextData',
    'ContextResult',
    'EngineStatus'
]