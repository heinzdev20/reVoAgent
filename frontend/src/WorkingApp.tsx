import React, { useState } from 'react';
import { GlassThemeProvider } from './contexts/GlassThemeContext';
import { GlassParticleBackground, GlassFloatingShapes } from './components/GlassParticleBackground';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import { useRealTimeBackend } from './hooks/useRealTimeBackend';
import type { TabId } from './types';

// Working App with real backend integration
const WorkingApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const { isConnected, systemStatus, activities, executeAgent, testAI } = useRealTimeBackend();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="p-8">
            {/* Connection Status */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4 mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-white">🚀 reVoAgent Dashboard</h2>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  <span className="text-white/80">{isConnected ? 'Connected' : 'Disconnected'}</span>
                </div>
              </div>
              <p className="text-white/80 mb-4">Real-time AI agent management platform with DeepSeek integration</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">🤖 Active Agents</h3>
                  <p className="text-2xl font-bold text-green-400">
                    {systemStatus?.agents?.active || 0}
                  </p>
                  <p className="text-sm text-white/60">
                    of {systemStatus?.agents?.total || 0} total
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">🧠 AI Providers</h3>
                  <p className="text-2xl font-bold text-blue-400">
                    {systemStatus?.ai_providers?.length || 0}
                  </p>
                  <p className="text-sm text-white/60">
                    {systemStatus?.ai_providers?.join(', ') || 'Loading...'}
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">⚡ Status</h3>
                  <p className="text-2xl font-bold text-green-400">
                    {systemStatus?.status?.toUpperCase() || 'LOADING'}
                  </p>
                  <p className="text-sm text-white/60">
                    CPU: {systemStatus?.system?.cpu_usage?.toFixed(1) || 0}%
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                <h3 className="text-xl font-bold text-white mb-4">🔄 Real-Time Activity</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {activities.length > 0 ? (
                    activities.map((activity, index) => (
                      <div key={activity.id || index} className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.status === 'success' ? 'bg-green-400' :
                          activity.status === 'warning' ? 'bg-yellow-400' :
                          activity.status === 'error' ? 'bg-red-400' :
                          'bg-blue-400'
                        }`}></div>
                        <div className="flex-1">
                          <span className="text-white/80">{activity.message}</span>
                          <div className="text-xs text-white/50">
                            {new Date(activity.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-white/60 text-center py-4">
                      {isConnected ? 'No recent activity' : 'Connecting to backend...'}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                <h3 className="text-xl font-bold text-white mb-4">⚙️ Live System Metrics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">CPU Usage</span>
                    <span className="text-green-400">
                      {systemStatus?.system?.cpu_usage?.toFixed(1) || '0.0'}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Memory</span>
                    <span className="text-blue-400">
                      {systemStatus?.system?.memory_usage?.toFixed(1) || '0.0'}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Backend</span>
                    <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
                      {isConnected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Uptime</span>
                    <span className="text-purple-400">
                      {systemStatus?.system?.uptime ? 
                        `${Math.floor(systemStatus.system.uptime / 3600)}h ${Math.floor((systemStatus.system.uptime % 3600) / 60)}m` : 
                        '0h 0m'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'projects':
        return (
          <div className="p-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
              <h2 className="text-2xl font-bold text-white mb-4">🗂️ Projects</h2>
              <p className="text-white/80">Project management interface coming soon...</p>
            </div>
          </div>
        );
      case 'workflows':
        return (
          <div className="p-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
              <h2 className="text-2xl font-bold text-white mb-4">🔄 Workflows</h2>
              <p className="text-white/80">Workflow automation interface coming soon...</p>
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div className="p-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
              <h2 className="text-2xl font-bold text-white mb-4">📊 Analytics</h2>
              <p className="text-white/80">Analytics dashboard coming soon...</p>
            </div>
          </div>
        );
      case 'code-generator':
        return (
          <div className="p-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
              <h2 className="text-2xl font-bold text-white mb-4">💻 DeepSeek Code Generator</h2>
              <p className="text-white/80 mb-6">AI-powered code generation with DeepSeek R1</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-white/80 mb-2">Code Request:</label>
                  <textarea 
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 backdrop-blur-sm"
                    placeholder="Describe the code you want to generate..."
                    rows={4}
                    id="code-prompt"
                  />
                </div>
                
                <button 
                  onClick={async () => {
                    const prompt = (document.getElementById('code-prompt') as HTMLTextAreaElement)?.value;
                    if (prompt) {
                      const result = await testAI(prompt, 'code_generation');
                      console.log('Code generation result:', result);
                    }
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-200 backdrop-blur-sm"
                >
                  🚀 Generate Code
                </button>
                
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-2">Status:</h3>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    <span className="text-white/80">
                      {isConnected ? 'DeepSeek AI Ready' : 'Connecting to AI...'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'debug-agent':
        return (
          <div className="p-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
              <h2 className="text-2xl font-bold text-white mb-4">🐛 Debug Agent</h2>
              <p className="text-white/80">Intelligent debugging assistant coming soon...</p>
            </div>
          </div>
        );
      case 'testing-agent':
        return (
          <div className="p-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
              <h2 className="text-2xl font-bold text-white mb-4">🧪 Testing Agent</h2>
              <p className="text-white/80">Automated testing interface coming soon...</p>
            </div>
          </div>
        );
      case 'deploy-agent':
        return (
          <div className="p-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
              <h2 className="text-2xl font-bold text-white mb-4">🚀 Deploy Agent</h2>
              <p className="text-white/80">Deployment automation interface coming soon...</p>
            </div>
          </div>
        );
      case 'browser-agent':
        return (
          <div className="p-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
              <h2 className="text-2xl font-bold text-white mb-4">🌐 Browser Agent</h2>
              <p className="text-white/80">Web automation interface coming soon...</p>
            </div>
          </div>
        );
      case 'security-agent':
        return (
          <div className="p-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
              <h2 className="text-2xl font-bold text-white mb-4">🛡️ Security Agent</h2>
              <p className="text-white/80">Security analysis interface coming soon...</p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="p-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
              <h2 className="text-2xl font-bold text-white mb-4">⚙️ Settings</h2>
              <p className="text-white/80">System configuration interface coming soon...</p>
            </div>
          </div>
        );
      default:
        return (
          <div className="p-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
              <h2 className="text-2xl font-bold text-white mb-4">🚀 reVoAgent Dashboard</h2>
              <p className="text-white/80">Welcome to the comprehensive AI agent management platform</p>
            </div>
          </div>
        );
    }
  };

  return (
    <GlassThemeProvider>
      <div className="min-h-screen relative">
        {/* Background Effects */}
        <GlassParticleBackground />
        <GlassFloatingShapes />
        
        {/* Main Layout */}
        <div className="relative z-10">
          <Header />
          <div className="flex h-screen">
            <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
            <main className="flex-1 overflow-y-auto">
              {renderContent()}
            </main>
          </div>
        </div>
      </div>
    </GlassThemeProvider>
  );
};

export default WorkingApp;