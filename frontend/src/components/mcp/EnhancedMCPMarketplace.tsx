/**
 * Enhanced MCP Marketplace - Advanced MCP Server Management
 * Comprehensive marketplace for Model Context Protocol servers with advanced features
 */

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
  ExternalLink,
  Package,
  Trash2,
  Settings,
  Play,
  Pause,
  RefreshCw,
  TrendingUp,
  Users,
  Calendar,
  Award,
  Bookmark,
  BookmarkCheck,
  Eye,
  GitBranch,
  Heart,
  MessageSquare,
  BarChart3,
  Layers,
  Terminal,
  FileText,
  Lock,
  Unlock,
  Cpu,
  HardDrive,
  Network,
  Monitor
} from 'lucide-react';

interface MCPServer {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  category: string;
  subcategory: string;
  provider: string;
  version: string;
  rating: number;
  downloads: number;
  weeklyDownloads: number;
  status: 'available' | 'installed' | 'updating' | 'error';
  certified: boolean;
  security_score: number;
  tools: MCPTool[];
  documentation_url: string;
  github_url: string;
  homepage_url?: string;
  last_updated: string;
  created_at: string;
  license: string;
  size: number; // in MB
  dependencies: string[];
  compatibility: string[];
  screenshots: string[];
  changelog: ChangelogEntry[];
  reviews: Review[];
  tags: string[];
  featured: boolean;
  trending: boolean;
  price: number; // 0 for free
  subscription?: {
    monthly: number;
    yearly: number;
  };
}

interface MCPTool {
  name: string;
  description: string;
  parameters: any[];
  examples: string[];
}

interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

interface Review {
  id: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
}

const ENHANCED_MCP_SERVERS: MCPServer[] = [
  {
    id: 'filesystem-pro',
    name: 'File System Pro',
    description: 'Advanced file system operations with AI-powered search and organization',
    longDescription: 'A comprehensive file system management tool that provides intelligent file operations, AI-powered search capabilities, automated organization, and advanced security features. Perfect for developers and power users who need sophisticated file management.',
    category: 'System',
    subcategory: 'File Management',
    provider: 'MCP Core Team',
    version: '2.1.0',
    rating: 4.8,
    downloads: 25420,
    weeklyDownloads: 1250,
    status: 'installed',
    certified: true,
    security_score: 98,
    tools: [
      { name: 'read_file', description: 'Read file contents with encoding detection', parameters: [], examples: [] },
      { name: 'write_file', description: 'Write file with atomic operations', parameters: [], examples: [] },
      { name: 'smart_search', description: 'AI-powered file content search', parameters: [], examples: [] },
      { name: 'auto_organize', description: 'Automatically organize files by type/date', parameters: [], examples: [] }
    ],
    documentation_url: 'https://docs.mcp.dev/filesystem-pro',
    github_url: 'https://github.com/mcp/filesystem-pro',
    homepage_url: 'https://filesystem-pro.mcp.dev',
    last_updated: '2025-06-10',
    created_at: '2024-01-15',
    license: 'MIT',
    size: 12.5,
    dependencies: ['python>=3.8', 'watchdog>=2.0'],
    compatibility: ['Windows', 'macOS', 'Linux'],
    screenshots: ['/screenshots/filesystem-1.png', '/screenshots/filesystem-2.png'],
    changelog: [
      { version: '2.1.0', date: '2025-06-10', changes: ['Added AI-powered search', 'Improved performance'] },
      { version: '2.0.0', date: '2025-05-15', changes: ['Major UI overhaul', 'New auto-organize feature'] }
    ],
    reviews: [
      { id: '1', user: 'DevUser123', rating: 5, comment: 'Excellent tool, saves me hours!', date: '2025-06-08', helpful: 12 }
    ],
    tags: ['filesystem', 'ai', 'search', 'organization'],
    featured: true,
    trending: true,
    price: 0
  },
  {
    id: 'database-master',
    name: 'Database Master',
    description: 'Multi-database management with AI query optimization',
    longDescription: 'Professional database management suite supporting PostgreSQL, MySQL, MongoDB, and more. Features AI-powered query optimization, automated backup scheduling, performance monitoring, and intelligent schema suggestions.',
    category: 'Database',
    subcategory: 'Management',
    provider: 'DataTech Solutions',
    version: '3.2.1',
    rating: 4.9,
    downloads: 18750,
    weeklyDownloads: 890,
    status: 'available',
    certified: true,
    security_score: 96,
    tools: [
      { name: 'query_optimizer', description: 'AI-powered SQL query optimization', parameters: [], examples: [] },
      { name: 'schema_analyzer', description: 'Analyze and suggest schema improvements', parameters: [], examples: [] },
      { name: 'backup_manager', description: 'Automated backup and restore', parameters: [], examples: [] },
      { name: 'performance_monitor', description: 'Real-time database performance monitoring', parameters: [], examples: [] }
    ],
    documentation_url: 'https://docs.database-master.com',
    github_url: 'https://github.com/datatech/database-master',
    last_updated: '2025-06-08',
    created_at: '2024-03-20',
    license: 'Commercial',
    size: 45.2,
    dependencies: ['python>=3.9', 'sqlalchemy>=1.4'],
    compatibility: ['Windows', 'macOS', 'Linux'],
    screenshots: [],
    changelog: [],
    reviews: [],
    tags: ['database', 'sql', 'optimization', 'monitoring'],
    featured: true,
    trending: false,
    price: 29.99,
    subscription: { monthly: 9.99, yearly: 99.99 }
  },
  {
    id: 'ai-code-assistant',
    name: 'AI Code Assistant',
    description: 'Intelligent code generation, review, and refactoring assistant',
    longDescription: 'Advanced AI-powered coding assistant that provides intelligent code generation, automated code reviews, refactoring suggestions, and bug detection. Supports 20+ programming languages with context-aware suggestions.',
    category: 'Development',
    subcategory: 'Code Generation',
    provider: 'AI Dev Tools',
    version: '1.8.3',
    rating: 4.7,
    downloads: 32100,
    weeklyDownloads: 2100,
    status: 'available',
    certified: true,
    security_score: 94,
    tools: [
      { name: 'generate_code', description: 'Generate code from natural language', parameters: [], examples: [] },
      { name: 'review_code', description: 'Automated code review and suggestions', parameters: [], examples: [] },
      { name: 'refactor_code', description: 'Intelligent code refactoring', parameters: [], examples: [] },
      { name: 'detect_bugs', description: 'AI-powered bug detection', parameters: [], examples: [] }
    ],
    documentation_url: 'https://ai-code-assistant.dev/docs',
    github_url: 'https://github.com/aidevtools/code-assistant',
    last_updated: '2025-06-09',
    created_at: '2024-02-10',
    license: 'Apache 2.0',
    size: 78.9,
    dependencies: ['python>=3.10', 'transformers>=4.0'],
    compatibility: ['Windows', 'macOS', 'Linux'],
    screenshots: [],
    changelog: [],
    reviews: [],
    tags: ['ai', 'code', 'generation', 'review'],
    featured: true,
    trending: true,
    price: 0
  },
  {
    id: 'security-scanner',
    name: 'Security Scanner Pro',
    description: 'Comprehensive security vulnerability scanner and analyzer',
    longDescription: 'Enterprise-grade security scanner that performs comprehensive vulnerability assessments, compliance checks, and security audits. Features real-time threat detection and automated remediation suggestions.',
    category: 'Security',
    subcategory: 'Vulnerability Scanning',
    provider: 'SecureTech Inc',
    version: '4.1.2',
    rating: 4.9,
    downloads: 15600,
    weeklyDownloads: 650,
    status: 'available',
    certified: true,
    security_score: 99,
    tools: [
      { name: 'vulnerability_scan', description: 'Comprehensive vulnerability scanning', parameters: [], examples: [] },
      { name: 'compliance_check', description: 'Automated compliance verification', parameters: [], examples: [] },
      { name: 'threat_detection', description: 'Real-time threat detection', parameters: [], examples: [] },
      { name: 'security_audit', description: 'Complete security audit report', parameters: [], examples: [] }
    ],
    documentation_url: 'https://security-scanner.pro/docs',
    github_url: 'https://github.com/securetech/security-scanner',
    last_updated: '2025-06-07',
    created_at: '2024-01-05',
    license: 'Commercial',
    size: 156.7,
    dependencies: ['python>=3.9', 'nmap>=7.0'],
    compatibility: ['Windows', 'macOS', 'Linux'],
    screenshots: [],
    changelog: [],
    reviews: [],
    tags: ['security', 'vulnerability', 'scanning', 'compliance'],
    featured: false,
    trending: true,
    price: 49.99,
    subscription: { monthly: 19.99, yearly: 199.99 }
  },
  {
    id: 'cloud-orchestrator',
    name: 'Cloud Orchestrator',
    description: 'Multi-cloud deployment and management platform',
    longDescription: 'Powerful cloud orchestration platform that simplifies multi-cloud deployments, automates infrastructure provisioning, and provides unified management across AWS, Azure, GCP, and other cloud providers.',
    category: 'Cloud',
    subcategory: 'Orchestration',
    provider: 'CloudOps Solutions',
    version: '2.5.0',
    rating: 4.6,
    downloads: 12300,
    weeklyDownloads: 420,
    status: 'available',
    certified: true,
    security_score: 95,
    tools: [
      { name: 'deploy_infrastructure', description: 'Deploy infrastructure across clouds', parameters: [], examples: [] },
      { name: 'manage_resources', description: 'Unified resource management', parameters: [], examples: [] },
      { name: 'cost_optimizer', description: 'Cloud cost optimization', parameters: [], examples: [] },
      { name: 'monitoring_setup', description: 'Automated monitoring setup', parameters: [], examples: [] }
    ],
    documentation_url: 'https://cloud-orchestrator.io/docs',
    github_url: 'https://github.com/cloudops/orchestrator',
    last_updated: '2025-06-05',
    created_at: '2024-04-12',
    license: 'MIT',
    size: 89.4,
    dependencies: ['python>=3.9', 'terraform>=1.0'],
    compatibility: ['Windows', 'macOS', 'Linux'],
    screenshots: [],
    changelog: [],
    reviews: [],
    tags: ['cloud', 'orchestration', 'deployment', 'multi-cloud'],
    featured: false,
    trending: false,
    price: 0
  },
  {
    id: 'data-analytics-suite',
    name: 'Data Analytics Suite',
    description: 'Advanced data analytics and visualization platform',
    longDescription: 'Comprehensive data analytics platform with machine learning capabilities, interactive visualizations, and automated insights generation. Perfect for data scientists and business analysts.',
    category: 'Analytics',
    subcategory: 'Data Science',
    provider: 'Analytics Pro',
    version: '3.0.1',
    rating: 4.8,
    downloads: 21500,
    weeklyDownloads: 980,
    status: 'available',
    certified: true,
    security_score: 93,
    tools: [
      { name: 'data_processor', description: 'Advanced data processing and cleaning', parameters: [], examples: [] },
      { name: 'ml_modeler', description: 'Machine learning model builder', parameters: [], examples: [] },
      { name: 'visualizer', description: 'Interactive data visualization', parameters: [], examples: [] },
      { name: 'insight_generator', description: 'Automated insights generation', parameters: [], examples: [] }
    ],
    documentation_url: 'https://analytics-suite.com/docs',
    github_url: 'https://github.com/analyticspro/suite',
    last_updated: '2025-06-06',
    created_at: '2024-02-28',
    license: 'Commercial',
    size: 234.6,
    dependencies: ['python>=3.10', 'pandas>=1.5', 'scikit-learn>=1.0'],
    compatibility: ['Windows', 'macOS', 'Linux'],
    screenshots: [],
    changelog: [],
    reviews: [],
    tags: ['analytics', 'data-science', 'ml', 'visualization'],
    featured: true,
    trending: false,
    price: 39.99,
    subscription: { monthly: 14.99, yearly: 149.99 }
  }
];

