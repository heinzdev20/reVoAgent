/**
 * Enhanced Main Dashboard - Complete UI Integration
 * Responsive layout with enhanced chat, agent grid, and MCP marketplace
 */

import React, { useState, useEffect } from 'react';
import { EnhancedReVoChat } from './chat/EnhancedReVoChat';
import { EnhancedAgentGrid } from './agents/EnhancedAgentGrid';
import { EnhancedMCPMarketplace } from './mcp/EnhancedMCPMarketplace';
import { RealTimeAgentMonitor } from './RealTimeAgentMonitor';
import { ProductionMonitoringDashboard } from './ProductionMonitoringDashboard';
import { useEnhancedWebSocket } from '../hooks/useEnhancedWebSocket';
import { 
  MessageSquare, 
  Users, 
  Package, 
  Activity, 
  BarChart3,
  Settings,
  Maximize2,
  Minimize2,
  Grid3X3,
  Layout,
  Sidebar as SidebarIcon,
  X,
  Home,
  Zap,
  Brain,
  Shield,
  Cloud,
  Code,
  Database,
  Search,
  Bell,
  User,
  Menu
} from 'lucide-react';

type ViewType = 'dashboard' | 'chat' | 'agents' | 'marketplace' | 'monitoring' | 'analytics';

interface NavigationItem {
  id: ViewType;
  name: string;
  icon: React.ReactNode;
  description: string;
  badge?: number;
}

const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: <Home className="w-5 h-5" />,
    description: 'Overview and quick actions'
  },
  {
    id: 'chat',
    name: 'ReVo Chat',
    icon: <MessageSquare className="w-5 h-5" />,
    description: 'AI-powered conversational interface'
  },
  {
    id: 'agents',
    name: 'Agent Grid',
    icon: <Users className="w-5 h-5" />,
    description: '20+ specialized memory-enabled agents',
    badge: 21
  },
  {
    id: 'marketplace',
    name: 'MCP Store',
    icon: <Package className="w-5 h-5" />,
    description: 'Model Context Protocol marketplace'
  },
  {
    id: 'monitoring',
    name: 'Monitoring',
    icon: <Activity className="w-5 h-5" />,
    description: 'Real-time system monitoring'
  },
  {
    id: 'analytics',
    name: 'Analytics',
    icon: <BarChart3 className="w-5 h-5" />,
    description: 'Performance analytics and insights'
  }
];

interface QuickStat {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
  color: string;
}

export const EnhancedMainDashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chatFullscreen, setChatFullscreen] = useState(false);
  const [notifications, setNotifications] = useState<number>(3);
  
  const { isConnected, connectionStatus } = useEnhancedWebSocket();

  // Mock data for dashboard overview
  const [quickStats, setQuickStats] = useState<QuickStat[]>([
    {
      label: 'Active Agents',
      value: '18',
      change: '+2',
      trend: 'up',
      icon: <Users className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      label: 'Tasks Completed',
      value: '1,247',
      change: '+156',
      trend: 'up',
      icon: <Zap className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-500'
    },
    {
      label: 'Memory Usage',
      value: '68%',
      change: '-5%',
      trend: 'down',
      icon: <Brain className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500'
    },
    {
      label: 'Success Rate',
      value: '96.8%',
      change: '+1.2%',
      trend: 'up',
      icon: <Shield className="w-6 h-6" />,
      color: 'from-yellow-500 to-orange-500'
    }
  ]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      default: return '→';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const renderDashboardOverview = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Welcome to reVoAgent</h2>
            <p className="text-gray-300">
              Your AI-powered development platform with memory-enhanced agents and real-time collaboration
            </p>
          </div>
          <div className="text-6xl">🚀</div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <div key={index} className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-white`}>
                {stat.icon}
              </div>
              <div className={`text-sm ${getTrendColor(stat.trend)} flex items-center space-x-1`}>
                <span>{getTrendIcon(stat.trend)}</span>
                <span>{stat.change}</span>
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {[
              { action: 'Code Generator completed task', time: '2 minutes ago', status: 'success' },
              { action: 'Security scan initiated', time: '5 minutes ago', status: 'processing' },
              { action: 'Database optimization finished', time: '12 minutes ago', status: 'success' },
              { action: 'New MCP server installed', time: '1 hour ago', status: 'info' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${
                  activity.status === 'success' ? 'bg-green-400' :
                  activity.status === 'processing' ? 'bg-yellow-400' :
                  'bg-blue-400'
                }`} />
                <div className="flex-1">
                  <div className="text-white text-sm">{activity.action}</div>
                  <div className="text-gray-400 text-xs">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setCurrentView('chat')}
              className="p-4 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg transition-colors group"
            >
              <MessageSquare className="w-6 h-6 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-white text-sm font-medium">Start Chat</div>
            </button>
            <button
              onClick={() => setCurrentView('agents')}
              className="p-4 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg transition-colors group"
            >
              <Users className="w-6 h-6 text-green-400 mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-white text-sm font-medium">View Agents</div>
            </button>
            <button
              onClick={() => setCurrentView('marketplace')}
              className="p-4 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg transition-colors group"
            >
              <Package className="w-6 h-6 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-white text-sm font-medium">MCP Store</div>
            </button>
            <button
              onClick={() => setCurrentView('monitoring')}
              className="p-4 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded-lg transition-colors group"
            >
              <Activity className="w-6 h-6 text-orange-400 mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-white text-sm font-medium">Monitoring</div>
            </button>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-white">WebSocket: {isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <span className="text-white">Memory Engine: Active</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <span className="text-white">Agent Coordinator: Running</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return renderDashboardOverview();
      case 'chat':
        return (
          <EnhancedReVoChat
            isFullscreen={chatFullscreen}
            onToggleFullscreen={() => setChatFullscreen(!chatFullscreen)}
            className="h-[calc(100vh-12rem)]"
          />
        );
      case 'agents':
        return <EnhancedAgentGrid />;
      case 'marketplace':
        return <EnhancedMCPMarketplace />;
      case 'monitoring':
        return <RealTimeAgentMonitor />;
      case 'analytics':
        return <ProductionMonitoringDashboard />;
      default:
        return renderDashboardOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      
      <div className="relative flex h-screen">
        {/* Sidebar */}
        <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 bg-black/20 backdrop-blur-md border-r border-white/10 flex flex-col`}>
          {/* Logo */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                R
              </div>
              {!sidebarCollapsed && (
                <div>
                  <div className="text-white font-bold">reVoAgent</div>
                  <div className="text-xs text-gray-400">AI Development Platform</div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {NAVIGATION_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors ${
                    currentView === item.id
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                  title={sidebarCollapsed ? item.name : undefined}
                >
                  <div className="relative">
                    {item.icon}
                    {item.badge && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {item.badge > 99 ? '99+' : item.badge}
                      </div>
                    )}
                  </div>
                  {!sidebarCollapsed && (
                    <div className="flex-1 text-left">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-gray-400">{item.description}</div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </nav>

          {/* Sidebar Toggle */}
          <div className="p-4 border-t border-white/10">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full flex items-center justify-center p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              {sidebarCollapsed ? <Menu className="w-5 h-5" /> : <SidebarIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-black/20 backdrop-blur-md border-b border-white/10 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-white">
                  {NAVIGATION_ITEMS.find(item => item.id === currentView)?.name || 'Dashboard'}
                </h1>
                <p className="text-sm text-gray-400">
                  {NAVIGATION_ITEMS.find(item => item.id === currentView)?.description}
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Connection Status */}
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                  isConnected ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
                  <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
                </div>

                {/* Notifications */}
                <button className="relative p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                  <Bell className="w-5 h-5" />
                  {notifications > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notifications}
                    </div>
                  )}
                </button>

                {/* User Menu */}
                <button className="flex items-center space-x-2 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white">
                    <User className="w-4 h-4" />
                  </div>
                  {!sidebarCollapsed && <span className="text-sm">User</span>}
                </button>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 overflow-auto p-6">
            {chatFullscreen ? (
              <div className="fixed inset-0 z-50 bg-gray-900">
                <div className="h-full">
                  <EnhancedReVoChat
                    isFullscreen={true}
                    onToggleFullscreen={() => setChatFullscreen(false)}
                    className="h-full"
                  />
                </div>
              </div>
            ) : (
              renderCurrentView()
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default EnhancedMainDashboard;