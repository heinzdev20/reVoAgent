#!/usr/bin/env python3
"""
reVo Chat Multi-Agent Integration
Advanced conversational AI with multi-agent collaboration
"""

import asyncio
import json
import logging
from typing import Dict, List, Any, Optional, AsyncGenerator
from datetime import datetime, timezone
from dataclasses import dataclass, asdict
from enum import Enum
import uuid

# Import our enhanced components
try:
    from packages.ai.enhanced_model_manager import EnhancedModelManager
except ImportError:
    # Fallback for testing
    class EnhancedModelManager:
        def generate_response(self, prompt):
            return {"content": f"Mock response for: {prompt[:50]}...", "provider": "mock"}

logger = logging.getLogger(__name__)

class ChatMessageType(Enum):
    USER = "user"
    AGENT = "agent"
    SYSTEM = "system"
    COLLABORATION = "collaboration"

class AgentRole(Enum):
    CODE_ANALYST = "code_analyst"
    DEBUG_DETECTIVE = "debug_detective"
    WORKFLOW_MANAGER = "workflow_manager"
    COORDINATOR = "coordinator"

@dataclass
class ChatMessage:
    id: str
    type: ChatMessageType
    content: str
    agent_role: Optional[AgentRole] = None
    metadata: Dict[str, Any] = None
    timestamp: datetime = None
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now(timezone.utc)
        if self.metadata is None:
            self.metadata = {}

@dataclass
class AgentCollaborationContext:
    session_id: str
    active_agents: List[AgentRole]
    shared_context: Dict[str, Any]
    collaboration_history: List[Dict[str, Any]]
    current_task: Optional[str] = None

