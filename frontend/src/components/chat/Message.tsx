/**
 * Enhanced Message Component
 * Renders individual chat messages with syntax highlighting, markdown support, and rich formatting
 */

import React, { memo, useState, useCallback } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown';
import { 
  Clock, 
  User, 
  Bot, 
  Cpu, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Loader2,
  Copy,
  MoreVertical,
  Repeat
} from 'lucide-react';
import { ChatMessage, MessageType, MessageStatus } from '../../types/chat';

interface MessageProps {
  message: ChatMessage;
  showTimestamp?: boolean;
  showAgentName?: boolean;
  enableSyntaxHighlighting?: boolean;
  enableMarkdownRendering?: boolean;
  theme?: 'dark' | 'light';
  onRetry?: (messageId: string) => void;
  onCopy?: (content: string) => void;
  onContextMenu?: (event: React.MouseEvent, messageId: string) => void;
}

export const Message: React.FC<MessageProps> = memo(({
  message,
  showTimestamp = true,
  showAgentName = true,
  enableSyntaxHighlighting = true,
  enableMarkdownRendering = true,
  theme = 'dark',
  onRetry,
  onCopy,
  onContextMenu
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);

  const getSenderIcon = () => {
    switch (message.sender) {
      case 'user':
        return <User className="w-4 h-4" />;
      case 'revo':
        return <Bot className="w-4 h-4" />;
      case 'agent':
        return <Cpu className="w-4 h-4" />;
      default:
        return <Bot className="w-4 h-4" />;
    }
  };

  const getStatusIcon = () => {
    switch (message.status) {
      case MessageStatus.SENDING:
        return <Loader2 className="w-3 h-3 animate-spin text-blue-400" />;
      case MessageStatus.SENT:
        return <CheckCircle className="w-3 h-3 text-green-400" />;
      case MessageStatus.DELIVERED:
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      case MessageStatus.FAILED:
        return <XCircle className="w-3 h-3 text-red-400" />;
      case MessageStatus.PROCESSING:
        return <Loader2 className="w-3 h-3 animate-spin text-yellow-400" />;
      default:
        return null;
    }
  };

  const getMessageTypeIcon = () => {
    switch (message.messageType) {
      case MessageType.ERROR:
        return <XCircle className="w-4 h-4 text-red-400" />;
      case MessageType.SUCCESS:
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case MessageType.WARNING:
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      case MessageType.WORKFLOW_UPDATE:
        return <Cpu className="w-4 h-4 text-blue-400" />;
      default:
        return null;
    }
  };

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      onCopy?.(message.content);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  }, [message.content, onCopy]);

  const handleRetry = useCallback(() => {
    onRetry?.(message.id);
  }, [message.id, onRetry]);

  const renderContent = () => {
    // Check for code blocks
    const codeBlockMatch = message.content.match(/```(\w+)?\n([\s\S]*?)```/);
    
    if (codeBlockMatch && enableSyntaxHighlighting) {
      const language = codeBlockMatch[1] || 'text';
      const code = codeBlockMatch[2];
      
      return (
        <div className="w-full">
          <div className="flex items-center justify-between bg-gray-800 px-3 py-2 rounded-t-lg">
            <span className="text-xs text-gray-400 font-mono">{language}</span>
            <button
              onClick={handleCopy}
              className="text-gray-400 hover:text-white transition-colors"
              title="Copy code"
            >
              <Copy className="w-3 h-3" />
            </button>
          </div>
          <SyntaxHighlighter
            language={language}
            style={theme === 'dark' ? vscDarkPlus : vs}
            customStyle={{
              margin: 0,
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
              fontSize: '0.875rem'
            }}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      );
    }

    // Check for inline code
    if (message.content.includes('`') && enableSyntaxHighlighting) {
      const parts = message.content.split(/(`[^`]+`)/);
      return (
        <div className="whitespace-pre-wrap">
          {parts.map((part, index) => {
            if (part.startsWith('`') && part.endsWith('`')) {
              const code = part.slice(1, -1);
              return (
                <code
                  key={index}
                  className="bg-gray-700 text-green-300 px-1 py-0.5 rounded text-sm font-mono"
                >
                  {code}
                </code>
              );
            }
            return enableMarkdownRendering ? (
              <ReactMarkdown key={index} className="inline">
                {part}
              </ReactMarkdown>
            ) : (
              part
            );
          })}
        </div>
      );
    }

    // Regular markdown rendering
    if (enableMarkdownRendering && (message.content.includes('**') || message.content.includes('*') || message.content.includes('#'))) {
      return (
        <ReactMarkdown className="prose prose-invert max-w-none">
          {message.content}
        </ReactMarkdown>
      );
    }

    // Plain text
    return <div className="whitespace-pre-wrap">{message.content}</div>;
  };

  const getMessageAlignment = () => {
    return message.sender === 'user' ? 'justify-end' : 'justify-start';
  };

  const getMessageBubbleStyle = () => {
    const baseStyle = "rounded-lg px-4 py-3 max-w-4xl shadow-lg";
    
    switch (message.sender) {
      case 'user':
        return `${baseStyle} bg-blue-600 text-white`;
      case 'revo':
        return `${baseStyle} bg-gray-700 text-gray-100`;
      case 'agent':
        return `${baseStyle} bg-purple-700 text-gray-100`;
      default:
        return `${baseStyle} bg-gray-700 text-gray-100`;
    }
  };

  const getMessageTypeStyle = () => {
    switch (message.messageType) {
      case MessageType.ERROR:
        return 'border-l-4 border-red-400';
      case MessageType.SUCCESS:
        return 'border-l-4 border-green-400';
      case MessageType.WARNING:
        return 'border-l-4 border-yellow-400';
      case MessageType.WORKFLOW_UPDATE:
        return 'border-l-4 border-blue-400';
      default:
        return '';
    }
  };

  return (
    <div 
      className={`flex w-full mb-4 ${getMessageAlignment()}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onContextMenu={(e) => onContextMenu?.(e, message.id)}
    >
      <div className={`${getMessageBubbleStyle()} ${getMessageTypeStyle()} relative group`}>
        {/* Message Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {getSenderIcon()}
            <span className="text-xs font-semibold opacity-80">
              {message.sender === 'user' ? 'You' : 
               message.sender === 'agent' && showAgentName ? message.agentName || 'Agent' :
               message.sender === 'revo' ? 'ReVo AI' : 'System'}
            </span>
            {message.engineName && (
              <span className="text-xs opacity-60 bg-black bg-opacity-20 px-2 py-1 rounded">
                {message.engineName}
              </span>
            )}
            {getMessageTypeIcon()}
          </div>
          
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            {showTimestamp && (
              <div className="flex items-center space-x-1 text-xs opacity-60">
                <Clock className="w-3 h-3" />
                <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Message Content */}
        <div className="text-sm leading-relaxed">
          {renderContent()}
        </div>

        {/* Message Metadata */}
        {message.metadata && (
          <div className="mt-3 pt-2 border-t border-gray-600 border-opacity-30">
            {message.metadata.executionTime && (
              <div className="text-xs opacity-60">
                Execution time: {message.metadata.executionTime}ms
              </div>
            )}
            {message.metadata.tokens && (
              <div className="text-xs opacity-60">
                Tokens: {message.metadata.tokens.input} in, {message.metadata.tokens.output} out
              </div>
            )}
            {message.metadata.functionName && (
              <div className="text-xs opacity-60">
                Function: {message.metadata.functionName}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {isHovered && (
          <div className="absolute -right-2 top-2 flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              className="p-1 bg-gray-600 hover:bg-gray-500 rounded text-white transition-colors"
              title={copied ? 'Copied!' : 'Copy message'}
            >
              <Copy className="w-3 h-3" />
            </button>
            
            {message.status === MessageStatus.FAILED && onRetry && (
              <button
                onClick={handleRetry}
                className="p-1 bg-red-600 hover:bg-red-500 rounded text-white transition-colors"
                title="Retry message"
              >
                <Repeat className="w-3 h-3" />
              </button>
            )}
            
            <button
              onClick={(e) => onContextMenu?.(e, message.id)}
              className="p-1 bg-gray-600 hover:bg-gray-500 rounded text-white transition-colors"
              title="More options"
            >
              <MoreVertical className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

Message.displayName = 'Message';