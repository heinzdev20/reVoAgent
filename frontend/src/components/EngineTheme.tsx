/**
 * Engine Theme System - Color-coded UI components for Three-Engine Architecture
 * 🔵 Perfect Recall Engine - Blue theme
 * 🟣 Parallel Mind Engine - Purple theme  
 * 🩷 Creative Engine - Pink theme
 */

import React from 'react';

export enum EngineType {
  PERFECT_RECALL = 'perfect_recall',
  PARALLEL_MIND = 'parallel_mind',
  CREATIVE_ENGINE = 'creative_engine'
}

export interface EngineTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  border: string;
  icon: string;
}

export const ENGINE_THEMES: Record<EngineType, EngineTheme> = {
  [EngineType.PERFECT_RECALL]: {
    primary: 'bg-blue-600',
    secondary: 'bg-blue-100',
    accent: 'bg-blue-500',
    background: 'bg-blue-50',
    text: 'text-blue-900',
    border: 'border-blue-300',
    icon: '🔵'
  },
  [EngineType.PARALLEL_MIND]: {
    primary: 'bg-purple-600',
    secondary: 'bg-purple-100',
    accent: 'bg-purple-500',
    background: 'bg-purple-50',
    text: 'text-purple-900',
    border: 'border-purple-300',
    icon: '🟣'
  },
  [EngineType.CREATIVE_ENGINE]: {
    primary: 'bg-pink-600',
    secondary: 'bg-pink-100',
    accent: 'bg-pink-500',
    background: 'bg-pink-50',
    text: 'text-pink-900',
    border: 'border-pink-300',
    icon: '🩷'
  }
};

export interface EngineCardProps {
  engineType: EngineType;
  title: string;
  status: 'healthy' | 'warning' | 'error';
  metrics: Record<string, any>;
  children?: React.ReactNode;
  className?: string;
}

export const EngineCard: React.FC<EngineCardProps> = ({
  engineType,
  title,
  status,
  metrics,
  children,
  className = ''
}) => {
  const theme = ENGINE_THEMES[engineType];
  
  const statusColors = {
    healthy: 'bg-green-100 text-green-800 border-green-300',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    error: 'bg-red-100 text-red-800 border-red-300'
  };

  return (
    <div className={`
      ${theme.background} ${theme.border} ${theme.text}
      border-2 rounded-lg p-6 shadow-lg transition-all duration-300
      hover:shadow-xl hover:scale-105
      ${className}
    `}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{theme.icon}</span>
          <h3 className={`text-xl font-bold ${theme.text}`}>{title}</h3>
        </div>
        <div className={`
          px-3 py-1 rounded-full text-sm font-medium border
          ${statusColors[status]}
        `}>
          {status.toUpperCase()}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {Object.entries(metrics).map(([key, value]) => (
          <div key={key} className={`${theme.secondary} rounded p-3`}>
            <div className="text-sm opacity-75 capitalize">
              {key.replace('_', ' ')}
            </div>
            <div className="text-lg font-semibold">
              {typeof value === 'number' ? value.toFixed(2) : value}
            </div>
          </div>
        ))}
      </div>

      {/* Custom Content */}
      {children}
    </div>
  );
};

export interface EngineStatusProps {
  engineType: EngineType;
  isActive: boolean;
  performance: number;
  lastActivity: Date;
}

export const EngineStatus: React.FC<EngineStatusProps> = ({
  engineType,
  isActive,
  performance,
  lastActivity
}) => {
  const theme = ENGINE_THEMES[engineType];
  
  return (
    <div className={`
      flex items-center space-x-3 p-3 rounded-lg
      ${theme.secondary} ${theme.border} border
    `}>
      <div className={`
        w-3 h-3 rounded-full
        ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}
      `} />
      
      <div className="flex-1">
        <div className={`font-medium ${theme.text}`}>
          {theme.icon} {engineType.replace('_', ' ').toUpperCase()}
        </div>
        <div className="text-sm opacity-75">
          Performance: {(performance * 100).toFixed(1)}%
        </div>
      </div>
      
      <div className="text-right text-sm opacity-75">
        <div>Last Active</div>
        <div>{lastActivity.toLocaleTimeString()}</div>
      </div>
    </div>
  );
};

export interface EngineMetricsProps {
  engineType: EngineType;
  metrics: {
    responseTime: number;
    throughput: number;
    accuracy: number;
    utilization: number;
  };
}

export const EngineMetrics: React.FC<EngineMetricsProps> = ({
  engineType,
  metrics
}) => {
  const theme = ENGINE_THEMES[engineType];
  
  const MetricBar: React.FC<{ label: string; value: number; max?: number }> = ({
    label,
    value,
    max = 100
  }) => {
    const percentage = Math.min((value / max) * 100, 100);
    
    return (
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span>{label}</span>
          <span>{value.toFixed(1)}{max === 100 ? '%' : 'ms'}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${theme.accent}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className={`${theme.background} rounded-lg p-4`}>
      <h4 className={`font-semibold mb-4 ${theme.text}`}>
        {theme.icon} Performance Metrics
      </h4>
      
      <MetricBar 
        label="Response Time" 
        value={metrics.responseTime} 
        max={1000} 
      />
      <MetricBar 
        label="Throughput" 
        value={metrics.throughput} 
      />
      <MetricBar 
        label="Accuracy" 
        value={metrics.accuracy} 
      />
      <MetricBar 
        label="Utilization" 
        value={metrics.utilization} 
      />
    </div>
  );
};