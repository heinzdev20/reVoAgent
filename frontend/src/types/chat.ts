/**
 * Enhanced Chat Interface Types
 * Comprehensive type definitions for the ReVo AI Chat Interface
 */

export interface ChatMessage {
  id: string;
  sender: 'user' | 'revo' | 'agent';
  content: string;
  timestamp: number;
  agentName?: string;
  engineName?: string;
  messageType?: MessageType;
  metadata?: MessageMetadata;
  status?: MessageStatus;
}

export enum MessageType {
  TEXT = 'text',
  CODE = 'code',
  MARKDOWN = 'markdown',
  SYSTEM = 'system',
  ERROR = 'error',
  SUCCESS = 'success',
  WARNING = 'warning',
  WORKFLOW_UPDATE = 'workflow_update',
  FUNCTION_CALL = 'function_call',
  AGENT_FEEDBACK = 'agent_feedback'
}

export enum MessageStatus {
  SENDING = 'sending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  PROCESSING = 'processing'
}

export interface MessageMetadata {
  workflowId?: string;
  stepId?: string;
  functionName?: string;
  functionArgs?: Record<string, any>;
  codeLanguage?: string;
  executionTime?: number;
  tokens?: {
    input: number;
    output: number;
  };
  context?: {
    memoryRetrieved?: boolean;
    contextUsed?: string[];
  };
}

export interface SlashCommand {
  command: string;
  description: string;
  usage: string;
  category: CommandCategory;
  parameters?: CommandParameter[];
}

export enum CommandCategory {
  EXECUTION = 'execution',
  WORKFLOW = 'workflow',
  PROJECT = 'project',
  ANALYSIS = 'analysis',
  SYSTEM = 'system'
}

export interface CommandParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array';
  required: boolean;
  description: string;
  default?: any;
}

export interface ChatState {
  messages: ChatMessage[];
  isConnected: boolean;
  isTyping: boolean;
  currentWorkflow?: WorkflowStatus;
  activeAgents: string[];
  inputHistory: string[];
  historyIndex: number;
}

export interface WorkflowStatus {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  currentStep?: string;
  totalSteps: number;
  completedSteps: number;
  startedAt?: number;
  completedAt?: number;
  errorMessage?: string;
}

export interface FunctionCallResult {
  functionName: string;
  arguments: Record<string, any>;
  result?: any;
  error?: string;
  executionTime: number;
}

export interface AgentFeedback {
  agentName: string;
  engineName: string;
  status: 'started' | 'progress' | 'completed' | 'error';
  message: string;
  progress?: number;
  data?: any;
}

export interface ChatContextMenu {
  x: number;
  y: number;
  messageId: string;
  actions: ContextMenuAction[];
}

export interface ContextMenuAction {
  id: string;
  label: string;
  icon?: string;
  action: (messageId: string) => void;
  disabled?: boolean;
}

export interface ChatSettings {
  theme: 'dark' | 'light' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  showTimestamps: boolean;
  showAgentNames: boolean;
  enableSyntaxHighlighting: boolean;
  enableMarkdownRendering: boolean;
  autoScroll: boolean;
  soundNotifications: boolean;
  compactMode: boolean;
}

export interface WebSocketMessage {
  type: 'message' | 'status' | 'workflow_update' | 'agent_feedback' | 'function_call' | 'error';
  data: any;
  timestamp: number;
  id?: string;
}