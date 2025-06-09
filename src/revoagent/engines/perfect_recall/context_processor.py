"""
Perfect Recall Engine - Context Processor
Intelligent context handling and relationship mapping
"""

import asyncio
import re
from typing import Dict, List, Any, Optional, Set, Tuple
from dataclasses import dataclass
from datetime import datetime
import logging

from .memory_manager import ContextData, MemoryManager

logger = logging.getLogger(__name__)

@dataclass
class ContextRelationship:
    """Relationship between contexts"""
    source_id: str
    target_id: str
    relationship_type: str
    strength: float
    metadata: Dict[str, Any]

@dataclass
class ProcessedContext:
    """Context with extracted metadata and relationships"""
    original_context: ContextData
    extracted_entities: List[str]
    keywords: List[str]
    code_blocks: List[str]
    relationships: List[ContextRelationship]
    summary: str
    importance_score: float

class ContextProcessor:
    """
    Intelligent context processing with relationship mapping
    Extracts entities, keywords, and builds context relationships
    """
    
    def __init__(self, memory_manager: MemoryManager):
        self.memory_manager = memory_manager
        self.entity_patterns = {
            'file_path': r'(?:\.\/|\/|[A-Za-z]:\\)[\w\-_\/\\\.]+\.\w+',
            'function_name': r'\b[a-zA-Z_][a-zA-Z0-9_]*\s*\(',
            'class_name': r'\bclass\s+([A-Za-z_][A-Za-z0-9_]*)',
            'variable_name': r'\b[a-zA-Z_][a-zA-Z0-9_]*\s*=',
            'url': r'https?://[^\s]+',
            'email': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
            'error_message': r'Error:|Exception:|Traceback:'
        }
        self.code_patterns = {
            'python': r'```python\n(.*?)\n```',
            'javascript': r'```javascript\n(.*?)\n```',
            'bash': r'```bash\n(.*?)\n```',
            'sql': r'```sql\n(.*?)\n```',
            'generic': r'```\n(.*?)\n```'
        }
        self.relationship_cache: Dict[str, List[ContextRelationship]] = {}
        
    async def initialize(self) -> bool:
        """Initialize context processor"""
        try:
            logger.info("🔵 Perfect Recall Engine: Context Processor initialized")
            return True
        except Exception as e:
            logger.error(f"🔵 Failed to initialize Context Processor: {e}")
            return False
    
    async def process_context(self, context: ContextData) -> ProcessedContext:
        """
        Process context to extract metadata and relationships
        """
        try:
            # Extract entities
            entities = await self._extract_entities(context.content)
            
            # Extract keywords
            keywords = await self._extract_keywords(context.content)
            
            # Extract code blocks
            code_blocks = await self._extract_code_blocks(context.content)
            
            # Generate summary
            summary = await self._generate_summary(context.content)
            
            # Calculate importance score
            importance_score = await self._calculate_importance(context, entities, keywords)
            
            # Find relationships
            relationships = await self._find_relationships(context, entities)
            
            processed = ProcessedContext(
                original_context=context,
                extracted_entities=entities,
                keywords=keywords,
                code_blocks=code_blocks,
                relationships=relationships,
                summary=summary,
                importance_score=importance_score
            )
            
            logger.debug(f"🔵 Processed context with {len(entities)} entities, {len(relationships)} relationships")
            return processed
            
        except Exception as e:
            logger.error(f"🔵 Error processing context: {e}")
            # Return minimal processed context
            return ProcessedContext(
                original_context=context,
                extracted_entities=[],
                keywords=[],
                code_blocks=[],
                relationships=[],
                summary=context.content[:100] + "..." if len(context.content) > 100 else context.content,
                importance_score=0.5
            )
    
    async def build_context_graph(self, session_id: str) -> Dict[str, Any]:
        """
        Build a graph of context relationships for a session
        """
        try:
            # Get all contexts for session
            context_ids = self.memory_manager.session_index.get(session_id, [])
            
            if not context_ids:
                return {'nodes': [], 'edges': []}
            
            nodes = []
            edges = []
            
            # Process each context
            for context_id in context_ids:
                if context_id not in self.memory_manager.contexts:
                    continue
                
                context = self.memory_manager.contexts[context_id]
                processed = await self.process_context(context)
                
                # Add node
                node = {
                    'id': context_id,
                    'label': processed.summary,
                    'importance': processed.importance_score,
                    'timestamp': context.timestamp.isoformat(),
                    'entities': processed.extracted_entities,
                    'keywords': processed.keywords
                }
                nodes.append(node)
                
                # Add edges for relationships
                for relationship in processed.relationships:
                    if relationship.target_id in context_ids:
                        edge = {
                            'source': relationship.source_id,
                            'target': relationship.target_id,
                            'type': relationship.relationship_type,
                            'strength': relationship.strength
                        }
                        edges.append(edge)
            
            graph = {
                'nodes': nodes,
                'edges': edges,
                'session_id': session_id,
                'generated_at': datetime.now().isoformat()
            }
            
            logger.debug(f"🔵 Built context graph with {len(nodes)} nodes, {len(edges)} edges")
            return graph
            
        except Exception as e:
            logger.error(f"🔵 Error building context graph: {e}")
            return {'nodes': [], 'edges': []}
    
    async def find_context_clusters(self, session_id: str) -> List[Dict[str, Any]]:
        """
        Find clusters of related contexts within a session
        """
        try:
            # Get all contexts for session
            context_ids = self.memory_manager.session_index.get(session_id, [])
            
            if len(context_ids) < 2:
                return []
            
            # Calculate similarity matrix
            similarity_matrix = await self._calculate_similarity_matrix(context_ids)
            
            # Find clusters using simple threshold-based clustering
            clusters = await self._cluster_contexts(context_ids, similarity_matrix)
            
            # Enhance clusters with metadata
            enhanced_clusters = []
            for i, cluster in enumerate(clusters):
                if len(cluster) < 2:
                    continue
                
                cluster_info = {
                    'cluster_id': f"cluster_{i}",
                    'context_ids': cluster,
                    'size': len(cluster),
                    'common_entities': await self._find_common_entities(cluster),
                    'common_keywords': await self._find_common_keywords(cluster),
                    'time_span': await self._calculate_time_span(cluster),
                    'importance_score': await self._calculate_cluster_importance(cluster)
                }
                enhanced_clusters.append(cluster_info)
            
            # Sort by importance
            enhanced_clusters.sort(key=lambda x: x['importance_score'], reverse=True)
            
            logger.debug(f"🔵 Found {len(enhanced_clusters)} context clusters")
            return enhanced_clusters
            
        except Exception as e:
            logger.error(f"🔵 Error finding context clusters: {e}")
            return []
    
    async def _extract_entities(self, content: str) -> List[str]:
        """Extract entities from content using regex patterns"""
        try:
            entities = []
            
            for entity_type, pattern in self.entity_patterns.items():
                matches = re.findall(pattern, content, re.IGNORECASE | re.MULTILINE)
                for match in matches:
                    if isinstance(match, tuple):
                        match = match[0] if match else ""
                    if match and match not in entities:
                        entities.append(match.strip())
            
            return entities[:50]  # Limit to 50 entities
            
        except Exception as e:
            logger.error(f"🔵 Error extracting entities: {e}")
            return []
    
    async def _extract_keywords(self, content: str) -> List[str]:
        """Extract keywords from content"""
        try:
            # Simple keyword extraction
            words = re.findall(r'\b[a-zA-Z]{3,}\b', content.lower())
            
            # Filter common words
            stop_words = {
                'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'boy', 'did', 'she', 'use', 'way', 'will', 'with'
            }
            
            keywords = [word for word in words if word not in stop_words]
            
            # Count frequency and return top keywords
            word_freq = {}
            for word in keywords:
                word_freq[word] = word_freq.get(word, 0) + 1
            
            sorted_keywords = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
            return [word for word, freq in sorted_keywords[:20]]
            
        except Exception as e:
            logger.error(f"🔵 Error extracting keywords: {e}")
            return []
    
    async def _extract_code_blocks(self, content: str) -> List[str]:
        """Extract code blocks from content"""
        try:
            code_blocks = []
            
            for lang, pattern in self.code_patterns.items():
                matches = re.findall(pattern, content, re.DOTALL)
                for match in matches:
                    if match.strip():
                        code_blocks.append(match.strip())
            
            return code_blocks
            
        except Exception as e:
            logger.error(f"🔵 Error extracting code blocks: {e}")
            return []
    
    async def _generate_summary(self, content: str) -> str:
        """Generate a summary of the content"""
        try:
            # Simple extractive summary - take first sentence and key points
            sentences = re.split(r'[.!?]+', content)
            
            if not sentences:
                return content[:100] + "..." if len(content) > 100 else content
            
            # Take first sentence
            summary = sentences[0].strip()
            
            # Add key points if content is long
            if len(content) > 500:
                # Look for bullet points or numbered lists
                bullet_points = re.findall(r'[•\-\*]\s*(.+)', content)
                if bullet_points:
                    summary += " Key points: " + ", ".join(bullet_points[:3])
            
            # Limit summary length
            if len(summary) > 200:
                summary = summary[:197] + "..."
            
            return summary
            
        except Exception as e:
            logger.error(f"🔵 Error generating summary: {e}")
            return content[:100] + "..." if len(content) > 100 else content
    
    async def _calculate_importance(self, context: ContextData, 
                                  entities: List[str], keywords: List[str]) -> float:
        """Calculate importance score for context"""
        try:
            score = 0.5  # Base score
            
            # Boost for entities
            score += min(0.3, len(entities) * 0.02)
            
            # Boost for keywords
            score += min(0.2, len(keywords) * 0.01)
            
            # Boost for code blocks
            if any(pattern in context.content for pattern in ['```', 'def ', 'class ', 'function']):
                score += 0.2
            
            # Boost for errors/issues
            if any(pattern in context.content.lower() for pattern in ['error', 'exception', 'bug', 'issue']):
                score += 0.1
            
            # Boost for questions
            if '?' in context.content:
                score += 0.1
            
            # Boost for length (more content = potentially more important)
            if len(context.content) > 1000:
                score += 0.1
            
            return min(1.0, score)
            
        except Exception as e:
            logger.error(f"🔵 Error calculating importance: {e}")
            return 0.5
    
    async def _find_relationships(self, context: ContextData, 
                                entities: List[str]) -> List[ContextRelationship]:
        """Find relationships with other contexts"""
        try:
            relationships = []
            
            # Get contexts from same session
            session_contexts = self.memory_manager.session_index.get(context.session_id, [])
            
            for other_context_id in session_contexts:
                if other_context_id not in self.memory_manager.contexts:
                    continue
                
                other_context = self.memory_manager.contexts[other_context_id]
                
                # Skip self
                if other_context == context:
                    continue
                
                # Calculate relationship strength
                strength = await self._calculate_relationship_strength(
                    context, other_context, entities
                )
                
                if strength > 0.3:  # Threshold for meaningful relationship
                    relationship_type = await self._determine_relationship_type(
                        context, other_context
                    )
                    
                    relationship = ContextRelationship(
                        source_id=self.memory_manager._generate_context_id(context),
                        target_id=other_context_id,
                        relationship_type=relationship_type,
                        strength=strength,
                        metadata={'entities_overlap': len(set(entities))}
                    )
                    relationships.append(relationship)
            
            return relationships
            
        except Exception as e:
            logger.error(f"🔵 Error finding relationships: {e}")
            return []
    
    async def _calculate_relationship_strength(self, context1: ContextData, 
                                             context2: ContextData, 
                                             entities1: List[str]) -> float:
        """Calculate strength of relationship between two contexts"""
        try:
            # Extract entities from second context
            entities2 = await self._extract_entities(context2.content)
            
            # Calculate entity overlap
            common_entities = set(entities1) & set(entities2)
            entity_overlap = len(common_entities) / max(len(entities1), len(entities2), 1)
            
            # Calculate keyword overlap
            keywords1 = await self._extract_keywords(context1.content)
            keywords2 = await self._extract_keywords(context2.content)
            common_keywords = set(keywords1) & set(keywords2)
            keyword_overlap = len(common_keywords) / max(len(keywords1), len(keywords2), 1)
            
            # Time proximity (closer in time = stronger relationship)
            time_diff = abs((context1.timestamp - context2.timestamp).total_seconds())
            time_factor = max(0, 1 - (time_diff / 86400))  # Decay over 24 hours
            
            # Combine factors
            strength = (entity_overlap * 0.4 + keyword_overlap * 0.4 + time_factor * 0.2)
            
            return min(1.0, strength)
            
        except Exception as e:
            logger.error(f"🔵 Error calculating relationship strength: {e}")
            return 0.0
    
    async def _determine_relationship_type(self, context1: ContextData, 
                                         context2: ContextData) -> str:
        """Determine the type of relationship between contexts"""
        try:
            # Simple heuristics for relationship types
            if 'error' in context1.content.lower() and 'fix' in context2.content.lower():
                return 'problem_solution'
            elif 'question' in context1.content.lower() and 'answer' in context2.content.lower():
                return 'question_answer'
            elif any(word in context1.content.lower() for word in ['follow', 'continue', 'next']):
                return 'sequential'
            elif any(word in context1.content.lower() for word in ['similar', 'like', 'same']):
                return 'similar'
            else:
                return 'related'
                
        except Exception as e:
            logger.error(f"🔵 Error determining relationship type: {e}")
            return 'related'
    
    async def _calculate_similarity_matrix(self, context_ids: List[str]) -> List[List[float]]:
        """Calculate similarity matrix for contexts"""
        try:
            n = len(context_ids)
            matrix = [[0.0] * n for _ in range(n)]
            
            for i in range(n):
                for j in range(i + 1, n):
                    context1 = self.memory_manager.contexts.get(context_ids[i])
                    context2 = self.memory_manager.contexts.get(context_ids[j])
                    
                    if context1 and context2:
                        entities1 = await self._extract_entities(context1.content)
                        similarity = await self._calculate_relationship_strength(
                            context1, context2, entities1
                        )
                        matrix[i][j] = matrix[j][i] = similarity
            
            return matrix
            
        except Exception as e:
            logger.error(f"🔵 Error calculating similarity matrix: {e}")
            return []
    
    async def _cluster_contexts(self, context_ids: List[str], 
                              similarity_matrix: List[List[float]]) -> List[List[str]]:
        """Cluster contexts based on similarity"""
        try:
            if not similarity_matrix:
                return [[cid] for cid in context_ids]
            
            clusters = []
            used = set()
            threshold = 0.5
            
            for i, context_id in enumerate(context_ids):
                if context_id in used:
                    continue
                
                cluster = [context_id]
                used.add(context_id)
                
                # Find similar contexts
                for j, other_id in enumerate(context_ids):
                    if other_id in used or i == j:
                        continue
                    
                    if similarity_matrix[i][j] > threshold:
                        cluster.append(other_id)
                        used.add(other_id)
                
                clusters.append(cluster)
            
            return clusters
            
        except Exception as e:
            logger.error(f"🔵 Error clustering contexts: {e}")
            return [[cid] for cid in context_ids]
    
    async def _find_common_entities(self, context_ids: List[str]) -> List[str]:
        """Find common entities across contexts in a cluster"""
        try:
            entity_sets = []
            
            for context_id in context_ids:
                if context_id in self.memory_manager.contexts:
                    context = self.memory_manager.contexts[context_id]
                    entities = await self._extract_entities(context.content)
                    entity_sets.append(set(entities))
            
            if not entity_sets:
                return []
            
            # Find intersection of all entity sets
            common = entity_sets[0]
            for entity_set in entity_sets[1:]:
                common = common & entity_set
            
            return list(common)
            
        except Exception as e:
            logger.error(f"🔵 Error finding common entities: {e}")
            return []
    
    async def _find_common_keywords(self, context_ids: List[str]) -> List[str]:
        """Find common keywords across contexts in a cluster"""
        try:
            keyword_counts = {}
            total_contexts = len(context_ids)
            
            for context_id in context_ids:
                if context_id in self.memory_manager.contexts:
                    context = self.memory_manager.contexts[context_id]
                    keywords = await self._extract_keywords(context.content)
                    
                    for keyword in set(keywords):  # Use set to count each keyword once per context
                        keyword_counts[keyword] = keyword_counts.get(keyword, 0) + 1
            
            # Return keywords that appear in at least half the contexts
            threshold = max(1, total_contexts // 2)
            common_keywords = [
                keyword for keyword, count in keyword_counts.items()
                if count >= threshold
            ]
            
            return common_keywords
            
        except Exception as e:
            logger.error(f"🔵 Error finding common keywords: {e}")
            return []
    
    async def _calculate_time_span(self, context_ids: List[str]) -> Dict[str, Any]:
        """Calculate time span for a cluster of contexts"""
        try:
            timestamps = []
            
            for context_id in context_ids:
                if context_id in self.memory_manager.contexts:
                    context = self.memory_manager.contexts[context_id]
                    timestamps.append(context.timestamp)
            
            if not timestamps:
                return {}
            
            timestamps.sort()
            
            return {
                'start': timestamps[0].isoformat(),
                'end': timestamps[-1].isoformat(),
                'duration_hours': (timestamps[-1] - timestamps[0]).total_seconds() / 3600
            }
            
        except Exception as e:
            logger.error(f"🔵 Error calculating time span: {e}")
            return {}
    
    async def _calculate_cluster_importance(self, context_ids: List[str]) -> float:
        """Calculate importance score for a cluster"""
        try:
            total_importance = 0
            count = 0
            
            for context_id in context_ids:
                if context_id in self.memory_manager.contexts:
                    context = self.memory_manager.contexts[context_id]
                    entities = await self._extract_entities(context.content)
                    keywords = await self._extract_keywords(context.content)
                    importance = await self._calculate_importance(context, entities, keywords)
                    total_importance += importance
                    count += 1
            
            if count == 0:
                return 0.0
            
            # Average importance with cluster size bonus
            avg_importance = total_importance / count
            size_bonus = min(0.2, len(context_ids) * 0.05)
            
            return min(1.0, avg_importance + size_bonus)
            
        except Exception as e:
            logger.error(f"🔵 Error calculating cluster importance: {e}")
            return 0.0
    
    async def cleanup(self) -> None:
        """Cleanup resources"""
        self.relationship_cache.clear()
        logger.info("🔵 Perfect Recall Engine: Context Processor cleaned up")