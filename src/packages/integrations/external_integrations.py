#!/usr/bin/env python3
"""
External Integrations for reVoAgent
GitHub, Slack, JIRA, and other enterprise integrations
"""

import asyncio
import json
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timezone
from dataclasses import dataclass
import base64

logger = logging.getLogger(__name__)

@dataclass
class IntegrationConfig:
    name: str
    type: str
    enabled: bool
    credentials: Dict[str, str]
    settings: Dict[str, Any]

class GitHubIntegration:
    """GitHub Enterprise Integration"""
    
    def __init__(self, config: IntegrationConfig):
        self.config = config
        self.base_url = config.settings.get("base_url", "https://api.github.com")
        self.token = config.credentials.get("token")
        self.org = config.settings.get("organization")
        
    async def create_pull_request(self, repo: str, title: str, body: str, head: str, base: str = "main") -> Dict[str, Any]:
        """Create a pull request"""
        # Mock implementation for now
        logger.info(f"✅ Would create PR: {title} in {repo}")
        return {
            "success": True,
            "pr_number": 123,
            "pr_url": f"https://github.com/{self.org}/{repo}/pull/123",
            "pr_id": "pr_123"
        }
    
    async def create_issue(self, repo: str, title: str, body: str, labels: List[str] = None) -> Dict[str, Any]:
        """Create an issue"""
        logger.info(f"✅ Would create issue: {title} in {repo}")
        return {
            "success": True,
            "issue_number": 456,
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