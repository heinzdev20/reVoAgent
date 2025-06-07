export interface DashboardStats {
  tasksCompleted: number;
  successRate: number;
  activeAgents: number;
  responseTime: number;
  modelsLoaded: number;
  uptime: string;
  apiCost: number;
  memoryUsage: string;
}

export interface WorkflowData {
  id: string;
  name: string;
  agents: number;
  progress: number;
  icon: string;
  status: 'running' | 'completed' | 'paused' | 'failed';
  startTime: string;
  estimatedCompletion?: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'success' | 'warning' | 'error' | 'info';
  icon?: string;
}

export interface SystemMetric {
  name: string;
  value: number;
  color: string;
  label?: string;
  unit?: string;
}

export interface IntegrationStatus {
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  lastCheck: string;
  version?: string;
  url?: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  displayName: string;
  type: 'code' | 'chat' | 'specialized';
  size: string;
  status: 'loaded' | 'available' | 'loading' | 'error';
  performance: number;
  memoryUsage?: string;
  tokensPerSecond?: number;
}

export interface AgentInfo {
  id: string;
  name: string;
  type: 'code-generator' | 'debug' | 'testing' | 'deploy' | 'browser';
  status: 'active' | 'idle' | 'busy' | 'error';
  currentTask?: string;
  performance: number;
  uptime: string;
}

export type TabId = 
  | 'dashboard' 
  | 'projects' 
  | 'workflows' 
  | 'analytics'
  | 'code-generator'
  | 'debug-agent'
  | 'testing-agent'
  | 'deploy-agent'
  | 'browser-agent'
  | 'model-registry'
  | 'settings'
  | 'security'
  | 'monitoring'
  | 'resource-mgmt';

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}