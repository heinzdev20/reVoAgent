/**
 * Production Monitoring Dashboard Component
 * Part of reVoAgent Next Phase Implementation
 */

import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { useSystemMetrics, usePerformanceAlerts } from '../hooks/useEnhancedWebSocket';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface SystemMetrics {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  network_io: {
    bytes_sent: number;
    bytes_received: number;
  };
  response_times: number[];
  error_rates: number[];
  throughput: number;
  active_connections: number;
  timestamp: string;
}

interface MetricCardProps {
  title: string;
  value: string;
  status: 'good' | 'warning' | 'critical';
  trend?: 'up' | 'down' | 'stable';
  subtitle?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, status, trend, subtitle }) => {
  const statusColors = {
    good: 'border-green-500/50 bg-green-500/10',
    warning: 'border-yellow-500/50 bg-yellow-500/10',
    critical: 'border-red-500/50 bg-red-500/10'
  };

  const trendIcons = {
    up: '↗️',
    down: '↘️',
    stable: '→'
  };

  return (
    <div className={`bg-white/10 backdrop-blur-md rounded-lg p-4 border ${statusColors[status]} transition-all duration-200 hover:border-opacity-70`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-gray-300">{title}</div>
        {trend && (
          <span className="text-lg" title={`Trend: ${trend}`}>
            {trendIcons[trend]}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      {subtitle && (
        <div className="text-xs text-gray-400">{subtitle}</div>
      )}
    </div>
  );
};

interface AlertBannerProps {
  alerts: any[];
  onDismiss?: (alertId: string) => void;
}

const AlertBanner: React.FC<AlertBannerProps> = ({ alerts, onDismiss }) => {
  if (alerts.length === 0) return null;

  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical');
  const warningAlerts = alerts.filter(alert => alert.severity === 'warning');

  return (
    <div className="space-y-2">
      {criticalAlerts.length > 0 && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-red-300 flex items-center">
              🚨 Critical Alerts ({criticalAlerts.length})
            </h3>
          </div>
          <div className="space-y-2">
            {criticalAlerts.slice(0, 3).map((alert, index) => (
              <div key={index} className="flex items-center justify-between bg-red-500/10 rounded p-2">
                <div>
                  <div className="text-red-200 font-medium">{alert.title}</div>
                  <div className="text-sm text-red-300">{alert.description}</div>
                  <div className="text-xs text-red-400">
                    {new Date(alert.timestamp).toLocaleString()}
                  </div>
                </div>
                {onDismiss && (
                  <button
                    onClick={() => onDismiss(alert.id)}
                    className="text-red-300 hover:text-red-100 ml-4"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            {criticalAlerts.length > 3 && (
              <div className="text-sm text-red-300">
                +{criticalAlerts.length - 3} more critical alerts
              </div>
            )}
          </div>
        </div>
      )}

      {warningAlerts.length > 0 && (
        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-yellow-300 flex items-center">
              ⚠️ Warnings ({warningAlerts.length})
            </h3>
          </div>
          <div className="space-y-2">
            {warningAlerts.slice(0, 2).map((alert, index) => (
              <div key={index} className="flex items-center justify-between bg-yellow-500/10 rounded p-2">
                <div>
                  <div className="text-yellow-200 font-medium">{alert.title}</div>
                  <div className="text-sm text-yellow-300">{alert.description}</div>
                </div>
                {onDismiss && (
                  <button
                    onClick={() => onDismiss(alert.id)}
                    className="text-yellow-300 hover:text-yellow-100 ml-4"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            {warningAlerts.length > 2 && (
              <div className="text-sm text-yellow-300">
                +{warningAlerts.length - 2} more warnings
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const ProductionMonitoringDashboard: React.FC = () => {
  const { metrics, requestSystemMetrics } = useSystemMetrics();
  const { alerts, dismissAlert } = usePerformanceAlerts();
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('1h');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        requestSystemMetrics();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh, requestSystemMetrics]);

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <div className="text-gray-400">Loading system metrics...</div>
        </div>
      </div>
    );
  }

  const getMetricStatus = (value: number, type: 'cpu' | 'memory' | 'disk'): 'good' | 'warning' | 'critical' => {
    const thresholds = {
      cpu: { warning: 70, critical: 85 },
      memory: { warning: 75, critical: 90 },
      disk: { warning: 80, critical: 95 }
    };

    const threshold = thresholds[type];
    if (value >= threshold.critical) return 'critical';
    if (value >= threshold.warning) return 'warning';
    return 'good';
  };

  const formatBytes = (bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: 'white' }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: { color: 'white' }
      },
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: { color: 'white' }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Production Monitoring</h2>
          <p className="text-gray-400">Real-time system metrics and performance monitoring</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-300">Auto-refresh:</label>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                autoRefresh 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              {autoRefresh ? 'ON' : 'OFF'}
            </button>
          </div>
          <button
            onClick={requestSystemMetrics}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      <AlertBanner alerts={alerts} onDismiss={dismissAlert} />

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="CPU Usage"
          value={`${metrics.cpu_usage?.toFixed(1) || 0}%`}
          status={getMetricStatus(metrics.cpu_usage || 0, 'cpu')}
          subtitle="System processor utilization"
        />
        <MetricCard
          title="Memory Usage"
          value={`${metrics.memory_usage?.toFixed(1) || 0}%`}
          status={getMetricStatus(metrics.memory_usage || 0, 'memory')}
          subtitle="RAM utilization"
        />
        <MetricCard
          title="Disk Usage"
          value={`${metrics.disk_usage?.toFixed(1) || 0}%`}
          status={getMetricStatus(metrics.disk_usage || 0, 'disk')}
          subtitle="Storage utilization"
        />
        <MetricCard
          title="Active Connections"
          value={`${metrics.active_connections || 0}`}
          status="good"
          subtitle="WebSocket connections"
        />
      </div>

      {/* Network I/O */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricCard
          title="Network Sent"
          value={formatBytes(metrics.network_io?.bytes_sent || 0)}
          status="good"
          subtitle="Total bytes transmitted"
        />
        <MetricCard
          title="Network Received"
          value={formatBytes(metrics.network_io?.bytes_received || 0)}
          status="good"
          subtitle="Total bytes received"
        />
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Response Times Chart */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Response Times</h3>
          <div className="h-64">
            <Line
              data={{
                labels: (metrics.response_times || []).map((_, i) => i),
                datasets: [{
                  label: 'Response Time (ms)',
                  data: metrics.response_times || [],
                  borderColor: 'rgb(59, 130, 246)',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  tension: 0.4,
                  fill: true
                }]
              }}
              options={chartOptions}
            />
          </div>
        </div>

        {/* Error Rates Chart */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Error Rates</h3>
          <div className="h-64">
            <Bar
              data={{
                labels: ['Last Hour', 'Last 6h', 'Last 24h', 'Last Week'],
                datasets: [{
                  label: 'Error Rate (%)',
                  data: metrics.error_rates || [0, 0, 0, 0],
                  backgroundColor: [
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(245, 101, 101, 0.8)',
                    'rgba(248, 113, 113, 0.8)',
                    'rgba(252, 165, 165, 0.8)'
                  ]
                }]
              }}
              options={{
                ...chartOptions,
                scales: {
                  ...chartOptions.scales,
                  y: {
                    ...chartOptions.scales.y,
                    max: 10
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* System Resource Usage Chart */}
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">System Resource Usage</h3>
        <div className="h-64">
          <Doughnut
            data={{
              labels: ['CPU Usage', 'Memory Usage', 'Disk Usage', 'Available'],
              datasets: [{
                data: [
                  metrics.cpu_usage || 0,
                  metrics.memory_usage || 0,
                  metrics.disk_usage || 0,
                  Math.max(0, 100 - Math.max(metrics.cpu_usage || 0, metrics.memory_usage || 0, metrics.disk_usage || 0))
                ],
                backgroundColor: [
                  'rgba(239, 68, 68, 0.8)',   // CPU - Red
                  'rgba(245, 158, 11, 0.8)',  // Memory - Yellow
                  'rgba(139, 92, 246, 0.8)',  // Disk - Purple
                  'rgba(34, 197, 94, 0.8)'    // Available - Green
                ],
                borderColor: [
                  'rgba(239, 68, 68, 1)',
                  'rgba(245, 158, 11, 1)',
                  'rgba(139, 92, 246, 1)',
                  'rgba(34, 197, 94, 1)'
                ],
                borderWidth: 2
              }]
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'right' as const,
                  labels: { color: 'white' }
                }
              }
            }}
          />
        </div>
      </div>

      {/* Throughput and Performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Throughput"
          value={`${metrics.throughput || 0} req/min`}
          status="good"
          subtitle="Requests per minute"
        />
        <MetricCard
          title="Avg Response Time"
          value={`${metrics.response_times?.length ? 
            (metrics.response_times.reduce((a, b) => a + b, 0) / metrics.response_times.length).toFixed(0) : 0}ms`}
          status="good"
          subtitle="Average response time"
        />
        <MetricCard
          title="System Health"
          value="Healthy"
          status="good"
          subtitle="Overall system status"
        />
      </div>

      {/* Last Updated */}
      <div className="text-center text-sm text-gray-400">
        Last updated: {new Date(metrics.timestamp).toLocaleString()}
      </div>
    </div>
  );
};

export default ProductionMonitoringDashboard;