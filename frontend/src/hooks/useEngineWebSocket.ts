/**
 * 🔄 Engine WebSocket Hook
 * 
 * Custom React hook for managing WebSocket connections to the Three-Engine Architecture,
 * providing real-time engine monitoring and event streaming capabilities.
 */

import { useState, useEffect, useRef, useCallback } from 'react';

// Types
export interface EngineMetrics {
  status: 'active' | 'idle' | 'busy' | 'error' | 'offline';
  uptime_seconds: number;
  cpu_usage_percent: number;
  memory_usage_mb: number;
  requests_per_second: number;
  error_rate: number;
  engine_specific: Record<string, any>;
}

export interface EngineData {
  engine: string;
  metrics: EngineMetrics;
  timestamp: string;
}

export interface SystemHealth {
  overall_status: 'healthy' | 'warning' | 'degraded' | 'critical';
  engines_online: number;
  engines_total: number;
  alerts: string[];
}

export interface EngineEvent {
  event_id: string;
  event_type: string;
  source_engine: string;
  target_engine?: string;
  timestamp: string;
  data: Record<string, any>;
  correlation_id?: string;
  priority: number;
}

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
  message_id?: string;
}

export interface UseEngineWebSocketOptions {
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  subscribeToEngines?: string[];
  onEngineMetrics?: (data: EngineData) => void;
  onSystemAlert?: (data: SystemHealth) => void;
  onTaskUpdate?: (data: any) => void;
  onError?: (error: Error) => void;
}

export interface UseEngineWebSocketReturn {
  // Connection state
  isConnected: boolean;
  connectionState: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastMessage: WebSocketMessage | null;
  
  // Engine data
  engineData: Record<string, EngineData>;
  systemHealth: SystemHealth | null;
  events: EngineEvent[];
  
  // Actions
  subscribeToEngine: (engineName: string) => void;
  unsubscribeFromEngine: (engineName: string) => void;
  requestMetrics: (engineName?: string) => void;
  executeTask: (engineName: string, taskData: any) => void;
  
  // Connection management
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
  
  // Utilities
  getEngineStatus: (engineName: string) => string;
  getSystemOverview: () => {
    totalEngines: number;
    onlineEngines: number;
    healthyEngines: number;
    alertCount: number;
  };
}

