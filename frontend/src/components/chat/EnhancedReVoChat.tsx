/**
 * Enhanced ReVo Chat AI - Responsive Interactive Chat Interface
 * Advanced conversational AI with memory integration and multi-agent support
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useEnhancedWebSocket } from '../../hooks/useEnhancedWebSocket';
import { 
  Send, 
  Mic, 
  MicOff, 
  Paperclip, 
  Smile, 
  MoreVertical,
  Bot,
  User,
  Brain,
  Zap,
  Eye,
  Settings,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  RefreshCw,
  Download,
  Copy,
  Trash2,
  Star,
  MessageSquare,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system' | 'agent';
  content: string;
  timestamp: Date;
  agentId?: string;
  agentName?: string;
  status: 'sending' | 'sent' | 'delivered' | 'error';
  metadata?: {
    responseTime?: number;
    memoryUsed?: boolean;
    confidence?: number;
    sources?: string[];
  };
  attachments?: Array<{
    type: 'image' | 'file' | 'code';
    name: string;
    url: string;
    size?: number;
  }>;
}

interface ChatSettings {
  memoryEnabled: boolean;
  voiceEnabled: boolean;
  soundEnabled: boolean;
  autoScroll: boolean;
  showTimestamps: boolean;
  theme: 'dark' | 'light' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
}

interface Agent {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'busy' | 'offline';
  specialization: string;
}

const AVAILABLE_AGENTS: Agent[] = [
  { id: 'general', name: 'General Assistant', avatar: '🤖', status: 'online', specialization: 'General queries' },
  { id: 'code', name: 'Code Generator', avatar: '💻', status: 'online', specialization: 'Code generation' },
  { id: 'debug', name: 'Debug Detective', avatar: '🔍', status: 'online', specialization: 'Debugging' },
  { id: 'security', name: 'Security Guardian', avatar: '🛡️', status: 'online', specialization: 'Security analysis' },
  { id: 'data', name: 'Data Analyst', avatar: '📊', status: 'busy', specialization: 'Data analysis' },
  { id: 'design', name: 'UI/UX Designer', avatar: '🎨', status: 'online', specialization: 'Design' }
];

interface EnhancedReVoChatProps {
  className?: string;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  initialAgent?: string;
}

export const EnhancedReVoChat: React.FC<EnhancedReVoChatProps> = ({
  className = '',
  isFullscreen = false,
  onToggleFullscreen,
  initialAgent = 'general'
}) => {
  // State management
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<string>(initialAgent);
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAgentSelector, setShowAgentSelector] = useState(false);
  const [settings, setSettings] = useState<ChatSettings>({
    memoryEnabled: true,
    voiceEnabled: false,
    soundEnabled: true,
    autoScroll: true,
    showTimestamps: true,
    theme: 'dark',
    fontSize: 'medium'
  });

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // WebSocket connection
  const { send, subscribe, isConnected } = useEnhancedWebSocket();

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (settings.autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [settings.autoScroll]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Subscribe to chat responses
  useEffect(() => {
    const unsubscribe = subscribe('chat_response', (data: any) => {
      const newMessage: ChatMessage = {
        id: data.id || Date.now().toString(),
        type: 'assistant',
        content: data.content,
        timestamp: new Date(),
        agentId: data.agentId,
        agentName: data.agentName,
        status: 'delivered',
        metadata: {
          responseTime: data.responseTime,
          memoryUsed: data.memoryUsed,
          confidence: data.confidence,
          sources: data.sources
        }
      };

      setMessages(prev => prev.map(msg => 
        msg.status === 'sending' ? newMessage : msg
      ).concat(newMessage));
      setIsTyping(false);
    });

    return unsubscribe;
  }, [subscribe]);

  // Handle message sending
  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || !isConnected) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
      status: 'sent'
    };

    const loadingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: '',
      timestamp: new Date(),
      agentId: selectedAgent,
      agentName: AVAILABLE_AGENTS.find(a => a.id === selectedAgent)?.name,
      status: 'sending'
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setInputValue('');
    setIsTyping(true);

    // Send message via WebSocket
    send({
      type: 'chat_message',
      payload: {
        content: inputValue.trim(),
        agentId: selectedAgent,
        memoryEnabled: settings.memoryEnabled,
        timestamp: new Date().toISOString()
      }
    });
  }, [inputValue, selectedAgent, settings.memoryEnabled, isConnected, send]);

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Handle file upload logic
      console.log('Files selected:', files);
    }
  };

  // Voice recording toggle
  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Implement voice recording logic
  };

  // Message actions
  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const deleteMessage = (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  };

  const getMessageStatusIcon = (status: string) => {
    switch (status) {
      case 'sending': return <Loader className="w-3 h-3 animate-spin" />;
      case 'sent': return <CheckCircle className="w-3 h-3" />;
      case 'delivered': return <CheckCircle className="w-3 h-3 text-green-400" />;
      case 'error': return <AlertCircle className="w-3 h-3 text-red-400" />;
      default: return null;
    }
  };

  const selectedAgentData = AVAILABLE_AGENTS.find(a => a.id === selectedAgent);

  return (
    <div className={`flex flex-col h-full bg-gray-900/95 backdrop-blur-md rounded-xl border border-white/20 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg">
              {selectedAgentData?.avatar}
            </div>
            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-900 ${
              selectedAgentData?.status === 'online' ? 'bg-green-400' :
              selectedAgentData?.status === 'busy' ? 'bg-yellow-400' : 'bg-gray-400'
            }`} />
          </div>
          <div>
            <h3 className="text-white font-semibold">{selectedAgentData?.name}</h3>
            <p className="text-xs text-gray-400">{selectedAgentData?.specialization}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Connection Status */}
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
          
          {/* Agent Selector */}
          <button
            onClick={() => setShowAgentSelector(!showAgentSelector)}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <Users className="w-4 h-4" />
          </button>

          {/* Settings */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Agent Selector Dropdown */}
      {showAgentSelector && (
        <div className="absolute top-16 right-4 z-50 bg-gray-800 rounded-lg border border-white/20 shadow-xl p-2 min-w-[200px]">
          {AVAILABLE_AGENTS.map(agent => (
            <button
              key={agent.id}
              onClick={() => {
                setSelectedAgent(agent.id);
                setShowAgentSelector(false);
              }}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 transition-colors ${
                selectedAgent === agent.id ? 'bg-blue-500/20 text-blue-300' : 'text-white'
              }`}
            >
              <span className="text-lg">{agent.avatar}</span>
              <div className="flex-1 text-left">
                <div className="font-medium">{agent.name}</div>
                <div className="text-xs text-gray-400">{agent.specialization}</div>
              </div>
              <div className={`w-2 h-2 rounded-full ${
                agent.status === 'online' ? 'bg-green-400' :
                agent.status === 'busy' ? 'bg-yellow-400' : 'bg-gray-400'
              }`} />
            </button>
          ))}
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-16 right-4 z-50 bg-gray-800 rounded-lg border border-white/20 shadow-xl p-4 min-w-[250px]">
          <h4 className="text-white font-semibold mb-3">Chat Settings</h4>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Memory Enabled</span>
              <input
                type="checkbox"
                checked={settings.memoryEnabled}
                onChange={(e) => setSettings(prev => ({ ...prev, memoryEnabled: e.target.checked }))}
                className="rounded"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Voice Input</span>
              <input
                type="checkbox"
                checked={settings.voiceEnabled}
                onChange={(e) => setSettings(prev => ({ ...prev, voiceEnabled: e.target.checked }))}
                className="rounded"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Sound Effects</span>
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => setSettings(prev => ({ ...prev, soundEnabled: e.target.checked }))}
                className="rounded"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Auto Scroll</span>
              <input
                type="checkbox"
                checked={settings.autoScroll}
                onChange={(e) => setSettings(prev => ({ ...prev, autoScroll: e.target.checked }))}
                className="rounded"
              />
            </label>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="text-white font-semibold mb-2">Welcome to ReVo Chat AI</h3>
            <p className="text-gray-400 text-sm">Start a conversation with our memory-enabled AI agents</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`group max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
              {/* Message Bubble */}
              <div className={`relative p-4 rounded-2xl ${
                message.type === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-white border border-white/20'
              }`}>
                {/* Agent Info */}
                {message.type === 'assistant' && message.agentName && (
                  <div className="flex items-center space-x-2 mb-2 text-xs text-gray-300">
                    <Brain className="w-3 h-3" />
                    <span>{message.agentName}</span>
                    {message.metadata?.memoryUsed && (
                      <span className="bg-purple-500/20 text-purple-300 px-1 py-0.5 rounded">Memory</span>
                    )}
                  </div>
                )}

                {/* Message Content */}
                {message.status === 'sending' ? (
                  <div className="flex items-center space-x-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{message.content}</div>
                )}

                {/* Message Metadata */}
                {message.metadata && message.status !== 'sending' && (
                  <div className="mt-2 text-xs text-gray-400 space-y-1">
                    {message.metadata.responseTime && (
                      <div>Response time: {message.metadata.responseTime}ms</div>
                    )}
                    {message.metadata.confidence && (
                      <div>Confidence: {(message.metadata.confidence * 100).toFixed(1)}%</div>
                    )}
                  </div>
                )}

                {/* Message Actions */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => copyMessage(message.content)}
                      className="p-1 text-gray-400 hover:text-white rounded"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => deleteMessage(message.id)}
                      className="p-1 text-gray-400 hover:text-red-400 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Timestamp and Status */}
              <div className={`flex items-center mt-1 space-x-2 text-xs text-gray-500 ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}>
                {settings.showTimestamps && (
                  <span>{message.timestamp.toLocaleTimeString()}</span>
                )}
                {getMessageStatusIcon(message.status)}
              </div>
            </div>

            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex-shrink-0 ${
              message.type === 'user' ? 'order-1 ml-3' : 'order-2 mr-3'
            }`}>
              {message.type === 'user' ? (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white">
                  <User className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                  <Bot className="w-4 h-4" />
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2 bg-white/10 rounded-2xl px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm text-gray-400">AI is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-end space-x-3">
          {/* File Upload */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Text Input */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${selectedAgentData?.name}...`}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 resize-none focus:outline-none focus:border-blue-400 max-h-32"
              rows={1}
              style={{ minHeight: '48px' }}
            />
            
            {/* Emoji Button */}
            <button className="absolute right-3 top-3 text-gray-400 hover:text-white">
              <Smile className="w-5 h-5" />
            </button>
          </div>

          {/* Voice Input */}
          {settings.voiceEnabled && (
            <button
              onClick={toggleRecording}
              className={`p-2 rounded-lg transition-colors ${
                isRecording 
                  ? 'bg-red-500 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          )}

          {/* Send Button */}
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || !isConnected}
            className="p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <span className={`flex items-center space-x-1 ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
              <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
            </span>
            {settings.memoryEnabled && (
              <span className="flex items-center space-x-1 text-purple-400">
                <Brain className="w-3 h-3" />
                <span>Memory Active</span>
              </span>
            )}
          </div>
          <div className="text-gray-500">
            {inputValue.length}/2000
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedReVoChat;