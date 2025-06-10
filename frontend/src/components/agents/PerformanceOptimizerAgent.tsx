/**
 * ⚡ Performance Optimizer Agent - Advanced Performance Analysis & Optimization
 * Real-time performance monitoring with intelligent optimization recommendations
 */

import React, { useState, useEffect } from 'react';
import { 
  Gauge, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Clock, 
  Cpu, 
  MemoryStick, 
  HardDrive,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Settings,
  Play,
  Square,
  RefreshCw,
  Download,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Flame,
  Database,
  Network,
  Monitor,
  Code,
  FileText,
  Lightbulb
} from 'lucide-react';
import { 
  useAgentStore, 
  useAgentStatus, 
  useAgentError, 
  useIsAgentExecuting,
  useAgentMetrics,
  useAgentTaskHistory
} from '../../stores/agentStore';
import { AGENT_TYPES } from '../../services/api';
import { cn } from '../../utils/cn';

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
  threshold: number;
  category: 'cpu' | 'memory' | 'disk' | 'network' | 'database' | 'application';
}

interface OptimizationSuggestion {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'easy' | 'moderate' | 'complex';
  category: 'code' | 'database' | 'infrastructure' | 'configuration';
  estimatedImprovement: string;
  implementation: string[];
  priority: number;
}

interface PerformanceReport {
  id: string;
  timestamp: string;
  overallScore: number;
  metrics: PerformanceMetric[];
  suggestions: OptimizationSuggestion[];
  duration: number;
}

export function PerformanceOptimizerAgent() {
  const status = useAgentStatus(AGENT_TYPES.PERFORMANCE_OPTIMIZER);
  const error = useAgentError(AGENT_TYPES.PERFORMANCE_OPTIMIZER);
  const isExecuting = useIsAgentExecuting(AGENT_TYPES.PERFORMANCE_OPTIMIZER);
  const metrics = useAgentMetrics(AGENT_TYPES.PERFORMANCE_OPTIMIZER);
  const taskHistory = useAgentTaskHistory(AGENT_TYPES.PERFORMANCE_OPTIMIZER);
  const { executeAgent, fetchAgentStatus } = useAgentStore();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'analyze' | 'optimize' | 'reports'>('dashboard');
  const [analysisType, setAnalysisType] = useState<'full' | 'quick' | 'targeted' | 'continuous'>('quick');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['cpu', 'memory', 'response-time']);
  const [optimizationTarget, setOptimizationTarget] = useState('');

  // Mock data for demonstration
  const [performanceMetrics] = useState<PerformanceMetric[]>([
    {
      id: '1',
      name: 'CPU Usage',
      value: 68,
      unit: '%',
      trend: 'up',
      status: 'warning',
      threshold: 80,
      category: 'cpu'
    },
    {
      id: '2',
      name: 'Memory Usage',
      value: 45,
      unit: '%',
      trend: 'stable',
      status: 'good',
      threshold: 85,
      category: 'memory'
    },
    {
      id: '3',
      name: 'Response Time',
      value: 245,
      unit: 'ms',
      trend: 'down',
      status: 'good',
      threshold: 500,
      category: 'application'
    },
    {
      id: '4',
      name: 'Disk I/O',
      value: 78,
      unit: 'MB/s',
      trend: 'up',
      status: 'warning',
      threshold: 100,
      category: 'disk'
    },
    {
      id: '5',
      name: 'Database Queries',
      value: 1250,
      unit: 'qps',
      trend: 'stable',
      status: 'good',
      threshold: 2000,
      category: 'database'
    },
    {
      id: '6',
      name: 'Network Latency',
      value: 12,
      unit: 'ms',
      trend: 'down',
      status: 'good',
      threshold: 50,
      category: 'network'
    }
  ]);

  const [optimizationSuggestions] = useState<OptimizationSuggestion[]>([
    {
      id: '1',
      title: 'Implement Database Query Caching',
      description: 'Add Redis caching layer for frequently accessed database queries to reduce response times.',
      impact: 'high',
      effort: 'moderate',
      category: 'database',
      estimatedImprovement: '40% faster response times',
      implementation: [
        'Install Redis server',
        'Configure cache middleware',
        'Implement cache invalidation strategy',
        'Monitor cache hit rates'
      ],
      priority: 1
    },
    {
      id: '2',
      title: 'Optimize Image Compression',
      description: 'Implement WebP format and lazy loading for images to reduce bandwidth usage.',
      impact: 'medium',
      effort: 'easy',
      category: 'infrastructure',
      estimatedImprovement: '25% faster page loads',
      implementation: [
        'Convert images to WebP format',
        'Implement lazy loading',
        'Add responsive image sizes',
        'Enable browser caching'
      ],
      priority: 2
    },
    {
      id: '3',
      title: 'Code Splitting and Bundling',
      description: 'Implement dynamic imports and code splitting to reduce initial bundle size.',
      impact: 'high',
      effort: 'moderate',
      category: 'code',
      estimatedImprovement: '35% smaller initial bundle',
      implementation: [
        'Analyze bundle composition',
        'Implement route-based splitting',
        'Add dynamic imports for heavy components',
        'Configure webpack optimization'
      ],
      priority: 1
    }
  ]);

  const handleStartAnalysis = async () => {
    try {
      await executeAgent(AGENT_TYPES.PERFORMANCE_OPTIMIZER, {
        action: 'analyze_performance',
        type: analysisType,
        metrics: selectedMetrics,
        target: optimizationTarget
      });
    } catch (err) {
      console.error('Performance analysis failed:', err);
    }
  };

  const handleOptimize = async (suggestionId: string) => {
    try {
      await executeAgent(AGENT_TYPES.PERFORMANCE_OPTIMIZER, {
        action: 'apply_optimization',
        suggestion_id: suggestionId
      });
    } catch (err) {
      console.error('Optimization failed:', err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'critical': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-green-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cpu': return <Cpu className="w-4 h-4" />;
      case 'memory': return <MemoryStick className="w-4 h-4" />;
      case 'disk': return <HardDrive className="w-4 h-4" />;
      case 'network': return <Network className="w-4 h-4" />;
      case 'database': return <Database className="w-4 h-4" />;
      case 'application': return <Monitor className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'easy': return 'text-green-600 bg-green-50';
      case 'moderate': return 'text-yellow-600 bg-yellow-50';
      case 'complex': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const overallScore = Math.round(performanceMetrics.reduce((acc, metric) => {
    const score = metric.status === 'good' ? 100 : metric.status === 'warning' ? 70 : 30;
    return acc + score;
  }, 0) / performanceMetrics.length);

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl text-white">
              <Gauge className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Performance Optimizer</h1>
              <p className="text-gray-600">Advanced performance analysis and optimization recommendations</p>
            </div>
          </div>

          {/* Status Bar */}
          <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-3 h-3 rounded-full",
                status?.status === 'idle' ? 'bg-green-500' : 
                status?.status === 'busy' ? 'bg-yellow-500' : 'bg-gray-400'
              )} />
              <span className="text-sm font-medium">
                {status?.status === 'idle' ? 'Ready' : 
                 status?.status === 'busy' ? 'Analyzing...' : 'Offline'}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Overall Score: <span className={cn(
                "font-bold",
                overallScore >= 80 ? 'text-green-600' :
                overallScore >= 60 ? 'text-yellow-600' : 'text-red-600'
              )}>{overallScore}/100</span>
            </div>
            {isExecuting && (
              <div className="flex items-center gap-2 text-blue-600">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-sm">Processing...</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-white p-1 rounded-xl shadow-sm">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'analyze', label: 'Analyze', icon: Search },
            { id: 'optimize', label: 'Optimize', icon: Zap },
            { id: 'reports', label: 'Reports', icon: FileText }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
                activeTab === tab.id
                  ? "bg-blue-500 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Performance Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {performanceMetrics.map((metric) => (
                <div key={metric.id} className="bg-white rounded-xl p-6 shadow-sm border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(metric.category)}
                      <h3 className="font-semibold text-gray-900">{metric.name}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(metric.status)}
                      {getTrendIcon(metric.trend)}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-gray-900">{metric.value}</span>
                      <span className="text-sm text-gray-500">{metric.unit}</span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={cn(
                          "h-2 rounded-full transition-all",
                          metric.status === 'good' ? 'bg-green-500' :
                          metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                        )}
                        style={{ width: `${Math.min((metric.value / metric.threshold) * 100, 100)}%` }}
                      />
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      Threshold: {metric.threshold} {metric.unit}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Top Optimization Suggestions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center gap-3 mb-6">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                <h2 className="text-xl font-bold text-gray-900">Top Optimization Suggestions</h2>
              </div>
              
              <div className="space-y-4">
                {optimizationSuggestions.slice(0, 3).map((suggestion) => (
                  <div key={suggestion.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{suggestion.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
                        
                        <div className="flex items-center gap-4">
                          <span className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium border",
                            getImpactColor(suggestion.impact)
                          )}>
                            {suggestion.impact.toUpperCase()} IMPACT
                          </span>
                          <span className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            getEffortColor(suggestion.effort)
                          )}>
                            {suggestion.effort.toUpperCase()} EFFORT
                          </span>
                          <span className="text-sm text-green-600 font-medium">
                            {suggestion.estimatedImprovement}
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleOptimize(suggestion.id)}
                        className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analyze' && (
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Performance Analysis</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Analysis Type
                </label>
                <select
                  value={analysisType}
                  onChange={(e) => setAnalysisType(e.target.value as any)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="quick">Quick Analysis (5 min)</option>
                  <option value="full">Full Analysis (30 min)</option>
                  <option value="targeted">Targeted Analysis</option>
                  <option value="continuous">Continuous Monitoring</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target (Optional)
                </label>
                <input
                  type="text"
                  value={optimizationTarget}
                  onChange={(e) => setOptimizationTarget(e.target.value)}
                  placeholder="e.g., /api/users, database queries"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Metrics to Analyze
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['cpu', 'memory', 'disk', 'network', 'database', 'response-time'].map((metric) => (
                  <label key={metric} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedMetrics.includes(metric)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedMetrics([...selectedMetrics, metric]);
                        } else {
                          setSelectedMetrics(selectedMetrics.filter(m => m !== metric));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 capitalize">{metric.replace('-', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={handleStartAnalysis}
              disabled={isExecuting}
              className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isExecuting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Start Analysis
                </>
              )}
            </button>
          </div>
        )}

        {activeTab === 'optimize' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Optimization Recommendations</h2>
              
              <div className="space-y-6">
                {optimizationSuggestions.map((suggestion) => (
                  <div key={suggestion.id} className="border rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{suggestion.title}</h3>
                          <span className="text-sm text-gray-500">Priority {suggestion.priority}</span>
                        </div>
                        <p className="text-gray-600 mb-4">{suggestion.description}</p>
                        
                        <div className="flex items-center gap-4 mb-4">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-sm font-medium border",
                            getImpactColor(suggestion.impact)
                          )}>
                            {suggestion.impact.toUpperCase()} IMPACT
                          </span>
                          <span className={cn(
                            "px-3 py-1 rounded-full text-sm font-medium",
                            getEffortColor(suggestion.effort)
                          )}>
                            {suggestion.effort.toUpperCase()} EFFORT
                          </span>
                          <span className="text-sm text-green-600 font-medium">
                            {suggestion.estimatedImprovement}
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleOptimize(suggestion.id)}
                        className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Apply Optimization
                      </button>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Implementation Steps:</h4>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                        {suggestion.implementation.map((step, index) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Performance Reports</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>
            
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Performance reports will appear here after analysis completion.</p>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <XCircle className="w-4 h-4" />
              <span className="font-medium">Error:</span>
              <span>{error}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}