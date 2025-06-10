import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';

export interface DashboardWidget {
  id: string;
  type: string;
  title: string;
  description: string;
  category: 'metrics' | 'workflows' | 'tools' | 'analytics' | 'security';
  size: 'small' | 'medium' | 'large' | 'xl';
  position: { x: number; y: number; w: number; h: number };
  isVisible: boolean;
  config: Record<string, any>;
  lastUsed?: Date;
  usageCount: number;
  aiSuggested?: boolean;
}

export interface DashboardLayout {
  id: string;
  name: string;
  description: string;
  widgets: DashboardWidget[];
  isDefault: boolean;
  isAiOptimized: boolean;
  createdAt: Date;
  lastModified: Date;
  usageStats: {
    totalViews: number;
    avgSessionTime: number;
    clickThroughRate: number;
  };
}

export interface UserPreferences {
  preferredLayout: string;
  autoOptimize: boolean;
  showAiSuggestions: boolean;
  compactMode: boolean;
  theme: 'light' | 'dark' | 'auto';
  refreshInterval: number;
  notifications: {
    performance: boolean;
    security: boolean;
    workflows: boolean;
  };
}

export interface WidgetMarketplace {
  categories: string[];
  widgets: {
    id: string;
    name: string;
    description: string;
    category: string;
    rating: number;
    downloads: number;
    isPremium: boolean;
    previewImage?: string;
    tags: string[];
  }[];
}

interface DashboardCustomizationState {
  // Current state
  currentLayout: DashboardLayout | null;
  availableLayouts: DashboardLayout[];
  userPreferences: UserPreferences;
  marketplace: WidgetMarketplace;
  
  // AI-powered features
  aiSuggestions: DashboardWidget[];
  predictiveInsights: {
    suggestedWidgets: string[];
    optimizationTips: string[];
    usagePatterns: Record<string, number>;
  };
  
  // Customization state
  isCustomizing: boolean;
  draggedWidget: DashboardWidget | null;
  previewLayout: DashboardLayout | null;
  
  // Actions
  setCurrentLayout: (layout: DashboardLayout) => void;
  createLayout: (name: string, description: string) => void;
  updateLayout: (layoutId: string, updates: Partial<DashboardLayout>) => void;
  deleteLayout: (layoutId: string) => void;
  
  // Widget management
  addWidget: (widget: Omit<DashboardWidget, 'id' | 'usageCount'>) => void;
  removeWidget: (widgetId: string) => void;
  updateWidget: (widgetId: string, updates: Partial<DashboardWidget>) => void;
  moveWidget: (widgetId: string, position: { x: number; y: number; w: number; h: number }) => void;
  
  // AI features
  generateAiSuggestions: () => void;
  applyAiOptimization: () => void;
  trackWidgetUsage: (widgetId: string) => void;
  
  // Preferences
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  
  // Customization mode
  enterCustomizationMode: () => void;
  exitCustomizationMode: () => void;
  setDraggedWidget: (widget: DashboardWidget | null) => void;
  setPreviewLayout: (layout: DashboardLayout | null) => void;
  
  // Marketplace
  installWidget: (widgetId: string) => void;
  uninstallWidget: (widgetId: string) => void;
  searchMarketplace: (query: string, category?: string) => void;
}

// Default widgets configuration
const defaultWidgets: DashboardWidget[] = [
  {
    id: 'system-metrics',
    type: 'SystemMetrics',
    title: 'System Metrics',
    description: 'Real-time system performance monitoring',
    category: 'metrics',
    size: 'large',
    position: { x: 0, y: 0, w: 6, h: 4 },
    isVisible: true,
    config: { refreshInterval: 5000, showDetails: true },
    usageCount: 0,
  },
  {
    id: 'active-workflows',
    type: 'ActiveWorkflows',
    title: 'Active Workflows',
    description: 'Monitor running workflows and tasks',
    category: 'workflows',
    size: 'medium',
    position: { x: 6, y: 0, w: 6, h: 4 },
    isVisible: true,
    config: { maxItems: 10, autoRefresh: true },
    usageCount: 0,
  },
  {
    id: 'quick-actions',
    type: 'QuickActions',
    title: 'Quick Actions',
    description: 'One-click operations and shortcuts',
    category: 'tools',
    size: 'medium',
    position: { x: 0, y: 4, w: 4, h: 3 },
    isVisible: true,
    config: { showLabels: true, compactMode: false },
    usageCount: 0,
  },
  {
    id: 'recent-activity',
    type: 'RecentActivity',
    title: 'Recent Activity',
    description: 'Latest system activities and events',
    category: 'analytics',
    size: 'large',
    position: { x: 4, y: 4, w: 8, h: 3 },
    isVisible: true,
    config: { maxItems: 20, showTimestamps: true },
    usageCount: 0,
  },
];

