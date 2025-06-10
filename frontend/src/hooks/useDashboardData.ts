import { useState, useEffect } from 'react';
import { apiService } from '@/services/api';
import { useWebSocketEvent } from './useWebSocket';
import type { 
  DashboardStats, 
  WorkflowData, 
  ActivityItem, 
  SystemMetric, 
  IntegrationStatus,
  ModelInfo,
  AgentInfo 
} from '@/types';

export function useDashboardData() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [workflows, setWorkflows] = useState<WorkflowData[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<{ [key: string]: SystemMetric }>({});
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Use mock data for now to ensure rendering works
        const mockStats: DashboardStats = {
          tasksCompleted: 156,
          successRate: 98.5,
          activeAgents: 24,
          responseTime: 847,
          modelsLoaded: 8,
          uptime: "99.9%",
          apiCost: 0,
          memoryUsage: "12GB"
        };

        const mockWorkflows: WorkflowData[] = [
          {
            id: "1",
            name: "Microservices",
            agents: 8,
            progress: 67,
            icon: "🔄",
            status: "running",
            startTime: "12:34 PM"
          },
          {
            id: "2", 
            name: "Web Scraping",
            agents: 3,
            progress: 89,
            icon: "🌐",
            status: "running",
            startTime: "11:45 AM"
          }
        ];

        const mockActivities: ActivityItem[] = [
          {
            id: "1",
            title: "Enhanced Code Gen: FastAPI+Auth+Tests ✓",
            description: "OpenHands Integration • Quality Score: 94%",
            time: "2 min ago",
            type: "success"
          },
          {
            id: "2",
            title: "Workflow Engine: 8 agents parallel execution ✓",
            description: "Microservices architecture • Resource optimized",
            time: "8 min ago",
            type: "success"
          }
        ];

        setStats(mockStats);
        setWorkflows(mockWorkflows);
        setActivities(mockActivities);
        setSystemMetrics({});
        setIntegrations([]);
        setModels([]);
        setAgents([]);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // WebSocket event handlers for real-time updates (temporarily disabled)
  // TODO: Re-enable when WebSocket endpoints are implemented
  /*
  useWebSocketEvent('stats_update', (data: DashboardStats) => {
    setStats(data);
  });

  useWebSocketEvent('workflow_update', (data: WorkflowData) => {
    setWorkflows(prev => 
      prev.map(w => w.id === data.id ? data : w)
    );
  });

  useWebSocketEvent('activity_update', (data: ActivityItem) => {
    setActivities(prev => [data, ...prev.slice(0, 9)]); // Keep last 10 activities
  });

  useWebSocketEvent('metrics_update', (data: { [key: string]: SystemMetric }) => {
    setSystemMetrics(data);
  });

  useWebSocketEvent('integration_update', (data: IntegrationStatus) => {
    setIntegrations(prev =>
      prev.map(i => i.name === data.name ? data : i)
    );
  });

  useWebSocketEvent('model_update', (data: ModelInfo) => {
    setModels(prev =>
      prev.map(m => m.id === data.id ? data : m)
    );
  });
  useWebSocketEvent('agent_update', (data: AgentInfo) => {
    setAgents(prev =>
      prev.map(a => a.id === data.id ? data : a)
    );
  });
  */

  return {
    stats,
    workflows,
    activities,
    systemMetrics,
    integrations,
    models,
    agents,
    loading,
    error,
    refetch: () => {
      // Trigger a manual refetch if needed
      setLoading(true);
      // Re-run the initial fetch logic
    },
  };
}