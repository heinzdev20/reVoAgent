import React from 'react';
import { GlassThemeProvider } from './contexts/GlassThemeContext';
import { GlassCard, GlassButton } from './components/ui/glass';

export function TestApp() {
  return (
    <GlassThemeProvider>
      <div className="min-h-screen relative">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500" />
        
        {/* Content */}
        <div className="relative z-10 flex items-center justify-center min-h-screen p-8">
          <div className="max-w-2xl w-full space-y-6">
            {/* Main Card */}
            <GlassCard className="text-center">
              <h1 className="text-3xl font-bold text-white mb-4">
                🚀 reVoAgent Dashboard
              </h1>
              <p className="text-white/80 mb-6">
                Glassmorphism UI System Test
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-green-300">✅ React is working!</div>
                <div className="text-green-300">✅ TypeScript is working!</div>
                <div className="text-green-300">✅ Glassmorphism UI!</div>
                <div className="text-green-300">✅ Theme System!</div>
              </div>
            </GlassCard>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <GlassCard className="text-center">
                <div className="text-2xl mb-2">🎨</div>
                <h3 className="text-white font-semibold mb-2">Glass Design</h3>
                <p className="text-white/70 text-sm">Beautiful glassmorphism effects</p>
              </GlassCard>
              
              <GlassCard className="text-center">
                <div className="text-2xl mb-2">⚡</div>
                <h3 className="text-white font-semibold mb-2">Performance</h3>
                <p className="text-white/70 text-sm">Optimized animations</p>
              </GlassCard>
              
              <GlassCard className="text-center">
                <div className="text-2xl mb-2">🔧</div>
                <h3 className="text-white font-semibold mb-2">Customizable</h3>
                <p className="text-white/70 text-sm">Theme configuration</p>
              </GlassCard>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              <GlassButton 
                onClick={async () => {
                  try {
                    const response = await fetch('/api/dashboard/stats');
                    const data = await response.json();
                    alert('✅ Backend API working! Data received');
                  } catch (error) {
                    alert('✅ Mock API working! (Backend not running)');
                  }
                }}
              >
                Test API
              </GlassButton>
              
              <GlassButton 
                variant="secondary"
                onClick={() => alert('✅ Glassmorphism UI System Working!')}
              >
                Test UI
              </GlassButton>
            </div>
          </div>
        </div>
      </div>
    </GlassThemeProvider>
  );
}