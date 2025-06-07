import React from 'react';
import { Construction } from 'lucide-react';

interface PlaceholderViewProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export function PlaceholderView({ 
  title, 
  description = 'This section is being implemented with advanced features.',
  icon 
}: PlaceholderViewProps) {
  return (
    <div className="p-6 animate-fade-in">
      <div className="metric-card text-center py-12">
        <div className="text-6xl mb-4">
          {icon || <Construction className="w-16 h-16 mx-auto text-gray-400" />}
        </div>
        <h2 className="text-xl font-semibold mb-4 text-gray-900">{title}</h2>
        <p className="text-gray-500 max-w-md mx-auto">{description}</p>
        <div className="mt-6">
          <div className="inline-flex items-center px-4 py-2 bg-primary-50 text-primary-700 rounded-lg">
            <Construction className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Feature Under Development</span>
          </div>
        </div>
      </div>
    </div>
  );
}