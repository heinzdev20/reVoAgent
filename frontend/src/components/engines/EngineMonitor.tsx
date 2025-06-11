/**
 * 🎯 Engine Monitor Component
 * 
 * Real-time monitoring dashboard for the Three-Engine Architecture
 * with live WebSocket updates and engine-themed visualizations.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Brain, 
  Zap, 
  Palette, 
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  MemoryStick,
  Cpu
} from 'lucide-react';

// Types for engine data
interface EngineMetrics {
  status: 'active' | 'idle' | 'busy' | 'error' | 'offline';
  uptime_seconds: number;
  cpu_usage_percent: number;
  memory_usage_mb: number;
  requests_per_second: number;
  error_rate: number;
  engine_specific: Record<string, any>;
}

interface EngineData {
  engine: string;
  metrics: EngineMetrics;
  timestamp: string;
}

interface SystemHealth {
  overall_status: 'healthy' | 'warning' | 'degraded' | 'critical';
  engines_online: number;
  engines_total: number;
  alerts: string[];
}

// WebSocket hook for real-time updates
const useWebSocket = (url: string) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);

  useEffect(() => {
    const ws = new WebSocket(url);
    
    ws.onopen = () => {
      setIsConnected(true);
      setSocket(ws);
      
      // Subscribe to all engines
      ws.send(JSON.stringify({type: 'subscribe_engine', data: {engine: 'perfect_recall'}}));
      ws.send(JSON.stringify({type: 'subscribe_engine', data: {engine: 'parallel_mind'}}));
      ws.send(JSON.stringify({type: 'subscribe_engine', data: {engine: 'creative'}}));
      ws.send(JSON.stringify({type: 'subscribe_engine', data: {engine: 'coordinator'}}));
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setLastMessage(message);
    };

    ws.onclose = () => {
      setIsConnected(false);
      setSocket(null);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [url]);

  return { socket, isConnected, lastMessage };
};

// Engine-specific components
const PerfectRecallPanel: React.FC<{ metrics: EngineMetrics }> = ({ metrics }) => {
  const sub100msRate = metrics.engine_specific?.sub_100ms_rate || 0;
  const retrievalLatency = metrics.engine_specific?.retrieval_latency_ms || 0;
  const contextsStored = metrics.engine_specific?.contexts_stored || 0;

  return (
    <Card className="border-blue-500 bg-blue-50 dark:bg-blue-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
          <Brain className="h-5 w-5" />
          🔵 Perfect Recall Engine
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status</span>
          <EngineStatusBadge status={metrics.status} />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Sub-100ms Rate</span>
            <span className={sub100msRate >= 95 ? 'text-green-600' : 'text-red-600'}>
              {sub100msRate.toFixed(1)}%
            </span>
          </div>
          <Progress value={sub100msRate} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-600 dark:text-gray-400">Latency</div>
            <div className={`font-mono ${retrievalLatency < 100 ? 'text-green-600' : 'text-red-600'}`}>
              {retrievalLatency.toFixed(1)}ms
            </div>
          </div>
          <div>
            <div className="text-gray-600 dark:text-gray-400">Contexts</div>
            <div className="font-mono">{contextsStored.toLocaleString()}</div>
          </div>
        </div>

        <SystemMetrics metrics={metrics} />
      </CardContent>
    </Card>
  );
};

const ParallelMindPanel: React.FC<{ metrics: EngineMetrics }> = ({ metrics }) => {
  const activeWorkers = metrics.engine_specific?.active_workers || 0;
  const maxWorkers = metrics.engine_specific?.max_workers || 16;
  const queueLength = metrics.engine_specific?.queue_length || 0;
  const workerUtilization = metrics.engine_specific?.worker_utilization || 0;

  return (
    <Card className="border-purple-500 bg-purple-50 dark:bg-purple-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
          <Zap className="h-5 w-5" />
          🟣 Parallel Mind Engine
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status</span>
          <EngineStatusBadge status={metrics.status} />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Worker Utilization</span>
            <span>{workerUtilization.toFixed(1)}%</span>
          </div>
          <Progress value={workerUtilization} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-600 dark:text-gray-400">Active Workers</div>
            <div className="font-mono">{activeWorkers}/{maxWorkers}</div>
          </div>
          <div>
            <div className="text-gray-600 dark:text-gray-400">Queue Length</div>
            <div className={`font-mono ${queueLength > 50 ? 'text-red-600' : 'text-green-600'}`}>
              {queueLength}
            </div>
          </div>
        </div>

        <SystemMetrics metrics={metrics} />
      </CardContent>
    </Card>
  );
};

const CreativeEnginePanel: React.FC<{ metrics: EngineMetrics }> = ({ metrics }) => {
  const innovationScore = metrics.engine_specific?.avg_innovation_score || 0;
  const solutionsGenerated = metrics.engine_specific?.solutions_generated || 0;
  const generationTime = metrics.engine_specific?.generation_time_ms || 0;

  return (
    <Card className="border-pink-500 bg-pink-50 dark:bg-pink-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-pink-700 dark:text-pink-300">
          <Palette className="h-5 w-5" />
          🩷 Creative Engine
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status</span>
          <EngineStatusBadge status={metrics.status} />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Innovation Score</span>
            <span className={innovationScore >= 0.6 ? 'text-green-600' : 'text-red-600'}>
              {(innovationScore * 100).toFixed(1)}%
            </span>
          </div>
          <Progress value={innovationScore * 100} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-600 dark:text-gray-400">Solutions</div>
            <div className="font-mono">{solutionsGenerated}</div>
          </div>
          <div>
            <div className="text-gray-600 dark:text-gray-400">Gen Time</div>
            <div className="font-mono">{(generationTime / 1000).toFixed(1)}s</div>
          </div>
        </div>

        <SystemMetrics metrics={metrics} />
      </CardContent>
    </Card>
  );
};

const CoordinatorPanel: React.FC<{ metrics: EngineMetrics }> = ({ metrics }) => {
  const coordinationLatency = metrics.engine_specific?.coordination_latency_ms || 0;
  const enginesOnline = metrics.engine_specific?.engines_online || 0;
  const activeWorkflows = metrics.engine_specific?.active_workflows || 0;

  return (
    <Card className="border-green-500 bg-green-50 dark:bg-green-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
          <Settings className="h-5 w-5" />
          🔄 Engine Coordinator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status</span>
          <EngineStatusBadge status={metrics.status} />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-600 dark:text-gray-400">Engines Online</div>
            <div className="font-mono">{enginesOnline}/4</div>
          </div>
          <div>
            <div className="text-gray-600 dark:text-gray-400">Workflows</div>
            <div className="font-mono">{activeWorkflows}</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Coordination Latency</span>
            <span className={coordinationLatency < 5000 ? 'text-green-600' : 'text-red-600'}>
              {coordinationLatency.toFixed(0)}ms
            </span>
          </div>
        </div>

        <SystemMetrics metrics={metrics} />
      </CardContent>
    </Card>
  );
};

// Shared components
const EngineStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig = {
    active: { color: 'bg-green-500', icon: CheckCircle, text: 'Active' },
    idle: { color: 'bg-gray-500', icon: Clock, text: 'Idle' },
    busy: { color: 'bg-blue-500', icon: Activity, text: 'Busy' },
    error: { color: 'bg-red-500', icon: XCircle, text: 'Error' },
    offline: { color: 'bg-gray-400', icon: XCircle, text: 'Offline' }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.offline;
  const Icon = config.icon;

  return (
    <Badge className={`${config.color} text-white`}>
      <Icon className="h-3 w-3 mr-1" />
      {config.text}
    </Badge>
  );
};

const SystemMetrics: React.FC<{ metrics: EngineMetrics }> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-3 gap-2 text-xs">
      <div className="flex items-center gap-1">
        <Cpu className="h-3 w-3" />
        <span>{metrics.cpu_usage_percent.toFixed(1)}%</span>
      </div>
      <div className="flex items-center gap-1">
        <MemoryStick className="h-3 w-3" />
        <span>{(metrics.memory_usage_mb / 1024).toFixed(1)}GB</span>
      </div>
      <div className="flex items-center gap-1">
        <Activity className="h-3 w-3" />
        <span>{metrics.requests_per_second.toFixed(1)}/s</span>
      </div>
    </div>
  );
};

// Main component
const EngineMonitor: React.FC = () => {
  const [engineData, setEngineData] = useState<Record<string, EngineData>>({});
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  const { isConnected, lastMessage } = useWebSocket('ws://localhost:8000/ws/engines');

  useEffect(() => {
    setConnectionStatus(isConnected ? 'connected' : 'disconnected');
  }, [isConnected]);

  useEffect(() => {
    if (lastMessage) {
      if (lastMessage.type === 'engine_metrics') {
        setEngineData(prev => ({
          ...prev,
          [lastMessage.data.engine]: lastMessage.data
        }));
      } else if (lastMessage.type === 'system_alert') {
        setSystemHealth(lastMessage.data);
      }
    }
  }, [lastMessage]);

  // Fetch initial data
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/ws/metrics');
        const data = await response.json();
        
        setSystemHealth(data.system_health);
        
        // Convert engine metrics to expected format
        Object.entries(data.engine_metrics).forEach(([engine, metrics]) => {
          setEngineData(prev => ({
            ...prev,
            [engine]: {
              engine,
              metrics: metrics as EngineMetrics,
              timestamp: data.timestamp || new Date().toISOString()
            }
          }));
        });
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000); // Fallback polling

    return () => clearInterval(interval);
  }, []);

  const renderEnginePanel = (engineName: string, data: EngineData) => {
    switch (engineName) {
      case 'perfect_recall':
        return <PerfectRecallPanel key={engineName} metrics={data.metrics} />;
      case 'parallel_mind':
        return <ParallelMindPanel key={engineName} metrics={data.metrics} />;
      case 'creative':
        return <CreativeEnginePanel key={engineName} metrics={data.metrics} />;
      case 'coordinator':
        return <CoordinatorPanel key={engineName} metrics={data.metrics} />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">🎯 Three-Engine Architecture Monitor</h1>
        <div className="flex items-center gap-2">
          <div className={`h-3 w-3 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-500' : 
            connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
          }`} />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {connectionStatus === 'connected' ? 'Live' : 
             connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* System Health Alerts */}
      {systemHealth?.alerts && systemHealth.alerts.length > 0 && (
        <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              {systemHealth.alerts.map((alert, index) => (
                <div key={index}>{alert}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* System Overview */}
      {systemHealth && (
        <Card>
          <CardHeader>
            <CardTitle>System Health Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{systemHealth.engines_online}/{systemHealth.engines_total}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Engines Online</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${
                  systemHealth.overall_status === 'healthy' ? 'text-green-600' :
                  systemHealth.overall_status === 'warning' ? 'text-yellow-600' :
                  systemHealth.overall_status === 'degraded' ? 'text-orange-600' : 'text-red-600'
                }`}>
                  {systemHealth.overall_status.toUpperCase()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">System Status</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{systemHealth.alerts?.length || 0}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Active Alerts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {Object.keys(engineData).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Monitored Engines</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Engine Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(engineData).map(([engineName, data]) => 
          renderEnginePanel(engineName, data)
        )}
      </div>

      {/* No data state */}
      {Object.keys(engineData).length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Activity className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No Engine Data
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Waiting for engine metrics... Make sure the WebSocket connection is established.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EngineMonitor;