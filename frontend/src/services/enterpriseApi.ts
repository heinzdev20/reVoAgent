// 🚀 Enterprise API Service for reVoAgent Production Backend
// Connects to our 100-agent coordination system and three-engine architecture

export interface EnterpriseAgentStatus {
  id: string;
  type: 'claude' | 'gemini' | 'openhands';
  status: 'active' | 'idle' | 'busy' | 'error';
  current_task?: string;
  performance_score: number;
  tasks_completed: number;
  specialization: string[];
  cost_per_task: number;
  last_activity: string;
}

export interface Epic {
  id?: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimated_complexity: number;
  requirements: string[];
  deadline?: string;
}

export interface TaskResult {
  id: string;
  epic_id: string;
  agent_id: string;
  agent_type: string;
  task_type: 'analysis' | 'code_generation' | 'testing' | 'deployment';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result?: any;
  quality_score?: number;
  created_at: string;
  completed_at?: string;
  execution_time_ms?: number;
}

export interface EngineMetrics {
  perfect_recall: {
    status: 'healthy' | 'degraded' | 'error';
    memory_count: number;
    query_latency_ms: number;
    success_rate: number;
    storage_usage_mb: number;
    knowledge_graph_nodes: number;
  };
  parallel_mind: {
    status: 'healthy' | 'degraded' | 'error';
    active_workers: number;
    queue_size: number;
    throughput_per_minute: number;
    load_balancing_efficiency: number;
  };
  creative: {
    status: 'healthy' | 'degraded' | 'error';
    creativity_score: number;
    patterns_generated: number;
    innovation_index: number;
    solution_uniqueness: number;
  };
}

export interface MonitoringData {
  system: {
    uptime_seconds: number;
    cpu_usage: number;
    memory_usage: number;
    active_connections: number;
    response_time_ms: number;
  };
  agents: {
    total_count: number;
    active_count: number;
    claude_agents: number;
    gemini_agents: number;
    openhands_agents: number;
    success_rate: number;
    average_response_time_ms: number;
    tasks_per_hour: number;
  };
  cost_optimization: {
    local_model_usage_percent: number;
    monthly_savings_usd: number;
    cost_per_request_usd: number;
    total_requests_today: number;
    local_requests_today: number;
  };
  quality_gates: {
    overall_score: number;
    security_score: number;
    performance_score: number;
    test_coverage: number;
    documentation_score: number;
    passed_validations: number;
    failed_validations: number;
  };
}

export interface QualityValidationResult {
  validation_id: string;
  overall_score: number;
  quality_level: 'poor' | 'fair' | 'good' | 'excellent';
  passed_gates: number;
  failed_gates: number;
  issues_found: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    line?: number;
  }>;
  quality_metrics: {
    syntax_score: number;
    security_score: number;
    performance_score: number;
    test_coverage_score: number;
    documentation_score: number;
  };
}

export class EnterpriseApiService {
  private baseURL: string;
  private apiVersion: string = 'v1';

  constructor() {
    // Use port 12001 for production backend
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:12001';
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseURL}/api/${this.apiVersion}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API Error ${response.status}: ${errorData.detail || response.statusText}`);
    }

    return response.json();
  }

  // 👥 100-Agent Coordination APIs
  async getAgentStatus(): Promise<EnterpriseAgentStatus[]> {
    return this.request<EnterpriseAgentStatus[]>('/agents/status');
  }

  async getAgentById(agentId: string): Promise<EnterpriseAgentStatus> {
    return this.request<EnterpriseAgentStatus>(`/agents/${agentId}`);
  }

  async getAgentsByType(agentType: 'claude' | 'gemini' | 'openhands'): Promise<EnterpriseAgentStatus[]> {
    return this.request<EnterpriseAgentStatus[]>(`/agents/type/${agentType}`);
  }

  async coordinateEpic(epic: Epic): Promise<TaskResult[]> {
    return this.request<TaskResult[]>('/agents/coordinate', {
      method: 'POST',
      body: JSON.stringify(epic),
    });
  }

  async getEpicStatus(epicId: string): Promise<TaskResult[]> {
    return this.request<TaskResult[]>(`/agents/epic/${epicId}/status`);
  }

  async assignTaskToAgent(agentId: string, task: any): Promise<TaskResult> {
    return this.request<TaskResult>(`/agents/${agentId}/assign`, {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  async getAgentPerformance(): Promise<any> {
    return this.request('/agents/performance');
  }

  async getTeamCoordination(): Promise<any> {
    return this.request('/agents/team-coordination');
  }

  // 🧠 Three-Engine APIs
  async getEngineMetrics(): Promise<EngineMetrics> {
    return this.request<EngineMetrics>('/engines/metrics');
  }

  async executeEngineTask(engineType: 'perfect_recall' | 'parallel_mind' | 'creative', task: any): Promise<any> {
    return this.request(`/engines/${engineType}/execute`, {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  async getEngineHealth(): Promise<Record<string, any>> {
    return this.request('/engines/health');
  }

  async getPerfectRecallMemories(query?: string, limit?: number): Promise<any> {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (limit) params.append('limit', limit.toString());
    
    return this.request(`/engines/perfect_recall/memories?${params}`);
  }

  async getParallelMindTasks(): Promise<any> {
    return this.request('/engines/parallel_mind/tasks');
  }

  async getCreativePatterns(): Promise<any> {
    return this.request('/engines/creative/patterns');
  }

  // 📊 Enterprise Monitoring APIs
  async getMonitoringDashboard(): Promise<MonitoringData> {
    return this.request<MonitoringData>('/monitoring/dashboard');
  }

  async getSystemHealth(): Promise<any> {
    return this.request('/monitoring/health');
  }

  async getCostOptimizationMetrics(): Promise<any> {
    return this.request('/monitoring/cost-optimization');
  }

  async getPerformanceMetrics(): Promise<any> {
    return this.request('/monitoring/performance');
  }

  async getSecurityMetrics(): Promise<any> {
    return this.request('/monitoring/security');
  }

  // 🛡️ Quality Gates APIs
  async getQualityGatesStatus(): Promise<any> {
    return this.request('/enterprise/quality-gates');
  }

  async validateCode(code: string, context: string): Promise<QualityValidationResult> {
    return this.request<QualityValidationResult>('/enterprise/validate-code', {
      method: 'POST',
      body: JSON.stringify({ code, context }),
    });
  }

  async getQualityMetrics(): Promise<any> {
    return this.request('/enterprise/quality-metrics');
  }

  async getValidationHistory(limit?: number): Promise<any> {
    const params = limit ? `?limit=${limit}` : '';
    return this.request(`/enterprise/validation-history${params}`);
  }

  // 🏢 Enterprise Management APIs
  async getTeamPerformance(): Promise<any> {
    return this.request('/enterprise/team-performance');
  }

  async getProductivityMetrics(): Promise<any> {
    return this.request('/enterprise/productivity');
  }

  async getResourceUtilization(): Promise<any> {
    return this.request('/enterprise/resource-utilization');
  }

  async getComplianceStatus(): Promise<any> {
    return this.request('/enterprise/compliance');
  }

  // 🔍 Memory & Knowledge APIs
  async storeMemory(content: string, metadata: any): Promise<any> {
    return this.request('/memory/store', {
      method: 'POST',
      body: JSON.stringify({ content, metadata }),
    });
  }

  async searchMemory(query: string, limit?: number): Promise<any> {
    const params = new URLSearchParams({ query });
    if (limit) params.append('limit', limit.toString());
    
    return this.request(`/memory/search?${params}`);
  }

  async getKnowledgeGraph(): Promise<any> {
    return this.request('/memory/knowledge-graph');
  }

  async getMemoryStatistics(): Promise<any> {
    return this.request('/memory/statistics');
  }

  // 🎨 Creative Engine APIs
  async generateCreativeSolution(prompt: string, context: any): Promise<any> {
    return this.request('/creative/generate', {
      method: 'POST',
      body: JSON.stringify({ prompt, context }),
    });
  }

  async getCreativityMetrics(): Promise<any> {
    return this.request('/creative/metrics');
  }

  async getInnovationIndex(): Promise<any> {
    return this.request('/creative/innovation-index');
  }

  // 💰 Cost Optimization APIs
  async getCostBreakdown(): Promise<any> {
    return this.request('/cost/breakdown');
  }

  async getLocalModelUsage(): Promise<any> {
    return this.request('/cost/local-model-usage');
  }

  async getSavingsReport(): Promise<any> {
    return this.request('/cost/savings-report');
  }

  // 🔄 Real-time Updates
  async subscribeToUpdates(callback: (data: any) => void): Promise<WebSocket> {
    const wsUrl = `${this.baseURL.replace('http', 'ws')}/ws`;
    const ws = new WebSocket(wsUrl);
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        callback(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    return ws;
  }

  // 🧪 Testing & Validation APIs
  async runSystemTest(): Promise<any> {
    return this.request('/testing/system-test', { method: 'POST' });
  }

  async getTestResults(): Promise<any> {
    return this.request('/testing/results');
  }

  async validateSystemHealth(): Promise<any> {
    return this.request('/testing/health-check', { method: 'POST' });
  }
}

// Export singleton instance
export const enterpriseApi = new EnterpriseApiService();

// Export types for use in components
export type {
  EnterpriseAgentStatus,
  Epic,
  TaskResult,
  EngineMetrics,
  MonitoringData,
  QualityValidationResult,
};