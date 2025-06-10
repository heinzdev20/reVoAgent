import React from 'react';
import { 
  LayoutDashboard, 
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
  HardDrive,
  CheckCircle,
  Circle,
  Brain,
  Store,
  Building2,
  Cog,
  Zap
} from 'lucide-react';
import { cn } from '@/utils/cn';
import type { TabId } from '@/types';

interface SidebarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  className?: string;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

interface SidebarItem {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
  status?: 'active' | 'connected' | 'idle';
}

const sidebarSections: SidebarSection[] = [
  {
    title: 'WORKSPACE',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, status: 'active' },
      { id: 'projects', label: 'Projects', icon: <FolderOpen className="w-4 h-4" />, badge: 42 },
      { id: 'workflows', label: 'Workflows', icon: <GitBranch className="w-4 h-4" /> },
      { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    ],
  },
  {
    title: 'AI ENGINES',
    items: [
      { id: 'engine-orchestrator', label: 'Engine Orchestrator', icon: <Brain className="w-4 h-4" />, status: 'active' },
      { id: 'realtime-dashboard', label: 'Real-Time Dashboard', icon: <Zap className="w-4 h-4" />, status: 'active', badge: 'LIVE' },
      { id: 'code-generator', label: 'Code Generator', icon: <Code2 className="w-4 h-4" />, status: 'active' },
      { id: 'debug-agent', label: 'Debug Agent', icon: <Bug className="w-4 h-4" /> },
      { id: 'testing-agent', label: 'Testing Agent', icon: <TestTube className="w-4 h-4" /> },
      { id: 'deploy-agent', label: 'Deploy Agent', icon: <Rocket className="w-4 h-4" /> },
      { id: 'browser-agent', label: 'Browser Agent', icon: <Globe className="w-4 h-4" /> },
    ],
  },
  {
    title: 'ENTERPRISE',
    items: [
      { id: 'enterprise-console', label: 'Enterprise Console', icon: <Building2 className="w-4 h-4" />, badge: 'NEW' },
      { id: 'mcp-marketplace', label: 'MCP Marketplace', icon: <Store className="w-4 h-4" />, badge: '100+' },
      { id: 'configuration', label: 'Configuration', icon: <Cog className="w-4 h-4" /> },
      { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { id: 'model-registry', label: 'Model Registry', icon: <Database className="w-4 h-4" /> },
      { id: 'monitoring', label: 'Monitoring', icon: <Activity className="w-4 h-4" /> },
      { id: 'resource-mgmt', label: 'Resource Mgmt', icon: <HardDrive className="w-4 h-4" /> },
      { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
    ],
  },
];

const integrations = [
  { name: 'OpenHands', status: 'connected' },
  { name: 'vLLM Server', status: 'connected' },
  { name: 'Docker Orch', status: 'connected' },
  { name: 'All-Hands', status: 'connected' },
  { name: 'Monitoring', status: 'connected' },
];

export function Sidebar({ activeTab, onTabChange, className }: SidebarProps) {
  const renderStatusIndicator = (status?: string) => {
    if (status === 'active') {
      return <Circle className="w-2 h-2 fill-blue-500 text-blue-500" />;
    }
    return null;
  };

  const renderBadge = (badge?: string | number) => {
    if (!badge) return null;
    return (
      <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs">
        [{badge}]
      </span>
    );
  };

  return (
    <aside className={cn(
      "w-64 bg-white shadow-lg border-r border-gray-200 overflow-y-auto",
      className
    )}>
      {/* Sidebar Sections */}
      {sidebarSections.map((section, sectionIndex) => (
        <div key={section.title} className={cn(
          "p-4",
          sectionIndex < sidebarSections.length - 1 && "border-b border-gray-200"
        )}>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            {section.title}
          </h3>
          <nav className="space-y-1">
            {section.items.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "sidebar-item flex items-center space-x-2",
                  activeTab === item.id ? "sidebar-item-active" : "sidebar-item-inactive"
                )}
              >
                {renderStatusIndicator(item.status)}
                {item.icon}
                <span className="flex-1 text-left">{item.label}</span>
                {renderBadge(item.badge)}
              </button>
            ))}
          </nav>
        </div>
      ))}

      {/* Integrations Section */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          INTEGRATIONS
        </h3>
        <nav className="space-y-1">
          {integrations.map((integration) => (
            <div key={integration.name} className="flex items-center justify-between px-3 py-2 text-sm">
              <span className="text-gray-700">{integration.name}</span>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}