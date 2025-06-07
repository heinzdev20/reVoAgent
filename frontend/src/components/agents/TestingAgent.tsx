import React, { useState } from 'react';
import { TestTube, Play, CheckCircle, XCircle, Clock } from 'lucide-react';

const TestingAgent: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [testConfig, setTestConfig] = useState({
    testType: 'unit',
    coverage: true,
    parallel: true,
    timeout: 30
  });

  const runTests = async () => {
    setIsRunning(true);
    try {
      const response = await fetch('/api/v1/agents/testing/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent_type: 'testing',
          description: 'Run comprehensive test suite',
          parameters: testConfig
        }),
      });
      
      if (response.ok) {
        const results = await response.json();
        setTestResults(results);
      }
    } catch (error) {
      console.error('Error running tests:', error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <TestTube className="h-8 w-8 text-cyan-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Testing Agent</h1>
          <p className="text-gray-600">Comprehensive test generation and execution with coverage analysis</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Configuration */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Configuration</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Test Type</label>
              <select
                value={testConfig.testType}
                onChange={(e) => setTestConfig({...testConfig, testType: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="unit">Unit Tests</option>
                <option value="integration">Integration Tests</option>
                <option value="e2e">End-to-End Tests</option>
                <option value="all">All Tests</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={testConfig.coverage}
                  onChange={(e) => setTestConfig({...testConfig, coverage: e.target.checked})}
                  className="mr-2"
                />
                <span className="text-sm">Generate Coverage Report</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={testConfig.parallel}
                  onChange={(e) => setTestConfig({...testConfig, parallel: e.target.checked})}
                  className="mr-2"
                />
                <span className="text-sm">Parallel Execution</span>
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timeout (seconds)</label>
              <input
                type="number"
                value={testConfig.timeout}
                onChange={(e) => setTestConfig({...testConfig, timeout: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                min="10"
                max="300"
              />
            </div>
          </div>
          
          <button
            onClick={runTests}
            disabled={isRunning}
            className="w-full mt-6 flex items-center justify-center space-x-2 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isRunning ? (
              <>
                <Clock className="h-5 w-5 animate-spin" />
                <span>Running Tests...</span>
              </>
            ) : (
              <>
                <Play className="h-5 w-5" />
                <span>Run Tests</span>
              </>
            )}
          </button>
        </div>

        {/* Test Results */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Results</h3>
          
          {testResults ? (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{testResults.tests_passed}</div>
                  <div className="text-sm text-green-700">Passed</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{testResults.tests_failed}</div>
                  <div className="text-sm text-red-700">Failed</div>
                </div>
              </div>
              
              {/* Coverage */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-blue-700">Coverage</span>
                  <span className="text-sm font-bold text-blue-600">{testResults.coverage}%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${testResults.coverage}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Duration */}
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-semibold text-gray-700">{testResults.duration}</div>
                <div className="text-sm text-gray-600">Total Duration</div>
              </div>
              
              {/* Individual Test Results */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                <h4 className="font-medium text-gray-900">Test Details</h4>
                {testResults.results?.map((test: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      {test.status === 'passed' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-sm font-medium">{test.test}</span>
                    </div>
                    <span className="text-xs text-gray-500">{test.duration}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <TestTube className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>No test results yet. Run tests to see results here.</p>
            </div>
          )}
        </div>
      </div>

      {/* Test History */}
      <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Test Runs</h3>
        <div className="space-y-3">
          {[
            { id: 1, type: 'Unit Tests', passed: 45, failed: 2, coverage: 89.3, duration: '2.4s', time: '2 min ago' },
            { id: 2, type: 'Integration Tests', passed: 23, failed: 1, coverage: 76.8, duration: '8.1s', time: '15 min ago' },
            { id: 3, type: 'E2E Tests', passed: 12, failed: 0, coverage: 92.1, duration: '45.2s', time: '1 hour ago' }
          ].map((run) => (
            <div key={run.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="text-sm font-medium text-gray-900">{run.type}</div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span className="text-green-600">{run.passed} passed</span>
                  <span className="text-red-600">{run.failed} failed</span>
                  <span>{run.coverage}% coverage</span>
                </div>
              </div>
              <div className="text-xs text-gray-500">{run.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestingAgent;