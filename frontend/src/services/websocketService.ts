/**
 * 🔄 WebSocket Service - Real-time Communication
 * Professional WebSocket management for real-time updates
 */

import { useAgentStore } from '../stores/agentStore';
import { useDashboardStore } from '../stores/dashboardStore';

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private messageHandlers: Map<string, (data: any) => void> = new Map();

  constructor() {
    this.setupMessageHandlers();
  }

  private setupMessageHandlers() {
    // Agent status updates
    this.messageHandlers.set('agent_status_update', (data) => {
      const { updateAgentStatus } = useAgentStore.getState();
      updateAgentStatus(data.agent_type, data.status);
    });

    // Task progress updates
    this.messageHandlers.set('task_progress_update', (data) => {
      const { updateTaskProgress } = useAgentStore.getState();
      updateTaskProgress(data.task_id, data.progress);
    });

    // Dashboard stats updates
    this.messageHandlers.set('dashboard_stats_update', (data) => {
      const { updateStats } = useDashboardStore.getState();
      updateStats(data.stats);
    });

    // Activity updates
    this.messageHandlers.set('activity_update', (data) => {
      const { addActivity } = useDashboardStore.getState();
      addActivity(data.activity);
    });

    // Workflow status updates
    this.messageHandlers.set('workflow_status_update', (data) => {
      const { updateWorkflowStatus } = useDashboardStore.getState();
      updateWorkflowStatus(data.workflow_id, data.status);
    });
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        reject(new Error('Already connecting'));
        return;
      }

      this.isConnecting = true;

      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        const wsUrl = `${protocol}//${host}/ws/dashboard`;

        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          
          // Update connection status in stores
          useAgentStore.getState().setConnectionStatus(true);
          useDashboardStore.getState().setConnectionStatus(true);
          
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.isConnecting = false;
          
          // Update connection status in stores
          useAgentStore.getState().setConnectionStatus(false);
          useDashboardStore.getState().setConnectionStatus(false);
          
          // Attempt to reconnect
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnecting = false;
          
          // Update connection status in stores
          useAgentStore.getState().setConnectionStatus(false);
          useDashboardStore.getState().setConnectionStatus(false);
          
          reject(error);
        };

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  private handleMessage(message: WebSocketMessage) {
    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      handler(message.data);
    } else {
      console.warn('Unknown WebSocket message type:', message.type);
    }

    // Update last update timestamp
    useAgentStore.getState().updateLastUpdate();
    useDashboardStore.getState().updateLastUpdate();
  }

  private scheduleReconnect() {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Scheduling WebSocket reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);
    
    setTimeout(() => {
      this.connect().catch((error) => {
        console.error('WebSocket reconnect failed:', error);
      });
    }, delay);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    // Update connection status in stores
    useAgentStore.getState().setConnectionStatus(false);
    useDashboardStore.getState().setConnectionStatus(false);
  }

  send(message: WebSocketMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Export singleton instance
export const webSocketService = new WebSocketService();

// Auto-connect when the service is imported
if (typeof window !== 'undefined') {
  webSocketService.connect().catch((error) => {
    console.error('Failed to establish WebSocket connection:', error);
  });
}