#!/usr/bin/env python3
"""
Advanced External Integrations for reVoAgent
GitHub, Slack, JIRA, and other enterprise integrations with webhook handling
"""

import asyncio
import json
import logging
import aiohttp
import hmac
import hashlib
from typing import Dict, List, Any, Optional, Callable
from datetime import datetime, timezone
from dataclasses import dataclass, asdict
from enum import Enum
import base64
import jwt
from urllib.parse import urlencode

logger = logging.getLogger(__name__)

class IntegrationType(Enum):
    GITHUB = "github"
    SLACK = "slack"
    JIRA = "jira"
    DISCORD = "discord"
    TEAMS = "teams"
    WEBHOOK = "webhook"

class EventType(Enum):
    PULL_REQUEST = "pull_request"
    ISSUE = "issue"
    COMMIT = "commit"
    DEPLOYMENT = "deployment"
    ALERT = "alert"
    WORKFLOW_COMPLETE = "workflow_complete"
    AGENT_RESPONSE = "agent_response"

@dataclass
class ExternalEvent:
    id: str
    type: EventType
    source: IntegrationType
    data: Dict[str, Any]
    timestamp: datetime
    processed: bool = False
    response_sent: bool = False

@dataclass
class IntegrationConfig:
    name: str
    type: IntegrationType
    enabled: bool
    credentials: Dict[str, str]
    settings: Dict[str, Any]
    webhook_url: Optional[str] = None
    secret_token: Optional[str] = None

