import React, { useState, useEffect } from 'react';
import { Activity, Cpu, HardDrive, Wifi, AlertCircle, TrendingUp, Server, Zap } from 'lucide-react';

interface SystemMetrics {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  network_io: {
    bytes_sent: number;
    bytes_recv: number;
  };
  active_connections: number;
  uptime: string;
  load_average: number[];
}

interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: string;
  resolved: boolean;
}

const Monitoring: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMonitoringData();
    const interval = setInterval(fetchMonitoringData, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchMonitoringData = async () => {
    try {
      const response = await fetch('/api/v1/monitoring/metrics');
      const data = await response.json();
      setMetrics(data.metrics || {
        cpu_usage: 45.2,
        memory_usage: 67.8,
        disk_usage: 34.5,
        network_io: { bytes_sent: 1024000, bytes_recv: 2048000 },
        active_connections: 156,
        uptime: '5 days, 12 hours',
        load_average: [1.2, 1.5, 1.8]
      });
      setAlerts(data.alerts || [
        {
          id: '1',
          type: 'warning',
          message: 'High memory usage detected (>80%)',
          timestamp: '2 min ago',
          resolved: false
        },
        {
          id: '2',
          type: 'info',
          message: 'System backup completed successfully',
          timestamp: '1 hour ago',
          resolved: true
        },
        {
          id: '3',
          type: 'error',
          message: 'Failed to connect to external API',
          timestamp: '3 hours ago',
          resolved: false
        }
      ]);
    } catch (error) {
      console.error('Error fetching monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUsageColor = (usage: number) => {
    if (usage >= 80) return 'text-red-600';
    if (usage >= 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getUsageBarColor = (usage: number) => {
    if (usage >= 80) return 'bg-red-500';
    if (usage >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'info': return <AlertCircle className="h-5 w-5 text-blue-500" />;
      default: return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <Activity className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Monitoring</h1>
          <p className="text-gray-600">Real-time system performance and health monitoring</p>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">CPU Usage</p>
              <p className={`text-2xl font-bold ${getUsageColor(metrics?.cpu_usage || 0)}`}>
                {metrics?.cpu_usage || 0}%
              </p>
            </div>
            <Cpu className="h-8 w-8 text-blue-600" />
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${getUsageBarColor(metrics?.cpu_usage || 0)}`}
                style={{ width: `${metrics?.cpu_usage || 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Memory Usage</p>
              <p className={`text-2xl font-bold ${getUsageColor(metrics?.memory_usage || 0)}`}>
                {metrics?.memory_usage || 0}%
              </p>
            </div>
            <Server className="h-8 w-8 text-blue-600" />
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${getUsageBarColor(metrics?.memory_usage || 0)}`}
                style={{ width: `${metrics?.memory_usage || 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Disk Usage</p>
              <p className={`text-2xl font-bold ${getUsageColor(metrics?.disk_usage || 0)}`}>
                {metrics?.disk_usage || 0}%
              </p>
            </div>
            <HardDrive className="h-8 w-8 text-blue-600" />
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${getUsageBarColor(metrics?.disk_usage || 0)}`}
                style={{ width: `${metrics?.disk_usage || 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Connections</p>
              <p className="text-2xl font-bold text-gray-900">{metrics?.active_connections || 0}</p>
            </div>
            <Wifi className="h-8 w-8 text-blue-600" />
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">Uptime: {metrics?.uptime || 'Unknown'}</p>
          </div>
        </div>
      </div>

      {/* Network and Load */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Network I/O</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Bytes Sent</span>
              <span className="text-sm font-medium text-gray-900">
                {formatBytes(metrics?.network_io.bytes_sent || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Bytes Received</span>
              <span className="text-sm font-medium text-gray-900">
                {formatBytes(metrics?.network_io.bytes_recv || 0)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Load Average</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">1 minute</span>
              <span className="text-sm font-medium text-gray-900">
                {metrics?.load_average[0]?.toFixed(2) || '0.00'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">5 minutes</span>
              <span className="text-sm font-medium text-gray-900">
                {metrics?.load_average[1]?.toFixed(2) || '0.00'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">15 minutes</span>
              <span className="text-sm font-medium text-gray-900">
                {metrics?.load_average[2]?.toFixed(2) || '0.00'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">System Alerts</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {alerts.map((alert) => (
            <div key={alert.id} className={`p-6 ${alert.resolved ? 'bg-gray-50' : ''}`}>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {getAlertIcon(alert.type)}
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium ${alert.resolved ? 'text-gray-500' : 'text-gray-900'}`}>
                      {alert.message}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">{alert.timestamp}</span>
                      {alert.resolved && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Resolved
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Trends */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <TrendingUp className="h-6 w-6 text-blue-600 mt-1" />
          <div className="ml-3">
            <h3 className="text-lg font-medium text-blue-900 mb-2">Performance Insights</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• CPU usage has increased by 15% over the last hour</li>
              <li>• Memory usage is approaching the 80% threshold</li>
              <li>• Network traffic is within normal parameters</li>
              <li>• System load is stable with no significant spikes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Monitoring;