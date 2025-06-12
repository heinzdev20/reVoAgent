import React, { useState } from 'react';
import { GlassThemeProvider } from './contexts/GlassThemeContext';
import { GlassCard, GlassButton } from './components/ui/glass';
import { GlassParticleBackground, GlassFloatingShapes } from './components/GlassParticleBackground';

// Import components one by one to test
import Header from './components/Header';
import Sidebar from './components/Sidebar';

import type { TabId } from './types';

// Simplified Dashboard Component for Testing (No Auth)
const SimpleDebugApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [debugStep, setDebugStep] = useState(1);

  const renderDebugStep = () => {
    switch (debugStep) {
      case 1:
        return (
          <div className="flex items-center justify-center min-h-screen p-8">
            <GlassCard className="text-center max-w-2xl">
              <h2 className="text-2xl font-bold text-white mb-4">🔧 Debug Step 1: Basic Layout</h2>
              <p className="text-white/80 mb-6">Testing basic glassmorphism layout without complex components</p>
              <GlassButton onClick={() => setDebugStep(2)}>
                Next: Test Header Component
              </GlassButton>
            </GlassCard>
          </div>
        );
      
      case 2:
        return (
          <div>
            <Header />
            <div className="flex items-center justify-center min-h-screen p-8">
              <GlassCard className="text-center max-w-2xl">
                <h2 className="text-2xl font-bold text-white mb-4">✅ Debug Step 2: Header Loaded</h2>
                <p className="text-white/80 mb-6">Header component loaded successfully</p>
                <GlassButton onClick={() => setDebugStep(3)}>
                  Next: Test Sidebar Component
                </GlassButton>
              </GlassCard>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div>
            <Header />
            <div className="flex h-screen">
              <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
              <main className="flex-1 overflow-y-auto flex items-center justify-center p-8">
                <GlassCard className="text-center max-w-2xl">
                  <h2 className="text-2xl font-bold text-white mb-4">✅ Debug Step 3: Sidebar Loaded</h2>
                  <p className="text-white/80 mb-6">Header + Sidebar components loaded successfully</p>
                  <p className="text-green-300 mb-4">Active Tab: {activeTab}</p>
                  <GlassButton onClick={() => setDebugStep(4)}>
                    Next: Test Dashboard Content
                  </GlassButton>
                </GlassCard>
              </main>
            </div>
          </div>
        );
      
      case 4:
        return (
          <div>
            <Header />
            <div className="flex h-screen">
              <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
              <main className="flex-1 overflow-y-auto flex items-center justify-center p-8">
                <GlassCard className="text-center max-w-2xl">
                  <h2 className="text-2xl font-bold text-white mb-4">🎉 Core Components Working!</h2>
                  <p className="text-white/80 mb-6">Header, Sidebar, and Glassmorphism UI are all functional</p>
                  <div className="space-y-2 mb-6">
                    <div className="text-green-300">✅ Glassmorphism Theme System</div>
                    <div className="text-green-300">✅ Glass UI Components</div>
                    <div className="text-green-300">✅ Particle Background Effects</div>
                    <div className="text-green-300">✅ Header Navigation</div>
                    <div className="text-green-300">✅ Sidebar Navigation</div>
                  </div>
                  <GlassButton onClick={() => setDebugStep(1)}>
                    🔄 Restart Debug Process
                  </GlassButton>
                </GlassCard>
              </main>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="flex items-center justify-center min-h-screen p-8">
            <GlassCard className="text-center max-w-2xl">
              <h2 className="text-2xl font-bold text-white mb-4">🎉 All Components Loaded!</h2>
              <p className="text-white/80 mb-6">Full dashboard is working correctly</p>
            </GlassCard>
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
        
        {/* Main Content */}
        <div className="relative z-10">
          {renderDebugStep()}
        </div>
      </div>
    </GlassThemeProvider>
  );
};

export default SimpleDebugApp;