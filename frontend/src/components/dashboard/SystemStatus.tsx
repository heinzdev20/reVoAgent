import React from 'react';
import type { SystemMetric } from '@/types';
import { cn } from '@/utils/cn';

interface SystemStatusProps {
  metrics: { [key: string]: SystemMetric };
}

export function SystemStatus({ metrics }: SystemStatusProps) {
  const defaultMetrics: SystemMetric[] = [
    { name: 'CPU Usage', value: 82, color: 'bg-blue-500', unit: '%' },
    { name: 'Memory', value: 67, color: 'bg-green-500', unit: '%' },
    { name: 'GPU Memory', value: 56, color: 'bg-purple-500', unit: '%' },
    { name: 'Disk I/O', value: 34, color: 'bg-yellow-500', unit: '%' },
    { name: 'Network', value: 23, color: 'bg-red-500', unit: '%' },
    { name: 'Models Load', value: 80, color: 'bg-indigo-500', label: '8/10' },
  ];

  // Use provided metrics or fall back to defaults
  const displayMetrics = Object.keys(metrics).length > 0 
    ? Object.values(metrics) 
    : defaultMetrics;

  const getIntensityClass = (value: number) => {
    if (value >= 90) return 'animate-pulse';
    if (value >= 80) return '';
    return '';
  };

  return (
    <div className="metric-card animate-slide-up">
      <h3 className="text-lg font-semibold mb-4">System Status</h3>
      <div className="space-y-3">
        {displayMetrics.map((metric, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm text-gray-600 min-w-0 flex-1">{metric.name}:</span>
            <div className="flex items-center space-x-2 ml-4">
              <div className="w-24 bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={cn(
                    'h-2 rounded-full transition-all duration-500 ease-out',
                    metric.color,
                    getIntensityClass(metric.value)
                  )}
                  style={{ width: `${Math.min(metric.value, 100)}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium min-w-0 text-right">
                {metric.label || `${metric.value}${metric.unit || '%'}`}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {/* System Health Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Overall Health:</span>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse-green"></div>
            <span className="font-medium text-green-600">Optimal</span>
          </div>
        </div>
      </div>
    </div>
  );
}