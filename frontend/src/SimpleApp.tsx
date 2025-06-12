import React, { useState, useEffect } from 'react';
import { apiService } from './services/api';
import type { DashboardStats } from './types';

// Simple Error Boundary
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 max-w-md text-center">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-white mb-4">Something went wrong</h2>
            <p className="text-gray-300 mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: undefined })}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              🔄 Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Simple Dashboard Component
const SimpleDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let intervalId: NodeJS.Timeout;

    const fetchData = async () => {
      try {
        setError(null);
        
        // Check connection
        const health = await apiService.healthCheck();
        if (mounted) {
          setConnectionStatus(health.status === 'healthy' ? 'connected' : 'disconnected');
        }

        // Fetch dashboard stats
        const dashboardStats = await apiService.getDashboardStats();
        if (mounted) {
          setStats(dashboardStats);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch data');
          setConnectionStatus('disconnected');
          setLoading(false);
        }
      }
    };

    // Initial fetch
    fetchData();

    // Set up polling every 30 seconds
    intervalId = setInterval(fetchData, 30000);

    return () => {
      mounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-400';
      case 'disconnected': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return '🟢';
      case 'disconnected': return '🔴';
      default: return '🟡';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 text-center">
          <div className="animate-spin text-4xl mb-4">⚙️</div>
          <p className="text-white text-lg">Loading reVoAgent Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">🚀 reVoAgent</h1>
              <span className="ml-2 text-sm text-gray-300">Development Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 ${getStatusColor()}`}>
                <span>{getStatusIcon()}</span>
                <span className="text-sm font-medium">
                  {connectionStatus === 'connected' ? 'Connected' : 
                   connectionStatus === 'disconnected' ? 'Disconnected' : 'Connecting...'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <span className="text-red-400 text-xl mr-3">⚠️</span>
              <div>
                <h3 className="text-red-400 font-semibold">Connection Error</h3>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Active Agents</p>
                <p className="text-3xl font-bold text-white">
                  {stats?.agents.active || 0}
                </p>
                <p className="text-gray-400 text-xs">
                  of {stats?.agents.total || 0} total
                </p>
              </div>
              <div className="text-4xl">🤖</div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Active Workflows</p>
                <p className="text-3xl font-bold text-white">
                  {stats?.workflows.active || 0}
                </p>
                <p className="text-gray-400 text-xs">
                  of {stats?.workflows.total || 0} total
                </p>
              </div>
              <div className="text-4xl">⚡</div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Active Projects</p>
                <p className="text-3xl font-bold text-white">
                  {stats?.projects.active || 0}
                </p>
                <p className="text-gray-400 text-xs">
                  of {stats?.projects.total || 0} total
                </p>
              </div>
              <div className="text-4xl">📁</div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">System Health</p>
                <p className="text-3xl font-bold text-green-400">
                  {connectionStatus === 'connected' ? 'Good' : 'Poor'}
                </p>
                <p className="text-gray-400 text-xs">
                  CPU: {stats?.system.cpu_usage?.toFixed(1) || 0}%
                </p>
              </div>
              <div className="text-4xl">💚</div>
            </div>
          </div>
        </div>

        {/* System Metrics */}
        {stats?.system && (
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">System Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">CPU Usage</span>
                  <span className="text-white font-semibold">{stats.system.cpu_usage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(stats.system.cpu_usage, 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">Memory Usage</span>
                  <span className="text-white font-semibold">{stats.system.memory_usage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(stats.system.memory_usage, 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">Disk Usage</span>
                  <span className="text-white font-semibold">{stats.system.disk_usage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(stats.system.disk_usage, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={async () => {
                try {
                  const health = await apiService.healthCheck();
                  alert(`API Connection: ${health.status === 'healthy' ? '✅ Healthy' : '❌ Unhealthy'}`);
                } catch (error) {
                  alert(`❌ Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <span>🔧</span>
              <span>Test API Connection</span>
            </button>
            <button 
              onClick={() => window.open('http://localhost:8000/docs', '_blank')}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <span>📊</span>
              <span>View API Docs</span>
            </button>
            <button 
              onClick={() => alert('🚀 Agent management coming soon! This will allow you to start/stop agents.')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <span>🚀</span>
              <span>Start Agent</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-gray-400 text-sm">
          <p>reVoAgent Development Dashboard v1.0 - Backend: {connectionStatus}</p>
          <p className="mt-1">
            Backend API: <code className="bg-black/30 px-2 py-1 rounded">http://localhost:8000</code>
          </p>
        </footer>
      </main>
    </div>
  );
};

// Main App Component
const SimpleApp: React.FC = () => {
  return (
    <ErrorBoundary>
      <SimpleDashboard />
    </ErrorBoundary>
  );
};

export default SimpleApp;