/**
 * 🤖 Agent Store - Zustand State Management for Real-time Agent Operations
 * Professional state management for all agent interactions and real-time updates
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { api, AGENT_TYPES, type AgentType, type AgentStatus, type AgentTask } from '../services/api';

export interface AgentState {
  // Agent status tracking
  agents: Record<AgentType, AgentStatus>;
  
  // Task management
  activeTasks: Record<string, AgentTask>;
  taskHistory: Record<AgentType, AgentTask[]>;
  
  // Real-time updates
  isConnected: boolean;
  lastUpdate: Date | null;
  
  // UI state
  selectedAgent: AgentType | null;
  isExecuting: Record<AgentType, boolean>;
  errors: Record<AgentType, string | null>;
  
  // Performance metrics
  metrics: Record<AgentType, {
    successRate: number;
    avgResponseTime: number;
    totalTasks: number;
    activeTasks: number;
  }>;
}

export interface AgentActions {
  // Agent operations
  executeAgent: (agentType: AgentType, taskData: Record<string, any>) => Promise<string>;
  cancelTask: (agentType: AgentType, taskId: string) => Promise<void>;
  
  // Data fetching
  fetchAgentStatus: (agentType: AgentType) => Promise<void>;
  fetchAllAgents: () => Promise<void>;
  fetchTaskHistory: (agentType: AgentType, limit?: number) => Promise<void>;
  
  // Real-time updates
  updateAgentStatus: (agentType: AgentType, status: Partial<AgentStatus>) => void;
  updateTaskProgress: (taskId: string, progress: Partial<AgentTask>) => void;
  
  // UI actions
  selectAgent: (agentType: AgentType | null) => void;
  clearError: (agentType: AgentType) => void;
  setError: (agentType: AgentType, error: string) => void;
  
  // WebSocket management
  setConnectionStatus: (connected: boolean) => void;
  updateLastUpdate: () => void;
}

const initialState: AgentState = {
  agents: {} as Record<AgentType, AgentStatus>,
  activeTasks: {},
  taskHistory: {} as Record<AgentType, AgentTask[]>,
  isConnected: false,
  lastUpdate: null,
  selectedAgent: null,
  isExecuting: {} as Record<AgentType, boolean>,
  errors: {} as Record<AgentType, string | null>,
  metrics: {} as Record<AgentType, {
    successRate: number;
    avgResponseTime: number;
    totalTasks: number;
    activeTasks: number;
  }>,
};

export const useAgentStore = create<AgentState & AgentActions>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    // ============================================================================
    // AGENT OPERATIONS
    // ============================================================================

    executeAgent: async (agentType: AgentType, taskData: Record<string, any>) => {
      try {
        set((state) => ({
          isExecuting: { ...state.isExecuting, [agentType]: true },
          errors: { ...state.errors, [agentType]: null },
        }));

        const result = await api.executeAgentTask(agentType, taskData);
        
        // Update agent status to busy
        set((state) => ({
          agents: {
            ...state.agents,
            [agentType]: {
              ...state.agents[agentType],
              status: 'busy',
              current_task: result.task_id,
              last_updated: new Date().toISOString(),
            },
          },
        }));

        return result.task_id;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        set((state) => ({
          errors: { ...state.errors, [agentType]: errorMessage },
          isExecuting: { ...state.isExecuting, [agentType]: false },
        }));
        throw error;
      }
    },

    cancelTask: async (agentType: AgentType, taskId: string) => {
      try {
        await api.cancelAgentTask(agentType, taskId);
        
        // Remove from active tasks
        set((state) => {
          const newActiveTasks = { ...state.activeTasks };
          delete newActiveTasks[taskId];
          
          return {
            activeTasks: newActiveTasks,
            agents: {
              ...state.agents,
              [agentType]: {
                ...state.agents[agentType],
                status: 'idle',
                current_task: null,
                last_updated: new Date().toISOString(),
              },
            },
            isExecuting: { ...state.isExecuting, [agentType]: false },
          };
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to cancel task';
        set((state) => ({
          errors: { ...state.errors, [agentType]: errorMessage },
        }));
        throw error;
      }
    },

    // ============================================================================
    // DATA FETCHING
    // ============================================================================

    fetchAgentStatus: async (agentType: AgentType) => {
      try {
        const status = await api.getAgentStatus(agentType);
        
        set((state) => ({
          agents: { ...state.agents, [agentType]: status },
          errors: { ...state.errors, [agentType]: null },
        }));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch agent status';
        set((state) => ({
          errors: { ...state.errors, [agentType]: errorMessage },
        }));
      }
    },

    fetchAllAgents: async () => {
      try {
        const agentTypes = Object.values(AGENT_TYPES);
        const statusPromises = agentTypes.map(type => api.getAgentStatus(type));
        const statuses = await Promise.allSettled(statusPromises);
        
        const agents: Record<AgentType, AgentStatus> = {} as any;
        const errors: Record<AgentType, string | null> = {} as any;
        
        statuses.forEach((result, index) => {
          const agentType = agentTypes[index];
          if (result.status === 'fulfilled') {
            agents[agentType] = result.value;
            errors[agentType] = null;
          } else {
            errors[agentType] = result.reason?.message || 'Failed to fetch status';
          }
        });
        
        set((state) => ({
          agents: { ...state.agents, ...agents },
          errors: { ...state.errors, ...errors },
          lastUpdate: new Date(),
        }));
      } catch (error) {
        console.error('Failed to fetch all agents:', error);
      }
    },

    fetchTaskHistory: async (agentType: AgentType, limit = 10) => {
      try {
        const response = await api.getAgentHistory(agentType, limit);
        
        set((state) => ({
          taskHistory: { ...state.taskHistory, [agentType]: response.history },
          metrics: {
            ...state.metrics,
            [agentType]: {
              successRate: calculateSuccessRate(response.history),
              avgResponseTime: calculateAvgResponseTime(response.history),
              totalTasks: response.total_tasks,
              activeTasks: response.history.filter(task => task.status === 'running').length,
            },
          },
        }));
      } catch (error) {
        console.error(`Failed to fetch task history for ${agentType}:`, error);
      }
    },

    // ============================================================================
    // REAL-TIME UPDATES
    // ============================================================================

    updateAgentStatus: (agentType: AgentType, status: Partial<AgentStatus>) => {
      set((state) => ({
        agents: {
          ...state.agents,
          [agentType]: { ...state.agents[agentType], ...status },
        },
        lastUpdate: new Date(),
      }));
    },

    updateTaskProgress: (taskId: string, progress: Partial<AgentTask>) => {
      set((state) => ({
        activeTasks: {
          ...state.activeTasks,
          [taskId]: { ...state.activeTasks[taskId], ...progress },
        },
        lastUpdate: new Date(),
      }));
    },

    // ============================================================================
    // UI ACTIONS
    // ============================================================================

    selectAgent: (agentType: AgentType | null) => {
      set({ selectedAgent: agentType });
    },

    clearError: (agentType: AgentType) => {
      set((state) => ({
        errors: { ...state.errors, [agentType]: null },
      }));
    },

    setError: (agentType: AgentType, error: string) => {
      set((state) => ({
        errors: { ...state.errors, [agentType]: error },
      }));
    },

    // ============================================================================
    // WEBSOCKET MANAGEMENT
    // ============================================================================

    setConnectionStatus: (connected: boolean) => {
      set({ isConnected: connected });
    },

    updateLastUpdate: () => {
      set({ lastUpdate: new Date() });
    },
  }))
);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function calculateSuccessRate(tasks: AgentTask[]): number {
  if (tasks.length === 0) return 0;
  const successfulTasks = tasks.filter(task => task.status === 'completed').length;
  return (successfulTasks / tasks.length) * 100;
}

function calculateAvgResponseTime(tasks: AgentTask[]): number {
  const completedTasks = tasks.filter(task => task.status === 'completed');
  if (completedTasks.length === 0) return 0;
  
  const totalTime = completedTasks.reduce((sum, task) => {
    const created = new Date(task.created_at).getTime();
    const now = new Date().getTime();
    return sum + (now - created);
  }, 0);
  
  return totalTime / completedTasks.length;
}

// ============================================================================
// SELECTORS FOR OPTIMIZED COMPONENT UPDATES
// ============================================================================

export const useAgentStatus = (agentType: AgentType) =>
  useAgentStore((state) => state.agents[agentType]);

export const useAgentMetrics = (agentType: AgentType) =>
  useAgentStore((state) => state.metrics[agentType]);

export const useAgentError = (agentType: AgentType) =>
  useAgentStore((state) => state.errors[agentType]);

export const useIsAgentExecuting = (agentType: AgentType) =>
  useAgentStore((state) => state.isExecuting[agentType]);

export const useAgentTaskHistory = (agentType: AgentType) =>
  useAgentStore((state) => state.taskHistory[agentType] || []);

export const useActiveAgentTasks = () =>
  useAgentStore((state) => Object.values(state.activeTasks));

export const useConnectionStatus = () =>
  useAgentStore((state) => ({ isConnected: state.isConnected, lastUpdate: state.lastUpdate }));