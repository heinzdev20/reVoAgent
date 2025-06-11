/**
 * Agent Grid Component
 * Displays the 100-agent coordination system in a grid layout
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Brain, Wrench, Activity, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  type: 'claude' | 'gemini' | 'openhands';
  status: 'active' | 'idle' | 'busy' | 'error';
  tasks_completed: number;
  success_rate: number;
  current_task?: string;
}

interface AgentGridProps {
  claudeAgents: Agent[];
  geminiAgents: Agent[];
  openhandsAgents: Agent[];
  className?: string;
}

const getAgentIcon = (type: string) => {
  switch (type) {
    case 'claude':
      return Bot;
    case 'gemini':
      return Brain;
    case 'openhands':
      return Wrench;
    default:
      return Bot;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'busy':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'idle':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'error':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active':
      return <CheckCircle className="h-4 w-4" />;
    case 'busy':
      return <Activity className="h-4 w-4 animate-pulse" />;
    case 'idle':
      return <Clock className="h-4 w-4" />;
    case 'error':
      return <AlertCircle className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

const AgentCard: React.FC<{ agent: Agent; index: number }> = ({ agent, index }) => {
  const Icon = getAgentIcon(agent.type);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Icon className={`h-5 w-5 ${
            agent.type === 'claude' ? 'text-blue-600' :
            agent.type === 'gemini' ? 'text-green-600' :
            'text-purple-600'
          }`} />
          <span className="font-medium text-sm text-gray-900">{agent.name}</span>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(agent.status)}`}>
          <div className="flex items-center space-x-1">
            {getStatusIcon(agent.status)}
            <span className="capitalize">{agent.status}</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-600">
          <span>Tasks:</span>
          <span className="font-medium">{agent.tasks_completed}</span>
        </div>
        <div className="flex justify-between text-xs text-gray-600">
          <span>Success:</span>
          <span className="font-medium">{(agent.success_rate * 100).toFixed(1)}%</span>
        </div>
        {agent.current_task && (
          <div className="text-xs text-gray-500 truncate">
            <span className="font-medium">Current:</span> {agent.current_task}
          </div>
        )}
      </div>
      
      {/* Progress bar for success rate */}
      <div className="mt-3">
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div 
            className={`h-1.5 rounded-full ${
              agent.success_rate > 0.9 ? 'bg-green-500' :
              agent.success_rate > 0.7 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${agent.success_rate * 100}%` }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export const AgentGrid: React.FC<AgentGridProps> = ({
  claudeAgents,
  geminiAgents,
  openhandsAgents,
  className = ''
}) => {
  const allAgents = [...claudeAgents, ...geminiAgents, ...openhandsAgents];
  
  // Generate mock data if no real agents provided
  const mockAgents = allAgents.length === 0 ? Array.from({ length: 12 }, (_, i) => ({
    id: `agent-${i + 1}`,
    name: `Agent ${i + 1}`,
    type: i < 4 ? 'claude' : i < 8 ? 'gemini' : 'openhands',
    status: ['active', 'busy', 'idle'][Math.floor(Math.random() * 3)],
    tasks_completed: Math.floor(Math.random() * 100),
    success_rate: 0.8 + Math.random() * 0.2,
    current_task: Math.random() > 0.5 ? 'Processing request...' : undefined
  })) as Agent[] : allAgents;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Agent Type Sections */}
      {claudeAgents.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Bot className="h-5 w-5 text-blue-600 mr-2" />
            Claude Agents ({claudeAgents.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {claudeAgents.map((agent, index) => (
              <AgentCard key={agent.id} agent={agent} index={index} />
            ))}
          </div>
        </div>
      )}

      {geminiAgents.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Brain className="h-5 w-5 text-green-600 mr-2" />
            Gemini Agents ({geminiAgents.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {geminiAgents.map((agent, index) => (
              <AgentCard key={agent.id} agent={agent} index={index} />
            ))}
          </div>
        </div>
      )}

      {openhandsAgents.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Wrench className="h-5 w-5 text-purple-600 mr-2" />
            OpenHands Agents ({openhandsAgents.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {openhandsAgents.map((agent, index) => (
              <AgentCard key={agent.id} agent={agent} index={index} />
            ))}
          </div>
        </div>
      )}

      {/* Mock data display when no real agents */}
      {allAgents.length === 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Agent Coordination System (Demo Mode)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {mockAgents.map((agent, index) => (
              <AgentCard key={agent.id} agent={agent} index={index} />
            ))}
          </div>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Demo Mode:</strong> Connect to the backend API to see real agent data. 
              The system supports 100 agents (30 Claude + 40 Gemini + 30 OpenHands).
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentGrid;