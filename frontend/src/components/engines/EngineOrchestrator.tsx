import React, { useState, useEffect } from 'react';
import { Brain, Zap, Palette, Settings, Activity, Play, Pause, RotateCcw } from 'lucide-react';

interface EngineStatus {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'processing' | 'error';
  load: number;
  lastActivity: string;
  tasksCompleted: number;
  avgResponseTime: number;
}

interface EngineTask {
  id: string;
  type: string;
  description: string;
  engine: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  startTime: string;
  duration?: number;
  result?: string;
}

export const EngineOrchestrator: React.FC = () => {
  const [engines, setEngines] = useState<EngineStatus[]>([
    {
      id: 'perfect-recall',
      name: 'Perfect Recall Engine',
      status: 'active',
      load: 65,
      lastActivity: '2 minutes ago',
      tasksCompleted: 1247,
      avgResponseTime: 150
    },
    {
      id: 'parallel-mind',
      name: 'Parallel Mind Engine',
      status: 'processing',
      load: 89,
      lastActivity: 'Just now',
      tasksCompleted: 892,
      avgResponseTime: 320
    },
    {
      id: 'creative-engine',
      name: 'Creative Engine',
      status: 'idle',
      load: 23,
      lastActivity: '5 minutes ago',
      tasksCompleted: 634,
      avgResponseTime: 280
    }
  ]);

  const [tasks, setTasks] = useState<EngineTask[]>([
    {
      id: '1',
      type: 'Code Generation',
      description: 'Generate React component for user dashboard',
      engine: 'creative-engine',
      status: 'completed',
      startTime: '10:30 AM',
      duration: 2.3,
      result: 'Successfully generated UserDashboard.tsx with TypeScript'
    },
    {
      id: '2',
      type: 'Memory Recall',
      description: 'Find similar authentication patterns',
      engine: 'perfect-recall',
      status: 'processing',
      startTime: '10:32 AM'
    },
    {
      id: '3',
      type: 'Parallel Analysis',
      description: 'Analyze code quality across multiple files',
      engine: 'parallel-mind',
      status: 'pending',
      startTime: '10:33 AM'
    }
  ]);

  const [newTask, setNewTask] = useState({
    type: '',
    description: '',
    engine: ''
  });

  const getEngineIcon = (engineId: string) => {
    switch (engineId) {
      case 'perfect-recall':
        return <Brain className="w-6 h-6 text-blue-500" />;
      case 'parallel-mind':
        return <Zap className="w-6 h-6 text-purple-500" />;
      case 'creative-engine':
        return <Palette className="w-6 h-6 text-pink-500" />;
      default:
        return <Settings className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'idle':
        return 'bg-gray-100 text-gray-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEngineAction = (engineId: string, action: string) => {
    setEngines(prev => prev.map(engine => 
      engine.id === engineId 
        ? { ...engine, status: action === 'start' ? 'active' : 'idle' as any }
        : engine
    ));
  };

  const submitTask = () => {
    if (newTask.type && newTask.description && newTask.engine) {
      const task: EngineTask = {
        id: Date.now().toString(),
        type: newTask.type,
        description: newTask.description,
        engine: newTask.engine,
        status: 'pending',
        startTime: new Date().toLocaleTimeString()
      };
      setTasks(prev => [task, ...prev]);
      setNewTask({ type: '', description: '', engine: '' });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Engine Orchestrator</h1>
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-green-500" />
          <span className="text-sm text-gray-600">All Systems Operational</span>
        </div>
      </div>

      {/* Engine Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {engines.map((engine) => (
          <div key={engine.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                {getEngineIcon(engine.id)}
                <h3 className="text-lg font-semibold text-gray-900">{engine.name}</h3>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(engine.status)}`}>
                {engine.status}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Load</span>
                  <span>{engine.load}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${engine.load}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Tasks</span>
                  <p className="font-semibold">{engine.tasksCompleted}</p>
                </div>
                <div>
                  <span className="text-gray-600">Avg Time</span>
                  <p className="font-semibold">{engine.avgResponseTime}ms</p>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                Last activity: {engine.lastActivity}
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  onClick={() => handleEngineAction(engine.id, 'start')}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  <span>Start</span>
                </button>
                <button
                  onClick={() => handleEngineAction(engine.id, 'pause')}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 transition-colors"
                >
                  <Pause className="w-4 h-4" />
                  <span>Pause</span>
                </button>
                <button
                  onClick={() => handleEngineAction(engine.id, 'restart')}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Restart</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Task Submission */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Submit New Task</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={newTask.type}
            onChange={(e) => setNewTask(prev => ({ ...prev, type: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Task Type</option>
            <option value="Code Generation">Code Generation</option>
            <option value="Memory Recall">Memory Recall</option>
            <option value="Parallel Analysis">Parallel Analysis</option>
            <option value="Creative Design">Creative Design</option>
            <option value="Debug Analysis">Debug Analysis</option>
          </select>

          <select
            value={newTask.engine}
            onChange={(e) => setNewTask(prev => ({ ...prev, engine: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Engine</option>
            <option value="perfect-recall">Perfect Recall Engine</option>
            <option value="parallel-mind">Parallel Mind Engine</option>
            <option value="creative-engine">Creative Engine</option>
          </select>

          <input
            type="text"
            placeholder="Task description..."
            value={newTask.description}
            onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={submitTask}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Submit Task
          </button>
        </div>
      </div>

      {/* Task Queue */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Task Queue</h2>
        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                  <span className="font-medium">{task.type}</span>
                  <span className="text-gray-600">→</span>
                  <span className="text-sm text-gray-600">{task.engine}</span>
                </div>
                <p className="text-gray-700 mt-1">{task.description}</p>
                {task.result && (
                  <p className="text-sm text-green-600 mt-1">✓ {task.result}</p>
                )}
              </div>
              <div className="text-right text-sm text-gray-600">
                <div>{task.startTime}</div>
                {task.duration && (
                  <div className="text-green-600">{task.duration}s</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};