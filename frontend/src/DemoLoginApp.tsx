import React, { useState } from 'react';
import { GlassThemeProvider } from './contexts/GlassThemeContext';
import { GlassCard, GlassButton } from './components/ui/glass';
import { useAuthStore } from './stores/authStore';

export function DemoLoginApp() {
  const [showCredentials, setShowCredentials] = useState(true);
  const { demoLogin, isAuthenticated } = useAuthStore();

  const handleDemoLogin = () => {
    demoLogin();
    setShowCredentials(false);
  };

  if (isAuthenticated && !showCredentials) {
    return (
      <GlassThemeProvider>
        <div className="min-h-screen relative">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500" />
          
          {/* Content */}
          <div className="relative z-10 flex items-center justify-center min-h-screen p-8">
            <GlassCard className="text-center max-w-2xl">
              <h1 className="text-3xl font-bold text-white mb-4">
                🎉 Successfully Logged In!
              </h1>
              <p className="text-white/80 mb-6">
                You are now authenticated with demo credentials
              </p>
              <div className="space-y-4">
                <div className="text-green-300 text-lg">✅ Authentication: Success</div>
                <div className="text-green-300 text-lg">✅ User: demo@revoagent.com</div>
                <div className="text-green-300 text-lg">✅ Role: Super Admin</div>
                <div className="text-green-300 text-lg">✅ Glassmorphism UI: Active</div>
              </div>
              <div className="mt-8">
                <GlassButton 
                  onClick={() => window.location.href = '/dashboard'}
                  className="text-lg px-8 py-3"
                >
                  🚀 Enter Dashboard
                </GlassButton>
              </div>
            </GlassCard>
          </div>
        </div>
      </GlassThemeProvider>
    );
  }

  return (
    <GlassThemeProvider>
      <div className="min-h-screen relative">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500" />
        
        {/* Content */}
        <div className="relative z-10 flex items-center justify-center min-h-screen p-8">
          <div className="max-w-4xl w-full space-y-8">
            {/* Main Card */}
            <GlassCard className="text-center">
              <h1 className="text-4xl font-bold text-white mb-4">
                🚀 reVoAgent Dashboard
              </h1>
              <p className="text-white/80 mb-8 text-xl">
                Enterprise AI Development Platform with Glassmorphism UI
              </p>
              
              {/* Demo Credentials */}
              <div className="bg-white/10 rounded-lg p-6 mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  🔑 Demo Login Credentials
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-blue-200">Option 1: Demo User</h3>
                    <div className="text-white/90">
                      <div><strong>Email:</strong> demo@revoagent.com</div>
                      <div><strong>Password:</strong> any password</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-purple-200">Option 2: Admin User</h3>
                    <div className="text-white/90">
                      <div><strong>Email:</strong> admin@revoagent.com</div>
                      <div><strong>Password:</strong> any password</div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-sm text-yellow-200">
                  💡 The system automatically logs you in with demo credentials for these emails
                </div>
              </div>

              {/* Quick Demo Login */}
              <div className="space-y-4">
                <GlassButton 
                  onClick={handleDemoLogin}
                  className="text-lg px-8 py-3"
                >
                  🎯 Quick Demo Login
                </GlassButton>
                <div className="text-white/70 text-sm">
                  Or visit /login to use the full authentication form
                </div>
              </div>
            </GlassCard>

            {/* Feature Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <GlassCard className="text-center">
                <div className="text-3xl mb-3">🤖</div>
                <h3 className="text-white font-semibold mb-2">AI Agents</h3>
                <p className="text-white/70 text-sm">Code generation, debugging, testing, deployment automation</p>
              </GlassCard>
              
              <GlassCard className="text-center">
                <div className="text-3xl mb-3">📊</div>
                <h3 className="text-white font-semibold mb-2">Analytics</h3>
                <p className="text-white/70 text-sm">Real-time monitoring, performance metrics, system insights</p>
              </GlassCard>
              
              <GlassCard className="text-center">
                <div className="text-3xl mb-3">🎨</div>
                <h3 className="text-white font-semibold mb-2">Glassmorphism</h3>
                <p className="text-white/70 text-sm">Beautiful glass effects, particle animations, theme system</p>
              </GlassCard>
            </div>

            {/* System Status */}
            <GlassCard className="text-center">
              <h3 className="text-white font-semibold mb-4">🔧 System Status</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-green-300">✅ Frontend: Online</div>
                <div className="text-green-300">✅ Glassmorphism: Active</div>
                <div className="text-green-300">✅ Theme System: Ready</div>
                <div className="text-yellow-300">⚠️ Backend: Mock Mode</div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </GlassThemeProvider>
  );
}