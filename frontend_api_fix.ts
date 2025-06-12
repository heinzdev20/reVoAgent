// frontend/src/services/api-fixed.ts
// Fixed API service with proper error handling and development mode

import type { 
  DashboardStats, 
  WorkflowData, 
  ActivityItem, 
  SystemMetric, 
  IntegrationStatus,
  ModelInfo,
  AgentInfo 
} from '@/types';

// Development-friendly API configuration
const isDevelopment = import.meta.env.DEV;
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

// Enhanced error handling
class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: Response
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Agent types mapping
export const AGENT_TYPES = {
  CODE_GENERATOR: 'code_generator',
  DEBUG_AGENT: 'debug_agent', 
  TESTING_AGENT: 'testing_agent',
  DEPLOY_AGENT: 'deploy_agent',
  BROWSER_AGENT: 'browser_agent',
  SECURITY_AGENT: 'security_agent',
  DOCUMENTATION_AGENT: 'documentation_agent',
  PERFORMANCE_OPTIMIZER: 'performance_optimizer',
  ARCHITECTURE_ADVISOR: 'architecture_advisor'
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

class EnhancedApiService {
  private isOnline = true;
  private retryAttempts = 3;
  private retryDelay = 1000;

  constructor() {
    this.checkConnection();
  }

  private async checkConnection(): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      this.isOnline = response.ok;
      
      if (isDevelopment) {
        console.log(`🔗 API Connection: ${this.isOnline ? '✅ Online' : '❌ Offline'}`);
        console.log(`📡 API Base URL: ${API_BASE}`);
      }
    } catch (error) {
      this.isOnline = false;
      if (isDevelopment) {
        console.warn('⚠️ API connection failed, using fallback mode');
      }
    }
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const response = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
          },
          ...options,
        });

        if (!response.ok) {
          // Handle different HTTP errors
          if (response.status >= 500) {
            throw new ApiError(`Server error: ${response.statusText}`, response.status, response);
          } else if (response.status >= 400) {
            const errorData = await response.json().catch(() => ({ error: response.statusText }));
            throw new ApiError(errorData.detail || errorData.error || response.statusText, response.status, response);
          }
        }

        const data = await response.json();
        
        // Mark as online if successful
        if (!this.isOnline) {
          this.isOnline = true;
          if (isDevelopment) console.log('🔗 API connection restored');
        }
        
        return data;
        
      } catch (error) {
        if (isDevelopment) {
          console.warn(`🔄 API request attempt ${attempt}/${this.retryAttempts} failed:`, error);
        }
        
        if (attempt === this.retryAttempts) {
          this.isOnline = false;
          if (error instanceof ApiError) {
            throw error;
          }
          throw new ApiError(
            `Network error after ${this.retryAttempts} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
      }
    }

    throw new ApiError('Max retry attempts reached');
  }

  // Fallback data for offline mode
  private getFallbackData<T>(endpoint: string): T {
    const fallbackData: Record<string, any> = {
      '/api/dashboard/stats': {
        agents: { active: 0, total: 9 },
        workflows: { active: 0, total: 0 },
        projects: { active: 0, total: 0 },
        system: { cpu_usage: 0, memory_usage: 0, disk_usage: 0 }
      },
      '/api/agents': {
        agents: {},
        active_tasks: 0,
        total_agents: 0
      },
      '/api/models': {
        models: [],
        status: 'offline'
      },
      '/api/workflows': {
        workflows: []
      },
      '/api/system/metrics': {},
      '/api/integrations/status': {
        integrations: []
      },
      '/api/activity/recent': {
        activities: []
      }
    };

    return fallbackData[endpoint] || {} as T;
  }

  private async requestWithFallback<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      return await this.request<T>(endpoint, options);
    } catch (error) {
      if (isDevelopment) {
        console.warn(`📱 Using fallback data for ${endpoint}:`, error);
      }
      return this.getFallbackData<T>(endpoint);
    }
  }

  // Dashboard Stats
  async getDashboardStats(): Promise<DashboardStats> {
    return this.requestWithFallback<DashboardStats>('/api/dashboard/stats');
  }

  // ============================================================================
  // AGENT APIs
  // ============================================================================

  async getAgents(): Promise<{ agents: Record<string, any>; active_tasks: number; total_agents: number }> {
    return this.requestWithFallback('/api/agents');
  }

  async getAgentStatus(agentType: AgentType): Promise<AgentStatus> {
    try {
      return await this.request<AgentStatus>(`/api/agents/${agentType}/status`);
    } catch (error) {
      return {
        agent_type: agentType,
        status: 'offline',
        current_task: null,
        performance: { success_rate: 0, avg_response_time: 0 },
        last_updated: new Date().toISOString()
      };
    }
  }

  async executeAgentTask(agentType: AgentType, taskData: Record<string, any>): Promise<AgentExecutionResult> {
    return this.request<AgentExecutionResult>(`/api/agents/${agentType}/execute`, {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async getAgentHistory(agentType: AgentType, limit: number = 10): Promise<{ agent_type: string; history: AgentTask[]; total_tasks: number }> {
    try {
      return await this.request(`/api/agents/${agentType}/history?limit=${limit}`);
    } catch (error) {
      return { agent_type: agentType, history: [], total_tasks: 0 };
    }
  }

  async cancelAgentTask(agentType: AgentType, taskId: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/api/agents/${agentType}/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }

  // Legacy compatibility methods
  async startAgent(agentId: string): Promise<void> {
    await this.executeAgentTask(agentId as AgentType, { action: 'start' });
  }

  async stopAgent(agentId: string): Promise<void> {
    const status = await this.getAgentStatus(agentId as AgentType);
    if (status.current_task) {
      await this.cancelAgentTask(agentId as AgentType, status.current_task);
    }
  }

  // Workflows
  async getWorkflows(): Promise<{ workflows: WorkflowData[] }> {
    return this.requestWithFallback<{ workflows: WorkflowData[] }>('/api/workflows');
  }

  async createWorkflow(workflow: Partial<WorkflowData>): Promise<WorkflowData> {
    return this.request<WorkflowData>('/api/workflows', {
      method: 'POST',
      body: JSON.stringify(workflow),
    });
  }

  async startWorkflow(workflowId: string): Promise<void> {
    await this.request(`/api/workflows/${workflowId}/start`, { method: 'POST' });
  }

  async stopWorkflow(workflowId: string): Promise<void> {
    await this.request(`/api/workflows/${workflowId}/stop`, { method: 'POST' });
  }

  // Models
  async getModels(): Promise<{ models: ModelInfo[] }> {
    return this.requestWithFallback<{ models: ModelInfo[] }>('/api/models');
  }

  async loadModel(modelId: string): Promise<void> {
    await this.request('/api/models/load', {
      method: 'POST',
      body: JSON.stringify({ model_id: modelId }),
    });
  }

  async unloadModel(modelId: string): Promise<void> {
    await this.request('/api/models/unload', {
      method: 'POST',
      body: JSON.stringify({ model_id: modelId }),
    });
  }

  // System Metrics
  async getSystemMetrics(): Promise<{ [key: string]: SystemMetric }> {
    return this.requestWithFallback<{ [key: string]: SystemMetric }>('/api/system/metrics');
  }

  // Integration Status
  async getIntegrationStatus(): Promise<{ integrations: IntegrationStatus[] }> {
    return this.requestWithFallback<{ integrations: IntegrationStatus[] }>('/api/integrations/status');
  }

  // Recent Activity
  async getRecentActivity(): Promise<{ activities: ActivityItem[] }> {
    return this.requestWithFallback<{ activities: ActivityItem[] }>('/api/activity/recent');
  }

  // Health Check
  async healthCheck(): Promise<{ status: string }> {
    try {
      return await this.request<{ status: string }>('/health');
    } catch (error) {
      return { status: 'offline' };
    }
  }

  // Chat API
  async sendChatMessage(content: string, options?: {
    system_prompt?: string;
    max_tokens?: number;
    temperature?: number;
  }): Promise<{
    content: string;
    provider: string;
    tokens_used: number;
    generation_time: number;
  }> {
    return this.request('/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        content,
        system_prompt: options?.system_prompt,
        max_tokens: options?.max_tokens || 1024,
        temperature: options?.temperature || 0.7,
      }),
    });
  }

  // Generic request methods
  async get<T = any>(endpoint: string): Promise<{ data: T }> {
    const data = await this.requestWithFallback<T>(endpoint);
    return { data };
  }

  async post<T = any>(endpoint: string, body?: any): Promise<{ data: T }> {
    const data = await this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
    return { data };
  }

  // Connection status
  getConnectionStatus(): boolean {
    return this.isOnline;
  }

  // WebSocket creation helper
  createWebSocket(endpoint: string = '/ws/chat'): WebSocket {
    const wsUrl = `${WS_BASE}${endpoint}`;
    const ws = new WebSocket(wsUrl);
    
    if (isDevelopment) {
      ws.onopen = () => console.log(`🔌 WebSocket connected: ${wsUrl}`);
      ws.onclose = () => console.log('🔌 WebSocket disconnected');
      ws.onerror = (error) => console.error('🔌 WebSocket error:', error);
    }
    
    return ws;
  }
}

// Export singleton instance
export const apiService = new EnhancedApiService();
export const api = apiService;

// Export for backward compatibility
export default apiService;