import type { 
  DashboardStats, 
  WorkflowData, 
  ActivityItem, 
  SystemMetric, 
  IntegrationStatus,
  ModelInfo,
  AgentInfo 
} from '@/types';

// Use relative URL since we have proxy configured in vite.config.ts
const API_BASE = '/api';

// Agent types mapping
export const AGENT_TYPES = {
  CODE_GENERATOR: 'code_generator',
  DEBUG_AGENT: 'debug_agent', 
  TESTING_AGENT: 'testing_agent',
  DEPLOY_AGENT: 'deploy_agent',
  BROWSER_AGENT: 'browser_agent',
  SECURITY_AGENT: 'security_agent',
  DOCUMENTATION_AGENT: 'documentation_agent'
} as const;

export type AgentType = typeof AGENT_TYPES[keyof typeof AGENT_TYPES];

export interface AgentStatus {
  agent_type: string;
  status: 'idle' | 'busy' | 'error' | 'offline';
  current_task: string | null;
  performance: {
    success_rate: number;
    avg_response_time: number;
  };
  last_updated: string;
}

export interface AgentTask {
  id: string;
  agent_type: string;
  parameters: Record<string, any>;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  created_at: string;
  progress: number;
  result?: any;
  error?: string;
}

export interface AgentExecutionResult {
  success: boolean;
  task_id: string;
  agent_type: string;
  status: string;
  estimated_completion: string;
}

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Dashboard Stats
  async getDashboardStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>('/dashboard/stats');
  }

  // ============================================================================
  // AGENT APIs - NEW IMPLEMENTATION
  // ============================================================================

  // Get all agents status
  async getAgents(): Promise<{ agents: Record<string, any>; active_tasks: number; total_agents: number }> {
    return this.request('/agents');
  }

  // Get specific agent status
  async getAgentStatus(agentType: AgentType): Promise<AgentStatus> {
    return this.request<AgentStatus>(`/agents/${agentType}/status`);
  }

  // Execute agent task
  async executeAgentTask(agentType: AgentType, taskData: Record<string, any>): Promise<AgentExecutionResult> {
    return this.request<AgentExecutionResult>(`/agents/${agentType}/execute`, {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  // Get agent task history
  async getAgentHistory(agentType: AgentType, limit: number = 10): Promise<{ agent_type: string; history: AgentTask[]; total_tasks: number }> {
    return this.request(`/agents/${agentType}/history?limit=${limit}`);
  }

  // Cancel agent task
  async cancelAgentTask(agentType: AgentType, taskId: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/agents/${agentType}/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }

  // ============================================================================
  // LEGACY AGENT METHODS (for backward compatibility)
  // ============================================================================

  async startAgent(agentId: string): Promise<void> {
    // Map to new execute endpoint with default task
    await this.executeAgentTask(agentId as AgentType, { action: 'start' });
  }

  async stopAgent(agentId: string): Promise<void> {
    // For stopping, we'd need to cancel current tasks
    const status = await this.getAgentStatus(agentId as AgentType);
    if (status.current_task) {
      await this.cancelAgentTask(agentId as AgentType, status.current_task);
    }
  }

  // Workflows
  async getWorkflows(): Promise<{ workflows: WorkflowData[] }> {
    return this.request<{ workflows: WorkflowData[] }>('/workflows');
  }

  async createWorkflow(workflow: Partial<WorkflowData>): Promise<WorkflowData> {
    return this.request<WorkflowData>('/workflows', {
      method: 'POST',
      body: JSON.stringify(workflow),
    });
  }

  async startWorkflow(workflowId: string): Promise<void> {
    await this.request(`/workflows/${workflowId}/start`, { method: 'POST' });
  }

  async stopWorkflow(workflowId: string): Promise<void> {
    await this.request(`/workflows/${workflowId}/stop`, { method: 'POST' });
  }

  // Models
  async getModels(): Promise<{ models: ModelInfo[] }> {
    return this.request<{ models: ModelInfo[] }>('/models');
  }

  async loadModel(modelId: string): Promise<void> {
    await this.request('/models/load', {
      method: 'POST',
      body: JSON.stringify({ model_id: modelId }),
    });
  }

  async unloadModel(modelId: string): Promise<void> {
    await this.request('/models/unload', {
      method: 'POST',
      body: JSON.stringify({ model_id: modelId }),
    });
  }

  // System Metrics
  async getSystemMetrics(): Promise<{ [key: string]: SystemMetric }> {
    return this.request<{ [key: string]: SystemMetric }>('/system/metrics');
  }

  // Integration Status
  async getIntegrationStatus(): Promise<{ integrations: IntegrationStatus[] }> {
    return this.request<{ integrations: IntegrationStatus[] }>('/integrations/status');
  }

  // Recent Activity
  async getRecentActivity(): Promise<{ activities: ActivityItem[] }> {
    return this.request<{ activities: ActivityItem[] }>('/activity/recent');
  }

  // Health Check
  async healthCheck(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/health');
  }

  // Generic request methods for agent components
  async get<T = any>(endpoint: string): Promise<{ data: T }> {
    const data = await this.request<T>(endpoint);
    return { data };
  }

  async post<T = any>(endpoint: string, body?: any): Promise<{ data: T }> {
    const data = await this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
    return { data };
  }
}

export const apiService = new ApiService();
export const api = apiService;