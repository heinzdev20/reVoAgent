import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Settings,
  Plus,
  Grid,
  Layout,
  Sparkles,
  Eye,
  EyeOff,
  Move,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { useDashboardCustomizationStore, DashboardWidget } from '../../stores/dashboardCustomizationStore';
import { SystemMetrics } from './SystemMetrics';
import { ActiveWorkflows } from './ActiveWorkflows';
import { QuickActions } from './QuickActions';
import { RecentActivity } from './RecentActivity';
import { QuickTools } from './QuickTools';
import { SystemStatus } from './SystemStatus';

interface SortableWidgetProps {
  widget: DashboardWidget;
  isCustomizing: boolean;
  onToggleVisibility: (widgetId: string) => void;
  onRemove: (widgetId: string) => void;
  onConfigure: (widgetId: string) => void;
}

function SortableWidget({
  widget,
  isCustomizing,
  onToggleVisibility,
  onRemove,
  onConfigure,
}: SortableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const renderWidget = () => {
    switch (widget.type) {
      case 'SystemMetrics':
        return <SystemMetrics />;
      case 'ActiveWorkflows':
        return <ActiveWorkflows />;
      case 'QuickActions':
        return <QuickActions />;
      case 'RecentActivity':
        return <RecentActivity />;
      case 'QuickTools':
        return <QuickTools />;
      case 'SystemStatus':
        return <SystemStatus metrics={{}} />;
      default:
        return (
          <div className="p-6 bg-white rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{widget.title}</h3>
            <p className="text-gray-600 mt-2">{widget.description}</p>
          </div>
        );
    }
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: widget.isVisible ? 1 : 0.5, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`relative group ${
        widget.size === 'small' ? 'col-span-1' :
        widget.size === 'medium' ? 'col-span-2' :
        widget.size === 'large' ? 'col-span-3' :
        'col-span-4'
      }`}
    >
      {/* Widget Controls Overlay */}
      <AnimatePresence>
        {isCustomizing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-20 rounded-lg z-10 flex items-center justify-center"
          >
            <div className="flex space-x-2">
              <button
                {...listeners}
                className="p-2 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-colors cursor-grab active:cursor-grabbing"
                title="Drag to reorder"
              >
                <Move className="w-4 h-4 text-gray-600" />
              </button>
              
              <button
                onClick={() => onToggleVisibility(widget.id)}
                className="p-2 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
                title={widget.isVisible ? 'Hide widget' : 'Show widget'}
              >
                {widget.isVisible ? (
                  <EyeOff className="w-4 h-4 text-gray-600" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-600" />
                )}
              </button>
              
              <button
                onClick={() => onConfigure(widget.id)}
                className="p-2 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
                title="Configure widget"
              >
                <Settings className="w-4 h-4 text-gray-600" />
              </button>
              
              <button
                onClick={() => onRemove(widget.id)}
                className="p-2 bg-white rounded-lg shadow-lg hover:bg-red-50 transition-colors"
                title="Remove widget"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Suggestion Badge */}
      {widget.aiSuggested && (
        <div className="absolute -top-2 -right-2 z-20">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
            <Sparkles className="w-3 h-3" />
            <span>AI</span>
          </div>
        </div>
      )}

      {/* Widget Content */}
      <div className={`${!widget.isVisible ? 'opacity-50' : ''}`}>
        {renderWidget()}
      </div>
    </motion.div>
  );
}

interface DragDropDashboardProps {
  className?: string;
}

export function DragDropDashboard({ className = '' }: DragDropDashboardProps) {
  const {
    currentLayout,
    isCustomizing,
    aiSuggestions,
    userPreferences,
    enterCustomizationMode,
    exitCustomizationMode,
    updateWidget,
    removeWidget,
    moveWidget,
    generateAiSuggestions,
    applyAiOptimization,
    trackWidgetUsage,
  } = useDashboardCustomizationStore();

  const [activeWidget, setActiveWidget] = useState<DashboardWidget | null>(null);
  const [showWidgetConfig, setShowWidgetConfig] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const visibleWidgets = useMemo(() => {
    return currentLayout?.widgets.filter(widget => widget.isVisible) || [];
  }, [currentLayout?.widgets]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const widget = currentLayout?.widgets.find(w => w.id === event.active.id);
    setActiveWidget(widget || null);
  }, [currentLayout?.widgets]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (active.id !== over?.id && currentLayout) {
      const oldIndex = currentLayout.widgets.findIndex(w => w.id === active.id);
      const newIndex = currentLayout.widgets.findIndex(w => w.id === over?.id);
      
      // Reorder widgets logic would go here
      // For now, we'll just track the usage
      trackWidgetUsage(active.id as string);
    }
    
    setActiveWidget(null);
  }, [currentLayout, trackWidgetUsage]);

  const handleToggleVisibility = useCallback((widgetId: string) => {
    const widget = currentLayout?.widgets.find(w => w.id === widgetId);
    if (widget) {
      updateWidget(widgetId, { isVisible: !widget.isVisible });
    }
  }, [currentLayout?.widgets, updateWidget]);

  const handleRemoveWidget = useCallback((widgetId: string) => {
    removeWidget(widgetId);
  }, [removeWidget]);

  const handleConfigureWidget = useCallback((widgetId: string) => {
    setShowWidgetConfig(widgetId);
  }, []);

  const handleEnterCustomization = useCallback(() => {
    enterCustomizationMode();
    generateAiSuggestions();
  }, [enterCustomizationMode, generateAiSuggestions]);

  if (!currentLayout) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Layout className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No dashboard layout available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Dashboard Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {currentLayout.name}
          </h1>
          {currentLayout.isAiOptimized && (
            <div className="flex items-center space-x-1 text-purple-600 bg-purple-50 px-2 py-1 rounded-full text-sm">
              <Sparkles className="w-4 h-4" />
              <span>AI Optimized</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* AI Suggestions Count */}
          {aiSuggestions.length > 0 && (
            <div className="flex items-center space-x-1 text-purple-600 bg-purple-50 px-3 py-1 rounded-full text-sm">
              <Sparkles className="w-4 h-4" />
              <span>{aiSuggestions.length} AI suggestions</span>
            </div>
          )}

          {/* Customization Toggle */}
          {!isCustomizing ? (
            <button
              onClick={handleEnterCustomization}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Customize</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={applyAiOptimization}
                className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span>AI Optimize</span>
              </button>
              
              <button
                onClick={exitCustomizationMode}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <span>Done</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* AI Suggestions Panel */}
      <AnimatePresence>
        {isCustomizing && aiSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4"
          >
            <div className="flex items-center space-x-2 mb-3">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-purple-900">AI Suggestions</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {aiSuggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="bg-white border border-purple-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <h4 className="font-medium text-gray-900">{suggestion.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>
                  <button className="mt-2 text-purple-600 text-sm font-medium hover:text-purple-700">
                    Add Widget
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dashboard Grid */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={visibleWidgets.map(w => w.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {visibleWidgets.map((widget) => (
              <SortableWidget
                key={widget.id}
                widget={widget}
                isCustomizing={isCustomizing}
                onToggleVisibility={handleToggleVisibility}
                onRemove={handleRemoveWidget}
                onConfigure={handleConfigureWidget}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeWidget ? (
            <div className="bg-white rounded-lg shadow-xl border-2 border-blue-500 opacity-90">
              <div className="p-4">
                <h3 className="font-semibold text-gray-900">{activeWidget.title}</h3>
                <p className="text-sm text-gray-600">{activeWidget.description}</p>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Add Widget Button */}
      <AnimatePresence>
        {isCustomizing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <button className="flex items-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-5 h-5" />
              <span>Add Widget</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}