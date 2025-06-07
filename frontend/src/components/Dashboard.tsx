import React from 'react';
import { PlatformHeader } from './dashboard/PlatformHeader';
import { QuickActions } from './dashboard/QuickActions';
import { SystemMetrics } from './dashboard/SystemMetrics';
import { ActiveWorkflows } from './dashboard/ActiveWorkflows';
import { SystemStatus } from './dashboard/SystemStatus';
import { RecentActivity } from './dashboard/RecentActivity';
import { QuickTools } from './dashboard/QuickTools';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Loader2 } from 'lucide-react';

export function Dashboard() {
  const { 
    stats, 
    workflows, 
    activities, 
    systemMetrics, 
    loading, 
    error 
  } = useDashboardData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        <span className="ml-2 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error loading dashboard</h3>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <PlatformHeader />
      <QuickActions />
      {stats && <SystemMetrics stats={stats} />}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActiveWorkflows workflows={workflows} />
        <SystemStatus metrics={systemMetrics} />
      </div>

      <RecentActivity activities={activities} />
      <QuickTools />
    </div>
  );
}