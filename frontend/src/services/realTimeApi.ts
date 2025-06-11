// frontend/src/services/realTimeApi.ts
/**
 * Real-Time API Service for reVoAgent Frontend
 * Connects to backend with real AI integration
 */

export interface AgentExecutionRequest {
  description: string;
  parameters?: Record<string, any>;
}

export interface AgentExecutionResponse {
  success: boolean;
  task_id: string;
  message: string;
  status: string;
  timestamp: string;
}

export interface TaskStatus {
  id: string;
  agent_type: string;
  description: string;
  parameters: Record<string, any>;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  result?: any;
  error?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

export interface AITestRequest {
  prompt: string;
  task_type?: string;
  provider?: string;
}

export interface AITestResponse {
  success: boolean;
  response?: any;
  content?: string;
  provider_used: string;
  response_time: number;
  timestamp: string;
}

export interface DashboardStats {
  system: {
    status: string;
    uptime: string;
    version: string;
  };
  ai: {
    providers_available: number;
    default_provider: string;
    provider_status: Record<string, any>;
  };
  agents: {
    total_active: number;
    total_completed: number;
    success_rate: number;
    average_completion_time: number;
  };
  performance: {
    response_time: string;
    memory_usage: string;
    cpu_usage: string;
    websocket_connections: number;
  };
  timestamp: string;
}

export interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  status: string;
  agent_type?: string;
}

class RealTimeAPIService {
  private baseURL: string;
  private wsURL: string;
  
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:12001';
    this.wsURL = this.baseURL.replace('http', 'ws');
  }

  // ============================================================================
  // AGENT EXECUTION APIs
  // ============================================================================

  async executeAgent(agentType: string, request: AgentExecutionRequest): Promise<AgentExecutionResponse> {
    const response = await fetch(`${this.baseURL}/api/agents/${agentType}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Agent execution failed');
    }

    return response.json();
  }

  async getTaskStatus(taskId: string): Promise<TaskStatus> {
    const response = await fetch(`${this.baseURL}/api/agents/tasks/${taskId}`);

    if (!response.ok) {
      throw new Error('Failed to get task status');
    }

    return response.json();
  }

  async cancelTask(taskId: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.baseURL}/api/agents/tasks/${taskId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to cancel task');
    }

    return response.json();
  }

  async getAgentStats(): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/agents/stats`);

    if (!response.ok) {
      throw new Error('Failed to get agent stats');
    }

    return response.json();
  }

  // ============================================================================
  // SPECIFIC AGENT APIs
  // ============================================================================

  async executeCodeGenerator(request: AgentExecutionRequest): Promise<AgentExecutionResponse> {
    return this.executeAgent('code-generator', request);
  }

  async executeDebugAgent(request: AgentExecutionRequest): Promise<AgentExecutionResponse> {
    return this.executeAgent('debug-agent', request);
  }

  async executeTestingAgent(request: AgentExecutionRequest): Promise<AgentExecutionResponse> {
    return this.executeAgent('testing-agent', request);
  }

  async executeSecurityAgent(request: AgentExecutionRequest): Promise<AgentExecutionResponse> {
    return this.executeAgent('security-agent', request);
  }

  // ============================================================================
  // AI INTEGRATION APIs
  // ============================================================================

  async getAIStatus(): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/ai/status`);

    if (!response.ok) {
      throw new Error('Failed to get AI status');
    }

    return response.json();
  }

  async testAIIntegration(request: AITestRequest): Promise<AITestResponse> {
    const response = await fetch(`${this.baseURL}/api/ai/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'AI test failed');
    }

    return response.json();
  }

  // ============================================================================
  // DEEPSEEK R1 APIs
  // ============================================================================

  async deepSeekGenerate(request: AITestRequest): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/ai/deepseek/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'DeepSeek generation failed');
    }

    return response.json();
  }

  async deepSeekReasoning(request: AITestRequest): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/ai/deepseek/reasoning`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'DeepSeek reasoning failed');
    }

    return response.json();
  }

  async deepSeekCreative(request: AITestRequest): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/ai/deepseek/creative`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'DeepSeek creative generation failed');
    }

    return response.json();
  }

  // ============================================================================
  // DASHBOARD APIs
  // ============================================================================

  async getDashboardStats(): Promise<DashboardStats> {
    const response = await fetch(`${this.baseURL}/api/dashboard/stats`);

    if (!response.ok) {
      throw new Error('Failed to get dashboard stats');
    }

    return response.json();
  }

  async getRecentActivity(): Promise<{ activities: Activity[] }> {
    const response = await fetch(`${this.baseURL}/api/dashboard/activity`);

    if (!response.ok) {
      throw new Error('Failed to get recent activity');
    }

    return response.json();
  }

  // ============================================================================
  // WEBSOCKET CONNECTIONS
  // ============================================================================

  connectToDashboard(onMessage: (data: any) => void, onError?: (error: Event) => void): WebSocket {
    const ws = new WebSocket(`${this.wsURL}/ws/dashboard`);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onerror = (event) => {
      console.error('WebSocket error:', event);
      if (onError) {
        onError(event);
      }
    };

    ws.onclose = () => {
      console.log('Dashboard WebSocket connection closed');
    };

    return ws;
  }

  connectToAgent(agentType: string, onMessage: (data: any) => void, onError?: (error: Event) => void): WebSocket {
    const ws = new WebSocket(`${this.wsURL}/ws/agents/${agentType}`);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onerror = (event) => {
      console.error('WebSocket error:', event);
      if (onError) {
        onError(event);
      }
    };

    ws.onclose = () => {
      console.log(`Agent ${agentType} WebSocket connection closed`);
    };

    return ws;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  async getSystemHealth(): Promise<any> {
    const response = await fetch(`${this.baseURL}/health`);

    if (!response.ok) {
      throw new Error('Failed to get system health');
    }

    return response.json();
  }

  async getSystemInfo(): Promise<any> {
    const response = await fetch(`${this.baseURL}/`);

    if (!response.ok) {
      throw new Error('Failed to get system info');
    }

    return response.json();
  }

  // ============================================================================
  // TASK POLLING FOR REAL-TIME UPDATES
  // ============================================================================

  async pollTaskStatus(taskId: string, onUpdate: (status: TaskStatus) => void, onComplete: (result: TaskStatus) => void): Promise<void> {
    const poll = async () => {
      try {
        const status = await this.getTaskStatus(taskId);
        onUpdate(status);

        if (status.status === 'completed' || status.status === 'failed' || status.status === 'cancelled') {
          onComplete(status);
          return;
        }

        // Continue polling
        setTimeout(poll, 1000); // Poll every second
      } catch (error) {
        console.error('Failed to poll task status:', error);
        setTimeout(poll, 2000); // Retry after 2 seconds on error
      }
    };

    poll();
  }

  // ============================================================================
  // BATCH OPERATIONS
  // ============================================================================

  async executeMultipleAgents(requests: Array<{ agentType: string; request: AgentExecutionRequest }>): Promise<Array<AgentExecutionResponse>> {
    const promises = requests.map(({ agentType, request }) =>
      this.executeAgent(agentType, request)
    );

    return Promise.all(promises);
  }

  async getMultipleTaskStatuses(taskIds: string[]): Promise<TaskStatus[]> {
    const promises = taskIds.map(taskId => this.getTaskStatus(taskId));
    return Promise.all(promises);
  }
}

// Export singleton instance
export const realTimeAPI = new RealTimeAPIService();

// Export types

