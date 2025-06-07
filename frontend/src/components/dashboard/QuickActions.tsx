import React from 'react';
import { Code2, RotateCcw, Globe, Bug, Package, TestTube } from 'lucide-react';

interface QuickAction {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}

export function QuickActions() {
  const actions: QuickAction[] = [
    {
      icon: <Code2 className="w-8 h-8" />,
      title: 'Enhanced Code Gen',
      subtitle: 'OpenHands+vLLM',
      onClick: () => alert('🚀 Launching Enhanced Code Generator...\n\nThis would open the code generation interface with OpenHands integration.'),
    },
    {
      icon: <RotateCcw className="w-8 h-8" />,
      title: 'Workflow Auto',
      subtitle: 'Parallel Exec',
      onClick: () => alert('🔄 Opening Workflow Engine...\n\nThis would show the multi-agent workflow orchestration interface.'),
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: 'Browser Agent',
      subtitle: 'Playwright+AI',
      onClick: () => alert('🌐 Starting Browser Agent...\n\nThis would initialize the Playwright + AI browser automation.'),
    },
    {
      icon: <Bug className="w-8 h-8" />,
      title: 'Debug & Fix',
      subtitle: 'Auto Issue Resolve',
      onClick: () => alert('🐛 Initializing Debug Agent...\n\nThis would start the automated debugging and issue resolution system.'),
    },
    {
      icon: <Package className="w-8 h-8" />,
      title: 'Deploy Pipeline',
      subtitle: 'Docker+K8s+Monitor',
      onClick: () => alert('📦 Setting up Deploy Pipeline...\n\nThis would configure Docker + K8s + Monitoring deployment.'),
    },
    {
      icon: <TestTube className="w-8 h-8" />,
      title: 'Test Generation',
      subtitle: 'Comprehensive Tests',
      onClick: () => alert('🧪 Starting Test Generation...\n\nThis would begin comprehensive test suite generation.'),
    },
  ];

  return (
    <div className="metric-card animate-slide-up">
      <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {actions.map((action, index) => (
          <div
            key={index}
            className="quick-action group"
            onClick={action.onClick}
          >
            <div className="text-primary-500 mb-3 group-hover:text-primary-600 transition-colors">
              {action.icon}
            </div>
            <div className="font-medium text-gray-900 mb-1">{action.title}</div>
            <div className="text-sm text-gray-500">{action.subtitle}</div>
          </div>
        ))}
      </div>
    </div>
  );
}