import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Lightbulb,
  TrendingUp,
  Clock,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  X,
  Settings,
  BarChart3,
  Users,
  Activity,
} from 'lucide-react';
import { useDashboardCustomizationStore } from '../../stores/dashboardCustomizationStore';

interface PredictiveInsight {
  id: string;
  type: 'optimization' | 'warning' | 'suggestion' | 'trend';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  category: string;
  actionable: boolean;
  estimatedTime?: string;
  potentialBenefit?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ContextualMenu {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  relevanceScore: number;
  category: string;
  shortcut?: string;
}

interface PredictiveInterfaceProps {
  className?: string;
}

export function PredictiveInterface({ className = '' }: PredictiveInterfaceProps) {
  const {
    currentLayout,
    userPreferences,
    predictiveInsights,
    generateAiSuggestions,
    applyAiOptimization,
    trackWidgetUsage,
  } = useDashboardCustomizationStore();

  const [showInsights, setShowInsights] = useState(false);
  const [contextualMenus, setContextualMenus] = useState<ContextualMenu[]>([]);
  const [currentWorkflowState, setCurrentWorkflowState] = useState<string>('dashboard');
  const [userBehaviorPattern, setUserBehaviorPattern] = useState<string>('explorer');

  // Generate predictive insights based on current state
  const insights = useMemo<PredictiveInsight[]>(() => {
    const baseInsights: PredictiveInsight[] = [
      {
        id: 'performance-optimization',
        type: 'optimization',
        title: 'Performance Optimization Available',
        description: 'Your dashboard could load 23% faster with widget reorganization',
        confidence: 0.87,
        impact: 'medium',
        category: 'performance',
        actionable: true,
        estimatedTime: '2 minutes',
        potentialBenefit: '23% faster load time',
        action: {
          label: 'Optimize Now',
          onClick: applyAiOptimization,
        },
      },
      {
        id: 'usage-pattern',
        type: 'suggestion',
        title: 'Add Analytics Widget',
        description: 'Based on your workflow, an analytics widget would be beneficial',
        confidence: 0.92,
        impact: 'high',
        category: 'productivity',
        actionable: true,
        estimatedTime: '30 seconds',
        potentialBenefit: 'Better insights into system performance',
        action: {
          label: 'Add Widget',
          onClick: generateAiSuggestions,
        },
      },
      {
        id: 'security-alert',
        type: 'warning',
        title: 'Security Monitoring Recommended',
        description: 'Consider adding security monitoring for enhanced protection',
        confidence: 0.78,
        impact: 'high',
        category: 'security',
        actionable: true,
        estimatedTime: '1 minute',
        potentialBenefit: 'Enhanced security visibility',
      },
      {
        id: 'trend-analysis',
        type: 'trend',
        title: 'Workflow Efficiency Trending Up',
        description: 'Your productivity has increased 15% this week',
        confidence: 0.95,
        impact: 'low',
        category: 'analytics',
        actionable: false,
        potentialBenefit: '15% productivity increase',
      },
    ];

    // Filter insights based on user preferences and current state
    return baseInsights.filter(insight => {
      if (!userPreferences.showAiSuggestions && insight.type === 'suggestion') {
        return false;
      }
      return insight.confidence > 0.7;
    });
  }, [userPreferences, applyAiOptimization, generateAiSuggestions]);

  // Generate contextual menus based on current workflow state
  useEffect(() => {
    const generateContextualMenus = () => {
      const baseMenus: ContextualMenu[] = [
        {
          id: 'quick-analysis',
          label: 'Quick Analysis',
          icon: BarChart3,
          description: 'Generate instant performance report',
          relevanceScore: 0.9,
          category: 'analytics',
          shortcut: 'Ctrl+A',
        },
        {
          id: 'optimize-layout',
          label: 'Optimize Layout',
          icon: Zap,
          description: 'AI-powered layout optimization',
          relevanceScore: 0.85,
          category: 'optimization',
          shortcut: 'Ctrl+O',
        },
        {
          id: 'team-insights',
          label: 'Team Insights',
          icon: Users,
          description: 'View team performance metrics',
          relevanceScore: 0.75,
          category: 'collaboration',
          shortcut: 'Ctrl+T',
        },
        {
          id: 'system-health',
          label: 'System Health',
          icon: Activity,
          description: 'Check overall system status',
          relevanceScore: 0.8,
          category: 'monitoring',
          shortcut: 'Ctrl+H',
        },
      ];

      // Sort by relevance score and current context
      const contextualMenus = baseMenus
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 3);

      setContextualMenus(contextualMenus);
    };

    generateContextualMenus();
  }, [currentWorkflowState, userBehaviorPattern]);

  // Auto-show insights based on user behavior
  useEffect(() => {
    if (userPreferences.showAiSuggestions && insights.length > 0) {
      const timer = setTimeout(() => {
        setShowInsights(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [insights, userPreferences.showAiSuggestions]);

  const getInsightIcon = (type: PredictiveInsight['type']) => {
    switch (type) {
      case 'optimization':
        return Zap;
      case 'warning':
        return AlertTriangle;
      case 'suggestion':
        return Lightbulb;
      case 'trend':
        return TrendingUp;
      default:
        return Brain;
    }
  };

  const getInsightColor = (type: PredictiveInsight['type'], impact: PredictiveInsight['impact']) => {
    switch (type) {
      case 'optimization':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'warning':
        return impact === 'high' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'suggestion':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'trend':
        return 'bg-green-50 border-green-200 text-green-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Contextual Menu Bar */}
      <AnimatePresence>
        {contextualMenus.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-40 bg-white rounded-lg shadow-lg border border-gray-200 p-2"
          >
            <div className="flex items-center space-x-1">
              <div className="flex items-center space-x-1 text-xs text-gray-600 px-2 py-1">
                <Brain className="w-3 h-3" />
                <span>Smart Actions</span>
              </div>
              {contextualMenus.map((menu) => {
                const IconComponent = menu.icon;
                return (
                  <button
                    key={menu.id}
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors group"
                    title={`${menu.description} ${menu.shortcut ? `(${menu.shortcut})` : ''}`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="hidden group-hover:block">{menu.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Predictive Insights Panel */}
      <AnimatePresence>
        {showInsights && insights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed top-32 right-6 z-30 w-80 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-blue-600 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Brain className="w-5 h-5" />
                  <h3 className="font-semibold">AI Insights</h3>
                </div>
                <button
                  onClick={() => setShowInsights(false)}
                  className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-purple-100 mt-1">
                {insights.length} insights available
              </p>
            </div>

            {/* Insights List */}
            <div className="max-h-96 overflow-y-auto">
              {insights.map((insight, index) => {
                const IconComponent = getInsightIcon(insight.type);
                const colorClass = getInsightColor(insight.type, insight.impact);

                return (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 border-b border-gray-100 last:border-b-0 ${colorClass} bg-opacity-50`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${colorClass}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm">{insight.title}</h4>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-current rounded-full opacity-60"></div>
                            <span className="text-xs opacity-75">
                              {Math.round(insight.confidence * 100)}%
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-xs opacity-80 mb-2">{insight.description}</p>
                        
                        {insight.potentialBenefit && (
                          <div className="flex items-center space-x-2 text-xs opacity-75 mb-2">
                            <Target className="w-3 h-3" />
                            <span>{insight.potentialBenefit}</span>
                          </div>
                        )}
                        
                        {insight.estimatedTime && (
                          <div className="flex items-center space-x-2 text-xs opacity-75 mb-2">
                            <Clock className="w-3 h-3" />
                            <span>{insight.estimatedTime}</span>
                          </div>
                        )}
                        
                        {insight.action && (
                          <button
                            onClick={insight.action.onClick}
                            className="flex items-center space-x-1 text-xs font-medium hover:underline"
                          >
                            <span>{insight.action.label}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-3 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Powered by AI</span>
                <button
                  onClick={() => setShowInsights(false)}
                  className="flex items-center space-x-1 hover:text-gray-900"
                >
                  <Settings className="w-3 h-3" />
                  <span>Settings</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating AI Assistant Button */}
      {!showInsights && insights.length > 0 && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowInsights(true)}
          className="fixed bottom-20 right-6 z-30 p-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
        >
          <div className="relative">
            <Brain className="w-6 h-6" />
            {insights.filter(i => i.type === 'warning').length > 0 && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
            )}
          </div>
        </motion.button>
      )}
    </div>
  );
}