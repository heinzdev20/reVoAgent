import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Brain,
  Clock,
  Users,
  Zap,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Target,
  Gauge,
  Calendar,
  Filter,
  Download,
  RefreshCw,
} from 'lucide-react';
import {
  LineChart as RechartsLineChart,
  AreaChart,
  BarChart,
  PieChart as RechartsPieChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  Bar,
  Line,
  Cell,
  Pie,
} from 'recharts';

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
  prediction: number;
  confidence: number;
  category: 'performance' | 'usage' | 'efficiency' | 'quality';
}

interface PredictiveInsight {
  id: string;
  type: 'forecast' | 'anomaly' | 'optimization' | 'alert';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  timeframe: string;
  recommendation?: string;
  data?: any[];
}

interface UsagePattern {
  hour: number;
  users: number;
  requests: number;
  responseTime: number;
  errorRate: number;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export function PredictiveAnalytics() {
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['performance', 'usage']);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Mock data generation - in real implementation, this would come from API
  const performanceMetrics = useMemo<PerformanceMetric[]>(() => [
    {
      id: 'response-time',
      name: 'Avg Response Time',
      value: 245,
      trend: 'down',
      change: -12.5,
      prediction: 220,
      confidence: 0.89,
      category: 'performance',
    },
    {
      id: 'throughput',
      name: 'Requests/sec',
      value: 1250,
      trend: 'up',
      change: 18.3,
      prediction: 1400,
      confidence: 0.92,
      category: 'performance',
    },
    {
      id: 'error-rate',
      name: 'Error Rate',
      value: 0.8,
      trend: 'down',
      change: -0.3,
      prediction: 0.5,
      confidence: 0.85,
      category: 'quality',
    },
    {
      id: 'active-users',
      name: 'Active Users',
      value: 2847,
      trend: 'up',
      change: 24.7,
      prediction: 3200,
      confidence: 0.78,
      category: 'usage',
    },
    {
      id: 'cpu-usage',
      name: 'CPU Usage',
      value: 68,
      trend: 'stable',
      change: 2.1,
      prediction: 70,
      confidence: 0.91,
      category: 'performance',
    },
    {
      id: 'memory-usage',
      name: 'Memory Usage',
      value: 74,
      trend: 'up',
      change: 8.4,
      prediction: 82,
      confidence: 0.87,
      category: 'performance',
    },
  ], []);

  const predictiveInsights = useMemo<PredictiveInsight[]>(() => [
    {
      id: 'scaling-forecast',
      type: 'forecast',
      title: 'Scaling Required in 3 Days',
      description: 'Based on current growth trends, you\'ll need to scale infrastructure by 40% within 3 days to maintain performance.',
      impact: 'high',
      confidence: 0.87,
      timeframe: '3 days',
      recommendation: 'Pre-scale infrastructure to handle 40% more load',
    },
    {
      id: 'anomaly-detection',
      type: 'anomaly',
      title: 'Unusual Traffic Pattern Detected',
      description: 'Traffic spike detected at 2:30 AM - 300% above normal. Possible bot activity or viral content.',
      impact: 'medium',
      confidence: 0.94,
      timeframe: 'Now',
      recommendation: 'Investigate traffic source and implement rate limiting if needed',
    },
    {
      id: 'optimization-opportunity',
      type: 'optimization',
      title: 'Database Query Optimization',
      description: 'AI identified 15 slow queries that could be optimized to reduce response time by 35%.',
      impact: 'medium',
      confidence: 0.91,
      timeframe: '1 week',
      recommendation: 'Optimize identified queries and add appropriate indexes',
    },
    {
      id: 'capacity-alert',
      type: 'alert',
      title: 'Memory Usage Approaching Limit',
      description: 'Memory usage trending upward. Will reach 90% capacity in 6 hours at current rate.',
      impact: 'critical',
      confidence: 0.96,
      timeframe: '6 hours',
      recommendation: 'Increase memory allocation or optimize memory usage',
    },
  ], []);

  const usagePatterns = useMemo<UsagePattern[]>(() => {
    return Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      users: Math.floor(Math.random() * 1000) + 500 + Math.sin(i / 24 * Math.PI * 2) * 300,
      requests: Math.floor(Math.random() * 5000) + 2000 + Math.sin(i / 24 * Math.PI * 2) * 1500,
      responseTime: Math.floor(Math.random() * 100) + 200 + Math.sin(i / 24 * Math.PI * 2) * 50,
      errorRate: Math.random() * 2 + Math.sin(i / 24 * Math.PI * 2) * 0.5,
    }));
  }, [timeRange]);

  const refreshData = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastUpdated(new Date());
    setIsLoading(false);
  };

  const exportData = () => {
    const data = {
      metrics: performanceMetrics,
      insights: predictiveInsights,
      patterns: usagePatterns,
      timestamp: new Date().toISOString(),
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `analytics_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const getMetricIcon = (category: string) => {
    switch (category) {
      case 'performance': return Zap;
      case 'usage': return Users;
      case 'efficiency': return Target;
      case 'quality': return CheckCircle;
      default: return BarChart3;
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'forecast': return TrendingUp;
      case 'anomaly': return AlertTriangle;
      case 'optimization': return Target;
      case 'alert': return AlertTriangle;
      default: return Brain;
    }
  };

  const getInsightColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'bg-red-50 border-red-200 text-red-800';
      case 'high': return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'medium': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'low': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Predictive Analytics</h1>
            <p className="text-gray-600">AI-powered insights and forecasting</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>

          {/* Export Button */}
          <button
            onClick={exportData}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={refreshData}
            disabled={isLoading}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-sm text-gray-600">
        Last updated: {lastUpdated.toLocaleTimeString()}
      </div>

      {/* Performance Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {performanceMetrics.map((metric) => {
          const IconComponent = getMetricIcon(metric.category);
          const isPositiveTrend = metric.trend === 'up' && metric.category !== 'performance' || 
                                 metric.trend === 'down' && metric.category === 'performance';

          return (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <IconComponent className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{metric.name}</h3>
                </div>
                <div className={`flex items-center space-x-1 ${
                  isPositiveTrend ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : metric.trend === 'down' ? (
                    <TrendingDown className="w-4 h-4" />
                  ) : (
                    <Activity className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="text-sm font-medium">
                    {metric.change > 0 ? '+' : ''}{metric.change}%
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {metric.value.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-600">
                    {metric.category === 'performance' && metric.name.includes('Time') ? 'ms' :
                     metric.category === 'performance' && metric.name.includes('Usage') ? '%' :
                     metric.name.includes('Rate') ? '%' : ''}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    Predicted: {metric.prediction.toLocaleString()}
                  </span>
                  <span className="text-purple-600 font-medium">
                    {Math.round(metric.confidence * 100)}% confidence
                  </span>
                </div>

                {/* Progress bar for confidence */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${metric.confidence * 100}%` }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Usage Patterns Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Usage Patterns & Predictions</h3>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <select
              multiple
              value={selectedMetrics}
              onChange={(e) => setSelectedMetrics(Array.from(e.target.selectedOptions, option => option.value))}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="users">Users</option>
              <option value="requests">Requests</option>
              <option value="responseTime">Response Time</option>
              <option value="errorRate">Error Rate</option>
            </select>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={usagePatterns}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="hour" 
              tickFormatter={(value) => `${value}:00`}
            />
            <YAxis />
            <Tooltip 
              labelFormatter={(value) => `${value}:00`}
              formatter={(value: any, name: string) => [
                typeof value === 'number' ? value.toLocaleString() : value,
                name.charAt(0).toUpperCase() + name.slice(1)
              ]}
            />
            <Legend />
            {selectedMetrics.includes('users') && (
              <Area
                type="monotone"
                dataKey="users"
                stackId="1"
                stroke={COLORS[0]}
                fill={COLORS[0]}
                fillOpacity={0.6}
                name="Users"
              />
            )}
            {selectedMetrics.includes('requests') && (
              <Area
                type="monotone"
                dataKey="requests"
                stackId="2"
                stroke={COLORS[1]}
                fill={COLORS[1]}
                fillOpacity={0.6}
                name="Requests"
              />
            )}
            {selectedMetrics.includes('responseTime') && (
              <Line
                type="monotone"
                dataKey="responseTime"
                stroke={COLORS[2]}
                strokeWidth={2}
                name="Response Time (ms)"
              />
            )}
            {selectedMetrics.includes('errorRate') && (
              <Line
                type="monotone"
                dataKey="errorRate"
                stroke={COLORS[3]}
                strokeWidth={2}
                name="Error Rate (%)"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Predictive Insights */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Brain className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI-Powered Insights</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {predictiveInsights.map((insight, index) => {
            const IconComponent = getInsightIcon(insight.type);
            const colorClass = getInsightColor(insight.impact);

            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`border rounded-lg p-4 ${colorClass} bg-opacity-50`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${colorClass}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{insight.title}</h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs px-2 py-1 bg-white bg-opacity-50 rounded-full">
                          {insight.timeframe}
                        </span>
                        <span className="text-xs px-2 py-1 bg-white bg-opacity-50 rounded-full">
                          {Math.round(insight.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm opacity-90 mb-3">{insight.description}</p>
                    
                    {insight.recommendation && (
                      <div className="bg-white bg-opacity-50 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <Target className="w-4 h-4" />
                          <span className="text-sm font-medium">Recommendation</span>
                        </div>
                        <p className="text-sm">{insight.recommendation}</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}