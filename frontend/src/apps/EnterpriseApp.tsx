// 🏢 Enterprise reVoAgent Application
// Production-ready frontend for 100-agent coordination and three-engine architecture

import React, { useState, useEffect } from 'react';
import { AgentCoordinationDashboard } from '@/components/AgentCoordinationDashboard';
import { enterpriseApi, type MonitoringData } from '@/services/enterpriseApi';
import { enterpriseWebSocket } from '@/services/enterpriseWebSocket';

interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  component: React.ComponentType;
}

// Three-Engine Monitoring Component
const ThreeEngineMonitoring: React.FC = () => {
  const [engineMetrics, setEngineMetrics] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEngineMetrics();
    const interval = setInterval(loadEngineMetrics, 10000); // Every 10 seconds
    
    const unsubscribe = enterpriseWebSocket.subscribeToEngineMetrics(setEngineMetrics);
    
    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  const loadEngineMetrics = async () => {
    try {
      const metrics = await enterpriseApi.getEngineMetrics();
      setEngineMetrics(metrics);
    } catch (error) {
      console.error('Failed to load engine metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'degraded': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading engine metrics...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Three-Engine Architecture Monitoring</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Perfect Recall Engine */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">🧠 Perfect Recall Engine</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(engineMetrics.perfect_recall?.status)}`}>
              {engineMetrics.perfect_recall?.status || 'unknown'}
            </span>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Memory Count:</span>
              <span className="font-semibold">{engineMetrics.perfect_recall?.memory_count || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Query Latency:</span>
              <span className="font-semibold">{engineMetrics.perfect_recall?.query_latency_ms || 0}ms</span>
            </div>
            <div className="flex justify-between">
              <span>Success Rate:</span>
              <span className="font-semibold">{((engineMetrics.perfect_recall?.success_rate || 0) * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Storage Usage:</span>
              <span className="font-semibold">{engineMetrics.perfect_recall?.storage_usage_mb || 0}MB</span>
            </div>
            <div className="flex justify-between">
              <span>Knowledge Nodes:</span>
              <span className="font-semibold">{engineMetrics.perfect_recall?.knowledge_graph_nodes || 0}</span>
            </div>
          </div>
        </div>

        {/* Parallel Mind Engine */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">⚡ Parallel Mind Engine</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(engineMetrics.parallel_mind?.status)}`}>
              {engineMetrics.parallel_mind?.status || 'unknown'}
            </span>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Active Workers:</span>
              <span className="font-semibold">{engineMetrics.parallel_mind?.active_workers || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Queue Size:</span>
              <span className="font-semibold">{engineMetrics.parallel_mind?.queue_size || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Throughput:</span>
              <span className="font-semibold">{engineMetrics.parallel_mind?.throughput_per_minute || 0}/min</span>
            </div>
            <div className="flex justify-between">
              <span>Load Balancing:</span>
              <span className="font-semibold">{((engineMetrics.parallel_mind?.load_balancing_efficiency || 0) * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Creative Engine */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">🎨 Creative Engine</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(engineMetrics.creative?.status)}`}>
              {engineMetrics.creative?.status || 'unknown'}
            </span>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Creativity Score:</span>
              <span className="font-semibold">{((engineMetrics.creative?.creativity_score || 0) * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Patterns Generated:</span>
              <span className="font-semibold">{engineMetrics.creative?.patterns_generated || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Innovation Index:</span>
              <span className="font-semibold">{((engineMetrics.creative?.innovation_index || 0) * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Solution Uniqueness:</span>
              <span className="font-semibold">{((engineMetrics.creative?.solution_uniqueness || 0) * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Engine Performance Chart */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Engine Performance Overview</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {((engineMetrics.perfect_recall?.success_rate || 0) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Perfect Recall Success</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {engineMetrics.parallel_mind?.throughput_per_minute || 0}
            </div>
            <div className="text-sm text-gray-600">Tasks/Minute</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {((engineMetrics.creative?.creativity_score || 0) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Creativity Score</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Quality Gates Monitoring Component
const QualityGatesMonitoring: React.FC = () => {
  const [qualityMetrics, setQualityMetrics] = useState<any>({});
  const [validationHistory, setValidationHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadQualityData();
    const interval = setInterval(loadQualityData, 15000); // Every 15 seconds
    
    const unsubscribe = enterpriseWebSocket.subscribeToQualityGates(handleQualityUpdate);
    
    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  const loadQualityData = async () => {
    try {
      const [metrics, history] = await Promise.all([
        enterpriseApi.getQualityMetrics(),
        enterpriseApi.getValidationHistory(10)
      ]);
      setQualityMetrics(metrics);
      setValidationHistory(history);
    } catch (error) {
      console.error('Failed to load quality data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQualityUpdate = (update: any) => {
    setQualityMetrics(prev => ({ ...prev, ...update }));
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading quality metrics...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Quality Gates Monitoring</h1>
      
      {/* Quality Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-blue-600">
            {(qualityMetrics.overall_score || 0).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">Overall Quality Score</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-green-600">
            {(qualityMetrics.security_score || 0).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">Security Score</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-yellow-600">
            {(qualityMetrics.performance_score || 0).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">Performance Score</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-purple-600">
            {(qualityMetrics.test_coverage || 0).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">Test Coverage</div>
        </div>
      </div>

      {/* Validation History */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Validations</h3>
        <div className="space-y-3">
          {validationHistory.map((validation, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">{validation.validation_id}</div>
                <div className="text-sm text-gray-600">
                  {validation.quality_level} • {validation.passed_gates}/{validation.total_gates} gates passed
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{validation.overall_score.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">{validation.timestamp}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Cost Optimization Dashboard
const CostOptimizationDashboard: React.FC = () => {
  const [costMetrics, setCostMetrics] = useState<any>({});
  const [savingsReport, setSavingsReport] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCostData();
    const interval = setInterval(loadCostData, 20000); // Every 20 seconds
    
    const unsubscribe = enterpriseWebSocket.subscribeToCostUpdates(setCostMetrics);
    
    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  const loadCostData = async () => {
    try {
      const [metrics, report] = await Promise.all([
        enterpriseApi.getCostOptimizationMetrics(),
        enterpriseApi.getSavingsReport()
      ]);
      setCostMetrics(metrics);
      setSavingsReport(report);
    } catch (error) {
      console.error('Failed to load cost data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading cost metrics...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Cost Optimization Dashboard</h1>
      
      {/* Cost Savings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-green-600">
            {(costMetrics.local_model_usage_percent || 0).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">Local Model Usage</div>
          <div className="text-xs text-gray-500 mt-1">Target: 70%+</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-green-600">
            ${(costMetrics.monthly_savings_usd || 0).toFixed(2)}
          </div>
          <div className="text-sm text-gray-600">Monthly Savings</div>
          <div className="text-xs text-gray-500 mt-1">vs Cloud-only</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-blue-600">
            ${(costMetrics.cost_per_request_usd || 0).toFixed(4)}
          </div>
          <div className="text-sm text-gray-600">Cost per Request</div>
          <div className="text-xs text-gray-500 mt-1">Average</div>
        </div>
      </div>

      {/* Detailed Cost Breakdown */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Cost Breakdown</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2">Local Models (Free)</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>DeepSeek R1:</span>
                <span className="font-semibold">{savingsReport.local_requests || 0} requests</span>
              </div>
              <div className="flex justify-between">
                <span>Cost:</span>
                <span className="font-semibold text-green-600">$0.00</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Cloud APIs</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Claude/Gemini:</span>
                <span className="font-semibold">{savingsReport.cloud_requests || 0} requests</span>
              </div>
              <div className="flex justify-between">
                <span>Cost:</span>
                <span className="font-semibold">${(savingsReport.cloud_cost || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Enterprise Application
export const EnterpriseApp: React.FC = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [systemHealth, setSystemHealth] = useState<any>({});
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  const navigationItems: NavigationItem[] = [
    { id: 'dashboard', label: '100-Agent Dashboard', icon: '👥', component: AgentCoordinationDashboard },
    { id: 'engines', label: 'Three-Engine Monitor', icon: '🧠', component: ThreeEngineMonitoring },
    { id: 'quality', label: 'Quality Gates', icon: '🛡️', component: QualityGatesMonitoring },
    { id: 'cost', label: 'Cost Optimization', icon: '💰', component: CostOptimizationDashboard },
  ];

  useEffect(() => {
    // Load system health
    loadSystemHealth();
    const healthInterval = setInterval(loadSystemHealth, 30000);

    // Monitor connection status
    const unsubscribeConnection = enterpriseWebSocket.on('connected', () => setConnectionStatus('connected'));
    const unsubscribeDisconnection = enterpriseWebSocket.on('disconnected', () => setConnectionStatus('disconnected'));

    return () => {
      clearInterval(healthInterval);
      unsubscribeConnection();
      unsubscribeDisconnection();
    };
  }, []);

  const loadSystemHealth = async () => {
    try {
      const health = await enterpriseApi.getSystemHealth();
      setSystemHealth(health);
      setConnectionStatus(enterpriseWebSocket.connectionState);
    } catch (error) {
      console.error('Failed to load system health:', error);
    }
  };

  const CurrentComponent = navigationItems.find(item => item.id === currentView)?.component || AgentCoordinationDashboard;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">reVoAgent Enterprise</h1>
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                connectionStatus === 'connected' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span>{connectionStatus}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                System Health: <span className="font-semibold text-green-600">
                  {systemHealth.status || 'Unknown'}
                </span>
              </div>
              <button
                onClick={loadSystemHealth}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-8">
          {/* Sidebar Navigation */}
          <nav className="w-64 space-y-2">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  currentView === item.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Main Content */}
          <main className="flex-1">
            <CurrentComponent />
          </main>
        </div>
      </div>
    </div>
  );
};