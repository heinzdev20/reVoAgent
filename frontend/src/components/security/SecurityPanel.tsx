/**
 * Security Panel Component
 * Displays security status, alerts, and compliance information
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Lock, 
  Eye, 
  FileText,
  Activity,
  Users,
  Key,
  Globe
} from 'lucide-react';

interface SecurityPanelProps {
  status?: any;
  alerts?: any[];
  compliance?: any;
  className?: string;
}

export const SecurityPanel: React.FC<SecurityPanelProps> = ({
  status,
  alerts,
  compliance,
  className = ''
}) => {
  // Mock data for demonstration
  const mockStatus = {
    overall_score: 97.5,
    vulnerabilities: {
      critical: 0,
      high: 0,
      medium: 2,
      low: 5
    },
    last_scan: new Date().toISOString(),
    encryption_status: 'active',
    access_controls: 'enabled',
    audit_logging: 'active'
  };

  const mockAlerts = [
    {
      id: 1,
      type: 'info',
      title: 'Security scan completed',
      message: 'No critical vulnerabilities found',
      timestamp: new Date().toISOString()
    },
    {
      id: 2,
      type: 'warning',
      title: 'Medium priority update available',
      message: 'Security patch available for dependency',
      timestamp: new Date(Date.now() - 3600000).toISOString()
    }
  ];

  const mockCompliance = {
    soc2: { status: 'compliant', score: 98 },
    iso27001: { status: 'compliant', score: 96 },
    gdpr: { status: 'compliant', score: 99 },
    hipaa: { status: 'in_progress', score: 85 }
  };

  const securityStatus = status || mockStatus;
  const securityAlerts = alerts || mockAlerts;
  const complianceStatus = compliance || mockCompliance;

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'in_progress':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'non_compliant':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Security & Compliance</h2>
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-green-600" />
          <span className="text-lg font-semibold text-green-600">
            {securityStatus.overall_score}% Secure
          </span>
        </div>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Security Score</p>
              <p className="text-2xl font-bold text-green-600">
                {securityStatus.overall_score}%
              </p>
            </div>
            <Shield className="h-8 w-8 text-green-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Critical Issues</p>
              <p className="text-2xl font-bold text-green-600">
                {securityStatus.vulnerabilities?.critical || 0}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-green-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Encryption</p>
              <p className="text-sm font-bold text-green-600 capitalize">
                {securityStatus.encryption_status || 'Active'}
              </p>
            </div>
            <Lock className="h-8 w-8 text-green-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Access Control</p>
              <p className="text-sm font-bold text-green-600 capitalize">
                {securityStatus.access_controls || 'Enabled'}
              </p>
            </div>
            <Users className="h-8 w-8 text-green-600" />
          </div>
        </motion.div>
      </div>

      {/* Vulnerability Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Vulnerability Status</h3>
            <Eye className="h-5 w-5 text-gray-600" />
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Critical</span>
              <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                {securityStatus.vulnerabilities?.critical || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">High</span>
              <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                {securityStatus.vulnerabilities?.high || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Medium</span>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                {securityStatus.vulnerabilities?.medium || 2}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Low</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                {securityStatus.vulnerabilities?.low || 5}
              </span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Status:</strong> No critical vulnerabilities detected. 
              System security is within acceptable parameters.
            </p>
          </div>
        </motion.div>

        {/* Recent Alerts */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Alerts</h3>
            <Activity className="h-5 w-5 text-gray-600" />
          </div>
          
          <div className="space-y-3">
            {securityAlerts.map((alert, index) => (
              <div key={alert.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                {getAlertIcon(alert.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                  <p className="text-xs text-gray-600">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Compliance Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Compliance Framework Status</h3>
          <FileText className="h-5 w-5 text-gray-600" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(complianceStatus).map(([framework, data]: [string, any]) => (
            <div key={framework} className={`p-4 rounded-lg border ${getComplianceColor(data.status)}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium uppercase">{framework}</span>
                <span className="text-xs font-bold">{data.score}%</span>
              </div>
              <div className="flex items-center space-x-2">
                {data.status === 'compliant' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
                <span className="text-xs capitalize">{data.status.replace('_', ' ')}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Security Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200"
      >
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Active Security Features</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <Key className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-blue-800">End-to-End Encryption</span>
          </div>
          <div className="flex items-center space-x-3">
            <Users className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-blue-800">Role-Based Access Control</span>
          </div>
          <div className="flex items-center space-x-3">
            <Eye className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-blue-800">Real-time Monitoring</span>
          </div>
          <div className="flex items-center space-x-3">
            <FileText className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-blue-800">Audit Logging</span>
          </div>
          <div className="flex items-center space-x-3">
            <Globe className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-blue-800">Network Security</span>
          </div>
          <div className="flex items-center space-x-3">
            <Shield className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-blue-800">Threat Detection</span>
          </div>
        </div>
      </motion.div>

      {/* Status Footer */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>Last security scan: {new Date(securityStatus.last_scan).toLocaleString()}</span>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>Security monitoring active</span>
        </div>
      </div>
    </div>
  );
};

export default SecurityPanel;