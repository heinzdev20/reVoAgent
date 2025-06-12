/**
 * Unified WebSocket Service
 * Consolidates all fragmented WebSocket implementations into a single, robust service
 * with connection management, room support, and automatic reconnection
 */

export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: number;
  id?: string;
}

export interface WebSocketRoom {
  id: string;
  name: string;
  participants: string[];
  lastActivity: number;
}

export interface ConnectionOptions {
  url?: string;
  protocols?: string[];
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  timeout?: number;
}

export interface WebSocketEventHandlers {
  onOpen?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
  onMessage?: (message: WebSocketMessage) => void;
  onReconnect?: (attempt: number) => void;
  onReconnectFailed?: () => void;
}

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'failed';

class UnifiedWebSocketService {
  private ws: WebSocket | null = null;
  private connectionState: ConnectionState = 'disconnected';
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private messageQueue: WebSocketMessage[] = [];
  private eventHandlers: WebSocketEventHandlers = {};
  private rooms: Map<string, WebSocketRoom> = new Map();
  private currentRoom: string | null = null;
  
  // Configuration
  private config: Required<ConnectionOptions> = {
    url: this.getWebSocketUrl(),
    protocols: [],
    reconnectInterval: 3000,
    maxReconnectAttempts: 10,
    heartbeatInterval: 30000,
    timeout: 10000
  };

  constructor(options?: ConnectionOptions) {
    if (options) {
      this.config = { ...this.config, ...options };
    }
    
    // Bind methods to preserve context
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.send = this.send.bind(this);
    this.joinRoom = this.joinRoom.bind(this);
    this.leaveRoom = this.leaveRoom.bind(this);
  }

  /**
   * Get WebSocket URL based on current environment
   */
  private getWebSocketUrl(): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    
    // Use the correct port based on environment
    if (host === 'localhost' || host === '127.0.0.1') {
      return `${protocol}//${host}:12001/ws/dashboard`;
    }
    
