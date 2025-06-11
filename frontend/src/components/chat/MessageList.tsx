/**
 * Enhanced MessageList Component
 * Efficiently renders and manages the list of chat messages with virtualization and auto-scroll
 */

import React, { memo, useEffect, useRef, useCallback, useState } from 'react';
import { Message } from './Message';
import { ChatMessage, ChatSettings } from '../../types/chat';
import { ChevronDown, ArrowDown } from 'lucide-react';

interface MessageListProps {
  messages: ChatMessage[];
  settings: ChatSettings;
  isTyping?: boolean;
  onRetryMessage?: (messageId: string) => void;
  onCopyMessage?: (content: string) => void;
  onContextMenu?: (event: React.MouseEvent, messageId: string) => void;
  className?: string;
}

export const MessageList: React.FC<MessageListProps> = memo(({
  messages,
  settings,
  isTyping = false,
  onRetryMessage,
  onCopyMessage,
  onContextMenu,
  className = ''
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const scrollTimeoutRef = useRef<number>();

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesEndRef.current && settings.autoScroll && !isUserScrolling) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: smooth ? 'smooth' : 'auto',
        block: 'end'
      });
    }
  }, [settings.autoScroll, isUserScrolling]);

  // Handle scroll events to detect user scrolling
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    setShowScrollButton(!isAtBottom);
    
    // Detect if user is manually scrolling
    if (!isAtBottom) {
      setIsUserScrolling(true);
      
      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      // Reset user scrolling flag after a delay
      scrollTimeoutRef.current = setTimeout(() => {
        setIsUserScrolling(false);
      }, 2000);
    } else {
      setIsUserScrolling(false);
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  // Scroll to bottom when typing indicator changes
  useEffect(() => {
    if (isTyping) {
      scrollToBottom();
    }
  }, [isTyping, scrollToBottom]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const handleScrollToBottom = useCallback(() => {
    setIsUserScrolling(false);
    scrollToBottom(true);
  }, [scrollToBottom]);

  const renderTypingIndicator = () => {
    if (!isTyping) return null;

    return (
      <div className="flex justify-start mb-4">
        <div className="bg-gray-700 rounded-lg px-4 py-3 max-w-xs">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="text-xs text-gray-400">ReVo AI is thinking...</span>
          </div>
        </div>
      </div>
    );
  };

  const renderEmptyState = () => {
    if (messages.length > 0) return null;

    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-400 max-w-md">
          <div className="mb-4">
            <ChevronDown className="w-12 h-12 mx-auto opacity-50" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Welcome to ReVo AI</h3>
          <p className="text-sm mb-4">
            Start a conversation with your AI assistant. You can ask questions, run commands, or create projects.
          </p>
          <div className="text-xs space-y-1">
            <div><code className="bg-gray-700 px-2 py-1 rounded">/help</code> - Show available commands</div>
            <div><code className="bg-gray-700 px-2 py-1 rounded">/create_project</code> - Create a new project</div>
            <div><code className="bg-gray-700 px-2 py-1 rounded">/run</code> - Execute a command</div>
          </div>
        </div>
      </div>
    );
  };

  const getContainerStyle = () => {
    const baseStyle = "flex-1 overflow-y-auto p-4 space-y-2";
    
    if (settings.compactMode) {
      return `${baseStyle} space-y-1`;
    }
    
    return baseStyle;
  };

  const getFontSizeClass = () => {
    switch (settings.fontSize) {
      case 'small':
        return 'text-sm';
      case 'large':
        return 'text-lg';
      default:
        return 'text-base';
    }
  };

  return (
    <div className={`relative flex flex-col h-full ${className}`}>
      {/* Messages Container */}
      <div
        ref={containerRef}
        className={`${getContainerStyle()} ${getFontSizeClass()}`}
        onScroll={handleScroll}
      >
        {renderEmptyState()}
        
        {messages.map((message) => (
          <Message
            key={message.id}
            message={message}
            showTimestamp={settings.showTimestamps}
            showAgentName={settings.showAgentNames}
            enableSyntaxHighlighting={settings.enableSyntaxHighlighting}
            enableMarkdownRendering={settings.enableMarkdownRendering}
            theme={settings.theme === 'auto' ? 'dark' : settings.theme}
            onRetry={onRetryMessage}
            onCopy={onCopyMessage}
            onContextMenu={onContextMenu}
          />
        ))}
        
        {renderTypingIndicator()}
        
        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button
          onClick={handleScrollToBottom}
          className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-all duration-200 z-10"
          title="Scroll to bottom"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}
    </div>
  );
});

MessageList.displayName = 'MessageList';