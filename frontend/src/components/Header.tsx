import React from 'react';
import { Activity, Settings, User } from 'lucide-react';
import { cn } from '@/utils/cn';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  return (
    <header className={cn(
      "bg-gradient-to-r from-blue-900 to-blue-700 text-white shadow-lg border-b-2 border-blue-600",
      className
    )}>
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🚀</span>
              <h1 className="text-xl font-bold">reVoAgent</h1>
              <span className="text-sm bg-blue-600 px-2 py-1 rounded">v1.0 Production</span>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <select className="bg-blue-800 border border-blue-600 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                  <option>DeepSeek R1 ▼</option>
                  <option>CodeLlama 70B</option>
                  <option>Mistral 7B</option>
                  <option>Custom Model</option>
                </select>
              </div>
              <div className="flex items-center space-x-1">
                <span>OpenHands</span>
                <span className="text-green-400">✓</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="status-indicator status-online"></div>
                <span>Live</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-green-400" />
              <span className="text-sm">System Healthy</span>
            </div>
            <div className="flex items-center space-x-2">
              <Settings className="w-4 h-4 text-gray-300 hover:text-white cursor-pointer transition-colors" />
              <div className="flex items-center space-x-2 cursor-pointer hover:bg-blue-800 px-2 py-1 rounded transition-colors">
                <User className="w-4 h-4" />
                <span className="text-sm">Admin</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}