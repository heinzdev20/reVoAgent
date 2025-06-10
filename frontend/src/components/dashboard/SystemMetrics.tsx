import React, { useEffect, useState } from 'react';
import { Activity, TrendingUp, TrendingDown, Minus, Wifi, WifiOff } from 'lucide-react';
import { useDashboardStats, useDashboardConnection, usePerformanceHistory } from '../../stores/dashboardStore';
import type { DashboardStats } from '@/types';

interface MetricCardProps {
  label: string;
  value: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  color: string;
  icon?: React.ReactNode;
}

function MetricCard({ label, value, trend, trendValue, color, icon }: MetricCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-3 h-3 text-red-500" />;
      default:
        return <Minus className="w-3 h-3 text-gray-400" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600">{label}</span>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      <div className={`text-xl font-bold ${color} mb-1`}>{value}</div>
      {trend && trendValue && (
        <div className={`flex items-center text-xs ${getTrendColor()}`}>
          {getTrendIcon()}
          <span className="ml-1">{trendValue}</span>
        </div>
      )}
    </div>
  );
}

export function SystemMetrics() {
  const stats = useDashboardStats();
  const { isConnected, lastUpdate, isLoading, error } = useDashboardConnection();
  const performanceHistory = usePerformanceHistory();
  const [previousStats, setPreviousStats] = useState<DashboardStats | null>(null);

  // Track previous stats for trend calculation
  useEffect(() => {
    if (stats && stats !== previousStats) {
      setPreviousStats(stats);
    }
  }, [stats, previousStats]);

  // Calculate trends
  const calculateTrend = (current: number, previous: number): { trend: 'up' | 'down' | 'stable'; value: string } => {
    if (!previous) return { trend: 'stable', value: '0%' };
    
    const change = ((current - previous) / previous) * 100;
    const absChange = Math.abs(change);
    
    if (absChange < 1) return { trend: 'stable', value: '0%' };
    
    return {
      trend: change > 0 ? 'up' : 'down',
      value: `${change > 0 ? '+' : ''}${change.toFixed(1)}%`
    };
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center text-red-600">
          <WifiOff className="w-5 h-5 mr-2" />
          <span className="font-medium">Connection Error</span>
        </div>
        <p className="text-red-600 text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">System Metrics</h3>
          <div className="flex items-center text-gray-400">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="bg-gray-100 rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-6 bg-gray-200 rounded mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const tasksTrend = previousStats ? calculateTrend(stats.tasksCompleted, previousStats.tasksCompleted) : { trend: 'stable' as const, value: '0%' };
  const responseTrend = previousStats ? calculateTrend(stats.responseTime, previousStats.responseTime) : { trend: 'stable' as const, value: '0%' };

  const metrics = [
    {
      label: 'Tasks Completed',
      value: stats.tasksCompleted.toLocaleString(),
      trend: tasksTrend.trend,
      trendValue: tasksTrend.value,
      color: 'text-blue-600',
      icon: <Activity className="w-4 h-4" />,
    },
    {
      label: 'Success Rate',
      value: `${stats.successRate}%`,
      trend: previousStats ? calculateTrend(stats.successRate, previousStats.successRate).trend : 'stable',
      trendValue: previousStats ? calculateTrend(stats.successRate, previousStats.successRate).value : '0%',
      color: stats.successRate >= 95 ? 'text-green-600' : stats.successRate >= 90 ? 'text-yellow-600' : 'text-red-600',
    },
    {
      label: 'API Cost',
      value: `$${stats.apiCost.toFixed(2)}`,
      trend: previousStats ? calculateTrend(stats.apiCost, previousStats.apiCost).trend : 'stable',
      trendValue: previousStats ? calculateTrend(stats.apiCost, previousStats.apiCost).value : '0%',
      color: 'text-green-600',
    },
    {
      label: 'Active Agents',
      value: stats.activeAgents.toString(),
      trend: previousStats ? calculateTrend(stats.activeAgents, previousStats.activeAgents).trend : 'stable',
      trendValue: previousStats ? calculateTrend(stats.activeAgents, previousStats.activeAgents).value : '0%',
      color: 'text-purple-600',
    },
    {
      label: 'Response Time',
      value: `${stats.responseTime}ms`,
      trend: responseTrend.trend === 'up' ? 'down' : responseTrend.trend === 'down' ? 'up' : 'stable', // Invert for response time
      trendValue: responseTrend.value,
      color: stats.responseTime <= 200 ? 'text-green-600' : stats.responseTime <= 500 ? 'text-yellow-600' : 'text-red-600',
    },
    {
      label: 'Memory Usage',
      value: stats.memoryUsage,
      color: 'text-orange-600',
    },
    {
      label: 'Models Loaded',
      value: stats.modelsLoaded.toString(),
      color: 'text-indigo-600',
    },
    {
      label: 'Uptime',
      value: stats.uptime,
      color: 'text-green-600',
    },
  ];

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">System Metrics</h3>
        <div className="flex items-center space-x-2">
          {isConnected ? (
            <div className="flex items-center text-green-600">
              <Wifi className="w-4 h-4 mr-1" />
              <span className="text-xs">Live</span>
            </div>
          ) : (
            <div className="flex items-center text-red-600">
              <WifiOff className="w-4 h-4 mr-1" />
              <span className="text-xs">Offline</span>
            </div>
          )}
          {lastUpdate && (
            <span className="text-xs text-gray-500">
              Updated {new Date(lastUpdate).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <MetricCard
            key={index}
            label={metric.label}
            value={metric.value}
            trend={metric.trend}
            trendValue={metric.trendValue}
            color={metric.color}
            icon={metric.icon}
          />
        ))}
      </div>
      
      {isLoading && (
        <div className="mt-4 flex items-center justify-center text-gray-500">
          <Activity className="w-4 h-4 animate-spin mr-2" />
          <span className="text-sm">Updating metrics...</span>
        </div>
      )}
    </div>
  );
}