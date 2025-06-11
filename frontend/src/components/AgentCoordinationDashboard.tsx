// 👥 100-Agent Coordination Dashboard
// Real-time interface for managing Claude, Gemini, and OpenHands agents

import React, { useState, useEffect } from 'react';
import { enterpriseApi, type EnterpriseAgentStatus, type Epic, type TaskResult } from '@/services/enterpriseApi';
import { enterpriseWebSocket, type AgentStatusUpdate, type TaskUpdate } from '@/services/enterpriseWebSocket';

interface AgentGridProps {
  agents: EnterpriseAgentStatus[];
  onAgentSelect: (agent: EnterpriseAgentStatus) => void;
  selectedAgent?: EnterpriseAgentStatus;
}

const AgentGrid: React.FC<AgentGridProps> = ({ agents, onAgentSelect, selectedAgent }) => {
  const getAgentTypeColor = (type: string) => {
    switch (type) {
      case 'claude': return 'bg-blue-500';
      case 'gemini': return 'bg-green-500';
      case 'openhands': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-400';
      case 'busy': return 'bg-yellow-400';
      case 'idle': return 'bg-gray-400';
      case 'error': return 'bg-red-400';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="grid grid-cols-10 gap-2 p-4">
      {agents.map((agent) => (
        <div
          key={agent.id}
          onClick={() => onAgentSelect(agent)}
          className={`
            relative p-2 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105
            ${getAgentTypeColor(agent.type)} 
            ${selectedAgent?.id === agent.id ? 'ring-2 ring-white' : ''}
          `}
        >
          {/* Agent Status Indicator */}
          <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${getStatusColor(agent.status)}`} />
          
          {/* Agent Info */}
          <div className="text-white text-xs">
            <div className="font-semibold">{agent.type.toUpperCase()}</div>
            <div className="text-xs opacity-75">#{agent.id.slice(-4)}</div>
            <div className="text-xs">{agent.performance_score.toFixed(1)}%</div>
          </div>
          
          {/* Task Indicator */}
          {agent.current_task && (
            <div className="absolute bottom-1 left-1 w-1 h-1 bg-white rounded-full animate-pulse" />
          )}
        </div>
      ))}
    </div>
  );
};

interface EpicCoordinatorProps {
  onEpicCreate: (epic: Epic) => void;
  activeEpics: any[];
}

const EpicCoordinator: React.FC<EpicCoordinatorProps> = ({ onEpicCreate, activeEpics }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newEpic, setNewEpic] = useState<Partial<Epic>>({
    title: '',
    description: '',
    priority: 'medium',
    estimated_complexity: 5,
    requirements: []
  });

  const handleCreateEpic = async () => {
    if (!newEpic.title || !newEpic.description) return;
    
    try {
      await onEpicCreate(newEpic as Epic);
      setNewEpic({
        title: '',
        description: '',
        priority: 'medium',
        estimated_complexity: 5,
        requirements: []
      });
      setIsCreating(false);
    } catch (error) {
      console.error('Failed to create epic:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Epic Coordination</h3>
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Create Epic
        </button>
      </div>

      {/* Active Epics */}
      <div className="space-y-3 mb-6">
        {activeEpics.map((epic) => (
          <div key={epic.id} className="border rounded-lg p-3">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{epic.title}</h4>
                <p className="text-sm text-gray-600">{epic.description}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className={`px-2 py-1 text-xs rounded ${
                    epic.priority === 'critical' ? 'bg-red-100 text-red-800' :
                    epic.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    epic.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {epic.priority}
                  </span>
                  <span className="text-xs text-gray-500">
                    {epic.tasks?.length || 0} tasks
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{epic.progress || 0}%</div>
                <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${epic.progress || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Epic Form */}
      {isCreating && (
        <div className="border-t pt-4">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Epic title"
              value={newEpic.title}
              onChange={(e) => setNewEpic({ ...newEpic, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              placeholder="Epic description"
              value={newEpic.description}
              onChange={(e) => setNewEpic({ ...newEpic, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
            <div className="flex space-x-4">
              <select
                value={newEpic.priority}
                onChange={(e) => setNewEpic({ ...newEpic, priority: e.target.value as any })}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="critical">Critical Priority</option>
              </select>
              <input
                type="range"
                min="1"
                max="10"
                value={newEpic.estimated_complexity}
                onChange={(e) => setNewEpic({ ...newEpic, estimated_complexity: parseInt(e.target.value) })}
                className="flex-1"
              />
              <span className="text-sm text-gray-600">
                Complexity: {newEpic.estimated_complexity}/10
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleCreateEpic}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Create
              </button>
              <button
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface RealTimeMetricsProps {
  metrics: any;
}

const RealTimeMetrics: React.FC<RealTimeMetricsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Agent Statistics */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h4 className="text-lg font-semibold mb-4">Agent Status</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Total Agents:</span>
            <span className="font-semibold">{metrics?.agents?.total_count || 0}</span>
          </div>
          <div className="flex justify-between">
            <span>Active:</span>
            <span className="font-semibold text-green-600">{metrics?.agents?.active_count || 0}</span>
          </div>
          <div className="flex justify-between">
            <span>Success Rate:</span>
            <span className="font-semibold">{(metrics?.agents?.success_rate * 100 || 0).toFixed(1)}%</span>
          </div>
          <div className="flex justify-between">
            <span>Avg Response:</span>
            <span className="font-semibold">{metrics?.agents?.average_response_time_ms || 0}ms</span>
          </div>
        </div>
      </div>

      {/* System Performance */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h4 className="text-lg font-semibold mb-4">System Health</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Uptime:</span>
            <span className="font-semibold">{Math.floor((metrics?.system?.uptime_seconds || 0) / 3600)}h</span>
          </div>
          <div className="flex justify-between">
            <span>CPU Usage:</span>
            <span className="font-semibold">{(metrics?.system?.cpu_usage || 0).toFixed(1)}%</span>
          </div>
          <div className="flex justify-between">
            <span>Memory:</span>
            <span className="font-semibold">{(metrics?.system?.memory_usage || 0).toFixed(1)}%</span>
          </div>
          <div className="flex justify-between">
            <span>Connections:</span>
            <span className="font-semibold">{metrics?.system?.active_connections || 0}</span>
          </div>
        </div>
      </div>

      {/* Cost Optimization */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h4 className="text-lg font-semibold mb-4">Cost Savings</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Local Usage:</span>
            <span className="font-semibold text-green-600">
              {(metrics?.cost_optimization?.local_model_usage_percent || 0).toFixed(1)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span>Monthly Savings:</span>
            <span className="font-semibold text-green-600">
              ${(metrics?.cost_optimization?.monthly_savings_usd || 0).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Cost/Request:</span>
            <span className="font-semibold">
              ${(metrics?.cost_optimization?.cost_per_request_usd || 0).toFixed(4)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Requests Today:</span>
            <span className="font-semibold">{metrics?.cost_optimization?.total_requests_today || 0}</span>
          </div>
        </div>
      </div>

      {/* Quality Gates */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h4 className="text-lg font-semibold mb-4">Quality Gates</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Overall Score:</span>
            <span className="font-semibold text-blue-600">
              {(metrics?.quality_gates?.overall_score || 0).toFixed(1)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span>Security:</span>
            <span className="font-semibold">{(metrics?.quality_gates?.security_score || 0).toFixed(1)}%</span>
          </div>
          <div className="flex justify-between">
            <span>Performance:</span>
            <span className="font-semibold">{(metrics?.quality_gates?.performance_score || 0).toFixed(1)}%</span>
          </div>
          <div className="flex justify-between">
            <span>Passed/Failed:</span>
            <span className="font-semibold">
              {metrics?.quality_gates?.passed_validations || 0}/{metrics?.quality_gates?.failed_validations || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AgentCoordinationDashboard: React.FC = () => {
  const [agents, setAgents] = useState<EnterpriseAgentStatus[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<EnterpriseAgentStatus>();
  const [activeEpics, setActiveEpics] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  useEffect(() => {
    // Load initial data
    loadInitialData();

    // Set up real-time subscriptions
    const unsubscribeAgent = enterpriseWebSocket.subscribeToAgentUpdates(handleAgentUpdate);
    const unsubscribeTask = enterpriseWebSocket.subscribeToTaskUpdates(handleTaskUpdate);
    const unsubscribeMetrics = enterpriseWebSocket.subscribeToEngineMetrics(handleMetricsUpdate);

    // Connection status monitoring
    const unsubscribeConnection = enterpriseWebSocket.on('connected', () => setConnectionStatus('connected'));
    const unsubscribeDisconnection = enterpriseWebSocket.on('disconnected', () => setConnectionStatus('disconnected'));

    // Periodic metrics refresh
    const metricsInterval = setInterval(loadMetrics, 30000); // Every 30 seconds

    return () => {
      unsubscribeAgent();
      unsubscribeTask();
      unsubscribeMetrics();
      unsubscribeConnection();
      unsubscribeDisconnection();
      clearInterval(metricsInterval);
    };
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [agentsData, metricsData] = await Promise.all([
        enterpriseApi.getAgentStatus(),
        enterpriseApi.getMonitoringDashboard()
      ]);
      
      setAgents(agentsData);
      setMetrics(metricsData);
      setConnectionStatus(enterpriseWebSocket.connectionState);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMetrics = async () => {
    try {
      const metricsData = await enterpriseApi.getMonitoringDashboard();
      setMetrics(metricsData);
    } catch (error) {
      console.error('Failed to load metrics:', error);
    }
  };

  const handleAgentUpdate = (update: AgentStatusUpdate) => {
    setAgents(prev => prev.map(agent => 
      agent.id === update.agent_id 
        ? { ...agent, ...update }
        : agent
    ));
  };

  const handleTaskUpdate = (update: TaskUpdate) => {
    // Update epic progress based on task updates
    setActiveEpics(prev => prev.map(epic => {
      if (epic.id === update.epic_id) {
        const tasks = epic.tasks || [];
        const updatedTasks = tasks.map((task: any) => 
          task.id === update.task_id ? { ...task, ...update } : task
        );
        const completedTasks = updatedTasks.filter((task: any) => task.status === 'completed').length;
        const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;
        
        return { ...epic, tasks: updatedTasks, progress };
      }
      return epic;
    }));
  };

  const handleMetricsUpdate = (metricsUpdate: any) => {
    setMetrics(prev => ({ ...prev, ...metricsUpdate }));
  };

  const handleEpicCreate = async (epic: Epic) => {
    try {
      const tasks = await enterpriseApi.coordinateEpic(epic);
      const newEpic = {
        ...epic,
        id: `epic_${Date.now()}`,
        tasks: tasks,
        progress: 0,
        created_at: new Date().toISOString()
      };
      setActiveEpics(prev => [...prev, newEpic]);
    } catch (error) {
      console.error('Failed to coordinate epic:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">100-Agent Coordination Dashboard</h1>
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
            connectionStatus === 'connected' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span>{connectionStatus}</span>
          </div>
          <button
            onClick={loadInitialData}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Agent Grid */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Agent Status Grid</h2>
          <p className="text-sm text-gray-600">
            {agents.length} agents • {agents.filter(a => a.status === 'active').length} active • 
            {agents.filter(a => a.status === 'busy').length} busy
          </p>
        </div>
        <AgentGrid 
          agents={agents} 
          onAgentSelect={setSelectedAgent}
          selectedAgent={selectedAgent}
        />
      </div>

      {/* Main Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Epic Coordination */}
        <div className="lg:col-span-1">
          <EpicCoordinator 
            onEpicCreate={handleEpicCreate}
            activeEpics={activeEpics}
          />
        </div>

        {/* Selected Agent Details */}
        <div className="lg:col-span-2">
          {selectedAgent ? (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">
                Agent Details: {selectedAgent.type.toUpperCase()} #{selectedAgent.id.slice(-4)}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p><strong>Status:</strong> {selectedAgent.status}</p>
                  <p><strong>Performance:</strong> {selectedAgent.performance_score.toFixed(1)}%</p>
                  <p><strong>Tasks Completed:</strong> {selectedAgent.tasks_completed}</p>
                  <p><strong>Cost per Task:</strong> ${selectedAgent.cost_per_task?.toFixed(4) || '0.0000'}</p>
                </div>
                <div>
                  <p><strong>Current Task:</strong> {selectedAgent.current_task || 'None'}</p>
                  <p><strong>Specializations:</strong></p>
                  <ul className="text-sm text-gray-600 ml-4">
                    {selectedAgent.specialization?.map((spec, index) => (
                      <li key={index}>• {spec}</li>
                    )) || <li>• General purpose</li>}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-6 text-center text-gray-500">
              Select an agent from the grid to view details
            </div>
          )}
        </div>
      </div>

      {/* Real-time Metrics */}
      <RealTimeMetrics metrics={metrics} />
    </div>
  );
};