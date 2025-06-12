import React, { useState, useEffect, Suspense, ErrorBoundary } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Core Components
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import RealTimeDashboard from './components/RealTimeDashboard';
import { EnhancedDashboard } from './components/EnhancedDashboard';
import { PlaceholderView } from './components/PlaceholderView';

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

// Theme and Context
import { GlassThemeProvider } from './contexts/GlassThemeContext';
import { GlassParticleBackground, GlassFloatingShapes } from './components/GlassParticleBackground';
import { GlassThemeSettings } from './components/GlassThemeSettings';

// Services and Hooks
import './services/mockApi';
import { useWebSocket } from './hooks/useWebSocket';
import { webSocketService } from './services/websocketService';
import { useAuthStore } from './stores/authStore';
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
  RefreshCw
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
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
      <p className="text-white">Loading reVoAgent...</p>
    </div>
  </div>
);

// Component Registry for Dynamic Loading
const componentRegistry = {
  dashboard: () => import('./components/EnhancedDashboard').then(m => ({ default: m.EnhancedDashboard })),
  'real-time-dashboard': () => import('./components/RealTimeDashboard'),
  projects: () => import('./components/Projects'),
  workflows: () => import('./components/Workflows'),
  analytics: () => import('./components/Analytics'),
  'code-generator': () => import('./components/agents/EnhancedCodeGenerator').then(m => ({ default: m.EnhancedCodeGenerator })),
  'debug-agent': () => import('./components/agents/DebugAgent').then(m => ({ default: m.DebugAgent })),
  'testing-agent': () => import('./components/agents/TestingAgent'),
  'deploy-agent': () => import('./components/agents/DeployAgent'),
  'browser-agent': () => import('./components/agents/BrowserAgent'),
  'security-agent': () => import('./components/agents/SecurityAgent').then(m => ({ default: m.SecurityAgent })),
  'documentation-agent': () => import('./components/agents/DocumentationAgent').then(m => ({ default: m.DocumentationAgent })),
  'performance-optimizer': () => import('./components/agents/PerformanceOptimizerAgent').then(m => ({ default: m.PerformanceOptimizerAgent })),
  'architecture-advisor': () => import('./components/agents/ArchitectureAdvisorAgent').then(m => ({ default: m.ArchitectureAdvisorAgent })),
  'agent-management': () => import('./components/AgentManagement').then(m => ({ default: m.AgentManagement })),
  'model-registry': () => import('./components/ModelRegistry'),
  settings: () => import('./components/Settings'),
  security: () => import('./components/Security'),
  monitoring: () => import('./components/Monitoring'),
  'resource-mgmt': () => import('./components/ResourceManagement'),
  'engine-orchestrator': () => import('./components/engines/EngineOrchestrator').then(m => ({ default: m.EngineOrchestrator })),
  'mcp-marketplace': () => import('./components/mcp/MCPMarketplace').then(m => ({ default: m.MCPMarketplace })),
  'enterprise-console': () => import('./components/enterprise/EnterpriseConsole').then(m => ({ default: m.EnterpriseConsole })),
  'config-manager': () => import('./components/config/ConfigurationManager').then(m => ({ default: m.ConfigurationManager })),
};

// Dynamic Component Loader
const DynamicComponent: React.FC<{ componentKey: string; fallback?: React.ComponentType }> = ({ 
  componentKey, 
  fallback: Fallback = PlaceholderView 
}) => {
  const [Component, setComponent] = useState<React.ComponentType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadComponent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const loader = componentRegistry[componentKey as keyof typeof componentRegistry];
        if (loader) {
          const module = await loader();
          setComponent(() => module.default);
        } else {
          setComponent(() => Fallback);
        }
      } catch (err) {
        console.error(`Failed to load component ${componentKey}:`, err);
        setError(err as Error);
        setComponent(() => Fallback);
      } finally {
        setLoading(false);
      }
    };

    loadComponent();
  }, [componentKey, Fallback]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (error || !Component) {
    return <Fallback />;
  }

  return <Component />;
};

