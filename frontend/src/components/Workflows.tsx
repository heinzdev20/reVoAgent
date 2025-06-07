import React, { useState, useEffect } from 'react';
import { Settings, Play, Pause, Square, Plus } from 'lucide-react';

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: string;
  progress: number;
  agents: string[];
  project_id?: string;
  started_at?: string;
  estimated_completion?: string;
  steps_completed: number;
  total_steps: number;
  current_step: string;
}

const Workflows: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    description: '',
    agents: [] as string[],
    project_id: ''
  });

  const availableAgents = [
    'code-gen-1',
    'debug-agent-1', 
    'test-agent-1',
    'deploy-agent-1',
    'browser-agent-1'
  ];

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const response = await fetch('/api/v1/workflows');
      const data = await response.json();
      setWorkflows(data.workflows);
    } catch (error) {
      console.error('Error fetching workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const createWorkflow = async () => {
    try {
      const response = await fetch('/api/v1/workflows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newWorkflow),
      });
      
      if (response.ok) {
        const workflow = await response.json();
        setWorkflows([...workflows, workflow]);
        setShowCreateModal(false);
        setNewWorkflow({
          name: '',
          description: '',
          agents: [],
          project_id: ''
        });
      }
    } catch (error) {
      console.error('Error creating workflow:', error);
    }
  };

  const startWorkflow = async (workflowId: string) => {
    try {
      const response = await fetch(`/api/v1/workflows/${workflowId}/start`, {
        method: 'POST',
      });
      
      if (response.ok) {
        fetchWorkflows(); // Refresh the list
      }
    } catch (error) {
      console.error('Error starting workflow:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-green-600 bg-green-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'stopped': return 'text-red-600 bg-red-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not started';
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (startDate?: string, endDate?: string) => {
    if (!startDate) return 'Not started';
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const diff = end.getTime() - start.getTime();
    const minutes = Math.floor(diff / 60000);
    return `${minutes} min`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Settings className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Workflow Management</h1>
            <p className="text-gray-600">Orchestrate AI agents for complex development tasks</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>New Workflow</span>
        </button>
      </div>

      {/* Workflows List */}
      <div className="space-y-4">
        {workflows.map((workflow) => (
          <div key={workflow.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            {/* Workflow Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{workflow.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(workflow.status)}`}>
                    {workflow.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{workflow.description}</p>
                <div className="text-sm text-gray-500">
                  Current Step: <span className="font-medium">{workflow.current_step}</span>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-2">
                {workflow.status === 'pending' && (
                  <button
                    onClick={() => startWorkflow(workflow.id)}
                    className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    <Play className="h-4 w-4" />
                    <span>Start</span>
                  </button>
                )}
                {workflow.status === 'running' && (
                  <>
                    <button className="flex items-center space-x-1 px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors">
                      <Pause className="h-4 w-4" />
                      <span>Pause</span>
                    </button>
                    <button className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                      <Square className="h-4 w-4" />
                      <span>Stop</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progress ({workflow.steps_completed}/{workflow.total_steps} steps)</span>
                <span>{Math.round(workflow.progress * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${workflow.progress * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Agents */}
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-2">Assigned Agents:</div>
              <div className="flex flex-wrap gap-2">
                {workflow.agents.map((agent, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                  >
                    {agent}
                  </span>
                ))}
              </div>
            </div>

            {/* Timing Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Started:</span>
                <div className="font-medium">{formatDate(workflow.started_at)}</div>
              </div>
              <div>
                <span className="text-gray-500">Duration:</span>
                <div className="font-medium">{formatDuration(workflow.started_at)}</div>
              </div>
              <div>
                <span className="text-gray-500">ETA:</span>
                <div className="font-medium">{formatDate(workflow.estimated_completion)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {workflows.length === 0 && (
        <div className="text-center py-12">
          <Settings className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No workflows</h3>
          <p className="mt-1 text-sm text-gray-500">Create your first workflow to orchestrate AI agents.</p>
          <div className="mt-6">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" />
              New Workflow
            </button>
          </div>
        </div>
      )}

      {/* Create Workflow Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Workflow</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Workflow Name</label>
                  <input
                    type="text"
                    value={newWorkflow.name}
                    onChange={(e) => setNewWorkflow({...newWorkflow, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="My Workflow"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newWorkflow.description}
                    onChange={(e) => setNewWorkflow({...newWorkflow, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Describe your workflow..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Agents</label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {availableAgents.map((agent) => (
                      <label key={agent} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newWorkflow.agents.includes(agent)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewWorkflow({
                                ...newWorkflow,
                                agents: [...newWorkflow.agents, agent]
                              });
                            } else {
                              setNewWorkflow({
                                ...newWorkflow,
                                agents: newWorkflow.agents.filter(a => a !== agent)
                              });
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm">{agent}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={createWorkflow}
                  disabled={!newWorkflow.name.trim() || newWorkflow.agents.length === 0}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Workflow
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workflows;