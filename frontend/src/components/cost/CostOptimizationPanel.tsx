/**
 * Cost Optimization Panel Component
 * Displays cost savings and optimization metrics
 */

import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingDown, Zap, PieChart, BarChart3, Target } from 'lucide-react';

interface CostOptimizationPanelProps {
  costData?: any;
  optimization?: any;
  savings?: any;
  className?: string;
}

export const CostOptimizationPanel: React.FC<CostOptimizationPanelProps> = ({
  costData,
  optimization,
  savings,
  className = ''
}) => {
  // Mock data for demonstration
  const mockData = {
    totalSavings: 95.2,
    monthlySavings: 12500,
    localModelUsage: 70,
    cloudModelUsage: 30,
    costPerRequest: 0.002,
    totalRequests: 125000,
    projectedSavings: 150000
  };

  const data = costData || mockData;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Cost Optimization</h2>
        <div className="flex items-center space-x-2 text-green-600">
          <TrendingDown className="h-5 w-5" />
          <span className="font-semibold">{data.totalSavings}% Savings</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Monthly Savings</p>
              <p className="text-3xl font-bold text-green-900">
                ${data.monthlySavings?.toLocaleString() || '12,500'}
              </p>
              <p className="text-sm text-green-700">vs full cloud deployment</p>
            </div>
            <DollarSign className="h-12 w-12 text-green-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Local Model Usage</p>
              <p className="text-3xl font-bold text-blue-900">
                {data.localModelUsage || 70}%
              </p>
              <p className="text-sm text-blue-700">Free local processing</p>
            </div>
            <Zap className="h-12 w-12 text-blue-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg p-6 border border-purple-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Cost per Request</p>
              <p className="text-3xl font-bold text-purple-900">
                ${data.costPerRequest?.toFixed(4) || '0.0020'}
              </p>
              <p className="text-sm text-purple-700">Average cost</p>
            </div>
            <Target className="h-12 w-12 text-purple-600" />
          </div>
        </motion.div>
      </div>

      {/* Cost Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Usage Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Model Usage Distribution</h3>
            <PieChart className="h-5 w-5 text-gray-600" />
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Local Models (Free)</span>
                <span className="font-medium">{data.localModelUsage || 70}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${data.localModelUsage || 70}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Cloud APIs</span>
                <span className="font-medium">{data.cloudModelUsage || 30}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${data.cloudModelUsage || 30}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Optimization Strategy:</strong> Route 70% of requests to free local models 
              (DeepSeek R1, Llama) with cloud fallback for complex tasks.
            </p>
          </div>
        </motion.div>

        {/* Cost Trends */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Cost Savings Breakdown</h3>
            <BarChart3 className="h-5 w-5 text-gray-600" />
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">DeepSeek R1 (Local)</span>
              <span className="text-sm font-bold text-green-600">$0.00</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Llama 3.1 (Local)</span>
              <span className="text-sm font-bold text-green-600">$0.00</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Claude 3.5 Sonnet</span>
              <span className="text-sm font-bold text-blue-600">$0.003/1K</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Gemini Pro</span>
              <span className="text-sm font-bold text-blue-600">$0.0005/1K</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">GPT-4</span>
              <span className="text-sm font-bold text-orange-600">$0.03/1K</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Projected Savings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Annual Projected Savings</h3>
            <p className="text-3xl font-bold">
              ${data.projectedSavings?.toLocaleString() || '150,000'}
            </p>
            <p className="text-green-100 mt-1">
              Based on current usage patterns and optimization
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{data.totalSavings || 95.2}%</div>
            <div className="text-green-100">Total Savings</div>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold">{data.totalRequests?.toLocaleString() || '125,000'}</div>
            <div className="text-green-100 text-sm">Total Requests</div>
          </div>
          <div>
            <div className="text-lg font-bold">99.2%</div>
            <div className="text-green-100 text-sm">Uptime</div>
          </div>
          <div>
            <div className="text-lg font-bold">150ms</div>
            <div className="text-green-100 text-sm">Avg Response</div>
          </div>
        </div>
      </motion.div>

      {/* Real-time Status */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>Cost optimization active</span>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>Live monitoring</span>
        </div>
      </div>
    </div>
  );
};

export default CostOptimizationPanel;