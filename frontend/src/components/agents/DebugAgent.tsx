import React, { useState, useEffect } from 'react';
import { 
  Bug, 
  Play, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  FileText,
  Search,
  Zap,
  Target
} from 'lucide-react';
import { api } from '../../services/api';

interface DebugIssue {
  id: string;
  type: 'error' | 'warning' | 'performance' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  file: string;
  line: number;
  suggestion: string;
  status: 'detected' | 'analyzing' | 'fixed' | 'ignored';
}

interface DebugSession {
  id: string;
  status: 'idle' | 'scanning' | 'analyzing' | 'fixing' | 'completed';
  progress: number;
  issues_found: number;
  issues_fixed: number;
  files_scanned: number;
  current_file: string;
}

export function DebugAgent() {
  const [codeInput, setCodeInput] = useState(`def calculate_total(items):
    total = 0
    for item in items:
        if item.price > 0:
            total += item.price * item.quantity
        else:
            print("Invalid price for item:", item.name)
    return total

# Example usage
items = [
    {"name": "Apple", "price": 1.50, "quantity": 5},
    {"name": "Banana", "price": -0.80, "quantity": 3},  # Bug: negative price
    {"name": "Orange", "price": 2.00, "quantity": 0}   # Edge case: zero quantity
]

result = calculate_total(items)`);
  
  const [session, setSession] = useState<DebugSession | null>(null);
  const [issues, setIssues] = useState<DebugIssue[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<DebugIssue | null>(null);

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const response = await api.post('/agents/debug/analyze', {
        code: codeInput,
        language: 'python'
      });
      
      const sessionId = (response.data as any).session_id;
      pollSession(sessionId);
    } catch (error) {
      console.error('Failed to start analysis:', error);
      setIsAnalyzing(false);
      // Mock data for demo
      startMockAnalysis();
    }
  };

  const startMockAnalysis = () => {
    const mockSession: DebugSession = {
      id: 'mock-session',
      status: 'scanning',
      progress: 0,
      issues_found: 0,
      issues_fixed: 0,
      files_scanned: 0,
      current_file: 'main.py'
    };
    
    setSession(mockSession);
    
    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setSession(prev => prev ? { ...prev, progress, files_scanned: Math.floor(progress / 20) } : null);
      
      if (progress >= 100) {
        clearInterval(interval);
        setSession(prev => prev ? { ...prev, status: 'completed' } : null);
        setIsAnalyzing(false);
        
        // Add mock issues
        setIssues([
          {
            id: '1',
            type: 'error',
            severity: 'high',
            title: 'Negative Price Validation',
            description: 'The code allows negative prices which could lead to incorrect calculations.',
            file: 'main.py',
            line: 6,
            suggestion: 'Add validation to ensure price is non-negative before processing.',
            status: 'detected'
          },
          {
            id: '2',
            type: 'warning',
            severity: 'medium',
            title: 'Zero Quantity Edge Case',
            description: 'Items with zero quantity are processed but contribute nothing to the total.',
            file: 'main.py',
            line: 4,
            suggestion: 'Consider skipping items with zero quantity to improve performance.',
            status: 'detected'
          },
          {
            id: '3',
            type: 'performance',
            severity: 'low',
            title: 'Inefficient Loop',
            description: 'The loop could be optimized using list comprehension.',
            file: 'main.py',
            line: 3,
            suggestion: 'Use sum() with generator expression for better performance.',
            status: 'detected'
          }
        ]);
      }
    }, 500);
  };

  const pollSession = async (sessionId: string) => {
    try {
      const response = await api.get(`/agents/debug/session/${sessionId}`);
      setSession((response.data as any).session);
      setIssues((response.data as any).issues);
      
      if ((response.data as any).session.status !== 'completed') {
        setTimeout(() => pollSession(sessionId), 2000);
      } else {
        setIsAnalyzing(false);
      }
    } catch (error) {
      console.error('Failed to poll session:', error);
      setIsAnalyzing(false);
    }
  };

  const fixIssue = async (issueId: string) => {
    try {
      await api.post(`/agents/debug/fix/${issueId}`);
      setIssues(prev => prev.map(issue => 
        issue.id === issueId ? { ...issue, status: 'fixed' } : issue
      ));
    } catch (error) {
      console.error('Failed to fix issue:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'performance': return <Zap className="w-4 h-4" />;
      case 'security': return <Target className="w-4 h-4" />;
      default: return <Bug className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 animate-fade-in">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Bug className="w-8 h-8 text-red-600" />
          <h1 className="text-2xl font-bold text-gray-900">Debug Agent</h1>
        </div>
        <p className="text-gray-600">
          Intelligent debugging agent that automatically identifies, analyzes, and fixes code issues.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Code Input & Analysis */}
        <div className="xl:col-span-2 space-y-6">
          {/* Code Input */}
          <div className="metric-card">
            <h3 className="text-lg font-semibold mb-4">Code Analysis</h3>
            <textarea
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              className="w-full h-64 p-3 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Paste your code here for analysis..."
            />
            
            <div className="mt-4">
              <button
                onClick={startAnalysis}
                disabled={isAnalyzing}
                className="btn-primary flex items-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Start Analysis
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Analysis Progress */}
          {session && (
            <div className="metric-card">
              <h3 className="text-lg font-semibold mb-4">Analysis Progress</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    session.status === 'completed' ? 'bg-green-100 text-green-800' :
                    session.status === 'scanning' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                  </span>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm text-gray-500">{session.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${session.progress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-red-600">{session.issues_found}</div>
                    <div className="text-sm text-gray-500">Issues Found</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{session.issues_fixed}</div>
                    <div className="text-sm text-gray-500">Issues Fixed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{session.files_scanned}</div>
                    <div className="text-sm text-gray-500">Files Scanned</div>
                  </div>
                </div>

                {session.current_file && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm text-blue-700">Currently analyzing: </span>
                    <span className="text-sm font-medium text-blue-800">{session.current_file}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Issues List */}
          {issues.length > 0 && (
            <div className="metric-card">
              <h3 className="text-lg font-semibold mb-4">Detected Issues</h3>
              <div className="space-y-3">
                {issues.map(issue => (
                  <div 
                    key={issue.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedIssue?.id === issue.id ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedIssue(issue)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-1 rounded ${getSeverityColor(issue.severity)}`}>
                          {getTypeIcon(issue.type)}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{issue.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{issue.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>{issue.file}:{issue.line}</span>
                            <span className={`px-2 py-1 rounded-full ${getSeverityColor(issue.severity)}`}>
                              {issue.severity}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {issue.status === 'fixed' ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              fixIssue(issue.id);
                            }}
                            className="btn-secondary text-xs"
                          >
                            Fix
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Issue Details & Suggestions */}
        <div className="space-y-6">
          {/* Issue Details */}
          {selectedIssue && (
            <div className="metric-card">
              <h3 className="text-lg font-semibold mb-4">Issue Details</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1 rounded ${getSeverityColor(selectedIssue.severity)}`}>
                      {getTypeIcon(selectedIssue.type)}
                    </div>
                    <h4 className="font-medium text-gray-900">{selectedIssue.title}</h4>
                  </div>
                  <p className="text-sm text-gray-600">{selectedIssue.description}</p>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Location</h5>
                  <div className="p-2 bg-gray-100 rounded text-sm font-mono">
                    {selectedIssue.file}:{selectedIssue.line}
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Suggested Fix</h5>
                  <p className="text-sm text-gray-600 p-3 bg-green-50 rounded-lg border border-green-200">
                    {selectedIssue.suggestion}
                  </p>
                </div>

                <button
                  onClick={() => fixIssue(selectedIssue.id)}
                  disabled={selectedIssue.status === 'fixed'}
                  className={`w-full ${
                    selectedIssue.status === 'fixed' 
                      ? 'btn-secondary opacity-50 cursor-not-allowed' 
                      : 'btn-primary'
                  } flex items-center justify-center gap-2`}
                >
                  {selectedIssue.status === 'fixed' ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Fixed
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Apply Fix
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Analysis Summary */}
          <div className="metric-card">
            <h3 className="text-lg font-semibold mb-4">Analysis Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Issues:</span>
                <span className="font-medium">{issues.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Critical:</span>
                <span className="font-medium text-red-600">
                  {issues.filter(i => i.severity === 'critical').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">High:</span>
                <span className="font-medium text-orange-600">
                  {issues.filter(i => i.severity === 'high').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Medium:</span>
                <span className="font-medium text-yellow-600">
                  {issues.filter(i => i.severity === 'medium').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Low:</span>
                <span className="font-medium text-blue-600">
                  {issues.filter(i => i.severity === 'low').length}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm text-gray-600">Fixed:</span>
                <span className="font-medium text-green-600">
                  {issues.filter(i => i.status === 'fixed').length}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="metric-card">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full btn-secondary text-left">
                <Zap className="w-4 h-4 inline mr-2" />
                Fix All Critical Issues
              </button>
              <button className="w-full btn-secondary text-left">
                <FileText className="w-4 h-4 inline mr-2" />
                Generate Report
              </button>
              <button className="w-full btn-secondary text-left">
                <Target className="w-4 h-4 inline mr-2" />
                Security Scan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}