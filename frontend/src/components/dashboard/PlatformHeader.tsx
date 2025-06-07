import React from 'react';
import { CheckCircle, AlertTriangle } from 'lucide-react';

export function PlatformHeader() {
  const integrations = [
    { name: 'OpenHands', status: 'connected' },
    { name: 'vLLM', status: 'connected' },
    { name: 'Docker', status: 'connected' },
    { name: 'All-Hands', status: 'connected' },
    { name: 'IDE Plugins', status: 'warning' },
  ];

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg shadow-lg animate-slide-up">
      <h2 className="text-2xl font-bold mb-2">Revolutionary Agentic Coding Platform</h2>
      <p className="text-blue-100 mb-4">Zero-cost AI • Multi-platform • Production Ready</p>
      <div className="flex items-center space-x-6 text-sm">
        {integrations.map((integration) => (
          <div key={integration.name} className="flex items-center space-x-2">
            {integration.status === 'connected' ? (
              <CheckCircle className="w-4 h-4 text-green-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
            )}
            <span>{integration.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}