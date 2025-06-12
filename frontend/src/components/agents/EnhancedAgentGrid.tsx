/**
 * Enhanced Agent Grid - 20+ Memory-Enabled Specialized Agents
 * Complete UI implementation for all reVoAgent specialized agents
 */

import React, { useState, useEffect } from 'react';
import { useEnhancedWebSocket } from '../../hooks/useEnhancedWebSocket';
import { 
  Code, 
  Bug, 
  TestTube, 
  FileText, 
  Rocket, 
  Globe, 
  Shield, 
  Zap, 
  Layers, 
  Database,
  GitBranch,
  MessageSquare,
  Search,
  BarChart3,
  Settings,
  Users,
  Cloud,
  Lock,
  Cpu,
  Brain,
  Eye,
  Workflow,
  PieChart,
  Target,
  Lightbulb,
  Wrench,
  Monitor,
  Package,
  Server,
  Activity
} from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  description: string;
  category: string;
  capabilities: string[];
  status: 'idle' | 'processing' | 'error' | 'offline';
  memoryEnabled: boolean;
  tasksCompleted: number;
  averageResponseTime: number;
  successRate: number;
  icon: React.ReactNode;
  color: string;
  lastActivity?: string;
}

const SPECIALIZED_AGENTS: Agent[] = [
  // Development Agents
  {
    id: 'code_generator_001',
    name: 'Code Generator Pro',
    description: 'Advanced code generation with memory-enhanced pattern recognition',
    category: 'Development',
    capabilities: ['code_generation', 'refactoring', 'optimization', 'pattern_recognition'],
    status: 'idle',
    memoryEnabled: true,
    tasksCompleted: 1247,
    averageResponseTime: 850,
    successRate: 96.8,
    icon: <Code className="w-6 h-6" />,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'debug_detective_001',
    name: 'Debug Detective',
    description: 'AI-powered debugging with memory of previous solutions',
    category: 'Development',
    capabilities: ['debugging', 'error_analysis', 'troubleshooting', 'solution_memory'],
    status: 'processing',
    memoryEnabled: true,
    tasksCompleted: 892,
    averageResponseTime: 1200,
    successRate: 94.2,
    icon: <Bug className="w-6 h-6" />,
    color: 'from-red-500 to-orange-500'
  },
  {
    id: 'testing_specialist_001',
    name: 'Testing Specialist',
    description: 'Comprehensive testing with memory-enhanced test case generation',
    category: 'Development',
    capabilities: ['test_generation', 'test_execution', 'coverage_analysis', 'regression_testing'],
    status: 'idle',
    memoryEnabled: true,
    tasksCompleted: 634,
    averageResponseTime: 950,
    successRate: 97.1,
    icon: <TestTube className="w-6 h-6" />,
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'documentation_expert_001',
    name: 'Documentation Expert',
    description: 'Intelligent documentation with context-aware content generation',
    category: 'Development',
    capabilities: ['documentation', 'api_docs', 'user_guides', 'context_awareness'],
    status: 'idle',
    memoryEnabled: true,
    tasksCompleted: 445,
    averageResponseTime: 720,
    successRate: 98.5,
    icon: <FileText className="w-6 h-6" />,
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'deployment_manager_001',
    name: 'Deployment Manager',
    description: 'Smart deployment automation with memory of successful patterns',
    category: 'DevOps',
    capabilities: ['deployment', 'ci_cd', 'infrastructure', 'automation'],
    status: 'idle',
    memoryEnabled: true,
    tasksCompleted: 312,
    averageResponseTime: 1800,
    successRate: 95.7,
    icon: <Rocket className="w-6 h-6" />,
    color: 'from-indigo-500 to-blue-500'
  },

  // Security & Compliance Agents
  {
    id: 'security_guardian_001',
    name: 'Security Guardian',
    description: 'Advanced security analysis with threat pattern memory',
    category: 'Security',
    capabilities: ['security_analysis', 'vulnerability_scan', 'compliance', 'threat_detection'],
    status: 'processing',
    memoryEnabled: true,
    tasksCompleted: 567,
    averageResponseTime: 1100,
    successRate: 99.1,
    icon: <Shield className="w-6 h-6" />,
    color: 'from-red-600 to-red-400'
  },
  {
    id: 'compliance_auditor_001',
    name: 'Compliance Auditor',
    description: 'Regulatory compliance with memory of audit requirements',
    category: 'Security',
    capabilities: ['compliance_audit', 'regulatory_check', 'policy_validation', 'risk_assessment'],
    status: 'idle',
    memoryEnabled: true,
    tasksCompleted: 234,
    averageResponseTime: 1350,
    successRate: 97.8,
    icon: <Lock className="w-6 h-6" />,
    color: 'from-yellow-600 to-orange-500'
  },

  // Data & Analytics Agents
  {
    id: 'data_analyst_001',
    name: 'Data Analyst Pro',
    description: 'Advanced data analysis with memory-enhanced insights',
    category: 'Analytics',
    capabilities: ['data_analysis', 'statistical_modeling', 'visualization', 'pattern_discovery'],
    status: 'idle',
    memoryEnabled: true,
    tasksCompleted: 789,
    averageResponseTime: 980,
    successRate: 96.3,
    icon: <BarChart3 className="w-6 h-6" />,
    color: 'from-teal-500 to-cyan-500'
  },
  {
    id: 'database_optimizer_001',
    name: 'Database Optimizer',
    description: 'Database performance optimization with query pattern memory',
    category: 'Data',
    capabilities: ['query_optimization', 'schema_design', 'performance_tuning', 'indexing'],
    status: 'idle',
    memoryEnabled: true,
    tasksCompleted: 456,
    averageResponseTime: 1450,
    successRate: 94.9,
    icon: <Database className="w-6 h-6" />,
    color: 'from-slate-500 to-gray-600'
  },

  // AI & Machine Learning Agents
  {
    id: 'ml_engineer_001',
    name: 'ML Engineer',
    description: 'Machine learning model development with experiment memory',
    category: 'AI/ML',
    capabilities: ['model_training', 'feature_engineering', 'hyperparameter_tuning', 'evaluation'],
    status: 'processing',
    memoryEnabled: true,
    tasksCompleted: 345,
    averageResponseTime: 2100,
    successRate: 93.7,
    icon: <Brain className="w-6 h-6" />,
    color: 'from-violet-500 to-purple-600'
  },
  {
    id: 'nlp_specialist_001',
    name: 'NLP Specialist',
    description: 'Natural language processing with contextual memory',
    category: 'AI/ML',
    capabilities: ['text_analysis', 'sentiment_analysis', 'entity_extraction', 'language_modeling'],
    status: 'idle',
    memoryEnabled: true,
    tasksCompleted: 678,
    averageResponseTime: 890,
    successRate: 97.4,
    icon: <MessageSquare className="w-6 h-6" />,
    color: 'from-pink-500 to-rose-500'
  },

  // Infrastructure & Monitoring Agents
  {
    id: 'infrastructure_architect_001',
    name: 'Infrastructure Architect',
    description: 'Cloud infrastructure design with architectural pattern memory',
    category: 'Infrastructure',
    capabilities: ['architecture_design', 'scalability_planning', 'cost_optimization', 'best_practices'],
    status: 'idle',
    memoryEnabled: true,
    tasksCompleted: 289,
    averageResponseTime: 1650,
    successRate: 96.1,
    icon: <Layers className="w-6 h-6" />,
    color: 'from-emerald-600 to-teal-500'
  },
  {
    id: 'performance_optimizer_001',
    name: 'Performance Optimizer',
    description: 'System performance optimization with benchmark memory',
    category: 'Performance',
    capabilities: ['performance_analysis', 'bottleneck_detection', 'optimization', 'monitoring'],
    status: 'idle',
    memoryEnabled: true,
    tasksCompleted: 523,
    averageResponseTime: 1100,
    successRate: 95.8,
    icon: <Zap className="w-6 h-6" />,
    color: 'from-yellow-500 to-amber-500'
  },
  {
    id: 'monitoring_specialist_001',
    name: 'Monitoring Specialist',
    description: 'Advanced monitoring with alert pattern memory',
    category: 'Monitoring',
    capabilities: ['metrics_collection', 'alerting', 'dashboard_creation', 'anomaly_detection'],
    status: 'processing',
    memoryEnabled: true,
    tasksCompleted: 712,
    averageResponseTime: 750,
    successRate: 98.2,
    icon: <Monitor className="w-6 h-6" />,
    color: 'from-blue-600 to-indigo-500'
  },

  // Business & Process Agents
  {
    id: 'workflow_designer_001',
    name: 'Workflow Designer',
    description: 'Business process automation with workflow pattern memory',
    category: 'Business',
    capabilities: ['process_design', 'automation', 'optimization', 'integration'],
    status: 'idle',
    memoryEnabled: true,
    tasksCompleted: 398,
    averageResponseTime: 1250,
    successRate: 96.7,
    icon: <Workflow className="w-6 h-6" />,
    color: 'from-cyan-500 to-blue-500'
  },
  {
    id: 'business_analyst_001',
    name: 'Business Analyst',
    description: 'Business intelligence with market trend memory',
    category: 'Business',
    capabilities: ['market_analysis', 'trend_identification', 'forecasting', 'reporting'],
    status: 'idle',
    memoryEnabled: true,
    tasksCompleted: 445,
    averageResponseTime: 980,
    successRate: 97.3,
    icon: <PieChart className="w-6 h-6" />,
    color: 'from-orange-500 to-red-500'
  },

  // Specialized Domain Agents
  {
    id: 'api_designer_001',
    name: 'API Designer',
    description: 'RESTful API design with pattern memory and best practices',
    category: 'Development',
    capabilities: ['api_design', 'documentation', 'testing', 'versioning'],
    status: 'idle',
    memoryEnabled: true,
    tasksCompleted: 356,
    averageResponseTime: 890,
    successRate: 97.9,
    icon: <Globe className="w-6 h-6" />,
    color: 'from-green-600 to-emerald-500'
  },
  {
    id: 'ui_ux_designer_001',
    name: 'UI/UX Designer',
    description: 'User interface design with design pattern memory',
    category: 'Design',
    capabilities: ['ui_design', 'ux_optimization', 'accessibility', 'user_research'],
    status: 'idle',
    memoryEnabled: true,
    tasksCompleted: 267,
    averageResponseTime: 1150,
    successRate: 96.4,
    icon: <Eye className="w-6 h-6" />,
    color: 'from-purple-600 to-pink-500'
  },
  {
    id: 'devops_engineer_001',
    name: 'DevOps Engineer',
    description: 'DevOps automation with deployment pattern memory',
    category: 'DevOps',
    capabilities: ['ci_cd', 'containerization', 'orchestration', 'monitoring'],
    status: 'processing',
    memoryEnabled: true,
    tasksCompleted: 489,
    averageResponseTime: 1400,
    successRate: 95.2,
    icon: <Settings className="w-6 h-6" />,
    color: 'from-gray-600 to-slate-500'
  },
  {
    id: 'cloud_architect_001',
    name: 'Cloud Architect',
    description: 'Multi-cloud architecture with cost optimization memory',
    category: 'Cloud',
    capabilities: ['cloud_design', 'migration', 'cost_optimization', 'security'],
    status: 'idle',
    memoryEnabled: true,
    tasksCompleted: 234,
    averageResponseTime: 1800,
    successRate: 94.8,
    icon: <Cloud className="w-6 h-6" />,
    color: 'from-sky-500 to-blue-600'
  },
  {
    id: 'innovation_catalyst_001',
    name: 'Innovation Catalyst',
    description: 'Creative problem solving with innovation pattern memory',
    category: 'Innovation',
    capabilities: ['ideation', 'problem_solving', 'research', 'prototyping'],
    status: 'idle',
    memoryEnabled: true,
    tasksCompleted: 178,
    averageResponseTime: 1650,
    successRate: 98.7,
    icon: <Lightbulb className="w-6 h-6" />,
    color: 'from-amber-500 to-yellow-500'
  }
];

