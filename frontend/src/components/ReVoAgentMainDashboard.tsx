import React, { useState, useEffect } from 'react';
import { 
  Activity, Brain, Zap, Palette, MessageSquare, Settings, 
  Users, Database, Shield, BarChart3, GitBranch, Slack,
  Cpu, HardDrive, Network, TrendingUp, Bell, Play,
  Search, Download, Upload, RefreshCw, Eye, Code,
  Bug, TestTube, Rocket, FileText, Monitor, Lock
} from 'lucide-react';

const ReVoAgentMainDashboard = () => {
  const [activeEngine, setActiveEngine] = useState('memory');
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [systemMetrics, setSystemMetrics] = useState({
    cpu: 67.8,
    memory: 89.2,
    disk: 34.1,
    network: 56.3,
    activeRequests: 47,
    queueLength: 12,
    responseTime: 0.002,
    uptime: 99.9
  });

  const [engineStatus, setEngineStatus] = useState({
    memory: { status: 'active', entities: 1247893, speed: 95, cost: 0 },
    parallel: { status: 'active', workers: 8, load: 45.2, throughput: 150 },
    creative: { status: 'active', patterns: 15, novelty: 94, innovation: 7.2 }
  });

  const [costSavings, setCostSavings] = useState({
    totalSavings: 2847,
    localProcessing: 94.7,
    cloudFallback: 5.3,
    deepSeekCost: 0,
    openAICost: 12.30,
    llamaCost: 0,
    anthropicCost: 8.70,
    monthlyProjection: 3200
  });

  const agents = {
    codeSpecialists: [
      { id: 'code-analyst', name: 'Code Analyst', icon: Code, status: 'active', tasks: 15 },
      { id: 'debug-detective', name: 'Debug Detective', icon: Bug, status: 'active', tasks: 8 },
      { id: 'security-scanner', name: 'Security Scanner', icon: Shield, status: 'active', tasks: 3 },
      { id: 'perf-optimizer', name: 'Performance Optimizer', icon: TrendingUp, status: 'active', tasks: 5 },
      { id: 'doc-generator', name: 'Documentation Generator', icon: FileText, status: 'idle', tasks: 0 }
    ],
    workflow: [
      { id: 'workflow-manager', name: 'Workflow Manager', icon: GitBranch, status: 'active', tasks: 12 },
      { id: 'devops-integration', name: 'DevOps Integration', icon: Settings, status: 'active', tasks: 7 },
      { id: 'cicd-pipeline', name: 'CI/CD Pipeline', icon: Rocket, status: 'active', tasks: 4 },
      { id: 'test-coordinator', name: 'Testing Coordinator', icon: TestTube, status: 'active', tasks: 9 },
      { id: 'deploy-manager', name: 'Deployment Manager', icon: Upload, status: 'idle', tasks: 0 }
    ],
    knowledge: [
      { id: 'knowledge-coord', name: 'Knowledge Coordinator', icon: Brain, status: 'active', tasks: 23 },
      { id: 'memory-synthesis', name: 'Memory Synthesis', icon: Database, status: 'active', tasks: 18 },
      { id: 'pattern-recognition', name: 'Pattern Recognition', icon: Eye, status: 'active', tasks: 11 },
      { id: 'learning-optimizer', name: 'Learning Optimizer', icon: TrendingUp, status: 'active', tasks: 6 },
      { id: 'context-manager', name: 'Context Manager', icon: RefreshCw, status: 'active', tasks: 14 }
    ],
    communication: [
      { id: 'multi-agent-chat', name: 'Multi-Agent Chat', icon: MessageSquare, status: 'active', tasks: 31 },
      { id: 'slack-integration', name: 'Slack Integration', icon: Slack, status: 'active', tasks: 5 },
      { id: 'github-integration', name: 'GitHub Integration', icon: GitBranch, status: 'active', tasks: 8 },
      { id: 'jira-integration', name: 'JIRA Integration', icon: Users, status: 'active', tasks: 3 },
      { id: 'notification-manager', name: 'Notification Manager', icon: Bell, status: 'active', tasks: 12 }
    ]
  };

  const activeTasks = [
    { id: 1, task: 'Analyzing repository structure', progress: 75, agent: 'code-analyst' },
    { id: 2, task: 'Building deployment pipeline', progress: 45, agent: 'deploy-manager' },
    { id: 3, task: 'Updating memory graph', progress: 88, agent: 'memory-synthesis' },
    { id: 4, task: 'Generating documentation', progress: 32, agent: 'doc-generator' },
    { id: 5, task: 'Running security scan', progress: 67, agent: 'security-scanner' }
  ];

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setSystemMetrics(prev => ({
        ...prev,
        cpu: Math.max(30, Math.min(90, prev.cpu + (Math.random() - 0.5) * 5)),
        memory: Math.max(40, Math.min(95, prev.memory + (Math.random() - 0.5) * 3)),
        activeRequests: Math.max(0, prev.activeRequests + Math.floor((Math.random() - 0.5) * 10))
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const EngineStatusCard = ({ engine, data, icon: Icon }) => (
    <div className={`p-6 rounded-2xl backdrop-blur-md border transition-all duration-300 cursor-pointer ${
      activeEngine === engine 
        ? 'bg-blue-500/20 border-blue-400/50 shadow-lg shadow-blue-500/25' 
        : 'bg-white/10 border-white/20 hover:bg-white/15'
    }`}
    onClick={() => setActiveEngine(engine)}>
      <div className="flex items-center gap-3 mb-4">
        <Icon className="w-8 h-8 text-blue-400" />
        <h3 className="text-xl font-bold text-white capitalize">{engine} Engine</h3>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-blue-200">Status:</span>
          <span className="text-green-400 font-semibold">●●● Active</span>
        </div>
        {engine === 'memory' && (
          <>
            <div className="flex justify-between">
              <span className="text-blue-200">Entities:</span>
              <span className="text-white font-mono">{data.entities.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-200">Speed:</span>
              <span className="text-white">&lt;{data.speed}ms</span>
            </div>
          </>
        )}
        {engine === 'parallel' && (
          <>
            <div className="flex justify-between">
              <span className="text-blue-200">Workers:</span>
              <span className="text-white">{data.workers} Active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-200">Load:</span>
              <span className="text-white">{data.load}%</span>
            </div>
          </>
        )}
        {engine === 'creative' && (
          <>
            <div className="flex justify-between">
              <span className="text-blue-200">Patterns:</span>
              <span className="text-white">{data.patterns} Active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-200">Novelty:</span>
              <span className="text-white">{data.novelty}% Score</span>
            </div>
          </>
        )}
        <div className="flex justify-between">
          <span className="text-blue-200">Cost:</span>
          <span className="text-green-400 font-bold">${data.cost.toFixed(2)}/query</span>
        </div>
      </div>
    </div>
  );

  const AgentCard = ({ agent, category }) => (
    <div 
      className={`p-3 rounded-xl backdrop-blur-md border transition-all duration-200 cursor-pointer ${
        selectedAgent?.id === agent.id 
          ? 'bg-purple-500/20 border-purple-400/50' 
          : 'bg-white/5 border-white/10 hover:bg-white/10'
      }`}
      onClick={() => setSelectedAgent(agent)}
    >
      <div className="flex items-center gap-3">
        <agent.icon className="w-5 h-5 text-purple-400" />
        <div className="flex-1">
          <h4 className="text-white font-medium text-sm">{agent.name}</h4>
          <p className="text-purple-200 text-xs">{agent.tasks} active tasks</p>
        </div>
        <div className={`w-2 h-2 rounded-full ${
          agent.status === 'active' ? 'bg-green-400' : 'bg-yellow-400'
        }`} />
      </div>
    </div>
  );

  const MetricBar = ({ label, value, color = 'blue' }) => (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-blue-200">{label}:</span>
        <span className="text-white font-mono">{value}%</span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-2">
        <div 
          className={`h-2 rounded-full bg-gradient-to-r from-${color}-400 to-${color}-600`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Top Navigation */}
      <div className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Rocket className="w-8 h-8 text-blue-400" />
              <h1 className="text-2xl font-bold text-white">reVoAgent</h1>
            </div>
            <div className="text-sm text-blue-200">Three-Engine Architecture</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-green-400">
              💰 ${costSavings.totalSavings} saved this month
            </div>
            <div className="text-sm text-blue-200">
              ⚡ {systemMetrics.activeRequests} active requests
            </div>
            <Bell className="w-5 h-5 text-blue-400 cursor-pointer" />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Three Engine Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <EngineStatusCard 
            engine="memory" 
            data={engineStatus.memory} 
            icon={Brain} 
          />
          <EngineStatusCard 
            engine="parallel" 
            data={engineStatus.parallel} 
            icon={Zap} 
          />
          <EngineStatusCard 
            engine="creative" 
            data={engineStatus.creative} 
            icon={Palette} 
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Agents */}
          <div className="lg:col-span-2 space-y-6">
            {/* Agent Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(agents).map(([category, agentList]) => (
                <div key={category} className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
                  <h3 className="text-lg font-bold text-white mb-4 capitalize">
                    {category.replace(/([A-Z])/g, ' $1').trim()} Agents
                  </h3>
                  <div className="space-y-3">
                    {agentList.map(agent => (
                      <AgentCard key={agent.id} agent={agent} category={category} />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Active Tasks */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Active Tasks</h3>
              <div className="space-y-3">
                {activeTasks.map(task => (
                  <div key={task.id} className="bg-white/5 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white text-sm">{task.task}</span>
                      <span className="text-blue-200 text-xs">{task.progress}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1">
                      <div 
                        className="h-1 rounded-full bg-gradient-to-r from-blue-400 to-purple-600"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Metrics & Cost */}
          <div className="space-y-6">
            {/* System Metrics */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-bold text-white mb-4">System Metrics</h3>
              <div className="space-y-4">
                <MetricBar label="CPU" value={systemMetrics.cpu} color="blue" />
                <MetricBar label="Memory" value={systemMetrics.memory} color="purple" />
                <MetricBar label="Disk" value={systemMetrics.disk} color="green" />
                <MetricBar label="Network" value={systemMetrics.network} color="yellow" />
              </div>
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-200">Response Time:</span>
                    <div className="text-white font-mono">{systemMetrics.responseTime}s</div>
                  </div>
                  <div>
                    <span className="text-blue-200">Uptime:</span>
                    <div className="text-green-400 font-mono">{systemMetrics.uptime}%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cost Optimization */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Cost Optimization</h3>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">${costSavings.totalSavings}</div>
                  <div className="text-sm text-blue-200">Monthly Savings</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-200">Local Processing:</span>
                    <span className="text-green-400">{costSavings.localProcessing}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-200">Cloud Fallback:</span>
                    <span className="text-yellow-400">{costSavings.cloudFallback}%</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-white/10">
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-blue-200">DeepSeek R1:</span>
                      <span className="text-green-400">${costSavings.deepSeekCost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-200">Llama Local:</span>
                      <span className="text-green-400">${costSavings.llamaCost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-200">OpenAI:</span>
                      <span className="text-red-400">${costSavings.openAICost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-200">Anthropic:</span>
                      <span className="text-red-400">${costSavings.anthropicCost}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/50 rounded-lg p-3 text-white text-sm transition-all">
                  <Play className="w-4 h-4 mx-auto mb-1" />
                  Start Task
                </button>
                <button className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/50 rounded-lg p-3 text-white text-sm transition-all">
                  <Monitor className="w-4 h-4 mx-auto mb-1" />
                  Monitor
                </button>
                <button className="bg-green-500/20 hover:bg-green-500/30 border border-green-400/50 rounded-lg p-3 text-white text-sm transition-all">
                  <Download className="w-4 h-4 mx-auto mb-1" />
                  Export
                </button>
                <button className="bg-orange-500/20 hover:bg-orange-500/30 border border-orange-400/50 rounded-lg p-3 text-white text-sm transition-all">
                  <Settings className="w-4 h-4 mx-auto mb-1" />
                  Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReVoAgentMainDashboard;