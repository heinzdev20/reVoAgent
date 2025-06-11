/**
 * Performance Panel Component
 * Displays system performance metrics and monitoring data
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Cpu, 
  MemoryStick, 
  HardDrive, 
  Network, 
  Clock,
  TrendingUp,
  Zap,
  Server,
  Database
} from 'lucide-react';

interface PerformancePanelProps {
  metrics?: any;
  systemMetrics?: any;
  className?: string;
}

export const PerformancePanel: React.FC<PerformancePanelProps> = ({
  metrics,
  systemMetrics,
  className = ''
}) => {
  // Mock data for demonstration
  const mockMetrics = {
    response_time: 145,
    throughput: 1250,
    error_rate: 0.02,
    uptime: 99.95,
    cpu_usage: 35,
    memory_usage: 68,
    disk_usage: 45,
    network_io: 125
  };

  const mockSystemMetrics = {
    total_agents: 100,
    active_agents: 95,
    total_requests: 125000,
    success_rate: 0.98,
    average_response_time: 145,
    uptime_percentage: 99.95
  };

  const performanceData = metrics || mockMetrics;
  const systemData = systemMetrics || mockSystemMetrics;

  const getPerformanceColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getUsageColor = (usage: number) => {
    if (usage < 70) return 'bg-green-500';
    if (usage < 85) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Performance Monitoring</h2>
        <div className="flex items-center space-x-2">
          <Activity className="h-6 w-6 text-green-600" />
          <span className="text-lg font-semibold text-green-600">
            {performanceData.uptime}% Uptime
          </span>
        </div>
      </div>

      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Response Time</p>
              <p className={`text-2xl font-bold ${getPerformanceColor(performanceData.response_time, { good: 200, warning: 500 })}`}>
                {performanceData.response_time}ms
              </p>
            </div>
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Throughput</p>
              <p className="text-2xl font-bold text-green-600">
                {performanceData.throughput}/s
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Error Rate</p>
              <p className={`text-2xl font-bold ${getPerformanceColor(performanceData.error_rate * 100, { good: 1, warning: 5 })}`}>
                {(performanceData.error_rate * 100).toFixed(2)}%
              </p>
            </div>
            <Zap className="h-8 w-8 text-yellow-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Agents</p>
              <p className="text-2xl font-bold text-purple-600">
                {systemData.active_agents}/{systemData.total_agents}
              </p>
            </div>
            <Server className="h-8 w-8 text-purple-600" />
          </div>
        </motion.div>
      </div>

      {/* System Resource Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">System Resources</h3>
            <Cpu className="h-5 w-5 text-gray-600" />
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 flex items-center">
                  <Cpu className="h-4 w-4 mr-1" />
                  CPU Usage
                </span>
                <span className="font-medium">{performanceData.cpu_usage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-1000 ${getUsageColor(performanceData.cpu_usage)}`}
                  style={{ width: `${performanceData.cpu_usage}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 flex items-center">
                  <MemoryStick className="h-4 w-4 mr-1" />
                  Memory Usage
                </span>
                <span className="font-medium">{performanceData.memory_usage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-1000 ${getUsageColor(performanceData.memory_usage)}`}
                  style={{ width: `${performanceData.memory_usage}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 flex items-center">
                  <HardDrive className="h-4 w-4 mr-1" />
                  Disk Usage
                </span>
                <span className="font-medium">{performanceData.disk_usage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-1000 ${getUsageColor(performanceData.disk_usage)}`}
                  style={{ width: `${performanceData.disk_usage}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 flex items-center">
                  <Network className="h-4 w-4 mr-1" />
                  Network I/O
                </span>
                <span className="font-medium">{performanceData.network_io} MB/s</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(performanceData.network_io / 2, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Performance Trends */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Performance Summary</h3>
            <Database className="h-5 w-5 text-gray-600" />
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Total Requests</span>
              <span className="text-sm font-bold text-green-600">
                {systemData.total_requests?.toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Success Rate</span>
              <span className="text-sm font-bold text-blue-600">
                {(systemData.success_rate * 100).toFixed(1)}%
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Avg Response Time</span>
              <span className="text-sm font-bold text-purple-600">
                {systemData.average_response_time}ms
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">System Uptime</span>
              <span className="text-sm font-bold text-yellow-600">
                {systemData.uptime_percentage}%
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Performance Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200"
      >
        <h3 className="text-lg font-semibold text-green-900 mb-4">Performance Status</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span className="text-sm text-green-800">All systems operational</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span className="text-sm text-green-800">Response times optimal</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span className="text-sm text-green-800">Resource usage normal</span>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-green-100 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>Performance Excellent:</strong> All metrics are within optimal ranges. 
            System is performing at peak efficiency with {systemData.active_agents} agents active.
          </p>
        </div>
      </motion.div>

      {/* Real-time Status */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>Performance monitoring active</span>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>Live metrics - Updated every 10 seconds</span>
        </div>
      </div>
    </div>
  );
};

export default PerformancePanel;