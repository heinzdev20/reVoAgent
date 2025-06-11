import { useState, useEffect, useCallback } from 'react';

interface SystemStatus {
  status: string;
  agents: {
    active: number;
    total: number;
  };
  system: {
    cpu_usage: number;
    memory_usage: number;
    uptime: number;
  };
  ai_providers: string[];
}

interface ActivityItem {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

export const useRealTimeBackend = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);

  // Connect to WebSocket
  const connectWebSocket = useCallback(() => {
    const websocket = new WebSocket('wss://work-2-fmrkddnqeqzanber.prod-runtime.all-hands.dev/ws/dashboard');
    
    websocket.onopen = () => {
      console.log('🔌 Connected to reVoAgent backend');
      setIsConnected(true);
    };

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'system_status') {
          setSystemStatus(data.data);
        } else if (data.type === 'activity') {
          setActivities(prev => [data.data, ...prev.slice(0, 9)]); // Keep last 10
        }
      } catch (error) {
        console.error('WebSocket message parse error:', error);
      }
    };

    websocket.onclose = () => {
      console.log('🔌 Disconnected from reVoAgent backend');
      setIsConnected(false);
      setWs(null);
      
      // Reconnect after 3 seconds
      setTimeout(connectWebSocket, 3000);
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    setWs(websocket);
  }, []);

  // Fetch initial data from REST API
  const fetchSystemStatus = useCallback(async () => {
    try {
      // Use the health endpoint and dashboard stats
      const [healthResponse, statsResponse] = await Promise.all([
        fetch('https://work-2-fmrkddnqeqzanber.prod-runtime.all-hands.dev/health'),
        fetch('https://work-2-fmrkddnqeqzanber.prod-runtime.all-hands.dev/api/dashboard/stats')
      ]);
      
      if (healthResponse.ok && statsResponse.ok) {
        const healthData = await healthResponse.json();
        const statsData = await statsResponse.json();
        
        // Combine the data into our expected format
        setSystemStatus({
          status: healthData.status,
          agents: {
            active: statsData.agents?.active || 0,
            total: statsData.agents?.total || 0
          },
          system: {
            cpu_usage: statsData.system?.cpu_usage || 0,
            memory_usage: statsData.system?.memory_usage || 0,
            uptime: statsData.system?.uptime || 0
          },
          ai_providers: Object.keys(healthData.ai_providers || {})
        });
      }
    } catch (error) {
      console.error('Failed to fetch system status:', error);
    }
  }, []);

  const fetchActivities = useCallback(async () => {
    try {
      const response = await fetch('https://work-2-fmrkddnqeqzanber.prod-runtime.all-hands.dev/api/dashboard/activity');
      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities || []);
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    }
  }, []);

  // Execute agent
  const executeAgent = useCallback(async (description: string, parameters: any = {}) => {
    try {
      const response = await fetch('https://work-2-fmrkddnqeqzanber.prod-runtime.all-hands.dev/api/agents/code-generator/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, parameters })
      });
      
      if (response.ok) {
        const result = await response.json();
        return result;
      }
    } catch (error) {
      console.error('Failed to execute agent:', error);
    }
  }, []);

  // Test AI
  const testAI = useCallback(async (prompt: string, taskType: string = 'general') => {
    try {
      const response = await fetch('https://work-2-fmrkddnqeqzanber.prod-runtime.all-hands.dev/api/ai/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, task_type: taskType })
      });
      
      if (response.ok) {
        const result = await response.json();
        return result;
      }
    } catch (error) {
      console.error('Failed to test AI:', error);
    }
  }, []);

  // Initialize connection
  useEffect(() => {
    connectWebSocket();
    fetchSystemStatus();
    fetchActivities();

    // Cleanup on unmount
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [connectWebSocket, fetchSystemStatus, fetchActivities]);

  // Periodic status updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (isConnected) {
        fetchSystemStatus();
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [isConnected, fetchSystemStatus]);

  return {
    isConnected,
    systemStatus,
    activities,
    executeAgent,
    testAI,
    refreshData: () => {
      fetchSystemStatus();
      fetchActivities();
    }
  };
};