interface AgentCardProps {
  agent: Agent;
  onSelect: (agent: Agent) => void;
  onTaskAssign: (agentId: string) => void;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, onSelect, onTaskAssign }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle': return 'bg-green-500';
      case 'processing': return 'bg-blue-500 animate-pulse';
      case 'error': return 'bg-red-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPerformanceColor = (rate: number) => {
    if (rate >= 97) return 'text-green-400';
    if (rate >= 95) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div 
      className="group relative bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 cursor-pointer hover:scale-105"
      onClick={() => onSelect(agent)}
    >
      {/* Status Indicator */}
      <div className={`absolute top-3 right-3 w-3 h-3 rounded-full ${getStatusColor(agent.status)}`} />
      
      {/* Memory Badge */}
      {agent.memoryEnabled && (
        <div className="absolute top-3 left-3 bg-purple-500/20 text-purple-300 text-xs px-2 py-1 rounded-full border border-purple-500/30">
          Memory
        </div>
      )}

      {/* Agent Icon */}
      <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${agent.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
        {agent.icon}
      </div>

      {/* Agent Info */}
      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
            {agent.name}
          </h3>
          <p className="text-sm text-gray-400 line-clamp-2">
            {agent.description}
          </p>
        </div>

        {/* Category */}
        <div className="flex items-center space-x-2">
          <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
            {agent.category}
          </span>
          <span className="text-xs text-gray-400 capitalize">
            {agent.status}
          </span>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <div className="text-blue-400 font-semibold">{agent.tasksCompleted}</div>
            <div className="text-gray-500">Tasks</div>
          </div>
          <div className="text-center">
            <div className="text-green-400 font-semibold">{agent.averageResponseTime}ms</div>
            <div className="text-gray-500">Avg Time</div>
          </div>
          <div className="text-center">
            <div className={`font-semibold ${getPerformanceColor(agent.successRate)}`}>
              {agent.successRate}%
            </div>
            <div className="text-gray-500">Success</div>
          </div>
        </div>

        {/* Capabilities */}
        <div className="flex flex-wrap gap-1">
          {agent.capabilities.slice(0, 3).map((capability, index) => (
            <span key={index} className="text-xs bg-gray-700/50 text-gray-300 px-2 py-1 rounded">
              {capability.replace('_', ' ')}
            </span>
          ))}
          {agent.capabilities.length > 3 && (
            <span className="text-xs text-gray-400">
              +{agent.capabilities.length - 3} more
            </span>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTaskAssign(agent.id);
          }}
          disabled={agent.status === 'offline'}
          className="w-full mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors"
        >
          {agent.status === 'processing' ? 'Busy' : agent.status === 'offline' ? 'Offline' : 'Assign Task'}
        </button>
      </div>
    </div>
  );
};