const CATEGORIES = [
  { id: 'all', name: 'All Categories', icon: <Package className="w-4 h-4" /> },
  { id: 'System', name: 'System Tools', icon: <Terminal className="w-4 h-4" /> },
  { id: 'Development', name: 'Development', icon: <Code className="w-4 h-4" /> },
  { id: 'Database', name: 'Database', icon: <Database className="w-4 h-4" /> },
  { id: 'Security', name: 'Security', icon: <Shield className="w-4 h-4" /> },
  { id: 'Cloud', name: 'Cloud', icon: <Cloud className="w-4 h-4" /> },
  { id: 'Analytics', name: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'AI/ML', name: 'AI & ML', icon: <Zap className="w-4 h-4" /> }
];

interface ServerCardProps {
  server: MCPServer;
  onInstall: (serverId: string) => void;
  onUninstall: (serverId: string) => void;
  onViewDetails: (server: MCPServer) => void;
  onToggleBookmark: (serverId: string) => void;
  isBookmarked: boolean;
}

const ServerCard: React.FC<ServerCardProps> = ({ 
  server, 
  onInstall, 
  onUninstall, 
  onViewDetails, 
  onToggleBookmark,
  isBookmarked 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'installed': return 'text-green-400';
      case 'updating': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'installed': return <CheckCircle className="w-4 h-4" />;
      case 'updating': return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      default: return <Download className="w-4 h-4" />;
    }
  };

  const formatDownloads = (downloads: number) => {
    if (downloads >= 1000000) return `${(downloads / 1000000).toFixed(1)}M`;
    if (downloads >= 1000) return `${(downloads / 1000).toFixed(1)}K`;
    return downloads.toString();
  };

  return (
    <div className="group bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
              {server.name}
            </h3>
            {server.certified && (
              <div className="bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded-full border border-blue-500/30">
                <Shield className="w-3 h-3 inline mr-1" />
                Certified
              </div>
            )}
            {server.featured && (
              <div className="bg-yellow-500/20 text-yellow-300 text-xs px-2 py-1 rounded-full border border-yellow-500/30">
                <Award className="w-3 h-3 inline mr-1" />
                Featured
              </div>
            )}
            {server.trending && (
              <div className="bg-green-500/20 text-green-300 text-xs px-2 py-1 rounded-full border border-green-500/30">
                <TrendingUp className="w-3 h-3 inline mr-1" />
                Trending
              </div>
            )}
          </div>
          <p className="text-sm text-gray-400 line-clamp-2 mb-2">
            {server.description}
          </p>
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span>{server.provider}</span>
            <span>v{server.version}</span>
            <span>{server.size}MB</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onToggleBookmark(server.id)}
            className={`p-2 rounded-lg transition-colors ${
              isBookmarked 
                ? 'text-yellow-400 bg-yellow-500/20' 
                : 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10'
            }`}
          >
            {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          </button>
          <div className={`flex items-center space-x-1 ${getStatusColor(server.status)}`}>
            {getStatusIcon(server.status)}
            <span className="text-xs capitalize">{server.status}</span>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 text-yellow-400 mb-1">
            <Star className="w-4 h-4 fill-current" />
            <span className="font-semibold">{server.rating}</span>
          </div>
          <div className="text-xs text-gray-500">Rating</div>
        </div>
        <div className="text-center">
          <div className="text-blue-400 font-semibold mb-1">
            {formatDownloads(server.downloads)}
          </div>
          <div className="text-xs text-gray-500">Downloads</div>
        </div>
        <div className="text-center">
          <div className="text-green-400 font-semibold mb-1">
            {server.security_score}%
          </div>
          <div className="text-xs text-gray-500">Security</div>
        </div>
      </div>

      {/* Tools Preview */}
      <div className="mb-4">
        <div className="text-xs text-gray-400 mb-2">Tools ({server.tools.length})</div>
        <div className="flex flex-wrap gap-1">
          {server.tools.slice(0, 3).map((tool, index) => (
            <span key={index} className="text-xs bg-gray-700/50 text-gray-300 px-2 py-1 rounded">
              {tool.name}
            </span>
          ))}
          {server.tools.length > 3 && (
            <span className="text-xs text-gray-400">
              +{server.tools.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Price */}
      <div className="mb-4">
        {server.price === 0 ? (
          <div className="text-green-400 font-semibold">Free</div>
        ) : (
          <div className="space-y-1">
            <div className="text-white font-semibold">${server.price}</div>
            {server.subscription && (
              <div className="text-xs text-gray-400">
                or ${server.subscription.monthly}/month
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-2">
        {server.status === 'installed' ? (
          <>
            <button
              onClick={() => onUninstall(server.id)}
              className="flex-1 px-4 py-2 bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
            >
              <Trash2 className="w-4 h-4 inline mr-2" />
              Uninstall
            </button>
            <button className="px-4 py-2 bg-green-500/20 text-green-300 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors text-sm">
              <Settings className="w-4 h-4 inline mr-2" />
              Configure
            </button>
          </>
        ) : (
          <button
            onClick={() => onInstall(server.id)}
            disabled={server.status === 'updating'}
            className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm"
          >
            {server.status === 'updating' ? (
              <>
                <RefreshCw className="w-4 h-4 inline mr-2 animate-spin" />
                Installing...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 inline mr-2" />
                Install
              </>
            )}
          </button>
        )}
        
        <button
          onClick={() => onViewDetails(server)}
          className="px-4 py-2 bg-white/10 text-white border border-white/20 rounded-lg hover:bg-white/20 transition-colors text-sm"
        >
          <Eye className="w-4 h-4 inline mr-2" />
          Details
        </button>
      </div>

      {/* External Links */}
      <div className="flex items-center justify-center space-x-4 mt-4 pt-4 border-t border-white/10">
        <a
          href={server.github_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-white transition-colors"
        >
          <GitBranch className="w-4 h-4" />
        </a>
        <a
          href={server.documentation_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-white transition-colors"
        >
          <FileText className="w-4 h-4" />
        </a>
        {server.homepage_url && (
          <a
            href={server.homepage_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <Globe className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  );
};

export const EnhancedMCPMarketplace: React.FC = () => {
  const [servers, setServers] = useState<MCPServer[]>(ENHANCED_MCP_SERVERS);
  const [filteredServers, setFilteredServers] = useState<MCPServer[]>(ENHANCED_MCP_SERVERS);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'downloads' | 'updated'>('name');
  const [showOnlyInstalled, setShowOnlyInstalled] = useState(false);
  const [showOnlyFree, setShowOnlyFree] = useState(false);
  const [selectedServer, setSelectedServer] = useState<MCPServer | null>(null);
  const [bookmarkedServers, setBookmarkedServers] = useState<Set<string>>(new Set());

  // Filter and sort servers
  useEffect(() => {
    let filtered = servers.filter(server => {
      const matchesCategory = selectedCategory === 'all' || server.category === selectedCategory;
      const matchesSearch = server.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           server.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           server.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesInstalled = !showOnlyInstalled || server.status === 'installed';
      const matchesFree = !showOnlyFree || server.price === 0;
      
      return matchesCategory && matchesSearch && matchesInstalled && matchesFree;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'downloads':
          return b.downloads - a.downloads;
        case 'updated':
          return new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime();
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredServers(filtered);
  }, [servers, selectedCategory, searchTerm, sortBy, showOnlyInstalled, showOnlyFree]);

  const handleInstall = (serverId: string) => {
    setServers(prev => prev.map(server => 
      server.id === serverId 
        ? { ...server, status: 'updating' as const }
        : server
    ));

    // Simulate installation
    setTimeout(() => {
      setServers(prev => prev.map(server => 
        server.id === serverId 
          ? { ...server, status: 'installed' as const, downloads: server.downloads + 1 }
          : server
      ));
    }, 2000);
  };

  const handleUninstall = (serverId: string) => {
    setServers(prev => prev.map(server => 
      server.id === serverId 
        ? { ...server, status: 'available' as const }
        : server
    ));
  };

  const handleToggleBookmark = (serverId: string) => {
    setBookmarkedServers(prev => {
      const newBookmarks = new Set(prev);
      if (newBookmarks.has(serverId)) {
        newBookmarks.delete(serverId);
      } else {
        newBookmarks.add(serverId);
      }
      return newBookmarks;
    });
  };

  const getStats = () => {
    const installed = servers.filter(s => s.status === 'installed').length;
    const available = servers.filter(s => s.status === 'available').length;
    const totalDownloads = servers.reduce((sum, s) => sum + s.downloads, 0);
    
    return { installed, available, totalDownloads };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">MCP Marketplace</h2>
          <p className="text-gray-400">Discover and install Model Context Protocol servers</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-400">
            {filteredServers.length} of {servers.length} servers
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">{stats.installed}</div>
              <div className="text-sm text-gray-400">Installed</div>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">{stats.available}</div>
              <div className="text-sm text-gray-400">Available</div>
            </div>
            <Package className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">{bookmarkedServers.size}</div>
              <div className="text-sm text-gray-400">Bookmarked</div>
            </div>
            <Bookmark className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">{(stats.totalDownloads / 1000).toFixed(0)}K</div>
              <div className="text-sm text-gray-400">Total Downloads</div>
            </div>
            <Download className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search servers, tools, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {category.icon}
              <span>{category.name}</span>
            </button>
          ))}
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={showOnlyInstalled}
                onChange={(e) => setShowOnlyInstalled(e.target.checked)}
                className="rounded"
              />
              <span>Installed only</span>
            </label>
            <label className="flex items-center space-x-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={showOnlyFree}
                onChange={(e) => setShowOnlyFree(e.target.checked)}
                className="rounded"
              />
              <span>Free only</span>
            </label>
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
          >
            <option value="name" className="bg-gray-800">Sort by Name</option>
            <option value="rating" className="bg-gray-800">Sort by Rating</option>
            <option value="downloads" className="bg-gray-800">Sort by Downloads</option>
            <option value="updated" className="bg-gray-800">Sort by Updated</option>
          </select>
        </div>
      </div>

      {/* Server Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServers.map(server => (
          <ServerCard
            key={server.id}
            server={server}
            onInstall={handleInstall}
            onUninstall={handleUninstall}
            onViewDetails={setSelectedServer}
            onToggleBookmark={handleToggleBookmark}
            isBookmarked={bookmarkedServers.has(server.id)}
          />
        ))}
      </div>

      {filteredServers.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <div className="text-gray-400 text-lg">No servers found matching your criteria</div>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setShowOnlyInstalled(false);
              setShowOnlyFree(false);
            }}
            className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Server Details Modal */}
      {selectedServer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">{selectedServer.name}</h3>
                <button
                  onClick={() => setSelectedServer(null)}
                  className="text-gray-400 hover:text-white text-xl"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Description</h4>
                    <p className="text-gray-300">{selectedServer.longDescription}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Tools ({selectedServer.tools.length})</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedServer.tools.map((tool, index) => (
                        <div key={index} className="bg-white/5 rounded-lg p-3">
                          <div className="font-medium text-white">{tool.name}</div>
                          <div className="text-sm text-gray-400">{tool.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {selectedServer.changelog.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">Recent Changes</h4>
                      <div className="space-y-3">
                        {selectedServer.changelog.slice(0, 3).map((entry, index) => (
                          <div key={index} className="bg-white/5 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-white">v{entry.version}</span>
                              <span className="text-sm text-gray-400">{entry.date}</span>
                            </div>
                            <ul className="text-sm text-gray-300 space-y-1">
                              {entry.changes.map((change, changeIndex) => (
                                <li key={changeIndex}>• {change}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Sidebar */}
                <div className="space-y-6">
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-white mb-3">Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Version:</span>
                        <span className="text-white">{selectedServer.version}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Size:</span>
                        <span className="text-white">{selectedServer.size}MB</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">License:</span>
                        <span className="text-white">{selectedServer.license}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Downloads:</span>
                        <span className="text-white">{selectedServer.downloads.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Security Score:</span>
                        <span className="text-green-400">{selectedServer.security_score}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-white mb-3">Compatibility</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedServer.compatibility.map((platform, index) => (
                        <span key={index} className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-white mb-3">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedServer.tags.map((tag, index) => (
                        <span key={index} className="text-xs bg-gray-700/50 text-gray-300 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedMCPMarketplace;