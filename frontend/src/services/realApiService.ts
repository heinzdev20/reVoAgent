/**
 * Real API Service for reVoAgent Frontend
 * Connects to the enterprise-ready backend with real AI integrations
 */

import { Agent, AgentConfig, AgentStatus, AIModel, Metrics, CostData, SecurityStatus } from '../types';

// API Configuration
const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  wsURL: import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000
};

// API Response Types
interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  timestamp: string;
}

interface AgentPerformanceMetrics {
  agent_id: string;
  tasks_completed: number;
  success_rate: number;
  average_response_time: number;
  cost_efficiency: number;
  quality_score: number;
}

interface SystemMetrics {
  total_agents: number;
  active_agents: number;
  total_requests: number;
  success_rate: number;
  average_response_time: number;
  cost_savings: number;
  uptime_percentage: number;
}

interface RealTimeUpdate {
  type: 'agent_status' | 'performance_metrics' | 'cost_update' | 'security_alert';
  data: any;
  timestamp: string;
}

class RealAPIService {
  private baseURL: string;
  private wsURL: string;
  private authToken: string | null = null;
  private wsConnection: WebSocket | null = null;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.baseURL = API_CONFIG.baseURL;
    this.wsURL = API_CONFIG.wsURL;
    this.initializeAuth();
  }

  // Authentication
  private initializeAuth(): void {
    this.authToken = localStorage.getItem('auth_token');
  }

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    
    return headers;
  }

  // HTTP Request Helper
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Authentication Methods
  async login(email: string, password: string): Promise<APIResponse<{ token: string; user: any }>> {
    const response = await this.makeRequest<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.success && response.data.token) {
      this.authToken = response.data.token;
      localStorage.setItem('auth_token', this.authToken);
    }
    
    return response;
  }

  async logout(): Promise<void> {
    this.authToken = null;
    localStorage.removeItem('auth_token');
    this.disconnectWebSocket();
  }

  // AI Model Management
  async getAIModels(): Promise<APIResponse<AIModel[]>> {
    return this.makeRequest<AIModel[]>('/api/models');
  }

  async getModelStatus(modelId: string): Promise<APIResponse<any>> {
    return this.makeRequest<any>(`/api/models/${modelId}/status`);
  }

  async getModelUsage(): Promise<APIResponse<any>> {
    return this.makeRequest<any>('/api/models/usage');
  }

  // Agent Management
  async getAgents(): Promise<APIResponse<Agent[]>> {
    return this.makeRequest<Agent[]>('/api/agents');
  }

  async createAgent(config: AgentConfig): Promise<APIResponse<Agent>> {
    return this.makeRequest<Agent>('/api/agents', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  async getAgentStatus(agentId: string): Promise<APIResponse<AgentStatus>> {
    return this.makeRequest<AgentStatus>(`/api/agents/${agentId}/status`);
  }

  async updateAgent(agentId: string, config: Partial<AgentConfig>): Promise<APIResponse<Agent>> {
    return this.makeRequest<Agent>(`/api/agents/${agentId}`, {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  }

  async deleteAgent(agentId: string): Promise<APIResponse<void>> {
    return this.makeRequest<void>(`/api/agents/${agentId}`, {
      method: 'DELETE',
    });
  }

  async startAgent(agentId: string): Promise<APIResponse<void>> {
    return this.makeRequest<void>(`/api/agents/${agentId}/start`, {
      method: 'POST',
    });
  }

  async stopAgent(agentId: string): Promise<APIResponse<void>> {
    return this.makeRequest<void>(`/api/agents/${agentId}/stop`, {
      method: 'POST',
    });
  }

  // Agent Coordination (100-agent system)
  async getAgentCoordination(): Promise<APIResponse<any>> {
    return this.makeRequest<any>('/api/coordination');
  }

  async getClaudeAgents(): Promise<APIResponse<Agent[]>> {
    return this.makeRequest<Agent[]>('/api/agents?type=claude');
  }

  async getGeminiAgents(): Promise<APIResponse<Agent[]>> {
    return this.makeRequest<Agent[]>('/api/agents?type=gemini');
  }

  async getOpenHandsAgents(): Promise<APIResponse<Agent[]>> {
    return this.makeRequest<Agent[]>('/api/agents?type=openhands');
  }

  // Performance Metrics
  async getSystemMetrics(): Promise<APIResponse<SystemMetrics>> {
    return this.makeRequest<SystemMetrics>('/api/metrics/system');
  }

  async getAgentMetrics(agentId?: string): Promise<APIResponse<AgentPerformanceMetrics[]>> {
    const endpoint = agentId ? `/api/metrics/agents/${agentId}` : '/api/metrics/agents';
    return this.makeRequest<AgentPerformanceMetrics[]>(endpoint);
  }

  async getPerformanceMetrics(): Promise<APIResponse<Metrics>> {
    return this.makeRequest<Metrics>('/api/metrics/performance');
  }

  // Cost Analytics
  async getCostAnalytics(): Promise<APIResponse<CostData>> {
    return this.makeRequest<CostData>('/api/analytics/costs');
  }

  async getCostOptimization(): Promise<APIResponse<any>> {
    return this.makeRequest<any>('/api/analytics/cost-optimization');
  }

  async getCostSavings(): Promise<APIResponse<any>> {
    return this.makeRequest<any>('/api/analytics/cost-savings');
  }

  // Security & Compliance
  async getSecurityStatus(): Promise<APIResponse<SecurityStatus>> {
    return this.makeRequest<SecurityStatus>('/api/security/status');
  }

  async getSecurityAlerts(): Promise<APIResponse<any[]>> {
    return this.makeRequest<any[]>('/api/security/alerts');
  }

  async getComplianceStatus(): Promise<APIResponse<any>> {
    return this.makeRequest<any>('/api/compliance/status');
  }

  async getAuditLogs(): Promise<APIResponse<any[]>> {
    return this.makeRequest<any[]>('/api/audit/logs');
  }

  // Quality Gates
  async getQualityMetrics(): Promise<APIResponse<any>> {
    return this.makeRequest<any>('/api/quality/metrics');
  }

  async validateCode(code: string, language: string): Promise<APIResponse<any>> {
    return this.makeRequest<any>('/api/quality/validate', {
      method: 'POST',
      body: JSON.stringify({ code, language }),
    });
  }

  // Enterprise Features
  async getEnterpriseStatus(): Promise<APIResponse<any>> {
    return this.makeRequest<any>('/api/enterprise/status');
  }

  async getEnterpriseMetrics(): Promise<APIResponse<any>> {
    return this.makeRequest<any>('/api/enterprise/metrics');
  }

  // Task Management
  async createTask(task: any): Promise<APIResponse<any>> {
    return this.makeRequest<any>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  async getTasks(): Promise<APIResponse<any[]>> {
    return this.makeRequest<any[]>('/api/tasks');
  }

  async getTaskStatus(taskId: string): Promise<APIResponse<any>> {
    return this.makeRequest<any>(`/api/tasks/${taskId}/status`);
  }

  // WebSocket Real-Time Connection
  connectWebSocket(): void {
    if (this.wsConnection?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    const wsUrl = `${this.wsURL}/ws${this.authToken ? `?token=${this.authToken}` : ''}`;
    
    try {
      this.wsConnection = new WebSocket(wsUrl);
      
      this.wsConnection.onopen = () => {
        console.log('✅ WebSocket connected');
        this.emit('connected', null);
      };
      
      this.wsConnection.onmessage = (event) => {
        try {
          const update: RealTimeUpdate = JSON.parse(event.data);
          this.handleRealTimeUpdate(update);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
      
      this.wsConnection.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        this.emit('disconnected', null);
        
        // Auto-reconnect after 5 seconds
        setTimeout(() => {
          if (this.authToken) {
            this.connectWebSocket();
          }
        }, 5000);
      };
      
      this.wsConnection.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        this.emit('error', error);
      };
      
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }

  disconnectWebSocket(): void {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
  }

  private handleRealTimeUpdate(update: RealTimeUpdate): void {
    console.log('📡 Real-time update:', update.type, update.data);
    this.emit(update.type, update.data);
    this.emit('update', update);
  }

  // Event System
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Health Check
  async healthCheck(): Promise<APIResponse<any>> {
    return this.makeRequest<any>('/health');
  }

  // System Information
  async getSystemInfo(): Promise<APIResponse<any>> {
    return this.makeRequest<any>('/api/system/info');
  }
}

// Create singleton instance
export const realApiService = new RealAPIService();

// Export types
export type { 
  APIResponse, 
  AgentPerformanceMetrics, 
  SystemMetrics, 
  RealTimeUpdate 
};

// Export default
export default realApiService;