import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  Upload, 
  Download, 
  Eye, 
  EyeOff,
  AlertCircle,
  CheckCircle,
  Code,
  Database,
  Shield,
  Zap
} from 'lucide-react';

interface ConfigSection {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  configs: ConfigItem[];
}

interface ConfigItem {
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'password';
  description: string;
  required: boolean;
  sensitive?: boolean;
}

export const ConfigurationManager: React.FC = () => {
  const [sections, setSections] = useState<ConfigSection[]>([
    {
      id: 'environment',
      name: 'Environment Settings',
      description: 'Core environment and runtime configuration',
      icon: <Settings className="w-5 h-5" />,
      configs: [
        {
          key: 'environment',
          value: 'development',
          type: 'string',
          description: 'Current environment (development, staging, production)',
          required: true
        },
        {
          key: 'debug',
          value: true,
          type: 'boolean',
          description: 'Enable debug mode for detailed logging',
          required: false
        },
        {
          key: 'log_level',
          value: 'INFO',
          type: 'string',
          description: 'Logging level (DEBUG, INFO, WARNING, ERROR)',
          required: true
        },
        {
          key: 'max_workers',
          value: 4,
          type: 'number',
          description: 'Maximum number of worker processes',
          required: true
        }
      ]
    },
    {
      id: 'engines',
      name: 'Engine Configuration',
      description: 'Three-Engine Architecture settings',
      icon: <Zap className="w-5 h-5" />,
      configs: [
        {
          key: 'perfect_recall_enabled',
          value: true,
          type: 'boolean',
          description: 'Enable Perfect Recall Engine',
          required: true
        },
        {
          key: 'parallel_mind_enabled',
          value: true,
          type: 'boolean',
          description: 'Enable Parallel Mind Engine',
          required: true
        },
        {
          key: 'creative_engine_enabled',
          value: true,
          type: 'boolean',
          description: 'Enable Creative Engine',
          required: true
        },
        {
          key: 'engine_timeout',
          value: 300,
          type: 'number',
          description: 'Engine operation timeout in seconds',
          required: true
        },
        {
          key: 'max_concurrent_tasks',
          value: 10,
          type: 'number',
          description: 'Maximum concurrent tasks per engine',
          required: true
        }
      ]
    },
    {
      id: 'ai_models',
      name: 'AI Model Settings',
      description: 'AI model configuration and API keys',
      icon: <Code className="w-5 h-5" />,
      configs: [
        {
          key: 'deepseek_api_key',
          value: 'sk-*********************',
          type: 'password',
          description: 'DeepSeek API key for R1 model access',
          required: true,
          sensitive: true
        },
        {
          key: 'openai_api_key',
          value: '',
          type: 'password',
          description: 'OpenAI API key for GPT models',
          required: false,
          sensitive: true
        },
        {
          key: 'default_model',
          value: 'deepseek-r1',
          type: 'string',
          description: 'Default AI model for code generation',
          required: true
        },
        {
          key: 'max_tokens',
          value: 4000,
          type: 'number',
          description: 'Maximum tokens per AI request',
          required: true
        },
        {
          key: 'temperature',
          value: 0.7,
          type: 'number',
          description: 'AI model temperature (0.0 - 1.0)',
          required: true
        }
      ]
    },
    {
      id: 'database',
      name: 'Database Configuration',
      description: 'Database connections and settings',
      icon: <Database className="w-5 h-5" />,
      configs: [
        {
          key: 'database_url',
          value: 'postgresql://localhost:5432/revoagent',
          type: 'string',
          description: 'Primary database connection URL',
          required: true
        },
        {
          key: 'redis_url',
          value: 'redis://localhost:6379',
          type: 'string',
          description: 'Redis cache connection URL',
          required: true
        },
        {
          key: 'connection_pool_size',
          value: 20,
          type: 'number',
          description: 'Database connection pool size',
          required: true
        },
        {
          key: 'query_timeout',
          value: 30,
          type: 'number',
          description: 'Database query timeout in seconds',
          required: true
        }
      ]
    },
    {
      id: 'security',
      name: 'Security Settings',
      description: 'Authentication, authorization, and security policies',
      icon: <Shield className="w-5 h-5" />,
      configs: [
        {
          key: 'jwt_secret',
          value: '*********************',
          type: 'password',
          description: 'JWT token signing secret',
          required: true,
          sensitive: true
        },
        {
          key: 'session_timeout',
          value: 3600,
          type: 'number',
          description: 'User session timeout in seconds',
          required: true
        },
        {
          key: 'enable_2fa',
          value: true,
          type: 'boolean',
          description: 'Enable two-factor authentication',
          required: false
        },
        {
          key: 'allowed_origins',
          value: ['http://localhost:3000', 'https://app.revoagent.com'],
          type: 'array',
          description: 'Allowed CORS origins',
          required: true
        },
        {
          key: 'rate_limit_requests',
          value: 1000,
          type: 'number',
          description: 'Rate limit requests per hour',
          required: true
        }
      ]
    },
    {
      id: 'mcp',
      name: 'MCP Integration',
      description: 'Model Context Protocol server settings',
      icon: <Code className="w-5 h-5" />,
      configs: [
        {
          key: 'mcp_enabled',
          value: true,
          type: 'boolean',
          description: 'Enable MCP integration',
          required: true
        },
        {
          key: 'mcp_server_timeout',
          value: 30,
          type: 'number',
          description: 'MCP server connection timeout',
          required: true
        },
        {
          key: 'auto_discover_servers',
          value: true,
          type: 'boolean',
          description: 'Automatically discover MCP servers',
          required: false
        },
        {
          key: 'max_concurrent_connections',
          value: 50,
          type: 'number',
          description: 'Maximum concurrent MCP connections',
          required: true
        }
      ]
    }
  ]);

  const [activeSection, setActiveSection] = useState('environment');
  const [showSensitive, setShowSensitive] = useState<{[key: string]: boolean}>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const updateConfigValue = (sectionId: string, configKey: string, newValue: any) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? {
            ...section,
            configs: section.configs.map(config =>
              config.key === configKey ? { ...config, value: newValue } : config
            )
          }
        : section
    ));
    setHasChanges(true);
  };

  const toggleSensitiveVisibility = (key: string) => {
    setShowSensitive(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const renderConfigInput = (sectionId: string, config: ConfigItem) => {
    const inputId = `${sectionId}-${config.key}`;
    
    switch (config.type) {
      case 'boolean':
        return (
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.value}
              onChange={(e) => updateConfigValue(sectionId, config.key, e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Enabled</span>
          </label>
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={config.value}
            onChange={(e) => updateConfigValue(sectionId, config.key, parseFloat(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );
      
      case 'password':
        return (
          <div className="relative">
            <input
              type={showSensitive[inputId] ? 'text' : 'password'}
              value={config.value}
              onChange={(e) => updateConfigValue(sectionId, config.key, e.target.value)}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => toggleSensitiveVisibility(inputId)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showSensitive[inputId] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        );
      
      case 'array':
        return (
          <textarea
            value={Array.isArray(config.value) ? config.value.join('\n') : config.value}
            onChange={(e) => updateConfigValue(sectionId, config.key, e.target.value.split('\n').filter(v => v.trim()))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="One item per line"
          />
        );
      
      case 'object':
        return (
          <textarea
            value={typeof config.value === 'object' ? JSON.stringify(config.value, null, 2) : config.value}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                updateConfigValue(sectionId, config.key, parsed);
              } catch {
                // Invalid JSON, keep as string for now
                updateConfigValue(sectionId, config.key, e.target.value);
              }
            }}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            placeholder="JSON object"
          />
        );
      
      default:
        return (
          <input
            type="text"
            value={config.value}
            onChange={(e) => updateConfigValue(sectionId, config.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );
    }
  };

  const saveConfiguration = async () => {
    setSaveStatus('saving');
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveStatus('saved');
      setHasChanges(false);
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const resetConfiguration = () => {
    // Reset to default values (would typically fetch from server)
    setHasChanges(false);
    setSaveStatus('idle');
  };

  const exportConfiguration = () => {
    const config = sections.reduce((acc, section) => {
      acc[section.id] = section.configs.reduce((sectionAcc, config) => {
        sectionAcc[config.key] = config.value;
        return sectionAcc;
      }, {} as any);
      return acc;
    }, {} as any);

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'revoagent-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeConfigSection = sections.find(s => s.id === activeSection);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Configuration Manager</h1>
        <div className="flex items-center space-x-2">
          {hasChanges && (
            <span className="flex items-center space-x-1 text-yellow-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Unsaved changes</span>
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="flex items-center space-x-1 text-green-600 text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>Configuration saved</span>
            </span>
          )}
        </div>
      </div>

      <div className="flex space-x-6">
        {/* Section Navigation */}
        <div className="w-64 space-y-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeSection === section.id
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {section.icon}
              <div>
                <div className="font-medium">{section.name}</div>
                <div className="text-xs text-gray-500">{section.description}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Configuration Panel */}
        <div className="flex-1">
          {activeConfigSection && (
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {activeConfigSection.icon}
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{activeConfigSection.name}</h2>
                      <p className="text-sm text-gray-600">{activeConfigSection.description}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={exportConfiguration}
                      className="flex items-center space-x-1 px-3 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export</span>
                    </button>
                    <button
                      onClick={resetConfiguration}
                      className="flex items-center space-x-1 px-3 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Reset</span>
                    </button>
                    <button
                      onClick={saveConfiguration}
                      disabled={!hasChanges || saveStatus === 'saving'}
                      className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      <span>{saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {activeConfigSection.configs.map((config) => (
                  <div key={config.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700">
                        {config.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        {config.required && <span className="text-red-500 ml-1">*</span>}
                        {config.sensitive && (
                          <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">
                            Sensitive
                          </span>
                        )}
                      </label>
                    </div>
                    <p className="text-sm text-gray-600">{config.description}</p>
                    {renderConfigInput(activeConfigSection.id, config)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};