import React, { useState } from 'react';
import { GlassThemeProvider } from './contexts/GlassThemeContext';
import { GlassParticleBackground, GlassFloatingShapes } from './components/GlassParticleBackground';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
// import Dashboard from './components/Dashboard';
import type { TabId } from './types';

// Working App without authentication complications
const WorkingApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="p-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6 mb-6">
              <h2 className="text-3xl font-bold text-white mb-4">🚀 reVoAgent Dashboard</h2>
              <p className="text-white/80 mb-4">Welcome to the comprehensive AI agent management platform</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">🤖 Active Agents</h3>
                  <p className="text-2xl font-bold text-green-400">12</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">📊 Projects</h3>
                  <p className="text-2xl font-bold text-blue-400">42</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">⚡ Status</h3>
                  <p className="text-2xl font-bold text-green-400">LIVE</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                <h3 className="text-xl font-bold text-white mb-4">🔄 Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-white/80">Code Generator completed task</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-white/80">Deploy Agent started deployment</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span className="text-white/80">Testing Agent running tests</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                <h3 className="text-xl font-bold text-white mb-4">⚙️ System Status</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">CPU Usage</span>
                    <span className="text-green-400">45%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Memory</span>
                    <span className="text-blue-400">2.1GB</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Network</span>
                    <span className="text-green-400">Connected</span>
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
              <h2 className="text-2xl font-bold text-white mb-4">💻 Code Generator</h2>
              <p className="text-white/80">AI-powered code generation interface coming soon...</p>
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