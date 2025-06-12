import React, { useState, useEffect } from 'react';
import { 
  Activity, Brain, Zap, MessageSquare, Settings, 
  Users, Database, Shield, BarChart3, GitBranch,
  Cpu, HardDrive, Network, TrendingUp, Bell
} from 'lucide-react';

const SimpleReVoDashboard = () => {
  const [systemMetrics, setSystemMetrics] = useState({
    cpu: 67.8,
    memory: 89.2,
    disk: 34.1,
    network: 56.3,
    activeRequests: 47,
    queueLength: 12,
    responseTime: 0.002,
    uptime: 99.9
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-md border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold">🚀 reVoAgent Dashboard</h1>
            <span className="text-sm bg-green-500/20 text-green-400 px-3 py-1 rounded-full">
              v1.0 Production
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400">System Online</span>
            </div>
            <div className="text-gray-300">
              <Users className="w-5 h-5 inline mr-2" />
              Admin
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* System Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">CPU Usage</h3>
                <p className="text-3xl font-bold text-blue-400">{systemMetrics.cpu}%</p>
              </div>
              <Cpu className="w-8 h-8 text-blue-400" />
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${systemMetrics.cpu}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Memory</h3>
                <p className="text-3xl font-bold text-green-400">{systemMetrics.memory}%</p>
              </div>
              <HardDrive className="w-8 h-8 text-green-400" />
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${systemMetrics.memory}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Active Requests</h3>
                <p className="text-3xl font-bold text-purple-400">{systemMetrics.activeRequests}</p>
              </div>
              <Activity className="w-8 h-8 text-purple-400" />
            </div>
            <div className="text-sm text-gray-300">
              Queue: {systemMetrics.queueLength} | Response: {systemMetrics.responseTime}s
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Uptime</h3>
                <p className="text-3xl font-bold text-yellow-400">{systemMetrics.uptime}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-yellow-400" />
            </div>
            <div className="text-sm text-green-400">
              System running smoothly
            </div>
          </div>
        </div>

        {/* AI Engines Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="w-8 h-8 text-blue-400" />
              <h3 className="text-xl font-bold text-white">Memory Engine</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-blue-200">Status:</span>
                <span className="text-green-400 font-semibold">●●● Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200">Entities:</span>
                <span className="text-white font-mono">1,247,893</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200">Speed:</span>
                <span className="text-white">&lt;95ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200">Cost:</span>
                <span className="text-green-400 font-bold">$0.00/query</span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-8 h-8 text-yellow-400" />
              <h3 className="text-xl font-bold text-white">Parallel Engine</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-blue-200">Status:</span>
                <span className="text-green-400 font-semibold">●●● Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200">Workers:</span>
                <span className="text-white">8 Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200">Load:</span>
                <span className="text-white">45.2%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200">Cost:</span>
                <span className="text-green-400 font-bold">$0.00/query</span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="w-8 h-8 text-green-400" />
              <h3 className="text-xl font-bold text-white">Creative Engine</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-blue-200">Status:</span>
                <span className="text-green-400 font-semibold">●●● Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200">Patterns:</span>
                <span className="text-white">15 Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200">Novelty:</span>
                <span className="text-white">94% Score</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200">Cost:</span>
                <span className="text-green-400 font-bold">$0.00/query</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2">
              <Brain className="w-5 h-5" />
              <span>Start Agent</span>
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2">
              <MessageSquare className="w-5 h-5" />
              <span>Open Chat</span>
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Analytics</span>
            </button>
            <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>
            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Security</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleReVoDashboard;