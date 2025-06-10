import React, { useState } from 'react';
import { Play, Pause, Square, MoreVertical, Clock, Users, Zap, AlertCircle, CheckCircle } from 'lucide-react';
import { useActiveWorkflows, useDashboardStore } from '../../stores/dashboardStore';
import type { WorkflowData } from '@/types';
import { cn } from '@/utils/cn';

interface WorkflowCardProps {
  workflow: WorkflowData;
  onStart: (id: string) => void;
  onStop: (id: string) => void;
}

function WorkflowCard({ workflow, onStart, onStop }: WorkflowCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const getStatusColor = (status: WorkflowData['status']) => {
    switch (status) {
      case 'running':
        return 'text-blue-600 bg-blue-100';
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'paused':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: WorkflowData['status']) => {
    switch (status) {
      case 'running':
        return <Zap className="w-3 h-3" />;
      case 'completed':
        return <CheckCircle className="w-3 h-3" />;
      case 'paused':
        return <Pause className="w-3 h-3" />;
      case 'failed':
        return <AlertCircle className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const handleAction = async (action: 'start' | 'stop') => {
    setIsLoading(true);
    try {
      if (action === 'start') {
        await onStart(workflow.id);
      } else {
        await onStop(workflow.id);
      }
    } catch (error) {
      console.error(`Failed to ${action} workflow:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (startTime: string) => {
    const start = new Date(startTime);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{workflow.icon}</span>
          <div>
            <div className="font-medium text-gray-900">{workflow.name}</div>
            <div className="flex items-center space-x-2 mt-1">
              <span className={cn('inline-flex items-center px-2 py-1 rounded-full text-xs font-medium', getStatusColor(workflow.status))}>
                {getStatusIcon(workflow.status)}
                <span className="ml-1 capitalize">{workflow.status}</span>
              </span>
              {workflow.status === 'running' && (
                <span className="text-xs text-gray-500">
                  {formatDuration(workflow.startTime || new Date().toISOString())}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {workflow.status === 'running' ? (
            <button
              onClick={() => handleAction('stop')}
              disabled={isLoading}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
              title="Stop workflow"
            >
              <Square className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => handleAction('start')}
              disabled={isLoading}
              className="p-1 text-gray-400 hover:text-green-600 transition-colors disabled:opacity-50"
              title="Start workflow"
            >
              <Play className="w-4 h-4" />
            </button>
          )}
          <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-gray-600">
              <Users className="w-4 h-4 mr-1" />
              <span>{workflow.agents} agents</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Clock className="w-4 h-4 mr-1" />
              <span>{workflow.estimatedTime || 'N/A'}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="font-medium">{workflow.progress}%</div>
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={cn(
              'h-2 rounded-full transition-all duration-500',
              getProgressColor(workflow.progress)
            )}
            style={{ width: `${workflow.progress}%` }}
          />
        </div>

        {workflow.description && (
          <p className="text-sm text-gray-600 line-clamp-2">{workflow.description}</p>
        )}
      </div>
    </div>
  );
}

export function ActiveWorkflows() {
  const activeWorkflows = useActiveWorkflows();
  const { startWorkflow, stopWorkflow } = useDashboardStore();

  const totalActiveAgents = activeWorkflows.reduce((sum, workflow) => sum + workflow.agents, 0);
  const runningWorkflows = activeWorkflows.filter(w => w.status === 'running');

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Active Workflows</h3>
        <div className="flex items-center space-x-4">
          {runningWorkflows.length > 0 && (
            <div className="flex items-center text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />
              <span className="text-sm font-medium">{runningWorkflows.length} running</span>
            </div>
          )}
          <span className="text-sm text-gray-500">
            {activeWorkflows.length} total
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {activeWorkflows.length > 0 ? (
          activeWorkflows.map((workflow) => (
            <WorkflowCard
              key={workflow.id}
              workflow={workflow}
              onStart={startWorkflow}
              onStop={stopWorkflow}
            />
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">🔄</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Active Workflows</h4>
            <p className="text-sm">Start a new workflow to see real-time progress here</p>
            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Create Workflow
            </button>
          </div>
        )}
      </div>

      {activeWorkflows.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <Users className="w-5 h-5 text-blue-600 mr-2" />
              <div>
                <div className="text-sm font-medium text-blue-800">Active Agents</div>
                <div className="text-lg font-bold text-blue-900">{totalActiveAgents}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <Zap className="w-5 h-5 text-green-600 mr-2" />
              <div>
                <div className="text-sm font-medium text-green-800">Running</div>
                <div className="text-lg font-bold text-green-900">{runningWorkflows.length}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-purple-600 mr-2" />
              <div>
                <div className="text-sm font-medium text-purple-800">Avg Progress</div>
                <div className="text-lg font-bold text-purple-900">
                  {activeWorkflows.length > 0 
                    ? Math.round(activeWorkflows.reduce((sum, w) => sum + w.progress, 0) / activeWorkflows.length)
                    : 0}%
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}