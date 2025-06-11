import React, { useState } from 'react';
import { GlassThemeProvider } from './contexts/GlassThemeContext';
import { GlassCard, GlassButton } from './components/ui/glass';
import Header from './components/Header';

const SimpleApp: React.FC = () => {
  const [showThemeSettings, setShowThemeSettings] = useState(false);

  return (
    <GlassThemeProvider>
      <div className="min-h-screen relative">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500" />
        
        {/* Main Content */}
        <div className="relative z-10">
          <Header />
          
          <div className="flex items-center justify-center min-h-screen p-8">
            <GlassCard className="text-center max-w-md">
              <h1 className="text-2xl font-bold text-white mb-4">
                🚀 reVoAgent Dashboard
              </h1>
              <p className="text-white/80 mb-6">
                Testing Header Component
              </p>
              <GlassButton 
                onClick={() => setShowThemeSettings(!showThemeSettings)}
              >
                Toggle Theme Settings: {showThemeSettings ? 'ON' : 'OFF'}
              </GlassButton>
            </GlassCard>
          </div>
        </div>
      </div>
    </GlassThemeProvider>
  );
};

export default SimpleApp;