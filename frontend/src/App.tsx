import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { PlaceholderView } from './components/PlaceholderView';
import { useWebSocket } from './hooks/useWebSocket';
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
  Settings,
  Shield,
  Activity,
  HardDrive
} from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  
  // Initialize WebSocket connection
  useWebSocket();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      
      case 'projects':
        return (
          <PlaceholderView
            title="Projects Management"
            description="Manage your coding projects with AI-powered insights, automated workflows, and collaborative features."
            icon={<FolderOpen className="w-16 h-16 mx-auto text-blue-500" />}
          />
        );
      
      case 'workflows':
        return (
          <PlaceholderView
            title="Workflow Orchestration"
            description="Design and manage complex multi-agent workflows with parallel execution and intelligent coordination."
            icon={<GitBranch className="w-16 h-16 mx-auto text-purple-500" />}
          />
        );
      
      case 'analytics':
        return (
          <PlaceholderView
            title="Analytics & Insights"
            description="Deep analytics on agent performance, code quality metrics, and system optimization insights."
            icon={<BarChart3 className="w-16 h-16 mx-auto text-green-500" />}
          />
        );
      
      case 'code-generator':
        return (
          <PlaceholderView
            title="Enhanced Code Generator"
            description="AI-powered code generation with OpenHands integration, supporting multiple languages and frameworks."
            icon={<Code2 className="w-16 h-16 mx-auto text-blue-600" />}
          />
        );
      
      case 'debug-agent':
        return (
          <PlaceholderView
            title="Debug Agent"
            description="Intelligent debugging agent that automatically identifies, analyzes, and fixes code issues."
            icon={<Bug className="w-16 h-16 mx-auto text-red-500" />}
          />
        );
      
      case 'testing-agent':
        return (
          <PlaceholderView
            title="Testing Agent"
            description="Comprehensive test generation and execution with coverage analysis and quality assurance."
            icon={<TestTube className="w-16 h-16 mx-auto text-cyan-500" />}
          />
        );
      
      case 'deploy-agent':
        return (
          <PlaceholderView
            title="Deploy Agent"
            description="Automated deployment pipelines with Docker, Kubernetes, and monitoring integration."
            icon={<Rocket className="w-16 h-16 mx-auto text-orange-500" />}
          />
        );
      
      case 'browser-agent':
        return (
          <PlaceholderView
            title="Browser Agent"
            description="Playwright-powered browser automation with AI-driven web interaction and testing capabilities."
            icon={<Globe className="w-16 h-16 mx-auto text-indigo-500" />}
          />
        );
      
      case 'model-registry':
        return (
          <PlaceholderView
            title="Model Registry"
            description="Manage AI models with performance tracking, auto-quantization, and resource optimization."
            icon={<Database className="w-16 h-16 mx-auto text-violet-500" />}
          />
        );
      
      case 'settings':
        return (
          <PlaceholderView
            title="Settings"
            description="Configure system preferences, integrations, and personalization options."
            icon={<Settings className="w-16 h-16 mx-auto text-gray-500" />}
          />
        );
      
      case 'security':
        return (
          <PlaceholderView
            title="Security Center"
            description="Security monitoring, access control, and compliance management for your AI platform."
            icon={<Shield className="w-16 h-16 mx-auto text-emerald-500" />}
          />
        );
      
      case 'monitoring':
        return (
          <PlaceholderView
            title="System Monitoring"
            description="Real-time monitoring with Grafana dashboards, Prometheus metrics, and alerting."
            icon={<Activity className="w-16 h-16 mx-auto text-pink-500" />}
          />
        );
      
      case 'resource-mgmt':
        return (
          <PlaceholderView
            title="Resource Management"
            description="Optimize system resources, manage GPU allocation, and monitor performance metrics."
            icon={<HardDrive className="w-16 h-16 mx-auto text-yellow-500" />}
          />
        );
      
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