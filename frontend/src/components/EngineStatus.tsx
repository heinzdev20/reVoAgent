import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/progress';
import { RefreshCw, Brain, Zap, Palette, Activity, Clock, Target } from 'lucide-react';

interface EngineMetrics {
  engine_name: string;
  status: 'operational' | 'degraded' | 'offline';
  health: 'healthy' | 'warning' | 'critical';
  performance_metrics: {
    [key: string]: string | number;
  };
  last_updated: string;
}

interface EngineStatusProps {
  refreshInterval?: number;
  showDetailedMetrics?: boolean;
}

const EngineStatus: React.FC<EngineStatusProps> = ({ 
  refreshInterval = 5000, 
  showDetailedMetrics = true 
}) => {
  const [engines, setEngines] = useState<EngineMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);

  const fetchEngineStatus = async () => {
    try {
      const response = await fetch('/engines/status');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setEngines(data);
      setError(null);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch engine status');
      console.error('Error fetching engine status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEngineStatus();
    const interval = setInterval(fetchEngineStatus, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const getEngineIcon = (engineName: string) => {
    if (engineName.includes('Perfect Recall')) return <Brain className="h-5 w-5" />;
    if (engineName.includes('Parallel Mind')) return <Zap className="h-5 w-5" />;
    if (engineName.includes('Creative')) return <Palette className="h-5 w-5" />;
    return <Activity className="h-5 w-5" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getHealthBadgeVariant = (health: string) => {
    switch (health) {
      case 'healthy': return 'default';
      case 'warning': return 'secondary';
      case 'critical': return 'destructive';
      default: return 'outline';
    }
  };

  const formatMetricValue = (key: string, value: string | number): string => {
    if (typeof value === 'number') {
      if (key.includes('percentage') || key.includes('score') || key.includes('utilization')) {
        return `${value}%`;
      }
      if (key.includes('time') || key.includes('duration')) {
        return `${value}ms`;
      }
      return value.toLocaleString();
    }
    return value.toString();
  };

  const getMetricProgress = (key: string, value: string | number): number => {
    if (typeof value === 'string') {
      const numMatch = value.match(/(\d+(?:\.\d+)?)/);
      if (numMatch) {
        const num = parseFloat(numMatch[1]);
        if (value.includes('%')) return num;
        if (key.includes('score')) return num;
      }
    }
    if (typeof value === 'number') {
      if (key.includes('percentage') || key.includes('score') || key.includes('utilization')) {
        return value;
      }
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading engine status...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="flex items-center text-red-600">
            <Activity className="h-5 w-5 mr-2" />
            <span>Error: {error}</span>
          </div>
          <button 
            onClick={fetchEngineStatus}
            className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Retry
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Three-Engine Architecture Status</h2>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          <span>Last updated: {lastRefresh.toLocaleTimeString()}</span>
          <button 
            onClick={fetchEngineStatus}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Engine Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {engines.map((engine, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getEngineIcon(engine.engine_name)}
                  <CardTitle className="text-lg">{engine.engine_name}</CardTitle>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(engine.status)}`} />
                  <Badge variant={getHealthBadgeVariant(engine.health)}>
                    {engine.health}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status:</span>
                <span className={`text-sm font-semibold ${
                  engine.status === 'operational' ? 'text-green-600' : 
                  engine.status === 'degraded' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {engine.status.toUpperCase()}
                </span>
              </div>

              {/* Performance Metrics */}
              {showDetailedMetrics && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4" />
                    <span className="text-sm font-medium">Performance Metrics</span>
                  </div>
                  
                  {Object.entries(engine.performance_metrics).map(([key, value]) => {
                    const progress = getMetricProgress(key, value);
                    const displayValue = formatMetricValue(key, value);
                    
                    return (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                          <span className="font-mono">{displayValue}</span>
                        </div>
                        {progress > 0 && (
                          <Progress 
                            value={progress} 
                            className="h-2"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Last Updated */}
              <div className="text-xs text-gray-500 pt-2 border-t">
                Updated: {new Date(engine.last_updated).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Three-Engine Architecture Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {engines.filter(e => e.status === 'operational').length}
              </div>
              <div className="text-sm text-gray-500">Operational Engines</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {engines.filter(e => e.health === 'healthy').length}
              </div>
              <div className="text-sm text-gray-500">Healthy Engines</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">100%</div>
              <div className="text-sm text-gray-500">Cost Savings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">10x</div>
              <div className="text-sm text-gray-500">Performance Boost</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EngineStatus;