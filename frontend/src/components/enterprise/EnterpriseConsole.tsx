import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  Shield, 
  Globe, 
  BarChart3, 
  Settings, 
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Clock,
  Database
} from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  domain: string;
  plan: 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'suspended' | 'trial';
  users: number;
  maxUsers: number;
  storage: number;
  maxStorage: number;
  created: string;
  lastActivity: string;
  monthlySpend: number;
  compliance: string[];
}

interface TenantMetrics {
  totalOrganizations: number;
  activeUsers: number;
  totalRevenue: number;
  systemLoad: number;
  uptime: number;
  securityIncidents: number;
}

export const EnterpriseConsole: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([
    {
      id: 'org-1',
      name: 'TechCorp Solutions',
      domain: 'techcorp.com',
      plan: 'enterprise',
      status: 'active',
      users: 245,
      maxUsers: 500,
      storage: 1.2,
      maxStorage: 5.0,
      created: '2024-01-15',
      lastActivity: '2 minutes ago',
      monthlySpend: 12500,
      compliance: ['SOC2', 'GDPR', 'HIPAA']
    },
    {
      id: 'org-2',
      name: 'StartupXYZ',
      domain: 'startupxyz.io',
      plan: 'professional',
      status: 'active',
      users: 28,
      maxUsers: 100,
      storage: 0.3,
      maxStorage: 1.0,
      created: '2024-02-01',
      lastActivity: '1 hour ago',
      monthlySpend: 2500,
      compliance: ['GDPR']
    },
    {
      id: 'org-3',
      name: 'Innovation Labs',
      domain: 'innovationlabs.com',
      plan: 'starter',
      status: 'trial',
      users: 8,
      maxUsers: 25,
      storage: 0.1,
      maxStorage: 0.5,
      created: '2024-02-10',
      lastActivity: '30 minutes ago',
      monthlySpend: 0,
      compliance: []
    }
  ]);

  const [metrics, setMetrics] = useState<TenantMetrics>({
    totalOrganizations: 3,
    activeUsers: 281,
    totalRevenue: 15000,
    systemLoad: 67,
    uptime: 99.97,
    securityIncidents: 0
  });

  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'enterprise':
        return 'bg-purple-100 text-purple-800';
      case 'professional':
        return 'bg-blue-100 text-blue-800';
      case 'starter':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'trial':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStorage = (gb: number) => {
    return gb < 1 ? `${(gb * 1000).toFixed(0)} MB` : `${gb.toFixed(1)} GB`;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Enterprise Console</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Organization</span>
        </button>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-600">Organizations</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{metrics.totalOrganizations}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-600">Active Users</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{metrics.activeUsers}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-purple-500" />
            <span className="text-sm text-gray-600">Monthly Revenue</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">${metrics.totalRevenue.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-gray-600">System Load</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{metrics.systemLoad}%</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-600">Uptime</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{metrics.uptime}%</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-red-500" />
            <span className="text-sm text-gray-600">Security Incidents</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{metrics.securityIncidents}</p>
        </div>
      </div>

      {/* Organizations Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Organizations</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Users
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Storage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monthly Spend
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Compliance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {organizations.map((org) => (
                <tr key={org.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{org.name}</div>
                      <div className="text-sm text-gray-500">{org.domain}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPlanColor(org.plan)}`}>
                      {org.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(org.status)}`}>
                      {org.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {org.users} / {org.maxUsers}
                    <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                      <div 
                        className="bg-blue-600 h-1 rounded-full"
                        style={{ width: `${(org.users / org.maxUsers) * 100}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatStorage(org.storage)} / {formatStorage(org.maxStorage)}
                    <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                      <div 
                        className="bg-green-600 h-1 rounded-full"
                        style={{ width: `${(org.storage / org.maxStorage) * 100}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${org.monthlySpend.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {org.compliance.map((comp) => (
                        <span key={comp} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                          {comp}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedOrg(org)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">API Response Time</span>
              <span className="text-sm font-medium text-green-600">142ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Database Performance</span>
              <span className="text-sm font-medium text-green-600">Optimal</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Cache Hit Rate</span>
              <span className="text-sm font-medium text-green-600">94.2%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Error Rate</span>
              <span className="text-sm font-medium text-green-600">0.01%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-700">TechCorp Solutions upgraded to Enterprise</span>
              <span className="text-xs text-gray-500">2h ago</span>
            </div>
            <div className="flex items-center space-x-3">
              <Plus className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-700">New organization: Innovation Labs</span>
              <span className="text-xs text-gray-500">1d ago</span>
            </div>
            <div className="flex items-center space-x-3">
              <Shield className="w-4 h-4 text-purple-500" />
              <span className="text-sm text-gray-700">Security audit completed</span>
              <span className="text-xs text-gray-500">2d ago</span>
            </div>
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-gray-700">Maintenance window scheduled</span>
              <span className="text-xs text-gray-500">3d ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};