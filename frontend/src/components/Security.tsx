import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, Eye, Lock, Key, Users } from 'lucide-react';

interface SecurityScan {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  status: 'resolved' | 'pending' | 'ignored';
  detected_at: string;
}

interface SecurityMetrics {
  overall_score: number;
  vulnerabilities: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  last_scan: string;
  active_sessions: number;
  failed_logins: number;
}

const Security: React.FC = () => {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [scans, setScans] = useState<SecurityScan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    try {
      const response = await fetch('/api/v1/security/scan');
      const data = await response.json();
      setMetrics(data.metrics || {
        overall_score: 89.2,
        vulnerabilities: { critical: 0, high: 2, medium: 5, low: 8 },
        last_scan: '2 hours ago',
        active_sessions: 12,
        failed_logins: 3
      });
      setScans(data.scans || [
        {
          id: '1',
          type: 'Dependency Vulnerability',
          severity: 'high',
          description: 'Outdated package with known security vulnerability',
          status: 'pending',
          detected_at: '2 hours ago'
        },
        {
          id: '2',
          type: 'Weak Password Policy',
          severity: 'medium',
          description: 'Password policy does not meet security standards',
          status: 'pending',
          detected_at: '1 day ago'
        },
        {
          id: '3',
          type: 'Insecure API Endpoint',
          severity: 'high',
          description: 'API endpoint lacks proper authentication',
          status: 'resolved',
          detected_at: '3 days ago'
        }
      ]);
    } catch (error) {
      console.error('Error fetching security data:', error);
    } finally {
      setLoading(false);
    }
  };

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
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'ignored': return <XCircle className="h-4 w-4 text-gray-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <Shield className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Security Center</h1>
          <p className="text-gray-600">Monitor and manage security threats and vulnerabilities</p>
        </div>
      </div>

      {/* Security Score */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Overall Security Score</h3>
            <div className="flex items-center space-x-4">
              <div className={`text-4xl font-bold ${getScoreColor(metrics?.overall_score || 0)}`}>
                {metrics?.overall_score || 0}%
              </div>
              <div className="text-sm text-gray-500">
                Last scan: {metrics?.last_scan || 'Never'}
              </div>
            </div>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Run Security Scan
          </button>
        </div>
      </div>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Critical Issues</p>
              <p className="text-2xl font-bold text-gray-900">{metrics?.vulnerabilities.critical || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Shield className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">High Priority</p>
              <p className="text-2xl font-bold text-gray-900">{metrics?.vulnerabilities.high || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{metrics?.active_sessions || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Lock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Failed Logins</p>
              <p className="text-2xl font-bold text-gray-900">{metrics?.failed_logins || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Vulnerability Details */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Security Vulnerabilities</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Detected
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {scans.map((scan) => (
                <tr key={scan.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-gray-400 mr-3" />
                      <div className="text-sm font-medium text-gray-900">{scan.type}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getSeverityColor(scan.severity)}`}>
                      {scan.severity.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {scan.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(scan.status)}
                      <span className="ml-2 text-sm text-gray-900 capitalize">{scan.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {scan.detected_at}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        View
                      </button>
                      {scan.status === 'pending' && (
                        <>
                          <button className="text-green-600 hover:text-green-900">
                            Resolve
                          </button>
                          <button className="text-gray-600 hover:text-gray-900">
                            Ignore
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Recommendations */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <Shield className="h-6 w-6 text-blue-600 mt-1" />
          <div className="ml-3">
            <h3 className="text-lg font-medium text-blue-900 mb-2">Security Recommendations</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Enable two-factor authentication for all admin accounts</li>
              <li>• Update dependencies with known vulnerabilities</li>
              <li>• Implement stronger password policies</li>
              <li>• Review and update API access permissions</li>
              <li>• Enable audit logging for all critical operations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Security;