/**
 * Enhanced WebSocket React Hook
 * Part of reVoAgent Next Phase Implementation
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { getWebSocketService, ConnectionState, WebSocketMessage } from '../services/EnhancedWebSocketService';

export interface UseWebSocketOptions {
  autoConnect?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
}

export interface UseWebSocketReturn {
  connectionState: ConnectionState;
  isConnected: boolean;
  send: (message: WebSocketMessage) => void;
  subscribe: (channel: string, callback: Function) => () => void;
  requestAgentStatus: (agentId?: string) => void;
  requestSystemMetrics: () => void;
  requestEngineStatus: () => void;
  submitAgentTask: (agentId: string, task: string, parameters?: any) => void;
  connect: () => Promise<void>;
  disconnect: () => void;
  stats: {
    connectionState: ConnectionState;
    reconnectAttempts: number;
    subscriberCount: number;
    queuedMessages: number;
    connectionId: string;
  };
}

export const useEnhancedWebSocket = (options: UseWebSocketOptions = {}): UseWebSocketReturn => {
  const {
    autoConnect = true,
    onConnect,
    onDisconnect,
    onError
  } = options;

  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const wsService = useRef(getWebSocketService());
  const [stats, setStats] = useState(wsService.current.getStats());

  // Update stats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(wsService.current.getStats());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Handle connection state changes
  useEffect(() => {
    const unsubscribe = wsService.current.onConnectionStateChange((state) => {
      setConnectionState(state);
      
      switch (state) {
        case 'connected':
          onConnect?.();
          break;
        case 'disconnected':
          onDisconnect?.();
          break;
        case 'error':
          onError?.(new Error('WebSocket connection error'));
          break;
      }
    });

    return unsubscribe;
  }, [onConnect, onDisconnect, onError]);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && connectionState === 'disconnected') {
      wsService.current.connect().catch((error) => {
        console.error('Failed to auto-connect WebSocket:', error);
        onError?.(error);
      });
    }

    // Cleanup on unmount
    return () => {
      if (!autoConnect) {
        wsService.current.disconnect();
      }
    };
  }, [autoConnect, onError]);

  const connect = useCallback(async () => {
    try {
      await wsService.current.connect();
    } catch (error) {
      onError?.(error);
      throw error;
    }
  }, [onError]);

  const disconnect = useCallback(() => {
    wsService.current.disconnect();
  }, []);

  const send = useCallback((message: WebSocketMessage) => {
    wsService.current.send(message);
  }, []);

  const subscribe = useCallback((channel: string, callback: Function) => {
    return wsService.current.subscribe(channel, callback);
  }, []);

  const requestAgentStatus = useCallback((agentId?: string) => {
    wsService.current.requestAgentStatus(agentId);
  }, []);

  const requestSystemMetrics = useCallback(() => {
    wsService.current.requestSystemMetrics();
  }, []);

  const requestEngineStatus = useCallback(() => {
    wsService.current.requestEngineStatus();
  }, []);

  const submitAgentTask = useCallback((agentId: string, task: string, parameters?: any) => {
    wsService.current.submitAgentTask(agentId, task, parameters);
  }, []);

  return {
    connectionState,
    isConnected: connectionState === 'connected',
    send,
    subscribe,
    requestAgentStatus,
    requestSystemMetrics,
    requestEngineStatus,
    submitAgentTask,
    connect,
    disconnect,
    stats
  };
};

// Specialized hooks for specific use cases

export const useAgentStatus = () => {
  const { subscribe, requestAgentStatus, isConnected } = useEnhancedWebSocket();
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribe('agent_status', (agentData: any) => {
      setAgents(prev => {
        const index = prev.findIndex(agent => agent.id === agentData.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = agentData;
          return updated;
        }
        return [...prev, agentData];
      });
      setLoading(false);
    });

    const unsubscribeOverview = subscribe('system_overview', (overview: any) => {
      if (overview.agents) {
        setAgents(Object.values(overview.agents));
      }
      setLoading(false);
    });

    // Request initial data when connected
    if (isConnected) {
      requestAgentStatus();
    }

    return () => {
      unsubscribe();
      unsubscribeOverview();
    };
  }, [subscribe, requestAgentStatus, isConnected]);

  return { agents, loading, requestAgentStatus };
};

export const useSystemMetrics = () => {
  const { subscribe, requestSystemMetrics, isConnected } = useEnhancedWebSocket();
  const [metrics, setMetrics] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribeMetrics = subscribe('system_metrics', (metricsData: any) => {
      setMetrics(metricsData);
    });

    const unsubscribeAlerts = subscribe('system_alerts', (alert: any) => {
      setAlerts(prev => [alert, ...prev.slice(0, 9)]); // Keep last 10 alerts
    });

    // Request initial data when connected
    if (isConnected) {
      requestSystemMetrics();
    }

    // Set up periodic updates
    const interval = setInterval(() => {
      if (isConnected) {
        requestSystemMetrics();
      }
    }, 30000); // Every 30 seconds

    return () => {
      unsubscribeMetrics();
      unsubscribeAlerts();
      clearInterval(interval);
    };
  }, [subscribe, requestSystemMetrics, isConnected]);

  return { metrics, alerts, requestSystemMetrics };
};

export const useEngineStatus = () => {
  const { subscribe, requestEngineStatus, isConnected } = useEnhancedWebSocket();
  const [engines, setEngines] = useState<any>({});
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribeEngineStatus = subscribe('engine_status', (engineData: any) => {
      setEngines(prev => ({
        ...prev,
        [engineData.engine_type]: engineData
      }));
    });

    const unsubscribeTaskCompletion = subscribe('task_completion', (taskData: any) => {
      setTasks(prev => [taskData, ...prev.slice(0, 19)]); // Keep last 20 tasks
    });

    // Request initial data when connected
    if (isConnected) {
      requestEngineStatus();
    }

    return () => {
      unsubscribeEngineStatus();
      unsubscribeTaskCompletion();
    };
  }, [subscribe, requestEngineStatus, isConnected]);

  return { engines, tasks, requestEngineStatus };
};

export const usePerformanceAlerts = () => {
  const { subscribe } = useEnhancedWebSocket();
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = subscribe('performance_alert', (alert: any) => {
      setAlerts(prev => [alert, ...prev.slice(0, 49)]); // Keep last 50 alerts
    });

    return unsubscribe;
  }, [subscribe]);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const dismissAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  }, []);

  return { alerts, clearAlerts, dismissAlert };
};

export default useEnhancedWebSocket;