import React from 'react';
import { Terminal, Settings } from 'lucide-react';

export function QuickTools() {
  const handleQuickTerminal = () => {
    alert('⚡ Quick Terminal\n\nThis would open an integrated terminal interface with:\n• Direct access to OpenHands CLI\n• Model management commands\n• System diagnostics\n• Real-time logs');
  };

  const handleModelSelector = () => {
    alert('🔧 Model Selector\n\nThis would open the AI model management interface with:\n• Model switching and configuration\n• Performance optimization settings\n• Resource allocation controls\n• Model download and installation');
  };

  return (
    <div className="flex justify-end space-x-4 animate-slide-up">
      <button
        onClick={handleQuickTerminal}
        className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
      >
        <Terminal className="w-4 h-4" />
        <span>Quick Terminal</span>
      </button>
      <button
        onClick={handleModelSelector}
        className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center space-x-2 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
      >
        <Settings className="w-4 h-4" />
        <span>Model Selector</span>
      </button>
    </div>
  );
}