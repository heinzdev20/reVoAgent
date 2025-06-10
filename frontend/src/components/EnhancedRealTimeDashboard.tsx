// frontend/src/components/EnhancedRealTimeDashboard.tsx
/**
 * Enhanced Real-Time Dashboard with Real AI Integration
 * Replaces mock data with actual AI and agent execution data
 */

import React, { useState, useEffect } from 'react';
import { 
  realTimeAPI, 
  DashboardStats, 
  Activity 
} from '../services/realTimeApi';
import { useAITesting } from '../hooks/useRealTimeAgent';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { 
  Brain, 
  Zap, 
  Activity as ActivityIcon, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  TrendingUp,
  Users,
  Server,
  Cpu,
  MemoryStick,
  Wifi,
  WifiOff,
  Play,
  Loader2
} from 'lucide-react';

export function EnhancedRealTimeDashboard() {
  // State for dashboard data
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // WebSocket for real-time updates
  const [ws, setWs] = useState<WebSocket | null>(null);

  // AI Testing hook
  const { isLoading: aiTesting, result: aiTestResult, testAI, testDeepSeek } = useAITesting();

  // AI Test states
  const [testPrompt, setTestPrompt] = useState('Generate a Python function that calculates the factorial of a number');
  const [selectedProvider, setSelectedProvider] = useState<string>('');

  // Load initial data
  useEffect(() => {
    loadDashboardData();
    loadRecentActivity();
    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      const stats = await realTimeAPI.getDashboardStats();
      setDashboardStats(stats);
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard data error:', err);
    }
  };

  const loadRecentActivity = async () => {
    try {
      const activity = await realTimeAPI.getRecentActivity();
      setRecentActivity(activity.activities);
    } catch (err) {
      console.error('Activity data error:', err);
    }
  };

  const connectWebSocket = () => {
    try {
      const websocket = realTimeAPI.connectToDashboard(
        (data) => {
          console.log('Dashboard WebSocket update:', data);
          
          if (data.type === 'dashboard_update') {
            // Update dashboard stats from WebSocket
            setDashboardStats(prev => prev ? {
              ...prev,
              agents: data.agents,
              ai: { ...prev.ai, ...data.ai_status },
              performance: {
                ...prev.performance,
                websocket_connections: data.active_tasks || prev.performance.websocket_connections
              }
            } : null);
            
            setLastUpdate(new Date());
          }
          
          setIsConnected(true);
        },
        (error) => {
          console.error('WebSocket error:', error);
          setIsConnected(false);
        }
      );

      websocket.onopen = () => {
        setIsConnected(true);
        setError(null);
      };

      websocket.onclose = () => {
        setIsConnected(false);
        // Attempt to reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000);
      };

      setWs(websocket);
    } catch (err) {
      setError('Failed to connect WebSocket');
      setIsConnected(false);
    }
  };

  const handleAITest = async () => {
    try {
      await testAI(testPrompt, 'code_generation', selectedProvider || undefined);
    } catch (err) {
      console.error('AI test failed:', err);
    }
  };

  const handleDeepSeekTest = async (mode: 'generate' | 'reasoning' | 'creative') => {
    try {
      await testDeepSeek(testPrompt, mode);
    } catch (err) {
      console.error('DeepSeek test failed:', err);
    }
  };

  const refreshData = () => {
    loadDashboardData();
    loadRecentActivity();
  };

  if (!dashboardStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Real-Time AI Dashboard</h1>
          <p className="text-gray-600">
            Live monitoring with actual AI integration
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge variant={isConnected ? "success" : "destructive"}>
            {isConnected ? (
              <>
                <Wifi className="w-4 h-4 mr-1" />
                Live Connected
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 mr-1" />
                Disconnected
              </>
            )}
          </Badge>
          
          {lastUpdate && (
            <span className="text-sm text-gray-500">
              Last update: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          
          <Button onClick={refreshData} variant="outline" size="sm">
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* System Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {dashboardStats.system.status.toUpperCase()}
            </div>
            <p className="text-xs text-muted-foreground">
              Uptime: {dashboardStats.system.uptime}
            </p>
            <p className="text-xs text-muted-foreground">
              Version: {dashboardStats.system.version}
            </p>
          </CardContent>
        </Card>

        {/* AI Providers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Providers</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardStats.ai.providers_available}
            </div>
            <p className="text-xs text-muted-foreground">
              Default: {dashboardStats.ai.default_provider}
            </p>
            <div className="flex gap-1 mt-2">
              {Object.entries(dashboardStats.ai.provider_status).map(([provider, status]) => (
                <Badge 
                  key={provider} 
                  variant={(status as any).available ? "success" : "secondary"}
                  className="text-xs"
                >
                  {provider}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Agents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardStats.agents.total_active}
            </div>
            <p className="text-xs text-muted-foreground">
              Completed: {dashboardStats.agents.total_completed}
            </p>
            <p className="text-xs text-green-600">
              Success rate: {(dashboardStats.agents.success_rate * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        {/* Performance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardStats.performance.response_time}
            </div>
            <p className="text-xs text-muted-foreground">
              Memory: {dashboardStats.performance.memory_usage}
            </p>
            <p className="text-xs text-muted-foreground">
              CPU: {dashboardStats.performance.cpu_usage}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Testing Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Live AI Testing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Test Prompt</label>
            <textarea
              value={testPrompt}
              onChange={(e) => setTestPrompt(e.target.value)}
              className="w-full border rounded-md px-3 py-2 h-20"
              placeholder="Enter your AI test prompt..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Provider (Optional)</label>
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="border rounded-md px-3 py-2"
            >
              <option value="">Auto-select</option>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="local">Local Model</option>
            </select>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={handleAITest}
              disabled={aiTesting || !testPrompt.trim()}
              className="flex items-center gap-2"
            >
              {aiTesting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              Test AI
            </Button>
            
            <Button 
              onClick={() => handleDeepSeekTest('reasoning')}
              disabled={aiTesting}
              variant="outline"
            >
              DeepSeek Reasoning
            </Button>
            
            <Button 
              onClick={() => handleDeepSeekTest('creative')}
              disabled={aiTesting}
              variant="outline"
            >
              DeepSeek Creative
            </Button>
          </div>
          
          {/* AI Test Results */}
          {aiTestResult && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <h4 className="font-medium mb-2">AI Response</h4>
              <pre className="text-sm whitespace-pre-wrap overflow-x-auto">
                {JSON.stringify(aiTestResult, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Real-Time Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ActivityIcon className="w-5 h-5" />
              Recent Agent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-md">
                    <div className="flex-shrink-0">
                      {activity.status === 'success' || activity.type === 'agent_execution' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : activity.status === 'failed' ? (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      ) : (
                        <Clock className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-500">
                          {new Date(activity.timestamp).toLocaleTimeString()}
                        </span>
                        {activity.agent_type && (
                          <Badge variant="outline" className="text-xs">
                            {activity.agent_type}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">
                  No recent activity
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Resources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="w-5 h-5" />
              System Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* CPU Usage */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>CPU Usage</span>
                  <span>{dashboardStats.performance.cpu_usage}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: dashboardStats.performance.cpu_usage }}
                  />
                </div>
              </div>

              {/* Memory Usage */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Memory Usage</span>
                  <span>{dashboardStats.performance.memory_usage}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: dashboardStats.performance.memory_usage }}
                  />
                </div>
              </div>

              {/* WebSocket Connections */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Active Connections</span>
                  <span>{dashboardStats.performance.websocket_connections}</span>
                </div>
                <div className="text-xs text-gray-600">
                  Real-time WebSocket connections
                </div>
              </div>

              {/* Response Time */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Avg Response Time</span>
                  <span>{dashboardStats.performance.response_time}</span>
                </div>
                <div className="text-xs text-gray-600">
                  Average API response time
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
