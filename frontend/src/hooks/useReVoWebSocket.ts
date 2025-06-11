/**
 * Enhanced WebSocket Hook for ReVo AI Chat Interface
 * Provides robust WebSocket connection with authentication, reconnection, and message handling
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage, WebSocketMessage, MessageType, MessageStatus } from '../types/chat';

interface UseReVoWebSocketOptions {
  url: string;
  token?: string;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  heartbeatInterval?: number;
  onMessage?: (message: ChatMessage) => void;
  onStatusChange?: (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void;
  onWorkflowUpdate?: (workflowData: any) => void;
  onAgentFeedback?: (agentData: any) => void;
}

export const useReVoWebSocket = (options: UseReVoWebSocketOptions) => {
  const {
    url,
    token,
    reconnectAttempts = 5,
    reconnectInterval = 3000,
    heartbeatInterval = 30000,
    onMessage,
    onStatusChange,
    onWorkflowUpdate,
    onAgentFeedback
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [lastError, setLastError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectCountRef = useRef(0);
  const messageQueueRef = useRef<WebSocketMessage[]>([]);

  const updateStatus = useCallback((status: typeof connectionStatus) => {
    setConnectionStatus(status);
    onStatusChange?.(status);
  }, [onStatusChange]);

  const startHeartbeat = useCallback(() => {
    if (heartbeatTimeoutRef.current) {
      clearInterval(heartbeatTimeoutRef.current);
    }
    
    heartbeatTimeoutRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
      }
    }, heartbeatInterval);
  }, [heartbeatInterval]);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatTimeoutRef.current) {
      clearInterval(heartbeatTimeoutRef.current);
      heartbeatTimeoutRef.current = null;
    }
  }, []);

  const processMessageQueue = useCallback(() => {
    while (messageQueueRef.current.length > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
      const message = messageQueueRef.current.shift();
      if (message) {
        wsRef.current.send(JSON.stringify(message));
      }
    }
  }, []);

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const wsMessage: WebSocketMessage = JSON.parse(event.data);
      
      switch (wsMessage.type) {
        case 'message':
          const chatMessage: ChatMessage = {
            id: wsMessage.id || `msg_${Date.now()}_${Math.random()}`,
            sender: wsMessage.data.sender || 'revo',
            content: wsMessage.data.content || '',
            timestamp: wsMessage.timestamp || Date.now(),
            agentName: wsMessage.data.agentName,
            engineName: wsMessage.data.engineName,
            messageType: wsMessage.data.messageType || MessageType.TEXT,
            metadata: wsMessage.data.metadata,
            status: MessageStatus.DELIVERED
          };
          onMessage?.(chatMessage);
          break;
          
        case 'workflow_update':
          onWorkflowUpdate?.(wsMessage.data);
          break;
          
        case 'agent_feedback':
          onAgentFeedback?.(wsMessage.data);
          break;
          
        case 'status':
          // Handle status updates
          console.log('Status update:', wsMessage.data);
          break;
          
        case 'error':
          setLastError(wsMessage.data.message || 'Unknown error');
          console.error('WebSocket error:', wsMessage.data);
          break;
          
        default:
          console.log('Unknown message type:', wsMessage.type);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
      setLastError('Failed to parse message');
    }
  }, [onMessage, onWorkflowUpdate, onAgentFeedback]);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    updateStatus('connecting');
    setLastError(null);

    try {
      // Construct WebSocket URL with authentication
      const wsUrl = new URL(url);
      if (token) {
        wsUrl.searchParams.set('token', token);
      }

      wsRef.current = new WebSocket(wsUrl.toString());

      wsRef.current.onopen = () => {
        setIsConnected(true);
        updateStatus('connected');
        reconnectCountRef.current = 0;
        startHeartbeat();
        processMessageQueue();
        console.log('WebSocket connected');
      };

      wsRef.current.onmessage = handleMessage;

      wsRef.current.onclose = (event) => {
        setIsConnected(false);
        updateStatus('disconnected');
        stopHeartbeat();
        
        console.log('WebSocket disconnected:', event.code, event.reason);
        
        // Attempt reconnection if not a clean close
        if (event.code !== 1000 && reconnectCountRef.current < reconnectAttempts) {
          reconnectCountRef.current++;
          console.log(`Attempting reconnection ${reconnectCountRef.current}/${reconnectAttempts}`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval * Math.pow(1.5, reconnectCountRef.current - 1)); // Exponential backoff
        } else if (reconnectCountRef.current >= reconnectAttempts) {
          updateStatus('error');
          setLastError('Maximum reconnection attempts reached');
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        updateStatus('error');
        setLastError('Connection error');
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      updateStatus('error');
      setLastError('Failed to create connection');
    }
  }, [url, token, reconnectAttempts, reconnectInterval, updateStatus, handleMessage, startHeartbeat, processMessageQueue]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    stopHeartbeat();
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }
    
    setIsConnected(false);
    updateStatus('disconnected');
    reconnectCountRef.current = 0;
  }, [stopHeartbeat, updateStatus]);

  const sendMessage = useCallback((message: Partial<WebSocketMessage>) => {
    const fullMessage: WebSocketMessage = {
      type: 'message',
      timestamp: Date.now(),
      id: `msg_${Date.now()}_${Math.random()}`,
      ...message
    };

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(fullMessage));
      return true;
    } else {
      // Queue message for when connection is restored
      messageQueueRef.current.push(fullMessage);
      return false;
    }
  }, []);

  const sendChatMessage = useCallback((content: string, messageType: MessageType = MessageType.TEXT) => {
    return sendMessage({
      type: 'message',
      data: {
        sender: 'user',
        content,
        messageType,
        timestamp: Date.now()
      }
    });
  }, [sendMessage]);

  const sendCommand = useCallback((command: string, args: Record<string, any> = {}) => {
    return sendMessage({
      type: 'message',
      data: {
        sender: 'user',
        content: command,
        messageType: MessageType.SYSTEM,
        metadata: {
          functionName: command.replace('/', ''),
          functionArgs: args
        }
      }
    });
  }, [sendMessage]);

  // Auto-connect on mount
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      stopHeartbeat();
    };
  }, [stopHeartbeat]);

  return {
    isConnected,
    connectionStatus,
    lastError,
    connect,
    disconnect,
    sendMessage,
    sendChatMessage,
    sendCommand,
    reconnectCount: reconnectCountRef.current,
    queuedMessages: messageQueueRef.current.length
  };
};