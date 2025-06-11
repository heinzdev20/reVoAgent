/**
 * Enhanced chat component with memory capabilities
 * Extends existing chat interface with memory context and visualization
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MessageCircle, 
  Brain, 
  History, 
  Lightbulb, 
  TrendingUp,
  Database,
  Zap,
  User,
  Bot,
  Settings,
  BarChart3,
  Network,
  Clock,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MemoryEnabledChat = ({ 
  sessionId, 
  agents = ['general'], 
  enableMemory = true,
  showMemoryContext = true,
  onMemoryUpdate = null
}) => {
  // State management
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [memoryContext, setMemoryContext] = useState(null);
  const [showMemoryPanel, setShowMemoryPanel] = useState(false);
  const [memoryStats, setMemoryStats] = useState(null);
  const [selectedAgents, setSelectedAgents] = useState(agents);
  const [wsConnection, setWsConnection] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  
  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const wsRef = useRef(null);
  
  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(scrollToBottom, [messages]);

  // WebSocket connection management
  useEffect(() => {
    if (enableMemory && sessionId) {
      connectWebSocket();
    }
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [sessionId, enableMemory]);

  // Load memory stats on mount
  useEffect(() => {
    if (enableMemory) {
      loadMemoryStats();
    }
  }, [enableMemory]);

  const connectWebSocket = useCallback(() => {
    try {
      const wsUrl = `ws://localhost:8000/api/memory/ws/${sessionId}`;
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        setConnectionStatus('connected');
        setWsConnection(ws);
        wsRef.current = ws;
        console.log('Memory WebSocket connected');
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      };
      
      ws.onclose = () => {
        setConnectionStatus('disconnected');
        setWsConnection(null);
        wsRef.current = null;
        console.log('Memory WebSocket disconnected');
        
        // Attempt to reconnect after 3 seconds
        setTimeout(() => {
          if (enableMemory && sessionId) {
            connectWebSocket();
          }
        }, 3000);
      };
      
      ws.onerror = (error) => {
        console.error('Memory WebSocket error:', error);
        setConnectionStatus('error');
      };
      
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      setConnectionStatus('error');
    }
  }, [sessionId, enableMemory]);

  const handleWebSocketMessage = useCallback((data) => {
    switch (data.type) {
      case 'memory_chat_complete':
        handleMemoryChatResponse(data);
        break;
      case 'agent_response':
        handleAgentResponse(data);
        break;
      case 'processing':
        handleProcessingStatus(data);
        break;
      case 'error':
        handleError(data);
        break;
      default:
        console.log('Unknown WebSocket message type:', data.type);
    }
  }, []);

  const handleMemoryChatResponse = useCallback((data) => {
    const botMessage = {
      id: Date.now(),
      type: 'bot',
      content: data.responses,
      timestamp: new Date().toISOString(),
      memoryContext: data.memory_context,
      sessionId: data.session_id,
      cost: data.total_cost || 0,
      memoryEnabled: data.memory_enabled
    };

    setMessages(prev => [...prev, botMessage]);
    setMemoryContext(data.memory_context);
    setIsLoading(false);

    // Notify parent component of memory update
    if (onMemoryUpdate && data.memory_context) {
      onMemoryUpdate(data.memory_context);
    }
  }, [onMemoryUpdate]);

  const handleAgentResponse = useCallback((data) => {
    // Update UI to show individual agent responses as they come in
    setMessages(prev => {
      const lastMessage = prev[prev.length - 1];
      if (lastMessage && lastMessage.type === 'processing') {
        // Replace processing message with agent response
        const updatedMessage = {
          ...lastMessage,
          type: 'bot',
          content: [data.response],
          agentResponses: [...(lastMessage.agentResponses || []), data.response]
        };
        return [...prev.slice(0, -1), updatedMessage];
      }
      return prev;
    });
  }, []);

  const handleProcessingStatus = useCallback((data) => {
    const processingMessage = {
      id: Date.now(),
      type: 'processing',
      content: data.message,
      agents: data.agents,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, processingMessage]);
  }, []);

  const handleError = useCallback((data) => {
    const errorMessage = {
      id: Date.now(),
      type: 'error',
      content: `Error: ${data.message}`,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, errorMessage]);
    setIsLoading(false);
  }, []);

  const loadMemoryStats = async () => {
    try {
      const response = await fetch('/api/memory/stats');
      if (response.ok) {
        const stats = await response.json();
        setMemoryStats(stats);
      }
    } catch (error) {
      console.error('Failed to load memory stats:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
      agents: selectedAgents
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      if (wsConnection && connectionStatus === 'connected') {
        // Send via WebSocket for real-time processing
        wsConnection.send(JSON.stringify({
          type: 'memory_chat',
          content: inputMessage,
          agents: selectedAgents,
          include_context: enableMemory,
          session_id: sessionId
        }));
      } else {
        // Fallback to HTTP API
        await sendMessageViaHTTP(inputMessage);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      handleError({ message: 'Failed to send message' });
    }
  };

  const sendMessageViaHTTP = async (content) => {
    try {
      const response = await fetch('/api/chat/memory-enabled', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          agents: selectedAgents,
          session_id: sessionId,
          include_memory_context: enableMemory,
          memory_tags: ['chat', 'user_interaction'],
          persist_response: true
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      handleMemoryChatResponse(data);

    } catch (error) {
      console.error('HTTP request failed:', error);
      throw error;
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleMemoryPanel = () => {
    setShowMemoryPanel(!showMemoryPanel);
  };

  const formatMemoryContext = (context) => {
    if (!context) return null;

    return (
      <div className="space-y-3">
        {context.relevant_knowledge && context.relevant_knowledge.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Database className="w-4 h-4 mr-1" />
              Relevant Knowledge
            </h4>
            <div className="space-y-1">
              {context.relevant_knowledge.slice(0, 3).map((item, index) => (
                <div key={index} className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  {typeof item === 'object' ? item.description || JSON.stringify(item) : item}
                </div>
              ))}
            </div>
          </div>
        )}

        {context.patterns_detected && context.patterns_detected.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              Detected Patterns
            </h4>
            <div className="space-y-1">
              {context.patterns_detected.slice(0, 3).map((pattern, index) => (
                <div key={index} className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
                  {pattern}
                </div>
              ))}
            </div>
          </div>
        )}

        {context.context_summary && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Info className="w-4 h-4 mr-1" />
              Context Summary
            </h4>
            <div className="text-xs text-gray-600 bg-yellow-50 p-2 rounded">
              {context.context_summary}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderMessage = (message) => {
    const isUser = message.type === 'user';
    const isError = message.type === 'error';
    const isProcessing = message.type === 'processing';

    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`max-w-3xl ${isUser ? 'order-2' : 'order-1'}`}>
          <div className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
            {/* Avatar */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              isUser ? 'bg-blue-500' : isError ? 'bg-red-500' : isProcessing ? 'bg-yellow-500' : 'bg-green-500'
            }`}>
              {isUser ? (
                <User className="w-4 h-4 text-white" />
              ) : isError ? (
                <AlertCircle className="w-4 h-4 text-white" />
              ) : isProcessing ? (
                <Clock className="w-4 h-4 text-white" />
              ) : (
                <Bot className="w-4 h-4 text-white" />
              )}
            </div>

            {/* Message Content */}
            <div className={`flex-1 ${isUser ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block p-3 rounded-lg ${
                isUser 
                  ? 'bg-blue-500 text-white' 
                  : isError 
                    ? 'bg-red-100 text-red-800 border border-red-200'
                    : isProcessing
                      ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                      : 'bg-gray-100 text-gray-800'
              }`}>
                {isProcessing ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                    <span>{message.content}</span>
                  </div>
                ) : Array.isArray(message.content) ? (
                  // Multiple agent responses
                  <div className="space-y-3">
                    {message.content.map((response, index) => (
                      <div key={index} className="border-l-2 border-blue-300 pl-3">
                        <div className="text-xs font-medium text-blue-600 mb-1">
                          {response.agent_id}
                        </div>
                        <div className="whitespace-pre-wrap">{response.content}</div>
                        {response.cost !== undefined && (
                          <div className="text-xs text-gray-500 mt-1">
                            Cost: ${response.cost.toFixed(4)} | Memory: {response.memory_updated ? '✓' : '✗'}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{message.content}</div>
                )}
              </div>

              {/* Message metadata */}
              <div className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
                {new Date(message.timestamp).toLocaleTimeString()}
                {message.agents && (
                  <span className="ml-2">
                    Agents: {message.agents.join(', ')}
                  </span>
                )}
                {message.cost !== undefined && (
                  <span className="ml-2">
                    Cost: ${message.cost.toFixed(4)}
                  </span>
                )}
              </div>

              {/* Memory context for bot messages */}
              {!isUser && message.memoryContext && showMemoryContext && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-blue-800 flex items-center">
                      <Brain className="w-4 h-4 mr-1" />
                      Memory Context
                    </h4>
                    <button
                      onClick={() => setShowMemoryPanel(true)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      View Details
                    </button>
                  </div>
                  {formatMemoryContext(message.memoryContext)}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex h-full">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Memory-Enabled Chat
                </h2>
              </div>
              
              {enableMemory && (
                <div className="flex items-center space-x-2">
                  <Brain className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">Memory Active</span>
                  <div className={`w-2 h-2 rounded-full ${
                    connectionStatus === 'connected' ? 'bg-green-500' : 
                    connectionStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                  }`} />
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {/* Agent Selection */}
              <select
                multiple
                value={selectedAgents}
                onChange={(e) => setSelectedAgents(Array.from(e.target.selectedOptions, option => option.value))}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="general">General</option>
                <option value="code_analyst">Code Analyst</option>
                <option value="debug_detective">Debug Detective</option>
                <option value="workflow_manager">Workflow Manager</option>
                <option value="knowledge_coordinator">Knowledge Coordinator</option>
              </select>

              {/* Memory Panel Toggle */}
              {enableMemory && (
                <button
                  onClick={toggleMemoryPanel}
                  className={`p-2 rounded-lg transition-colors ${
                    showMemoryPanel 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Database className="w-4 h-4" />
                </button>
              )}

              {/* Settings */}
              <button className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map(renderMessage)}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message... (Shift+Enter for new line)"
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                disabled={isLoading}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Zap className="w-4 h-4" />
              )}
              <span>Send</span>
            </button>
          </div>

          {/* Status Bar */}
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <span>Session: {sessionId}</span>
              <span>Agents: {selectedAgents.join(', ')}</span>
              {memoryStats && (
                <span>
                  Memory: {memoryStats.statistics.total_queries} queries, 
                  {memoryStats.statistics.knowledge_entities} entities
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span className={`flex items-center space-x-1 ${
                connectionStatus === 'connected' ? 'text-green-600' : 
                connectionStatus === 'error' ? 'text-red-600' : 'text-yellow-600'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-500' : 
                  connectionStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                }`} />
                <span>{connectionStatus}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Memory Panel */}
      <AnimatePresence>
        {showMemoryPanel && enableMemory && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 400, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="bg-white border-l border-gray-200 overflow-hidden"
          >
            <MemoryPanel
              memoryContext={memoryContext}
              memoryStats={memoryStats}
              sessionId={sessionId}
              onClose={() => setShowMemoryPanel(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Memory Panel Component
const MemoryPanel = ({ memoryContext, memoryStats, sessionId, onClose }) => {
  const [activeTab, setActiveTab] = useState('context');

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Brain className="w-5 h-5 mr-2 text-blue-500" />
            Memory Panel
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mt-3">
          {['context', 'stats', 'history'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 text-sm rounded ${
                activeTab === tab
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'context' && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Current Context</h4>
            {memoryContext ? (
              <div className="space-y-3">
                {memoryContext.relevant_knowledge && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">
                      Relevant Knowledge ({memoryContext.relevant_knowledge.length})
                    </h5>
                    <div className="space-y-2">
                      {memoryContext.relevant_knowledge.map((item, index) => (
                        <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                          {typeof item === 'object' ? item.description || JSON.stringify(item) : item}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {memoryContext.patterns_detected && memoryContext.patterns_detected.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">
                      Patterns ({memoryContext.patterns_detected.length})
                    </h5>
                    <div className="space-y-1">
                      {memoryContext.patterns_detected.map((pattern, index) => (
                        <div key={index} className="p-2 bg-blue-50 rounded text-sm">
                          {pattern}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No memory context available</p>
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Memory Statistics</h4>
            {memoryStats ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-blue-50 rounded">
                    <div className="text-lg font-semibold text-blue-600">
                      {memoryStats.statistics.total_queries}
                    </div>
                    <div className="text-xs text-blue-600">Total Queries</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded">
                    <div className="text-lg font-semibold text-green-600">
                      {memoryStats.statistics.knowledge_entities}
                    </div>
                    <div className="text-xs text-green-600">Knowledge Entities</div>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded">
                    <div className="text-lg font-semibold text-yellow-600">
                      {memoryStats.statistics.cache_hits}
                    </div>
                    <div className="text-xs text-yellow-600">Cache Hits</div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded">
                    <div className="text-lg font-semibold text-purple-600">
                      {memoryStats.statistics.memory_updates}
                    </div>
                    <div className="text-xs text-purple-600">Memory Updates</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-gray-700">Configuration</h5>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Vector DB: {memoryStats.configuration.vector_db}</div>
                    <div>Graph DB: {memoryStats.configuration.graph_db}</div>
                    <div>Cache Size: {memoryStats.configuration.cache_size}</div>
                    <div>Context Window: {memoryStats.configuration.context_window}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-gray-700">Performance</h5>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Cache Hit Rate: {(memoryStats.performance.cache_hit_rate * 100).toFixed(1)}%</div>
                    <div>Total Entities: {memoryStats.performance.total_entities}</div>
                    <div>Memory Updates: {memoryStats.performance.memory_updates}</div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No memory statistics available</p>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Session History</h4>
            <p className="text-gray-500 text-sm">
              Session: {sessionId}
            </p>
            <div className="text-sm text-gray-600">
              Memory history and session analytics will be displayed here.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoryEnabledChat;