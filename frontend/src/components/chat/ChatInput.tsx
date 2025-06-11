/**
 * Enhanced ChatInput Component
 * Advanced input field with slash commands, history navigation, and auto-completion
 */

import React, { useState, useRef, useCallback, useEffect, KeyboardEvent } from 'react';
import { Send, Command, ArrowUp, ArrowDown, Loader2, Mic, MicOff } from 'lucide-react';
import { SlashCommand, CommandCategory } from '../../types/chat';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onSendCommand: (command: string, args: Record<string, any>) => void;
  disabled?: boolean;
  placeholder?: string;
  inputHistory?: string[];
  onHistoryUpdate?: (history: string[]) => void;
  isProcessing?: boolean;
  className?: string;
}

const SLASH_COMMANDS: SlashCommand[] = [
  {
    command: '/help',
    description: 'Show available commands and usage',
    usage: '/help [command]',
    category: CommandCategory.SYSTEM
  },
  {
    command: '/run',
    description: 'Execute a terminal command',
    usage: '/run <command>',
    category: CommandCategory.EXECUTION,
    parameters: [
      { name: 'command', type: 'string', required: true, description: 'Command to execute' }
    ]
  },
  {
    command: '/browse',
    description: 'Browse and extract content from a URL',
    usage: '/browse <url>',
    category: CommandCategory.EXECUTION,
    parameters: [
      { name: 'url', type: 'string', required: true, description: 'URL to browse' }
    ]
  },
  {
    command: '/create_project',
    description: 'Create a new project from template',
    usage: '/create_project --name <name> --template <template>',
    category: CommandCategory.PROJECT,
    parameters: [
      { name: 'name', type: 'string', required: true, description: 'Project name' },
      { name: 'template', type: 'string', required: false, description: 'Project template', default: 'python-fastapi' }
    ]
  },
  {
    command: '/analyze',
    description: 'Analyze code or project structure',
    usage: '/analyze [path]',
    category: CommandCategory.ANALYSIS,
    parameters: [
      { name: 'path', type: 'string', required: false, description: 'Path to analyze' }
    ]
  },
  {
    command: '/refactor',
    description: 'Get refactoring suggestions',
    usage: '/refactor <function_name>',
    category: CommandCategory.ANALYSIS,
    parameters: [
      { name: 'function_name', type: 'string', required: true, description: 'Function to refactor' }
    ]
  },
  {
    command: '/audit',
    description: 'Run security and performance audit',
    usage: '/audit [--security] [--performance]',
    category: CommandCategory.ANALYSIS,
    parameters: [
      { name: 'security', type: 'boolean', required: false, description: 'Run security audit' },
      { name: 'performance', type: 'boolean', required: false, description: 'Run performance audit' }
    ]
  },
  {
    command: '/workflow',
    description: 'Manage workflows',
    usage: '/workflow <action> [workflow_id]',
    category: CommandCategory.WORKFLOW,
    parameters: [
      { name: 'action', type: 'string', required: true, description: 'Action: list, start, pause, resume, cancel' },
      { name: 'workflow_id', type: 'string', required: false, description: 'Workflow ID' }
    ]
  }
];

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onSendCommand,
  disabled = false,
  placeholder = 'Type a message or use / for commands...',
  inputHistory = [],
  onHistoryUpdate,
  isProcessing = false,
  className = ''
}) => {
  const [input, setInput] = useState('');
  const [showCommands, setShowCommands] = useState(false);
  const [filteredCommands, setFilteredCommands] = useState<SlashCommand[]>([]);
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isListening, setIsListening] = useState(false);
  
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const commandsRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Handle slash command detection and filtering
  useEffect(() => {
    if (input.startsWith('/')) {
      const commandText = input.slice(1).toLowerCase();
      const filtered = SLASH_COMMANDS.filter(cmd => 
        cmd.command.toLowerCase().includes(commandText) ||
        cmd.description.toLowerCase().includes(commandText)
      );
      setFilteredCommands(filtered);
      setShowCommands(filtered.length > 0);
      setSelectedCommandIndex(0);
    } else {
      setShowCommands(false);
      setFilteredCommands([]);
    }
  }, [input]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSend = useCallback(() => {
    if (!input.trim() || disabled || isProcessing) return;

    const trimmedInput = input.trim();
    
    // Add to history
    if (trimmedInput && !inputHistory.includes(trimmedInput)) {
      const newHistory = [trimmedInput, ...inputHistory.slice(0, 49)]; // Keep last 50
      onHistoryUpdate?.(newHistory);
    }

    // Check if it's a command
    if (trimmedInput.startsWith('/')) {
      const parts = trimmedInput.split(' ');
      const command = parts[0];
      const args = parseCommandArgs(parts.slice(1));
      onSendCommand(command, args);
    } else {
      onSendMessage(trimmedInput);
    }

    setInput('');
    setHistoryIndex(-1);
    setShowCommands(false);
  }, [input, disabled, isProcessing, inputHistory, onHistoryUpdate, onSendMessage, onSendCommand]);

  const parseCommandArgs = (args: string[]): Record<string, any> => {
    const parsed: Record<string, any> = {};
    
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      
      if (arg.startsWith('--')) {
        const key = arg.slice(2);
        const nextArg = args[i + 1];
        
        if (nextArg && !nextArg.startsWith('--')) {
          parsed[key] = nextArg;
          i++; // Skip next arg as it's the value
        } else {
          parsed[key] = true; // Boolean flag
        }
      } else if (!Object.keys(parsed).length) {
        // First non-flag argument
        parsed.command = arg;
      }
    }
    
    return parsed;
  };

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (showCommands && filteredCommands.length > 0) {
        selectCommand(filteredCommands[selectedCommandIndex]);
      } else {
        handleSend();
      }
    } else if (e.key === 'ArrowUp') {
      if (showCommands) {
        e.preventDefault();
        setSelectedCommandIndex(prev => 
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
      } else if (inputHistory.length > 0) {
        e.preventDefault();
        const newIndex = Math.min(historyIndex + 1, inputHistory.length - 1);
        setHistoryIndex(newIndex);
        setInput(inputHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      if (showCommands) {
        e.preventDefault();
        setSelectedCommandIndex(prev => 
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
      } else if (historyIndex >= 0) {
        e.preventDefault();
        const newIndex = historyIndex - 1;
        if (newIndex >= 0) {
          setHistoryIndex(newIndex);
          setInput(inputHistory[newIndex]);
        } else {
          setHistoryIndex(-1);
          setInput('');
        }
      }
    } else if (e.key === 'Escape') {
      setShowCommands(false);
      setHistoryIndex(-1);
    } else if (e.key === 'Tab' && showCommands) {
      e.preventDefault();
      selectCommand(filteredCommands[selectedCommandIndex]);
    }
  }, [showCommands, filteredCommands, selectedCommandIndex, handleSend, inputHistory, historyIndex]);

  const selectCommand = useCallback((command: SlashCommand) => {
    setInput(command.usage);
    setShowCommands(false);
    inputRef.current?.focus();
  }, []);

  const toggleVoiceInput = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening]);

  const renderCommandSuggestions = () => {
    if (!showCommands || filteredCommands.length === 0) return null;

    return (
      <div 
        ref={commandsRef}
        className="absolute bottom-full left-0 right-0 mb-2 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-64 overflow-y-auto z-50"
      >
        <div className="p-2 border-b border-gray-600">
          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <Command className="w-3 h-3" />
            <span>Commands</span>
          </div>
        </div>
        
        {filteredCommands.map((command, index) => (
          <div
            key={command.command}
            className={`p-3 cursor-pointer transition-colors ${
              index === selectedCommandIndex 
                ? 'bg-blue-600 text-white' 
                : 'hover:bg-gray-700 text-gray-200'
            }`}
            onClick={() => selectCommand(command)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-mono text-sm font-semibold">
                  {command.command}
                </div>
                <div className="text-xs opacity-80 mt-1">
                  {command.description}
                </div>
              </div>
              <div className="text-xs opacity-60 ml-2">
                {command.category}
              </div>
            </div>
            <div className="font-mono text-xs opacity-60 mt-2">
              {command.usage}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`relative ${className}`}>
      {renderCommandSuggestions()}
      
      <div className="flex items-end space-x-2 p-4 bg-gray-800 border-t border-gray-600">
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isProcessing}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            rows={1}
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
          
          {/* Voice input button */}
          {recognitionRef.current && (
            <button
              onClick={toggleVoiceInput}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded transition-colors ${
                isListening 
                  ? 'text-red-400 hover:text-red-300' 
                  : 'text-gray-400 hover:text-gray-300'
              }`}
              title={isListening ? 'Stop listening' : 'Start voice input'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}
        </div>
        
        <button
          onClick={handleSend}
          disabled={!input.trim() || disabled || isProcessing}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-3 rounded-lg transition-colors flex items-center justify-center"
          title="Send message (Enter)"
        >
          {isProcessing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
      
      {/* Input hints */}
      <div className="px-4 pb-2 text-xs text-gray-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span>Press <kbd className="bg-gray-700 px-1 rounded">Enter</kbd> to send</span>
            <span><kbd className="bg-gray-700 px-1 rounded">Shift+Enter</kbd> for new line</span>
            <span><kbd className="bg-gray-700 px-1 rounded">/</kbd> for commands</span>
          </div>
          <div className="flex items-center space-x-2">
            <ArrowUp className="w-3 h-3" />
            <ArrowDown className="w-3 h-3" />
            <span>History</span>
          </div>
        </div>
      </div>
    </div>
  );
};

