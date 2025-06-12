import React, { useState, useEffect, Suspense, ErrorBoundary } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Enhanced Main Dashboard
import { EnhancedMainDashboard } from './components/EnhancedMainDashboard';

// Core Components
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import RealTimeDashboard from './components/RealTimeDashboard';
import { EnhancedDashboard } from './components/EnhancedDashboard';
import { PlaceholderView } from './components/PlaceholderView';

// ReVo Chat Components
import { ReVoChatDashboard } from './components/ReVoChatDashboard';
import MultiAgentChat from './components/MultiAgentChat';

// Agent Components
import { EnhancedCodeGenerator } from './components/agents/EnhancedCodeGenerator';
import { DebugAgent } from './components/agents/DebugAgent';
import TestingAgent from './components/agents/TestingAgent';
import DeployAgent from './components/agents/DeployAgent';
import BrowserAgent from './components/agents/BrowserAgent';
import { SecurityAgent } from './components/agents/SecurityAgent';
import { DocumentationAgent } from './components/agents/DocumentationAgent';
import { PerformanceOptimizerAgent } from './components/agents/PerformanceOptimizerAgent';
import { ArchitectureAdvisorAgent } from './components/agents/ArchitectureAdvisorAgent';
import { AgentManagement } from './components/AgentManagement';

// Feature Components
import Projects from './components/Projects';
import Workflows from './components/Workflows';
import Analytics from './components/Analytics';
import ModelRegistry from './components/ModelRegistry';
import Settings from './components/Settings';
import Security from './components/Security';
import Monitoring from './components/Monitoring';
import ResourceManagement from './components/ResourceManagement';

// Authentication Components
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Advanced Components
import { EngineOrchestrator } from './components/engines/EngineOrchestrator';
import { MCPMarketplace } from './components/mcp/MCPMarketplace';
import { EnterpriseConsole } from './components/enterprise/EnterpriseConsole';
import { ConfigurationManager } from './components/config/ConfigurationManager';
import ThreeEngineDashboard from './components/ThreeEngineDashboard';

// Theme and Context
import { GlassThemeProvider } from './contexts/GlassThemeContext';
import { GlassParticleBackground, GlassFloatingShapes } from './components/GlassParticleBackground';
import { GlassThemeSettings } from './components/GlassThemeSettings';

// Services and Hooks
import { useWebSocket } from './hooks/useWebSocket';
import { useAuthStore } from './stores/authStore';
import { unifiedWebSocketService } from './services/unifiedWebSocketService';
import type { TabId } from './types';

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
  Zap
} from 'lucide-react';

// Environment Detection
const getEnvironmentMode = (): 'development' | 'production' | 'demo' | 'minimal' => {
  const hostname = window.location.hostname;
  const searchParams = new URLSearchParams(window.location.search);
  
  // Check URL parameters first
  if (searchParams.get('mode')) {
    return searchParams.get('mode') as any;
  }
  
  // Check environment variables
  if (import.meta.env.VITE_APP_MODE) {
    return import.meta.env.VITE_APP_MODE as any;
  }
  
  // Auto-detect based on hostname
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'development';
  }
  
  if (hostname.includes('demo') || hostname.includes('staging')) {
    return 'demo';
  }
  
  return 'production';
};

// Error Boundary Component
class AppErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error; retry: () => void }> },
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
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return (
        <FallbackComponent 
          error={this.state.error!} 
          retry={() => this.setState({ hasError: false, error: null })} 
        />
      );
    }

    return this.props.children;
  }
}

// Default Error Fallback
const DefaultErrorFallback: React.FC<{ error: Error; retry: () => void }> = ({ error, retry }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 max-w-md w-full text-center">
      <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
      <h1 className="text-2xl font-bold text-white mb-4">Something went wrong</h1>
      <p className="text-gray-300 mb-6">{error.message}</p>
      <button
        onClick={retry}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Try Again
      </button>
    </div>
  </div>
);

// Loading Component
const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
      <p className="text-white text-lg">Loading reVoAgent...</p>
    </div>
  </div>
);

// Main App Component
const UnifiedApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [environmentMode] = useState(getEnvironmentMode());
  
  const { isAuthenticated, user, login, logout } = useAuthStore();

  // Initialize WebSocket connection
  useEffect(() => {
    const initializeConnection = async () => {
      try {
        await unifiedWebSocketService.connect();
        setConnectionStatus('connected');
        
        // Subscribe to connection status changes
        unifiedWebSocketService.onConnectionChange((status) => {
          setConnectionStatus(status ? 'connected' : 'disconnected');
        });
        
      } catch (error) {
        console.error('Failed to initialize WebSocket connection:', error);
        setConnectionStatus('disconnected');
      } finally {
        setIsLoading(false);
      }
    };

    initializeConnection();

    return () => {
      unifiedWebSocketService.disconnect();
    };
  }, []);

  // Enhanced navigation items with ReVo Chat and specialized agents
  const navigationItems = [
    { id: 'dashboard' as TabId, label: 'Dashboard', icon: BarChart3, component: EnhancedDashboard },
    { id: 'revo-chat' as TabId, label: 'ReVo Chat AI', icon: MessageSquare, component: ReVoChatDashboard },
    { id: 'three-engines' as TabId, label: 'Three Engines', icon: Cpu, component: ThreeEngineDashboard },
    { id: 'multi-agent-chat' as TabId, label: 'Multi-Agent Chat', icon: Users, component: MultiAgentChat },
    { id: 'agents' as TabId, label: 'Agent Management', icon: Brain, component: AgentManagement },
    { id: 'projects' as TabId, label: 'Projects', icon: FolderOpen, component: Projects },
    { id: 'workflows' as TabId, label: 'Workflows', icon: GitBranch, component: Workflows },
    { id: 'analytics' as TabId, label: 'Analytics', icon: BarChart3, component: Analytics },
    { id: 'models' as TabId, label: 'Model Registry', icon: Database, component: ModelRegistry },
    { id: 'mcp-marketplace' as TabId, label: 'MCP Store', icon: Store, component: MCPMarketplace },
    { id: 'engines' as TabId, label: 'Engine Orchestrator', icon: Zap, component: EngineOrchestrator },
    { id: 'enterprise' as TabId, label: 'Enterprise Console', icon: Building2, component: EnterpriseConsole },
    { id: 'security' as TabId, label: 'Security', icon: Shield, component: Security },
    { id: 'monitoring' as TabId, label: 'Monitoring', icon: Activity, component: Monitoring },
    { id: 'resources' as TabId, label: 'Resources', icon: HardDrive, component: ResourceManagement },
    { id: 'config' as TabId, label: 'Configuration', icon: SettingsIcon, component: ConfigurationManager },
    { id: 'settings' as TabId, label: 'Settings', icon: SettingsIcon, component: Settings },
  ];

  // Specialized Agent Routes
  const agentRoutes = [
    { path: '/agents/code-generator', component: EnhancedCodeGenerator },
    { path: '/agents/debug', component: DebugAgent },
    { path: '/agents/testing', component: TestingAgent },
    { path: '/agents/deploy', component: DeployAgent },
    { path: '/agents/browser', component: BrowserAgent },
    { path: '/agents/security', component: SecurityAgent },
    { path: '/agents/documentation', component: DocumentationAgent },
    { path: '/agents/performance', component: PerformanceOptimizerAgent },
    { path: '/agents/architecture', component: ArchitectureAdvisorAgent },
  ];

  const renderActiveComponent = () => {
    const activeItem = navigationItems.find(item => item.id === activeTab);
    if (activeItem) {
      const Component = activeItem.component;
      return <Component />;
    }
    return <PlaceholderView title={`${activeTab} View`} />;
  };

  // Show loading screen while initializing
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Authentication flow
  if (!isAuthenticated && environmentMode === 'production') {
    return (
      <GlassThemeProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <GlassParticleBackground />
          <Router>
            <Routes>
              <Route path="/login" element={<LoginForm onLogin={login} />} />
              <Route path="/register" element={<RegisterForm />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Router>
        </div>
      </GlassThemeProvider>
    );
  }

  return (
    <AppErrorBoundary>
      <GlassThemeProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <GlassParticleBackground />
            <GlassFloatingShapes />
            
            {/* Connection Status Indicator */}
            <div className={`fixed top-4 right-4 z-50 px-3 py-1 rounded-full text-sm font-medium ${
              connectionStatus === 'connected' 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : connectionStatus === 'connecting'
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {connectionStatus === 'connected' && '🟢 Connected'}
              {connectionStatus === 'connecting' && '🟡 Connecting...'}
              {connectionStatus === 'disconnected' && '🔴 Disconnected'}
            </div>

            <div className="flex h-screen">
              <Sidebar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                collapsed={sidebarCollapsed}
                onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
                navigationItems={navigationItems}
              />
              
              <div className="flex-1 flex flex-col overflow-hidden">
                <Header
                  user={user}
                  onLogout={logout}
                  connectionStatus={connectionStatus}
                  environmentMode={environmentMode}
                />
                
                <main className="flex-1 overflow-auto p-6">
                  <Suspense fallback={<LoadingSpinner />}>
                    <Routes>
                      {/* Enhanced Main Dashboard */}
                      <Route path="/enhanced" element={<EnhancedMainDashboard />} />
                      
                      {/* Main Dashboard Routes */}
                      <Route path="/" element={renderActiveComponent()} />
                      <Route path="/dashboard" element={<EnhancedDashboard />} />
                      <Route path="/revo-chat" element={<ReVoChatDashboard />} />
                      <Route path="/three-engines" element={<ThreeEngineDashboard />} />
                      <Route path="/multi-agent-chat" element={<MultiAgentChat />} />
                      <Route path="/agents" element={<AgentManagement />} />
                      <Route path="/projects" element={<Projects />} />
                      <Route path="/workflows" element={<Workflows />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/models" element={<ModelRegistry />} />
                      <Route path="/mcp-marketplace" element={<MCPMarketplace />} />
                      <Route path="/engines" element={<EngineOrchestrator />} />
                      <Route path="/enterprise" element={<EnterpriseConsole />} />
                      <Route path="/security" element={<Security />} />
                      <Route path="/monitoring" element={<Monitoring />} />
                      <Route path="/resources" element={<ResourceManagement />} />
                      <Route path="/config" element={<ConfigurationManager />} />
                      <Route path="/settings" element={<Settings />} />
                      
                      {/* Specialized Agent Routes */}
                      {agentRoutes.map(({ path, component: Component }) => (
                        <Route key={path} path={path} element={<Component />} />
                      ))}
                      
                      {/* Authentication Routes */}
                      <Route path="/login" element={<LoginForm onLogin={login} />} />
                      <Route path="/register" element={<RegisterForm />} />
                      
                      {/* Fallback */}
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </Suspense>
                </main>
              </div>
            </div>
            
            {/* Theme Settings Panel */}
            <GlassThemeSettings />
          </div>
        </Router>
      </GlassThemeProvider>
    </AppErrorBoundary>
  );
};

export default UnifiedApp;