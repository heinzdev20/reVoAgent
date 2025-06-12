import React, { useState } from 'react';
import FullReVoDashboard from './components/FullReVoDashboard';
import ThreeEngineArchitectureDashboard from './components/ThreeEngineArchitectureDashboard';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'standard' | 'three-engine'>('three-engine');

  return (
    <div>
      {/* View Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-2 border border-gray-700">
          <button
            onClick={() => setCurrentView('three-engine')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              currentView === 'three-engine'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            🧠 Three-Engine
          </button>
          <button
            onClick={() => setCurrentView('standard')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ml-2 ${
              currentView === 'standard'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            📊 Standard
          </button>
        </div>
      </div>

      {/* Dashboard Views */}
      {currentView === 'three-engine' ? (
        <ThreeEngineArchitectureDashboard />
      ) : (
        <FullReVoDashboard />
      )}
    </div>
  );
};

export default App;