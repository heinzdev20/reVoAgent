import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GlassThemeProvider } from './contexts/GlassThemeContext';
import { GlassCard, GlassButton } from './components/ui/glass';
import { GlassParticleBackground, GlassFloatingShapes } from './components/GlassParticleBackground';
import { useAuthStore } from './stores/authStore';

// Import components one by one to test
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import { EnhancedDashboard } from './components/EnhancedDashboard';

// Authentication components
import { LoginForm } from './components/auth/LoginForm';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

import type { TabId } from './types';

// Simplified Dashboard Component for Testing
const TestDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [debugStep, setDebugStep] = useState(1);

  const renderDebugStep = () => {
    switch (debugStep) {
      case 1:
        return (
          <GlassCard className="text-center max-w-2xl mx-auto mt-8">
            <h2 className="text-2xl font-bold text-white mb-4">🔧 Debug Step 1: Basic Layout</h2>
            <p className="text-white/80 mb-6">Testing basic glassmorphism layout without complex components</p>
            <GlassButton onClick={() => setDebugStep(2)}>
              Next: Test Header Component
            </GlassButton>
          </GlassCard>
        );
      
      case 2:
        return (
          <div>
            <Header />
            <GlassCard className="text-center max-w-2xl mx-auto mt-8">
              <h2 className="text-2xl font-bold text-white mb-4">✅ Debug Step 2: Header Loaded</h2>
              <p className="text-white/80 mb-6">Header component loaded successfully</p>
              <GlassButton onClick={() => setDebugStep(3)}>
                Next: Test Sidebar Component
              </GlassButton>
            </GlassCard>
          </div>
        );
      
      case 3:
        return (
          <div>
            <Header />
            <div className="flex h-screen">
              <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
              <main className="flex-1 overflow-y-auto">
                <GlassCard className="text-center max-w-2xl mx-auto mt-8">
                  <h2 className="text-2xl font-bold text-white mb-4">✅ Debug Step 3: Sidebar Loaded</h2>
                  <p className="text-white/80 mb-6">Header + Sidebar components loaded successfully</p>
                  <GlassButton onClick={() => setDebugStep(4)}>
                    Next: Test Enhanced Dashboard
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
              <main className="flex-1 overflow-y-auto">
                <EnhancedDashboard />
              </main>
            </div>
          </div>
        );
      
      default:
        return (
          <GlassCard className="text-center max-w-2xl mx-auto mt-8">
            <h2 className="text-2xl font-bold text-white mb-4">🎉 All Components Loaded!</h2>
            <p className="text-white/80 mb-6">Full dashboard is working correctly</p>
          </GlassCard>
        );
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Background Effects */}
      <GlassParticleBackground />
      <GlassFloatingShapes />
      
      {/* Main Content */}
      <div className="relative z-10">
        {renderDebugStep()}
      </div>
    </div>
  );
};

function DebugApp() {
  const { isAuthenticated } = useAuthStore();

  return (
    <GlassThemeProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route 
            path="/login" 
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginForm />
            } 
          />
          
          {/* Protected routes */}
          <Route 
            path="/dashboard/*" 
            element={
              <ProtectedRoute>
                <TestDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Default redirect */}
          <Route 
            path="/" 
            element={
              <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
            } 
          />
          
          {/* Catch all route */}
          <Route 
            path="*" 
            element={
              <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
            } 
          />
        </Routes>
      </Router>
    </GlassThemeProvider>
  );
}

export default DebugApp;