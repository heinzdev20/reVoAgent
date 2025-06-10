import React, { useState, useEffect } from 'react';
import { 
  Code, 
  Bug, 
  TestTube, 
  Rocket, 
  Globe, 
  Shield, 
  BookOpen, 
  Zap, 
  Building,
  Play,
  Pause,
  Settings,
  ChevronRight,
  Sparkles,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  Star
} from 'lucide-react';

interface AllAgentsInterfaceProps {
  agentUpdates: any;
  onAgentSelect: (agentType: string) => void;
}

const AllAgentsInterface: React.FC<AllAgentsInterfaceProps> = ({
  agentUpdates,
  onAgentSelect
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('popularity');

  // All 9 agents with enhanced metadata
  const allAgents = [
    {
      id: 'code_generator',
      name: 'Enhanced Code Generator',
      description: 'Generate clean, optimized code with AI-powered intelligence and best practices',
      icon: Code,
      category: 'development',
      status: 'active',
      popularity: 95,
      tasksCompleted: 1247,
      averageTime: '8.2s',
      successRate: 98.7,
      features: ['Multi-language support', 'Best practices', 'Auto-optimization', 'Real-time generation'],
      color: 'from-blue-500 to-cyan-500',
      tags: ['Popular', 'Fast', 'Reliable']
    },
    {
      id: 'debug_agent',
      name: 'Debug Detective',
      description: 'Intelligent debugging with root cause analysis and step-by-step solutions',
      icon: Bug,
      category: 'development',
      status: 'active',
      popularity: 87,
      tasksCompleted: 823,
      averageTime: '12.1s',
      successRate: 94.2,
      features: ['Root cause analysis', 'Step-by-step fixes', 'Error prediction', 'Code optimization'],
      color: 'from-red-500 to-orange-500',
      tags: ['Smart', 'Thorough', 'Accurate']
    },
    {
      id: 'testing_agent',
      name: 'Testing Specialist',
      description: 'Comprehensive test generation with edge cases and performance testing',
      icon: TestTube,
      category: 'quality',
      status: 'active',
      popularity: 78,
      tasksCompleted: 645,
      averageTime: '15.7s',
      successRate: 96.8,
      features: ['Unit tests', 'Integration tests', 'Edge cases', 'Performance tests'],
      color: 'from-green-500 to-emerald-500',
      tags: ['Comprehensive', 'Reliable', 'Thorough']
    },
    {
      id: 'deploy_agent',
      name: 'Deployment Orchestrator',
      description: 'Automated deployment with CI/CD integration and rollback capabilities',
      icon: Rocket,
      category: 'deployment',
      status: 'active',
      popularity: 71,
      tasksCompleted: 456,
      averageTime: '28.4s',
      successRate: 99.1,
      features: ['CI/CD integration', 'Auto-rollback', 'Multi-environment', 'Health monitoring'],
      color: 'from-purple-500 to-pink-500',
      tags: ['Automated', 'Safe', 'Fast']
    },
    {
      id: 'browser_agent',
      name: 'Browser Automation',
      description: 'Web automation, scraping, and interaction with intelligent navigation',
      icon: Globe,
      category: 'automation',
      status: 'active',
      popularity: 65,
      tasksCompleted: 334,
      averageTime: '22.3s',
      successRate: 92.5,
      features: ['Web scraping', 'Form automation', 'Screenshot capture', 'Performance testing'],
      color: 'from-indigo-500 to-blue-500',
      tags: ['Versatile', 'Automated', 'Efficient']
    },
    {
      id: 'security_agent',
      name: 'Security Guardian',
      description: 'Comprehensive security analysis, vulnerability scanning, and threat detection',
      icon: Shield,
      category: 'security',
      status: 'ready',
      popularity: 83,
      tasksCompleted: 198,
      averageTime: '35.2s',
      successRate: 99.8,
      features: ['Vulnerability scanning', 'Threat detection', 'Compliance checking', 'Security reports'],
      color: 'from-red-600 to-red-800',
      tags: ['Critical', 'Comprehensive', 'Essential']
    },
    {
      id: 'documentation_agent',
      name: 'Documentation Master',
      description: 'Intelligent documentation generation with API docs and code comments',
      icon: BookOpen,
      category: 'documentation',
      status: 'ready',
      popularity: 68,
      tasksCompleted: 287,
      averageTime: '18.9s',
      successRate: 97.3,
      features: ['API documentation', 'Code comments', 'README generation', 'Wiki creation'],
      color: 'from-amber-500 to-yellow-500',
      tags: ['Helpful', 'Detailed', 'Clear']
    },
    {
      id: 'performance_optimizer',
      name: 'Performance Optimizer',
      description: 'Advanced performance analysis and optimization recommendations',
      icon: Zap,
      category: 'optimization',
      status: 'ready',
      popularity: 76,
      tasksCompleted: 156,
      averageTime: '42.1s',
      successRate: 95.4,
      features: ['Performance profiling', 'Bottleneck detection', 'Optimization suggestions', 'Benchmarking'],
      color: 'from-yellow-500 to-orange-500',
      tags: ['Fast', 'Efficient', 'Smart']
    },
    {
      id: 'architecture_advisor',
      name: 'Architecture Advisor',
      description: 'Expert architectural guidance and system design recommendations',
      icon: Building,
      category: 'architecture',
      status: 'ready',
      popularity: 72,
      tasksCompleted: 124,
      averageTime: '58.7s',
      successRate: 98.9,
      features: ['System design', 'Architecture patterns', 'Scalability analysis', 'Best practices'],
      color: 'from-slate-500 to-gray-600',
      tags: ['Expert', 'Strategic', 'Scalable']
    }
  ];

  const categories = [
    { id: 'all', name: 'All Agents', count: allAgents.length },
    { id: 'development', name: 'Development', count: allAgents.filter(a => a.category === 'development').length },
    { id: 'quality', name: 'Quality Assurance', count: allAgents.filter(a => a.category === 'quality').length },
    { id: 'security', name: 'Security', count: allAgents.filter(a => a.category === 'security').length },
    { id: 'deployment', name: 'Deployment', count: allAgents.filter(a => a.category === 'deployment').length },
    { id: 'optimization', name: 'Optimization', count: allAgents.filter(a => a.category === 'optimization').length }
  ];

  const filteredAgents = allAgents
    .filter(agent => selectedCategory === 'all' || agent.category === selectedCategory)
    .filter(agent => agent.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    agent.description.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          return b.popularity - a.popularity;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'tasks':
          return b.tasksCompleted - a.tasksCompleted;
        case 'success':
          return b.successRate - a.successRate;
        default:
          return 0;
      }
    });

  const AgentCard = ({ agent }: { agent: any }) => {
    const Icon = agent.icon;
    const isActive = agent.status === 'active';
    
    return (
      <div 
        className="glass-card p-6 group hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden"
        onClick={() => onAgentSelect(agent.id)}
      >
        {/* Status indicator */}
        <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${
          isActive ? 'bg-green-400 animate-pulse' : 'bg-amber-400'
        }`} />

        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${agent.color} relative`}>
            <Icon className="w-6 h-6 text-white" />
            <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-white text-lg">{agent.name}</h3>
              {agent.tags.includes('Popular') && (
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
              )}
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              {agent.description}
            </p>
          </div>
          
          <ChevronRight className="w-5 h-5 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-lg font-bold text-white">{agent.tasksCompleted}</div>
            <div className="text-white/60 text-xs">Tasks Done</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-400">{agent.successRate}%</div>
            <div className="text-white/60 text-xs">Success</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-400">{agent.averageTime}</div>
            <div className="text-white/60 text-xs">Avg Time</div>
          </div>
        </div>

        {/* Features */}
        <div className="mb-4">
          <div className="text-white/80 text-sm font-medium mb-2">Key Features:</div>
          <div className="flex flex-wrap gap-1">
            {agent.features.slice(0, 3).map((feature: string) => (
              <span 
                key={feature}
                className="px-2 py-1 bg-white/10 rounded-full text-white/70 text-xs"
              >
                {feature}
              </span>
            ))}
            {agent.features.length > 3 && (
              <span className="px-2 py-1 bg-white/10 rounded-full text-white/70 text-xs">
                +{agent.features.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {agent.tags.map((tag: string) => (
              <span 
                key={tag}
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  tag === 'Popular' ? 'bg-yellow-400/20 text-yellow-300' :
                  tag === 'Fast' ? 'bg-green-400/20 text-green-300' :
                  tag === 'Critical' ? 'bg-red-400/20 text-red-300' :
                  'bg-blue-400/20 text-blue-300'
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              className="p-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                // Handle settings
              }}
            >
              <Settings className="w-4 h-4 text-white/70" />
            </button>
            <button 
              className={`p-1 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' 
                  : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                // Handle play/pause
              }}
            >
              {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
      </div>
    );
  };

  const CategoryButton = ({ category }: { category: any }) => (
    <button
      className={`glass-card px-4 py-3 text-sm font-medium transition-all duration-300 ${
        selectedCategory === category.id
          ? 'ring-2 ring-blue-400/50 bg-blue-400/20 text-blue-300'
          : 'text-white/70 hover:text-white hover:bg-white/10'
      }`}
      onClick={() => setSelectedCategory(category.id)}
    >
      <span>{category.name}</span>
      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
        selectedCategory === category.id ? 'bg-blue-400/30' : 'bg-white/20'
      }`}>
        {category.count}
      </span>
    </button>
  );

  return (
    <div className="space-y-8 animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
            AI Agent Hub
          </h1>
          <p className="text-white/70 text-lg">
            🤖 All 9 agents available • Choose your AI assistant
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="glass-card px-4 py-2">
            <select 
              className="bg-transparent text-white text-sm font-medium border-none outline-none cursor-pointer"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="popularity">Sort by Popularity</option>
              <option value="name">Sort by Name</option>
              <option value="tasks">Sort by Tasks</option>
              <option value="success">Sort by Success Rate</option>
            </select>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search agents by name or capability..."
            className="glass-input pl-12 pr-4 py-3 text-lg w-full max-w-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Sparkles className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
        </div>

        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <CategoryButton key={category.id} category={category} />
          ))}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-white mb-1">9</div>
          <div className="text-white/70 text-sm">Total Agents</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-green-400 mb-1">5</div>
          <div className="text-white/70 text-sm">Active Now</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-blue-400 mb-1">4</div>
          <div className="text-white/70 text-sm">Ready to Use</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-purple-400 mb-1">3.2K</div>
          <div className="text-white/70 text-sm">Tasks Completed</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400 mb-1">97.1%</div>
          <div className="text-white/70 text-sm">Success Rate</div>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>

      {/* No results */}
      {filteredAgents.length === 0 && (
        <div className="text-center py-12">
          <div className="glass-card p-8 max-w-md mx-auto">
            <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No agents found</h3>
            <p className="text-white/70 mb-4">
              Try adjusting your search terms or filters
            </p>
            <button 
              className="glass-button primary"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="glass-card p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-400" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            className="glass-button primary p-4 flex items-center gap-3"
            onClick={() => onAgentSelect('code_generator')}
          >
            <Code className="w-5 h-5" />
            <span>Generate Code</span>
          </button>
          <button 
            className="glass-button success p-4 flex items-center gap-3"
            onClick={() => onAgentSelect('security_agent')}
          >
            <Shield className="w-5 h-5" />
            <span>Security Scan</span>
          </button>
          <button 
            className="glass-button warning p-4 flex items-center gap-3"
            onClick={() => onAgentSelect('performance_optimizer')}
          >
            <Zap className="w-5 h-5" />
            <span>Optimize Performance</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AllAgentsInterface;