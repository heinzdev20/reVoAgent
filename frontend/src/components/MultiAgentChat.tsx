import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MultiAgentChatEvent, 
  AgentState, 
  MultiAgentSession, 
  CollaborationPattern,
  AgentCollaborationState 
} from '../types/chat';

interface MultiAgentChatProps {
  sessionId?: string;
  userId: string;
  onSessionStart?: (sessionId: string) => void;
  onSessionEnd?: (sessionId: string) => void;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'agent' | 'system' | 'collaboration';
  content: string;
  timestamp: string;
  agentRole?: string;
  metadata?: Record<string, any>;
}

const MultiAgentChat: React.FC<MultiAgentChatProps> = ({
  sessionId: initialSessionId,
  userId,
  onSessionStart,
  onSessionEnd
}) => {
  // State management
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId || null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [collaborationState, setCollaborationState] = useState<AgentCollaborationState | null>(null);
  const [selectedPattern, setSelectedPattern] = useState<string>('comprehensive_swarm');
  const [isLoading, setIsLoading] = useState(false);

  // WebSocket connection
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Available collaboration patterns
  const collaborationPatterns: CollaborationPattern[] = [
    {
      name: 'Code Review Swarm',
      agents: ['code_analyst', 'debug_detective'],
      pattern: 'parallel_analysis',
      merge_strategy: 'consensus_weighted',
      real_time: true,
      streaming: true
    },
    {
      name: 'Debugging Cascade',
      agents: ['debug_detective', 'code_analyst', 'workflow_manager'],
      pattern: 'sequential_cascade',
      merge_strategy: 'progressive_refinement',
      real_time: true,
      streaming: true
    },
    {
      name: 'Comprehensive Swarm',
      agents: ['code_analyst', 'debug_detective', 'workflow_manager', 'coordinator'],
      pattern: 'swarm_intelligence',
      merge_strategy: 'holistic_synthesis',
      real_time: true,
      streaming: true
    }
  ];

  // WebSocket connection management
  const connectWebSocket = useCallback(() => {
    if (!sessionId) return;

    const wsUrl = `ws://localhost:8765`;
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      setIsConnected(true);
      // Register session
      wsRef.current?.send(JSON.stringify({
        type: 'register',
        session_id: sessionId
      }));
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    wsRef.current.onclose = () => {
      setIsConnected(false);
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        if (sessionId) {
          connectWebSocket();
        }
      }, 3000);
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };
  }, [sessionId]);

  // Handle WebSocket messages
  const handleWebSocketMessage = (data: any) => {
    if (data.type === 'registered') {
      console.log('WebSocket registered for session:', data.session_id);
      return;
    }

    // Handle multi-agent events
    const event: MultiAgentChatEvent = data;
    
    switch (event.event_type) {
      case 'message':
        addMessage({
          id: `msg_${Date.now()}`,
          type: 'user',
          content: event.data.message,
          timestamp: event.timestamp
        });
        break;

      case 'collaboration_start':
        setCollaborationState({
          active_agents: event.data.agents.map((agent: string) => ({
            agent_id: `${agent}_${Date.now()}`,
            role: agent,
            status: 'thinking' as const,
            current_task: `Processing: ${event.data.message.substring(0, 50)}...`,
            progress: 0,
            last_update: event.timestamp
          })),
          collaboration_phase: 'starting',
          progress: 0,
          current_pattern: collaborationPatterns.find(p => p.pattern === event.data.pattern) || collaborationPatterns[0],
          real_time_events: [event]
        });
        
        addMessage({
          id: `collab_start_${Date.now()}`,
          type: 'system',
          content: `🤖 Starting ${event.data.pattern} collaboration with ${event.data.agents.length} agents...`,
          timestamp: event.timestamp
        });
        break;

      case 'agent_thinking':
        updateAgentState(event.agent_id!, {
          status: 'thinking',
          current_task: event.data.status,
          progress: 0.1
        });
        
        addMessage({
          id: `thinking_${Date.now()}`,
          type: 'agent',
          content: `🧠 ${event.data.agent} is analyzing...`,
          timestamp: event.timestamp,
          agentRole: event.data.agent
        });
        break;

      case 'collaboration_update':
        updateAgentState(event.agent_id!, {
          status: 'collaborating',
          progress: event.data.progress || 0.5
        });
        
        if (event.data.phase) {
          setCollaborationState(prev => prev ? {
            ...prev,
            collaboration_phase: event.data.phase,
            progress: event.data.progress || prev.progress
          } : null);
        }
        break;

      case 'agent_response':
        updateAgentState(event.agent_id!, {
          status: 'complete',
          progress: 1.0
        });
        
        addMessage({
          id: `response_${Date.now()}`,
          type: 'agent',
          content: `✅ ${event.data.agent} completed analysis`,
          timestamp: event.timestamp,
          agentRole: event.data.agent,
          metadata: event.data.result
        });
        break;

      case 'collaboration_complete':
        setCollaborationState(prev => prev ? {
          ...prev,
          collaboration_phase: 'complete',
          progress: 1.0
        } : null);
        
        addMessage({
          id: `final_${Date.now()}`,
          type: 'collaboration',
          content: formatCollaborationResponse(event.data.response),
          timestamp: event.timestamp,
          metadata: event.data.response
        });
        
        setIsLoading(false);
        break;

      case 'error':
        addMessage({
          id: `error_${Date.now()}`,
          type: 'system',
          content: `❌ Error: ${event.data.error}`,
          timestamp: event.timestamp
        });
        setIsLoading(false);
        break;
    }
  };

  // Helper functions
  const addMessage = (message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  };

  const updateAgentState = (agentId: string, updates: Partial<AgentState>) => {
    setCollaborationState(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        active_agents: prev.active_agents.map(agent =>
          agent.agent_id === agentId ? { ...agent, ...updates } : agent
        )
      };
    });
  };

  const formatCollaborationResponse = (response: any): string => {
    if (response.type === 'consensus_response') {
      return `🎯 **Multi-Agent Consensus Achieved**\n\nConfidence: ${(response.confidence * 100).toFixed(1)}%\n\nAnalysis: ${response.consensus_analysis}`;
    } else if (response.type === 'cascade_response') {
      return `🔄 **Cascade Analysis Complete**\n\nFinal Analysis: ${response.final_analysis}`;
    } else {
      return `🤖 **Multi-Agent Response**\n\n${JSON.stringify(response, null, 2)}`;
    }
  };

  // Start new session
  const startSession = async () => {
    try {
      const response = await fetch('/api/v1/chat/multi-agent/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          initial_message: inputMessage,
          collaboration_pattern: selectedPattern
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSessionId(data.session_id);
        onSessionStart?.(data.session_id);
        setInputMessage('');
        setIsLoading(true);
      }
    } catch (error) {
      console.error('Error starting session:', error);
    }
  };

  // Send message
  const sendMessage = () => {
    if (!inputMessage.trim() || !sessionId || !isConnected) return;

    wsRef.current?.send(JSON.stringify({
      type: 'message',
      content: inputMessage,
      user_id: userId
    }));

    setInputMessage('');
    setIsLoading(true);
  };

  // Handle input
  const handleInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (sessionId) {
        sendMessage();
      } else {
        startSession();
      }
    }
  };

  // Effects
  useEffect(() => {
    if (sessionId) {
      connectWebSocket();
    }

    return () => {
      wsRef.current?.close();
    };
  }, [sessionId, connectWebSocket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Render agent status
  const renderAgentStatus = () => {
    if (!collaborationState) return null;

    return (
      <div className="bg-gray-100 p-4 rounded-lg mb-4">
        <h3 className="font-semibold mb-2">🤖 Agent Collaboration Status</h3>
        <div className="text-sm text-gray-600 mb-2">
          Pattern: {collaborationState.current_pattern.name} | 
          Phase: {collaborationState.collaboration_phase} | 
          Progress: {(collaborationState.progress * 100).toFixed(0)}%
        </div>
        
        <div className="space-y-2">
          {collaborationState.active_agents.map(agent => (
            <div key={agent.agent_id} className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                agent.status === 'complete' ? 'bg-green-500' :
                agent.status === 'thinking' || agent.status === 'collaborating' ? 'bg-blue-500 animate-pulse' :
                'bg-gray-400'
              }`} />
              <span className="font-medium">{agent.role}</span>
              <span className="text-sm text-gray-500">
                {agent.current_task || agent.status}
              </span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${agent.progress * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render message
  const renderMessage = (message: ChatMessage) => {
    const isUser = message.type === 'user';
    const isSystem = message.type === 'system';
    const isCollaboration = message.type === 'collaboration';

    return (
      <div key={message.id} className={`mb-4 ${isUser ? 'text-right' : 'text-left'}`}>
        <div className={`inline-block max-w-3xl p-3 rounded-lg ${
          isUser ? 'bg-blue-600 text-white' :
          isSystem ? 'bg-gray-200 text-gray-800' :
          isCollaboration ? 'bg-green-100 text-green-800 border border-green-300' :
          'bg-gray-100 text-gray-800'
        }`}>
          {message.agentRole && (
            <div className="text-xs font-semibold mb-1 opacity-75">
              🤖 {message.agentRole}
            </div>
          )}
          <div className="whitespace-pre-wrap">{message.content}</div>
          <div className="text-xs opacity-75 mt-1">
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <h2 className="text-xl font-bold">🤖 Multi-Agent Chat</h2>
        <div className="flex items-center space-x-4 mt-2">
          <div className={`flex items-center space-x-2 ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
          
          {sessionId && (
            <div className="text-sm text-gray-500">
              Session: {sessionId.substring(0, 8)}...
            </div>
          )}
        </div>
      </div>

      {/* Pattern Selection */}
      {!sessionId && (
        <div className="p-4 bg-gray-50 border-b">
          <label className="block text-sm font-medium mb-2">Collaboration Pattern:</label>
          <select 
            value={selectedPattern}
            onChange={(e) => setSelectedPattern(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            {collaborationPatterns.map(pattern => (
              <option key={pattern.pattern} value={pattern.pattern}>
                {pattern.name} ({pattern.agents.length} agents)
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Agent Status */}
      {renderAgentStatus()}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-4">🤖</div>
            <p>Start a conversation with our multi-agent AI system!</p>
            <p className="text-sm mt-2">Choose a collaboration pattern and ask your question.</p>
          </div>
        )}
        
        {messages.map(renderMessage)}
        
        {isLoading && (
          <div className="text-center py-4">
            <div className="inline-flex items-center space-x-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Agents are collaborating...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex space-x-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleInputKeyPress}
            placeholder={sessionId ? "Continue the conversation..." : "Start a new multi-agent session..."}
            className="flex-1 p-3 border rounded-lg resize-none"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={sessionId ? sendMessage : startSession}
            disabled={!inputMessage.trim() || isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sessionId ? 'Send' : 'Start'}
          </button>
        </div>
        
        <div className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
};

export default MultiAgentChat;