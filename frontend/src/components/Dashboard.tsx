import React, { useEffect } from 'react';
import { PlatformHeader } from './dashboard/PlatformHeader';
import { QuickActions } from './dashboard/QuickActions';
import { SystemMetrics } from './dashboard/SystemMetrics';
import { ActiveWorkflows } from './dashboard/ActiveWorkflows';
import { SystemStatus } from './dashboard/SystemStatus';
import { RecentActivity } from './dashboard/RecentActivity';
import { QuickTools } from './dashboard/QuickTools';
import { useDashboardStore, useDashboardConnection } from '../stores/dashboardStore';
import { useAgentStore } from '../stores/agentStore';
import { Loader2, Wifi, WifiOff } from 'lucide-react';

export function Dashboard() {
  const { startAutoRefresh, stopAutoRefresh } = useDashboardStore();
  const { fetchAllAgents } = useAgentStore();
  const { isLoading, error, isConnected } = useDashboardConnection();

  // Initialize dashboard data and auto-refresh
  useEffect(() => {
    // Start auto-refresh for dashboard data
    startAutoRefresh();
    
    // Fetch initial agent data
    fetchAllAgents();
    
    // Cleanup on unmount
    return () => {
      stopAutoRefresh();
    };
  }, [startAutoRefresh, stopAutoRefresh, fetchAllAgents]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <WifiOff className="w-5 h-5 text-red-500 mr-2" />
            <h3 className="text-red-800 font-medium">Dashboard Connection Error</h3>
          </div>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button 
            onClick={() => startAutoRefresh()}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Connection Status Indicator */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">reVoAgent Dashboard</h1>
        <div className="flex items-center space-x-2">
          {isConnected ? (
            <div className="flex items-center text-green-600">
              <Wifi className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">Live</span>
            </div>
          ) : (
            <div className="flex items-center text-red-600">
              <WifiOff className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">Offline</span>
            </div>
          )}
        </div>
      </div>

      <PlatformHeader />
      <QuickActions />
      <SystemMetrics />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActiveWorkflows />
        <SystemStatus metrics={{}} />
      </div>

      <RecentActivity />
      <QuickTools />
    </div>
  );
}

export default Dashboard;