import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Star,
  Download,
  Crown,
  Plus,
  X,
  Grid,
  List,
  Sparkles,
  TrendingUp,
  Shield,
  Zap,
  BarChart3,
  Settings,
} from 'lucide-react';
import { useDashboardCustomizationStore } from '../../stores/dashboardCustomizationStore';

interface WidgetMarketplaceProps {
  isOpen: boolean;
  onClose: () => void;
}

const categoryIcons = {
  metrics: BarChart3,
  workflows: Zap,
  tools: Settings,
  analytics: TrendingUp,
  security: Shield,
};

const categoryColors = {
  metrics: 'bg-blue-100 text-blue-700 border-blue-200',
  workflows: 'bg-green-100 text-green-700 border-green-200',
  tools: 'bg-purple-100 text-purple-700 border-purple-200',
  analytics: 'bg-orange-100 text-orange-700 border-orange-200',
  security: 'bg-red-100 text-red-700 border-red-200',
};

export function WidgetMarketplace({ isOpen, onClose }: WidgetMarketplaceProps) {
  const { marketplace, installWidget } = useDashboardCustomizationStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'rating' | 'downloads' | 'name'>('rating');

  const filteredWidgets = useMemo(() => {
    let filtered = marketplace.widgets;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (widget) =>
          widget.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          widget.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          widget.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((widget) => widget.category === selectedCategory);
    }

    // Sort widgets
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'downloads':
          return b.downloads - a.downloads;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [marketplace.widgets, searchQuery, selectedCategory, sortBy]);

  const handleInstallWidget = (widgetId: string) => {
    installWidget(widgetId);
    // Show success notification (could be implemented with a toast system)
    console.log(`Widget ${widgetId} installed successfully`);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[80vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Grid className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Widget Marketplace</h2>
                <p className="text-gray-600">Discover and install new dashboard widgets</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Search and Filters */}
          <div className="p-6 border-b border-gray-200 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search widgets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filters and Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Category Filter */}
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-600" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    {marketplace.categories.map((category) => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort By */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="rating">Sort by Rating</option>
                  <option value="downloads">Sort by Downloads</option>
                  <option value="name">Sort by Name</option>
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white shadow-sm text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white shadow-sm text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Widget Grid/List */}
          <div className="flex-1 overflow-y-auto p-6">
            {filteredWidgets.length === 0 ? (
              <div className="text-center py-12">
                <Grid className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No widgets found</h3>
                <p className="text-gray-600">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-4'
                }
              >
                {filteredWidgets.map((widget) => {
                  const CategoryIcon = categoryIcons[widget.category as keyof typeof categoryIcons];
                  const categoryColor = categoryColors[widget.category as keyof typeof categoryColors];

                  return (
                    <motion.div
                      key={widget.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-all duration-200 ${
                        viewMode === 'grid' ? 'p-6' : 'p-4 flex items-center space-x-4'
                      }`}
                    >
                      {viewMode === 'grid' ? (
                        <>
                          {/* Grid View */}
                          <div className="flex items-start justify-between mb-4">
                            <div className={`p-2 rounded-lg border ${categoryColor}`}>
                              <CategoryIcon className="w-5 h-5" />
                            </div>
                            {widget.isPremium && (
                              <div className="flex items-center space-x-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full text-xs">
                                <Crown className="w-3 h-3" />
                                <span>Premium</span>
                              </div>
                            )}
                          </div>

                          <div className="mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {widget.name}
                            </h3>
                            <p className="text-gray-600 text-sm line-clamp-2">
                              {widget.description}
                            </p>
                          </div>

                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                <span>{widget.rating}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Download className="w-4 h-4" />
                                <span>{widget.downloads.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1 mb-4">
                            {widget.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>

                          <button
                            onClick={() => handleInstallWidget(widget.id)}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Install</span>
                          </button>
                        </>
                      ) : (
                        <>
                          {/* List View */}
                          <div className={`p-3 rounded-lg border ${categoryColor}`}>
                            <CategoryIcon className="w-6 h-6" />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {widget.name}
                              </h3>
                              {widget.isPremium && (
                                <div className="flex items-center space-x-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full text-xs">
                                  <Crown className="w-3 h-3" />
                                  <span>Premium</span>
                                </div>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm mb-2">{widget.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                <span>{widget.rating}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Download className="w-4 h-4" />
                                <span>{widget.downloads.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleInstallWidget(widget.id)}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Install</span>
                          </button>
                        </>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {filteredWidgets.length} of {marketplace.widgets.length} widgets
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span>AI-powered recommendations coming soon</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}