// Default marketplace data
const defaultMarketplace: WidgetMarketplace = {
  categories: ['metrics', 'workflows', 'tools', 'analytics', 'security'],
  widgets: [
    {
      id: 'advanced-analytics',
      name: 'Advanced Analytics',
      description: 'Deep insights with predictive analytics',
      category: 'analytics',
      rating: 4.8,
      downloads: 1250,
      isPremium: true,
      tags: ['analytics', 'ai', 'predictions'],
    },
    {
      id: 'security-monitor',
      name: 'Security Monitor',
      description: 'Real-time security threat detection',
      category: 'security',
      rating: 4.9,
      downloads: 890,
      isPremium: false,
      tags: ['security', 'monitoring', 'alerts'],
    },
    {
      id: 'performance-optimizer',
      name: 'Performance Optimizer',
      description: 'AI-powered performance optimization suggestions',
      category: 'metrics',
      rating: 4.7,
      downloads: 2100,
      isPremium: true,
      tags: ['performance', 'optimization', 'ai'],
    },
  ],
};

export const useDashboardCustomizationStore = create<DashboardCustomizationState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentLayout: {
        id: 'default',
        name: 'Default Layout',
        description: 'Standard dashboard layout',
        widgets: defaultWidgets,
        isDefault: true,
        isAiOptimized: false,
        createdAt: new Date(),
        lastModified: new Date(),
        usageStats: {
          totalViews: 0,
          avgSessionTime: 0,
          clickThroughRate: 0,
        },
      },
      availableLayouts: [],
      userPreferences: {
        preferredLayout: 'default',
        autoOptimize: true,
        showAiSuggestions: true,
        compactMode: false,
        theme: 'auto',
        refreshInterval: 30000,
        notifications: {
          performance: true,
          security: true,
          workflows: true,
        },
      },
      marketplace: defaultMarketplace,
      aiSuggestions: [],
      predictiveInsights: {
        suggestedWidgets: [],
        optimizationTips: [],
        usagePatterns: {},
      },
      isCustomizing: false,
      draggedWidget: null,
      previewLayout: null,

      // Layout management
      setCurrentLayout: (layout) => {
        set({ currentLayout: layout });
      },

      createLayout: (name, description) => {
        const newLayout: DashboardLayout = {
          id: `layout-${Date.now()}`,
          name,
          description,
          widgets: [...defaultWidgets],
          isDefault: false,
          isAiOptimized: false,
          createdAt: new Date(),
          lastModified: new Date(),
          usageStats: {
            totalViews: 0,
            avgSessionTime: 0,
            clickThroughRate: 0,
          },
        };

        set((state) => ({
          availableLayouts: [...state.availableLayouts, newLayout],
          currentLayout: newLayout,
        }));
      },

      updateLayout: (layoutId, updates) => {
        set((state) => ({
          availableLayouts: state.availableLayouts.map((layout) =>
            layout.id === layoutId
              ? { ...layout, ...updates, lastModified: new Date() }
              : layout
          ),
          currentLayout:
            state.currentLayout?.id === layoutId
              ? { ...state.currentLayout, ...updates, lastModified: new Date() }
              : state.currentLayout,
        }));
      },

      deleteLayout: (layoutId) => {
        set((state) => ({
          availableLayouts: state.availableLayouts.filter(
            (layout) => layout.id !== layoutId
          ),
          currentLayout:
            state.currentLayout?.id === layoutId
              ? state.availableLayouts.find((l) => l.isDefault) || null
              : state.currentLayout,
        }));
      },

      // Widget management
      addWidget: (widget) => {
        const newWidget: DashboardWidget = {
          ...widget,
          id: `widget-${Date.now()}`,
          usageCount: 0,
        };

        set((state) => {
          if (!state.currentLayout) return state;

          const updatedLayout = {
            ...state.currentLayout,
            widgets: [...state.currentLayout.widgets, newWidget],
            lastModified: new Date(),
          };

          return {
            currentLayout: updatedLayout,
            availableLayouts: state.availableLayouts.map((layout) =>
              layout.id === updatedLayout.id ? updatedLayout : layout
            ),
          };
        });
      },

      removeWidget: (widgetId) => {
        set((state) => {
          if (!state.currentLayout) return state;

          const updatedLayout = {
            ...state.currentLayout,
            widgets: state.currentLayout.widgets.filter(
              (widget) => widget.id !== widgetId
            ),
            lastModified: new Date(),
          };

          return {
            currentLayout: updatedLayout,
            availableLayouts: state.availableLayouts.map((layout) =>
              layout.id === updatedLayout.id ? updatedLayout : layout
            ),
          };
        });
      },

      updateWidget: (widgetId, updates) => {
        set((state) => {
          if (!state.currentLayout) return state;

          const updatedLayout = {
            ...state.currentLayout,
            widgets: state.currentLayout.widgets.map((widget) =>
              widget.id === widgetId ? { ...widget, ...updates } : widget
            ),
            lastModified: new Date(),
          };

          return {
            currentLayout: updatedLayout,
            availableLayouts: state.availableLayouts.map((layout) =>
              layout.id === updatedLayout.id ? updatedLayout : layout
            ),
          };
        });
      },

      moveWidget: (widgetId, position) => {
        get().updateWidget(widgetId, { position });
      },

      // AI features
      generateAiSuggestions: () => {
        const state = get();
        const usagePatterns = state.predictiveInsights.usagePatterns;
        
        // Simulate AI-generated suggestions based on usage patterns
        const suggestions: DashboardWidget[] = [
          {
            id: 'ai-suggested-performance',
            type: 'PerformanceInsights',
            title: 'Performance Insights',
            description: 'AI-powered performance analysis',
            category: 'analytics',
            size: 'medium',
            position: { x: 0, y: 7, w: 6, h: 3 },
            isVisible: true,
            config: { aiPowered: true },
            usageCount: 0,
            aiSuggested: true,
          },
        ];

        set({ aiSuggestions: suggestions });
      },

      applyAiOptimization: () => {
        const state = get();
        if (!state.currentLayout) return;

        // Simulate AI optimization of widget positions based on usage
        const optimizedWidgets = state.currentLayout.widgets.map((widget, index) => ({
          ...widget,
          position: {
            ...widget.position,
            // Optimize based on usage patterns (mock implementation)
            y: widget.usageCount > 10 ? 0 : widget.position.y,
          },
        }));

        const optimizedLayout = {
          ...state.currentLayout,
          widgets: optimizedWidgets,
          isAiOptimized: true,
          lastModified: new Date(),
        };

        set({ currentLayout: optimizedLayout });
      },

      trackWidgetUsage: (widgetId) => {
        get().updateWidget(widgetId, {
          usageCount: (get().currentLayout?.widgets.find(w => w.id === widgetId)?.usageCount || 0) + 1,
          lastUsed: new Date(),
        });
      },

      // Preferences
      updatePreferences: (preferences) => {
        set((state) => ({
          userPreferences: { ...state.userPreferences, ...preferences },
        }));
      },

      // Customization mode
      enterCustomizationMode: () => {
        set({ isCustomizing: true });
      },

      exitCustomizationMode: () => {
        set({ isCustomizing: false, draggedWidget: null, previewLayout: null });
      },

      setDraggedWidget: (widget) => {
        set({ draggedWidget: widget });
      },

      setPreviewLayout: (layout) => {
        set({ previewLayout: layout });
      },

      // Marketplace
      installWidget: (widgetId) => {
        const state = get();
        const marketplaceWidget = state.marketplace.widgets.find(w => w.id === widgetId);
        
        if (marketplaceWidget) {
          const newWidget: Omit<DashboardWidget, 'id' | 'usageCount'> = {
            type: marketplaceWidget.name.replace(/\s+/g, ''),
            title: marketplaceWidget.name,
            description: marketplaceWidget.description,
            category: marketplaceWidget.category as any,
            size: 'medium',
            position: { x: 0, y: 10, w: 6, h: 3 },
            isVisible: true,
            config: {},
          };
          
          get().addWidget(newWidget);
        }
      },

      uninstallWidget: (widgetId) => {
        get().removeWidget(widgetId);
      },

      searchMarketplace: (query, category) => {
        // Implementation for marketplace search
        console.log('Searching marketplace:', query, category);
      },
    }),
    {
      name: 'dashboard-customization-store',
      partialize: (state) => ({
        currentLayout: state.currentLayout,
        availableLayouts: state.availableLayouts,
        userPreferences: state.userPreferences,
      }),
    }
  )
);