export const useEngineWebSocket = (
  url: string = 'ws://localhost:8000/ws/engines',
  options: UseEngineWebSocketOptions = {}
): UseEngineWebSocketReturn => {
  const {
    autoReconnect = true,
    reconnectInterval = 5000,
    maxReconnectAttempts = 10,
    subscribeToEngines = ['perfect_recall', 'parallel_mind', 'creative', 'coordinator'],
    onEngineMetrics,
    onSystemAlert,
    onTaskUpdate,
    onError
  } = options;

  // State
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [engineData, setEngineData] = useState<Record<string, EngineData>>({});
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [events, setEvents] = useState<EngineEvent[]>([]);

  // Refs
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const subscriptionsRef = useRef<Set<string>>(new Set());

  // Message handlers
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      setLastMessage(message);

      switch (message.type) {
        case 'engine_metrics':
          const engineMetrics = message.data as EngineData;
          setEngineData(prev => ({
            ...prev,
            [engineMetrics.engine]: engineMetrics
          }));
          onEngineMetrics?.(engineMetrics);
          break;

        case 'system_alert':
          const healthData = message.data as SystemHealth;
          setSystemHealth(healthData);
          onSystemAlert?.(healthData);
          break;

        case 'task_update':
          onTaskUpdate?.(message.data);
          break;

        case 'engine_status':
          // Handle engine status updates
          console.log('Engine status:', message.data);
          break;

        case 'error':
          console.error('WebSocket error message:', message.data);
          onError?.(new Error(message.data.error || 'Unknown WebSocket error'));
          break;

        default:
          console.log('Unknown message type:', message.type, message.data);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
      onError?.(error as Error);
    }
  }, [onEngineMetrics, onSystemAlert, onTaskUpdate, onError]);

  // Connection management
  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setConnectionState('connecting');
    
    try {
      const socket = new WebSocket(url);
      socketRef.current = socket;

      socket.onopen = () => {
        setIsConnected(true);
        setConnectionState('connected');
        reconnectAttemptsRef.current = 0;

        // Auto-subscribe to engines
        subscribeToEngines.forEach(engineName => {
          subscribeToEngine(engineName);
        });

        console.log('WebSocket connected to:', url);
      };

      socket.onmessage = handleMessage;

      socket.onclose = (event) => {
        setIsConnected(false);
        setConnectionState('disconnected');
        socketRef.current = null;

        console.log('WebSocket disconnected:', event.code, event.reason);

        // Auto-reconnect if enabled
        if (autoReconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Reconnecting... (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
            connect();
          }, reconnectInterval);
        }
      };

      socket.onerror = (error) => {
        setConnectionState('error');
        console.error('WebSocket error:', error);
        onError?.(new Error('WebSocket connection error'));
      };

    } catch (error) {
      setConnectionState('error');
      console.error('Failed to create WebSocket:', error);
      onError?.(error as Error);
    }
  }, [url, autoReconnect, maxReconnectAttempts, reconnectInterval, subscribeToEngines, handleMessage, onError]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    setIsConnected(false);
    setConnectionState('disconnected');
    subscriptionsRef.current.clear();
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(connect, 100);
  }, [disconnect, connect]);

  // Message sending
  const sendMessage = useCallback((message: Partial<WebSocketMessage>) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      const fullMessage = {
        ...message,
        timestamp: new Date().toISOString(),
        message_id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
      
      socketRef.current.send(JSON.stringify(fullMessage));
      return true;
    }
    return false;
  }, []);

  // Engine actions
  const subscribeToEngine = useCallback((engineName: string) => {
    if (subscriptionsRef.current.has(engineName)) {
      return;
    }

    const success = sendMessage({
      type: 'subscribe_engine',
      data: { engine: engineName }
    });

    if (success) {
      subscriptionsRef.current.add(engineName);
      console.log(`Subscribed to ${engineName} engine`);
    }
  }, [sendMessage]);

  const unsubscribeFromEngine = useCallback((engineName: string) => {
    const success = sendMessage({
      type: 'unsubscribe_engine',
      data: { engine: engineName }
    });

    if (success) {
      subscriptionsRef.current.delete(engineName);
      console.log(`Unsubscribed from ${engineName} engine`);
    }
  }, [sendMessage]);

  const requestMetrics = useCallback((engineName?: string) => {
    sendMessage({
      type: 'request_metrics',
      data: engineName ? { engine: engineName } : {}
    });
  }, [sendMessage]);

  const executeTask = useCallback((engineName: string, taskData: any) => {
    sendMessage({
      type: 'execute_task',
      data: {
        task: {
          engine: engineName,
          task_id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...taskData
        }
      }
    });
  }, [sendMessage]);

  // Utility functions
  const getEngineStatus = useCallback((engineName: string): string => {
    return engineData[engineName]?.metrics?.status || 'offline';
  }, [engineData]);

  const getSystemOverview = useCallback(() => {
    const engines = Object.values(engineData);
    const totalEngines = engines.length;
    const onlineEngines = engines.filter(e => e.metrics.status !== 'offline').length;
    const healthyEngines = engines.filter(e => 
      e.metrics.status === 'active' || e.metrics.status === 'idle'
    ).length;
    const alertCount = systemHealth?.alerts?.length || 0;

    return {
      totalEngines,
      onlineEngines,
      healthyEngines,
      alertCount
    };
  }, [engineData, systemHealth]);

  // Effects
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
    };
  }, []);

  return {
    // Connection state
    isConnected,
    connectionState,
    lastMessage,
    
    // Engine data
    engineData,
    systemHealth,
    events,
    
    // Actions
    subscribeToEngine,
    unsubscribeFromEngine,
    requestMetrics,
    executeTask,
    
    // Connection management
    connect,
    disconnect,
    reconnect,
    
    // Utilities
    getEngineStatus,
    getSystemOverview
  };
};

// Additional hook for event stream
export const useEngineEventStream = (
  url: string = 'ws://localhost:8000/ws/events',
  options: {
    maxEvents?: number;
    onEvent?: (event: EngineEvent) => void;
  } = {}
) => {
  const { maxEvents = 100, onEvent } = options;
  const [events, setEvents] = useState<EngineEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket(url);
    socketRef.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
      console.log('Event stream connected');
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'event') {
          const engineEvent: EngineEvent = {
            event_id: message.event_id || `evt_${Date.now()}`,
            event_type: message.event_type,
            source_engine: message.source_engine,
            target_engine: message.target_engine,
            timestamp: message.timestamp,
            data: message.data,
            correlation_id: message.correlation_id,
            priority: message.priority || 5
          };

          setEvents(prev => {
            const newEvents = [engineEvent, ...prev];
            return newEvents.slice(0, maxEvents);
          });

          onEvent?.(engineEvent);
        }
      } catch (error) {
        console.error('Error parsing event stream message:', error);
      }
    };

    socket.onclose = () => {
      setIsConnected(false);
      console.log('Event stream disconnected');
    };

    socket.onerror = (error) => {
      console.error('Event stream error:', error);
    };

    return () => {
      socket.close();
    };
  }, [url, maxEvents, onEvent]);

  return {
    events,
    isConnected,
    clearEvents: () => setEvents([])
  };
};

export default useEngineWebSocket;