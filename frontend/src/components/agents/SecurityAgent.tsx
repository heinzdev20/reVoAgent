/**
 * 🛡️ Security Agent - Professional Security Scanning & Vulnerability Assessment
 * Enterprise-grade security analysis with real-time monitoring
 */

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Search, 
  FileText, 
  Lock, 
  Unlock,
  Eye,
  EyeOff,
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  Zap,
  Bug,
  Key,
  Database,
  Globe,
  Server,
  Code,
  Settings,
  Download,
  RefreshCw,
  Play,
  Square
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

interface SecurityScan {
  id: string;
  type: 'vulnerability' | 'dependency' | 'code' | 'configuration' | 'network';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  file?: string;
  line?: number;
  recommendation: string;
  status: 'open' | 'fixed' | 'ignored';
  cve?: string;
  score?: number;
}

interface SecurityMetrics {
  totalScans: number;
  vulnerabilities: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  securityScore: number;
  lastScan: string;
  trendsUp: boolean;
}

export function SecurityAgent() {
  const status = useAgentStatus(AGENT_TYPES.SECURITY_AGENT);
  const error = useAgentError(AGENT_TYPES.SECURITY_AGENT);
  const isExecuting = useIsAgentExecuting(AGENT_TYPES.SECURITY_AGENT);
  const metrics = useAgentMetrics(AGENT_TYPES.SECURITY_AGENT);
  const taskHistory = useAgentTaskHistory(AGENT_TYPES.SECURITY_AGENT);
  const { executeAgent, fetchAgentStatus } = useAgentStore();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'scan' | 'vulnerabilities' | 'reports'>('dashboard');
  const [scanType, setScanType] = useState<'full' | 'quick' | 'dependency' | 'code'>('quick');
  const [scanTarget, setScanTarget] = useState('');
  const [showDetails, setShowDetails] = useState<string | null>(null);

  // Mock data for demonstration
  const [securityMetrics] = useState<SecurityMetrics>({
    totalScans: 47,
    vulnerabilities: {
      critical: 2,
      high: 5,
      medium: 12,
      low: 8
    },
    securityScore: 78,
    lastScan: '2 hours ago',
    trendsUp: false
  });

  const [vulnerabilities] = useState<SecurityScan[]>([
    {
      id: '1',
      type: 'vulnerability',
      severity: 'critical',
      title: 'SQL Injection Vulnerability',
      description: 'Potential SQL injection in user input validation',
      file: 'src/auth/login.py',
      line: 45,
      recommendation: 'Use parameterized queries and input sanitization',
      status: 'open',
      cve: 'CVE-2023-1234',
      score: 9.8
    },
    {
      id: '2',
      type: 'dependency',
      severity: 'high',
      title: 'Outdated Dependency',
      description: 'requests library has known security vulnerabilities',
      recommendation: 'Update to requests>=2.31.0',
      status: 'open',
      cve: 'CVE-2023-5678',
      score: 7.5
    },
    {
      id: '3',
      type: 'code',
      severity: 'medium',
      title: 'Hardcoded API Key',
      description: 'API key found in source code',
      file: 'src/config/settings.py',
      line: 12,
      recommendation: 'Move API keys to environment variables',
      status: 'open',
      score: 5.2
    },
    {
      id: '4',
      type: 'configuration',
      severity: 'low',
      title: 'Debug Mode Enabled',
      description: 'Debug mode is enabled in production configuration',
      file: 'config/production.yaml',
      line: 8,
      recommendation: 'Disable debug mode in production',
      status: 'fixed',
      score: 3.1
    }
  ]);

  useEffect(() => {
    fetchAgentStatus(AGENT_TYPES.SECURITY_AGENT);
  }, [fetchAgentStatus]);

  const handleStartScan = async () => {
    try {
      await executeAgent(AGENT_TYPES.SECURITY_AGENT, {
        description: `${scanType} security scan`,
        parameters: {
          scan_type: scanType,
          target: scanTarget || 'current_project',
          include_dependencies: true,
          include_code_analysis: true,
          severity_threshold: 'low'
        }
      });
    } catch (error) {
      console.error('Failed to start security scan:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-700 bg-red-100 border-red-200';
      case 'high':
        return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'medium':
        return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'low':
        return 'text-blue-700 bg-blue-100 border-blue-200';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="w-4 h-4" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4" />;
      case 'medium':
        return <Eye className="w-4 h-4" />;
      case 'low':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'vulnerability':
        return <Bug className="w-4 h-4" />;
      case 'dependency':
        return <Database className="w-4 h-4" />;
      case 'code':
        return <Code className="w-4 h-4" />;
      case 'configuration':
        return <Settings className="w-4 h-4" />;
      case 'network':
        return <Globe className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-red-500 rounded-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Security Agent</h1>
            <p className="text-gray-600">Advanced security scanning and vulnerability assessment</p>
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
              {status.status === 'busy' ? 'Scanning...' : 
               status.status === 'idle' ? 'Ready' :
               status.status === 'error' ? 'Error' : 'Offline'}
            </span>
          )}
          
          <button
            onClick={() => fetchAgentStatus(AGENT_TYPES.SECURITY_AGENT)}
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
            <AlertTriangle className="w-5 h-5 mr-2" />
            <span className="font-medium">Security Agent Error</span>
          </div>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Current Task */}
      {status?.current_task && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center text-blue-700 mb-2">
            <Activity className="w-5 h-5 mr-2 animate-spin" />
            <span className="font-medium">Current Scan</span>
          </div>
          <p className="text-blue-600 text-sm">{status.current_task}</p>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'dashboard', label: 'Security Dashboard', icon: Shield },
            { id: 'scan', label: 'Start Scan', icon: Search },
            { id: 'vulnerabilities', label: 'Vulnerabilities', icon: AlertTriangle },
            { id: 'reports', label: 'Reports', icon: FileText }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'flex items-center px-1 py-4 border-b-2 font-medium text-sm transition-colors',
                activeTab === tab.id
                  ? 'border-red-500 text-red-600'
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
          {/* Security Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Security Score</p>
                  <p className="text-2xl font-bold text-gray-900">{securityMetrics.securityScore}/100</p>
                </div>
                <div className={cn(
                  'p-3 rounded-lg',
                  securityMetrics.securityScore >= 80 ? 'bg-green-100' :
                  securityMetrics.securityScore >= 60 ? 'bg-yellow-100' : 'bg-red-100'
                )}>
                  <Shield className={cn(
                    'w-6 h-6',
                    securityMetrics.securityScore >= 80 ? 'text-green-600' :
                    securityMetrics.securityScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                  )} />
                </div>
              </div>
              <div className="mt-2 flex items-center">
                {securityMetrics.trendsUp ? (
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={cn(
                  'text-sm',
                  securityMetrics.trendsUp ? 'text-green-600' : 'text-red-600'
                )}>
                  {securityMetrics.trendsUp ? '+5' : '-3'} from last scan
                </span>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Critical Issues</p>
                  <p className="text-2xl font-bold text-red-600">{securityMetrics.vulnerabilities.critical}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Require immediate attention</p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Scans</p>
                  <p className="text-2xl font-bold text-gray-900">{securityMetrics.totalScans}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Search className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Last: {securityMetrics.lastScan}</p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-green-600">{metrics?.successRate?.toFixed(1) || '94.2'}%</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Scan completion rate</p>
            </div>
          </div>

          {/* Vulnerability Breakdown */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vulnerability Breakdown</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(securityMetrics.vulnerabilities).map(([severity, count]) => (
                <div key={severity} className="text-center">
                  <div className={cn(
                    'w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-2',
                    severity === 'critical' ? 'bg-red-100' :
                    severity === 'high' ? 'bg-orange-100' :
                    severity === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'
                  )}>
                    <span className={cn(
                      'text-xl font-bold',
                      severity === 'critical' ? 'text-red-600' :
                      severity === 'high' ? 'text-orange-600' :
                      severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                    )}>
                      {count}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 capitalize">{severity}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Vulnerabilities */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Vulnerabilities</h3>
              <button
                onClick={() => setActiveTab('vulnerabilities')}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                View All →
              </button>
            </div>
            <div className="space-y-3">
              {vulnerabilities.slice(0, 3).map((vuln) => (
                <div key={vuln.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={cn('p-2 rounded-lg border', getSeverityColor(vuln.severity))}>
                      {getSeverityIcon(vuln.severity)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{vuln.title}</p>
                      <p className="text-sm text-gray-600">{vuln.file}</p>
                    </div>
                  </div>
                  <span className={cn(
                    'px-2 py-1 rounded-full text-xs font-medium capitalize',
                    getSeverityColor(vuln.severity)
                  )}>
                    {vuln.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'scan' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Start Security Scan</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Scan Type</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { id: 'quick', label: 'Quick Scan', desc: '~5 minutes' },
                    { id: 'full', label: 'Full Scan', desc: '~30 minutes' },
                    { id: 'dependency', label: 'Dependencies', desc: '~10 minutes' },
                    { id: 'code', label: 'Code Analysis', desc: '~15 minutes' }
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setScanType(type.id as any)}
                      className={cn(
                        'p-4 border rounded-lg text-left transition-colors',
                        scanType === type.id
                          ? 'border-red-500 bg-red-50 text-red-700'
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Target (Optional)</label>
                <input
                  type="text"
                  value={scanTarget}
                  onChange={(e) => setScanTarget(e.target.value)}
                  placeholder="Leave empty to scan current project"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <button
                onClick={handleStartScan}
                disabled={isExecuting}
                className={cn(
                  'w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors',
                  isExecuting
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                )}
              >
                {isExecuting ? (
                  <>
                    <Activity className="w-5 h-5 mr-2 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Start {scanType.charAt(0).toUpperCase() + scanType.slice(1)} Scan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'vulnerabilities' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Security Vulnerabilities</h3>
              <div className="flex items-center space-x-2">
                <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option>All Severities</option>
                  <option>Critical</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
                <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option>All Types</option>
                  <option>Vulnerability</option>
                  <option>Dependency</option>
                  <option>Code</option>
                  <option>Configuration</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {vulnerabilities.map((vuln) => (
                <div key={vuln.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={cn('p-2 rounded-lg border', getSeverityColor(vuln.severity))}>
                        {getSeverityIcon(vuln.severity)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-gray-900">{vuln.title}</h4>
                          {vuln.cve && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              {vuln.cve}
                            </span>
                          )}
                          {vuln.score && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                              CVSS: {vuln.score}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{vuln.description}</p>
                        {vuln.file && (
                          <div className="flex items-center text-sm text-gray-500 mb-2">
                            <FileText className="w-4 h-4 mr-1" />
                            {vuln.file}
                            {vuln.line && `:${vuln.line}`}
                          </div>
                        )}
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            {getTypeIcon(vuln.type)}
                            <span className="ml-1 text-sm text-gray-600 capitalize">{vuln.type}</span>
                          </div>
                          <span className={cn(
                            'px-2 py-1 rounded-full text-xs font-medium capitalize',
                            getSeverityColor(vuln.severity)
                          )}>
                            {vuln.severity}
                          </span>
                          <span className={cn(
                            'px-2 py-1 rounded-full text-xs font-medium',
                            vuln.status === 'fixed' ? 'bg-green-100 text-green-700' :
                            vuln.status === 'ignored' ? 'bg-gray-100 text-gray-700' :
                            'bg-red-100 text-red-700'
                          )}>
                            {vuln.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowDetails(showDetails === vuln.id ? null : vuln.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {showDetails === vuln.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {showDetails === vuln.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h5 className="font-medium text-gray-900 mb-2">Recommendation</h5>
                      <p className="text-gray-600 text-sm mb-4">{vuln.recommendation}</p>
                      <div className="flex items-center space-x-2">
                        <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                          Mark as Fixed
                        </button>
                        <button className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700">
                          Ignore
                        </button>
                        <button className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50">
                          View Details
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Reports</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Vulnerability Assessment Report', date: '2 hours ago', type: 'PDF' },
                { title: 'Dependency Security Report', date: '1 day ago', type: 'JSON' },
                { title: 'Code Security Analysis', date: '3 days ago', type: 'HTML' },
                { title: 'Compliance Report', date: '1 week ago', type: 'PDF' }
              ].map((report, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{report.title}</p>
                      <p className="text-sm text-gray-500">{report.date} • {report.type}</p>
                    </div>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}