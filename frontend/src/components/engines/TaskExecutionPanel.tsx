/**
 * 🎯 Task Execution Panel
 * 
 * Interactive interface for executing tasks across the Three-Engine Architecture
 * with real-time progress tracking and result visualization.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Square, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Brain, 
  Zap, 
  Palette, 
  Settings,
  Code,
  Search,
  Lightbulb,
  ArrowRight,
  Loader2
} from 'lucide-react';

import { useEngineWebSocket } from '@/hooks/useEngineWebSocket';

// Types
interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  engine: string;
  icon: React.ComponentType<any>;
  color: string;
  inputs: TaskInput[];
  example: Record<string, any>;
}

interface TaskInput {
  name: string;
  type: 'text' | 'textarea' | 'number' | 'select';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  defaultValue?: any;
}

interface TaskExecution {
  id: string;
  templateId: string;
  engine: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  inputs: Record<string, any>;
  result?: any;
  error?: string;
  progress?: number;
}

// Task templates for each engine
const taskTemplates: TaskTemplate[] = [
  // Perfect Recall Engine Tasks
  {
    id: 'store_context',
    name: 'Store Context',
    description: 'Store code or conversation context for future retrieval',
    engine: 'perfect_recall',
    icon: Brain,
    color: 'blue',
    inputs: [
      { name: 'content', type: 'textarea', label: 'Content', placeholder: 'Enter code or text to store...', required: true },
      { name: 'context_type', type: 'select', label: 'Context Type', options: ['code', 'conversation', 'documentation', 'error'], defaultValue: 'code' },
      { name: 'session_id', type: 'text', label: 'Session ID', placeholder: 'session_123', defaultValue: 'default_session' }
    ],
    example: {
      content: 'def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)',
      context_type: 'code',
      session_id: 'demo_session'
    }
  },
  {
    id: 'retrieve_context',
    name: 'Retrieve Context',
    description: 'Search and retrieve stored context with sub-100ms speed',
    engine: 'perfect_recall',
    icon: Search,
    color: 'blue',
    inputs: [
      { name: 'query', type: 'text', label: 'Search Query', placeholder: 'fibonacci function', required: true },
      { name: 'limit', type: 'number', label: 'Result Limit', defaultValue: 10 },
      { name: 'session_id', type: 'text', label: 'Session ID', placeholder: 'session_123' }
    ],
    example: {
      query: 'fibonacci recursive algorithm',
      limit: 5,
      session_id: 'demo_session'
    }
  },

  // Parallel Mind Engine Tasks
  {
    id: 'parallel_analysis',
    name: 'Parallel Code Analysis',
    description: 'Analyze code using multiple parallel workers',
    engine: 'parallel_mind',
    icon: Zap,
    color: 'purple',
    inputs: [
      { name: 'code', type: 'textarea', label: 'Code to Analyze', placeholder: 'Enter code for analysis...', required: true },
      { name: 'analysis_types', type: 'select', label: 'Analysis Types', options: ['syntax', 'complexity', 'security', 'performance', 'all'], defaultValue: 'all' },
      { name: 'worker_count', type: 'number', label: 'Worker Count', defaultValue: 4 }
    ],
    example: {
      code: 'class Calculator:\n    def add(self, a, b):\n        return a + b\n    def divide(self, a, b):\n        return a / b',
      analysis_types: 'all',
      worker_count: 4
    }
  },
  {
    id: 'parallel_testing',
    name: 'Parallel Test Execution',
    description: 'Run tests across multiple workers simultaneously',
    engine: 'parallel_mind',
    icon: CheckCircle,
    color: 'purple',
    inputs: [
      { name: 'test_suite', type: 'textarea', label: 'Test Suite', placeholder: 'Enter test cases...', required: true },
      { name: 'test_type', type: 'select', label: 'Test Type', options: ['unit', 'integration', 'performance', 'security'], defaultValue: 'unit' },
      { name: 'parallel_workers', type: 'number', label: 'Parallel Workers', defaultValue: 8 }
    ],
    example: {
      test_suite: 'test_calculator.py\ntest_api_endpoints.py\ntest_database.py',
      test_type: 'unit',
      parallel_workers: 6
    }
  },

  // Creative Engine Tasks
  {
    id: 'generate_solutions',
    name: 'Generate Creative Solutions',
    description: 'Generate 3-5 innovative solutions for a problem',
    engine: 'creative',
    icon: Lightbulb,
    color: 'pink',
    inputs: [
      { name: 'problem', type: 'textarea', label: 'Problem Statement', placeholder: 'Describe the problem to solve...', required: true },
      { name: 'domain', type: 'select', label: 'Domain', options: ['web_development', 'data_processing', 'api_design', 'mobile_app', 'general'], defaultValue: 'general' },
      { name: 'innovation_level', type: 'number', label: 'Innovation Level (0-1)', defaultValue: 0.7 },
      { name: 'constraints', type: 'textarea', label: 'Constraints', placeholder: 'List any constraints...' }
    ],
    example: {
      problem: 'Design a scalable real-time chat application that can handle millions of users',
      domain: 'web_development',
      innovation_level: 0.8,
      constraints: 'Budget: $50k, Timeline: 3 months, Must use existing infrastructure'
    }
  },
  {
    id: 'optimize_code',
    name: 'Creative Code Optimization',
    description: 'Generate creative optimization strategies for code',
    engine: 'creative',
    icon: Palette,
    color: 'pink',
    inputs: [
      { name: 'code', type: 'textarea', label: 'Code to Optimize', placeholder: 'Enter code for optimization...', required: true },
      { name: 'optimization_goals', type: 'select', label: 'Optimization Goals', options: ['performance', 'readability', 'maintainability', 'memory', 'all'], defaultValue: 'performance' },
      { name: 'creativity_level', type: 'number', label: 'Creativity Level (0-1)', defaultValue: 0.6 }
    ],
    example: {
      code: 'def slow_function(data):\n    result = []\n    for item in data:\n        if item % 2 == 0:\n            result.append(item * 2)\n    return result',
      optimization_goals: 'performance',
      creativity_level: 0.7
    }
  },

  // Coordinator Tasks
  {
    id: 'multi_engine_workflow',
    name: 'Multi-Engine Workflow',
    description: 'Execute a complex workflow across multiple engines',
    engine: 'coordinator',
    icon: Settings,
    color: 'green',
    inputs: [
      { name: 'workflow_type', type: 'select', label: 'Workflow Type', options: ['debugging', 'code_generation', 'analysis', 'optimization'], defaultValue: 'debugging' },
      { name: 'input_data', type: 'textarea', label: 'Input Data', placeholder: 'Enter workflow input...', required: true },
      { name: 'coordination_strategy', type: 'select', label: 'Strategy', options: ['sequential', 'parallel', 'adaptive'], defaultValue: 'adaptive' }
    ],
    example: {
      workflow_type: 'debugging',
      input_data: 'Bug: Application crashes when processing large datasets',
      coordination_strategy: 'adaptive'
    }
  }
];

const TaskExecutionPanel: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null);
  const [taskInputs, setTaskInputs] = useState<Record<string, any>>({});
  const [executions, setExecutions] = useState<TaskExecution[]>([]);
  const [activeTab, setActiveTab] = useState('templates');

  const { 
    isConnected, 
    executeTask, 
    engineData,
    getEngineStatus 
  } = useEngineWebSocket('ws://localhost:8000/ws/engines', {
    onTaskUpdate: (data) => {
      setExecutions(prev => prev.map(exec => 
        exec.id === data.task_id 
          ? { ...exec, status: data.status, progress: data.progress, result: data.result, error: data.error }
          : exec
      ));
    }
  });

  // Initialize inputs when template changes
  useEffect(() => {
    if (selectedTemplate) {
      const initialInputs: Record<string, any> = {};
      selectedTemplate.inputs.forEach(input => {
        initialInputs[input.name] = input.defaultValue || '';
      });
      setTaskInputs(initialInputs);
    }
  }, [selectedTemplate]);

  const handleInputChange = (name: string, value: any) => {
    setTaskInputs(prev => ({ ...prev, [name]: value }));
  };

  const executeSelectedTask = () => {
    if (!selectedTemplate || !isConnected) return;

    const execution: TaskExecution = {
      id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      templateId: selectedTemplate.id,
      engine: selectedTemplate.engine,
      status: 'pending',
      startTime: new Date(),
      inputs: { ...taskInputs }
    };

    setExecutions(prev => [execution, ...prev]);

    // Execute the task
    executeTask(selectedTemplate.engine, {
      task_id: execution.id,
      task_type: selectedTemplate.id,
      inputs: taskInputs
    });

    // Update status to running
    setTimeout(() => {
      setExecutions(prev => prev.map(exec => 
        exec.id === execution.id ? { ...exec, status: 'running' } : exec
      ));
    }, 100);

    setActiveTab('executions');
  };

  const loadExample = () => {
    if (selectedTemplate) {
      setTaskInputs(selectedTemplate.example);
    }
  };

  const getEngineIcon = (engine: string) => {
    switch (engine) {
      case 'perfect_recall': return Brain;
      case 'parallel_mind': return Zap;
      case 'creative': return Palette;
      case 'coordinator': return Settings;
      default: return Code;
    }
  };

  const getEngineColor = (engine: string) => {
    switch (engine) {
      case 'perfect_recall': return 'blue';
      case 'parallel_mind': return 'purple';
      case 'creative': return 'pink';
      case 'coordinator': return 'green';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'running': return Loader2;
      case 'completed': return CheckCircle;
      case 'failed': return XCircle;
      default: return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'yellow';
      case 'running': return 'blue';
      case 'completed': return 'green';
      case 'failed': return 'red';
      default: return 'gray';
    }
  };

  const renderTaskInput = (input: TaskInput) => {
    const value = taskInputs[input.name] || '';

    switch (input.type) {
      case 'textarea':
        return (
          <Textarea
            placeholder={input.placeholder}
            value={value}
            onChange={(e) => handleInputChange(input.name, e.target.value)}
            className="min-h-[100px]"
          />
        );
      
      case 'select':
        return (
          <Select value={value} onValueChange={(val) => handleInputChange(input.name, val)}>
            <SelectTrigger>
              <SelectValue placeholder={`Select ${input.label}`} />
            </SelectTrigger>
            <SelectContent>
              {input.options?.map(option => (
                <SelectItem key={option} value={option}>
                  {option.replace('_', ' ').toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'number':
        return (
          <Input
            type="number"
            placeholder={input.placeholder}
            value={value}
            onChange={(e) => handleInputChange(input.name, parseFloat(e.target.value) || 0)}
          />
        );
      
      default:
        return (
          <Input
            placeholder={input.placeholder}
            value={value}
            onChange={(e) => handleInputChange(input.name, e.target.value)}
          />
        );
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">🎯 Task Execution Center</h1>
        <div className="flex items-center gap-2">
          <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates">Task Templates</TabsTrigger>
          <TabsTrigger value="executions">
            Executions ({executions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Template Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Available Task Templates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {taskTemplates.map(template => {
                  const Icon = template.icon;
                  const engineStatus = getEngineStatus(template.engine);
                  const isEngineOnline = engineStatus !== 'offline';
                  
                  return (
                    <div
                      key={template.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedTemplate?.id === template.id 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
                          : 'border-gray-200 hover:border-gray-300'
                      } ${!isEngineOnline ? 'opacity-50' : ''}`}
                      onClick={() => isEngineOnline && setSelectedTemplate(template)}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className={`h-5 w-5 text-${template.color}-500 mt-0.5`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{template.name}</h3>
                            <Badge variant={isEngineOnline ? 'default' : 'secondary'}>
                              {template.engine.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {template.description}
                          </p>
                          {!isEngineOnline && (
                            <p className="text-xs text-red-500 mt-1">
                              Engine offline
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Task Configuration */}
            {selectedTemplate && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <selectedTemplate.icon className={`h-5 w-5 text-${selectedTemplate.color}-500`} />
                    {selectedTemplate.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedTemplate.inputs.map(input => (
                    <div key={input.name} className="space-y-2">
                      <label className="text-sm font-medium">
                        {input.label}
                        {input.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {renderTaskInput(input)}
                    </div>
                  ))}

                  <div className="flex gap-2 pt-4">
                    <Button 
                      onClick={executeSelectedTask}
                      disabled={!isConnected || getEngineStatus(selectedTemplate.engine) === 'offline'}
                      className="flex-1"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Execute Task
                    </Button>
                    <Button variant="outline" onClick={loadExample}>
                      Load Example
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="executions" className="space-y-4">
          {executions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No Task Executions
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Execute a task from the templates tab to see results here.
                </p>
              </CardContent>
            </Card>
          ) : (
            executions.map(execution => {
              const template = taskTemplates.find(t => t.id === execution.templateId);
              const StatusIcon = getStatusIcon(execution.status);
              const EngineIcon = getEngineIcon(execution.engine);
              
              return (
                <Card key={execution.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <EngineIcon className={`h-5 w-5 text-${getEngineColor(execution.engine)}-500`} />
                        <div>
                          <CardTitle className="text-lg">{template?.name || 'Unknown Task'}</CardTitle>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {execution.engine.replace('_', ' ')} • {execution.startTime.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <Badge className={`bg-${getStatusColor(execution.status)}-500 text-white`}>
                        <StatusIcon className={`h-3 w-3 mr-1 ${execution.status === 'running' ? 'animate-spin' : ''}`} />
                        {execution.status.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {execution.status === 'running' && execution.progress !== undefined && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{execution.progress}%</span>
                        </div>
                        <Progress value={execution.progress} />
                      </div>
                    )}

                    {execution.error && (
                      <Alert className="border-red-500 bg-red-50 dark:bg-red-950/20">
                        <XCircle className="h-4 w-4" />
                        <AlertDescription>{execution.error}</AlertDescription>
                      </Alert>
                    )}

                    {execution.result && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Result:</h4>
                        <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-auto max-h-40">
                          {JSON.stringify(execution.result, null, 2)}
                        </pre>
                      </div>
                    )}

                    <details className="space-y-2">
                      <summary className="cursor-pointer text-sm font-medium">Task Inputs</summary>
                      <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-auto max-h-32">
                        {JSON.stringify(execution.inputs, null, 2)}
                      </pre>
                    </details>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TaskExecutionPanel;