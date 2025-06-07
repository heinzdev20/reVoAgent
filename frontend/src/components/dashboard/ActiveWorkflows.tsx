import React from 'react';
import type { WorkflowData } from '@/types';
import { cn } from '@/utils/cn';

interface ActiveWorkflowsProps {
  workflows: WorkflowData[];
}

export function ActiveWorkflows({ workflows }: ActiveWorkflowsProps) {
  const getStatusColor = (status: WorkflowData['status']) => {
    switch (status) {
      case 'running':
        return 'text-blue-600';
      case 'completed':
        return 'text-green-600';
      case 'paused':
        return 'text-yellow-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const totalActiveAgents = workflows.reduce((sum, workflow) => sum + workflow.agents, 0);

  return (
    <div className="metric-card animate-slide-up">
      <h3 className="text-lg font-semibold mb-4">Active Workflows</h3>
      <div className="space-y-3">
        {workflows.length > 0 ? (
          workflows.map((workflow) => (
            <div
              key={workflow.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{workflow.icon}</span>
                <div>
                  <div className="font-medium flex items-center space-x-2">
                    <span>{workflow.name}</span>
                    <span className={cn('text-xs', getStatusColor(workflow.status))}>
                      ({workflow.status})
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">{workflow.agents} agents</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{workflow.progress}%</div>
                <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className={cn(
                      'h-2 rounded-full transition-all duration-300',
                      getProgressColor(workflow.progress)
                    )}
                    style={{ width: `${workflow.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🔄</div>
            <p>No active workflows</p>
            <p className="text-sm">Start a new workflow to see it here</p>
          </div>
        )}
      </div>
      {workflows.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm font-medium text-blue-800">
            Total Active: {totalActiveAgents} parallel agents
          </div>
        </div>
      )}
    </div>
  );
}