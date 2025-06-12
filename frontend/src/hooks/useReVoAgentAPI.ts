/**
 * reVoAgent Frontend API Integration Hooks
 * Complete integration with Three-Engine Backend
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// =============================================================================
// API CLIENT CONFIGURATION
// =============================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:12000';
const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:12000';

class APIClient {
  private baseURL: string;
  private token: string | null;

  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('revoagent_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('revoagent_token', token);
  }

  getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  async get(endpoint: string) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint: string) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

const apiClient = new APIClient();

// =============================================================================
// WEBSOCKET MANAGER
// =============================================================================

class WebSocketManager {
  private connections = new Map<string, WebSocket>();
  private reconnectAttempts = new Map<string, number>();
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(endpoint: string, sessionId: string, onMessage: (data: any) => void, onError?: (error: Event) => void) {
    const wsUrl = `${WS_BASE_URL}/ws/${endpoint}/${sessionId}`;
    const ws = new WebSocket(wsUrl);
    
    const connectionKey = `${endpoint}-${sessionId}`;
    
    ws.onopen = () => {
      console.log(`WebSocket connected: ${connectionKey}`);
      this.reconnectAttempts.set(connectionKey, 0);
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };
    
    ws.onclose = () => {
      console.log(`WebSocket disconnected: ${connectionKey}`);
      this.handleReconnect(endpoint, sessionId, onMessage, onError);
    };
    
    ws.onerror = (error) => {
      console.error(`WebSocket error: ${connectionKey}`, error);
      if (onError) onError(error);
    };
    
    this.connections.set(connectionKey, ws);
    return ws;
  }

  private handleReconnect(endpoint: string, sessionId: string, onMessage: (data: any) => void, onError?: (error: Event) => void) {
    const connectionKey = `${endpoint}-${sessionId}`;
    const attempts = this.reconnectAttempts.get(connectionKey) || 0;
    
    if (attempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        console.log(`Attempting to reconnect: ${connectionKey} (${attempts + 1}/${this.maxReconnectAttempts})`);
        this.reconnectAttempts.set(connectionKey, attempts + 1);
        this.connect(endpoint, sessionId, onMessage, onError);
      }, this.reconnectDelay * Math.pow(2, attempts));
    }
  }

  disconnect(endpoint: string, sessionId: string) {
    const connectionKey = `${endpoint}-${sessionId}`;
    const ws = this.connections.get(connectionKey);
    if (ws) {
      ws.close();
      this.connections.delete(connectionKey);
      this.reconnectAttempts.delete(connectionKey);
    }
  }

  send(endpoint: string, sessionId: string, data: any) {
    const connectionKey = `${endpoint}-${sessionId}`;
    const ws = this.connections.get(connectionKey);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }
}

const wsManager = new WebSocketManager();

// =============================================================================
// CUSTOM HOOKS
// =============================================================================

// System Metrics Hook
export const useSystemMetrics = () => {
  const [metrics, setMetrics] = useState({
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 0,
    activeRequests: 0,
    queueLength: 0,
    responseTime: 0,
    uptime: 0,
    timestamp: new Date()
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await apiClient.get('/api/system/metrics');
        setMetrics(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  return { metrics, loading, error };
};

// Engine Status Hook
export const useEngineStatus = () => {
  const [engines, setEngines] = useState({
    memory: { status: 'idle', entities: 0, speed: 0, cost: 0 },
    parallel: { status: 'idle', workers: 0, load: 0, throughput: 0 },
    creative: { status: 'idle', patterns: 0, novelty: 0, innovation: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEngineStatus = async () => {
      try {
        const data = await apiClient.get('/api/engines/status');
        setEngines(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch engine status');
      } finally {
        setLoading(false);
      }
    };

    fetchEngineStatus();
    const interval = setInterval(fetchEngineStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  return { engines, loading, error };
};

// Agents Hook
export const useAgents = () => {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = useCallback(async () => {
    try {
      const data = await apiClient.get('/api/agents');
      setAgents(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch agents');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const createTask = useCallback(async (taskData: any) => {
    try {
      const response = await apiClient.post('/api/tasks', taskData);
      return response;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create task');
    }
  }, []);

  return { agents, loading, error, refetch: fetchAgents, createTask };
};

// Cost Analytics Hook
export const useCostAnalytics = () => {
  const [costData, setCostData] = useState({
    totalSavings: 0,
    localProcessing: 0,
    cloudFallback: 0,
    deepSeekCost: 0,
    openAICost: 0,
    llamaCost: 0,
    anthropicCost: 0,
    monthlyProjection: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCostData = async () => {
      try {
        const data = await apiClient.get('/api/analytics/costs');
        setCostData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch cost data');
      } finally {
        setLoading(false);
      }
    };

    fetchCostData();
    const interval = setInterval(fetchCostData, 30000);
    return () => clearInterval(interval);
  }, []);

  return { costData, loading, error };
};

// Real-time Chat Hook
export const useRealtimeChat = (sessionId: string) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleMessage = (data: any) => {
      if (data.type === 'message') {
        setMessages(prev => [...prev, data.message]);
      } else if (data.type === 'status') {
        setConnected(data.connected);
      }
    };

    const handleError = (error: Event) => {
      setError('WebSocket connection error');
      setConnected(false);
    };

    wsManager.connect('chat', sessionId, handleMessage, handleError);
    setConnected(true);

    return () => {
      wsManager.disconnect('chat', sessionId);
      setConnected(false);
    };
  }, [sessionId]);

  const sendMessage = useCallback((message: string, agentId?: string) => {
    wsManager.send('chat', sessionId, {
      type: 'message',
      content: message,
      agent_id: agentId,
      timestamp: new Date().toISOString()
    });
  }, [sessionId]);

  return { messages, connected, error, sendMessage };
};

// Memory System Hook
export const useMemorySystem = () => {
  const [memoryStats, setMemoryStats] = useState({
    totalEntities: 0,
    totalRelationships: 0,
    averageRetrievalTime: 0,
    memoryUsage: 0,
    lastUpdate: new Date()
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchMemory = useCallback(async (query: string, limit = 10) => {
    try {
      const response = await apiClient.post('/api/memory/search', { query, limit });
      return response;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Memory search failed');
    }
  }, []);

  const addMemory = useCallback(async (content: string, metadata: any = {}) => {
    try {
      const response = await apiClient.post('/api/memory/add', { content, metadata });
      return response;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add memory');
    }
  }, []);

  useEffect(() => {
    const fetchMemoryStats = async () => {
      try {
        const data = await apiClient.get('/api/memory/stats');
        setMemoryStats(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch memory stats');
      } finally {
        setLoading(false);
      }
    };

    fetchMemoryStats();
    const interval = setInterval(fetchMemoryStats, 10000);
    return () => clearInterval(interval);
  }, []);

  return { memoryStats, loading, error, searchMemory, addMemory };
};

// External Integrations Hook
export const useExternalIntegrations = () => {
  const [integrations, setIntegrations] = useState({
    github: { connected: false, status: 'disconnected' },
    slack: { connected: false, status: 'disconnected' },
    jira: { connected: false, status: 'disconnected' }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const connectIntegration = useCallback(async (service: string, credentials: any) => {
    try {
      const response = await apiClient.post(`/api/integrations/${service}/connect`, credentials);
      setIntegrations(prev => ({
        ...prev,
        [service]: { connected: true, status: 'connected' }
      }));
      return response;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : `Failed to connect ${service}`);
    }
  }, []);

  const disconnectIntegration = useCallback(async (service: string) => {
    try {
      await apiClient.post(`/api/integrations/${service}/disconnect`);
      setIntegrations(prev => ({
        ...prev,
        [service]: { connected: false, status: 'disconnected' }
      }));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : `Failed to disconnect ${service}`);
    }
  }, []);

  useEffect(() => {
    const fetchIntegrationStatus = async () => {
      try {
        const data = await apiClient.get('/api/integrations/status');
        setIntegrations(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch integration status');
      } finally {
        setLoading(false);
      }
    };

    fetchIntegrationStatus();
  }, []);

  return { integrations, loading, error, connectIntegration, disconnectIntegration };
};

// Main Dashboard Hook (combines all data)
export const useReVoAgentDashboard = () => {
  const systemMetrics = useSystemMetrics();
  const engineStatus = useEngineStatus();
  const agents = useAgents();
  const costAnalytics = useCostAnalytics();
  const memorySystem = useMemorySystem();
  const integrations = useExternalIntegrations();

  const loading = systemMetrics.loading || engineStatus.loading || agents.loading || 
                  costAnalytics.loading || memorySystem.loading || integrations.loading;

  const error = systemMetrics.error || engineStatus.error || agents.error || 
                costAnalytics.error || memorySystem.error || integrations.error;

  return {
    systemMetrics: systemMetrics.metrics,
    engines: engineStatus.engines,
    agents: agents.agents,
    costData: costAnalytics.costData,
    memoryStats: memorySystem.memoryStats,
    integrations: integrations.integrations,
    loading,
    error,
    actions: {
      createTask: agents.createTask,
      searchMemory: memorySystem.searchMemory,
      addMemory: memorySystem.addMemory,
      connectIntegration: integrations.connectIntegration,
      disconnectIntegration: integrations.disconnectIntegration,
      refetchAgents: agents.refetch
    }
  };
};

export { apiClient, wsManager };