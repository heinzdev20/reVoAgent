// Mock API service for demo purposes
import type { DashboardStats, WorkflowData, ActivityItem, SystemMetric, AgentInfo } from '../types';

// Mock data
const mockDashboardStats: DashboardStats = {
  tasksCompleted: 1247,
  successRate: 94.2,
  activeAgents: 8,
  responseTime: 245,
  modelsLoaded: 5,
  uptime: '7d 14h 32m',
  apiCost: 23.47,
  memoryUsage: '2.4GB',
};

const mockWorkflows: WorkflowData[] = [
  {
    id: '1',
    name: 'AI Code Review Pipeline',
    agents: 3,
    progress: 75,
    icon: '🔍',
    status: 'running',
    startTime: '2 hours ago',
    estimatedCompletion: '30 minutes',
    description: 'Automated code review with security analysis',
  },
  {
    id: '2',
    name: 'Documentation Generator',
    agents: 2,
    progress: 100,
    icon: '📚',
    status: 'completed',
    startTime: '4 hours ago',
    description: 'Generate comprehensive API documentation',
  },
  {
    id: '3',
    name: 'Performance Optimization',
    agents: 4,
    progress: 45,
    icon: '⚡',
    status: 'running',
    startTime: '1 hour ago',
    estimatedCompletion: '2 hours',
    description: 'Optimize application performance and memory usage',
  },
];

const mockActivities: ActivityItem[] = [
  {
    id: '1',
    title: 'Code Generator completed task',
    description: 'Generated React component with TypeScript',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    type: 'agent',
    status: 'success',
    icon: '🤖',
  },
  {
    id: '2',
    title: 'Security scan completed',
    description: 'No vulnerabilities found in latest deployment',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    type: 'system',
    status: 'success',
    icon: '🛡️',
  },
  {
    id: '3',
    title: 'Performance alert',
    description: 'Memory usage above 80% threshold',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    type: 'system',
    status: 'warning',
    icon: '⚠️',
  },
  {
    id: '4',
    title: 'Deploy Agent started',
    description: 'Deploying to production environment',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    type: 'agent',
    status: 'info',
    icon: '🚀',
  },
];

const mockSystemMetrics: SystemMetric[] = [
  { name: 'CPU Usage', value: 65, color: '#3b82f6', unit: '%' },
  { name: 'Memory', value: 78, color: '#8b5cf6', unit: '%' },
  { name: 'Disk I/O', value: 42, color: '#10b981', unit: '%' },
  { name: 'Network', value: 23, color: '#f59e0b', unit: '%' },
];

const mockAgents: AgentInfo[] = [
  {
    id: 'code_generator',
    name: 'Code Generator',
    type: 'code-generator',
    status: 'active',
    currentTask: 'Generating React components',
    performance: 94,
    uptime: '2d 14h',
  },
  {
    id: 'debug_agent',
    name: 'Debug Agent',
    type: 'debug',
    status: 'idle',
    performance: 87,
    uptime: '2d 14h',
  },
  {
    id: 'testing_agent',
    name: 'Testing Agent',
    type: 'testing',
    status: 'busy',
    currentTask: 'Running integration tests',
    performance: 91,
    uptime: '2d 14h',
  },
  {
    id: 'deploy_agent',
    name: 'Deploy Agent',
    type: 'deploy',
    status: 'active',
    currentTask: 'Deploying to staging',
    performance: 96,
    uptime: '2d 14h',
  },
  {
    id: 'security_agent',
    name: 'Security Agent',
    type: 'security',
    status: 'idle',
    performance: 89,
    uptime: '2d 14h',
  },
];

// Mock API functions
export const mockApi = {
  getDashboardStats: (): Promise<DashboardStats> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockDashboardStats), 500);
    });
  },

  getWorkflows: (): Promise<WorkflowData[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockWorkflows), 300);
    });
  },

  getRecentActivity: (): Promise<ActivityItem[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockActivities), 400);
    });
  },

  getSystemMetrics: (): Promise<SystemMetric[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockSystemMetrics), 200);
    });
  },

  getAgents: (): Promise<AgentInfo[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockAgents), 350);
    });
  },

  getAgentStatus: (agentId: string): Promise<AgentInfo | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const agent = mockAgents.find(a => a.id === agentId);
        resolve(agent || null);
      }, 200);
    });
  },
};

// Override fetch for demo mode
export const enableMockMode = () => {
  const originalFetch = window.fetch;
  
  window.fetch = async (url: RequestInfo | URL, options?: RequestInit): Promise<Response> => {
    const urlString = typeof url === 'string' ? url : url instanceof URL ? url.href : (url as Request).url;
    
    // Check if it's an API call
    if (urlString.includes('/api/')) {
      console.log('Mock API intercepted:', urlString);
      
      let data: any = null;
      
      if (urlString.includes('/dashboard/stats')) {
        data = await mockApi.getDashboardStats();
      } else if (urlString.includes('/workflows')) {
        data = await mockApi.getWorkflows();
      } else if (urlString.includes('/activity/recent')) {
        data = await mockApi.getRecentActivity();
      } else if (urlString.includes('/system/metrics')) {
        data = await mockApi.getSystemMetrics();
      } else if (urlString.includes('/agents/') && urlString.includes('/status')) {
        const agentId = urlString.split('/agents/')[1].split('/status')[0];
        data = await mockApi.getAgentStatus(agentId);
      } else if (urlString.includes('/agents')) {
        data = await mockApi.getAgents();
      } else {
        // Default empty response for unknown endpoints
        data = {};
      }
      
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // For non-API calls, use original fetch
    return originalFetch(url, options);
  };
};

// Auto-enable mock mode in development
if (import.meta.env.DEV) {
  enableMockMode();
}