// 🔄 Enterprise WebSocket Service for Real-time Updates
// Connects to our production backend for live agent coordination and monitoring

import type { WebSocketMessage } from '@/types';

export interface EnterpriseWebSocketMessage extends WebSocketMessage {
  type: 'agent_status_update' | 'engine_metrics' | 'monitoring_alert' | 'task_update' | 'quality_gate_result' | 'cost_update' | 'epic_coordination';
  timestamp: string;
  payload: any;
}

export interface AgentStatusUpdate {
  agent_id: string;
  agent_type: 'claude' | 'gemini' | 'openhands';
  status: 'active' | 'idle' | 'busy' | 'error';
  current_task?: string;
  performance_score: number;
  tasks_completed: number;
}

export interface TaskUpdate {
  task_id: string;
  epic_id: string;
  agent_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  result?: any;
  quality_score?: number;
}

export interface MonitoringAlert {
  severity: 'info' | 'warning' | 'error' | 'critical';
  component: string;
  message: string;
  timestamp: string;
  details?: any;
}

export interface EngineMetricsUpdate {
  engine_type: 'perfect_recall' | 'parallel_mind' | 'creative';
  metrics: {
    status: 'healthy' | 'degraded' | 'error';
    performance_score: number;
    latency_ms: number;
    throughput: number;
  };
}

export interface CostUpdate {
  local_model_usage_percent: number;
  cost_savings_usd: number;
  requests_today: number;
  cost_per_request: number;
}

type EventHandler = (data: any) => void;

export class EnterpriseWebSocketService {
  private ws: WebSocket | null = null;
  private eventHandlers: Map<string, EventHandler[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private connectionId: string | null = null;

  constructor() {
    // Auto-connect on instantiation
    this.connect();
  }

  connect(): void {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;

    // Use port 12001 for production backend WebSocket
    const baseUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:12001';
    const wsUrl = `${baseUrl}/ws`;

    console.log('🔄 Connecting to Enterprise WebSocket:', wsUrl);

    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('🔄 Enterprise WebSocket connected');
      this.reconnectAttempts = 0;
      this.isConnecting = false;
      
      // Send initial subscription message
      this.send({
        type: 'subscribe',
        channels: [
          'agent_updates', 
          'engine_metrics', 
          'monitoring', 
          'quality_gates', 
          'cost_optimization',
          'task_updates',
          'epic_coordination'
        ],
        timestamp: new Date().toISOString()
      });
      
      // Trigger connection event
      this.emit('connected', { timestamp: new Date().toISOString() });
    };

    this.ws.onmessage = (event) => {
      try {
        const message: EnterpriseWebSocketMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Failed to parse Enterprise WebSocket message:', error);
      }
    };

    this.ws.onclose = (event) => {
      console.log('🔄 Enterprise WebSocket disconnected:', event.code, event.reason);
      this.isConnecting = false;
      this.connectionId = null;
      
      // Trigger disconnection event
      this.emit('disconnected', { 
        code: event.code, 
        reason: event.reason,
        timestamp: new Date().toISOString()
      });
      
      this.attemptReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('🔄 Enterprise WebSocket error:', error);
      this.isConnecting = false;
      
      // Trigger error event
      this.emit('error', { 
        error: error,
        timestamp: new Date().toISOString()
      });
    };
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    this.eventHandlers.clear();
    this.connectionId = null;
  }

  private handleMessage(message: EnterpriseWebSocketMessage): void {
    // Store connection ID if provided
    if (message.type === 'connection_established' && message.payload?.connection_id) {
      this.connectionId = message.payload.connection_id;
    }

    // Handle specific message types
    switch (message.type) {
      case 'agent_status_update':
        this.emit('agent_status', message.payload);
        break;
      case 'task_update':
        this.emit('task_update', message.payload);
        break;
      case 'engine_metrics':
        this.emit('engine_metrics', message.payload);
        break;
      case 'monitoring_alert':
        this.emit('monitoring_alert', message.payload);
        break;
      case 'quality_gate_result':
        this.emit('quality_gate', message.payload);
        break;
      case 'cost_update':
        this.emit('cost_update', message.payload);
        break;
      case 'epic_coordination':
        this.emit('epic_coordination', message.payload);
        break;
    }

    // Emit generic message event
    this.emit('message', message);
    
    // Emit type-specific event
    this.emit(message.type, message.payload);
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff
      
      console.log(`🔄 Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);
      
      setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.error('🔄 Max reconnection attempts reached. Please refresh the page.');
      this.emit('max_reconnect_attempts', { 
        attempts: this.reconnectAttempts,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Event handling
  on(eventType: string, handler: EventHandler): () => void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(handler);

    // Return unsubscribe function
    return () => this.off(eventType, handler);
  }

  off(eventType: string, handler: EventHandler): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private emit(eventType: string, data: any): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in WebSocket event handler for ${eventType}:`, error);
        }
      });
    }
  }

  // Convenience subscription methods
  subscribeToAgentUpdates(callback: (update: AgentStatusUpdate) => void): () => void {
    return this.on('agent_status', callback);
  }

  subscribeToTaskUpdates(callback: (update: TaskUpdate) => void): () => void {
    return this.on('task_update', callback);
  }

  subscribeToMonitoringAlerts(callback: (alert: MonitoringAlert) => void): () => void {
    return this.on('monitoring_alert', callback);
  }

  subscribeToEngineMetrics(callback: (metrics: EngineMetricsUpdate) => void): () => void {
    return this.on('engine_metrics', callback);
  }

  subscribeToQualityGates(callback: (result: any) => void): () => void {
    return this.on('quality_gate', callback);
  }

  subscribeToCostUpdates(callback: (update: CostUpdate) => void): () => void {
    return this.on('cost_update', callback);
  }

  subscribeToEpicCoordination(callback: (epic: any) => void): () => void {
    return this.on('epic_coordination', callback);
  }

  // Send messages to backend
  send(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const enhancedMessage = {
        ...message,
        connection_id: this.connectionId,
        timestamp: new Date().toISOString()
      };
      this.ws.send(JSON.stringify(enhancedMessage));
    } else {
      console.warn('Enterprise WebSocket is not connected. Message not sent:', message);
    }
  }

  // Command methods
  sendAgentCommand(agentId: string, command: any): void {
    this.send({
      type: 'agent_command',
      agent_id: agentId,
      command: command
    });
  }

  sendEpicCoordination(epic: any): void {
    this.send({
      type: 'coordinate_epic',
      epic: epic
    });
  }

  sendEngineTask(engineType: string, task: any): void {
    this.send({
      type: 'engine_task',
      engine_type: engineType,
      task: task
    });
  }

  sendQualityValidation(code: string, context: string): void {
    this.send({
      type: 'validate_code',
      code: code,
      context: context
    });
  }

  requestMetricsUpdate(): void {
    this.send({
      type: 'request_metrics_update'
    });
  }

  // Connection status
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  get connectionState(): string {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN: return 'connected';
      case WebSocket.CLOSING: return 'closing';
      case WebSocket.CLOSED: return 'disconnected';
      default: return 'unknown';
    }
  }

  get reconnectAttemptsRemaining(): number {
    return Math.max(0, this.maxReconnectAttempts - this.reconnectAttempts);
  }
}

// Export singleton instance
export const enterpriseWebSocket = new EnterpriseWebSocketService();

// Export types
export type {
  EnterpriseWebSocketMessage,
  AgentStatusUpdate,
  TaskUpdate,
  MonitoringAlert,
  EngineMetricsUpdate,
  CostUpdate,
};