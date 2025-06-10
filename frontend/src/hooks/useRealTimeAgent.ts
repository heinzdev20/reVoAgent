// frontend/src/hooks/useRealTimeAgent.ts
/**
 * React Hook for Real-Time Agent Execution
 * Provides complete agent execution lifecycle with live updates
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  realTimeAPI, 
  AgentExecutionRequest, 
  TaskStatus, 
  AgentExecutionResponse 
} from '../services/realTimeApi';

export interface UseRealTimeAgentOptions {
  agentType: string;
  autoConnect?: boolean;
  enableWebSocket?: boolean;
}

export interface AgentExecutionState {
  isExecuting: boolean;
  currentTask: TaskStatus | null;
  result: any | null;
  error: string | null;
  progress: number;
  history: TaskStatus[];
}

export interface UseRealTimeAgentReturn {
  // State
  state: AgentExecutionState;
  
  // Actions
  execute: (request: AgentExecutionRequest) => Promise<string>;
  cancel: (taskId?: string) => Promise<void>;
  clearError: () => void;
  clearResult: () => void;
  
  // Real-time data
  isConnected: boolean;
  connectionError: string | null;
  
  // Utilities
  getTaskById: (taskId: string) => TaskStatus | null;
  retryExecution: () => Promise<void>;
}

export function useRealTimeAgent(options: UseRealTimeAgentOptions): UseRealTimeAgentReturn {
  const { agentType, autoConnect = true, enableWebSocket = true } = options;
  
  // State management
  const [state, setState] = useState<AgentExecutionState>({
    isExecuting: false,
    currentTask: null,
    result: null,
    error: null,
    progress: 0,
    history: []
  });
  
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  // Refs for cleanup and persistence
  const wsRef = useRef<WebSocket | null>(null);
  const lastRequestRef = useRef<AgentExecutionRequest | null>(null);
  const activeTaskIdRef = useRef<string | null>(null);
  
  // WebSocket connection management
  const connectWebSocket = useCallback(() => {
    if (!enableWebSocket) return;
    
    try {
      if (wsRef.current) {
        wsRef.current.close();
      }
      
      wsRef.current = realTimeAPI.connectToAgent(
        agentType,
        (data) => {
          console.log(`[${agentType}] WebSocket update:`, data);
          
          if (data.type === 'task_update' || data.type === 'task_progress') {
            const taskData = data.task;
            
            setState(prev => ({
              ...prev,
              currentTask: taskData,
              progress: taskData.progress || 0,
              isExecuting: taskData.status === 'running' || taskData.status === 'queued'
            }));
            
            // Update history if task is completed
            if (taskData.status === 'completed' || taskData.status === 'failed') {
              setState(prev => ({
                ...prev,
                result: taskData.result,
                error: taskData.error || null,
                isExecuting: false,
                history: [taskData, ...prev.history.filter(t => t.id !== taskData.id)]
              }));
              activeTaskIdRef.current = null;
            }
          }
        },
        (error) => {
          console.error(`[${agentType}] WebSocket error:`, error);
          setConnectionError('WebSocket connection failed');
          setIsConnected(false);
        }
      );
      
      wsRef.current.onopen = () => {
        setIsConnected(true);
        setConnectionError(null);
        console.log(`[${agentType}] WebSocket connected`);
      };
      
      wsRef.current.onclose = () => {
        setIsConnected(false);
        console.log(`[${agentType}] WebSocket disconnected`);
      };
      
    } catch (error) {
      console.error(`[${agentType}] Failed to connect WebSocket:`, error);
      setConnectionError('Failed to establish WebSocket connection');
    }
  }, [agentType, enableWebSocket]);
  
  // Execute agent task
  const execute = useCallback(async (request: AgentExecutionRequest): Promise<string> => {
    try {
      // Clear previous state
      setState(prev => ({
        ...prev,
        isExecuting: true,
        error: null,
        result: null,
        progress: 0
      }));
      
      // Store request for retry functionality
      lastRequestRef.current = request;
      
      // Execute agent
      const response: AgentExecutionResponse = await realTimeAPI.executeAgent(agentType, request);
      
      if (!response.success) {
        throw new Error(response.message || 'Execution failed');
      }
      
      // Store active task ID
      activeTaskIdRef.current = response.task_id;
      
      // Start polling if WebSocket is not enabled
      if (!enableWebSocket) {
        startTaskPolling(response.task_id);
      }
      
      return response.task_id;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState(prev => ({
        ...prev,
        isExecuting: false,
        error: errorMessage
      }));
      throw error;
    }
  }, [agentType, enableWebSocket]);
  
  // Task polling for non-WebSocket mode
  const startTaskPolling = useCallback((taskId: string) => {
    realTimeAPI.pollTaskStatus(
      taskId,
      (status) => {
        setState(prev => ({
          ...prev,
          currentTask: status,
          progress: status.progress,
          isExecuting: status.status === 'running' || status.status === 'queued'
        }));
      },
      (finalStatus) => {
        setState(prev => ({
          ...prev,
          result: finalStatus.result,
          error: finalStatus.error || null,
          isExecuting: false,
          history: [finalStatus, ...prev.history.filter(t => t.id !== finalStatus.id)]
        }));
        activeTaskIdRef.current = null;
      }
    );
  }, []);
  
  // Cancel task
  const cancel = useCallback(async (taskId?: string) => {
    const targetTaskId = taskId || activeTaskIdRef.current;
    
    if (!targetTaskId) {
      throw new Error('No active task to cancel');
    }
    
    try {
      await realTimeAPI.cancelTask(targetTaskId);
      
      setState(prev => ({
        ...prev,
        isExecuting: false,
        error: null
      }));
      
      activeTaskIdRef.current = null;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel task';
      setState(prev => ({
        ...prev,
        error: errorMessage
      }));
      throw error;
    }
  }, []);
  
  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null
    }));
  }, []);
  
  // Clear result
  const clearResult = useCallback(() => {
    setState(prev => ({
      ...prev,
      result: null
    }));
  }, []);
  
  // Get task by ID
  const getTaskById = useCallback((taskId: string): TaskStatus | null => {
    if (state.currentTask?.id === taskId) {
      return state.currentTask;
    }
    
    return state.history.find(task => task.id === taskId) || null;
  }, [state.currentTask, state.history]);
  
  // Retry last execution
  const retryExecution = useCallback(async (): Promise<void> => {
    if (!lastRequestRef.current) {
      throw new Error('No previous request to retry');
    }
    
    await execute(lastRequestRef.current);
  }, [execute]);
  
  // Effect for auto-connection
  useEffect(() => {
    if (autoConnect && enableWebSocket) {
      connectWebSocket();
    }
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [autoConnect, connectWebSocket, enableWebSocket]);
  
  // Effect for reconnection on network issues
  useEffect(() => {
    if (enableWebSocket && !isConnected && !connectionError) {
      const reconnectTimer = setTimeout(() => {
        console.log(`[${agentType}] Attempting to reconnect WebSocket...`);
        connectWebSocket();
      }, 5000);
      
      return () => clearTimeout(reconnectTimer);
    }
  }, [isConnected, connectionError, connectWebSocket, agentType, enableWebSocket]);
  
  return {
    state,
    execute,
    cancel,
    clearError,
    clearResult,
    isConnected,
    connectionError,
    getTaskById,
    retryExecution
  };
}

// Specialized hooks for specific agents
export function useCodeGenerator(options?: Omit<UseRealTimeAgentOptions, 'agentType'>) {
  return useRealTimeAgent({ ...options, agentType: 'code-generator' });
}

export function useDebugAgent(options?: Omit<UseRealTimeAgentOptions, 'agentType'>) {
  return useRealTimeAgent({ ...options, agentType: 'debug-agent' });
}

export function useTestingAgent(options?: Omit<UseRealTimeAgentOptions, 'agentType'>) {
  return useRealTimeAgent({ ...options, agentType: 'testing-agent' });
}

export function useSecurityAgent(options?: Omit<UseRealTimeAgentOptions, 'agentType'>) {
  return useRealTimeAgent({ ...options, agentType: 'security-agent' });
}

// Hook for AI testing
export function useAITesting() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const testAI = useCallback(async (prompt: string, taskType: string = 'general', provider?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await realTimeAPI.testAIIntegration({
        prompt,
        task_type: taskType,
        provider
      });
      
      setResult(response);
      return response;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'AI test failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const testDeepSeek = useCallback(async (prompt: string, mode: 'generate' | 'reasoning' | 'creative' = 'generate') => {
    setIsLoading(true);
    setError(null);
    
    try {
      let response;
      
      switch (mode) {
        case 'reasoning':
          response = await realTimeAPI.deepSeekReasoning({ prompt });
          break;
        case 'creative':
          response = await realTimeAPI.deepSeekCreative({ prompt });
          break;
        default:
          response = await realTimeAPI.deepSeekGenerate({ prompt });
      }
      
      setResult(response);
      return response;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'DeepSeek test failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);
  
  return {
    isLoading,
    result,
    error,
    testAI,
    testDeepSeek,
    clearResult
  };
}
