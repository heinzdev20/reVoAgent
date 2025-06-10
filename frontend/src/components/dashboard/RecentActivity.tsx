import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, Info, XCircle, Filter, Search, Clock, User, Bot, Workflow } from 'lucide-react';
import { useRecentActivity, useDashboardConnection } from '../../stores/dashboardStore';
import type { ActivityItem } from '@/types';
import { cn } from '@/utils/cn';

interface ActivityFilterProps {
  selectedType: string;
  onTypeChange: (type: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

function ActivityFilter({ selectedType, onTypeChange, searchTerm, onSearchChange }: ActivityFilterProps) {
  const filterTypes = [
    { value: 'all', label: 'All', icon: Filter },
    { value: 'agent', label: 'Agents', icon: Bot },
    { value: 'workflow', label: 'Workflows', icon: Workflow },
    { value: 'system', label: 'System', icon: User },
  ];

  return (
    <div className="flex items-center space-x-4 mb-4">
      <div className="flex items-center space-x-2">
        {filterTypes.map((type) => {
          const Icon = type.icon;
          return (
            <button
              key={type.value}
              onClick={() => onTypeChange(type.value)}
              className={cn(
                'flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors',
                selectedType === type.value
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              <Icon className="w-3 h-3 mr-1" />
              {type.label}
            </button>
          );
        })}
      </div>
      
      <div className="flex-1 max-w-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search activity..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
}

interface ActivityItemCardProps {
  activity: ActivityItem;
  isNew?: boolean;
}

function ActivityItemCard({ activity, isNew }: ActivityItemCardProps) {
  const getActivityIcon = (type: ActivityItem['status']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getActivityDot = (type: ActivityItem['status']) => {
    const colorMap = {
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      error: 'bg-red-500',
      info: 'bg-blue-500',
    };
    return colorMap[type] || colorMap.info;
  };

  const getTypeIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'agent':
        return <Bot className="w-3 h-3" />;
      case 'workflow':
        return <Workflow className="w-3 h-3" />;
      case 'system':
        return <User className="w-3 h-3" />;
      default:
        return <Info className="w-3 h-3" />;
    }
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className={cn(
      'flex items-start space-x-3 p-3 rounded-lg border transition-all duration-200',
      isNew ? 'bg-blue-50 border-blue-200 animate-pulse' : 'bg-white border-gray-200 hover:shadow-sm'
    )}>
      <div className="flex-shrink-0 mt-1">
        <div className={cn('w-2 h-2 rounded-full', getActivityDot(activity.status))}></div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <div className="flex items-center text-gray-500">
            {getTypeIcon(activity.type)}
            <span className="text-xs ml-1 capitalize">{activity.type}</span>
          </div>
          {isNew && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              New
            </span>
          )}
        </div>
        <div className="font-medium text-gray-900 mb-1">{activity.title}</div>
        <div className="text-sm text-gray-600">{activity.description}</div>
      </div>
      
      <div className="flex items-center space-x-2 flex-shrink-0">
        {getActivityIcon(activity.status)}
        <div className="flex items-center text-xs text-gray-500">
          <Clock className="w-3 h-3 mr-1" />
          {formatTime(activity.timestamp)}
        </div>
      </div>
    </div>
  );
}

export function RecentActivity() {
  const activities = useRecentActivity();
  const { isConnected, lastUpdate } = useDashboardConnection();
  const [filteredActivities, setFilteredActivities] = useState<ActivityItem[]>([]);
  const [selectedType, setSelectedType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [newActivityIds, setNewActivityIds] = useState<Set<string>>(new Set());

  // Default activities for demo purposes
  const defaultActivities: ActivityItem[] = [
    {
      id: '1',
      title: 'Enhanced Code Generator Completed',
      description: 'FastAPI + Auth + Tests generated with 94% quality score',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      type: 'agent',
      status: 'success',
    },
    {
      id: '2',
      title: 'Workflow Engine Optimization',
      description: '8 agents running in parallel, resource usage optimized',
      timestamp: new Date(Date.now() - 8 * 60 * 1000),
      type: 'workflow',
      status: 'success',
    },
    {
      id: '3',
      title: 'Debug Agent Analysis',
      description: '5 critical issues resolved, performance improved 34%',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      type: 'agent',
      status: 'success',
    },
    {
      id: '4',
      title: 'Browser Agent Testing',
      description: 'E2E testing completed with Playwright, 47 test cases passed',
      timestamp: new Date(Date.now() - 23 * 60 * 1000),
      type: 'agent',
      status: 'success',
    },
    {
      id: '5',
      title: 'Production Deployment',
      description: 'Docker + K8s deployment completed with zero downtime',
      timestamp: new Date(Date.now() - 35 * 60 * 1000),
      type: 'system',
      status: 'success',
    },
  ];

  const displayActivities = activities.length > 0 ? activities : defaultActivities;

  // Filter activities based on type and search term
  useEffect(() => {
    let filtered = displayActivities;

    if (selectedType !== 'all') {
      filtered = filtered.filter(activity => activity.type === selectedType);
    }

    if (searchTerm) {
      filtered = filtered.filter(activity =>
        activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredActivities(filtered);
  }, [displayActivities, selectedType, searchTerm]);

  // Track new activities
  useEffect(() => {
    if (activities.length > 0) {
      const newIds = new Set(activities.slice(0, 3).map(a => a.id));
      setNewActivityIds(newIds);
      
      // Clear new status after 5 seconds
      const timer = setTimeout(() => {
        setNewActivityIds(new Set());
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [activities]);

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <div className="flex items-center space-x-2">
          {isConnected && (
            <div className="flex items-center text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />
              <span className="text-xs">Live</span>
            </div>
          )}
          <span className="text-xs text-gray-500">
            {filteredActivities.length} items
          </span>
        </div>
      </div>

      <ActivityFilter
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredActivities.length > 0 ? (
          filteredActivities.map((activity) => (
            <ActivityItemCard
              key={activity.id}
              activity={activity}
              isNew={newActivityIds.has(activity.id)}
            />
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">📋</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Activity Found</h4>
            <p className="text-sm">
              {searchTerm || selectedType !== 'all'
                ? 'Try adjusting your filters or search term'
                : 'Activity will appear here as agents work'}
            </p>
          </div>
        )}
      </div>

      {filteredActivities.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
              View all activity →
            </button>
            {lastUpdate && (
              <span className="text-xs text-gray-500">
                Last updated {new Date(lastUpdate).toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}