import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Clock, CheckCircle } from 'lucide-react';

interface AnalyticsData {
  performance_metrics: {
    total_projects: number;
    active_projects: number;
    completed_projects: number;
    success_rate: number;
    avg_completion_time: string;
    code_quality_score: number;
    test_coverage: number;
    deployment_success_rate: number;
  };
  agent_performance: {
    [key: string]: {
      tasks: number;
      success_rate: number;
      avg_time: string;
    };
  };
  resource_usage: {
    cpu_avg: number;
    memory_avg: number;
    gpu_avg: number;
    network_io: number;
    disk_io: number;
  };
}

const Analytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalytics();
    fetchPerformanceData();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/v1/analytics');
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchPerformanceData = async () => {
    try {
      const response = await fetch('/api/v1/analytics/performance');
      const data = await response.json();
      setPerformanceData(data);
    } catch (error) {
      console.error('Error fetching performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const MetricCard = ({ title, value, subtitle, icon: Icon, color = 'blue' }: any) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center">
        <div className={`flex-shrink-0 p-3 rounded-lg bg-${color}-100`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-semibold text-gray-900">{value}</h3>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  const ProgressBar = ({ label, value, max = 100, color = 'blue' }: any) => (
    <div className="mb-4">
      <div className="flex justify-between text-sm text-gray-600 mb-1">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`bg-${color}-600 h-2 rounded-full transition-all duration-300`}
          style={{ width: `${(value / max) * 100}%` }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <BarChart3 className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive insights into your AI development platform</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview' },
            { id: 'performance', name: 'Performance' },
            { id: 'agents', name: 'Agent Analytics' },
            { id: 'resources', name: 'Resource Usage' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Projects"
              value={analytics.performance_metrics.total_projects}
              subtitle={`${analytics.performance_metrics.active_projects} active`}
              icon={BarChart3}
              color="blue"
            />
            <MetricCard
              title="Success Rate"
              value={`${analytics.performance_metrics.success_rate}%`}
              subtitle="Overall completion rate"
              icon={CheckCircle}
              color="green"
            />
            <MetricCard
              title="Avg Completion"
              value={analytics.performance_metrics.avg_completion_time}
              subtitle="Per project"
              icon={Clock}
              color="yellow"
            />
            <MetricCard
              title="Code Quality"
              value={`${analytics.performance_metrics.code_quality_score}/100`}
              subtitle="Quality score"
              icon={TrendingUp}
              color="purple"
            />
          </div>

          {/* Quality Metrics */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <ProgressBar
                  label="Code Quality Score"
                  value={analytics.performance_metrics.code_quality_score}
                  color="blue"
                />
                <ProgressBar
                  label="Test Coverage"
                  value={analytics.performance_metrics.test_coverage}
                  color="green"
                />
              </div>
              <div>
                <ProgressBar
                  label="Deployment Success Rate"
                  value={analytics.performance_metrics.deployment_success_rate}
                  color="purple"
                />
                <ProgressBar
                  label="Overall Success Rate"
                  value={analytics.performance_metrics.success_rate}
                  color="yellow"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && performanceData && (
        <div className="space-y-6">
          {/* Trends Chart Placeholder */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Daily Tasks</h4>
                <div className="flex items-end space-x-1 h-20">
                  {performanceData.trends.daily_tasks.map((value: number, index: number) => (
                    <div
                      key={index}
                      className="bg-blue-500 rounded-t"
                      style={{
                        height: `${(value / Math.max(...performanceData.trends.daily_tasks)) * 100}%`,
                        width: '12px'
                      }}
                    ></div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Success Rates (%)</h4>
                <div className="flex items-end space-x-1 h-20">
                  {performanceData.trends.success_rates.map((value: number, index: number) => (
                    <div
                      key={index}
                      className="bg-green-500 rounded-t"
                      style={{
                        height: `${value}%`,
                        width: '12px'
                      }}
                    ></div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Response Times (ms)</h4>
                <div className="flex items-end space-x-1 h-20">
                  {performanceData.trends.response_times.map((value: number, index: number) => (
                    <div
                      key={index}
                      className="bg-purple-500 rounded-t"
                      style={{
                        height: `${(value / Math.max(...performanceData.trends.response_times)) * 100}%`,
                        width: '12px'
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Agent Analytics Tab */}
      {activeTab === 'agents' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Agent Performance</h3>
            <div className="space-y-4">
              {Object.entries(analytics.agent_performance).map(([agentName, data]) => (
                <div key={agentName} className="border border-gray-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 capitalize">
                      {agentName.replace('_', ' ')}
                    </h4>
                    <span className="text-sm text-gray-500">{data.tasks} tasks</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Success Rate:</span>
                      <span className="ml-2 font-medium">{data.success_rate}%</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Avg Time:</span>
                      <span className="ml-2 font-medium">{data.avg_time}</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <ProgressBar
                      label=""
                      value={data.success_rate}
                      color="blue"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Resource Usage Tab */}
      {activeTab === 'resources' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Utilization</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <ProgressBar
                  label="CPU Usage"
                  value={analytics.resource_usage.cpu_avg}
                  color="red"
                />
                <ProgressBar
                  label="Memory Usage"
                  value={analytics.resource_usage.memory_avg}
                  color="blue"
                />
                <ProgressBar
                  label="GPU Usage"
                  value={analytics.resource_usage.gpu_avg}
                  color="green"
                />
              </div>
              <div>
                <ProgressBar
                  label="Network I/O"
                  value={analytics.resource_usage.network_io}
                  color="purple"
                />
                <ProgressBar
                  label="Disk I/O"
                  value={analytics.resource_usage.disk_io}
                  color="yellow"
                />
              </div>
            </div>
          </div>

          {/* Resource Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
              <div className="text-2xl font-bold text-blue-600">{analytics.resource_usage.cpu_avg}%</div>
              <div className="text-sm text-gray-600">Average CPU</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
              <div className="text-2xl font-bold text-green-600">{analytics.resource_usage.memory_avg}%</div>
              <div className="text-sm text-gray-600">Average Memory</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
              <div className="text-2xl font-bold text-purple-600">{analytics.resource_usage.gpu_avg}%</div>
              <div className="text-sm text-gray-600">Average GPU</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;