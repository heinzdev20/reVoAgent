import React, { useState } from 'react';
import { Globe, Play, Camera, Download, Eye, MousePointer } from 'lucide-react';

const BrowserAgent: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [automationResults, setAutomationResults] = useState<any>(null);
  const [automationConfig, setAutomationConfig] = useState({
    url: 'https://example.com',
    actions: [] as string[],
    screenshots: true,
    headless: true,
    timeout: 30
  });

  const availableActions = [
    'Navigate to page',
    'Fill forms',
    'Click buttons',
    'Extract data',
    'Take screenshots',
    'Scroll page',
    'Wait for elements',
    'Download files'
  ];

  const runAutomation = async () => {
    setIsRunning(true);
    try {
      const response = await fetch('/api/v1/agents/browser/automate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent_type: 'browser',
          description: 'Run browser automation',
          parameters: automationConfig
        }),
      });
      
      if (response.ok) {
        const results = await response.json();
        setAutomationResults(results);
      }
    } catch (error) {
      console.error('Error running automation:', error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <Globe className="h-8 w-8 text-indigo-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Browser Agent</h1>
          <p className="text-gray-600">Playwright-powered browser automation with AI-driven web interaction</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Automation Configuration */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Automation Configuration</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target URL</label>
              <input
                type="url"
                value={automationConfig.url}
                onChange={(e) => setAutomationConfig({...automationConfig, url: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Actions to Perform</label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {availableActions.map((action) => (
                  <label key={action} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={automationConfig.actions.includes(action)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAutomationConfig({
                            ...automationConfig,
                            actions: [...automationConfig.actions, action]
                          });
                        } else {
                          setAutomationConfig({
                            ...automationConfig,
                            actions: automationConfig.actions.filter(a => a !== action)
                          });
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">{action}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={automationConfig.screenshots}
                  onChange={(e) => setAutomationConfig({...automationConfig, screenshots: e.target.checked})}
                  className="mr-2"
                />
                <span className="text-sm">Take Screenshots</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={automationConfig.headless}
                  onChange={(e) => setAutomationConfig({...automationConfig, headless: e.target.checked})}
                  className="mr-2"
                />
                <span className="text-sm">Headless Mode</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timeout (seconds)</label>
              <input
                type="number"
                value={automationConfig.timeout}
                onChange={(e) => setAutomationConfig({...automationConfig, timeout: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                min="10"
                max="300"
              />
            </div>
          </div>
          
          <button
            onClick={runAutomation}
            disabled={isRunning || !automationConfig.url || automationConfig.actions.length === 0}
            className="w-full mt-6 flex items-center justify-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isRunning ? (
              <>
                <MousePointer className="h-5 w-5 animate-pulse" />
                <span>Running Automation...</span>
              </>
            ) : (
              <>
                <Play className="h-5 w-5" />
                <span>Start Automation</span>
              </>
            )}
          </button>
        </div>

        {/* Automation Results */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Automation Results</h3>
          
          {automationResults ? (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{automationResults.pages_visited}</div>
                  <div className="text-sm text-blue-700">Pages Visited</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{automationResults.data_extracted}</div>
                  <div className="text-sm text-green-700">Data Points</div>
                </div>
              </div>
              
              {/* Success Rate */}
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-purple-700">Success Rate</span>
                  <span className="text-sm font-bold text-purple-600">{automationResults.success_rate}%</span>
                </div>
                <div className="w-full bg-purple-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${automationResults.success_rate}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Duration */}
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-semibold text-gray-700">{automationResults.duration}</div>
                <div className="text-sm text-gray-600">Total Duration</div>
              </div>
              
              {/* Action Results */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Action Results</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Forms Filled:</span>
                    <span className="ml-1 font-medium">{automationResults.results?.forms_filled}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Buttons Clicked:</span>
                    <span className="ml-1 font-medium">{automationResults.results?.buttons_clicked}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Screenshots:</span>
                    <span className="ml-1 font-medium">{automationResults.screenshots_taken}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Errors:</span>
                    <span className="ml-1 font-medium text-red-600">{automationResults.results?.errors}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Globe className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>No automation results yet. Run automation to see results here.</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Eye className="h-5 w-5 text-blue-600" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Page Screenshot</div>
              <div className="text-sm text-gray-600">Capture current page</div>
            </div>
          </button>
          
          <button className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="h-5 w-5 text-green-600" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Extract Data</div>
              <div className="text-sm text-gray-600">Scrape page content</div>
            </div>
          </button>
          
          <button className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Camera className="h-5 w-5 text-purple-600" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Record Session</div>
              <div className="text-sm text-gray-600">Record interactions</div>
            </div>
          </button>
        </div>
      </div>

      {/* Automation History */}
      <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Automations</h3>
        <div className="space-y-3">
          {[
            { id: 1, url: 'https://example.com', actions: 5, success: 94.7, duration: '45.2s', time: '5 min ago' },
            { id: 2, url: 'https://test-site.com', actions: 8, success: 87.5, duration: '1m 23s', time: '20 min ago' },
            { id: 3, url: 'https://demo.app', actions: 3, success: 100, duration: '28.1s', time: '1 hour ago' }
          ].map((automation) => (
            <div key={automation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="text-sm font-medium text-gray-900">{automation.url}</div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>{automation.actions} actions</span>
                  <span className="text-green-600">{automation.success}% success</span>
                  <span>{automation.duration}</span>
                </div>
              </div>
              <div className="text-xs text-gray-500">{automation.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrowserAgent;