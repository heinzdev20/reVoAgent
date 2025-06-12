/**
 * Real-time Agent Monitor Component
 * Part of reVoAgent Next Phase Implementation
 */

import React, { useState, useEffect } from 'react';
import { useAgentStatus, usePerformanceAlerts } from '../hooks/useEnhancedWebSocket';

interface AgentStatus {
  id: string;
  name: string;
  status: 'idle' | 'processing' | 'error' | 'offline';
  currentTask?: string;
  performance: {
    tasksCompleted: number;
    averageResponseTime: number;
    successRate: number;
  };
  lastUpdate: string;
  capabilities?: string[];
  loadPercentage?: number;
}

interface StatusIndicatorProps {
  status: AgentStatus['status'];
  size?: 'sm' | 'md' | 'lg';
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const statusConfig = {
    idle: { color: 'bg-green-400', label: 'Idle', pulse: false },
    processing: { color: 'bg-blue-400', label: 'Processing', pulse: true },
    error: { color: 'bg-red-400', label: 'Error', pulse: false },
    offline: { color: 'bg-gray-400', label: 'Offline', pulse: false }
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center space-x-2">
      <div className={`rounded-full ${config.color} ${sizeClasses[size]} ${config.pulse ? 'animate-pulse' : ''}`} />
      <span className="text-xs text-gray-300 capitalize">{config.label}</span>
    </div>
  );
};

interface AgentCardProps {
  agent: AgentStatus;
  onTaskSubmit?: (agentId: string, task: string) => void;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, onTaskSubmit }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [taskInput, setTaskInput] = useState('');

  const handleSubmitTask = () => {
    if (taskInput.trim() && onTaskSubmit) {
      onTaskSubmit(agent.id, taskInput.trim());
      setTaskInput('');
    }
  };

  const getPerformanceColor = (value: number, type: 'time' | 'rate') => {
    if (type === 'time') {
      return value < 1000 ? 'text-green-400' : value < 3000 ? 'text-yellow-400' : 'text-red-400';
    } else {
      return value > 95 ? 'text-green-400' : value > 85 ? 'text-yellow-400' : 'text-red-400';
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20 hover:border-white/30 transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <h3 className="font-semibold text-white text-lg">{agent.name}</h3>
          <StatusIndicator status={agent.status} />
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <svg className={`w-5 h-5 transform transition-transform ${showDetails ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Current Task */}
      {agent.currentTask && (
        <div className="mb-3 p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
          <div className="text-xs text-blue-300 mb-1">Current Task</div>
          <div className="text-sm text-white truncate">{agent.currentTask}</div>
        </div>
      )}

      {/* Performance Metrics */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="text-center">
          <div className="text-lg font-bold text-blue-400">{agent.performance.tasksCompleted}</div>
          <div className="text-xs text-gray-400">Tasks</div>
        </div>
        <div className="text-center">
          <div className={`text-lg font-bold ${getPerformanceColor(agent.performance.averageResponseTime, 'time')}`}>
            {agent.performance.averageResponseTime.toFixed(0)}ms
          </div>
          <div className="text-xs text-gray-400">Avg Time</div>
        </div>
        <div className="text-center">
          <div className={`text-lg font-bold ${getPerformanceColor(agent.performance.successRate, 'rate')}`}>
            {agent.performance.successRate.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-400">Success</div>
        </div>
      </div>

      {/* Load Percentage */}
      {agent.loadPercentage !== undefined && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Load</span>
            <span>{agent.loadPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                agent.loadPercentage > 80 ? 'bg-red-400' : 
                agent.loadPercentage > 60 ? 'bg-yellow-400' : 'bg-green-400'
              }`}
              style={{ width: `${Math.min(agent.loadPercentage, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Expanded Details */}
      {showDetails && (
        <div className="mt-4 pt-4 border-t border-white/20 space-y-3">
          {/* Capabilities */}
          {agent.capabilities && agent.capabilities.length > 0 && (
            <div>
              <div className="text-xs text-gray-400 mb-2">Capabilities</div>
              <div className="flex flex-wrap gap-1">
                {agent.capabilities.map((capability, index) => (
                  <span key={index} className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                    {capability}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Last Update */}
          <div>
            <div className="text-xs text-gray-400 mb-1">Last Update</div>
            <div className="text-xs text-gray-300">
              {new Date(agent.lastUpdate).toLocaleString()}
            </div>
          </div>

          {/* Task Submission */}
          {agent.status === 'idle' && onTaskSubmit && (
            <div>
              <div className="text-xs text-gray-400 mb-2">Submit Task</div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  placeholder="Enter task description..."
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:border-blue-400"
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmitTask()}
                />
                <button
                  onClick={handleSubmitTask}
                  disabled={!taskInput.trim()}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors"
                >
                  Submit
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface FilterOptions {
  status: 'all' | AgentStatus['status'];
  sortBy: 'name' | 'tasks' | 'performance' | 'lastUpdate';
  sortOrder: 'asc' | 'desc';
}

export const RealTimeAgentMonitor: React.FC = () => {
  const { agents, loading, requestAgentStatus } = useAgentStatus();
  const { alerts } = usePerformanceAlerts();
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    sortBy: 'name',
    sortOrder: 'asc'
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Filter and sort agents
  const filteredAgents = agents
    .filter(agent => {
      const matchesStatus = filters.status === 'all' || agent.status === filters.status;
      const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           agent.id.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'tasks':
          comparison = a.performance.tasksCompleted - b.performance.tasksCompleted;
          break;
        case 'performance':
          comparison = a.performance.successRate - b.performance.successRate;
          break;
        case 'lastUpdate':
          comparison = new Date(a.lastUpdate).getTime() - new Date(b.lastUpdate).getTime();
          break;
      }
      
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

  const handleTaskSubmit = (agentId: string, task: string) => {
    // This would typically call the WebSocket service to submit a task
    console.log(`Submitting task to agent ${agentId}:`, task);
    // submitAgentTask(agentId, task);
  };

  const getStatusCounts = () => {
    return agents.reduce((counts, agent) => {
      counts[agent.status] = (counts[agent.status] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Agent Monitor</h2>
          <p className="text-gray-400">Real-time agent status and performance</p>
        </div>
        <button
          onClick={() => requestAgentStatus()}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh</span>
        </button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(statusCounts).map(([status, count]) => (
          <div key={status} className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">{count}</div>
                <div className="text-sm text-gray-400 capitalize">{status}</div>
              </div>
              <StatusIndicator status={status as AgentStatus['status']} size="lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Performance Alerts */}
      {alerts.length > 0 && (
        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-300 mb-2">Performance Alerts</h3>
          <div className="space-y-2">
            {alerts.slice(0, 3).map((alert, index) => (
              <div key={index} className="text-sm text-yellow-200">
                <span className="font-medium">{alert.agent_name}:</span> {alert.alerts.join(', ')}
              </div>
            ))}
            {alerts.length > 3 && (
              <div className="text-sm text-yellow-300">
                +{alerts.length - 3} more alerts
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search agents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as FilterOptions['status'] }))}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
          >
            <option value="all">All Status</option>
            <option value="idle">Idle</option>
            <option value="processing">Processing</option>
            <option value="error">Error</option>
            <option value="offline">Offline</option>
          </select>
          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-');
              setFilters(prev => ({ 
                ...prev, 
                sortBy: sortBy as FilterOptions['sortBy'],
                sortOrder: sortOrder as FilterOptions['sortOrder']
              }));
            }}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
          >
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="tasks-desc">Most Tasks</option>
            <option value="tasks-asc">Least Tasks</option>
            <option value="performance-desc">Best Performance</option>
            <option value="performance-asc">Worst Performance</option>
            <option value="lastUpdate-desc">Recently Updated</option>
            <option value="lastUpdate-asc">Oldest Update</option>
          </select>
        </div>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgents.map(agent => (
          <AgentCard
            key={agent.id}
            agent={agent}
            onTaskSubmit={handleTaskSubmit}
          />
        ))}
      </div>

      {filteredAgents.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg">No agents found matching your criteria</div>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilters({ status: 'all', sortBy: 'name', sortOrder: 'asc' });
            }}
            className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default RealTimeAgentMonitor;