    // For production/staging environments
    const port = window.location.port || (protocol === 'wss:' ? '443' : '80');
    return `${protocol}//${host}:${port}/ws/dashboard`;
  }

  /**
   * Set event handlers
   */
  public setEventHandlers(handlers: WebSocketEventHandlers): void {
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
  }

  /**
   * Get current connection state
   */
  public getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  /**
   * Check if connected
   */
  public isConnected(): boolean {
    return this.connectionState === 'connected' && this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Connect to WebSocket server
   */
  public async connect(): Promise<void> {
    if (this.connectionState === 'connecting' || this.connectionState === 'connected') {
      return;
    }

    this.connectionState = 'connecting';
    
    try {
      // Close existing connection if any
      if (this.ws) {
        this.ws.close();
      }

      // Create new WebSocket connection
      this.ws = new WebSocket(this.config.url, this.config.protocols);
      
      // Set up event listeners
      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      this.ws.onerror = this.handleError.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);

      // Wait for connection with timeout
      await this.waitForConnection();
      
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      this.connectionState = 'failed';
      throw error;
    }
  }

  /**
   * Wait for WebSocket connection to open
   */
  private waitForConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('WebSocket connection timeout'));
      }, this.config.timeout);

      const checkConnection = () => {
        if (this.ws?.readyState === WebSocket.OPEN) {
          clearTimeout(timeout);
          resolve();
        } else if (this.ws?.readyState === WebSocket.CLOSED) {
          clearTimeout(timeout);
          reject(new Error('WebSocket connection failed'));
        } else {
          setTimeout(checkConnection, 100);
        }
      };

      checkConnection();
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  public disconnect(): void {
    this.connectionState = 'disconnected';
    this.reconnectAttempts = 0;
    
    // Clear timers
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    
    // Close WebSocket
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    
    // Clear rooms
    this.rooms.clear();
    this.currentRoom = null;
  }

  /**
   * Send message to server
   */
  public send(type: string, payload: any, targetRoom?: string): boolean {
    const message: WebSocketMessage = {
      type,
      payload,
      timestamp: Date.now(),
      id: this.generateMessageId()
    };

    // Add room information if specified
    if (targetRoom || this.currentRoom) {
      (message as any).room = targetRoom || this.currentRoom;
    }

    if (this.isConnected()) {
      try {
        this.ws!.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.error('Failed to send WebSocket message:', error);
        this.queueMessage(message);
        return false;
      }
    } else {
      this.queueMessage(message);
      return false;
    }
  }

  /**
   * Join a room
   */
  public async joinRoom(roomId: string, roomName?: string): Promise<void> {
    if (this.currentRoom === roomId) {
      return;
    }

    // Leave current room if any
    if (this.currentRoom) {
      await this.leaveRoom();
    }

    this.currentRoom = roomId;
    
    // Create room if it doesn't exist
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        id: roomId,
        name: roomName || roomId,
        participants: [],
        lastActivity: Date.now()
      });
    }

    // Send join room message
    this.send('join_room', { roomId, roomName });
  }

  /**
   * Leave current room
   */
  public async leaveRoom(): Promise<void> {
    if (!this.currentRoom) {
      return;
    }

    const roomId = this.currentRoom;
    this.currentRoom = null;

    // Send leave room message
    this.send('leave_room', { roomId });
  }

  /**
   * Get list of available rooms
   */
  public getRooms(): WebSocketRoom[] {
    return Array.from(this.rooms.values());
  }

  /**
   * Get current room
   */
  public getCurrentRoom(): string | null {
    return this.currentRoom;
  }

  /**
   * Handle WebSocket open event
   */
  private handleOpen(event: Event): void {
    console.log('WebSocket connected');
    this.connectionState = 'connected';
    this.reconnectAttempts = 0;
    
    // Start heartbeat
    this.startHeartbeat();
    
    // Send queued messages
    this.sendQueuedMessages();
    
    // Call event handler
    this.eventHandlers.onOpen?.(event);
  }

  /**
   * Handle WebSocket close event
   */
  private handleClose(event: CloseEvent): void {
    console.log('WebSocket disconnected:', event.code, event.reason);
    this.connectionState = 'disconnected';
    
    // Stop heartbeat
    this.stopHeartbeat();
    
    // Call event handler
    this.eventHandlers.onClose?.(event);
    
    // Attempt reconnection if not intentional disconnect
    if (event.code !== 1000 && this.reconnectAttempts < this.config.maxReconnectAttempts) {
      this.attemptReconnect();
    }
  }

  /**
   * Handle WebSocket error event
   */
  private handleError(event: Event): void {
    console.error('WebSocket error:', event);
    this.eventHandlers.onError?.(event);
  }

  /**
   * Handle WebSocket message event
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      
      // Handle system messages
      if (message.type === 'room_joined') {
        this.handleRoomJoined(message.payload);
      } else if (message.type === 'room_left') {
        this.handleRoomLeft(message.payload);
      } else if (message.type === 'room_update') {
        this.handleRoomUpdate(message.payload);
      } else if (message.type === 'pong') {
        // Heartbeat response
        return;
      }
      
      // Call event handler
      this.eventHandlers.onMessage?.(message);
      
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  /**
   * Handle room joined event
   */
  private handleRoomJoined(payload: any): void {
    const { roomId, roomInfo } = payload;
    this.rooms.set(roomId, roomInfo);
    this.currentRoom = roomId;
  }

  /**
   * Handle room left event
   */
  private handleRoomLeft(payload: any): void {
    const { roomId } = payload;
    if (this.currentRoom === roomId) {
      this.currentRoom = null;
    }
  }

  /**
   * Handle room update event
   */
  private handleRoomUpdate(payload: any): void {
    const { roomId, roomInfo } = payload;
    if (this.rooms.has(roomId)) {
      this.rooms.set(roomId, { ...this.rooms.get(roomId)!, ...roomInfo });
    }
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect(): void {
    if (this.connectionState === 'reconnecting') {
      return;
    }

    this.connectionState = 'reconnecting';
    this.reconnectAttempts++;
    
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.config.maxReconnectAttempts})...`);
    
    this.eventHandlers.onReconnect?.(this.reconnectAttempts);
    
    this.reconnectTimer = setTimeout(async () => {
      try {
        await this.connect();
      } catch (error) {
        if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
          console.error('Max reconnection attempts reached');
          this.connectionState = 'failed';
          this.eventHandlers.onReconnectFailed?.();
        } else {
          this.attemptReconnect();
        }
      }
    }, this.config.reconnectInterval);
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected()) {
        this.send('ping', { timestamp: Date.now() });
      }
    }, this.config.heartbeatInterval);
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Queue message for later sending
   */
  private queueMessage(message: WebSocketMessage): void {
    this.messageQueue.push(message);
    
    // Limit queue size
    if (this.messageQueue.length > 100) {
      this.messageQueue.shift();
    }
  }

  /**
   * Send all queued messages
   */
  private sendQueuedMessages(): void {
    while (this.messageQueue.length > 0 && this.isConnected()) {
      const message = this.messageQueue.shift()!;
      try {
        this.ws!.send(JSON.stringify(message));
      } catch (error) {
        console.error('Failed to send queued message:', error);
        // Put message back at the front of the queue
        this.messageQueue.unshift(message);
        break;
      }
    }
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Update configuration
   */
  public updateConfig(options: Partial<ConnectionOptions>): void {
    this.config = { ...this.config, ...options };
  }

  /**
   * Get connection statistics
   */
  public getStats(): {
    connectionState: ConnectionState;
    reconnectAttempts: number;
    queuedMessages: number;
    currentRoom: string | null;
    totalRooms: number;
  } {
    return {
      connectionState: this.connectionState,
      reconnectAttempts: this.reconnectAttempts,
      queuedMessages: this.messageQueue.length,
      currentRoom: this.currentRoom,
      totalRooms: this.rooms.size
    };
  }
}

// Create singleton instance
export const unifiedWebSocketService = new UnifiedWebSocketService();

// Export for use in React hooks
export default unifiedWebSocketService;