class MultiAgentChatOrchestrator:
    """Advanced multi-agent chat orchestrator with intelligent collaboration"""
    
    def __init__(self):
        self.model_manager = EnhancedModelManager()
        
        # Initialize mock agents for now
        self.code_agent = self._create_mock_agent("code_analyst")
        self.debug_agent = self._create_mock_agent("debug_detective")
        self.workflow_engine = self._create_mock_agent("workflow_manager")
        
        self.active_sessions: Dict[str, AgentCollaborationContext] = {}
        self.agent_capabilities = self._initialize_agent_capabilities()
        self.collaboration_patterns = self._initialize_collaboration_patterns()
        
        logger.info("🤖 Multi-Agent Chat Orchestrator initialized")
    
    def _create_mock_agent(self, agent_type: str):
        """Create mock agent for testing"""
        class MockAgent:
            def __init__(self, agent_type):
                self.agent_type = agent_type
            
            async def analyze_code_advanced(self, code_content, analysis_type="comprehensive", context=None):
                return {
                    "summary": f"Code analysis completed by {self.agent_type}",
                    "insights": [f"Insight 1 from {self.agent_type}", f"Insight 2 from {self.agent_type}"],
                    "recommendations": [f"Recommendation 1 from {self.agent_type}"],
                    "confidence": 0.85,
                    "metrics": {"complexity": "medium", "quality": "good"},
                    "issues": []
                }
            
            async def investigate_issue_advanced(self, issue_description, context=None, investigation_depth="comprehensive"):
                return {
                    "summary": f"Debug investigation completed by {self.agent_type}",
                    "findings": [f"Finding 1 from {self.agent_type}", f"Finding 2 from {self.agent_type}"],
                    "solutions": [f"Solution 1 from {self.agent_type}"],
                    "confidence": 0.8,
                    "root_causes": ["Root cause identified"],
                    "severity": "medium"
                }
            
            async def create_workflow(self, name, description):
                return f"workflow_{uuid.uuid4().hex[:8]}"
        
        return MockAgent(agent_type)
    
    def _initialize_agent_capabilities(self) -> Dict[AgentRole, Dict[str, Any]]:
        """Initialize agent capabilities and specializations"""
        return {
            AgentRole.CODE_ANALYST: {
                "specializations": [
                    "code_review", "architecture_analysis", "performance_optimization",
                    "security_analysis", "best_practices", "refactoring"
                ],
                "triggers": [
                    "analyze", "review", "optimize", "refactor", "architecture",
                    "performance", "security", "code quality"
                ],
                "confidence_threshold": 0.8
            },
            AgentRole.DEBUG_DETECTIVE: {
                "specializations": [
                    "bug_detection", "error_analysis", "debugging_strategies",
                    "root_cause_analysis", "testing_recommendations", "fix_suggestions"
                ],
                "triggers": [
                    "debug", "error", "bug", "issue", "problem", "fix",
                    "troubleshoot", "investigate"
                ],
                "confidence_threshold": 0.85
            },
            AgentRole.WORKFLOW_MANAGER: {
                "specializations": [
                    "process_automation", "workflow_design", "task_orchestration",
                    "pipeline_optimization", "deployment_strategies", "ci_cd"
                ],
                "triggers": [
                    "workflow", "automate", "process", "pipeline", "deploy",
                    "orchestrate", "schedule", "integrate"
                ],
                "confidence_threshold": 0.75
            },
            AgentRole.COORDINATOR: {
                "specializations": [
                    "task_coordination", "agent_collaboration", "context_management",
                    "decision_making", "conflict_resolution", "priority_management"
                ],
                "triggers": [
                    "coordinate", "manage", "prioritize", "decide", "resolve",
                    "organize", "plan", "strategy"
                ],
                "confidence_threshold": 0.7
            }
        }
    
    def _initialize_collaboration_patterns(self) -> Dict[str, Dict[str, Any]]:
        """Initialize collaboration patterns for different scenarios"""
        return {
            "code_review_collaboration": {
                "agents": [AgentRole.CODE_ANALYST, AgentRole.DEBUG_DETECTIVE],
                "sequence": "parallel",
                "merge_strategy": "comprehensive",
                "confidence_boost": 0.1
            },
            "debugging_collaboration": {
                "agents": [AgentRole.DEBUG_DETECTIVE, AgentRole.CODE_ANALYST],
                "sequence": "sequential",
                "merge_strategy": "prioritized",
                "confidence_boost": 0.15
            },
            "workflow_optimization": {
                "agents": [AgentRole.WORKFLOW_MANAGER, AgentRole.CODE_ANALYST],
                "sequence": "iterative",
                "merge_strategy": "integrated",
                "confidence_boost": 0.12
            },
            "comprehensive_analysis": {
                "agents": [AgentRole.CODE_ANALYST, AgentRole.DEBUG_DETECTIVE, AgentRole.WORKFLOW_MANAGER],
                "sequence": "parallel_then_merge",
                "merge_strategy": "holistic",
                "confidence_boost": 0.2
            }
        }
    
    async def start_chat_session(self, user_id: str, initial_message: str) -> str:
        """Start a new multi-agent chat session"""
        session_id = str(uuid.uuid4())
        
        # Analyze initial message to determine required agents
        required_agents = await self._analyze_required_agents(initial_message)
        
        # Create collaboration context
        context = AgentCollaborationContext(
            session_id=session_id,
            active_agents=required_agents,
            shared_context={
                "user_id": user_id,
                "session_start": datetime.now(timezone.utc).isoformat(),
                "conversation_history": [],
                "agent_insights": {},
                "collaboration_state": "active"
            },
            collaboration_history=[]
        )
        
        self.active_sessions[session_id] = context
        
        # Process initial message
        response = await self._process_message(session_id, initial_message, ChatMessageType.USER)
        
        logger.info(f"🎯 Chat session started: {session_id} with agents: {[agent.value for agent in required_agents]}")
        return session_id
    
    async def process_chat_message(self, session_id: str, message: str) -> Dict[str, Any]:
        """Process a chat message with multi-agent collaboration"""
        if session_id not in self.active_sessions:
            raise ValueError(f"Session {session_id} not found")
        
        response = await self._process_message(session_id, message, ChatMessageType.USER)
        return response
    
    async def _process_message(self, session_id: str, message: str, message_type: ChatMessageType) -> Dict[str, Any]:
        """Process message with intelligent agent collaboration"""
        context = self.active_sessions[session_id]
        
        # Create message object
        chat_message = ChatMessage(
            id=str(uuid.uuid4()),
            type=message_type,
            content=message
        )
        
        # Add to conversation history
        context.shared_context["conversation_history"].append(asdict(chat_message))
        
        # Determine collaboration strategy
        collaboration_strategy = await self._determine_collaboration_strategy(message, context)
        
        # Execute multi-agent collaboration
        agent_responses = await self._execute_collaboration(
            session_id, message, collaboration_strategy
        )
        
        # Merge and synthesize responses
        final_response = await self._synthesize_responses(agent_responses, collaboration_strategy)
        
        # Update context with insights
        await self._update_collaboration_context(session_id, agent_responses, final_response)
        
        return {
            "session_id": session_id,
            "response": final_response,
            "agent_contributions": agent_responses,
            "collaboration_strategy": collaboration_strategy,
            "confidence_score": final_response.get("confidence", 0.8),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    
    async def _analyze_required_agents(self, message: str) -> List[AgentRole]:
        """Analyze message to determine which agents should be involved"""
        required_agents = []
        message_lower = message.lower()
        
        # Check each agent's triggers
        for agent_role, capabilities in self.agent_capabilities.items():
            trigger_matches = sum(1 for trigger in capabilities["triggers"] if trigger in message_lower)
            
            if trigger_matches > 0:
                confidence = min(trigger_matches / len(capabilities["triggers"]), 1.0)
                if confidence >= capabilities["confidence_threshold"]:
                    required_agents.append(agent_role)
        
        # Always include coordinator for multi-agent scenarios
        if len(required_agents) > 1 and AgentRole.COORDINATOR not in required_agents:
            required_agents.append(AgentRole.COORDINATOR)
        
        # Default to code analyst if no specific triggers
        if not required_agents:
            required_agents.append(AgentRole.CODE_ANALYST)
        
        return required_agents
    
    async def _determine_collaboration_strategy(self, message: str, context: AgentCollaborationContext) -> Dict[str, Any]:
        """Determine the best collaboration strategy for the current message"""
        
        # Analyze message complexity and type
        message_analysis = await self._analyze_message_complexity(message)
        
        # Check for matching collaboration patterns
        for pattern_name, pattern_config in self.collaboration_patterns.items():
            if self._matches_collaboration_pattern(message_analysis, pattern_config, context.active_agents):
                return {
                    "pattern": pattern_name,
                    "config": pattern_config,
                    "agents": [agent for agent in pattern_config["agents"] if agent in context.active_agents],
                    "execution_mode": pattern_config["sequence"],
                    "merge_strategy": pattern_config["merge_strategy"]
                }
        
        # Default strategy
        return {
            "pattern": "default",
            "config": {"sequence": "parallel", "merge_strategy": "simple"},
            "agents": context.active_agents,
            "execution_mode": "parallel",
            "merge_strategy": "simple"
        }
    
    async def _execute_collaboration(self, session_id: str, message: str, strategy: Dict[str, Any]) -> Dict[AgentRole, Dict[str, Any]]:
        """Execute multi-agent collaboration based on strategy"""
        context = self.active_sessions[session_id]
        agent_responses = {}
        
        if strategy["execution_mode"] == "parallel":
            # Execute all agents in parallel
            tasks = []
            for agent_role in strategy["agents"]:
                task = self._execute_agent(agent_role, message, context)
                tasks.append((agent_role, task))
            
            # Wait for all agents to complete
            for agent_role, task in tasks:
                try:
                    response = await task
                    agent_responses[agent_role] = response
                except Exception as e:
                    logger.error(f"Agent {agent_role.value} failed: {e}")
                    agent_responses[agent_role] = {
                        "error": str(e),
                        "confidence": 0.0,
                        "content": f"Agent {agent_role.value} encountered an error"
                    }
        
        elif strategy["execution_mode"] == "sequential":
            # Execute agents sequentially, passing context between them
            accumulated_context = context.shared_context.copy()
            
            for agent_role in strategy["agents"]:
                try:
                    response = await self._execute_agent(agent_role, message, context, accumulated_context)
                    agent_responses[agent_role] = response
                    
                    # Update accumulated context for next agent
                    accumulated_context[f"{agent_role.value}_insights"] = response
                    
                except Exception as e:
                    logger.error(f"Agent {agent_role.value} failed: {e}")
                    agent_responses[agent_role] = {
                        "error": str(e),
                        "confidence": 0.0,
                        "content": f"Agent {agent_role.value} encountered an error"
                    }
        
        return agent_responses
    
    async def _execute_agent(self, agent_role: AgentRole, message: str, context: AgentCollaborationContext, additional_context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Execute a specific agent with the given message and context"""
        
        # Prepare agent context
        agent_context = {
            "message": message,
            "session_context": context.shared_context,
            "conversation_history": context.shared_context.get("conversation_history", []),
            "collaboration_context": additional_context or {}
        }
        
        try:
            if agent_role == AgentRole.CODE_ANALYST:
                return await self._execute_code_analyst(agent_context)
            elif agent_role == AgentRole.DEBUG_DETECTIVE:
                return await self._execute_debug_detective(agent_context)
            elif agent_role == AgentRole.WORKFLOW_MANAGER:
                return await self._execute_workflow_manager(agent_context)
            elif agent_role == AgentRole.COORDINATOR:
                return await self._execute_coordinator(agent_context)
            else:
                raise ValueError(f"Unknown agent role: {agent_role}")
                
        except Exception as e:
            logger.error(f"Error executing agent {agent_role.value}: {e}")
            return {
                "error": str(e),
                "confidence": 0.0,
                "content": f"Agent {agent_role.value} encountered an error: {str(e)}"
            }
    
    async def _execute_code_analyst(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute code analysis agent"""
        message = context["message"]
        
        # Use the enhanced code analysis agent
        analysis_result = await self.code_agent.analyze_code_advanced(
            code_content=message,
            analysis_type="comprehensive",
            context=context.get("collaboration_context", {})
        )
        
        return {
            "agent": "code_analyst",
            "content": analysis_result.get("summary", "Code analysis completed"),
            "insights": analysis_result.get("insights", []),
            "recommendations": analysis_result.get("recommendations", []),
            "confidence": analysis_result.get("confidence", 0.8),
            "metadata": {
                "analysis_type": "comprehensive",
                "metrics": analysis_result.get("metrics", {}),
                "issues_found": len(analysis_result.get("issues", []))
            }
        }
    
    async def _execute_debug_detective(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute debug detective agent"""
        message = context["message"]
        
        # Use the enhanced debug detective agent
        debug_result = await self.debug_agent.investigate_issue_advanced(
            issue_description=message,
            context=context.get("collaboration_context", {}),
            investigation_depth="comprehensive"
        )
        
        return {
            "agent": "debug_detective",
            "content": debug_result.get("summary", "Debug investigation completed"),
            "findings": debug_result.get("findings", []),
            "solutions": debug_result.get("solutions", []),
            "confidence": debug_result.get("confidence", 0.85),
            "metadata": {
                "investigation_type": "comprehensive",
                "root_causes": debug_result.get("root_causes", []),
                "severity": debug_result.get("severity", "medium")
            }
        }
    
    async def _execute_workflow_manager(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute workflow manager agent"""
        message = context["message"]
        
        # Create a workflow for the request
        workflow_id = await self.workflow_engine.create_workflow(
            name=f"Chat Workflow - {datetime.now().strftime('%Y%m%d_%H%M%S')}",
            description=f"Workflow generated from chat message: {message[:100]}..."
        )
        
        # Analyze workflow requirements
        workflow_analysis = {
            "workflow_id": workflow_id,
            "recommended_steps": [
                "Input validation",
                "Processing logic",
                "Output generation",
                "Quality assurance"
            ],
            "automation_opportunities": [
                "Automated testing",
                "Continuous integration",
                "Deployment pipeline"
            ]
        }
        
        return {
            "agent": "workflow_manager",
            "content": f"Workflow analysis completed for: {message[:50]}...",
            "workflow_id": workflow_id,
            "recommendations": workflow_analysis["recommended_steps"],
            "automation_opportunities": workflow_analysis["automation_opportunities"],
            "confidence": 0.75,
            "metadata": {
                "workflow_type": "chat_generated",
                "complexity": "medium",
                "estimated_duration": "30 minutes"
            }
        }
    
    async def _execute_coordinator(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute coordinator agent"""
        message = context["message"]
        collaboration_context = context.get("collaboration_context", {})
        
        # Analyze other agents' results if available
        parallel_results = collaboration_context.get("parallel_results", {})
        
        coordination_summary = {
            "task_priority": "high" if any(keyword in message.lower() for keyword in ["urgent", "critical", "important"]) else "medium",
            "complexity_assessment": "high" if len(parallel_results) > 2 else "medium",
            "coordination_strategy": "collaborative" if parallel_results else "direct",
            "next_steps": []
        }
        
        # Generate coordination recommendations
        if parallel_results:
            coordination_summary["next_steps"] = [
                "Review all agent recommendations",
                "Prioritize based on impact and effort",
                "Create implementation plan",
                "Monitor progress and adjust"
            ]
        else:
            coordination_summary["next_steps"] = [
                "Analyze requirements",
                "Determine best approach",
                "Execute solution",
                "Validate results"
            ]
        
        return {
            "agent": "coordinator",
            "content": f"Coordination analysis for: {message[:50]}...",
            "coordination_summary": coordination_summary,
            "recommendations": coordination_summary["next_steps"],
            "confidence": 0.7,
            "metadata": {
                "coordination_type": "multi_agent" if parallel_results else "single_agent",
                "agents_coordinated": len(parallel_results),
                "priority": coordination_summary["task_priority"]
            }
        }
    
    async def _synthesize_responses(self, agent_responses: Dict[AgentRole, Dict[str, Any]], strategy: Dict[str, Any]) -> Dict[str, Any]:
        """Synthesize multiple agent responses into a coherent final response"""
        
        if not agent_responses:
            return {
                "content": "No agent responses available",
                "confidence": 0.0,
                "synthesis_type": "empty"
            }
        
        merge_strategy = strategy.get("merge_strategy", "simple")
        
        if merge_strategy == "simple":
            return await self._simple_merge(agent_responses)
        elif merge_strategy == "comprehensive":
            return await self._comprehensive_merge(agent_responses)
        elif merge_strategy == "prioritized":
            return await self._prioritized_merge(agent_responses)
        elif merge_strategy == "integrated":
            return await self._integrated_merge(agent_responses)
        elif merge_strategy == "holistic":
            return await self._holistic_merge(agent_responses)
        else:
            return await self._simple_merge(agent_responses)
    
    async def _simple_merge(self, agent_responses: Dict[AgentRole, Dict[str, Any]]) -> Dict[str, Any]:
        """Simple merge strategy - concatenate responses"""
        content_parts = []
        total_confidence = 0
        agent_count = 0
        
        for agent_role, response in agent_responses.items():
            if "error" not in response:
                content_parts.append(f"**{agent_role.value.replace('_', ' ').title()}**: {response.get('content', '')}")
                total_confidence += response.get('confidence', 0)
                agent_count += 1
        
        avg_confidence = total_confidence / max(agent_count, 1)
        
        return {
            "content": "\n\n".join(content_parts),
            "confidence": avg_confidence,
            "synthesis_type": "simple",
            "agent_count": agent_count
        }
    
    async def _comprehensive_merge(self, agent_responses: Dict[AgentRole, Dict[str, Any]]) -> Dict[str, Any]:
        """Comprehensive merge with detailed analysis"""
        
        # Organize responses by type
        insights = []
        recommendations = []
        findings = []
        
        total_confidence = 0
        agent_count = 0
        
        for agent_role, response in agent_responses.items():
            if "error" not in response:
                agent_count += 1
                total_confidence += response.get('confidence', 0)
                
                # Collect insights
                if 'insights' in response:
                    insights.extend(response['insights'])
                
                # Collect recommendations
                if 'recommendations' in response:
                    recommendations.extend(response['recommendations'])
                
                # Collect findings
                if 'findings' in response:
                    findings.extend(response['findings'])
        
        # Generate comprehensive summary
        summary_parts = []
        
        if insights:
            summary_parts.append(f"**Key Insights** ({len(insights)} found):\n" + 
                               "\n".join(f"• {insight}" for insight in insights[:5]))
        
        if recommendations:
            summary_parts.append(f"**Recommendations** ({len(recommendations)} total):\n" + 
                               "\n".join(f"• {rec}" for rec in recommendations[:5]))
        
        if findings:
            summary_parts.append(f"**Findings** ({len(findings)} identified):\n" + 
                               "\n".join(f"• {finding}" for finding in findings[:5]))
        
        return {
            "content": "\n\n".join(summary_parts),
            "confidence": total_confidence / max(agent_count, 1),
            "synthesis_type": "comprehensive",
            "agent_count": agent_count,
            "insights": insights,
            "recommendations": recommendations,
            "findings": findings
        }
    
    async def _prioritized_merge(self, agent_responses: Dict[AgentRole, Dict[str, Any]]) -> Dict[str, Any]:
        """Prioritized merge based on confidence and relevance"""
        
        # Sort responses by confidence
        sorted_responses = sorted(
            agent_responses.items(),
            key=lambda x: x[1].get('confidence', 0),
            reverse=True
        )
        
        primary_response = sorted_responses[0][1] if sorted_responses else {}
        secondary_responses = sorted_responses[1:] if len(sorted_responses) > 1 else []
        
        content_parts = [f"**Primary Analysis**: {primary_response.get('content', '')}"]
        
        if secondary_responses:
            content_parts.append("**Additional Insights**:")
            for agent_role, response in secondary_responses:
                if "error" not in response:
                    content_parts.append(f"• {agent_role.value.replace('_', ' ').title()}: {response.get('content', '')[:100]}...")
        
        return {
            "content": "\n\n".join(content_parts),
            "confidence": primary_response.get('confidence', 0),
            "synthesis_type": "prioritized",
            "primary_agent": sorted_responses[0][0].value if sorted_responses else "none",
            "agent_count": len(sorted_responses)
        }
    
    async def _integrated_merge(self, agent_responses: Dict[AgentRole, Dict[str, Any]]) -> Dict[str, Any]:
        """Integrated merge that combines complementary insights"""
        
        # Use AI model to generate integrated response
        context_for_ai = {
            "agent_responses": {
                agent_role.value: response for agent_role, response in agent_responses.items()
                if "error" not in response
            },
            "task": "synthesize_agent_responses"
        }
        
        # Generate integrated response using AI model
        ai_response = self.model_manager.generate_response(
            f"Synthesize the following agent responses into a coherent, integrated analysis:\n\n{json.dumps(context_for_ai, indent=2)}"
        )
        
        avg_confidence = sum(
            response.get('confidence', 0) for response in agent_responses.values()
            if "error" not in response
        ) / max(len(agent_responses), 1)
        
        return {
            "content": ai_response.get('content', 'Integration synthesis completed'),
            "confidence": min(avg_confidence + 0.1, 1.0),  # Boost for integration
            "synthesis_type": "integrated",
            "agent_count": len(agent_responses),
            "ai_synthesized": True
        }
    
    async def _holistic_merge(self, agent_responses: Dict[AgentRole, Dict[str, Any]]) -> Dict[str, Any]:
        """Holistic merge that creates a comprehensive view"""
        
        # Create holistic analysis
        analysis_sections = {
            "executive_summary": [],
            "technical_analysis": [],
            "recommendations": [],
            "next_steps": []
        }
        
        total_confidence = 0
        agent_count = 0
        
        for agent_role, response in agent_responses.items():
            if "error" not in response:
                agent_count += 1
                total_confidence += response.get('confidence', 0)
                
                # Categorize content
                content = response.get('content', '')
                
                if agent_role == AgentRole.COORDINATOR:
                    analysis_sections["executive_summary"].append(content)
                elif agent_role in [AgentRole.CODE_ANALYST, AgentRole.DEBUG_DETECTIVE]:
                    analysis_sections["technical_analysis"].append(f"{agent_role.value.replace('_', ' ').title()}: {content}")
                
                # Add recommendations
                if 'recommendations' in response:
                    analysis_sections["recommendations"].extend(response['recommendations'])
        
        # Generate next steps
        analysis_sections["next_steps"] = [
            "Review technical analysis findings",
            "Prioritize recommendations by impact",
            "Create implementation timeline",
            "Monitor progress and iterate"
        ]
        
        # Build holistic response
        holistic_content = []
        
        if analysis_sections["executive_summary"]:
            holistic_content.append("## Executive Summary\n" + "\n".join(analysis_sections["executive_summary"]))
        
        if analysis_sections["technical_analysis"]:
            holistic_content.append("## Technical Analysis\n" + "\n".join(analysis_sections["technical_analysis"]))
        
        if analysis_sections["recommendations"]:
            holistic_content.append("## Recommendations\n" + "\n".join(f"• {rec}" for rec in analysis_sections["recommendations"][:10]))
        
        if analysis_sections["next_steps"]:
            holistic_content.append("## Next Steps\n" + "\n".join(f"{i+1}. {step}" for i, step in enumerate(analysis_sections["next_steps"])))
        
        return {
            "content": "\n\n".join(holistic_content),
            "confidence": (total_confidence / max(agent_count, 1)) + 0.15,  # Boost for holistic analysis
            "synthesis_type": "holistic",
            "agent_count": agent_count,
            "sections": analysis_sections
        }
    
    async def _analyze_message_complexity(self, message: str) -> Dict[str, Any]:
        """Analyze message complexity to determine collaboration needs"""
        
        complexity_indicators = {
            "length": len(message),
            "technical_terms": sum(1 for term in ["function", "class", "method", "variable", "algorithm", "database", "api"] if term in message.lower()),
            "question_marks": message.count("?"),
            "code_blocks": message.count("```"),
            "multiple_topics": len([topic for topic in ["debug", "optimize", "review", "deploy", "test"] if topic in message.lower()])
        }
        
        # Calculate complexity score
        complexity_score = (
            min(complexity_indicators["length"] / 500, 1.0) * 0.2 +
            min(complexity_indicators["technical_terms"] / 5, 1.0) * 0.3 +
            min(complexity_indicators["question_marks"] / 3, 1.0) * 0.2 +
            min(complexity_indicators["code_blocks"] / 2, 1.0) * 0.2 +
            min(complexity_indicators["multiple_topics"] / 3, 1.0) * 0.1
        )
        
        return {
            "complexity_score": complexity_score,
            "indicators": complexity_indicators,
            "complexity_level": "high" if complexity_score > 0.7 else "medium" if complexity_score > 0.4 else "low"
        }
    
    def _matches_collaboration_pattern(self, message_analysis: Dict[str, Any], pattern_config: Dict[str, Any], active_agents: List[AgentRole]) -> bool:
        """Check if message matches a collaboration pattern"""
        
        # Check if required agents are available
        required_agents = set(pattern_config["agents"])
        available_agents = set(active_agents)
        
        if not required_agents.issubset(available_agents):
            return False
        
        # Check complexity requirements
        complexity_level = message_analysis.get("complexity_level", "low")
        
        if pattern_config.get("min_complexity", "low") == "high" and complexity_level != "high":
            return False
        
        return True
    
    async def _update_collaboration_context(self, session_id: str, agent_responses: Dict[AgentRole, Dict[str, Any]], final_response: Dict[str, Any]):
        """Update collaboration context with new insights"""
        
        context = self.active_sessions[session_id]
        
        # Update agent insights
        for agent_role, response in agent_responses.items():
            if "error" not in response:
                context.shared_context["agent_insights"][agent_role.value] = {
                    "last_response": response,
                    "confidence": response.get('confidence', 0),
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }
        
        # Add to collaboration history
        context.collaboration_history.append({
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "agent_responses": {agent_role.value: response for agent_role, response in agent_responses.items()},
            "final_response": final_response,
            "collaboration_quality": final_response.get('confidence', 0)
        })
        
        # Update session statistics
        context.shared_context["total_interactions"] = context.shared_context.get("total_interactions", 0) + 1
        context.shared_context["average_confidence"] = sum(
            entry["collaboration_quality"] for entry in context.collaboration_history
        ) / len(context.collaboration_history)
    
    async def get_session_summary(self, session_id: str) -> Dict[str, Any]:
        """Get comprehensive session summary"""
        
        if session_id not in self.active_sessions:
            raise ValueError(f"Session {session_id} not found")
        
        context = self.active_sessions[session_id]
        
        return {
            "session_id": session_id,
            "duration": (datetime.now(timezone.utc) - datetime.fromisoformat(context.shared_context["session_start"].replace('Z', '+00:00'))).total_seconds(),
            "total_interactions": context.shared_context.get("total_interactions", 0),
            "active_agents": [agent.value for agent in context.active_agents],
            "average_confidence": context.shared_context.get("average_confidence", 0),
            "collaboration_history_length": len(context.collaboration_history),
            "agent_insights": context.shared_context.get("agent_insights", {}),
            "session_status": context.shared_context.get("collaboration_state", "active")
        }
    
    async def end_session(self, session_id: str) -> Dict[str, Any]:
        """End chat session and return summary"""
        
        if session_id not in self.active_sessions:
            raise ValueError(f"Session {session_id} not found")
        
        # Get final summary
        summary = await self.get_session_summary(session_id)
        
        # Mark session as ended
        self.active_sessions[session_id].shared_context["collaboration_state"] = "ended"
        self.active_sessions[session_id].shared_context["session_end"] = datetime.now(timezone.utc).isoformat()
        
        # Archive session (in production, save to database)
        archived_session = self.active_sessions.pop(session_id)
        
        logger.info(f"🏁 Chat session ended: {session_id}")
        
        return {
            "session_summary": summary,
            "final_status": "completed",
            "archived": True
        }

# Example usage and testing
async def main():
    """Test the multi-agent chat system"""
    
    orchestrator = MultiAgentChatOrchestrator()
    
    # Start a chat session
    session_id = await orchestrator.start_chat_session(
        user_id="test_user",
        initial_message="I have a Python function that's running slowly and I think there might be a bug. Can you help me analyze and optimize it?"
    )
    
    print(f"Session started: {session_id}")
    
    # Process additional messages
    response1 = await orchestrator.process_chat_message(
        session_id,
        "Here's the code: def slow_function(data): for i in range(len(data)): for j in range(len(data)): if data[i] == data[j] and i != j: return True"
    )
    
    print("Response 1:", response1["response"]["content"][:200] + "...")
    
    # Get session summary
    summary = await orchestrator.get_session_summary(session_id)
    print("Session summary:", summary)
    
    # End session
    final_summary = await orchestrator.end_session(session_id)
    print("Final summary:", final_summary["session_summary"])

if __name__ == "__main__":
    asyncio.run(main())