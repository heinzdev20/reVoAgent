import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  TrendingUp,
  TrendingDown,
  Activity,
  Cpu,
  HardDrive,
  Wifi,
  Database,
  Clock,
  Users,
  BarChart3,
  Target,
  AlertTriangle,
  CheckCircle,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Download,
  Upload,
  Server,
  Globe,
  Gauge,
  Brain,
  Sparkles,
} from 'lucide-react';
import {
  LineChart,
  AreaChart,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  Bar,
  Line,
} from 'recharts';

interface PerformanceMetric {
  id: string;
  name: string;
  current: number;
  target: number;
  unit: string;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  change: number;
  category: 'engine' | 'system' | 'network' | 'database';
}

interface OptimizationSuggestion {
  id: string;
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  category: string;
  estimatedImprovement: string;
  automated: boolean;
  priority: number;
  steps: string[];
}

interface EnginePerformance {
  name: string;
  responseTime: number;
  throughput: number;
  errorRate: number;
  cpuUsage: number;
  memoryUsage: number;
  status: 'healthy' | 'degraded' | 'critical';
}

interface ScalingRecommendation {
  id: string;
  type: 'horizontal' | 'vertical' | 'optimization';
  reason: string;
  currentCapacity: number;
  recommendedCapacity: number;
  estimatedCost: number;
  timeframe: string;
  confidence: number;
}

export function PerformanceOptimizer() {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('24h');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [autoOptimize, setAutoOptimize] = useState(false);
  const [lastOptimization, setLastOptimization] = useState<Date | null>(null);

  // Mock performance data
  const performanceMetrics = useMemo<PerformanceMetric[]>(() => [
    {
      id: 'perfect-recall-response',
      name: 'Perfect Recall Response Time',
      current: 185,
      target: 200,
      unit: 'ms',
      status: 'excellent',
      trend: 'down',
      change: -8.5,
      category: 'engine',
    },
    {
      id: 'parallel-mind-response',
      name: 'Parallel Mind Response Time',
      current: 142,
      target: 150,
      unit: 'ms',
      status: 'excellent',
      trend: 'down',
      change: -12.3,
      category: 'engine',
    },
    {
      id: 'creative-response',
      name: 'Creative Engine Response Time',
      current: 380,
      target: 400,
      unit: 'ms',
      status: 'good',
      trend: 'stable',
      change: 2.1,
      category: 'engine',
    },
    {
      id: 'concurrent-users',
      name: 'Concurrent Users',
      current: 1847,
      target: 2000,
      unit: 'users',
      status: 'good',
      trend: 'up',
      change: 15.7,
      category: 'system',
    },
    {
      id: 'cpu-usage',
      name: 'CPU Usage',
      current: 68,
      target: 80,
      unit: '%',
      status: 'good',
      trend: 'up',
      change: 5.2,
      category: 'system',
    },
    {
      id: 'memory-usage',
      name: 'Memory Usage',
      current: 74,
      target: 85,
      unit: '%',
      status: 'good',
      trend: 'up',
      change: 8.1,
      category: 'system',
    },
    {
      id: 'network-latency',
      name: 'Network Latency',
      current: 45,
      target: 50,
      unit: 'ms',
      status: 'excellent',
      trend: 'down',
      change: -3.2,
      category: 'network',
    },
    {
      id: 'db-query-time',
      name: 'Database Query Time',
      current: 125,
      target: 100,
      unit: 'ms',
      status: 'warning',
      trend: 'up',
      change: 12.5,
      category: 'database',
    },
  ], []);

  const optimizationSuggestions = useMemo<OptimizationSuggestion[]>(() => [
    {
      id: 'db-indexing',
      title: 'Optimize Database Indexes',
      description: 'Add composite indexes for frequently queried columns to reduce query time by 35%',
      impact: 'high',
      effort: 'medium',
      category: 'database',
      estimatedImprovement: '35% faster queries',
      automated: true,
      priority: 1,
      steps: [
        'Analyze query patterns',
        'Identify missing indexes',
        'Create composite indexes',
        'Monitor performance impact',
      ],
    },
    {
      id: 'engine-caching',
      title: 'Implement Engine Response Caching',
      description: 'Cache frequently requested engine responses to reduce computation time',
      impact: 'high',
      effort: 'low',
      category: 'engine',
      estimatedImprovement: '50% faster responses',
      automated: true,
      priority: 2,
      steps: [
        'Implement Redis caching layer',
        'Configure cache TTL policies',
        'Add cache invalidation logic',
        'Monitor cache hit rates',
      ],
    },
    {
      id: 'connection-pooling',
      title: 'Optimize Connection Pooling',
      description: 'Adjust database connection pool settings for better resource utilization',
      impact: 'medium',
      effort: 'low',
      category: 'database',
      estimatedImprovement: '20% better throughput',
      automated: true,
      priority: 3,
      steps: [
        'Analyze connection usage patterns',
        'Adjust pool size settings',
        'Configure connection timeouts',
        'Monitor connection metrics',
      ],
    },
    {
      id: 'load-balancing',
      title: 'Implement Smart Load Balancing',
      description: 'Use AI-powered load balancing to distribute requests more efficiently',
      impact: 'high',
      effort: 'high',
      category: 'system',
      estimatedImprovement: '40% better resource utilization',
      automated: false,
      priority: 4,
      steps: [
        'Deploy load balancer',
        'Configure health checks',
        'Implement weighted routing',
        'Monitor distribution metrics',
      ],
    },
  ], []);

  const enginePerformance = useMemo<EnginePerformance[]>(() => [
    {
      name: 'Perfect Recall Engine',
      responseTime: 185,
      throughput: 450,
      errorRate: 0.2,
      cpuUsage: 65,
      memoryUsage: 72,
      status: 'healthy',
    },
    {
      name: 'Parallel Mind Engine',
      responseTime: 142,
      throughput: 680,
      errorRate: 0.1,
      cpuUsage: 58,
      memoryUsage: 68,
      status: 'healthy',
    },
    {
      name: 'Creative Engine',
      responseTime: 380,
      throughput: 280,
      errorRate: 0.3,
      cpuUsage: 78,
      memoryUsage: 82,
      status: 'degraded',
    },
  ], []);

  const scalingRecommendations = useMemo<ScalingRecommendation[]>(() => [
    {
      id: 'horizontal-scaling',
      type: 'horizontal',
      reason: 'Increasing user load requires additional instances',
      currentCapacity: 2000,
      recommendedCapacity: 3000,
      estimatedCost: 450,
      timeframe: '3 days',
      confidence: 0.87,
    },
    {
      id: 'memory-upgrade',
      type: 'vertical',
      reason: 'Memory usage approaching limits',
      currentCapacity: 16,
      recommendedCapacity: 32,
      estimatedCost: 200,
      timeframe: '1 week',
      confidence: 0.92,
    },
  ], []);

  // Generate performance timeline data
  const performanceTimeline = useMemo(() => {
    const hours = selectedTimeRange === '1h' ? 1 : selectedTimeRange === '6h' ? 6 : selectedTimeRange === '24h' ? 24 : 168;
    const points = selectedTimeRange === '7d' ? 24 : hours;
    
    return Array.from({ length: points }, (_, i) => ({
      time: selectedTimeRange === '7d' ? `Day ${i + 1}` : `${i}:00`,
      perfectRecall: 180 + Math.random() * 40 + Math.sin(i / points * Math.PI * 2) * 20,
      parallelMind: 140 + Math.random() * 30 + Math.sin(i / points * Math.PI * 2) * 15,
      creative: 370 + Math.random() * 60 + Math.sin(i / points * Math.PI * 2) * 30,
      users: 1500 + Math.random() * 800 + Math.sin(i / points * Math.PI * 2) * 400,
    }));
  }, [selectedTimeRange]);

  const runOptimization = async (suggestionId?: string) => {
    setIsOptimizing(true);
    
    // Simulate optimization process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setLastOptimization(new Date());
    setIsOptimizing(false);
    
    // Show success notification (could be implemented with a toast system)
    console.log(`Optimization ${suggestionId ? `for ${suggestionId}` : ''} completed successfully`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getEngineStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const filteredMetrics = useMemo(() => {
    return selectedCategory === 'all' 
      ? performanceMetrics 
      : performanceMetrics.filter(metric => metric.category === selectedCategory);
  }, [performanceMetrics, selectedCategory]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Performance Optimizer</h1>
            <p className="text-gray-600">AI-powered performance monitoring and optimization</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Auto Optimize Toggle */}
          <button
            onClick={() => setAutoOptimize(!autoOptimize)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              autoOptimize 
                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${autoOptimize ? 'animate-pulse' : ''}`} />
            <span className="text-sm">Auto Optimize</span>
          </button>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="engine">Engines</option>
            <option value="system">System</option>
            <option value="network">Network</option>
            <option value="database">Database</option>
          </select>

          {/* Time Range */}
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="1h">Last Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>

          {/* Run Optimization */}
          <button
            onClick={() => runOptimization()}
            disabled={isOptimizing}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {isOptimizing ? (
              <RotateCcw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            <span>{isOptimizing ? 'Optimizing...' : 'Optimize'}</span>
          </button>
        </div>
      </div>

      {/* Last Optimization */}
      {lastOptimization && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-medium">
              Last optimization completed: {lastOptimization.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Performance Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredMetrics.map((metric) => {
          const statusColor = getStatusColor(metric.status);
          const TrendIcon = metric.trend === 'up' ? TrendingUp : metric.trend === 'down' ? TrendingDown : Activity;
          const progress = (metric.current / metric.target) * 100;

          return (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 text-sm">{metric.name}</h3>
                <div className={`flex items-center space-x-1 ${
                  metric.trend === 'up' && metric.category === 'engine' ? 'text-red-600' :
                  metric.trend === 'down' && metric.category === 'engine' ? 'text-green-600' :
                  metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  <TrendIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {metric.change > 0 ? '+' : ''}{metric.change}%
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {metric.current.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-600">{metric.unit}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    Target: {metric.target.toLocaleString()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                    {metric.status.toUpperCase()}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      metric.status === 'excellent' ? 'bg-green-500' :
                      metric.status === 'good' ? 'bg-blue-500' :
                      metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Performance Timeline */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Performance Timeline</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Activity className="w-4 h-4" />
            <span>Real-time monitoring</span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={performanceTimeline}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip 
              formatter={(value: any, name: string) => [
                `${Math.round(value)}${name.includes('users') ? ' users' : ' ms'}`,
                name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
              ]}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="perfectRecall"
              stroke="#10B981"
              strokeWidth={2}
              name="Perfect Recall"
            />
            <Line
              type="monotone"
              dataKey="parallelMind"
              stroke="#3B82F6"
              strokeWidth={2}
              name="Parallel Mind"
            />
            <Line
              type="monotone"
              dataKey="creative"
              stroke="#F59E0B"
              strokeWidth={2}
              name="Creative Engine"
            />
            <Line
              type="monotone"
              dataKey="users"
              stroke="#8B5CF6"
              strokeWidth={2}
              name="Concurrent Users"
              yAxisId="right"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Engine Performance */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Server className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Engine Performance</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {enginePerformance.map((engine, index) => (
            <motion.div
              key={engine.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">{engine.name}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEngineStatusColor(engine.status)} bg-opacity-10`}>
                  {engine.status.toUpperCase()}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Response Time</span>
                  <span className="font-medium">{engine.responseTime}ms</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Throughput</span>
                  <span className="font-medium">{engine.throughput} req/s</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Error Rate</span>
                  <span className="font-medium">{engine.errorRate}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">CPU Usage</span>
                  <span className="font-medium">{engine.cpuUsage}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Memory Usage</span>
                  <span className="font-medium">{engine.memoryUsage}%</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Optimization Suggestions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Brain className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI Optimization Suggestions</h3>
        </div>

        <div className="space-y-4">
          {optimizationSuggestions.map((suggestion, index) => (
            <motion.div
              key={suggestion.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-semibold text-gray-900">{suggestion.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(suggestion.impact)}`}>
                      {suggestion.impact.toUpperCase()} IMPACT
                    </span>
                    {suggestion.automated && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        AUTO
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{suggestion.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Effort: {suggestion.effort}</span>
                    <span>Priority: {suggestion.priority}</span>
                    <span className="text-green-600 font-medium">{suggestion.estimatedImprovement}</span>
                  </div>
                </div>

                <button
                  onClick={() => runOptimization(suggestion.id)}
                  disabled={isOptimizing}
                  className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                >
                  {isOptimizing ? (
                    <RotateCcw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  <span>Apply</span>
                </button>
              </div>

              {/* Steps */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h5 className="text-sm font-medium text-gray-900 mb-2">Implementation Steps:</h5>
                <ol className="text-sm text-gray-600 space-y-1">
                  {suggestion.steps.map((step, i) => (
                    <li key={i} className="flex items-center space-x-2">
                      <span className="w-4 h-4 bg-purple-100 text-purple-600 rounded-full text-xs flex items-center justify-center font-medium">
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Scaling Recommendations */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <TrendingUp className="w-6 h-6 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Scaling Recommendations</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {scalingRecommendations.map((recommendation, index) => (
            <motion.div
              key={recommendation.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900 capitalize">
                  {recommendation.type} Scaling
                </h4>
                <span className="text-sm text-gray-600">
                  {Math.round(recommendation.confidence * 100)}% confidence
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-4">{recommendation.reason}</p>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Current Capacity</span>
                  <span className="font-medium">{recommendation.currentCapacity.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Recommended</span>
                  <span className="font-medium text-green-600">{recommendation.recommendedCapacity.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Estimated Cost</span>
                  <span className="font-medium">${recommendation.estimatedCost}/month</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Timeframe</span>
                  <span className="font-medium">{recommendation.timeframe}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}