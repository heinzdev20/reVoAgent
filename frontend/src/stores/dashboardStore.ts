/**
 * 📊 Dashboard Store - Real-time Dashboard State Management
 * Professional state management for dashboard components and real-time metrics
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { api } from '../services/api';
import type { DashboardStats, WorkflowData, ActivityItem, SystemMetric } from '@/types';

export interface DashboardState {
  // Dashboard stats
  stats: DashboardStats | null;
  
  // System metrics
  systemMetrics: Record<string, SystemMetric>;
  
  // Workflows
  workflows: WorkflowData[];
  activeWorkflows: WorkflowData[];
  
  // Recent activity
  recentActivity: ActivityItem[];
  
  // Real-time data
  isConnected: boolean;
  lastUpdate: Date | null;
  updateInterval: number;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Performance tracking
  performanceHistory: Array<{
    timestamp: Date;
    metrics: {
      responseTime: number;
      throughput: number;
      successRate: number;
      activeAgents: number;
    };
  }>;
}

export interface DashboardActions {
  // Data fetching
  fetchDashboardStats: () => Promise<void>;
  fetchSystemMetrics: () => Promise<void>;
  fetchWorkflows: () => Promise<void>;
  fetchRecentActivity: () => Promise<void>;
  fetchAllData: () => Promise<void>;
  
  // Workflow management
  startWorkflow: (workflowId: string) => Promise<void>;
  stopWorkflow: (workflowId: string) => Promise<void>;
  createWorkflow: (workflow: Partial<WorkflowData>) => Promise<void>;
  
  // Real-time updates
  updateStats: (stats: Partial<DashboardStats>) => void;
  updateSystemMetrics: (metrics: Record<string, SystemMetric>) => void;
  addActivity: (activity: ActivityItem) => void;
  updateWorkflowStatus: (workflowId: string, status: string) => void;
  
  // Performance tracking
  addPerformanceSnapshot: () => void;
  
  // UI actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setConnectionStatus: (connected: boolean) => void;
  updateLastUpdate: () => void;
  
  // Auto-refresh management
  startAutoRefresh: () => void;
  stopAutoRefresh: () => void;
}

const initialState: DashboardState = {
  stats: null,
  systemMetrics: {},
  workflows: [],
  activeWorkflows: [],
  recentActivity: [],
  isConnected: false,
  lastUpdate: null,
  updateInterval: 5000, // 5 seconds
  isLoading: false,
  error: null,
  performanceHistory: [],
};

let refreshInterval: NodeJS.Timeout | null = null;

export const useDashboardStore = create<DashboardState & DashboardActions>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    // ============================================================================
    // DATA FETCHING
    // ============================================================================

    fetchDashboardStats: async () => {
      try {
        const stats = await api.getDashboardStats();
        set((state) => ({
          stats,
          error: null,
          lastUpdate: new Date(),
        }));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch dashboard stats';
        set({ error: errorMessage });
        console.error('Failed to fetch dashboard stats:', error);
      }
    },

    fetchSystemMetrics: async () => {
      try {
        const systemMetrics = await api.getSystemMetrics();
        set((state) => ({
          systemMetrics,
          error: null,
          lastUpdate: new Date(),
        }));
      } catch (error) {
        console.error('Failed to fetch system metrics:', error);
      }
    },

    fetchWorkflows: async () => {
      try {
        const response = await api.getWorkflows();
        const activeWorkflows = response.workflows.filter(w => w.status === 'running');
        
        set((state) => ({
          workflows: response.workflows,
          activeWorkflows,
          error: null,
          lastUpdate: new Date(),
        }));
      } catch (error) {
        console.error('Failed to fetch workflows:', error);
      }
    },

    fetchRecentActivity: async () => {
      try {
        const response = await api.getRecentActivity();
        set((state) => ({
          recentActivity: response.activities,
          error: null,
          lastUpdate: new Date(),
        }));
      } catch (error) {
        console.error('Failed to fetch recent activity:', error);
      }
    },

    fetchAllData: async () => {
      const { fetchDashboardStats, fetchSystemMetrics, fetchWorkflows, fetchRecentActivity } = get();
      
      set({ isLoading: true });
      
      try {
        await Promise.allSettled([
          fetchDashboardStats(),
          fetchSystemMetrics(),
          fetchWorkflows(),
          fetchRecentActivity(),
        ]);
      } finally {
        set({ isLoading: false });
      }
    },

    // ============================================================================
    // WORKFLOW MANAGEMENT
    // ============================================================================

    startWorkflow: async (workflowId: string) => {
      try {
        await api.startWorkflow(workflowId);
        
        // Update workflow status locally
        set((state) => ({
          workflows: state.workflows.map(w =>
            w.id === workflowId ? { ...w, status: 'running' } : w
          ),
          activeWorkflows: [
            ...state.activeWorkflows,
            ...state.workflows.filter(w => w.id === workflowId)
          ],
        }));
        
        // Add activity
        get().addActivity({
          id: `workflow_start_${workflowId}_${Date.now()}`,
          type: 'workflow',
          title: 'Workflow Started',
          description: `Workflow ${workflowId} has been started`,
          timestamp: new Date(),
          status: 'success',
        });
      } catch (error) {
        console.error('Failed to start workflow:', error);
        throw error;
      }
    },

    stopWorkflow: async (workflowId: string) => {
      try {
        await api.stopWorkflow(workflowId);
        
        // Update workflow status locally
        set((state) => ({
          workflows: state.workflows.map(w =>
            w.id === workflowId ? { ...w, status: 'stopped' } : w
          ),
          activeWorkflows: state.activeWorkflows.filter(w => w.id !== workflowId),
        }));
        
        // Add activity
        get().addActivity({
          id: `workflow_stop_${workflowId}_${Date.now()}`,
          type: 'workflow',
          title: 'Workflow Stopped',
          description: `Workflow ${workflowId} has been stopped`,
          timestamp: new Date(),
          status: 'info',
        });
      } catch (error) {
        console.error('Failed to stop workflow:', error);
        throw error;
      }
    },

    createWorkflow: async (workflow: Partial<WorkflowData>) => {
      try {
        const newWorkflow = await api.createWorkflow(workflow);
        
        set((state) => ({
          workflows: [...state.workflows, newWorkflow],
        }));
        
        // Add activity
        get().addActivity({
          id: `workflow_create_${newWorkflow.id}_${Date.now()}`,
          type: 'workflow',
          title: 'Workflow Created',
          description: `New workflow "${newWorkflow.name}" has been created`,
          timestamp: new Date(),
          status: 'success',
        });
      } catch (error) {
        console.error('Failed to create workflow:', error);
        throw error;
      }
    },

    // ============================================================================
    // REAL-TIME UPDATES
    // ============================================================================

    updateStats: (stats: Partial<DashboardStats>) => {
      set((state) => ({
        stats: state.stats ? { ...state.stats, ...stats } : null,
        lastUpdate: new Date(),
      }));
    },

    updateSystemMetrics: (metrics: Record<string, SystemMetric>) => {
      set((state) => ({
        systemMetrics: { ...state.systemMetrics, ...metrics },
        lastUpdate: new Date(),
      }));
    },

    addActivity: (activity: ActivityItem) => {
      set((state) => ({
        recentActivity: [activity, ...state.recentActivity.slice(0, 49)], // Keep last 50
        lastUpdate: new Date(),
      }));
    },

    updateWorkflowStatus: (workflowId: string, status: string) => {
      set((state) => ({
        workflows: state.workflows.map(w =>
          w.id === workflowId ? { ...w, status } : w
        ),
        activeWorkflows: status === 'running'
          ? [...state.activeWorkflows, ...state.workflows.filter(w => w.id === workflowId)]
          : state.activeWorkflows.filter(w => w.id !== workflowId),
        lastUpdate: new Date(),
      }));
    },

    // ============================================================================
    // PERFORMANCE TRACKING
    // ============================================================================

    addPerformanceSnapshot: () => {
      const { stats } = get();
      if (!stats) return;
      
      const snapshot = {
        timestamp: new Date(),
        metrics: {
          responseTime: stats.responseTime,
          throughput: stats.tasksCompleted,
          successRate: stats.successRate,
          activeAgents: stats.activeAgents,
        },
      };
      
      set((state) => ({
        performanceHistory: [
          snapshot,
          ...state.performanceHistory.slice(0, 99) // Keep last 100 snapshots
        ],
      }));
    },

    // ============================================================================
    // UI ACTIONS
    // ============================================================================

    setLoading: (loading: boolean) => {
      set({ isLoading: loading });
    },

    setError: (error: string | null) => {
      set({ error });
    },

    setConnectionStatus: (connected: boolean) => {
      set({ isConnected: connected });
    },

    updateLastUpdate: () => {
      set({ lastUpdate: new Date() });
    },

    // ============================================================================
    // AUTO-REFRESH MANAGEMENT
    // ============================================================================

    startAutoRefresh: () => {
      const { updateInterval, fetchAllData, addPerformanceSnapshot } = get();
      
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
      
      refreshInterval = setInterval(() => {
        fetchAllData();
        addPerformanceSnapshot();
      }, updateInterval);
      
      // Initial fetch
      fetchAllData();
    },

    stopAutoRefresh: () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
      }
    },
  }))
);

// ============================================================================
// SELECTORS FOR OPTIMIZED COMPONENT UPDATES
// ============================================================================

export const useDashboardStats = () =>
  useDashboardStore((state) => state.stats);

export const useSystemMetrics = () =>
  useDashboardStore((state) => state.systemMetrics);

export const useActiveWorkflows = () =>
  useDashboardStore((state) => state.activeWorkflows);

export const useRecentActivity = () =>
  useDashboardStore((state) => state.recentActivity);

export const useDashboardConnection = () =>
  useDashboardStore((state) => ({
    isConnected: state.isConnected,
    lastUpdate: state.lastUpdate,
    isLoading: state.isLoading,
    error: state.error,
  }));

export const usePerformanceHistory = () =>
  useDashboardStore((state) => state.performanceHistory);

// ============================================================================
// CLEANUP ON MODULE UNLOAD
// ============================================================================

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
  });
}