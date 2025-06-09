/**
 * Real-time Dashboard - Live monitoring of Three-Engine Architecture
 * Features WebSocket connections for real-time updates
 */

import React, { useState, useEffect, useCallback } from 'react';
import { EngineCard, EngineStatus, EngineMetrics, EngineType, ENGINE_THEMES } from './EngineTheme';

interface EngineData {
  type: EngineType;
  status: 'healthy' | 'warning' | 'error';
  isActive: boolean;
  performance: number;
  lastActivity: Date;
  metrics: {
    responseTime: number;
    throughput: number;
    accuracy: number;
    utilization: number;
  };
  specificMetrics: Record<string, any>;
}

interface DashboardData {
  engines: EngineData[];
  systemMetrics: {
    totalTasks: number;
    activeSessions: number;
    successRate: number;
    uptime: number;
  };
  alerts: Array<{
    id: string;
    level: 'info' | 'warning' | 'error';
    message: string;
    timestamp: Date;
  }>;
}

export const RealTimeDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [ws, setWs] = useState<WebSocket | null>(null);

  // WebSocket connection management
  const connectWebSocket = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/dashboard`;
    
    const websocket = new WebSocket(wsUrl);
    
    websocket.onopen = () => {
      console.log('Dashboard WebSocket connected');
      setConnectionStatus('connected');
    };
    
    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Convert timestamp strings to Date objects
        const processedData: DashboardData = {
          ...data,
          engines: data.engines.map((engine: any) => ({
            ...engine,
            lastActivity: new Date(engine.lastActivity)
          })),
          alerts: data.alerts.map((alert: any) => ({
            ...alert,
            timestamp: new Date(alert.timestamp)
          }))
        };
        
        setDashboardData(processedData);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    websocket.onclose = () => {
      console.log('Dashboard WebSocket disconnected');
      setConnectionStatus('disconnected');
      
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        setConnectionStatus('connecting');
        connectWebSocket();
      }, 3000);
    };
    
    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('disconnected');
    };
    
    setWs(websocket);
  }, []);

  useEffect(() => {
    connectWebSocket();
    
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [connectWebSocket]);

  // Connection status indicator
  const ConnectionIndicator: React.FC = () => {
    const statusColors = {
      connecting: 'bg-yellow-500',
      connected: 'bg-green-500',
      disconnected: 'bg-red-500'
    };
    
    return (
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${statusColors[connectionStatus]} ${
          connectionStatus === 'connected' ? 'animate-pulse' : ''
        }`} />
        <span className="text-sm text-gray-600 capitalize">
          {connectionStatus}
        </span>
      </div>
    );
  };

  // System overview cards
  const SystemOverview: React.FC<{ metrics: DashboardData['systemMetrics'] }> = ({ metrics }) => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-lg p-4 shadow">
        <div className="text-2xl font-bold text-blue-600">{metrics.totalTasks}</div>
        <div className="text-sm text-gray-600">Total Tasks</div>
      </div>
      <div className="bg-white rounded-lg p-4 shadow">
        <div className="text-2xl font-bold text-green-600">{metrics.activeSessions}</div>
        <div className="text-sm text-gray-600">Active Sessions</div>
      </div>
      <div className="bg-white rounded-lg p-4 shadow">
        <div className="text-2xl font-bold text-purple-600">{(metrics.successRate * 100).toFixed(1)}%</div>
        <div className="text-sm text-gray-600">Success Rate</div>
      </div>
      <div className="bg-white rounded-lg p-4 shadow">
        <div className="text-2xl font-bold text-indigo-600">{Math.floor(metrics.uptime / 3600)}h</div>
        <div className="text-sm text-gray-600">Uptime</div>
      </div>
    </div>
  );

  // Alerts panel
  const AlertsPanel: React.FC<{ alerts: DashboardData['alerts'] }> = ({ alerts }) => {
    const alertIcons = {
      info: '💡',
      warning: '⚠️',
      error: '🚨'
    };
    
    const alertColors = {
      info: 'bg-blue-50 border-blue-200 text-blue-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      error: 'bg-red-50 border-red-200 text-red-800'
    };

    return (
      <div className="bg-white rounded-lg p-4 shadow">
        <h3 className="text-lg font-semibold mb-4">System Alerts</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {alerts.length === 0 ? (
            <div className="text-gray-500 text-center py-4">
              ✅ No active alerts
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded border ${alertColors[alert.level]}`}
              >
                <div className="flex items-start space-x-2">
                  <span>{alertIcons[alert.level]}</span>
                  <div className="flex-1">
                    <div className="font-medium">{alert.message}</div>
                    <div className="text-sm opacity-75">
                      {alert.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg font-medium">Loading Dashboard...</div>
          <ConnectionIndicator />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                🤖 reVoAgent Dashboard
              </h1>
              <p className="text-sm text-gray-600">
                Three-Engine Architecture Real-time Monitoring
              </p>
            </div>
            <ConnectionIndicator />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* System Overview */}
        <SystemOverview metrics={dashboardData.systemMetrics} />

        {/* Engine Status Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {dashboardData.engines.map((engine) => (
            <EngineCard
              key={engine.type}
              engineType={engine.type}
              title={engine.type.replace('_', ' ').toUpperCase()}
              status={engine.status}
              metrics={engine.specificMetrics}
            >
              <EngineMetrics
                engineType={engine.type}
                metrics={engine.metrics}
              />
            </EngineCard>
          ))}
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Engine Status List */}
          <div className="bg-white rounded-lg p-4 shadow">
            <h3 className="text-lg font-semibold mb-4">Engine Status</h3>
            <div className="space-y-3">
              {dashboardData.engines.map((engine) => (
                <EngineStatus
                  key={engine.type}
                  engineType={engine.type}
                  isActive={engine.isActive}
                  performance={engine.performance}
                  lastActivity={engine.lastActivity}
                />
              ))}
            </div>
          </div>

          {/* Alerts Panel */}
          <AlertsPanel alerts={dashboardData.alerts} />
        </div>
      </main>
    </div>
  );
};

export default RealTimeDashboard;