// Main Dashboard Component
const MainDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [showThemeSettings, setShowThemeSettings] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  
  // Environment mode
  const environmentMode = getEnvironmentMode();
  
  // Initialize WebSocket connection with error handling
  useWebSocket();
  
  useEffect(() => {
    const connectWebSocket = async () => {
      try {
        setConnectionStatus('connecting');
        await webSocketService.connect();
        setConnectionStatus('connected');
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
        setConnectionStatus('disconnected');
        
        // Retry connection after 5 seconds
        setTimeout(connectWebSocket, 5000);
      }
    };

    connectWebSocket();
    
    return () => {
      webSocketService.disconnect();
    };
  }, []);

  const renderContent = () => {
    // Use dynamic loading for better performance
    return <DynamicComponent componentKey={activeTab} />;
  };

  const sidebarItems = [
    { id: 'dashboard' as TabId, label: 'Dashboard', icon: BarChart3 },
    { id: 'projects' as TabId, label: 'Projects', icon: FolderOpen },
    { id: 'workflows' as TabId, label: 'Workflows', icon: GitBranch },
    { id: 'analytics' as TabId, label: 'Analytics', icon: BarChart3 },
    
    // Agent section
    { id: 'code-generator' as TabId, label: 'Code Generator', icon: Code2, section: 'Agents' },
    { id: 'debug-agent' as TabId, label: 'Debug Agent', icon: Bug },
    { id: 'testing-agent' as TabId, label: 'Testing Agent', icon: TestTube },
    { id: 'deploy-agent' as TabId, label: 'Deploy Agent', icon: Rocket },
    { id: 'browser-agent' as TabId, label: 'Browser Agent', icon: Globe },
    { id: 'security-agent' as TabId, label: 'Security Agent', icon: Shield },
    { id: 'documentation-agent' as TabId, label: 'Documentation', icon: Database },
    { id: 'performance-optimizer' as TabId, label: 'Performance', icon: Activity },
    { id: 'architecture-advisor' as TabId, label: 'Architecture', icon: Building2 },
    { id: 'agent-management' as TabId, label: 'Agent Management', icon: Brain },
    
    // System section
    { id: 'model-registry' as TabId, label: 'Model Registry', icon: Database, section: 'System' },
    { id: 'monitoring' as TabId, label: 'Monitoring', icon: Activity },
    { id: 'resource-mgmt' as TabId, label: 'Resources', icon: HardDrive },
    { id: 'security' as TabId, label: 'Security', icon: Shield },
    { id: 'settings' as TabId, label: 'Settings', icon: SettingsIcon },
    
    // Advanced features (only in development/enterprise mode)
    ...(environmentMode !== 'minimal' ? [
      { id: 'engine-orchestrator' as TabId, label: 'Engine Orchestrator', icon: Brain, section: 'Advanced' },
      { id: 'mcp-marketplace' as TabId, label: 'MCP Marketplace', icon: Store },
      { id: 'enterprise-console' as TabId, label: 'Enterprise Console', icon: Building2 },
      { id: 'config-manager' as TabId, label: 'Configuration', icon: SettingsIcon },
    ] : [])
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <GlassParticleBackground />
      <GlassFloatingShapes />
      
      {/* Connection Status Indicator */}
      <div className="fixed top-4 right-4 z-50">
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          connectionStatus === 'connected' ? 'bg-green-500/20 text-green-400' :
          connectionStatus === 'connecting' ? 'bg-yellow-500/20 text-yellow-400' :
          'bg-red-500/20 text-red-400'
        }`}>
          {connectionStatus === 'connected' ? '● Connected' :
           connectionStatus === 'connecting' ? '● Connecting...' :
           '● Disconnected'}
        </div>
      </div>
      
      {/* Main Layout */}
      <div className="flex h-screen relative z-10">
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          items={sidebarItems}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header 
            onThemeToggle={() => setShowThemeSettings(!showThemeSettings)}
            environmentMode={environmentMode}
          />
          
          <main className="flex-1 overflow-auto p-6">
            <AppErrorBoundary>
              <Suspense fallback={<LoadingSpinner />}>
                {renderContent()}
              </Suspense>
            </AppErrorBoundary>
          </main>
        </div>
      </div>
      
      {/* Theme Settings Modal */}
      {showThemeSettings && (
        <GlassThemeSettings onClose={() => setShowThemeSettings(false)} />
      )}
    </div>
  );
};

// Authentication Wrapper
const AuthenticatedApp: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuthStore();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    );
  }
  
  return (
    <Router>
      <Routes>
        <Route path="/*" element={
          <ProtectedRoute>
            <MainDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
};

// Main App Component
const UnifiedApp: React.FC = () => {
  const environmentMode = getEnvironmentMode();
  
  // Skip authentication in demo mode
  if (environmentMode === 'demo' || environmentMode === 'minimal') {
    return (
      <GlassThemeProvider>
        <AppErrorBoundary>
          <Router>
            <MainDashboard />
          </Router>
        </AppErrorBoundary>
      </GlassThemeProvider>
    );
  }
  
  return (
    <GlassThemeProvider>
      <AppErrorBoundary>
        <AuthenticatedApp />
      </AppErrorBoundary>
    </GlassThemeProvider>
  );
};

export default UnifiedApp;