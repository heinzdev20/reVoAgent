import type { 
  DashboardStats, 
  WorkflowData, 
  ActivityItem, 
  SystemMetric, 
  IntegrationStatus,
  ModelInfo,
  AgentInfo 
} from '@/types';

const API_BASE = '/api/v1';

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

  // Agents
  async getAgents(): Promise<{ agents: AgentInfo[] }> {
    return this.request<{ agents: AgentInfo[] }>('/agents');
  }

  async startAgent(agentId: string): Promise<void> {
    await this.request(`/agents/${agentId}/start`, { method: 'POST' });
  }

  async stopAgent(agentId: string): Promise<void> {
    await this.request(`/agents/${agentId}/stop`, { method: 'POST' });
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
}

export const apiService = new ApiService();