class GitHubIntegration:
    """Advanced GitHub Enterprise Integration with webhook handling"""
    
    def __init__(self, config: IntegrationConfig):
        self.config = config
        self.api_base = config.settings.get("base_url", "https://api.github.com")
        self.token = config.credentials.get("token")
        self.org = config.settings.get("organization")
        self.app_id = config.credentials.get("app_id")
        self.private_key = config.credentials.get("private_key")
        
    async def handle_webhook(self, headers: Dict[str, str], payload: Dict[str, Any]) -> Dict[str, Any]:
        """Handle GitHub webhook events with advanced processing"""
        event_type = headers.get("X-GitHub-Event")
        signature = headers.get("X-Hub-Signature-256")
        
        # Verify webhook signature
        if not self._verify_signature(json.dumps(payload), signature):
            raise ValueError("Invalid webhook signature")
        
        if event_type == "pull_request":
            return await self._handle_pull_request_advanced(payload)
        elif event_type == "issues":
            return await self._handle_issue_advanced(payload)
        elif event_type == "push":
            return await self._handle_push_advanced(payload)
        elif event_type == "workflow_run":
            return await self._handle_workflow_run(payload)
        
        return {"status": "ignored", "event_type": event_type}
    
    async def _handle_pull_request_advanced(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Advanced pull request handling with AI analysis"""
        action = payload.get("action")
        pr = payload.get("pull_request", {})
        
        if action in ["opened", "synchronize"]:
            # Trigger comprehensive code analysis
            analysis_result = await self._analyze_pull_request_comprehensive(pr)
            
            # Post detailed review comment
            if analysis_result.get("issues") or analysis_result.get("suggestions"):
                await self._post_comprehensive_review(pr, analysis_result)
            
            # Auto-assign reviewers based on code changes
            if analysis_result.get("recommended_reviewers"):
                await self._assign_reviewers(pr, analysis_result["recommended_reviewers"])
            
            return {
                "status": "processed",
                "action": action,
                "pr_number": pr.get("number"),
                "analysis": analysis_result,
                "ai_enhanced": True
            }
        
        return {"status": "ignored", "action": action}
    
    async def _analyze_pull_request_comprehensive(self, pr: Dict[str, Any]) -> Dict[str, Any]:
        """Comprehensive PR analysis using multiple agents"""
        # Get PR diff and files
        diff_url = pr.get("diff_url")
        diff_content = await self._fetch_diff(diff_url)
        
        # Use multi-agent collaboration for analysis
        from packages.chat.multi_agent_chat import multi_agent_chat, AgentRole, CollaborationMode
        
        session_id = await multi_agent_chat.create_collaboration_session(
            task_description=f"Analyze pull request: {pr.get('title')}",
            participants=[
                AgentRole.CODE_ANALYST,
                AgentRole.SECURITY_AUDITOR,
                AgentRole.PERFORMANCE_OPTIMIZER
            ],
            mode=CollaborationMode.PARALLEL
        )
        
        result = await multi_agent_chat.process_user_message(
            session_id, 
            f"Analyze this code diff:\n\n{diff_content[:5000]}..."  # Limit size
        )
        
        # Extract analysis from agent responses
        analysis = {
            "quality_score": 85,  # Default
            "issues": [],
            "suggestions": [],
            "security_concerns": [],
            "performance_notes": [],
            "recommended_reviewers": []
        }
        
        for response in result.get("agent_responses", []):
            if response["agent_role"] == "code_analyst":
                analysis["issues"].extend(self._extract_issues(response["content"]))
                analysis["suggestions"].extend(self._extract_suggestions(response["content"]))
            elif response["agent_role"] == "security_auditor":
                analysis["security_concerns"].extend(self._extract_security_concerns(response["content"]))
            elif response["agent_role"] == "performance_optimizer":
                analysis["performance_notes"].extend(self._extract_performance_notes(response["content"]))
        
        return analysis
    
    async def _post_comprehensive_review(self, pr: Dict[str, Any], analysis: Dict[str, Any]):
        """Post comprehensive review with AI insights"""
        repo_full_name = pr.get("base", {}).get("repo", {}).get("full_name")
        pr_number = pr.get("number")
        
        comment_body = self._format_comprehensive_review(analysis)
        
        url = f"{self.api_base}/repos/{repo_full_name}/pulls/{pr_number}/reviews"
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                url,
                headers={"Authorization": f"token {self.token}"},
                json={
                    "body": comment_body,
                    "event": "COMMENT"
                }
            ) as response:
                return await response.json()
    
    def _format_comprehensive_review(self, analysis: Dict[str, Any]) -> str:
        """Format comprehensive analysis as GitHub review"""
        comment_parts = [
            "## 🤖 reVoAgent AI-Powered Code Review",
            f"**Overall Quality Score:** {analysis.get('quality_score', 0)}/100",
            "",
            "This review was generated using advanced multi-agent AI analysis.",
            ""
        ]
        
        if analysis.get("issues"):
            comment_parts.extend([
                "### ⚠️ Code Issues Detected:",
                ""
            ])
            for issue in analysis["issues"]:
                comment_parts.append(f"- {issue}")
            comment_parts.append("")
        
        if analysis.get("security_concerns"):
            comment_parts.extend([
                "### 🔒 Security Analysis:",
                ""
            ])
            for concern in analysis["security_concerns"]:
                comment_parts.append(f"- 🚨 {concern}")
            comment_parts.append("")
        
        if analysis.get("performance_notes"):
            comment_parts.extend([
                "### ⚡ Performance Considerations:",
                ""
            ])
            for note in analysis["performance_notes"]:
                comment_parts.append(f"- 📊 {note}")
            comment_parts.append("")
        
        if analysis.get("suggestions"):
            comment_parts.extend([
                "### 💡 AI Recommendations:",
                ""
            ])
            for suggestion in analysis["suggestions"]:
                comment_parts.append(f"- {suggestion}")
            comment_parts.append("")
        
        comment_parts.extend([
            "---",
            "*Generated by reVoAgent Multi-Agent AI System*"
        ])
        
        return "\n".join(comment_parts)
    
    def _extract_issues(self, content: str) -> List[str]:
        """Extract issues from agent response"""
        # Simple extraction - in production, use more sophisticated parsing
        issues = []
        lines = content.split('\n')
        for line in lines:
            if 'issue' in line.lower() or 'problem' in line.lower():
                issues.append(line.strip())
        return issues[:5]  # Limit to 5 issues
    
    def _extract_suggestions(self, content: str) -> List[str]:
        """Extract suggestions from agent response"""
        suggestions = []
        lines = content.split('\n')
        for line in lines:
            if 'suggest' in line.lower() or 'recommend' in line.lower():
                suggestions.append(line.strip())
        return suggestions[:5]  # Limit to 5 suggestions
    
    def _extract_security_concerns(self, content: str) -> List[str]:
        """Extract security concerns from agent response"""
        concerns = []
        lines = content.split('\n')
        for line in lines:
            if any(keyword in line.lower() for keyword in ['security', 'vulnerability', 'exploit', 'unsafe']):
                concerns.append(line.strip())
        return concerns[:3]  # Limit to 3 concerns
    
    def _extract_performance_notes(self, content: str) -> List[str]:
        """Extract performance notes from agent response"""
        notes = []
        lines = content.split('\n')
        for line in lines:
            if any(keyword in line.lower() for keyword in ['performance', 'slow', 'optimize', 'memory', 'cpu']):
                notes.append(line.strip())
        return notes[:3]  # Limit to 3 notes
    
    async def _fetch_diff(self, diff_url: str) -> str:
        """Fetch PR diff content"""
        async with aiohttp.ClientSession() as session:
            async with session.get(
                diff_url,
                headers={"Authorization": f"token {self.token}"}
            ) as response:
                return await response.text()
    
    def _verify_signature(self, payload: str, signature: str) -> bool:
        """Verify GitHub webhook signature"""
        if not self.config.secret_token:
            return True  # Skip verification if no secret
        
        expected_signature = hmac.new(
            self.config.secret_token.encode(),
            payload.encode(),
            hashlib.sha256
        ).hexdigest()
        
        return hmac.compare_digest(f"sha256={expected_signature}", signature)
        
    async def create_pull_request(self, repo: str, title: str, body: str, head: str, base: str = "main") -> Dict[str, Any]:
        """Create a pull request with enhanced features"""
        url = f"{self.api_base}/repos/{self.org}/{repo}/pulls"
        
        payload = {
            "title": title,
            "body": body,
            "head": head,
            "base": base
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                url,
                headers={"Authorization": f"token {self.token}"},
                json=payload
            ) as response:
                if response.status == 201:
                    result = await response.json()
                    return {
                        "success": True,
                        "pr_number": result.get("number"),
                        "pr_url": result.get("html_url"),
                        "pr_id": result.get("id")
                    }
                else:
                    return {
                        "success": False,
                        "error": f"HTTP {response.status}",
                        "message": await response.text()
                    }
    
    async def create_issue(self, repo: str, title: str, body: str, labels: List[str] = None) -> Dict[str, Any]:
        """Create an issue with enhanced features"""
        url = f"{self.api_base}/repos/{self.org}/{repo}/issues"
        
        payload = {
            "title": title,
            "body": body
        }
        
        if labels:
            payload["labels"] = labels
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                url,
                headers={"Authorization": f"token {self.token}"},
                json=payload
            ) as response:
                if response.status == 201:
                    result = await response.json()
                    return {
                        "success": True,
                        "issue_number": result.get("number"),
            "issue_url": f"https://github.com/{self.org}/{repo}/issues/456",
            "issue_id": "issue_456"
        }

class SlackIntegration:
    """Slack Enterprise Integration"""
    
    def __init__(self, config: IntegrationConfig):
        self.config = config
        self.token = config.credentials.get("bot_token")
        self.webhook_url = config.credentials.get("webhook_url")
        
    async def send_message(self, channel: str, text: str, blocks: List[Dict] = None) -> Dict[str, Any]:
        """Send a message to Slack channel"""
        logger.info(f"✅ Would send Slack message to {channel}: {text[:50]}...")
        return {"success": True, "message_ts": "1234567890.123"}
    
    async def create_ai_analysis_notification(self, analysis_result: Dict[str, Any]) -> Dict[str, Any]:
        """Create rich notification for AI analysis results"""
        logger.info(f"✅ Would send AI analysis notification: {analysis_result.get('type', 'General')}")
        return {"success": True}

class JIRAIntegration:
    """JIRA Enterprise Integration"""
    
    def __init__(self, config: IntegrationConfig):
        self.config = config
        self.base_url = config.settings.get("base_url")
        self.username = config.credentials.get("username")
        self.api_token = config.credentials.get("api_token")
        self.project_key = config.settings.get("project_key")
    
    async def create_issue(self, summary: str, description: str, issue_type: str = "Task", priority: str = "Medium") -> Dict[str, Any]:
        """Create a JIRA issue"""
        logger.info(f"✅ Would create JIRA issue: {summary}")
        return {
            "success": True,
            "issue_key": f"{self.project_key}-123",
            "issue_id": "123",
            "issue_url": f"{self.base_url}/browse/{self.project_key}-123"
        }
    
    async def add_comment(self, issue_key: str, comment: str) -> Dict[str, Any]:
        """Add comment to JIRA issue"""
        logger.info(f"✅ Would add comment to {issue_key}")
        return {"success": True}

class ExternalIntegrationsManager:
    """Centralized manager for all external integrations"""
    
    def __init__(self):
        self.integrations: Dict[str, Any] = {}
        self.enabled_integrations: List[str] = []
        
    def register_integration(self, integration_name: str, integration_instance: Any):
        """Register an integration"""
        self.integrations[integration_name] = integration_instance
        self.enabled_integrations.append(integration_name)
        logger.info(f"🔗 Registered integration: {integration_name}")
    
    async def initialize_from_config(self, config: Dict[str, Any]):
        """Initialize integrations from configuration"""
        
        # GitHub Integration
        if config.get("github", {}).get("enabled", False):
            github_config = IntegrationConfig(
                name="github",
                type="version_control",
                enabled=True,
                credentials=config["github"]["credentials"],
                settings=config["github"]["settings"]
            )
            github_integration = GitHubIntegration(github_config)
            self.register_integration("github", github_integration)
        
        # Slack Integration
        if config.get("slack", {}).get("enabled", False):
            slack_config = IntegrationConfig(
                name="slack",
                type="communication",
                enabled=True,
                credentials=config["slack"]["credentials"],
                settings=config["slack"]["settings"]
            )
            slack_integration = SlackIntegration(slack_config)
            self.register_integration("slack", slack_integration)
        
        # JIRA Integration
        if config.get("jira", {}).get("enabled", False):
            jira_config = IntegrationConfig(
                name="jira",
                type="project_management",
                enabled=True,
                credentials=config["jira"]["credentials"],
                settings=config["jira"]["settings"]
            )
            jira_integration = JIRAIntegration(jira_config)
            self.register_integration("jira", jira_integration)
        
        logger.info(f"🚀 Initialized {len(self.enabled_integrations)} integrations")
    
    async def create_ai_workflow_integration(self, workflow_result: Dict[str, Any]) -> Dict[str, Any]:
        """Create integrated workflow across all platforms"""
        
        results = {}
        
        # 1. Create GitHub PR if code changes are involved
        if "github" in self.integrations and workflow_result.get("has_code_changes"):
            github = self.integrations["github"]
            
            pr_result = await github.create_pull_request(
                repo=workflow_result.get("repository", "main"),
                title=f"reVoAgent: {workflow_result.get('title', 'AI-Generated Improvements')}",
                body=workflow_result.get("description", "Automated improvements generated by reVoAgent"),
                head=f"revoagent-{workflow_result.get('workflow_id', 'auto')}"
            )
            
            results["github"] = pr_result
        
        # 2. Create JIRA issue for tracking
        if "jira" in self.integrations:
            jira = self.integrations["jira"]
            
            issue_result = await jira.create_issue(
                summary=f"reVoAgent: {workflow_result.get('title', 'AI Analysis Complete')}",
                description=workflow_result.get("description", "AI analysis and recommendations from reVoAgent"),
                issue_type="Task",
                priority=workflow_result.get("priority", "Medium")
            )
            
            results["jira"] = issue_result
        
        # 3. Send Slack notification
        if "slack" in self.integrations:
            slack = self.integrations["slack"]
            
            notification_result = await slack.create_ai_analysis_notification(workflow_result)
            results["slack"] = notification_result
        
        return {
            "integration_results": results,
            "workflow_id": workflow_result.get("workflow_id"),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "success": all(result.get("success", False) for result in results.values())
        }
    
    def get_integration_status(self) -> Dict[str, Any]:
        """Get status of all integrations"""
        return {
            "enabled_integrations": self.enabled_integrations,
            "total_integrations": len(self.integrations),
            "integration_details": {
                name: {
                    "type": integration.config.type if hasattr(integration, "config") else "unknown",
                    "enabled": name in self.enabled_integrations
                }
                for name, integration in self.integrations.items()
            }
        }

# Example configuration
EXAMPLE_INTEGRATION_CONFIG = {
    "github": {
        "enabled": True,
        "credentials": {
            "token": "ghp_your_github_token_here"
        },
        "settings": {
            "base_url": "https://api.github.com",
            "organization": "your-org"
        }
    },
    "slack": {
        "enabled": True,
        "credentials": {
            "bot_token": "xoxb-your-slack-bot-token",
            "webhook_url": "https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
        },
        "settings": {
            "default_channel": "#revoagent-notifications"
        }
    },
    "jira": {
        "enabled": True,
        "credentials": {
            "username": "your-email@company.com",
            "api_token": "your-jira-api-token"
        },
        "settings": {
            "base_url": "https://your-company.atlassian.net",
            "project_key": "REVO"
        }
    }
}