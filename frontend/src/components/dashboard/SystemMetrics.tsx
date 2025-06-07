import React from 'react';
import type { DashboardStats } from '@/types';

interface SystemMetricsProps {
  stats: DashboardStats;
}

export function SystemMetrics({ stats }: SystemMetricsProps) {
  const metrics = [
    {
      label: 'Tasks',
      value: `${stats.tasksCompleted} (+23%)`,
      color: 'text-gray-900',
    },
    {
      label: 'Success',
      value: `${stats.successRate}%`,
      color: 'text-green-600',
    },
    {
      label: 'API Cost',
      value: `$${stats.apiCost}`,
      color: 'text-green-600',
    },
    {
      label: 'Agents',
      value: stats.activeAgents.toString(),
      color: 'text-gray-900',
    },
    {
      label: 'Response',
      value: `${stats.responseTime}ms`,
      color: 'text-gray-900',
    },
    {
      label: 'Memory',
      value: stats.memoryUsage,
      color: 'text-gray-900',
    },
    {
      label: 'Models',
      value: stats.modelsLoaded.toString(),
      color: 'text-gray-900',
    },
    {
      label: 'Uptime',
      value: stats.uptime,
      color: 'text-green-600',
    },
  ];

  return (
    <div className="metric-card animate-slide-up">
      <h3 className="text-lg font-semibold mb-4">System Metrics</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        {metrics.map((metric, index) => (
          <div key={index} className="space-y-1">
            <div className="text-gray-500">{metric.label}:</div>
            <div className={`font-semibold ${metric.color}`}>{metric.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}