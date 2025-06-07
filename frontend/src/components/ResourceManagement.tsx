import React, { useState, useEffect } from 'react';
import { Server, Cpu, HardDrive, Zap, Plus, Settings, Play, Pause, Square } from 'lucide-react';

interface Resource {
  id: string;
  name: string;
  type: 'cpu' | 'memory' | 'storage' | 'gpu';
  status: 'active' | 'idle' | 'maintenance';
  usage: number;
  capacity: string;
  allocated_to: string[];
  cost_per_hour: number;
}

interface ResourcePool {
  id: string;
  name: string;
  resources: Resource[];
  total_cost: number;
  utilization: number;
}

const ResourceManagement: React.FC = () => {
  const [pools, setPools] = useState<ResourcePool[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchResourceData();
  }, []);

  const fetchResourceData = async () => {
    try {
      const response = await fetch('/api/v1/resources');
      const data = await response.json();
      setResources(data.resources || [
        {
          id: '1',
          name: 'CPU-Pool-01',
          type: 'cpu',
          status: 'active',
          usage: 75.2,
          capacity: '32 cores',
          allocated_to: ['Project A', 'Project B'],
          cost_per_hour: 2.50
        },
        {
          id: '2',
          name: 'Memory-Pool-01',
          type: 'memory',
          status: 'active',
          usage: 68.5,
          capacity: '128 GB',
          allocated_to: ['Project A', 'Workflow X'],
          cost_per_hour: 1.80
        },
        {
          id: '3',
          name: 'Storage-Pool-01',
          type: 'storage',
          status: 'idle',
          usage: 45.0,
          capacity: '2 TB',
          allocated_to: ['Project C'],
          cost_per_hour: 0.50
        },
        {
          id: '4',
          name: 'GPU-Pool-01',
          type: 'gpu',
          status: 'active',
          usage: 92.3,
          capacity: '8x V100',
          allocated_to: ['ML Training', 'Inference'],
          cost_per_hour: 15.00
        }
      ]);
      setPools(data.pools || [
        {
          id: '1',
          name: 'Production Pool',
          resources: ['1', '2'],
          total_cost: 4.30,
          utilization: 71.8
        },
        {
          id: '2',
          name: 'Development Pool',
          resources: ['3'],
          total_cost: 0.50,
          utilization: 45.0
        },
        {
          id: '3',
          name: 'ML Training Pool',
          resources: ['4'],
          total_cost: 15.00,
          utilization: 92.3
        }
      ]);
    } catch (error) {
      console.error('Error fetching resource data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'cpu': return <Cpu className="h-6 w-6" />;
      case 'memory': return <Server className="h-6 w-6" />;
      case 'storage': return <HardDrive className="h-6 w-6" />;
      case 'gpu': return <Zap className="h-6 w-6" />;
      default: return <Server className="h-6 w-6" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'idle': return 'bg-yellow-100 text-yellow-800';
      case 'maintenance': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUsageColor = (usage: number) => {
    if (usage >= 90) return 'text-red-600';
    if (usage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getUsageBarColor = (usage: number) => {
    if (usage >= 90) return 'bg-red-500';
    if (usage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const toggleResourceStatus = (resourceId: string) => {
    setResources(resources.map(resource => 
      resource.id === resourceId 
        ? { 
            ...resource, 
            status: resource.status === 'active' ? 'idle' : 'active' 
          }
        : resource
    ));
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Server className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Resource Management</h1>
            <p className="text-gray-600">Monitor and allocate computational resources across projects</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Add Resource</span>
        </button>
      </div>

      {/* Resource Pools Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {pools.map((pool) => (
          <div key={pool.id} className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">{pool.name}</h3>
              <span className="text-sm text-gray-500">{pool.resources.length} resources</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Utilization</span>
                <span className={`text-sm font-medium ${getUsageColor(pool.utilization)}`}>
                  {pool.utilization}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getUsageBarColor(pool.utilization)}`}
                  style={{ width: `${pool.utilization}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Cost/Hour</span>
                <span className="text-sm font-medium text-gray-900">${pool.total_cost.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Resource Details */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Resource Inventory</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resource
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Capacity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Allocated To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost/Hour
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {resources.map((resource) => (
                <tr key={resource.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                          {getResourceIcon(resource.type)}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{resource.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 capitalize">{resource.type}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(resource.status)}`}>
                      {resource.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`text-sm font-medium ${getUsageColor(resource.usage)}`}>
                        {resource.usage}%
                      </span>
                      <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getUsageBarColor(resource.usage)}`}
                          style={{ width: `${resource.usage}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {resource.capacity}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {resource.allocated_to.length > 0 ? (
                        <div className="space-y-1">
                          {resource.allocated_to.slice(0, 2).map((allocation, index) => (
                            <div key={index} className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded mr-1">
                              {allocation}
                            </div>
                          ))}
                          {resource.allocated_to.length > 2 && (
                            <div className="inline-block text-xs text-gray-500">
                              +{resource.allocated_to.length - 2} more
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">Unallocated</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${resource.cost_per_hour.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleResourceStatus(resource.id)}
                        className={`p-1 rounded ${
                          resource.status === 'active' 
                            ? 'text-yellow-600 hover:text-yellow-800' 
                            : 'text-green-600 hover:text-green-800'
                        }`}
                      >
                        {resource.status === 'active' ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <Settings className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-red-400 hover:text-red-600">
                        <Square className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cost Summary */}
      <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-start">
          <Zap className="h-6 w-6 text-green-600 mt-1" />
          <div className="ml-3">
            <h3 className="text-lg font-medium text-green-900 mb-2">Cost Optimization</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-green-800">
              <div>
                <span className="font-medium">Current Hourly Cost:</span> $19.80
              </div>
              <div>
                <span className="font-medium">Monthly Estimate:</span> $14,256
              </div>
              <div>
                <span className="font-medium">Potential Savings:</span> $2,340 (16%)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Resource Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Resource</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resource Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter resource name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resource Type</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="cpu">CPU</option>
                  <option value="memory">Memory</option>
                  <option value="storage">Storage</option>
                  <option value="gpu">GPU</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 32 cores, 128 GB, 2 TB"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cost per Hour ($)</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Resource
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceManagement;