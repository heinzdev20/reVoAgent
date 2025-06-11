/**
 * ReVo AI Chat Interface - Main Container Component
 * The central conversational AI command center for the reVoAgent platform
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { 
  ChatMessage, 
  ChatState, 
  MessageType, 
  MessageStatus, 
  WorkflowStatus,
  ChatSettings,
  ChatContextMenu,
  ContextMenuAction
} from '../../types/chat';
import { useReVoWebSocket } from '../../hooks/useReVoWebSocket';
import { 
  Settings, 
  Maximize2, 
  Minimize2, 
  Volume2, 
  VolumeX, 
  Wifi, 
  WifiOff,
  Activity,
  Users,
  Zap
} from 'lucide-react';

interface ReVoChatProps {
  className?: string;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  wsUrl?: string;
  authToken?: string;
}

export const ReVoChat: React.FC<ReVoChatProps> = ({
  className = '',
  isFullscreen = false,
  onToggleFullscreen,
  wsUrl = 'ws://localhost:8000/ws/revo',
  authToken
}) => {
  // Chat state
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isConnected: false,
    isTyping: false,
    activeAgents: [],
    inputHistory: [],
    historyIndex: -1
  });

  // UI state
  const [settings, setSettings] = useState<ChatSettings>({
    theme: 'dark',
    fontSize: 'medium',
    showTimestamps: true,
    showAgentNames: true,
    enableSyntaxHighlighting: true,
    enableMarkdownRendering: true,
    autoScroll: true,
    soundNotifications: true,
    compactMode: false
  });

  const [showSettings, setShowSettings] = useState(false);
  const [contextMenu, setContextMenu] = useState<ChatContextMenu | null>(null);
  const [currentWorkflow, setCurrentWorkflow] = useState<WorkflowStatus | null>(null);

  // Refs
  const audioRef = useRef<HTMLAudioElement>(null);
  const notificationSoundRef = useRef<HTMLAudioElement>(null);

  // WebSocket connection
  const {
    isConnected,
    connectionStatus,
    lastError,
    sendChatMessage,
    sendCommand,
    reconnectCount
  } = useReVoWebSocket({
    url: wsUrl,
    token: authToken,
    onMessage: handleNewMessage,
    onStatusChange: handleConnectionStatusChange,
    onWorkflowUpdate: handleWorkflowUpdate,
    onAgentFeedback: handleAgentFeedback
  });

  // Message handlers
  function handleNewMessage(message: ChatMessage) {
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, message],
      isTyping: false
    }));

    // Play notification sound
    if (settings.soundNotifications && message.sender !== 'user') {
      playNotificationSound();
    }
  }

  function handleConnectionStatusChange(status: 'connecting' | 'connected' | 'disconnected' | 'error') {
    setChatState(prev => ({
      ...prev,
      isConnected: status === 'connected'
    }));

    // Add system message for connection changes
    if (status === 'connected') {
      addSystemMessage('Connected to ReVo AI', MessageType.SUCCESS);
    } else if (status === 'disconnected') {
      addSystemMessage('Disconnected from ReVo AI', MessageType.WARNING);
    } else if (status === 'error') {
      addSystemMessage(`Connection error: ${lastError}`, MessageType.ERROR);
    }
  }

  function handleWorkflowUpdate(workflowData: any) {
    setCurrentWorkflow(workflowData);
    
    // Add workflow update message
    const message: ChatMessage = {
      id: `workflow_${Date.now()}`,
      sender: 'revo',
      content: `Workflow "${workflowData.name}" is ${workflowData.status}. Progress: ${Math.round(workflowData.progress * 100)}%`,
      timestamp: Date.now(),
      messageType: MessageType.WORKFLOW_UPDATE,
      metadata: {
        workflowId: workflowData.id
      }
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, message]
    }));
  }

  function handleAgentFeedback(agentData: any) {
    const message: ChatMessage = {
      id: `agent_${Date.now()}`,
      sender: 'agent',
      content: agentData.message,
      timestamp: Date.now(),
      agentName: agentData.agentName,
      engineName: agentData.engineName,
      messageType: MessageType.AGENT_FEEDBACK,
      metadata: {
        executionTime: agentData.executionTime
      }
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, message],
      activeAgents: agentData.status === 'started' 
        ? [...prev.activeAgents, agentData.agentName]
        : prev.activeAgents.filter(name => name !== agentData.agentName)
    }));
  }

  // Utility functions
  const addSystemMessage = useCallback((content: string, type: MessageType = MessageType.SYSTEM) => {
    const message: ChatMessage = {
      id: `system_${Date.now()}`,
      sender: 'revo',
      content,
      timestamp: Date.now(),
      messageType: type,
      status: MessageStatus.DELIVERED
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, message]
    }));
  }, []);

  const playNotificationSound = useCallback(() => {
    if (notificationSoundRef.current) {
      notificationSoundRef.current.play().catch(() => {
        // Ignore audio play errors (user interaction required)
      });
    }
  }, []);

  // Event handlers
  const handleSendMessage = useCallback((content: string) => {
    // Add user message to UI immediately
    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      content,
      timestamp: Date.now(),
      messageType: MessageType.TEXT,
      status: MessageStatus.SENDING
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isTyping: true
    }));

    // Send via WebSocket
    const sent = sendChatMessage(content);
    
    // Update message status
    setTimeout(() => {
      setChatState(prev => ({
        ...prev,
        messages: prev.messages.map(msg => 
          msg.id === userMessage.id 
            ? { ...msg, status: sent ? MessageStatus.SENT : MessageStatus.FAILED }
            : msg
        )
      }));
    }, 100);
  }, [sendChatMessage]);

  const handleSendCommand = useCallback((command: string, args: Record<string, any>) => {
    // Add command message to UI
    const commandMessage: ChatMessage = {
      id: `cmd_${Date.now()}`,
      sender: 'user',
      content: `${command} ${Object.entries(args).map(([k, v]) => `--${k} ${v}`).join(' ')}`,
      timestamp: Date.now(),
      messageType: MessageType.SYSTEM,
      status: MessageStatus.SENDING,
      metadata: {
        functionName: command.replace('/', ''),
        functionArgs: args
      }
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, commandMessage],
      isTyping: true
    }));

    // Send command via WebSocket
    const sent = sendCommand(command, args);
    
    // Update message status
    setTimeout(() => {
      setChatState(prev => ({
        ...prev,
        messages: prev.messages.map(msg => 
          msg.id === commandMessage.id 
            ? { ...msg, status: sent ? MessageStatus.SENT : MessageStatus.FAILED }
            : msg
        )
      }));
    }, 100);
  }, [sendCommand]);

  const handleRetryMessage = useCallback((messageId: string) => {
    const message = chatState.messages.find(msg => msg.id === messageId);
    if (message && message.sender === 'user') {
      if (message.messageType === MessageType.SYSTEM && message.metadata?.functionName) {
        handleSendCommand(`/${message.metadata.functionName}`, message.metadata.functionArgs || {});
      } else {
        handleSendMessage(message.content);
      }
    }
  }, [chatState.messages, handleSendMessage, handleSendCommand]);

  const handleCopyMessage = useCallback((content: string) => {
    addSystemMessage('Message copied to clipboard', MessageType.SUCCESS);
  }, [addSystemMessage]);

  const handleContextMenu = useCallback((event: React.MouseEvent, messageId: string) => {
    event.preventDefault();
    
    const actions: ContextMenuAction[] = [
      {
        id: 'copy',
        label: 'Copy Message',
        icon: 'copy',
        action: (id) => {
          const message = chatState.messages.find(msg => msg.id === id);
          if (message) {
            navigator.clipboard.writeText(message.content);
            handleCopyMessage(message.content);
          }
        }
      },
      {
        id: 'retry',
        label: 'Retry',
        icon: 'repeat',
        action: handleRetryMessage,
        disabled: !chatState.messages.find(msg => msg.id === messageId && msg.sender === 'user')
      }
    ];

    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      messageId,
      actions
    });
  }, [chatState.messages, handleCopyMessage, handleRetryMessage]);

  const handleHistoryUpdate = useCallback((history: string[]) => {
    setChatState(prev => ({
      ...prev,
      inputHistory: history
    }));
  }, []);

  // Close context menu on click outside
  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Initialize with welcome message
  useEffect(() => {
    addSystemMessage(
      'Welcome to ReVo AI! I\'m your intelligent development assistant. Type a message or use "/" for commands.',
      MessageType.SUCCESS
    );
  }, [addSystemMessage]);

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-400';
      case 'connecting': return 'text-yellow-400';
      case 'disconnected': return 'text-gray-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return <Wifi className="w-4 h-4" />;
      case 'connecting': return <Activity className="w-4 h-4 animate-pulse" />;
      default: return <WifiOff className="w-4 h-4" />;
    }
  };

  return (
    <div className={`flex flex-col h-full bg-gray-900 text-white ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Zap className="w-6 h-6 text-blue-400" />
            <h2 className="text-lg font-semibold">ReVo AI Chat</h2>
          </div>
          
          {/* Connection Status */}
          <div className={`flex items-center space-x-1 text-sm ${getConnectionStatusColor()}`}>
            {getConnectionStatusIcon()}
            <span className="capitalize">{connectionStatus}</span>
            {reconnectCount > 0 && (
              <span className="text-xs">({reconnectCount} retries)</span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Active Agents */}
          {chatState.activeAgents.length > 0 && (
            <div className="flex items-center space-x-1 text-sm text-blue-400">
              <Users className="w-4 h-4" />
              <span>{chatState.activeAgents.length} active</span>
            </div>
          )}

          {/* Current Workflow */}
          {currentWorkflow && (
            <div className="text-sm text-purple-400">
              <span>{currentWorkflow.name}: {Math.round(currentWorkflow.progress * 100)}%</span>
            </div>
          )}

          {/* Controls */}
          <button
            onClick={() => setSettings(prev => ({ ...prev, soundNotifications: !prev.soundNotifications }))}
            className="p-2 hover:bg-gray-700 rounded transition-colors"
            title={settings.soundNotifications ? 'Disable sounds' : 'Enable sounds'}
          >
            {settings.soundNotifications ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-gray-700 rounded transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              className="p-2 hover:bg-gray-700 rounded transition-colors"
              title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <MessageList
        messages={chatState.messages}
        settings={settings}
        isTyping={chatState.isTyping}
        onRetryMessage={handleRetryMessage}
        onCopyMessage={handleCopyMessage}
        onContextMenu={handleContextMenu}
        className="flex-1"
      />

      {/* Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        onSendCommand={handleSendCommand}
        disabled={!isConnected}
        inputHistory={chatState.inputHistory}
        onHistoryUpdate={handleHistoryUpdate}
        isProcessing={chatState.isTyping}
      />

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-gray-800 border border-gray-600 rounded-lg shadow-lg py-1 z-50"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          {contextMenu.actions.map(action => (
            <button
              key={action.id}
              onClick={() => {
                action.action(contextMenu.messageId);
                setContextMenu(null);
              }}
              disabled={action.disabled}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* Audio elements */}
      <audio ref={notificationSoundRef} preload="auto">
        <source src="/sounds/notification.mp3" type="audio/mpeg" />
        <source src="/sounds/notification.wav" type="audio/wav" />
      </audio>
    </div>
  );
};