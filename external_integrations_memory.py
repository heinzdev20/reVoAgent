# /packages/integrations/enhanced_github_integration.py
"""
Enhanced GitHub integration with persistent code pattern memory
Extends existing GitHub integration with Cognee memory capabilities
"""

import json
import asyncio
from typing import Dict, Any, List, Optional
from datetime import datetime
import logging
from github import Github
import cognee

from packages.ai.cognee_model_manager import CogneeModelManager, MemoryEnabledRequest
from packages.agents.memory_enabled_agent import CodeAnalystAgent, DebugDetectiveAgent

logger = logging.getLogger(__name__)

class GitHubMemoryIntegration:
    """Enhanced GitHub integration with code pattern memory"""
    
    def __init__(
        self, 
        github_token: str, 
        memory_manager: CogneeModelManager,
        config: Dict[str, Any] = None
    ):
        self.github = Github(github_token)
        self.memory_manager = memory_manager
        self.config = config or {}
        
        # Initialize agents
        self.code_agent = CodeAnalystAgent(
            agent_id="github_code_analyst",
            model_manager=memory_manager
        )
        
        self.debug_agent = DebugDetectiveAgent(
            agent_id="github_debug_detective", 
            model_manager=memory_manager
        )
    
    async def analyze_repository_with_memory(
        self, 
        repo_owner: str, 
        repo_name: str,
        branch: str = "main"
    ) -> Dict[str, Any]:
        """Comprehensive repository analysis with memory persistence"""
        
        try:
            logger.info(f"🔍 Analyzing repository {repo_owner}/{repo_name} with memory...")
            
            repo = self.github.get_repo(f"{repo_owner}/{repo_name}")
            
            # Get repository structure
            repo_structure = await self._get_repository_structure(repo, branch)
            
            # Analyze code files with memory
            analysis_results = []
            code_patterns = []
            
            for file_info in repo_structure["code_files"]:
                file_analysis = await self._analyze_file_with_memory(
                    repo, file_info, repo_owner, repo_name
                )
                
                analysis_results.append(file_analysis)
                code_patterns.extend(file_analysis.get("patterns", []))
            
            # Store repository-level memory
            await self._store_repository_memory(
                repo_owner, repo_name, analysis_results, code_patterns
            )
            
            # Generate repository insights
            repo_insights = await self._generate_repository_insights(
                repo_owner, repo_name, analysis_results
            )
            
            return {
                "repository": f"{repo_owner}/{repo_name}",
                "branch": branch,
                "analysis_summary": {
                    "files_analyzed": len(analysis_results),
                    "patterns_detected": len(code_patterns),
                    "issues_found": sum(len(r.get("issues", [])) for r in analysis_results),
                    "suggestions_count": sum(len(r.get("suggestions", [])) for r in analysis_results)
                },
                "insights": repo_insights,
                "memory_updated": True,
                "cost": 0.0,  # Local models = $0.00
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Repository analysis failed: {e}")
            raise

    async def _analyze_file_with_memory(
        self, 
        repo, 
        file_info: Dict[str, Any], 
        repo_owner: str, 
        repo_name: str
    ) -> Dict[str, Any]:
        """Analyze individual file with memory context"""
        
        try:
            # Get file content
            file_content = repo.get_contents(file_info["path"])
            content = file_content.decoded_content.decode('utf-8')
            
            # Check for similar code patterns in memory
            similar_patterns = await self._get_similar_code_patterns(
                content, file_info["language"]
            )
            
            # Analyze with code agent
            analysis_request = f"""
            Analyze this {file_info['language']} file: {file_info['path']}
            Repository: {repo_owner}/{repo_name}
            
            Code:
            {content}
            
            Similar patterns found in memory:
            {json.dumps(similar_patterns[:3], indent=2)}
            
            Provide:
            1. Code quality assessment
            2. Security analysis
            3. Performance considerations
            4. Detected patterns
            5. Improvement suggestions
            6. Comparison with similar code in memory
            """
            
            response = await self.code_agent.process_request(
                analysis_request,
                context={
                    "file_path": file_info["path"],
                    "repository": f"{repo_owner}/{repo_name}",
                    "language": file_info["language"],
                    "similar_patterns": similar_patterns
                }
            )
            
            # Extract structured analysis
            analysis = self._extract_structured_analysis(response["response"])
            
            # Store file-specific memory
            await self._store_file_memory(
                repo_owner, repo_name, file_info["path"], content, analysis
            )
            
            return {
                "file_path": file_info["path"],
                "language": file_info["language"],
                "analysis": analysis,
                "patterns": analysis.get("patterns", []),
                "issues": analysis.get("issues", []),
                "suggestions": analysis.get("suggestions", []),
                "security_score": analysis.get("security_score", 0),
                "quality_score": analysis.get("quality_score", 0),
                "similar_patterns_used": len(similar_patterns)
            }
            
        except Exception as e:
            logger.warning(f"File analysis failed for {file_info['path']}: {e}")
            return {
                "file_path": file_info["path"],
                "error": str(e),
                "analysis": {},
                "patterns": [],
                "issues": [],
                "suggestions": []
            }

    async def create_memory_enhanced_pr(
        self,
        repo_owner: str,
        repo_name: str,
        pr_data: Dict[str, Any],
        auto_enhance: bool = True
    ) -> Dict[str, Any]:
        """Create PR with memory-based code insights and suggestions"""
        
        try:
            repo = self.github.get_repo(f"{repo_owner}/{repo_name}")
            
            # Get repository memory context
            repo_context = await self._get_repository_memory_context(repo_owner, repo_name)
            
            # Analyze PR changes with memory
            if "head" in pr_data and "base" in pr_data:
                change_analysis = await self._analyze_pr_changes_with_memory(
                    repo, pr_data["head"], pr_data["base"], repo_context
                )
            else:
                change_analysis = {}
            
            # Enhance PR description with memory insights
            enhanced_description = pr_data.get("body", "")
            if auto_enhance and repo_context:
                enhanced_description = await self._enhance_pr_description(
                    enhanced_description, repo_context, change_analysis
                )
            
            # Create the pull request
            pr = repo.create_pull(
                title=pr_data["title"],
                body=enhanced_description,
                head=pr_data["head"],
                base=pr_data["base"]
            )
            
            # Store PR context in memory
            await self._store_pr_memory(repo_owner, repo_name, pr, change_analysis)
            
            # Add memory-based comments if configured
            if self.config.get("auto_comment", False) and change_analysis:
                await self._add_memory_based_comments(pr, change_analysis)
            
            return {
                "pr_number": pr.number,
                "pr_url": pr.html_url,
                "title": pr.title,
                "enhanced_description": enhanced_description,
                "change_analysis": change_analysis,
                "memory_insights_used": len(repo_context.get("insights", [])),
                "cost": 0.0,
                "created_at": pr.created_at.isoformat()
            }
            
        except Exception as e:
            logger.error(f"Memory-enhanced PR creation failed: {e}")
            raise

    async def monitor_repository_activity(
        self,
        repo_owner: str,
        repo_name: str,
        monitor_config: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Monitor repository activity and update memory"""
        
        config = monitor_config or {}
        
        try:
            repo = self.github.get_repo(f"{repo_owner}/{repo_name}")
            
            # Monitor different types of activity
            activities = {
                "commits": [],
                "pull_requests": [],
                "issues": [],
                "releases": []
            }
            
            # Get recent commits
            if config.get("monitor_commits", True):
                commits = repo.get_commits()[:config.get("commit_limit", 10)]
                for commit in commits:
                    commit_analysis = await self._analyze_commit_with_memory(
                        repo_owner, repo_name, commit
                    )
                    activities["commits"].append(commit_analysis)
            
            # Get recent PRs
            if config.get("monitor_prs", True):
                prs = repo.get_pulls(state="all")[:config.get("pr_limit", 5)]
                for pr in prs:
                    pr_analysis = await self._analyze_pr_with_memory(
                        repo_owner, repo_name, pr
                    )
                    activities["pull_requests"].append(pr_analysis)
            
            # Get recent issues
            if config.get("monitor_issues", True):
                issues = repo.get_issues(state="all")[:config.get("issue_limit", 10)]
                for issue in issues:
                    issue_analysis = await self._analyze_issue_with_memory(
                        repo_owner, repo_name, issue
                    )
                    activities["issues"].append(issue_analysis)
            
            # Update repository activity memory
            await self._update_repository_activity_memory(
                repo_owner, repo_name, activities
            )
            
            return {
                "repository": f"{repo_owner}/{repo_name}",
                "monitoring_period": datetime.now().isoformat(),
                "activities": activities,
                "memory_updated": True,
                "insights": await self._generate_activity_insights(activities)
            }
            
        except Exception as e:
            logger.error(f"Repository monitoring failed: {e}")
            raise

    async def _get_similar_code_patterns(
        self, 
        code_content: str, 
        language: str
    ) -> List[Dict[str, Any]]:
        """Find similar code patterns in memory"""
        
        try:
            # Search for similar code patterns
            search_query = f"code patterns {language} similar to: {code_content[:200]}"
            
            results = await cognee.search(
                query_text=search_query,
                query_type="insights"
            )
            
            # Filter and format results
            patterns = []
            for result in results[:5]:
                if isinstance(result, dict):
                    patterns.append({
                        "pattern_type": result.get("pattern_type", "unknown"),
                        "description": result.get("description", ""),
                        "language": result.get("language", language),
                        "confidence": result.get("confidence", 0.0),
                        "repository": result.get("repository", ""),
                        "usage_count": result.get("usage_count", 1)
                    })
            
            return patterns
            
        except Exception as e:
            logger.warning(f"Failed to get similar code patterns: {e}")
            return []

    async def _store_repository_memory(
        self,
        repo_owner: str,
        repo_name: str,
        analysis_results: List[Dict[str, Any]],
        code_patterns: List[str]
    ):
        """Store comprehensive repository memory"""
        
        try:
            # Create repository memory entry
            repo_memory = {
                "repository": f"{repo_owner}/{repo_name}",
                "analysis_timestamp": datetime.now().isoformat(),
                "total_files": len(analysis_results),
                "languages": list(set(r.get("language", "") for r in analysis_results)),
                "patterns": code_patterns,
                "quality_scores": [r.get("quality_score", 0) for r in analysis_results],
                "security_scores": [r.get("security_score", 0) for r in analysis_results],
                "total_issues": sum(len(r.get("issues", [])) for r in analysis_results),
                "total_suggestions": sum(len(r.get("suggestions", [])) for r in analysis_results),
                "analysis_results": analysis_results
            }
            
            # Store in cognee
            await cognee.add(
                data=json.dumps(repo_memory),
                dataset_name=f"github_repository_{repo_owner}_{repo_name}"
            )
            
            # Update knowledge graph
            await cognee.cognify()
            
            logger.info(f"Stored repository memory for {repo_owner}/{repo_name}")
            
        except Exception as e:
            logger.warning(f"Failed to store repository memory: {e}")

    def _extract_structured_analysis(self, analysis_text: str) -> Dict[str, Any]:
        """Extract structured data from analysis text"""
        
        # This is a simplified extraction - in practice, you'd want more sophisticated parsing
        analysis = {
            "patterns": [],
            "issues": [],
            "suggestions": [],
            "security_score": 7,  # Default scores
            "quality_score": 7
        }
        
        # Extract patterns (look for pattern indicators)
        lines = analysis_text.split('\n')
        current_section = None
        
        for line in lines:
            line = line.strip()
            
            if 'pattern' in line.lower():
                if line not in analysis["patterns"]:
                    analysis["patterns"].append(line)
            elif 'issue' in line.lower() or 'problem' in line.lower():
                if line not in analysis["issues"]:
                    analysis["issues"].append(line)
            elif 'suggest' in line.lower() or 'recommend' in line.lower():
                if line not in analysis["suggestions"]:
                    analysis["suggestions"].append(line)
        
        return analysis

# /packages/integrations/enhanced_slack_integration.py
"""
Enhanced Slack integration with conversation memory
Maintains conversation context and learns from interactions
"""

import json
import asyncio
from typing import Dict, Any, List, Optional
from datetime import datetime
import logging
from slack_sdk.web.async_client import AsyncWebClient
from slack_sdk.errors import SlackApiError
import cognee

from packages.ai.cognee_model_manager import CogneeModelManager, MemoryEnabledRequest

logger = logging.getLogger(__name__)

class SlackMemoryIntegration:
    """Enhanced Slack integration with conversation memory"""
    
    def __init__(
        self, 
        slack_token: str, 
        memory_manager: CogneeModelManager,
        config: Dict[str, Any] = None
    ):
        self.slack = AsyncWebClient(token=slack_token)
        self.memory_manager = memory_manager
        self.config = config or {}
        
        # Bot mention handlers
        self.mention_handlers = {
            "code": self._handle_code_request,
            "debug": self._handle_debug_request,
            "workflow": self._handle_workflow_request,
            "analyze": self._handle_analysis_request,
            "help": self._handle_help_request
        }
    
    async def handle_bot_mention_with_memory(
        self,
        event: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Handle Slack bot mentions with conversation memory"""
        
        try:
            channel_id = event.get("channel")
            user_id = event.get("user")
            text = event.get("text", "")
            thread_ts = event.get("thread_ts", event.get("ts"))
            
            # Get conversation memory context
            conversation_context = await self._get_conversation_memory(
                channel_id, user_id, thread_ts
            )
            
            # Determine intent and appropriate handler
            intent = self._determine_intent(text)
            handler = self.mention_handlers.get(intent, self._handle_general_request)
            
            # Process with memory context
            response_data = await handler(
                text, channel_id, user_id, conversation_context
            )
            
            # Send response to Slack
            response = await self.slack.chat_postMessage(
                channel=channel_id,
                text=response_data["text"],
                thread_ts=thread_ts,
                blocks=response_data.get("blocks"),
                attachments=response_data.get("attachments")
            )
            
            # Update conversation memory
            await self._update_conversation_memory(
                channel_id, user_id, thread_ts, text, response_data["text"]
            )
            
            return {
                "status": "success",
                "channel": channel_id,
                "response_ts": response["ts"],
                "memory_updated": True,
                "intent": intent,
                "cost": response_data.get("cost", 0.0)
            }
            
        except SlackApiError as e:
            logger.error(f"Slack API error: {e}")
            raise
        except Exception as e:
            logger.error(f"Slack mention handling failed: {e}")
            raise

    async def _handle_code_request(
        self,
        text: str,
        channel_id: str,
        user_id: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Handle code-related requests with memory"""
        
        # Create memory-enabled request
        memory_request = MemoryEnabledRequest(
            prompt=f"""
            User request: {text}
            Channel: {channel_id}
            
            Previous conversation context:
            {json.dumps(context.get("recent_messages", []), indent=2)}
            
            Provide code assistance based on the request and conversation history.
            """,
            agent_id="code_analyst",
            memory_tags=["slack", "code", f"channel_{channel_id}"],
            include_memory_context=True,
            persist_response=True,
            session_id=f"slack_{channel_id}_{user_id}"
        )
        
        response = await self.memory_manager.generate_with_memory(memory_request)
        
        # Format for Slack
        formatted_response = self._format_code_response(response.content)
        
        return {
            "text": formatted_response["text"],
            "blocks": formatted_response.get("blocks"),
            "cost": response.cost
        }

    async def _handle_debug_request(
        self,
        text: str,
        channel_id: str,
        user_id: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Handle debugging requests with solution memory"""
        
        memory_request = MemoryEnabledRequest(
            prompt=f"""
            Debug request: {text}
            Channel: {channel_id}
            
            Previous debugging context:
            {json.dumps(context.get("debug_history", []), indent=2)}
            
            Provide debugging assistance based on the error and previous solutions.
            """,
            agent_id="debug_detective",
            memory_tags=["slack", "debug", f"channel_{channel_id}"],
            include_memory_context=True,
            persist_response=True,
            session_id=f"slack_{channel_id}_{user_id}"
        )
        
        response = await self.memory_manager.generate_with_memory(memory_request)
        
        formatted_response = self._format_debug_response(response.content)
        
        return {
            "text": formatted_response["text"],
            "blocks": formatted_response.get("blocks"),
            "cost": response.cost
        }

    async def provide_channel_insights(
        self,
        channel_id: str,
        time_range: str = "week"
    ) -> Dict[str, Any]:
        """Provide insights based on channel conversation memory"""
        
        try:
            # Query channel memory for insights
            insights_query = f"channel:{channel_id} conversations insights {time_range}"
            
            results = await cognee.search(
                query_text=insights_query,
                query_type="insights"
            )
            
            # Analyze conversation patterns
            patterns = await self._analyze_conversation_patterns(channel_id, results)
            
            # Generate insights summary
            insights_summary = await self._generate_channel_insights_summary(
                channel_id, patterns, results
            )
            
            return {
                "channel_id": channel_id,
                "time_range": time_range,
                "insights": insights_summary,
                "conversation_patterns": patterns,
                "total_interactions": len(results),
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Channel insights generation failed: {e}")
            raise

    async def _get_conversation_memory(
        self,
        channel_id: str,
        user_id: str,
        thread_ts: Optional[str] = None
    ) -> Dict[str, Any]:
        """Get conversation memory context"""
        
        try:
            # Build search query for conversation context
            context_query = f"channel:{channel_id}"
            if user_id:
                context_query += f" user:{user_id}"
            if thread_ts:
                context_query += f" thread:{thread_ts}"
            
            # Search for conversation history
            results = await cognee.search(
                query_text=context_query,
                query_type="insights"
            )
            
            # Process results
            recent_messages = []
            debug_history = []
            code_history = []
            
            for result in results[-10:]:  # Last 10 relevant items
                if isinstance(result, dict):
                    if "debug" in result.get("tags", []):
                        debug_history.append(result)
                    elif "code" in result.get("tags", []):
                        code_history.append(result)
                    else:
                        recent_messages.append(result)
            
            return {
                "recent_messages": recent_messages,
                "debug_history": debug_history,
                "code_history": code_history,
                "context_retrieved_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.warning(f"Failed to get conversation memory: {e}")
            return {}

    def _determine_intent(self, text: str) -> str:
        """Determine user intent from message text"""
        
        text_lower = text.lower()
        
        if any(word in text_lower for word in ["code", "function", "class", "implement"]):
            return "code"
        elif any(word in text_lower for word in ["debug", "error", "bug", "fix", "issue"]):
            return "debug"
        elif any(word in text_lower for word in ["workflow", "process", "automate"]):
            return "workflow"
        elif any(word in text_lower for word in ["analyze", "review", "check"]):
            return "analyze"
        elif any(word in text_lower for word in ["help", "how", "what", "explain"]):
            return "help"
        else:
            return "general"

    def _format_code_response(self, response: str) -> Dict[str, Any]:
        """Format code response for Slack"""
        
        # Extract code blocks
        lines = response.split('\n')
        code_blocks = []
        text_parts = []
        in_code = False
        current_code = []
        
        for line in lines:
            if line.strip().startswith('```'):
                if in_code:
                    code_blocks.append('\n'.join(current_code))
                    current_code = []
                    in_code = False
                else:
                    in_code = True
            elif in_code:
                current_code.append(line)
            else:
                text_parts.append(line)
        
        # Build Slack blocks
        blocks = []
        
        if text_parts:
            blocks.append({
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": '\n'.join(text_parts)
                }
            })
        
        for code_block in code_blocks:
            blocks.append({
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"```\n{code_block}\n```"
                }
            })
        
        return {
            "text": response,
            "blocks": blocks if blocks else None
        }

# /packages/integrations/enhanced_jira_integration.py
"""
Enhanced JIRA integration with ticket pattern memory
Learns from ticket patterns and provides intelligent suggestions
"""

import json
import asyncio
from typing import Dict, Any, List, Optional
from datetime import datetime
import logging
from jira import JIRA
import cognee

from packages.ai.cognee_model_manager import CogneeModelManager, MemoryEnabledRequest

logger = logging.getLogger(__name__)

class JIRAMemoryIntegration:
    """Enhanced JIRA integration with ticket pattern memory"""
    
    def __init__(
        self,
        jira_url: str,
        jira_token: str,
        memory_manager: CogneeModelManager,
        config: Dict[str, Any] = None
    ):
        self.jira = JIRA(server=jira_url, token_auth=jira_token)
        self.memory_manager = memory_manager
        self.config = config or {}
    
    async def create_issue_with_memory_enhancement(
        self,
        project_key: str,
        issue_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Create JIRA issue with memory-based enhancements"""
        
        try:
            # Get similar issues from memory
            similar_issues = await self._get_similar_issues(
                issue_data.get("summary", ""),
                issue_data.get("description", ""),
                project_key
            )
            
            # Enhance issue with memory insights
            enhanced_issue = await self._enhance_issue_with_memory(
                issue_data, similar_issues, project_key
            )
            
            # Create the issue
            new_issue = self.jira.create_issue(fields=enhanced_issue)
            
            # Store issue in memory
            await self._store_issue_memory(new_issue, enhanced_issue, similar_issues)
            
            # Add memory-based comments if similar issues found
            if similar_issues and self.config.get("auto_add_insights", True):
                await self._add_memory_insights_comment(new_issue, similar_issues)
            
            return {
                "issue_key": new_issue.key,
                "issue_url": f"{self.jira._options['server']}/browse/{new_issue.key}",
                "enhanced_fields": enhanced_issue,
                "similar_issues_found": len(similar_issues),
                "memory_insights_added": len(similar_issues) > 0,
                "cost": 0.0
            }
            
        except Exception as e:
            logger.error(f"Memory-enhanced issue creation failed: {e}")
            raise

    async def analyze_project_patterns(
        self,
        project_key: str,
        analysis_config: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Analyze project issues for patterns and insights"""
        
        config = analysis_config or {}
        
        try:
            # Get project issues from JIRA
            jql_query = f"project = {project_key} ORDER BY created DESC"
            issues = self.jira.search_issues(
                jql_query, 
                maxResults=config.get("max_issues", 100)
            )
            
            # Query project memory for patterns
            memory_patterns = await self._query_project_memory_patterns(project_key)
            
            # Analyze issue patterns
            pattern_analysis = await self._analyze_issue_patterns(
                issues, memory_patterns, project_key
            )
            
            # Generate recommendations
            recommendations = await self._generate_project_recommendations(
                pattern_analysis, project_key
            )
            
            # Update project memory with new insights
            await self._update_project_pattern_memory(
                project_key, pattern_analysis, recommendations
            )
            
            return {
                "project_key": project_key,
                "analysis_timestamp": datetime.now().isoformat(),
                "issues_analyzed": len(issues),
                "patterns": pattern_analysis,
                "recommendations": recommendations,
                "memory_updated": True,
                "cost": 0.0
            }
            
        except Exception as e:
            logger.error(f"Project pattern analysis failed: {e}")
            raise

    async def monitor_issue_updates_with_memory(
        self,
        project_key: str,
        monitor_config: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Monitor issue updates and learn from resolution patterns"""
        
        config = monitor_config or {}
        
        try:
            # Get recently updated issues
            jql_query = f"project = {project_key} AND updated >= -{config.get('time_window', '1d')} ORDER BY updated DESC"
            updated_issues = self.jira.search_issues(jql_query)
            
            # Analyze updates with memory context
            update_analyses = []
            
            for issue in updated_issues:
                analysis = await self._analyze_issue_update_with_memory(
                    issue, project_key
                )
                update_analyses.append(analysis)
            
            # Learn from resolution patterns
            resolution_patterns = await self._learn_from_resolutions(
                update_analyses, project_key
            )
            
            # Update memory with new learnings
            await self._update_resolution_pattern_memory(
                project_key, resolution_patterns
            )
            
            return {
                "project_key": project_key,
                "monitoring_period": config.get('time_window', '1d'),
                "issues_monitored": len(updated_issues),
                "updates_analyzed": len(update_analyses),
                "resolution_patterns": resolution_patterns,
                "memory_updated": True
            }
            
        except Exception as e:
            logger.error(f"Issue monitoring failed: {e}")
            raise

    async def _get_similar_issues(
        self,
        summary: str,
        description: str,
        project_key: str
    ) -> List[Dict[str, Any]]:
        """Find similar issues using memory search"""
        
        try:
            # Create search query
            search_text = f"project:{project_key} summary:{summary} description:{description}"
            
            # Search memory for similar issues
            results = await cognee.search(
                query_text=search_text,
                query_type="insights"
            )
            
            # Filter and format results
            similar_issues = []
            for result in results[:5]:
                if isinstance(result, dict) and result.get("issue_key"):
                    similar_issues.append({
                        "issue_key": result.get("issue_key"),
                        "summary": result.get("summary", ""),
                        "status": result.get("status", ""),
                        "resolution": result.get("resolution", ""),
                        "similarity_score": result.get("confidence", 0.0),
                        "resolution_time": result.get("resolution_time", ""),
                        "labels": result.get("labels", [])
                    })
            
            return similar_issues
            
        except Exception as e:
            logger.warning(f"Failed to get similar issues: {e}")
            return []

    async def _enhance_issue_with_memory(
        self,
        issue_data: Dict[str, Any],
        similar_issues: List[Dict[str, Any]],
        project_key: str
    ) -> Dict[str, Any]:
        """Enhance issue with memory-based insights"""
        
        enhanced = issue_data.copy()
        
        try:
            if similar_issues:
                # Enhance description with similar issue insights
                memory_request = MemoryEnabledRequest(
                    prompt=f"""
                    Enhance this JIRA issue with insights from similar issues:
                    
                    Original Issue:
                    Summary: {issue_data.get('summary', '')}
                    Description: {issue_data.get('description', '')}
                    
                    Similar Issues Found:
                    {json.dumps(similar_issues, indent=2)}
                    
                    Provide:
                    1. Enhanced description with relevant context
                    2. Suggested labels based on similar issues
                    3. Estimated priority based on patterns
                    4. Potential resolution approaches
                    """,
                    agent_id="jira_enhancer",
                    memory_tags=["jira", "enhancement", project_key],
                    include_memory_context=True,
                    persist_response=True
                )
                
                response = await self.memory_manager.generate_with_memory(memory_request)
                
                # Parse enhancement suggestions
                enhancements = self._parse_enhancement_suggestions(response.content)
                
                # Apply enhancements
                if enhancements.get("enhanced_description"):
                    enhanced["description"] = enhancements["enhanced_description"]
                
                if enhancements.get("suggested_labels"):
                    enhanced["labels"] = enhanced.get("labels", []) + enhancements["suggested_labels"]
                
                if enhancements.get("estimated_priority"):
                    enhanced["priority"] = {"name": enhancements["estimated_priority"]}
            
            return enhanced
            
        except Exception as e:
            logger.warning(f"Issue enhancement failed: {e}")
            return enhanced

    def _parse_enhancement_suggestions(self, enhancement_text: str) -> Dict[str, Any]:
        """Parse enhancement suggestions from AI response"""
        
        # Simplified parsing - in practice, you'd want more sophisticated extraction
        enhancements = {}
        
        lines = enhancement_text.split('\n')
        current_section = None
        
        for line in lines:
            line = line.strip()
            
            if 'enhanced description' in line.lower():
                current_section = 'description'
            elif 'suggested labels' in line.lower():
                current_section = 'labels'
            elif 'estimated priority' in line.lower():
                current_section = 'priority'
            elif current_section and line:
                if current_section == 'description':
                    enhancements["enhanced_description"] = enhancements.get("enhanced_description", "") + line + "\n"
                elif current_section == 'labels':
                    # Extract labels (assuming comma-separated)
                    if ',' in line:
                        enhancements["suggested_labels"] = [l.strip() for l in line.split(',')]
                elif current_section == 'priority':
                    enhancements["estimated_priority"] = line
        
        return enhancements
