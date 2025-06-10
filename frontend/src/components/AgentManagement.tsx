/**
 * 🤖 Agent Management - Professional Agent Control Center
 * Real-time monitoring and control of all AI agents
 */

import React, { useEffect, useState } from 'react';
import { 
  Bot, 
  Play, 
  Square, 
  Settings, 
  Activity, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Zap,
  Code2,
  Bug,
  TestTube,
  Rocket,
  Globe,
  Shield,
  MoreVertical,
  TrendingUp,
  Users,
  FileText
} from 'lucide-react';
import { 
  useAgentStore, 
  useAgentStatus, 
  useAgentError, 
  useIsAgentExecuting,
  useAgentMetrics,
  useAgentTaskHistory
} from '../stores/agentStore';
import { AGENT_TYPES, type AgentType } from '../services/api';
import { cn } from '../utils/cn';

interface AgentCardProps {
  agentType: AgentType;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

function AgentCard({ agentType, name, description, icon, color }: AgentCardProps) {
  const status = useAgentStatus(agentType);
  const error = useAgentError(agentType);
  const isExecuting = useIsAgentExecuting(agentType);
  const metrics = useAgentMetrics(agentType);
  const taskHistory = useAgentTaskHistory(agentType);
  const { executeAgent, fetchAgentStatus, fetchTaskHistory } = useAgentStore();
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchAgentStatus(agentType);
    fetchTaskHistory(agentType, 5);
  }, [agentType, fetchAgentStatus, fetchTaskHistory]);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'busy':
        return 'text-blue-600 bg-blue-100';
      case 'idle':
        return 'text-green-600 bg-green-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'busy':
        return <Zap className="w-3 h-3" />;
      case 'idle':
        return <CheckCircle className="w-3 h-3" />;
      case 'error':
        return <AlertCircle className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  const handleQuickTest = async () => {
    try {
      const testTasks = {
        [AGENT_TYPES.CODE_GENERATOR]: {
          description: 'Generate a simple Hello World function',
          parameters: { language: 'python', framework: 'fastapi' }
        },
        [AGENT_TYPES.DEBUG_AGENT]: {
          description: 'Analyze code for potential issues',
          parameters: { code: 'def hello(): print("Hello World")' }
        },
        [AGENT_TYPES.TESTING_AGENT]: {
          description: 'Create unit tests for a function',
          parameters: { code: 'def add(a, b): return a + b' }
        },
        [AGENT_TYPES.DEPLOY_AGENT]: {
          description: 'Check deployment readiness',
          parameters: { environment: 'staging' }
        },
        [AGENT_TYPES.BROWSER_AGENT]: {
          description: 'Test website accessibility',
          parameters: { url: 'https://example.com' }
        },
        [AGENT_TYPES.SECURITY_AGENT]: {
          description: 'Perform security scan',
          parameters: { target: 'application' }
        },
        [AGENT_TYPES.DOCUMENTATION_AGENT]: {
          description: 'Generate API documentation',
          parameters: { doc_type: 'api', files: ['src/main.py'] }
        }
      };

      const taskData = testTasks[agentType];
      if (taskData) {
        await executeAgent(agentType, taskData);
      }
    } catch (error) {
      console.error('Failed to execute test task:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={cn('p-3 rounded-lg', color)}>
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {status && (
            <span className={cn('inline-flex items-center px-2 py-1 rounded-full text-xs font-medium', getStatusColor(status.status))}>
              {getStatusIcon(status.status)}
              <span className="ml-1 capitalize">{status.status}</span>
            </span>
          )}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">
            {metrics?.successRate?.toFixed(1) || '0'}%
          </div>
          <div className="text-xs text-gray-500">Success Rate</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">
            {metrics?.totalTasks || 0}
          </div>
          <div className="text-xs text-gray-500">Total Tasks</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">
            {metrics?.avgResponseTime ? `${(metrics.avgResponseTime / 1000).toFixed(1)}s` : 'N/A'}
          </div>
          <div className="text-xs text-gray-500">Avg Time</div>
        </div>
      </div>

      {/* Current Task */}
      {status?.current_task && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center text-blue-700 mb-1">
            <Activity className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Current Task</span>
          </div>
          <p className="text-sm text-blue-600">{status.current_task}</p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 rounded-lg">
          <div className="flex items-center text-red-700 mb-1">
            <AlertCircle className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Error</span>
          </div>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center space-x-2">
        <button
          onClick={handleQuickTest}
          disabled={isExecuting}
          className={cn(
            'flex-1 flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            isExecuting
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          )}
        >
          {isExecuting ? (
            <>
              <Activity className="w-4 h-4 mr-2 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Quick Test
            </>
          )}
        </button>
        
        <button
          onClick={() => fetchAgentStatus(agentType)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <Activity className="w-4 h-4" />
        </button>
        
        <button className="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Detailed View */}
      {showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Tasks</h4>
          <div className="space-y-2">
            {taskHistory.length > 0 ? (
              taskHistory.slice(0, 3).map((task) => (
                <div key={task.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 truncate">{task.parameters?.description || 'Task'}</span>
                  <span className={cn(
                    'px-2 py-1 rounded-full text-xs',
                    task.status === 'completed' ? 'bg-green-100 text-green-700' :
                    task.status === 'failed' ? 'bg-red-100 text-red-700' :
                    task.status === 'running' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  )}>
                    {task.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No recent tasks</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function AgentManagement() {
  const { fetchAllAgents } = useAgentStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAllAgents();
  }, [fetchAllAgents]);

  const handleRefreshAll = async () => {
    setRefreshing(true);
    try {
      await fetchAllAgents();
    } finally {
      setRefreshing(false);
    }
  };

  const agents = [
    {
      type: AGENT_TYPES.CODE_GENERATOR,
      name: 'Enhanced Code Generator',
      description: 'AI-powered code generation with multiple frameworks',
      icon: <Code2 className="w-6 h-6 text-white" />,
      color: 'bg-blue-500'
    },
    {
      type: AGENT_TYPES.DEBUG_AGENT,
      name: 'Debug Detective',
      description: 'Intelligent debugging and error analysis',
      icon: <Bug className="w-6 h-6 text-white" />,
      color: 'bg-red-500'
    },
    {
      type: AGENT_TYPES.TESTING_AGENT,
      name: 'Testing Specialist',
      description: 'Automated test generation and execution',
      icon: <TestTube className="w-6 h-6 text-white" />,
      color: 'bg-green-500'
    },
    {
      type: AGENT_TYPES.DEPLOY_AGENT,
      name: 'Deployment Manager',
      description: 'Automated deployment and infrastructure management',
      icon: <Rocket className="w-6 h-6 text-white" />,
      color: 'bg-purple-500'
    },
    {
      type: AGENT_TYPES.BROWSER_AGENT,
      name: 'Browser Automation',
      description: 'Web scraping and browser automation',
      icon: <Globe className="w-6 h-6 text-white" />,
      color: 'bg-orange-500'
    },
    {
      type: AGENT_TYPES.SECURITY_AGENT,
      name: 'Security Auditor',
      description: 'Security scanning and vulnerability assessment',
      icon: <Shield className="w-6 h-6 text-white" />,
      color: 'bg-red-600'
    },
    {
      type: AGENT_TYPES.DOCUMENTATION_AGENT,
      name: 'Documentation Generator',
      description: 'AI-powered documentation creation and management',
      icon: <FileText className="w-6 h-6 text-white" />,
      color: 'bg-indigo-500'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agent Management</h1>
          <p className="text-gray-600">Monitor and control all AI agents in real-time</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefreshAll}
            disabled={refreshing}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Activity className={cn('w-4 h-4 mr-2', refreshing && 'animate-spin')} />
            Refresh All
          </button>
        </div>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <AgentCard
            key={agent.type}
            agentType={agent.type}
            name={agent.name}
            description={agent.description}
            icon={agent.icon}
            color={agent.color}
          />
        ))}
      </div>

      {/* Summary Stats */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Agent Performance Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{agents.length}</div>
            <div className="text-sm text-gray-600">Total Agents</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">7</div>
            <div className="text-sm text-gray-600">Active Agents</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">94.2%</div>
            <div className="text-sm text-gray-600">Avg Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">1.8s</div>
            <div className="text-sm text-gray-600">Avg Response Time</div>
          </div>
        </div>
      </div>
    </div>
  );
}