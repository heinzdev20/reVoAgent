import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Zap, 
  Activity,
  Settings,
  Target,
  BarChart3,
  Cpu,
  Memory,
  Clock,
  Shield
} from 'lucide-react';

interface AIIntelligenceData {
  overview: {
    timestamp: string;
    ai_systems_active: number;
    total_predictions: number;
    total_scaling_actions: number;
    total_anomalies: number;
  };
  current_state: {
    system_metrics: {
      cpu_usage: number;
      memory_usage: number;
      response_time: number;
      error_rate: number;
    };
    scaling_recommendation: {
      direction: string;
      confidence: number;
      reasoning: string;
    };
    current_instances: number;
  };
  predictive_analytics: any;
  autoscaling_analytics: any;
  anomaly_analytics: any;
}

interface Anomaly {
  id: string;
  type: string;
  severity: string;
  metric: string;
  description: string;
  timestamp: string;
}

interface PredictedIssue {
  id: string;
  issue_type: string;
  probability: number;
  estimated_time: string;
  impact_level: string;
  description: string;
}

const AIIntelligenceDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<AIIntelligenceData | null>(null);
  const [recentAnomalies, setRecentAnomalies] = useState<Anomaly[]>([]);
  const [predictedIssues, setPredictedIssues] = useState<PredictedIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/ai/intelligence/dashboard');
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  const fetchAnomalies = async () => {
    try {
      const response = await fetch('/ai/anomaly/analytics');
      if (response.ok) {
        const data = await response.json();
        setRecentAnomalies(data.recent_anomalies || []);
      }
    } catch (error) {
      console.error('Failed to fetch anomalies:', error);
    }
  };

  const fetchPredictedIssues = async () => {
    try {
      const response = await fetch('/ai/anomaly/predict-issues');
      if (response.ok) {
        const data = await response.json();
        setPredictedIssues(data.predicted_issues || []);
      }
    } catch (error) {
      console.error('Failed to fetch predicted issues:', error);
    }
  };

  const triggerAutoScaling = async () => {
    try {
      const response = await fetch('/ai/autoscaling/execute-scaling', {
        method: 'POST'
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Auto-scaling triggered:', data);
        // Refresh data after scaling
        setTimeout(fetchDashboardData, 2000);
      }
    } catch (error) {
      console.error('Failed to trigger auto-scaling:', error);
    }
  };

  const simulateWorkload = async () => {
    try {
      const workload = {
        concurrent_tasks: 20,
        task_complexity: 7.5,
        resource_requirements: { cpu: 4, memory: 8 },
        time_constraints: 300,
        priority_level: 8
      };

      const response = await fetch('/ai/intelligence/simulate-workload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workload)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Workload simulation:', data);
        alert(`Simulation complete! Recommended: ${data.recommended_configuration.agent_count} agents`);
      }
    } catch (error) {
      console.error('Failed to simulate workload:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchDashboardData(),
        fetchAnomalies(),
        fetchPredictedIssues()
      ]);
      setLoading(false);
    };

    loadData();

    // Auto-refresh every 30 seconds
    const interval = autoRefresh ? setInterval(loadData, 30000) : null;
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getScalingDirectionColor = (direction: string) => {
    switch (direction.toLowerCase()) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-blue-600';
      case 'maintain': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading AI Intelligence Dashboard...</span>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <p className="text-gray-600">Failed to load AI Intelligence data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Brain className="h-8 w-8 text-purple-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Intelligence Dashboard</h1>
            <p className="text-gray-600">Advanced Intelligence & Automation</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity className="h-4 w-4 mr-1" />
            Auto Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={simulateWorkload}>
            <Target className="h-4 w-4 mr-1" />
            Simulate Workload
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">AI Systems Active</p>
                <p className="text-2xl font-bold text-purple-600">
                  {dashboardData.overview.ai_systems_active}
                </p>
              </div>
              <Brain className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Predictions</p>
                <p className="text-2xl font-bold text-blue-600">
                  {dashboardData.overview.total_predictions}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Scaling Actions</p>
                <p className="text-2xl font-bold text-green-600">
                  {dashboardData.overview.total_scaling_actions}
                </p>
              </div>
              <Zap className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Anomalies Detected</p>
                <p className="text-2xl font-bold text-orange-600">
                  {dashboardData.overview.total_anomalies}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current System State */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              System Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Cpu className="h-4 w-4 mr-2 text-blue-500" />
                  <span className="text-sm">CPU Usage</span>
                </div>
                <span className="text-sm font-medium">
                  {dashboardData.current_state.system_metrics.cpu_usage.toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={dashboardData.current_state.system_metrics.cpu_usage} 
                className="h-2"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Memory className="h-4 w-4 mr-2 text-green-500" />
                  <span className="text-sm">Memory Usage</span>
                </div>
                <span className="text-sm font-medium">
                  {dashboardData.current_state.system_metrics.memory_usage.toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={dashboardData.current_state.system_metrics.memory_usage} 
                className="h-2"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-purple-500" />
                  <span className="text-sm">Response Time</span>
                </div>
                <span className="text-sm font-medium">
                  {dashboardData.current_state.system_metrics.response_time.toFixed(2)}s
                </span>
              </div>
              <Progress 
                value={Math.min(100, dashboardData.current_state.system_metrics.response_time * 20)} 
                className="h-2"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-red-500" />
                  <span className="text-sm">Error Rate</span>
                </div>
                <span className="text-sm font-medium">
                  {dashboardData.current_state.system_metrics.error_rate.toFixed(2)}%
                </span>
              </div>
              <Progress 
                value={Math.min(100, dashboardData.current_state.system_metrics.error_rate * 10)} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              Auto-scaling Recommendation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Current Instances</span>
              <Badge variant="outline">
                {dashboardData.current_state.current_instances}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Recommendation</span>
              <Badge 
                className={getScalingDirectionColor(dashboardData.current_state.scaling_recommendation.direction)}
              >
                {dashboardData.current_state.scaling_recommendation.direction.toUpperCase()}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Confidence</span>
                <span className="text-sm font-medium">
                  {(dashboardData.current_state.scaling_recommendation.confidence * 100).toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={dashboardData.current_state.scaling_recommendation.confidence * 100} 
                className="h-2"
              />
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-700">
                {dashboardData.current_state.scaling_recommendation.reasoning}
              </p>
            </div>

            <Button 
              onClick={triggerAutoScaling}
              className="w-full"
              variant="outline"
            >
              <Zap className="h-4 w-4 mr-2" />
              Execute Auto-scaling
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Anomalies and Predictions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Recent Anomalies
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentAnomalies.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent anomalies detected</p>
            ) : (
              <div className="space-y-3">
                {recentAnomalies.slice(0, 5).map((anomaly) => (
                  <div key={anomaly.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-3 h-3 rounded-full mt-1 ${getSeverityColor(anomaly.severity)}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {anomaly.metric}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {anomaly.description}
                      </p>
                      <div className="flex items-center mt-2 space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {anomaly.severity}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(anomaly.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Predicted Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            {predictedIssues.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No issues predicted</p>
            ) : (
              <div className="space-y-3">
                {predictedIssues.slice(0, 5).map((issue) => (
                  <div key={issue.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-900">
                        {issue.issue_type.replace('_', ' ').toUpperCase()}
                      </p>
                      <Badge variant="outline">
                        {(issue.probability * 100).toFixed(0)}%
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">
                      {issue.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Impact: {issue.impact_level}</span>
                      <span>ETA: {new Date(issue.estimated_time).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIIntelligenceDashboard;