/**
 * ReVo Chat Dashboard - Enhanced Dashboard with Integrated Chat Interface
 * The main dashboard component that includes the ReVo AI Chat Interface
 */

import React, { useState, useEffect } from 'react';
import { ReVoChat } from './chat/ReVoChat';
import { 
  realTimeAPI, 
  DashboardStats, 
  Activity 
} from '../services/realTimeApi';
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
  MessageSquare,
  Maximize2,
  Minimize2,
  Grid3X3,
  Layout
} from 'lucide-react';

interface ReVoChatDashboardProps {
  className?: string;
}

export const ReVoChatDashboard: React.FC<ReVoChatDashboardProps> = ({ className = '' }) => {
  // Dashboard state
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Layout state
  const [chatFullscreen, setChatFullscreen] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [layoutMode, setLayoutMode] = useState<'split' | 'chat-primary' | 'dashboard-primary'>('split');

  // WebSocket for dashboard updates
  const [ws, setWs] = useState<WebSocket | null>(null);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // WebSocket connection for real-time updates
  useEffect(() => {
    connectWebSocket();
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      const [stats, activities] = await Promise.all([
        realTimeAPI.getDashboardStats(),
        realTimeAPI.getRecentActivity()
      ]);
      
      setDashboardStats(stats);
      setRecentActivity(activities);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard data loading error:', err);
    }
  };

  const connectWebSocket = () => {
    try {
      const wsUrl = `ws://localhost:8000/ws/dashboard`;
      const websocket = new WebSocket(wsUrl);
      
      websocket.onopen = () => {
        setIsConnected(true);
        setError(null);
      };
      
      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (err) {
          console.error('WebSocket message parsing error:', err);
        }
      };
      
      websocket.onclose = () => {
        setIsConnected(false);
        // Attempt to reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000);
      };
      
      websocket.onerror = (error) => {
        setError('WebSocket connection error');
        setIsConnected(false);
      };
      
      setWs(websocket);
    } catch (err) {
      setError('Failed to establish WebSocket connection');
    }
  };

  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'stats_update':
        setDashboardStats(data.stats);
        break;
      case 'activity_update':
        setRecentActivity(prev => [data.activity, ...prev.slice(0, 9)]);
        break;
      case 'system_status':
        setIsConnected(data.connected);
        break;
      default:
        console.log('Unknown WebSocket message type:', data.type);
    }
    setLastUpdate(new Date());
  };

  const toggleChatFullscreen = () => {
    setChatFullscreen(!chatFullscreen);
  };

  const toggleChat = () => {
    setShowChat(!showChat);
  };

  const changeLayoutMode = (mode: 'split' | 'chat-primary' | 'dashboard-primary') => {
    setLayoutMode(mode);
  };

  const getLayoutClasses = () => {
    if (chatFullscreen) {
      return 'grid grid-cols-1';
    }
    
    switch (layoutMode) {
      case 'chat-primary':
        return 'grid grid-cols-1 lg:grid-cols-3 gap-6';
      case 'dashboard-primary':
        return 'grid grid-cols-3 lg:grid-cols-4 gap-6';
      case 'split':
      default:
        return 'grid grid-cols-1 lg:grid-cols-2 gap-6';
    }
  };

  const getChatClasses = () => {
    if (chatFullscreen) {
      return 'col-span-full';
    }
    
    switch (layoutMode) {
      case 'chat-primary':
        return 'col-span-1 lg:col-span-2';
      case 'dashboard-primary':
        return 'col-span-1';
      case 'split':
      default:
        return 'col-span-1';
    }
  };

  const getDashboardClasses = () => {
    if (chatFullscreen) {
      return 'hidden';
    }
    
    switch (layoutMode) {
      case 'chat-primary':
        return 'col-span-1';
      case 'dashboard-primary':
        return 'col-span-2 lg:col-span-3';
      case 'split':
      default:
        return 'col-span-1';
    }
  };

  const renderDashboardStats = () => {
    if (!dashboardStats) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-700 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Active Agents</p>
                <p className="text-2xl font-bold text-white">{dashboardStats.activeAgents}</p>
              </div>
              <Users className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Tasks Completed</p>
                <p className="text-2xl font-bold text-white">{dashboardStats.tasksCompleted}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">System Load</p>
                <p className="text-2xl font-bold text-white">{dashboardStats.systemLoad}%</p>
              </div>
              <Cpu className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Memory Usage</p>
                <p className="text-2xl font-bold text-white">{dashboardStats.memoryUsage}%</p>
              </div>
              <MemoryStick className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderRecentActivity = () => {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <ActivityIcon className="w-5 h-5 mr-2" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No recent activity</p>
            ) : (
              recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'success' ? 'bg-green-400' :
                    activity.type === 'error' ? 'bg-red-400' :
                    activity.type === 'warning' ? 'bg-yellow-400' :
                    'bg-blue-400'
                  }`} />
                  <div className="flex-1">
                    <p className="text-white text-sm">{activity.message}</p>
                    <p className="text-gray-400 text-xs">{activity.timestamp}</p>
                  </div>
                  <Badge variant={activity.type === 'success' ? 'default' : 'destructive'}>
                    {activity.agent}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={`min-h-screen bg-gray-900 text-white p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold">ReVo AI Dashboard</h1>
          <div className={`flex items-center space-x-2 ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
            {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            <span className="text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
          {lastUpdate && (
            <div className="text-sm text-gray-400">
              Last update: {lastUpdate.toLocaleTimeString()}
            </div>
          )}
        </div>

        {/* Layout Controls */}
        <div className="flex items-center space-x-2">
          <Button
            variant={layoutMode === 'split' ? 'default' : 'outline'}
            size="sm"
            onClick={() => changeLayoutMode('split')}
            title="Split View"
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          
          <Button
            variant={layoutMode === 'chat-primary' ? 'default' : 'outline'}
            size="sm"
            onClick={() => changeLayoutMode('chat-primary')}
            title="Chat Primary"
          >
            <MessageSquare className="w-4 h-4" />
          </Button>
          
          <Button
            variant={layoutMode === 'dashboard-primary' ? 'default' : 'outline'}
            size="sm"
            onClick={() => changeLayoutMode('dashboard-primary')}
            title="Dashboard Primary"
          >
            <Layout className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={toggleChat}
            title={showChat ? 'Hide Chat' : 'Show Chat'}
          >
            <MessageSquare className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={getLayoutClasses()}>
        {/* Chat Interface */}
        {showChat && (
          <div className={getChatClasses()}>
            <Card className="bg-gray-800 border-gray-700 h-[calc(100vh-200px)]">
              <ReVoChat
                className="h-full"
                isFullscreen={chatFullscreen}
                onToggleFullscreen={toggleChatFullscreen}
                wsUrl="ws://localhost:8000/ws/revo"
              />
            </Card>
          </div>
        )}

        {/* Dashboard Content */}
        <div className={getDashboardClasses()}>
          <div className="space-y-6">
            {/* Stats Cards */}
            {renderDashboardStats()}

            {/* Recent Activity */}
            {renderRecentActivity()}

            {/* System Status */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Server className="w-5 h-5 mr-2" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">99.9%</div>
                    <div className="text-sm text-gray-400">Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">42ms</div>
                    <div className="text-sm text-gray-400">Avg Response</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">3</div>
                    <div className="text-sm text-gray-400">Active Engines</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button variant="outline" className="h-auto py-3 flex flex-col items-center space-y-2">
                    <Brain className="w-6 h-6" />
                    <span className="text-xs">Test AI</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-3 flex flex-col items-center space-y-2">
                    <Users className="w-6 h-6" />
                    <span className="text-xs">Manage Agents</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-3 flex flex-col items-center space-y-2">
                    <TrendingUp className="w-6 h-6" />
                    <span className="text-xs">Analytics</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-3 flex flex-col items-center space-y-2">
                    <Server className="w-6 h-6" />
                    <span className="text-xs">System Logs</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};