import React, { useState, useEffect } from 'react';
import { Rocket, Play, Settings, Monitor, AlertCircle, CheckCircle } from 'lucide-react';

const DeployAgent: React.FC = () => {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployments, setDeployments] = useState<any[]>([]);
  const [deployConfig, setDeployConfig] = useState({
    project_id: 'proj-1',
    environment: 'staging',
    platform: 'docker',
    auto_rollback: true,
    health_checks: true
  });

  useEffect(() => {
    fetchDeployments();
  }, []);

  const fetchDeployments = async () => {
    try {
      const response = await fetch('/api/v1/deployments');
      const data = await response.json();
      setDeployments(data.deployments);
    } catch (error) {
      console.error('Error fetching deployments:', error);
    }
  };

  const deployProject = async () => {
    setIsDeploying(true);
    try {
      const response = await fetch('/api/v1/agents/deploy/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deployConfig),
      });
      
      if (response.ok) {
        const deployment = await response.json();
        setDeployments([deployment, ...deployments]);
      }
    } catch (error) {
      console.error('Error deploying project:', error);
    } finally {
      setIsDeploying(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-green-600 bg-green-100';
      case 'deploying': return 'text-blue-600 bg-blue-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'stopped': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'unhealthy': return 'text-red-600';
      case 'deploying': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <Rocket className="h-8 w-8 text-orange-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deploy Agent</h1>
          <p className="text-gray-600">Automated deployment pipelines with Docker, Kubernetes, and monitoring</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deployment Configuration */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Deployment Configuration</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
              <select
                value={deployConfig.project_id}
                onChange={(e) => setDeployConfig({...deployConfig, project_id: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="proj-1">E-commerce Platform</option>
                <option value="proj-2">AI Analytics Dashboard</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Environment</label>
                <select
                  value={deployConfig.environment}
                  onChange={(e) => setDeployConfig({...deployConfig, environment: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="development">Development</option>
                  <option value="staging">Staging</option>
                  <option value="production">Production</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                <select
                  value={deployConfig.platform}
                  onChange={(e) => setDeployConfig({...deployConfig, platform: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="docker">Docker</option>
                  <option value="kubernetes">Kubernetes</option>
                  <option value="serverless">Serverless</option>
                  <option value="vm">Virtual Machine</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={deployConfig.auto_rollback}
                  onChange={(e) => setDeployConfig({...deployConfig, auto_rollback: e.target.checked})}
                  className="mr-2"
                />
                <span className="text-sm">Auto Rollback on Failure</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={deployConfig.health_checks}
                  onChange={(e) => setDeployConfig({...deployConfig, health_checks: e.target.checked})}
                  className="mr-2"
                />
                <span className="text-sm">Enable Health Checks</span>
              </label>
            </div>
          </div>
          
          <button
            onClick={deployProject}
            disabled={isDeploying}
            className="w-full mt-6 flex items-center justify-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isDeploying ? (
              <>
                <Settings className="h-5 w-5 animate-spin" />
                <span>Deploying...</span>
              </>
            ) : (
              <>
                <Play className="h-5 w-5" />
                <span>Deploy</span>
              </>
            )}
          </button>
        </div>

        {/* Deployment Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Deployments</h3>
          
          <div className="space-y-4">
            {deployments.map((deployment) => (
              <div key={deployment.id} className="border border-gray-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{deployment.environment}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(deployment.status)}`}>
                      {deployment.status}
                    </span>
                  </div>
                  <div className={`flex items-center space-x-1 ${getHealthColor(deployment.health_status)}`}>
                    {deployment.health_status === 'healthy' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    <span className="text-sm font-medium">{deployment.health_status}</span>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 mb-2">
                  <a href={deployment.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {deployment.url}
                  </a>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Uptime:</span>
                    <span className="ml-1 font-medium">{deployment.metrics?.uptime}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Response:</span>
                    <span className="ml-1 font-medium">{deployment.metrics?.response_time}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Requests/min:</span>
                    <span className="ml-1 font-medium">{deployment.metrics?.requests_per_min}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Error Rate:</span>
                    <span className="ml-1 font-medium">{deployment.metrics?.error_rate}</span>
                  </div>
                </div>
              </div>
            ))}
            
            {deployments.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Rocket className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>No active deployments. Deploy a project to see status here.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Deployment Pipeline */}
      <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Deployment Pipeline</h3>
        
        <div className="flex items-center space-x-4 overflow-x-auto pb-4">
          {[
            { name: 'Build', status: 'completed', duration: '2m 34s' },
            { name: 'Test', status: 'completed', duration: '1m 12s' },
            { name: 'Security Scan', status: 'completed', duration: '45s' },
            { name: 'Deploy', status: 'running', duration: '1m 8s' },
            { name: 'Health Check', status: 'pending', duration: '-' },
            { name: 'Monitor', status: 'pending', duration: '-' }
          ].map((stage, index) => (
            <div key={stage.name} className="flex items-center space-x-2 min-w-max">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                stage.status === 'completed' ? 'bg-green-100 text-green-600' :
                stage.status === 'running' ? 'bg-blue-100 text-blue-600' :
                'bg-gray-100 text-gray-400'
              }`}>
                {stage.status === 'completed' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : stage.status === 'running' ? (
                  <Settings className="h-4 w-4 animate-spin" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-current"></div>
                )}
              </div>
              <div className="text-sm">
                <div className="font-medium text-gray-900">{stage.name}</div>
                <div className="text-gray-500">{stage.duration}</div>
              </div>
              {index < 5 && (
                <div className="w-8 h-px bg-gray-300"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Deployment History */}
      <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Deployments</h3>
        <div className="space-y-3">
          {[
            { id: 1, project: 'E-commerce Platform', env: 'staging', status: 'success', time: '2 min ago', duration: '3m 45s' },
            { id: 2, project: 'AI Analytics Dashboard', env: 'production', status: 'success', time: '1 hour ago', duration: '2m 12s' },
            { id: 3, project: 'E-commerce Platform', env: 'production', status: 'failed', time: '3 hours ago', duration: '1m 34s' }
          ].map((deployment) => (
            <div key={deployment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="text-sm font-medium text-gray-900">{deployment.project}</div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  deployment.status === 'success' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                }`}>
                  {deployment.env}
                </span>
                <div className="text-sm text-gray-600">Duration: {deployment.duration}</div>
              </div>
              <div className="text-xs text-gray-500">{deployment.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DeployAgent;