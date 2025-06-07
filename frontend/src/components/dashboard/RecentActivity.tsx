import React from 'react';
import { CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';
import type { ActivityItem } from '@/types';
import { cn } from '@/utils/cn';

interface RecentActivityProps {
  activities: ActivityItem[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const defaultActivities: ActivityItem[] = [
    {
      id: '1',
      title: 'Enhanced Code Gen: FastAPI+Auth+Tests ✓',
      description: 'OpenHands Integration • Quality Score: 94%',
      time: '2 min ago',
      type: 'success',
    },
    {
      id: '2',
      title: 'Workflow Engine: 8 agents parallel execution ✓',
      description: 'Microservices architecture • Resource optimized',
      time: '8 min ago',
      type: 'success',
    },
    {
      id: '3',
      title: 'Debug Agent: 5 critical issues resolved ✓',
      description: 'Memory leaks fixed • Performance improved 34%',
      time: '15 min ago',
      type: 'success',
    },
    {
      id: '4',
      title: 'Browser Agent: E2E testing completed ✓',
      description: 'Playwright + AI • 47 test cases passed',
      time: '23 min ago',
      type: 'success',
    },
    {
      id: '5',
      title: 'Deploy Agent: Production deployment ✓',
      description: 'Docker + K8s + Monitoring • Zero downtime',
      time: '35 min ago',
      type: 'success',
    },
  ];

  const displayActivities = activities.length > 0 ? activities : defaultActivities;

  const getActivityIcon = (type: ActivityItem['type']) => {
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

  const getActivityDot = (type: ActivityItem['type']) => {
    const colorMap = {
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      error: 'bg-red-500',
      info: 'bg-blue-500',
    };
    return colorMap[type] || colorMap.info;
  };

  return (
    <div className="metric-card animate-slide-up">
      <h3 className="text-lg font-semibold mb-4">Recent Activity Feed</h3>
      <div className="space-y-4">
        {displayActivities.length > 0 ? (
          displayActivities.map((activity) => (
            <div key={activity.id} className="activity-item">
              <div className={cn('w-2 h-2 rounded-full mt-2 flex-shrink-0', getActivityDot(activity.type))}></div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 mb-1">{activity.title}</div>
                <div className="text-sm text-gray-600">{activity.description}</div>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                {getActivityIcon(activity.type)}
                <div className="text-sm text-gray-500">{activity.time}</div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📋</div>
            <p>No recent activity</p>
            <p className="text-sm">Activity will appear here as agents work</p>
          </div>
        )}
      </div>
      
      {displayActivities.length > 5 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            View all activity →
          </button>
        </div>
      )}
    </div>
  );
}