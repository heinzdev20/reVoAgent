/**
 * 📚 Documentation Agent - Professional Code Documentation & Generation
 * Automated documentation creation with AI-powered insights
 */

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  BookOpen, 
  Edit3, 
  Eye, 
  Download, 
  Upload, 
  RefreshCw,
  Search,
  Filter,
  Code,
  GitBranch,
  Layers,
  Tag,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
  Play,
  Square,
  Settings,
  Zap,
  FileCode,
  Globe,
  Database,
  Package,
  Users,
  Star,
  TrendingUp
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

interface DocumentationItem {
  id: string;
  title: string;
  type: 'api' | 'readme' | 'guide' | 'reference' | 'tutorial' | 'changelog';
  status: 'generated' | 'reviewed' | 'published' | 'outdated';
  file: string;
  lastUpdated: string;
  coverage: number;
  wordCount: number;
  language: string;
}

interface DocumentationMetrics {
  totalDocs: number;
  coverage: number;
  outdatedDocs: number;
  avgQuality: number;
  lastGenerated: string;
}

export function DocumentationAgent() {
  const status = useAgentStatus(AGENT_TYPES.CODE_GENERATOR); // Using code generator for now
  const error = useAgentError(AGENT_TYPES.CODE_GENERATOR);
  const isExecuting = useIsAgentExecuting(AGENT_TYPES.CODE_GENERATOR);
  const metrics = useAgentMetrics(AGENT_TYPES.CODE_GENERATOR);
  const taskHistory = useAgentTaskHistory(AGENT_TYPES.CODE_GENERATOR);
  const { executeAgent, fetchAgentStatus } = useAgentStore();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'generate' | 'documents' | 'templates'>('dashboard');
  const [docType, setDocType] = useState<'api' | 'readme' | 'guide' | 'reference'>('readme');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [generationOptions, setGenerationOptions] = useState({
    includeExamples: true,
    includeTypes: true,
    includeTests: false,
    format: 'markdown',
    language: 'english'
  });

  // Mock data for demonstration
  const [docMetrics] = useState<DocumentationMetrics>({
    totalDocs: 24,
    coverage: 78,
    outdatedDocs: 3,
    avgQuality: 8.7,
    lastGenerated: '1 hour ago'
  });

  const [documents] = useState<DocumentationItem[]>([
    {
      id: '1',
      title: 'API Reference Documentation',
      type: 'api',
      status: 'published',
      file: 'docs/api/reference.md',
      lastUpdated: '2 hours ago',
      coverage: 95,
      wordCount: 3420,
      language: 'english'
    },
    {
      id: '2',
      title: 'Getting Started Guide',
      type: 'guide',
      status: 'reviewed',
      file: 'docs/guides/getting-started.md',
      lastUpdated: '1 day ago',
      coverage: 88,
      wordCount: 1850,
      language: 'english'
    },
    {
      id: '3',
      title: 'README.md',
      type: 'readme',
      status: 'outdated',
      file: 'README.md',
      lastUpdated: '1 week ago',
      coverage: 65,
      wordCount: 890,
      language: 'english'
    },
    {
      id: '4',
      title: 'Installation Tutorial',
      type: 'tutorial',
      status: 'generated',
      file: 'docs/tutorials/installation.md',
      lastUpdated: '3 hours ago',
      coverage: 92,
      wordCount: 2100,
      language: 'english'
    }
  ]);

  useEffect(() => {
    fetchAgentStatus(AGENT_TYPES.CODE_GENERATOR);
  }, [fetchAgentStatus]);

  const handleGenerateDocumentation = async () => {
    try {
      await executeAgent(AGENT_TYPES.CODE_GENERATOR, {
        description: `Generate ${docType} documentation`,
        parameters: {
          doc_type: docType,
          files: selectedFiles,
          options: generationOptions,
          output_format: generationOptions.format
        }
      });
    } catch (error) {
      console.error('Failed to generate documentation:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'text-green-700 bg-green-100 border-green-200';
      case 'reviewed':
        return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'generated':
        return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'outdated':
        return 'text-red-700 bg-red-100 border-red-200';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'api':
        return <Code className="w-4 h-4" />;
      case 'readme':
        return <FileText className="w-4 h-4" />;
      case 'guide':
        return <BookOpen className="w-4 h-4" />;
      case 'reference':
        return <Database className="w-4 h-4" />;
      case 'tutorial':
        return <Users className="w-4 h-4" />;
      case 'changelog':
        return <GitBranch className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-500 rounded-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Documentation Agent</h1>
            <p className="text-gray-600">AI-powered documentation generation and management</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {status && (
            <span className={cn(
              'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
              status.status === 'busy' ? 'text-blue-700 bg-blue-100' :
              status.status === 'idle' ? 'text-green-700 bg-green-100' :
              status.status === 'error' ? 'text-red-700 bg-red-100' :
              'text-gray-700 bg-gray-100'
            )}>
              <Activity className="w-4 h-4 mr-2" />
              {status.status === 'busy' ? 'Generating...' : 
               status.status === 'idle' ? 'Ready' :
               status.status === 'error' ? 'Error' : 'Offline'}
            </span>
          )}
          
          <button
            onClick={() => fetchAgentStatus(AGENT_TYPES.CODE_GENERATOR)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center text-red-700 mb-2">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span className="font-medium">Documentation Agent Error</span>
          </div>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Current Task */}
      {status?.current_task && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center text-blue-700 mb-2">
            <Activity className="w-5 h-5 mr-2 animate-spin" />
            <span className="font-medium">Current Task</span>
          </div>
          <p className="text-blue-600 text-sm">{status.current_task}</p>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'dashboard', label: 'Documentation Dashboard', icon: BookOpen },
            { id: 'generate', label: 'Generate Docs', icon: Zap },
            { id: 'documents', label: 'Manage Documents', icon: FileText },
            { id: 'templates', label: 'Templates', icon: Layers }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'flex items-center px-1 py-4 border-b-2 font-medium text-sm transition-colors',
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Documentation Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Documentation Coverage</p>
                  <p className="text-2xl font-bold text-gray-900">{docMetrics.coverage}%</p>
                </div>
                <div className={cn(
                  'p-3 rounded-lg',
                  docMetrics.coverage >= 80 ? 'bg-green-100' :
                  docMetrics.coverage >= 60 ? 'bg-yellow-100' : 'bg-red-100'
                )}>
                  <TrendingUp className={cn(
                    'w-6 h-6',
                    docMetrics.coverage >= 80 ? 'text-green-600' :
                    docMetrics.coverage >= 60 ? 'text-yellow-600' : 'text-red-600'
                  )} />
                </div>
              </div>
              <div className="mt-2">
                <div className={cn(
                  'w-full bg-gray-200 rounded-full h-2',
                )}>
                  <div 
                    className={cn(
                      'h-2 rounded-full',
                      docMetrics.coverage >= 80 ? 'bg-green-500' :
                      docMetrics.coverage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    )}
                    style={{ width: `${docMetrics.coverage}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Documents</p>
                  <p className="text-2xl font-bold text-blue-600">{docMetrics.totalDocs}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Across all projects</p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Quality Score</p>
                  <p className="text-2xl font-bold text-green-600">{docMetrics.avgQuality}/10</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Star className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Average quality rating</p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Outdated Docs</p>
                  <p className="text-2xl font-bold text-orange-600">{docMetrics.outdatedDocs}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Need updates</p>
            </div>
          </div>

          {/* Recent Documents */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Documents</h3>
              <button
                onClick={() => setActiveTab('documents')}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View All →
              </button>
            </div>
            <div className="space-y-3">
              {documents.slice(0, 4).map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-lg border">
                      {getTypeIcon(doc.type)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{doc.title}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{doc.file}</span>
                        <span>{doc.wordCount} words</span>
                        <span>{doc.lastUpdated}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{doc.coverage}%</span>
                    <span className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium capitalize',
                      getStatusColor(doc.status)
                    )}>
                      {doc.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Documentation Types */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Documentation Types</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { type: 'api', label: 'API Reference', count: 8, icon: Code },
                { type: 'guide', label: 'User Guides', count: 6, icon: BookOpen },
                { type: 'tutorial', label: 'Tutorials', count: 4, icon: Users },
                { type: 'readme', label: 'README Files', count: 3, icon: FileText },
                { type: 'reference', label: 'Technical Reference', count: 2, icon: Database },
                { type: 'changelog', label: 'Changelogs', count: 1, icon: GitBranch }
              ].map((item) => (
                <div key={item.type} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <item.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.label}</p>
                    <p className="text-sm text-gray-500">{item.count} documents</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'generate' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Documentation</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Documentation Type</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { id: 'readme', label: 'README', desc: 'Project overview' },
                    { id: 'api', label: 'API Docs', desc: 'API reference' },
                    { id: 'guide', label: 'User Guide', desc: 'How-to guides' },
                    { id: 'reference', label: 'Reference', desc: 'Technical docs' }
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setDocType(type.id as any)}
                      className={cn(
                        'p-4 border rounded-lg text-left transition-colors',
                        docType === type.id
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <div className="font-medium">{type.label}</div>
                      <div className="text-sm text-gray-500">{type.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Source Files</label>
                <div className="border border-gray-300 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-600">Select files to document</span>
                    <button className="text-blue-600 hover:text-blue-700 text-sm">
                      Browse Files
                    </button>
                  </div>
                  <div className="space-y-2">
                    {[
                      'src/main.py',
                      'src/api/routes.py',
                      'src/models/user.py',
                      'src/utils/helpers.py'
                    ].map((file) => (
                      <label key={file} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedFiles.includes(file)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedFiles([...selectedFiles, file]);
                            } else {
                              setSelectedFiles(selectedFiles.filter(f => f !== file));
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{file}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Generation Options</label>
                <div className="space-y-3">
                  {[
                    { key: 'includeExamples', label: 'Include Code Examples', desc: 'Add usage examples' },
                    { key: 'includeTypes', label: 'Include Type Information', desc: 'Document types and schemas' },
                    { key: 'includeTests', label: 'Include Test Examples', desc: 'Add test case examples' }
                  ].map((option) => (
                    <label key={option.key} className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={generationOptions[option.key as keyof typeof generationOptions] as boolean}
                        onChange={(e) => setGenerationOptions({
                          ...generationOptions,
                          [option.key]: e.target.checked
                        })}
                        className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{option.label}</div>
                        <div className="text-sm text-gray-500">{option.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Output Format</label>
                  <select
                    value={generationOptions.format}
                    onChange={(e) => setGenerationOptions({
                      ...generationOptions,
                      format: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="markdown">Markdown</option>
                    <option value="html">HTML</option>
                    <option value="pdf">PDF</option>
                    <option value="docx">Word Document</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select
                    value={generationOptions.language}
                    onChange={(e) => setGenerationOptions({
                      ...generationOptions,
                      language: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="english">English</option>
                    <option value="spanish">Spanish</option>
                    <option value="french">French</option>
                    <option value="german">German</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleGenerateDocumentation}
                disabled={isExecuting || selectedFiles.length === 0}
                className={cn(
                  'w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors',
                  isExecuting || selectedFiles.length === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                )}
              >
                {isExecuting ? (
                  <>
                    <Activity className="w-5 h-5 mr-2 animate-spin" />
                    Generating Documentation...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Generate {docType.charAt(0).toUpperCase() + docType.slice(1)} Documentation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Documentation Library</h3>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search documents..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option>All Types</option>
                  <option>API</option>
                  <option>Guide</option>
                  <option>README</option>
                  <option>Tutorial</option>
                </select>
                <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option>All Status</option>
                  <option>Published</option>
                  <option>Reviewed</option>
                  <option>Generated</option>
                  <option>Outdated</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {documents.map((doc) => (
                <div key={doc.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        {getTypeIcon(doc.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-gray-900">{doc.title}</h4>
                          <span className={cn(
                            'px-2 py-1 rounded-full text-xs font-medium capitalize',
                            getStatusColor(doc.status)
                          )}>
                            {doc.status}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                          <span className="flex items-center">
                            <FileCode className="w-4 h-4 mr-1" />
                            {doc.file}
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {doc.lastUpdated}
                          </span>
                          <span>{doc.wordCount} words</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">Coverage:</span>
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className={cn(
                                  'h-2 rounded-full',
                                  doc.coverage >= 80 ? 'bg-green-500' :
                                  doc.coverage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                )}
                                style={{ width: `${doc.coverage}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600">{doc.coverage}%</span>
                          </div>
                          <span className="text-sm text-gray-600 capitalize">{doc.type}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Documentation Templates</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: 'API Reference Template', type: 'api', description: 'Standard API documentation format' },
                { name: 'README Template', type: 'readme', description: 'Project overview and setup guide' },
                { name: 'User Guide Template', type: 'guide', description: 'Step-by-step user instructions' },
                { name: 'Tutorial Template', type: 'tutorial', description: 'Learning-focused documentation' },
                { name: 'Technical Reference', type: 'reference', description: 'Detailed technical specifications' },
                { name: 'Changelog Template', type: 'changelog', description: 'Version history and changes' }
              ].map((template, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      {getTypeIcon(template.type)}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{template.name}</h4>
                      <p className="text-sm text-gray-500">{template.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                      Use Template
                    </button>
                    <button className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50">
                      Preview
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}