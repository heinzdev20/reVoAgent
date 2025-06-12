/**
 * Enhanced WebSocket Service with reconnection and state management
 * Part of reVoAgent Next Phase Implementation
 */

export interface WebSocketMessage {
  type: string;
  channel?: string;
  payload: any;
  timestamp?: string;
}

export interface ConnectionOptions {
  url: string;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  heartbeatInterval?: number;
}

export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error';

export class EnhancedWebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts: number;
  private reconnectInterval: number;
  private heartbeatInterval: number;
  private messageQueue: WebSocketMessage[] = [];
  private subscribers = new Map<string, Set<Function>>();
  private connectionState: ConnectionState = 'disconnected';
  private stateListeners = new Set<(state: ConnectionState) => void>();
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private connectionId: string;

  constructor(options: ConnectionOptions) {
    this.maxReconnectAttempts = options.reconnectAttempts || 5;
    this.reconnectInterval = options.reconnectInterval || 1000;
    this.heartbeatInterval = options.heartbeatInterval || 30000;
    this.connectionId = this.generateConnectionId();
  }

  private generateConnectionId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getWebSocketUrl(): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}/ws/${this.connectionId}`;
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.setConnectionState('connecting');
        const url = this.getWebSocketUrl();
        this.ws = new WebSocket(url);
        
        this.ws.onopen = () => {
          console.log('🔗 WebSocket connected:', this.connectionId);
          this.setConnectionState('connected');
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.flushMessageQueue();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('🔌 WebSocket disconnected:', event.code, event.reason);
          this.setConnectionState('disconnected');
          this.stopHeartbeat();
          
          if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.handleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          this.setConnectionState('error');
          reject(error);
        };

        // Connection timeout
        setTimeout(() => {
          if (this.connectionState === 'connecting') {
            this.ws?.close();
            reject(new Error('Connection timeout'));
          }
        }, 10000);

      } catch (error) {
        this.setConnectionState('error');
        reject(error);
      }
    });
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('🚫 Max reconnection attempts reached');
      this.setConnectionState('error');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff
    
    console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);
    
    this.reconnectTimer = setTimeout(async () => {
      try {
        await this.connect();
      } catch (error) {
        console.error('Reconnection failed:', error);
        this.handleReconnect();
      }
    }, delay);
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({
          type: 'heartbeat',
          payload: { timestamp: new Date().toISOString() }
        });
      }
    }, this.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private setConnectionState(state: ConnectionState): void {
    if (this.connectionState !== state) {
      this.connectionState = state;
      this.stateListeners.forEach(listener => listener(state));
    }
  }

  onConnectionStateChange(listener: (state: ConnectionState) => void): () => void {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  subscribe(channel: string, callback: Function): () => void {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, new Set());
    }
    this.subscribers.get(channel)!.add(callback);

    // Send subscription message if connected
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.send({
        type: 'subscribe',
        payload: { channel }
      });
    }

    // Return unsubscribe function
    return () => {
      this.subscribers.get(channel)?.delete(callback);
      if (this.subscribers.get(channel)?.size === 0) {
        this.subscribers.delete(channel);
        
        // Send unsubscribe message if connected
        if (this.ws?.readyState === WebSocket.OPEN) {
          this.send({
            type: 'unsubscribe',
            payload: { channel }
          });
        }
      }
    };
  }

  send(message: WebSocketMessage): void {
    const messageWithTimestamp = {
      ...message,
      timestamp: new Date().toISOString()
    };

    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(messageWithTimestamp));
      } catch (error) {
        console.error('Failed to send WebSocket message:', error);
        this.messageQueue.push(messageWithTimestamp);
      }
    } else {
      this.messageQueue.push(messageWithTimestamp);
    }
  }

  private handleMessage(data: any): void {
    const { type, channel, payload } = data;

    // Handle system messages
    if (type === 'heartbeat_response') {
      return; // Heartbeat acknowledged
    }

    if (type === 'error') {
      console.error('WebSocket server error:', payload);
      return;
    }

    // Handle channel-specific messages
    if (channel) {
      const channelSubscribers = this.subscribers.get(channel);
      if (channelSubscribers) {
        channelSubscribers.forEach(callback => {
          try {
            callback(payload);
          } catch (error) {
            console.error(`Error in subscriber callback for channel ${channel}:`, error);
          }
        });
      }
    }

    // Handle global subscribers (listening to all messages)
    const globalSubscribers = this.subscribers.get('*');
    if (globalSubscribers) {
      globalSubscribers.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in global subscriber callback:', error);
        }
      });
    }
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.send(message);
      }
    }
  }

  disconnect(): void {
    console.log('🔌 Manually disconnecting WebSocket');
    
    // Clear timers
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.stopHeartbeat();

    // Close connection
    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }

    this.setConnectionState('disconnected');
    this.subscribers.clear();
    this.messageQueue = [];
  }

  // Utility methods for common operations
  requestAgentStatus(agentId?: string): void {
    this.send({
      type: 'get_agent_status',
      payload: agentId ? { agent_id: agentId } : { all: true }
    });
  }

  requestSystemMetrics(): void {
    this.send({
      type: 'get_system_metrics',
      payload: {}
    });
  }

  requestEngineStatus(): void {
    this.send({
      type: 'get_engine_status',
      payload: {}
    });
  }

  submitAgentTask(agentId: string, task: string, parameters?: any): void {
    this.send({
      type: 'agent_task',
      payload: {
        agent_id: agentId,
        task,
        parameters: parameters || {}
      }
    });
  }

  // Health check method
  isHealthy(): boolean {
    return this.connectionState === 'connected' && 
           this.ws?.readyState === WebSocket.OPEN;
  }

  // Get connection statistics
  getStats(): {
    connectionState: ConnectionState;
    reconnectAttempts: number;
    subscriberCount: number;
    queuedMessages: number;
    connectionId: string;
  } {
    return {
      connectionState: this.connectionState,
      reconnectAttempts: this.reconnectAttempts,
      subscriberCount: this.subscribers.size,
      queuedMessages: this.messageQueue.length,
      connectionId: this.connectionId
    };
  }
}

// Singleton instance
let wsService: EnhancedWebSocketService | null = null;

export const getWebSocketService = (): EnhancedWebSocketService => {
  if (!wsService) {
    wsService = new EnhancedWebSocketService({
      url: '', // Will be determined automatically
      reconnectAttempts: 5,
      reconnectInterval: 1000,
      heartbeatInterval: 30000
    });
  }
  return wsService;
};

export default EnhancedWebSocketService;