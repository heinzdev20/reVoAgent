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
  type: 'message' | 'status' | 'workflow_update' | 'agent_feedback' | 'function_call' | 'error' | 'multi_agent_event';
  data: any;
  timestamp: number;
  id?: string;
}

// Enhanced Multi-Agent Chat Types
export interface MultiAgentChatEvent {
  event_type: 'message' | 'agent_thinking' | 'agent_response' | 'collaboration_start' | 'collaboration_update' | 'collaboration_complete' | 'workflow_created' | 'session_update' | 'error';
  session_id: string;
  data: Record<string, any>;
  timestamp: string;
  agent_id?: string;
}

export interface AgentState {
  agent_id: string;
  role: string;
  status: 'idle' | 'thinking' | 'responding' | 'collaborating' | 'complete';
  current_task?: string;
  progress: number;
  last_update: string;
}

export interface CollaborationPattern {
  name: string;
  agents: string[];
  pattern: 'parallel_analysis' | 'sequential_cascade' | 'swarm_intelligence' | 'iterative_collaboration';
  merge_strategy: string;
  real_time: boolean;
  streaming: boolean;
}

export interface MultiAgentSession {
  session_id: string;
  user_id: string;
  created_at: string;
  status: 'active' | 'ended';
  collaboration_pattern: string;
  message_history: MultiAgentMessage[];
  agent_states: Record<string, AgentState>;
  shared_context: Record<string, any>;
  real_time_updates: boolean;
}

export interface MultiAgentMessage {
  id: string;
  type: 'user' | 'agent' | 'system' | 'multi_agent_response';
  content: string | Record<string, any>;
  user_id?: string;
  agent_role?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface AgentCollaborationState {
  active_agents: AgentState[];
  collaboration_phase: 'starting' | 'analyzing' | 'collaborating' | 'consensus' | 'complete';
  progress: number;
  current_pattern: CollaborationPattern;
  real_time_events: MultiAgentChatEvent[];
}