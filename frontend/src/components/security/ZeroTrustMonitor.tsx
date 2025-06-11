import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Eye,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  User,
  Globe,
  Activity,
  TrendingUp,
  TrendingDown,
  Zap,
  Filter,
  Search,
  Download,
  RefreshCw,
  Bell,
  Settings,
} from 'lucide-react';

interface SecurityEvent {
  id: string;
  timestamp: Date;
  type: 'authentication' | 'authorization' | 'access' | 'threat' | 'anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  user?: string;
  location?: string;
  description: string;
  status: 'active' | 'resolved' | 'investigating';
  riskScore: number;
}

interface ThreatIntelligence {
  id: string;
  type: 'malware' | 'phishing' | 'bruteforce' | 'ddos' | 'injection' | 'suspicious';
  confidence: number;
  indicators: string[];
  mitigation: string;
  automated: boolean;
}

interface SecurityMetric {
  id: string;
  name: string;
  value: number;
  threshold: number;
  status: 'normal' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  change: number;
}

interface AccessAttempt {
  id: string;
  timestamp: Date;
  user: string;
  resource: string;
  action: string;
  result: 'allowed' | 'denied' | 'challenged';
  riskFactors: string[];
  location: string;
  device: string;
}

export function ZeroTrustMonitor() {
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [selectedSeverity, setSelectedSeverity] = useState<string[]>(['high', 'critical']);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Mock data - in real implementation, this would come from security APIs
  const securityEvents = useMemo<SecurityEvent[]>(() => [
    {
      id: 'evt-001',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      type: 'threat',
      severity: 'critical',
      source: '192.168.1.100',
      user: 'admin@company.com',
      location: 'New York, US',
      description: 'Multiple failed login attempts detected from suspicious IP',
      status: 'active',
      riskScore: 95,
    },
    {
      id: 'evt-002',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      type: 'anomaly',
      severity: 'high',
      source: '10.0.0.45',
      user: 'user@company.com',
      location: 'London, UK',
      description: 'Unusual data access pattern detected',
      status: 'investigating',
      riskScore: 78,
    },
    {
      id: 'evt-003',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      type: 'access',
      severity: 'medium',
      source: '172.16.0.10',
      user: 'developer@company.com',
      location: 'San Francisco, US',
      description: 'Access to sensitive resource outside normal hours',
      status: 'resolved',
      riskScore: 45,
    },
    {
      id: 'evt-004',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      type: 'authentication',
      severity: 'low',
      source: '192.168.1.50',
      user: 'guest@company.com',
      location: 'Toronto, CA',
      description: 'Successful authentication from new device',
      status: 'resolved',
      riskScore: 25,
    },
  ], [timeRange]);

  const threatIntelligence = useMemo<ThreatIntelligence[]>(() => [
    {
      id: 'threat-001',
      type: 'bruteforce',
      confidence: 0.95,
      indicators: ['Multiple failed logins', 'IP reputation', 'Timing patterns'],
      mitigation: 'IP blocked, account locked, MFA enforced',
      automated: true,
    },
    {
      id: 'threat-002',
      type: 'suspicious',
      confidence: 0.78,
      indicators: ['Unusual access time', 'Geographic anomaly', 'Data volume'],
      mitigation: 'Additional verification required',
      automated: false,
    },
    {
      id: 'threat-003',
      type: 'injection',
      confidence: 0.67,
      indicators: ['SQL patterns in input', 'Parameter manipulation'],
      mitigation: 'Request blocked, WAF rule updated',
      automated: true,
    },
  ], []);

  const securityMetrics = useMemo<SecurityMetric[]>(() => [
    {
      id: 'failed-logins',
      name: 'Failed Login Rate',
      value: 12.5,
      threshold: 10,
      status: 'warning',
      trend: 'up',
      change: 8.3,
    },
    {
      id: 'threat-score',
      name: 'Threat Score',
      value: 35,
      threshold: 50,
      status: 'normal',
      trend: 'down',
      change: -5.2,
    },
    {
      id: 'access-violations',
      name: 'Access Violations',
      value: 3,
      threshold: 5,
      status: 'normal',
      trend: 'stable',
      change: 0,
    },
    {
      id: 'mfa-compliance',
      name: 'MFA Compliance',
      value: 94.2,
      threshold: 95,
      status: 'warning',
      trend: 'up',
      change: 2.1,
    },
  ], []);

  const accessAttempts = useMemo<AccessAttempt[]>(() => [
    {
      id: 'access-001',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      user: 'admin@company.com',
      resource: '/api/admin/users',
      action: 'READ',
      result: 'denied',
      riskFactors: ['Suspicious IP', 'Off-hours access'],
      location: 'Unknown',
      device: 'Chrome/Linux',
    },
    {
      id: 'access-002',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      user: 'user@company.com',
      resource: '/api/data/export',
      action: 'DOWNLOAD',
      result: 'challenged',
      riskFactors: ['Large data volume', 'New location'],
      location: 'London, UK',
      device: 'Firefox/Windows',
    },
    {
      id: 'access-003',
      timestamp: new Date(Date.now() - 8 * 60 * 1000),
      user: 'developer@company.com',
      resource: '/api/code/deploy',
      action: 'EXECUTE',
      result: 'allowed',
      riskFactors: [],
      location: 'San Francisco, US',
      device: 'Chrome/macOS',
    },
  ], []);

  const filteredEvents = useMemo(() => {
    return securityEvents.filter(event => {
      const matchesSeverity = selectedSeverity.length === 0 || selectedSeverity.includes(event.severity);
      const matchesSearch = !searchQuery || 
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.user?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.source.includes(searchQuery);
      
      return matchesSeverity && matchesSearch;
    });
  }, [securityEvents, selectedSeverity, searchQuery]);

  const refreshData = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastUpdated(new Date());
    setIsLoading(false);
  };

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(refreshData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return XCircle;
      case 'investigating': return Clock;
      case 'resolved': return CheckCircle;
      default: return AlertTriangle;
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'allowed': return 'text-green-600';
      case 'denied': return 'text-red-600';
      case 'challenged': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getMetricStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'normal': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-red-500 to-orange-600 rounded-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Zero Trust Security Monitor</h1>
            <p className="text-gray-600">Real-time threat detection and access control</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Auto Refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              autoRefresh 
                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Activity className={`w-4 h-4 ${autoRefresh ? 'animate-pulse' : ''}`} />
            <span className="text-sm">Auto Refresh</span>
          </button>

          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={refreshData}
            disabled={isLoading}
            className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Last Updated */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live Monitoring Active</span>
          </span>
        </div>
      </div>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {securityMetrics.map((metric) => {
          const statusColor = getMetricStatusColor(metric.status);
          const TrendIcon = metric.trend === 'up' ? TrendingUp : metric.trend === 'down' ? TrendingDown : Activity;

          return (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{metric.name}</h3>
                <div className={`flex items-center space-x-1 ${statusColor}`}>
                  <TrendIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {metric.change > 0 ? '+' : ''}{metric.change}%
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {metric.value.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-600">
                    {metric.name.includes('Rate') || metric.name.includes('Compliance') ? '%' : ''}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    Threshold: {metric.threshold}
                  </span>
                  <span className={`font-medium ${statusColor}`}>
                    {metric.status.toUpperCase()}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      metric.status === 'critical' ? 'bg-red-500' :
                      metric.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ 
                      width: `${Math.min((metric.value / metric.threshold) * 100, 100)}%` 
                    }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Threat Intelligence */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <ShieldAlert className="w-6 h-6 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-900">Active Threat Intelligence</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {threatIntelligence.map((threat, index) => (
            <motion.div
              key={threat.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-red-200 rounded-lg p-4 bg-red-50"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-red-900 capitalize">{threat.type}</h4>
                <div className="flex items-center space-x-2">
                  <span className="text-xs px-2 py-1 bg-red-200 text-red-800 rounded-full">
                    {Math.round(threat.confidence * 100)}% confidence
                  </span>
                  {threat.automated && (
                    <Zap className="w-4 h-4 text-yellow-600" />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-red-800">Indicators:</span>
                  <ul className="text-sm text-red-700 mt-1">
                    {threat.indicators.map((indicator, i) => (
                      <li key={i} className="flex items-center space-x-1">
                        <div className="w-1 h-1 bg-red-600 rounded-full"></div>
                        <span>{indicator}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="text-sm font-medium text-red-800">Mitigation:</span>
                  <p className="text-sm text-red-700 mt-1">{threat.mitigation}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Security Events */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Eye className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Security Events</h3>
          </div>

          <div className="flex items-center space-x-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Severity Filter */}
            <select
              multiple
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(Array.from(e.target.selectedOptions, option => option.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {filteredEvents.map((event, index) => {
            const StatusIcon = getStatusIcon(event.status);
            const severityColor = getSeverityColor(event.severity);

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <StatusIcon className={`w-5 h-5 ${
                      event.status === 'active' ? 'text-red-600' :
                      event.status === 'investigating' ? 'text-yellow-600' : 'text-green-600'
                    }`} />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${severityColor}`}>
                          {event.severity.toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-600 capitalize">{event.type}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{event.timestamp.toLocaleTimeString()}</span>
                      </div>
                    </div>

                    <p className="text-gray-900 mb-2">{event.description}</p>

                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      {event.user && (
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>{event.user}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <Globe className="w-4 h-4" />
                        <span>{event.source}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <Shield className="w-4 h-4" />
                        <span>Risk: {event.riskScore}/100</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Access Attempts */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Lock className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Recent Access Attempts</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Time</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">User</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Resource</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Action</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Result</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Risk Factors</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Location</th>
              </tr>
            </thead>
            <tbody>
              {accessAttempts.map((attempt, index) => (
                <motion.tr
                  key={attempt.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4 text-gray-600">
                    {attempt.timestamp.toLocaleTimeString()}
                  </td>
                  <td className="py-3 px-4 text-gray-900">{attempt.user}</td>
                  <td className="py-3 px-4 text-gray-600 font-mono text-xs">
                    {attempt.resource}
                  </td>
                  <td className="py-3 px-4 text-gray-900">{attempt.action}</td>
                  <td className="py-3 px-4">
                    <span className={`font-medium ${getResultColor(attempt.result)}`}>
                      {attempt.result.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {attempt.riskFactors.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {attempt.riskFactors.map((factor, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full"
                          >
                            {factor}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-green-600 text-xs">No risks</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-600">{attempt.location}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}