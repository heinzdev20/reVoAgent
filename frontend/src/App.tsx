import React, { useState } from 'react';
import FullReVoDashboard from './components/FullReVoDashboard';
import ThreeEngineArchitectureDashboard from './components/ThreeEngineArchitectureDashboard';
import EnhancedCollapsibleDashboard from './components/EnhancedCollapsibleDashboard';
import WorkspaceContainer from './components/workspace/WorkspaceContainer';
import EnhancedWorkspaceChat from './components/enhanced/EnhancedWorkspaceChat';
import EnhancedAgentDashboard from './components/enhanced/EnhancedAgentDashboard';
import ThreeEngineWorkspace from './components/three-engine/ThreeEngineWorkspace';
import StandardUserDashboard from './components/standard/StandardUserDashboard';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'workspace' | 'enhanced' | 'standard' | 'three-engine'>('workspace');
  const [enhancedMode, setEnhancedMode] = useState<'chat' | 'dashboard'>('chat');

  return (
    <div>
      {/* View Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-2 border border-gray-700">
          <button
            onClick={() => setCurrentView('workspace')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
              currentView === 'workspace'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            🎪 Workspace Arena
          </button>
          <button
            onClick={() => setCurrentView('enhanced')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-all ml-2 ${
              currentView === 'enhanced'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            🚀 Enhanced
          </button>
          <button
            onClick={() => setCurrentView('three-engine')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-all ml-2 ${
              currentView === 'three-engine'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            🧠 Three-Engine
          </button>
          <button
            onClick={() => setCurrentView('standard')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-all ml-2 ${
              currentView === 'standard'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            📊 Standard
          </button>
        </div>
        
        {/* Mode Toggle for Enhanced */}
        {currentView === 'enhanced' && (
          <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-2 border border-gray-700 mt-2">
            <button
              onClick={() => setEnhancedMode('chat')}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                enhancedMode === 'chat'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              💬 Chat
            </button>
            <button
              onClick={() => setEnhancedMode('dashboard')}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ml-2 ${
                enhancedMode === 'dashboard'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              📊 Analytics
            </button>
          </div>
        )}
      </div>

      {/* Dashboard Views */}
      {currentView === 'workspace' ? (
        <WorkspaceContainer />
      ) : currentView === 'enhanced' ? (
        enhancedMode === 'chat' ? <EnhancedWorkspaceChat /> : <EnhancedAgentDashboard />
      ) : currentView === 'three-engine' ? (
        <ThreeEngineWorkspace />
      ) : (
        <StandardUserDashboard />
      )}
    </div>
  );
};

export default App;