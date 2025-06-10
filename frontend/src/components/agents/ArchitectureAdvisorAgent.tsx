/**
 * 🏗️ Architecture Advisor Agent - Intelligent Architecture Analysis & Recommendations
 * Advanced architectural guidance with design pattern recognition and scalability insights
 */

import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Building2, 
  GitBranch, 
  Target, 
  Lightbulb, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Search,
  Filter,
  Settings,
  Play,
  Square,
  RefreshCw,
  Download,
  FileText,
  Code,
  Database,
  Cloud,
  Shield,
  Zap,
  Users,
  Globe,
  Package,
  Cpu,
  Network,
  Lock,
  Unlock,
  TrendingUp,
  TrendingDown,
  Activity,
  Eye,
  Edit3,
  Star,
  Award
} from 'lucide-react';
import { 
  useAgentStore, 
  useAgentStatus, 
  useAgentError, 
  useIsAgentExecuting,
  useAgentMetrics,
  useAgentTaskHistory
} from '../../stores/agentStore';
import { AGENT_TYPES } from '../../services/api';
import { cn } from '../../utils/cn';

interface ArchitecturePattern {
  id: string;
  name: string;
  type: 'design' | 'architectural' | 'integration' | 'deployment';
  description: string;
  benefits: string[];
  drawbacks: string[];
  useCases: string[];
  complexity: 'low' | 'medium' | 'high';
  popularity: number;
  detected: boolean;
}

interface ArchitectureRecommendation {
  id: string;
  title: string;
  description: string;
  category: 'scalability' | 'security' | 'performance' | 'maintainability' | 'reliability';
  priority: 'critical' | 'high' | 'medium' | 'low';
  impact: 'high' | 'medium' | 'low';
  effort: 'easy' | 'moderate' | 'complex';
  reasoning: string;
  implementation: string[];
  patterns: string[];
  estimatedBenefit: string;
}

interface ArchitectureMetrics {
  complexity: number;
  maintainability: number;
  scalability: number;
  security: number;
  performance: number;
  testability: number;
  overallScore: number;
}

interface CodebaseAnalysis {
  totalFiles: number;
  linesOfCode: number;
  languages: { [key: string]: number };
  dependencies: number;
  cyclomatic: number;
  coupling: number;
  cohesion: number;
}

export function ArchitectureAdvisorAgent() {
  const status = useAgentStatus(AGENT_TYPES.ARCHITECTURE_ADVISOR);
  const error = useAgentError(AGENT_TYPES.ARCHITECTURE_ADVISOR);
  const isExecuting = useIsAgentExecuting(AGENT_TYPES.ARCHITECTURE_ADVISOR);
  const metrics = useAgentMetrics(AGENT_TYPES.ARCHITECTURE_ADVISOR);
  const taskHistory = useAgentTaskHistory(AGENT_TYPES.ARCHITECTURE_ADVISOR);
  const { executeAgent, fetchAgentStatus } = useAgentStore();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'analyze' | 'patterns' | 'recommendations'>('dashboard');
  const [analysisType, setAnalysisType] = useState<'full' | 'quick' | 'focused' | 'security'>('quick');
  const [selectedComponents, setSelectedComponents] = useState<string[]>(['backend', 'frontend', 'database']);
  const [analysisTarget, setAnalysisTarget] = useState('');

  // Mock data for demonstration
  const [architectureMetrics] = useState<ArchitectureMetrics>({
    complexity: 72,
    maintainability: 85,
    scalability: 68,
    security: 78,
    performance: 82,
    testability: 75,
    overallScore: 77
  });

  const [codebaseAnalysis] = useState<CodebaseAnalysis>({
    totalFiles: 247,
    linesOfCode: 45230,
    languages: {
      'TypeScript': 65,
      'Python': 25,
      'JavaScript': 8,
      'CSS': 2
    },
    dependencies: 89,
    cyclomatic: 3.2,
    coupling: 0.45,
    cohesion: 0.78
  });

  const [detectedPatterns] = useState<ArchitecturePattern[]>([
    {
      id: '1',
      name: 'Model-View-Controller (MVC)',
      type: 'architectural',
      description: 'Separates application logic into three interconnected components',
      benefits: ['Clear separation of concerns', 'Easier testing', 'Reusable components'],
      drawbacks: ['Can become complex', 'Potential performance overhead'],
      useCases: ['Web applications', 'Desktop applications', 'API development'],
      complexity: 'medium',
      popularity: 85,
      detected: true
    },
    {
      id: '2',
      name: 'Repository Pattern',
      type: 'design',
      description: 'Encapsulates data access logic and provides a uniform interface',
      benefits: ['Testability', 'Flexibility', 'Centralized data access'],
      drawbacks: ['Additional abstraction layer', 'Potential over-engineering'],
      useCases: ['Data-driven applications', 'Complex business logic'],
      complexity: 'medium',
      popularity: 78,
      detected: true
    },
    {
      id: '3',
      name: 'Microservices Architecture',
      type: 'architectural',
      description: 'Structures application as a collection of loosely coupled services',
      benefits: ['Scalability', 'Technology diversity', 'Independent deployment'],
      drawbacks: ['Complexity', 'Network overhead', 'Data consistency challenges'],
      useCases: ['Large-scale applications', 'Team autonomy', 'Cloud-native apps'],
      complexity: 'high',
      popularity: 72,
      detected: false
    },
    {
      id: '4',
      name: 'Observer Pattern',
      type: 'design',
      description: 'Defines a subscription mechanism to notify multiple objects',
      benefits: ['Loose coupling', 'Dynamic relationships', 'Event-driven architecture'],
      drawbacks: ['Memory leaks potential', 'Debugging complexity'],
      useCases: ['Event systems', 'Real-time updates', 'State management'],
      complexity: 'low',
      popularity: 88,
      detected: true
    }
  ]);

  const [recommendations] = useState<ArchitectureRecommendation[]>([
    {
      id: '1',
      title: 'Implement API Gateway Pattern',
      description: 'Introduce a centralized entry point for all client requests to improve security and monitoring.',
      category: 'scalability',
      priority: 'high',
      impact: 'high',
      effort: 'moderate',
      reasoning: 'Current architecture has multiple direct service endpoints, creating security and monitoring challenges.',
      implementation: [
        'Set up API Gateway service (Kong, AWS API Gateway, or Nginx)',
        'Configure routing rules for existing services',
        'Implement authentication and rate limiting',
        'Add request/response logging and monitoring',
        'Update client applications to use gateway endpoint'
      ],
      patterns: ['API Gateway', 'Backend for Frontend'],
      estimatedBenefit: 'Improved security, better monitoring, easier scaling'
    },
    {
      id: '2',
      title: 'Adopt Event-Driven Architecture',
      description: 'Implement asynchronous communication between services using events to improve scalability.',
      category: 'scalability',
      priority: 'medium',
      impact: 'high',
      effort: 'complex',
      reasoning: 'Current synchronous communication creates tight coupling and limits scalability.',
      implementation: [
        'Choose event streaming platform (Apache Kafka, RabbitMQ, or AWS EventBridge)',
        'Define event schemas and contracts',
        'Implement event publishers in existing services',
        'Create event consumers for business logic',
        'Add event sourcing for critical data'
      ],
      patterns: ['Event Sourcing', 'CQRS', 'Publish-Subscribe'],
      estimatedBenefit: 'Better scalability, improved resilience, loose coupling'
    },
    {
      id: '3',
      title: 'Implement Circuit Breaker Pattern',
      description: 'Add circuit breakers to prevent cascade failures and improve system resilience.',
      category: 'reliability',
      priority: 'high',
      impact: 'medium',
      effort: 'easy',
      reasoning: 'System lacks protection against service failures, risking cascade failures.',
      implementation: [
        'Install circuit breaker library (Hystrix, Resilience4j)',
        'Identify critical service dependencies',
        'Configure circuit breaker thresholds',
        'Implement fallback mechanisms',
        'Add monitoring and alerting'
      ],
      patterns: ['Circuit Breaker', 'Bulkhead', 'Timeout'],
      estimatedBenefit: 'Improved fault tolerance, better user experience'
    },
    {
      id: '4',
      title: 'Enhance Security with Zero Trust Architecture',
      description: 'Implement zero trust principles to improve security posture.',
      category: 'security',
      priority: 'critical',
      impact: 'high',
      effort: 'complex',
      reasoning: 'Current security model relies on network perimeter, which is insufficient for modern threats.',
      implementation: [
        'Implement service-to-service authentication',
        'Add encryption for all internal communications',
        'Deploy network segmentation',
        'Implement continuous security monitoring',
        'Add identity and access management (IAM)'
      ],
      patterns: ['Zero Trust', 'Defense in Depth', 'Least Privilege'],
      estimatedBenefit: 'Enhanced security, compliance readiness, reduced attack surface'
    }
  ]);

  const handleStartAnalysis = async () => {
    try {
      await executeAgent(AGENT_TYPES.ARCHITECTURE_ADVISOR, {
        action: 'analyze_architecture',
        type: analysisType,
        components: selectedComponents,
        target: analysisTarget
      });
    } catch (err) {
      console.error('Architecture analysis failed:', err);
    }
  };

  const handleApplyRecommendation = async (recommendationId: string) => {
    try {
      await executeAgent(AGENT_TYPES.ARCHITECTURE_ADVISOR, {
        action: 'apply_recommendation',
        recommendation_id: recommendationId
      });
    } catch (err) {
      console.error('Recommendation application failed:', err);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'scalability': return <TrendingUp className="w-4 h-4" />;
      case 'security': return <Shield className="w-4 h-4" />;
      case 'performance': return <Zap className="w-4 h-4" />;
      case 'maintainability': return <Code className="w-4 h-4" />;
      case 'reliability': return <CheckCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="h-full bg-gradient-to-br from-purple-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl text-white">
              <Layers className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Architecture Advisor</h1>
              <p className="text-gray-600">Intelligent architecture analysis and design recommendations</p>
            </div>
          </div>

          {/* Status Bar */}
          <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-3 h-3 rounded-full",
                status?.status === 'idle' ? 'bg-green-500' : 
                status?.status === 'busy' ? 'bg-yellow-500' : 'bg-gray-400'
              )} />
              <span className="text-sm font-medium">
                {status?.status === 'idle' ? 'Ready' : 
                 status?.status === 'busy' ? 'Analyzing...' : 'Offline'}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Architecture Score: <span className={cn(
                "font-bold",
                getScoreColor(architectureMetrics.overallScore)
              )}>{architectureMetrics.overallScore}/100</span>
            </div>
            <div className="text-sm text-gray-500">
              Patterns Detected: <span className="font-bold text-purple-600">
                {detectedPatterns.filter(p => p.detected).length}
              </span>
            </div>
            {isExecuting && (
              <div className="flex items-center gap-2 text-purple-600">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-sm">Analyzing...</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-white p-1 rounded-xl shadow-sm">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Building2 },
            { id: 'analyze', label: 'Analyze', icon: Search },
            { id: 'patterns', label: 'Patterns', icon: GitBranch },
            { id: 'recommendations', label: 'Recommendations', icon: Lightbulb }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
                activeTab === tab.id
                  ? "bg-purple-500 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Architecture Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(architectureMetrics).filter(([key]) => key !== 'overallScore').map(([key, value]) => (
                <div key={key} className="bg-white rounded-xl p-6 shadow-sm border">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 capitalize">{key}</h3>
                    <div className={cn("text-2xl font-bold", getScoreColor(value))}>
                      {value}
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className={cn(
                        "h-2 rounded-full transition-all",
                        value >= 80 ? 'bg-green-500' :
                        value >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      )}
                      style={{ width: `${value}%` }}
                    />
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    {value >= 80 ? 'Excellent' : value >= 60 ? 'Good' : 'Needs Improvement'}
                  </div>
                </div>
              ))}
            </div>

            {/* Codebase Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Codebase Analysis</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Files</span>
                    <span className="font-semibold">{codebaseAnalysis.totalFiles.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Lines of Code</span>
                    <span className="font-semibold">{codebaseAnalysis.linesOfCode.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Dependencies</span>
                    <span className="font-semibold">{codebaseAnalysis.dependencies}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Cyclomatic Complexity</span>
                    <span className={cn(
                      "font-semibold",
                      codebaseAnalysis.cyclomatic <= 3 ? 'text-green-600' :
                      codebaseAnalysis.cyclomatic <= 5 ? 'text-yellow-600' : 'text-red-600'
                    )}>
                      {codebaseAnalysis.cyclomatic}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Language Distribution</h2>
                
                <div className="space-y-3">
                  {Object.entries(codebaseAnalysis.languages).map(([language, percentage]) => (
                    <div key={language}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-700">{language}</span>
                        <span className="text-sm font-medium">{percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 bg-purple-500 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Recommendations Preview */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center gap-3 mb-6">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                <h2 className="text-xl font-bold text-gray-900">Priority Recommendations</h2>
              </div>
              
              <div className="space-y-4">
                {recommendations.filter(r => r.priority === 'critical' || r.priority === 'high').slice(0, 3).map((rec) => (
                  <div key={rec.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getCategoryIcon(rec.category)}
                          <h3 className="font-semibold text-gray-900">{rec.title}</h3>
                          <span className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium border",
                            getPriorityColor(rec.priority)
                          )}>
                            {rec.priority.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                        <div className="text-sm text-green-600 font-medium">
                          {rec.estimatedBenefit}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleApplyRecommendation(rec.id)}
                        className="ml-4 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analyze' && (
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Architecture Analysis</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Analysis Type
                </label>
                <select
                  value={analysisType}
                  onChange={(e) => setAnalysisType(e.target.value as any)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="quick">Quick Analysis (10 min)</option>
                  <option value="full">Full Analysis (45 min)</option>
                  <option value="focused">Focused Analysis</option>
                  <option value="security">Security-Focused Analysis</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Component (Optional)
                </label>
                <input
                  type="text"
                  value={analysisTarget}
                  onChange={(e) => setAnalysisTarget(e.target.value)}
                  placeholder="e.g., user-service, payment-module"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Components to Analyze
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['backend', 'frontend', 'database', 'api', 'infrastructure', 'security'].map((component) => (
                  <label key={component} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedComponents.includes(component)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedComponents([...selectedComponents, component]);
                        } else {
                          setSelectedComponents(selectedComponents.filter(c => c !== component));
                        }
                      }}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700 capitalize">{component}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={handleStartAnalysis}
              disabled={isExecuting}
              className="flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isExecuting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Start Analysis
                </>
              )}
            </button>
          </div>
        )}

        {activeTab === 'patterns' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Detected Architecture Patterns</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {detectedPatterns.map((pattern) => (
                  <div key={pattern.id} className={cn(
                    "border rounded-lg p-6 transition-all",
                    pattern.detected ? 'border-green-200 bg-green-50' : 'border-gray-200'
                  )}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{pattern.name}</h3>
                          {pattern.detected && <CheckCircle className="w-5 h-5 text-green-500" />}
                        </div>
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-sm text-gray-500 capitalize">{pattern.type} Pattern</span>
                          <span className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            getComplexityColor(pattern.complexity)
                          )}>
                            {pattern.complexity.toUpperCase()} COMPLEXITY
                          </span>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500" />
                            <span className="text-xs text-gray-600">{pattern.popularity}%</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">{pattern.description}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-green-700 mb-1">Benefits:</h4>
                        <ul className="text-sm text-gray-600 list-disc list-inside">
                          {pattern.benefits.map((benefit, index) => (
                            <li key={index}>{benefit}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-red-700 mb-1">Drawbacks:</h4>
                        <ul className="text-sm text-gray-600 list-disc list-inside">
                          {pattern.drawbacks.map((drawback, index) => (
                            <li key={index}>{drawback}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-blue-700 mb-1">Use Cases:</h4>
                        <div className="flex flex-wrap gap-2">
                          {pattern.useCases.map((useCase, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                              {useCase}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Architecture Recommendations</h2>
              
              <div className="space-y-6">
                {recommendations.map((rec) => (
                  <div key={rec.id} className="border rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getCategoryIcon(rec.category)}
                          <h3 className="text-lg font-semibold text-gray-900">{rec.title}</h3>
                          <span className={cn(
                            "px-3 py-1 rounded-full text-sm font-medium border",
                            getPriorityColor(rec.priority)
                          )}>
                            {rec.priority.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-4">{rec.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Reasoning:</h4>
                            <p className="text-sm text-gray-600">{rec.reasoning}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Expected Benefit:</h4>
                            <p className="text-sm text-green-600 font-medium">{rec.estimatedBenefit}</p>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">Related Patterns:</h4>
                          <div className="flex flex-wrap gap-2">
                            {rec.patterns.map((pattern, index) => (
                              <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm">
                                {pattern}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleApplyRecommendation(rec.id)}
                        className="ml-4 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Implementation Steps:</h4>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                        {rec.implementation.map((step, index) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <XCircle className="w-4 h-4" />
              <span className="font-medium">Error:</span>
              <span>{error}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}