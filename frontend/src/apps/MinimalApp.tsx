import React, { useState } from 'react';
import { GlassThemeProvider } from './contexts/GlassThemeContext';
import { GlassCard, GlassButton } from './components/ui/glass';
import { GlassParticleBackground, GlassFloatingShapes } from './components/GlassParticleBackground';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import type { TabId } from './types';

const MinimalApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');

  return (
    <GlassThemeProvider>
      <div className="min-h-screen relative">
        {/* Background Effects */}
        <GlassParticleBackground />
        <GlassFloatingShapes />
        
        {/* Content */}
        <div className="relative z-10">
          <Header />
          <div className="flex h-screen">
            <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
            <main className="flex-1 overflow-y-auto flex items-center justify-center">
              <GlassCard className="text-center max-w-md">
                <h1 className="text-3xl font-bold text-white mb-4">
                  🚀 reVoAgent Dashboard
                </h1>
                <p className="text-white/80 mb-6">
                  Testing Header + Sidebar
                </p>
                <div className="text-green-300 mb-4">
                  ✅ Header + Sidebar working!
                </div>
                <div className="text-blue-300 mb-4">
                  Active Tab: {activeTab}
                </div>
                <GlassButton>
                  Test Glass Button
                </GlassButton>
              </GlassCard>
            </main>
          </div>
        </div>
      </div>
    </GlassThemeProvider>
  );
};

export default MinimalApp;