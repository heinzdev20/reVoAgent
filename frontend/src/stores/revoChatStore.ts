/**
 * ReVo Chat Store
 * Zustand store for managing chat state, messages, and real-time updates
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { 
  ChatMessage, 
  ChatState, 
  WorkflowStatus, 
  MessageType, 
  MessageStatus,
  ChatSettings 
} from '../types/chat';

interface RevoChatStore extends ChatState {
  // Settings
  settings: ChatSettings;
  
  // Current workflow
  currentWorkflow?: WorkflowStatus;
  
  // Connection state
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastError: string | null;
  reconnectCount: number;
  
  // Actions
  addMessage: (message: ChatMessage) => void;
  updateMessage: (messageId: string, updates: Partial<ChatMessage>) => void;
  removeMessage: (messageId: string) => void;
  clearMessages: () => void;
  
  setTyping: (isTyping: boolean) => void;
  setConnected: (isConnected: boolean) => void;
  setConnectionStatus: (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void;
  setLastError: (error: string | null) => void;
  setReconnectCount: (count: number) => void;
  
  addToHistory: (input: string) => void;
  navigateHistory: (direction: 'up' | 'down') => string | null;
  
  setActiveAgents: (agents: string[]) => void;
  addActiveAgent: (agent: string) => void;
  removeActiveAgent: (agent: string) => void;
  
  setCurrentWorkflow: (workflow: WorkflowStatus | null) => void;
  updateWorkflowProgress: (workflowId: string, progress: number) => void;
  
  updateSettings: (settings: Partial<ChatSettings>) => void;
  
  // Utility actions
  addSystemMessage: (content: string, type?: MessageType) => void;
  addUserMessage: (content: string) => string; // Returns message ID
  addAgentMessage: (content: string, agentName: string, engineName?: string) => void;
  
  // Message management
  retryMessage: (messageId: string) => ChatMessage | null;
  getMessageById: (messageId: string) => ChatMessage | null;
  getMessagesByType: (type: MessageType) => ChatMessage[];
  getRecentMessages: (count: number) => ChatMessage[];
  
  // Statistics
  getMessageCount: () => number;
  getActiveAgentCount: () => number;
  getConnectionUptime: () => number;
}

const defaultSettings: ChatSettings = {
  theme: 'dark',
  fontSize: 'medium',
  showTimestamps: true,
  showAgentNames: true,
  enableSyntaxHighlighting: true,
  enableMarkdownRendering: true,
  autoScroll: true,
  soundNotifications: true,
  compactMode: false
};

export const useRevoChatStore = create<RevoChatStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    messages: [],
    isConnected: false,
    isTyping: false,
    currentWorkflow: null,
    activeAgents: [],
    inputHistory: [],
    historyIndex: -1,
    settings: defaultSettings,
    connectionStatus: 'disconnected',
    lastError: null,
    reconnectCount: 0,

    // Message actions
    addMessage: (message: ChatMessage) => {
      set((state) => ({
        messages: [...state.messages, message]
      }));
    },

    updateMessage: (messageId: string, updates: Partial<ChatMessage>) => {
      set((state) => ({
        messages: state.messages.map(msg => 
          msg.id === messageId ? { ...msg, ...updates } : msg
        )
      }));
    },

    removeMessage: (messageId: string) => {
      set((state) => ({
        messages: state.messages.filter(msg => msg.id !== messageId)
      }));
    },

    clearMessages: () => {
      set({ messages: [] });
    },

    // Connection actions
    setTyping: (isTyping: boolean) => {
      set({ isTyping });
    },

    setConnected: (isConnected: boolean) => {
      set({ isConnected });
    },

    setConnectionStatus: (status: 'connecting' | 'connected' | 'disconnected' | 'error') => {
      set({ 
        connectionStatus: status,
        isConnected: status === 'connected'
      });
    },

    setLastError: (error: string | null) => {
      set({ lastError: error });
    },

    setReconnectCount: (count: number) => {
      set({ reconnectCount: count });
    },

    // History actions
    addToHistory: (input: string) => {
      set((state) => {
        const newHistory = [input, ...state.inputHistory.filter(item => item !== input)];
        return {
          inputHistory: newHistory.slice(0, 50), // Keep last 50 items
          historyIndex: -1
        };
      });
    },

    navigateHistory: (direction: 'up' | 'down') => {
      const state = get();
      const { inputHistory, historyIndex } = state;
      
      if (inputHistory.length === 0) return null;
      
      let newIndex = historyIndex;
      
      if (direction === 'up') {
        newIndex = Math.min(historyIndex + 1, inputHistory.length - 1);
      } else {
        newIndex = Math.max(historyIndex - 1, -1);
      }
      
      set({ historyIndex: newIndex });
      
      return newIndex >= 0 ? inputHistory[newIndex] : null;
    },

    // Agent actions
    setActiveAgents: (agents: string[]) => {
      set({ activeAgents: agents });
    },

    addActiveAgent: (agent: string) => {
      set((state) => ({
        activeAgents: state.activeAgents.includes(agent) 
          ? state.activeAgents 
          : [...state.activeAgents, agent]
      }));
    },

    removeActiveAgent: (agent: string) => {
      set((state) => ({
        activeAgents: state.activeAgents.filter(a => a !== agent)
      }));
    },

    // Workflow actions
    setCurrentWorkflow: (workflow: WorkflowStatus | null) => {
      set({ currentWorkflow: workflow });
    },

    updateWorkflowProgress: (workflowId: string, progress: number) => {
      set((state) => ({
        currentWorkflow: state.currentWorkflow?.id === workflowId
          ? { ...state.currentWorkflow, progress }
          : state.currentWorkflow
      }));
    },

    // Settings actions
    updateSettings: (newSettings: Partial<ChatSettings>) => {
      set((state) => ({
        settings: { ...state.settings, ...newSettings }
      }));
    },

    // Utility actions
    addSystemMessage: (content: string, type: MessageType = MessageType.SYSTEM) => {
      const message: ChatMessage = {
        id: `system_${Date.now()}_${Math.random()}`,
        sender: 'revo',
        content,
        timestamp: Date.now(),
        messageType: type,
        status: MessageStatus.DELIVERED
      };
      
      get().addMessage(message);
    },

    addUserMessage: (content: string) => {
      const message: ChatMessage = {
        id: `user_${Date.now()}_${Math.random()}`,
        sender: 'user',
        content,
        timestamp: Date.now(),
        messageType: MessageType.TEXT,
        status: MessageStatus.SENDING
      };
      
      get().addMessage(message);
      return message.id;
    },

    addAgentMessage: (content: string, agentName: string, engineName?: string) => {
      const message: ChatMessage = {
        id: `agent_${Date.now()}_${Math.random()}`,
        sender: 'agent',
        content,
        timestamp: Date.now(),
        agentName,
        engineName,
        messageType: MessageType.AGENT_FEEDBACK,
        status: MessageStatus.DELIVERED
      };
      
      get().addMessage(message);
    },

    // Message management
    retryMessage: (messageId: string) => {
      const message = get().getMessageById(messageId);
      if (message && message.sender === 'user') {
        // Update status to sending
        get().updateMessage(messageId, { status: MessageStatus.SENDING });
        return message;
      }
      return null;
    },

    getMessageById: (messageId: string) => {
      return get().messages.find(msg => msg.id === messageId) || null;
    },

    getMessagesByType: (type: MessageType) => {
      return get().messages.filter(msg => msg.messageType === type);
    },

    getRecentMessages: (count: number) => {
      const messages = get().messages;
      return messages.slice(-count);
    },

    // Statistics
    getMessageCount: () => {
      return get().messages.length;
    },

    getActiveAgentCount: () => {
      return get().activeAgents.length;
    },

    getConnectionUptime: () => {
      // This would need to be implemented with connection timestamps
      return 0;
    }
  }))
);

// Selectors for optimized component subscriptions
export const useChatMessages = () => useRevoChatStore(state => state.messages);
export const useChatSettings = () => useRevoChatStore(state => state.settings);
export const useConnectionStatus = () => useRevoChatStore(state => ({
  isConnected: state.isConnected,
  status: state.connectionStatus,
  error: state.lastError,
  reconnectCount: state.reconnectCount
}));
export const useActiveAgents = () => useRevoChatStore(state => state.activeAgents);
export const useCurrentWorkflow = () => useRevoChatStore(state => state.currentWorkflow);
export const useInputHistory = () => useRevoChatStore(state => ({
  history: state.inputHistory,
  index: state.historyIndex
}));

// Action selectors
export const useChatActions = () => useRevoChatStore(state => ({
  addMessage: state.addMessage,
  updateMessage: state.updateMessage,
  addSystemMessage: state.addSystemMessage,
  addUserMessage: state.addUserMessage,
  addAgentMessage: state.addAgentMessage,
  setTyping: state.setTyping,
  setConnectionStatus: state.setConnectionStatus,
  addToHistory: state.addToHistory,
  navigateHistory: state.navigateHistory,
  updateSettings: state.updateSettings
}));