import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Core Services
import { apiService } from './services/api';
import type { DashboardStats } from './types';

// Icons
import { 
  FolderOpen, 
  GitBranch, 
  BarChart3,
  Code2,
  Bug,
  TestTube,
  Rocket,
  Globe,
  Database,
  Shield,
  Activity,
  HardDrive,
  Brain,
  Store,
  Building2,
  Settings as SettingsIcon,
  AlertTriangle,
  RefreshCw,
  MessageSquare,
  Users,
  Cpu,
  Zap,
  Menu,
  X,
  Home,
  ChevronRight,
  Circle
} from 'lucide-react';

// Types
type TabId = 'dashboard' | 'agents' | 'chat' | 'projects' | 'workflows' | 'analytics' | 'models' | 'settings' | 'monitoring';

interface NavigationItem {
  id: TabId;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
  badge?: string;
  color: string;
}

// Navigation Configuration
const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    description: 'System overview and metrics',
    color: 'blue'
  },
  {
    id: 'agents',
    label: 'AI Agents',
    icon: Brain,
    description: 'Manage and monitor AI agents',
    badge: '9',
    color: 'purple'
  },
  {
    id: 'chat',
    label: 'Multi-Agent Chat',
    icon: MessageSquare,
    description: 'Interactive agent conversations',
    color: 'green'
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: FolderOpen,
    description: 'Project management and tracking',
    badge: '5',
    color: 'orange'
  },
  {
    id: 'workflows',
    label: 'Workflows',
    icon: GitBranch,
    description: 'Automated workflow management',
    badge: '2',
    color: 'cyan'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    description: 'Performance analytics and insights',
    color: 'pink'
  },
  {
    id: 'models',
    label: 'Model Registry',
    icon: Database,
    description: 'AI model management',
    color: 'indigo'
  },
  {
    id: 'monitoring',
    label: 'Monitoring',
    icon: Activity,
    description: 'System health and monitoring',
    color: 'red'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: SettingsIcon,
    description: 'Application configuration',
    color: 'gray'
  }
];

// Error Boundary Component
class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 max-w-md w-full text-center">
            <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-4">Something went wrong</h1>
            <p className="text-gray-300 mb-6">{this.state.error?.message || 'An unexpected error occurred'}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading Component
const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
      <p className="text-white text-lg">Loading reVoAgent...</p>
    </div>
  </div>
);

// Header Component
const Header: React.FC<{
  activeTab: TabId;
  connectionStatus: 'connecting' | 'connected' | 'disconnected';
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}> = ({ activeTab, connectionStatus, onToggleSidebar, sidebarCollapsed }) => {
  const activeItem = navigationItems.find(item => item.id === activeTab);
  
  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-400';
      case 'disconnected': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return '🟢';
      case 'disconnected': return '🔴';
      default: return '🟡';
    }
  };

  return (
    <header className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white"
          >
            {sidebarCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </button>
          
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-white">🚀 reVoAgent</h1>
            <span className="text-sm text-gray-300">v2.0</span>
          </div>
          
          {activeItem && (
            <div className="hidden md:flex items-center space-x-2 text-gray-300">
              <ChevronRight className="w-4 h-4" />
              <activeItem.icon className="w-4 h-4" />
              <span>{activeItem.label}</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 ${getStatusColor()}`}>
            <span>{getStatusIcon()}</span>
            <span className="text-sm font-medium hidden sm:block">
              {connectionStatus === 'connected' ? 'Connected' : 
               connectionStatus === 'disconnected' ? 'Disconnected' : 'Connecting...'}
            </span>
          </div>
          
          <div className="flex items-center space-x-2 text-gray-300">
            <Users className="w-4 h-4" />
            <span className="text-sm hidden sm:block">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
};

// Sidebar Component
const Sidebar: React.FC<{
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  collapsed: boolean;
}> = ({ activeTab, onTabChange, collapsed }) => {
  return (
    <aside className={`bg-black/20 backdrop-blur-md border-r border-white/10 transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      <nav className="p-4 space-y-2">
        {navigationItems.map((item) => {
          const isActive = activeTab === item.id;
          const IconComponent = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
                isActive
                  ? `bg-${item.color}-600/20 text-${item.color}-400 border border-${item.color}-500/30`
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <IconComponent className={`w-5 h-5 ${isActive ? `text-${item.color}-400` : ''}`} />
              
              {!collapsed && (
                <>
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{item.label}</span>
                      {item.badge && (
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          isActive ? `bg-${item.color}-500/30 text-${item.color}-300` : 'bg-gray-600 text-gray-300'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{item.description}</p>
                  </div>
                </>
              )}
              
              {collapsed && item.badge && (
                <Circle className="w-2 h-2 text-red-400 fill-current" />
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

// Dashboard Component
const DashboardView: React.FC<{ stats: DashboardStats | null }> = ({ stats }) => {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Active Agents</p>
              <p className="text-3xl font-bold text-white">{stats?.agents.active || 0}</p>
              <p className="text-gray-400 text-xs">of {stats?.agents.total || 0} total</p>
            </div>
            <Brain className="w-8 h-8 text-purple-400" />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Active Workflows</p>
              <p className="text-3xl font-bold text-white">{stats?.workflows.active || 0}</p>
              <p className="text-gray-400 text-xs">of {stats?.workflows.total || 0} total</p>
            </div>
            <Zap className="w-8 h-8 text-cyan-400" />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Active Projects</p>
              <p className="text-3xl font-bold text-white">{stats?.projects.active || 0}</p>
              <p className="text-gray-400 text-xs">of {stats?.projects.total || 0} total</p>
            </div>
            <FolderOpen className="w-8 h-8 text-orange-400" />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">System Health</p>
              <p className="text-3xl font-bold text-green-400">Good</p>
              <p className="text-gray-400 text-xs">CPU: {stats?.system.cpu_usage?.toFixed(1) || 0}%</p>
            </div>
            <Activity className="w-8 h-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* System Metrics */}
      {stats?.system && (
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-4">System Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">CPU Usage</span>
                <span className="text-white font-semibold">{stats.system.cpu_usage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(stats.system.cpu_usage, 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">Memory Usage</span>
                <span className="text-white font-semibold">{stats.system.memory_usage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(stats.system.memory_usage, 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">Disk Usage</span>
                <span className="text-white font-semibold">{stats.system.disk_usage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(stats.system.disk_usage, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2">
            <Code2 className="w-5 h-5" />
            <span>Start Code Agent</span>
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>Open Chat</span>
          </button>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2">
            <Rocket className="w-5 h-5" />
            <span>Deploy Project</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Placeholder Views for other tabs
const PlaceholderView: React.FC<{ title: string; icon: React.ComponentType<any>; description: string }> = ({ 
  title, 
  icon: Icon, 
  description 
}) => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 text-center max-w-md">
      <Icon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
      <p className="text-gray-300 mb-6">{description}</p>
      <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
        Coming Soon
      </button>
    </div>
  </div>
);

// Main Content Component
const MainContent: React.FC<{ activeTab: TabId; stats: DashboardStats | null }> = ({ activeTab, stats }) => {
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView stats={stats} />;
      case 'agents':
        return <PlaceholderView title="AI Agents" icon={Brain} description="Manage and monitor your AI agents" />;
      case 'chat':
        return <PlaceholderView title="Multi-Agent Chat" icon={MessageSquare} description="Interactive conversations with AI agents" />;
      case 'projects':
        return <PlaceholderView title="Projects" icon={FolderOpen} description="Project management and tracking" />;
      case 'workflows':
        return <PlaceholderView title="Workflows" icon={GitBranch} description="Automated workflow management" />;
      case 'analytics':
        return <PlaceholderView title="Analytics" icon={BarChart3} description="Performance analytics and insights" />;
      case 'models':
        return <PlaceholderView title="Model Registry" icon={Database} description="AI model management" />;
      case 'monitoring':
        return <PlaceholderView title="Monitoring" icon={Activity} description="System health and monitoring" />;
      case 'settings':
        return <PlaceholderView title="Settings" icon={SettingsIcon} description="Application configuration" />;
      default:
        return <DashboardView stats={stats} />;
    }
  };

  return (
    <main className="flex-1 p-6 overflow-auto">
      {renderContent()}
    </main>
  );
};

// Main App Component
const EnhancedApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let intervalId: NodeJS.Timeout;

    const fetchData = async () => {
      try {
        setError(null);
        
        // Check connection
        const health = await apiService.healthCheck();
        if (mounted) {
          setConnectionStatus(health.status === 'healthy' ? 'connected' : 'disconnected');
        }

        // Fetch dashboard stats
        const dashboardStats = await apiService.getDashboardStats();
        if (mounted) {
          setStats(dashboardStats);
          setIsLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch data');
          setConnectionStatus('disconnected');
          setIsLoading(false);
        }
      }
    };

    // Initial fetch
    fetchData();

    // Set up polling every 30 seconds
    intervalId = setInterval(fetchData, 30000);

    return () => {
      mounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="flex h-screen">
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          collapsed={sidebarCollapsed}
        />
        
        <div className="flex-1 flex flex-col">
          <Header 
            activeTab={activeTab}
            connectionStatus={connectionStatus}
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
            sidebarCollapsed={sidebarCollapsed}
          />
          
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 m-6 mb-0">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-400 mr-3" />
                <div>
                  <h3 className="text-red-400 font-semibold">Connection Error</h3>
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <MainContent activeTab={activeTab} stats={stats} />
        </div>
      </div>
    </div>
  );
};

// App with Error Boundary
const App: React.FC = () => (
  <AppErrorBoundary>
    <EnhancedApp />
  </AppErrorBoundary>
);

export default App;