import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Grid,
  Plus,
  Sparkles,
  LayoutDashboard,
  Save,
  Download,
  Upload,
  Share2,
  Eye,
  EyeOff,
  Wifi,
  WifiOff,
  Bell,
  BellOff,
} from 'lucide-react';
import { DragDropDashboard } from './dashboard/DragDropDashboard';
import { WidgetMarketplace } from './dashboard/WidgetMarketplace';
import { PredictiveInterface } from './dashboard/PredictiveInterface';
import { useDashboardCustomizationStore } from '../stores/dashboardCustomizationStore';
import { useDashboardStore, useDashboardConnection } from '../stores/dashboardStore';
import { useAgentStore } from '../stores/agentStore';

export function EnhancedDashboard() {
  const {
    currentLayout,
    availableLayouts,
    userPreferences,
    isCustomizing,
    aiSuggestions,
    createLayout,
    setCurrentLayout,
    updatePreferences,
    enterCustomizationMode,
    exitCustomizationMode,
    generateAiSuggestions,
    applyAiOptimization,
  } = useDashboardCustomizationStore();

  const { startAutoRefresh, stopAutoRefresh } = useDashboardStore();
  const { fetchAllAgents } = useAgentStore();
  const { isLoading, error, isConnected } = useDashboardConnection();

  const [showMarketplace, setShowMarketplace] = useState(false);
  const [showLayoutManager, setShowLayoutManager] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [newLayoutName, setNewLayoutName] = useState('');

  // Initialize dashboard
  useEffect(() => {
    startAutoRefresh();
    fetchAllAgents();
    
    // Generate initial AI suggestions if enabled
    if (userPreferences.showAiSuggestions) {
      generateAiSuggestions();
    }

    return () => {
      stopAutoRefresh();
    };
  }, [startAutoRefresh, stopAutoRefresh, fetchAllAgents, generateAiSuggestions, userPreferences.showAiSuggestions]);

  const handleCreateLayout = () => {
    if (newLayoutName.trim()) {
      createLayout(newLayoutName.trim(), `Custom layout: ${newLayoutName}`);
      setNewLayoutName('');
      setShowLayoutManager(false);
    }
  };

  const handleExportLayout = () => {
    if (currentLayout) {
      const dataStr = JSON.stringify(currentLayout, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `${currentLayout.name.replace(/\s+/g, '_')}_layout.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
  };

  const handleToggleNotifications = () => {
    updatePreferences({
      notifications: {
        ...userPreferences.notifications,
        performance: !userPreferences.notifications.performance,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center glass-card">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-white/90">Loading enhanced dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="glass-card text-center border-red-500/30">
          <WifiOff className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-white font-medium text-lg mb-2">Connection Error</h3>
          <p className="text-white/80 mb-4">{error}</p>
          <button 
            onClick={() => startAutoRefresh()}
            className="glass-button bg-red-500/20 border-red-500/30 hover:bg-red-500/30"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Enhanced Header */}
      <div className="glass-header sticky top-0 z-20">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                  <LayoutDashboard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {currentLayout?.name || 'reVoAgent Dashboard'}
                  </h1>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>Enhanced with AI</span>
                    {currentLayout?.isAiOptimized && (
                      <div className="flex items-center space-x-1 text-purple-600">
                        <Sparkles className="w-3 h-3" />
                        <span>Optimized</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Center Section - Layout Selector */}
            <div className="hidden md:flex items-center space-x-2">
              <select
                value={currentLayout?.id || ''}
                onChange={(e) => {
                  const layout = availableLayouts.find(l => l.id === e.target.value);
                  if (layout) setCurrentLayout(layout);
                }}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {currentLayout && (
                  <option value={currentLayout.id}>{currentLayout.name}</option>
                )}
                {availableLayouts.map((layout) => (
                  <option key={layout.id} value={layout.id}>
                    {layout.name}
                  </option>
                ))}
              </select>
              
              <button
                onClick={() => setShowLayoutManager(true)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Manage layouts"
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-2">
              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                {isConnected ? (
                  <div className="flex items-center text-green-600">
                    <Wifi className="w-4 h-4 mr-1" />
                    <span className="text-sm font-medium hidden sm:block">Live</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <WifiOff className="w-4 h-4 mr-1" />
                    <span className="text-sm font-medium hidden sm:block">Offline</span>
                  </div>
                )}
              </div>

              {/* AI Suggestions Indicator */}
              {aiSuggestions.length > 0 && (
                <div className="flex items-center space-x-1 text-purple-600 bg-purple-50 px-2 py-1 rounded-full text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden sm:block">{aiSuggestions.length}</span>
                </div>
              )}

              {/* Notifications Toggle */}
              <button
                onClick={handleToggleNotifications}
                className={`p-2 rounded-lg transition-colors ${
                  userPreferences.notifications.performance
                    ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="Toggle notifications"
              >
                {userPreferences.notifications.performance ? (
                  <Bell className="w-4 h-4" />
                ) : (
                  <BellOff className="w-4 h-4" />
                )}
              </button>

              {/* Widget Marketplace */}
              <button
                onClick={() => setShowMarketplace(true)}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Widget Marketplace"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:block">Widgets</span>
              </button>

              {/* Export Layout */}
              <button
                onClick={handleExportLayout}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Export layout"
              >
                <Download className="w-4 h-4" />
              </button>

              {/* Preferences */}
              <button
                onClick={() => setShowPreferences(true)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Preferences"
              >
                <Settings className="w-4 h-4" />
              </button>

              {/* Customization Toggle */}
              {!isCustomizing ? (
                <button
                  onClick={enterCustomizationMode}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:block">Customize</span>
                </button>
              ) : (
                <button
                  onClick={exitCustomizationMode}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <span>Done</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="p-6">
        <DragDropDashboard />
      </div>

      {/* Predictive Interface */}
      <PredictiveInterface />

      {/* Widget Marketplace Modal */}
      <WidgetMarketplace
        isOpen={showMarketplace}
        onClose={() => setShowMarketplace(false)}
      />

      {/* Layout Manager Modal */}
      <AnimatePresence>
        {showLayoutManager && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowLayoutManager(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Layout Manager</h3>
                
                <div className="space-y-4">
                  {/* Create New Layout */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Create New Layout
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newLayoutName}
                        onChange={(e) => setNewLayoutName(e.target.value)}
                        placeholder="Layout name..."
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onKeyPress={(e) => e.key === 'Enter' && handleCreateLayout()}
                      />
                      <button
                        onClick={handleCreateLayout}
                        disabled={!newLayoutName.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Create
                      </button>
                    </div>
                  </div>

                  {/* Available Layouts */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Available Layouts
                    </label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {[currentLayout, ...availableLayouts].filter(Boolean).map((layout) => (
                        <div
                          key={layout!.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            currentLayout?.id === layout!.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                          onClick={() => setCurrentLayout(layout!)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">{layout!.name}</h4>
                              <p className="text-sm text-gray-600">{layout!.description}</p>
                            </div>
                            {layout!.isAiOptimized && (
                              <Sparkles className="w-4 h-4 text-purple-500" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    onClick={() => setShowLayoutManager(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preferences Modal */}
      <AnimatePresence>
        {showPreferences && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowPreferences(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Dashboard Preferences</h3>
                
                <div className="space-y-4">
                  {/* AI Features */}
                  <div>
                    <label className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">AI Suggestions</span>
                      <input
                        type="checkbox"
                        checked={userPreferences.showAiSuggestions}
                        onChange={(e) => updatePreferences({ showAiSuggestions: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Auto Optimize</span>
                      <input
                        type="checkbox"
                        checked={userPreferences.autoOptimize}
                        onChange={(e) => updatePreferences({ autoOptimize: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </label>
                  </div>

                  {/* Theme */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                    <select
                      value={userPreferences.theme}
                      onChange={(e) => updatePreferences({ theme: e.target.value as any })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="auto">Auto</option>
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>
                  </div>

                  {/* Refresh Interval */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Refresh Interval (seconds)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="300"
                      value={userPreferences.refreshInterval / 1000}
                      onChange={(e) => updatePreferences({ refreshInterval: parseInt(e.target.value) * 1000 })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    onClick={() => setShowPreferences(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}