export const EnhancedAgentGrid: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>(SPECIALIZED_AGENTS);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'performance' | 'tasks'>('name');

  const { submitAgentTask } = useEnhancedWebSocket();

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(agents.map(agent => agent.category)))];

  // Filter and sort agents
  const filteredAgents = agents
    .filter(agent => {
      const matchesCategory = filterCategory === 'all' || agent.category === filterCategory;
      const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           agent.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'performance':
          return b.successRate - a.successRate;
        case 'tasks':
          return b.tasksCompleted - a.tasksCompleted;
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const handleAgentSelect = (agent: Agent) => {
    setSelectedAgent(agent);
  };

  const handleTaskAssign = (agentId: string) => {
    // This would open a task assignment modal or form
    console.log('Assigning task to agent:', agentId);
    // submitAgentTask(agentId, 'New task assignment', {});
  };

  const getStatusCounts = () => {
    return agents.reduce((counts, agent) => {
      counts[agent.status] = (counts[agent.status] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Memory-Enabled Agent Grid</h2>
          <p className="text-gray-400">20+ Specialized AI Agents with Advanced Memory Capabilities</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-400">
            Total: {agents.length} agents
          </div>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(statusCounts).map(([status, count]) => (
          <div key={status} className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">{count}</div>
                <div className="text-sm text-gray-400 capitalize">{status}</div>
              </div>
              <Activity className="w-8 h-8 text-blue-400" />
            </div>
          </div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search agents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
          >
            {categories.map(category => (
              <option key={category} value={category} className="bg-gray-800">
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'performance' | 'tasks')}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
          >
            <option value="name" className="bg-gray-800">Sort by Name</option>
            <option value="performance" className="bg-gray-800">Sort by Performance</option>
            <option value="tasks" className="bg-gray-800">Sort by Tasks</option>
          </select>
        </div>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAgents.map(agent => (
          <AgentCard
            key={agent.id}
            agent={agent}
            onSelect={handleAgentSelect}
            onTaskAssign={handleTaskAssign}
          />
        ))}
      </div>

      {filteredAgents.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg">No agents found matching your criteria</div>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterCategory('all');
            }}
            className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Agent Details Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">{selectedAgent.name}</h3>
              <button
                onClick={() => setSelectedAgent(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-300">{selectedAgent.description}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">Performance</h4>
                  <div className="space-y-1 text-sm">
                    <div>Tasks: {selectedAgent.tasksCompleted}</div>
                    <div>Avg Time: {selectedAgent.averageResponseTime}ms</div>
                    <div>Success Rate: {selectedAgent.successRate}%</div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">Status</h4>
                  <div className="space-y-1 text-sm">
                    <div className="capitalize">Status: {selectedAgent.status}</div>
                    <div>Memory: {selectedAgent.memoryEnabled ? 'Enabled' : 'Disabled'}</div>
                    <div>Category: {selectedAgent.category}</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-2">Capabilities</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedAgent.capabilities.map((capability, index) => (
                    <span key={index} className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                      {capability.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedAgentGrid;