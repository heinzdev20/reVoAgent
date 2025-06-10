import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Star, 
  Shield, 
  Globe, 
  Code, 
  Database, 
  Cloud,
  Zap,
  CheckCircle,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

interface MCPServer {
  id: string;
  name: string;
  description: string;
  category: string;
  provider: string;
  version: string;
  rating: number;
  downloads: number;
  status: 'available' | 'installed' | 'updating';
  certified: boolean;
  security_score: number;
  tools: string[];
  documentation_url: string;
  github_url: string;
  last_updated: string;
}

export const MCPMarketplace: React.FC = () => {
  const [servers, setServers] = useState<MCPServer[]>([
    {
      id: 'filesystem',
      name: 'File System Tools',
      description: 'Comprehensive file system operations including read, write, search, and directory management',
      category: 'System',
      provider: 'MCP Core Team',
      version: '1.2.0',
      rating: 4.8,
      downloads: 15420,
      status: 'installed',
      certified: true,
      security_score: 95,
      tools: ['read_file', 'write_file', 'list_directory', 'search_files'],
      documentation_url: 'https://docs.mcp.dev/filesystem',
      github_url: 'https://github.com/mcp/filesystem-server',
      last_updated: '2024-01-15'
    },
    {
      id: 'web-search',
      name: 'Web Search & Scraping',
      description: 'Advanced web search capabilities with content extraction and analysis',
      category: 'Web',
      provider: 'WebTools Inc',
      version: '2.1.3',
      rating: 4.6,
      downloads: 12890,
      status: 'available',
      certified: true,
      security_score: 88,
      tools: ['search_web', 'scrape_page', 'extract_content', 'analyze_seo'],
      documentation_url: 'https://docs.webtools.com/mcp',
      github_url: 'https://github.com/webtools/mcp-server',
      last_updated: '2024-01-10'
    },
    {
      id: 'database-tools',
      name: 'Database Operations',
      description: 'Multi-database support for SQL and NoSQL operations with query optimization',
      category: 'Database',
      provider: 'DataFlow Systems',
      version: '1.8.2',
      rating: 4.7,
      downloads: 8950,
      status: 'available',
      certified: true,
      security_score: 92,
      tools: ['execute_query', 'schema_analysis', 'data_migration', 'performance_tuning'],
      documentation_url: 'https://docs.dataflow.com/mcp',
      github_url: 'https://github.com/dataflow/mcp-database',
      last_updated: '2024-01-08'
    },
    {
      id: 'ai-models',
      name: 'AI Model Integration',
      description: 'Seamless integration with multiple AI models and providers',
      category: 'AI/ML',
      provider: 'AI Collective',
      version: '3.0.1',
      rating: 4.9,
      downloads: 22100,
      status: 'updating',
      certified: true,
      security_score: 96,
      tools: ['model_inference', 'batch_processing', 'model_comparison', 'fine_tuning'],
      documentation_url: 'https://docs.aicollective.com/mcp',
      github_url: 'https://github.com/ai-collective/mcp-models',
      last_updated: '2024-01-12'
    },
    {
      id: 'cloud-services',
      name: 'Cloud Platform Tools',
      description: 'Multi-cloud platform management and deployment automation',
      category: 'Cloud',
      provider: 'CloudOps Pro',
      version: '1.5.0',
      rating: 4.4,
      downloads: 6780,
      status: 'available',
      certified: false,
      security_score: 78,
      tools: ['deploy_service', 'manage_resources', 'monitor_costs', 'auto_scaling'],
      documentation_url: 'https://docs.cloudops.pro/mcp',
      github_url: 'https://github.com/cloudops/mcp-cloud',
      last_updated: '2024-01-05'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('rating');

  const categories = ['all', 'System', 'Web', 'Database', 'AI/ML', 'Cloud', 'Security', 'Development'];

  const filteredServers = servers
    .filter(server => 
      server.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      server.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      server.tools.some(tool => tool.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .filter(server => selectedCategory === 'all' || server.category === selectedCategory)
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'downloads':
          return b.downloads - a.downloads;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'updated':
          return new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime();
        default:
          return 0;
      }
    });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'System':
        return <Code className="w-5 h-5" />;
      case 'Web':
        return <Globe className="w-5 h-5" />;
      case 'Database':
        return <Database className="w-5 h-5" />;
      case 'AI/ML':
        return <Zap className="w-5 h-5" />;
      case 'Cloud':
        return <Cloud className="w-5 h-5" />;
      default:
        return <Code className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'installed':
        return 'bg-green-100 text-green-800';
      case 'updating':
        return 'bg-blue-100 text-blue-800';
      case 'available':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleInstall = (serverId: string) => {
    setServers(prev => prev.map(server => 
      server.id === serverId 
        ? { ...server, status: 'updating' as any }
        : server
    ));

    // Simulate installation
    setTimeout(() => {
      setServers(prev => prev.map(server => 
        server.id === serverId 
          ? { ...server, status: 'installed' as any }
          : server
      ));
    }, 2000);
  };

  const handleUninstall = (serverId: string) => {
    setServers(prev => prev.map(server => 
      server.id === serverId 
        ? { ...server, status: 'available' as any }
        : server
    ));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">MCP Marketplace</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Shield className="w-4 h-4" />
          <span>{servers.filter(s => s.certified).length} Certified Servers</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search servers, tools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="rating">Sort by Rating</option>
            <option value="downloads">Sort by Downloads</option>
            <option value="name">Sort by Name</option>
            <option value="updated">Sort by Updated</option>
          </select>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">{filteredServers.length} servers</span>
          </div>
        </div>
      </div>

      {/* Server Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredServers.map((server) => (
          <div key={server.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                {getCategoryIcon(server.category)}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <span>{server.name}</span>
                    {server.certified && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </h3>
                  <p className="text-sm text-gray-600">{server.provider} • v{server.version}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(server.status)}`}>
                {server.status}
              </span>
            </div>

            <p className="text-gray-700 mb-4">{server.description}</p>

            {/* Tools */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Available Tools:</h4>
              <div className="flex flex-wrap gap-1">
                {server.tools.map((tool) => (
                  <span key={tool} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                    {tool}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
              <div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="font-medium">{server.rating}</span>
                </div>
                <span className="text-gray-600">Rating</span>
              </div>
              <div>
                <div className="flex items-center space-x-1">
                  <Download className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">{server.downloads.toLocaleString()}</span>
                </div>
                <span className="text-gray-600">Downloads</span>
              </div>
              <div>
                <div className="flex items-center space-x-1">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span className="font-medium">{server.security_score}%</span>
                </div>
                <span className="text-gray-600">Security</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <a
                  href={server.documentation_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Docs</span>
                </a>
                <a
                  href={server.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 text-sm"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>GitHub</span>
                </a>
              </div>

              <div className="flex space-x-2">
                {server.status === 'available' && (
                  <button
                    onClick={() => handleInstall(server.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                  >
                    Install
                  </button>
                )}
                {server.status === 'installed' && (
                  <button
                    onClick={() => handleUninstall(server.id)}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm"
                  >
                    Uninstall
                  </button>
                )}
                {server.status === 'updating' && (
                  <button
                    disabled
                    className="px-4 py-2 bg-gray-100 text-gray-500 rounded-md text-sm cursor-not-allowed"
                  >
                    Installing...
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredServers.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No servers found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or browse different categories.</p>
        </div>
      )}
    </div>
  );
};