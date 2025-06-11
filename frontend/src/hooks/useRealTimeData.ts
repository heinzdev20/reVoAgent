/**
 * Real-Time Data Hooks for reVoAgent Frontend
 * Provides real-time data integration with the enterprise backend
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { realApiService, APIResponse, SystemMetrics, AgentPerformanceMetrics } from '../services/realApiService';
import { Agent, AgentStatus, Metrics, CostData, SecurityStatus } from '../types';

// Real-time data state interface
interface RealTimeDataState {
  agents: Agent[];
  systemMetrics: SystemMetrics | null;
  agentMetrics: AgentPerformanceMetrics[];
  costData: CostData | null;
  securityStatus: SecurityStatus | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  lastUpdate: Date | null;
}

// Hook for comprehensive real-time data
export const useRealTimeData = () => {
  const [state, setState] = useState<RealTimeDataState>({
    agents: [],
    systemMetrics: null,
    agentMetrics: [],
    costData: null,
    securityStatus: null,
    isConnected: false,
    isLoading: true,
    error: null,
    lastUpdate: null,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  // Update state safely
  const updateState = useCallback((updates: Partial<RealTimeDataState>) => {
    if (mountedRef.current) {
      setState(prev => ({
        ...prev,
        ...updates,
        lastUpdate: new Date(),
      }));
    }
  }, []);

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    try {
      updateState({ isLoading: true, error: null });

      const [
        agentsResponse,
        systemMetricsResponse,
        agentMetricsResponse,
        costDataResponse,
        securityResponse,
      ] = await Promise.allSettled([
        realApiService.getAgents(),
        realApiService.getSystemMetrics(),
        realApiService.getAgentMetrics(),
        realApiService.getCostAnalytics(),
        realApiService.getSecurityStatus(),
      ]);

      const updates: Partial<RealTimeDataState> = { isLoading: false };

      if (agentsResponse.status === 'fulfilled' && agentsResponse.value.success) {
        updates.agents = agentsResponse.value.data;
      }

      if (systemMetricsResponse.status === 'fulfilled' && systemMetricsResponse.value.success) {
        updates.systemMetrics = systemMetricsResponse.value.data;
      }

      if (agentMetricsResponse.status === 'fulfilled' && agentMetricsResponse.value.success) {
        updates.agentMetrics = agentMetricsResponse.value.data;
      }

      if (costDataResponse.status === 'fulfilled' && costDataResponse.value.success) {
        updates.costData = costDataResponse.value.data;
      }

      if (securityResponse.status === 'fulfilled' && securityResponse.value.success) {
        updates.securityStatus = securityResponse.value.data;
      }

      updateState(updates);
    } catch (error) {
      console.error('Failed to fetch real-time data:', error);
      updateState({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }, [updateState]);

  // Handle real-time updates
  const handleRealTimeUpdate = useCallback((data: any) => {
    console.log('📡 Received real-time update:', data);
    // Refresh data when updates are received
    fetchAllData();
  }, [fetchAllData]);

  const handleConnectionChange = useCallback((connected: boolean) => {
    updateState({ isConnected: connected });
  }, [updateState]);

  // Initialize and cleanup
  useEffect(() => {
    mountedRef.current = true;

    // Initial data fetch
    fetchAllData();

    // Set up WebSocket connection
    realApiService.connectWebSocket();

    // Set up event listeners
    realApiService.on('connected', () => handleConnectionChange(true));
    realApiService.on('disconnected', () => handleConnectionChange(false));
    realApiService.on('update', handleRealTimeUpdate);
    realApiService.on('agent_status', handleRealTimeUpdate);
    realApiService.on('performance_metrics', handleRealTimeUpdate);
    realApiService.on('cost_update', handleRealTimeUpdate);

    // Set up periodic refresh (fallback)
    intervalRef.current = setInterval(fetchAllData, 30000); // 30 seconds

    return () => {
      mountedRef.current = false;
      
      // Cleanup interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Remove event listeners
      realApiService.off('connected', () => handleConnectionChange(true));
      realApiService.off('disconnected', () => handleConnectionChange(false));
      realApiService.off('update', handleRealTimeUpdate);
      realApiService.off('agent_status', handleRealTimeUpdate);
      realApiService.off('performance_metrics', handleRealTimeUpdate);
      realApiService.off('cost_update', handleRealTimeUpdate);
    };
  }, [fetchAllData, handleRealTimeUpdate, handleConnectionChange]);

  // Manual refresh
  const refresh = useCallback(() => {
    fetchAllData();
  }, [fetchAllData]);

  return {
    ...state,
    refresh,
  };
};

// Hook for agent coordination (100-agent system)
export const useAgentCoordination = () => {
  const [claudeAgents, setClaudeAgents] = useState<Agent[]>([]);
  const [geminiAgents, setGeminiAgents] = useState<Agent[]>([]);
  const [openhandsAgents, setOpenhandsAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgentsByType = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [claudeResponse, geminiResponse, openhandsResponse] = await Promise.allSettled([
        realApiService.getClaudeAgents(),
        realApiService.getGeminiAgents(),
        realApiService.getOpenHandsAgents(),
      ]);

      if (claudeResponse.status === 'fulfilled' && claudeResponse.value.success) {
        setClaudeAgents(claudeResponse.value.data);
      }

      if (geminiResponse.status === 'fulfilled' && geminiResponse.value.success) {
        setGeminiAgents(geminiResponse.value.data);
      }

      if (openhandsResponse.status === 'fulfilled' && openhandsResponse.value.success) {
        setOpenhandsAgents(openhandsResponse.value.data);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch agent coordination data:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgentsByType();

    // Set up real-time updates
    const handleAgentUpdate = () => {
      fetchAgentsByType();
    };

    realApiService.on('agent_status', handleAgentUpdate);

    return () => {
      realApiService.off('agent_status', handleAgentUpdate);
    };
  }, [fetchAgentsByType]);

  return {
    claudeAgents,
    geminiAgents,
    openhandsAgents,
    totalAgents: claudeAgents.length + geminiAgents.length + openhandsAgents.length,
    isLoading,
    error,
    refresh: fetchAgentsByType,
  };
};

// Hook for performance monitoring
export const usePerformanceMetrics = () => {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [performanceResponse, systemResponse] = await Promise.allSettled([
        realApiService.getPerformanceMetrics(),
        realApiService.getSystemMetrics(),
      ]);

      if (performanceResponse.status === 'fulfilled' && performanceResponse.value.success) {
        setMetrics(performanceResponse.value.data);
      }

      if (systemResponse.status === 'fulfilled' && systemResponse.value.success) {
        setSystemMetrics(systemResponse.value.data);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch performance metrics:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();

    // Set up real-time updates
    const handleMetricsUpdate = () => {
      fetchMetrics();
    };

    realApiService.on('performance_metrics', handleMetricsUpdate);

    // Periodic refresh
    const interval = setInterval(fetchMetrics, 10000); // 10 seconds

    return () => {
      realApiService.off('performance_metrics', handleMetricsUpdate);
      clearInterval(interval);
    };
  }, [fetchMetrics]);

  return {
    metrics,
    systemMetrics,
    isLoading,
    error,
    refresh: fetchMetrics,
  };
};

// Hook for cost optimization
export const useCostOptimization = () => {
  const [costData, setCostData] = useState<CostData | null>(null);
  const [optimization, setOptimization] = useState<any>(null);
  const [savings, setSavings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCostData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [costResponse, optimizationResponse, savingsResponse] = await Promise.allSettled([
        realApiService.getCostAnalytics(),
        realApiService.getCostOptimization(),
        realApiService.getCostSavings(),
      ]);

      if (costResponse.status === 'fulfilled' && costResponse.value.success) {
        setCostData(costResponse.value.data);
      }

      if (optimizationResponse.status === 'fulfilled' && optimizationResponse.value.success) {
        setOptimization(optimizationResponse.value.data);
      }

      if (savingsResponse.status === 'fulfilled' && savingsResponse.value.success) {
        setSavings(savingsResponse.value.data);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch cost data:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCostData();

    // Set up real-time updates
    const handleCostUpdate = () => {
      fetchCostData();
    };

    realApiService.on('cost_update', handleCostUpdate);

    // Periodic refresh
    const interval = setInterval(fetchCostData, 60000); // 1 minute

    return () => {
      realApiService.off('cost_update', handleCostUpdate);
      clearInterval(interval);
    };
  }, [fetchCostData]);

  return {
    costData,
    optimization,
    savings,
    isLoading,
    error,
    refresh: fetchCostData,
  };
};

// Hook for security monitoring
export const useSecurityMonitoring = () => {
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [compliance, setCompliance] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSecurityData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [statusResponse, alertsResponse, complianceResponse] = await Promise.allSettled([
        realApiService.getSecurityStatus(),
        realApiService.getSecurityAlerts(),
        realApiService.getComplianceStatus(),
      ]);

      if (statusResponse.status === 'fulfilled' && statusResponse.value.success) {
        setSecurityStatus(statusResponse.value.data);
      }

      if (alertsResponse.status === 'fulfilled' && alertsResponse.value.success) {
        setAlerts(alertsResponse.value.data);
      }

      if (complianceResponse.status === 'fulfilled' && complianceResponse.value.success) {
        setCompliance(complianceResponse.value.data);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch security data:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSecurityData();

    // Set up real-time updates
    const handleSecurityUpdate = () => {
      fetchSecurityData();
    };

    realApiService.on('security_alert', handleSecurityUpdate);

    // Periodic refresh
    const interval = setInterval(fetchSecurityData, 30000); // 30 seconds

    return () => {
      realApiService.off('security_alert', handleSecurityUpdate);
      clearInterval(interval);
    };
  }, [fetchSecurityData]);

  return {
    securityStatus,
    alerts,
    compliance,
    isLoading,
    error,
    refresh: fetchSecurityData,
  };
};

// Hook for enterprise features
export const useEnterpriseFeatures = () => {
  const [status, setStatus] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEnterpriseData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [statusResponse, metricsResponse] = await Promise.allSettled([
        realApiService.getEnterpriseStatus(),
        realApiService.getEnterpriseMetrics(),
      ]);

      if (statusResponse.status === 'fulfilled' && statusResponse.value.success) {
        setStatus(statusResponse.value.data);
      }

      if (metricsResponse.status === 'fulfilled' && metricsResponse.value.success) {
        setMetrics(metricsResponse.value.data);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch enterprise data:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEnterpriseData();

    // Periodic refresh
    const interval = setInterval(fetchEnterpriseData, 60000); // 1 minute

    return () => {
      clearInterval(interval);
    };
  }, [fetchEnterpriseData]);

  return {
    status,
    metrics,
    isLoading,
    error,
    refresh: fetchEnterpriseData,
  };
};