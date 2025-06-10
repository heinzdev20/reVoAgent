import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import RealTimeDashboard from './components/RealTimeDashboard';
import { PlaceholderView } from './components/PlaceholderView';
import { FixedCodeGenerator } from './components/agents/FixedCodeGenerator';
import { DebugAgent } from './components/agents/DebugAgent';
import TestingAgent from './components/agents/TestingAgent';
import DeployAgent from './components/agents/DeployAgent';
import BrowserAgent from './components/agents/BrowserAgent';
import { SecurityAgent } from './components/agents/SecurityAgent';
import { DocumentationAgent } from './components/agents/DocumentationAgent';
import { AgentManagement } from './components/AgentManagement';
import Projects from './components/Projects';
import Workflows from './components/Workflows';
import Analytics from './components/Analytics';
import ModelRegistry from './components/ModelRegistry';
import Settings from './components/Settings';
import Security from './components/Security';
import Monitoring from './components/Monitoring';
import ResourceManagement from './components/ResourceManagement';

// New comprehensive components
import { EngineOrchestrator } from './components/engines/EngineOrchestrator';
import { MCPMarketplace } from './components/mcp/MCPMarketplace';
import { EnterpriseConsole } from './components/enterprise/EnterpriseConsole';
import { ConfigurationManager } from './components/config/ConfigurationManager';

import { useWebSocket } from './hooks/useWebSocket';
import { webSocketService } from './services/websocketService';
import type { TabId } from './types';
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
  Settings as SettingsIcon
} from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  
  // Initialize WebSocket connection
  useWebSocket();
  
  // Initialize WebSocket service
  useEffect(() => {
    webSocketService.connect().catch((error) => {
      console.error('Failed to connect WebSocket:', error);
    });
    
    return () => {
      webSocketService.disconnect();
    };
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <RealTimeDashboard />;
      
      case 'projects':
        return <Projects />;
      
      case 'workflows':
        return <Workflows />;
      
      case 'analytics':
        return <Analytics />;
      
      case 'code-generator':
        return <FixedCodeGenerator />;
      
      case 'debug-agent':
        return <DebugAgent />;
      
      case 'testing-agent':
        return <TestingAgent />;
      
      case 'deploy-agent':
        return <DeployAgent />;
      
      case 'browser-agent':
        return <BrowserAgent />;
      
      case 'security-agent':
        return <SecurityAgent />;
      
      case 'documentation-agent':
        return <DocumentationAgent />;
      
      case 'agent-management':
        return <AgentManagement />;
      
      case 'model-registry':
        return <ModelRegistry />;
      
      case 'settings':
        return <Settings />;
      
      case 'security':
        return <Security />;
      
      case 'monitoring':
        return <Monitoring />;
      
      case 'resource-mgmt':
        return <ResourceManagement />;

      // New comprehensive features
      case 'engine-orchestrator':
        return <EngineOrchestrator />;
      
      case 'mcp-marketplace':
        return <MCPMarketplace />;
      
      case 'enterprise-console':
        return <EnterpriseConsole />;
      
      case 'configuration':
        return <ConfigurationManager />;
      
      case 'realtime-dashboard':
        return <RealTimeDashboard />;
      
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex h-screen">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;