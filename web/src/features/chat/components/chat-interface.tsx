'use client';

import { useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { ChatHistory } from './chat-history';
import { ChatInput, ChatInputRef } from './chat-input';
import { useChat } from '../hooks/use-chat';

interface ChatInterfaceProps {
  initialPrompt?: string;
  selectedFramework?: string;
  onUserInteraction?: () => void;
  onMessageReceived?: (messageType: string, content?: string) => void;
}

export function ChatInterface({
  initialPrompt,
  onUserInteraction,
  onMessageReceived
}: ChatInterfaceProps) {
  const chatInputRef = useRef<ChatInputRef>(null);
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    initializeWithPrompt,
    clearError,
    isLastMessageLoading
  } = useChat({ initialPrompt });

  // Initialize chat with prompt from home page if available
  useEffect(() => {
    initializeWithPrompt();
  }, [initializeWithPrompt]);

  // Track message changes and notify parent + auto-focus input
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.from === 'agent') {
        // Notify parent if callback provided
        if (onMessageReceived) {
          onMessageReceived(lastMessage.type, lastMessage.text);
        }

        // Auto-focus input after agent message (with small delay to ensure rendering is complete)
        // Only focus if the message is not a loading message
        if (lastMessage.type !== 'loading') {
          setTimeout(() => {
            chatInputRef.current?.focus();
          }, 100);
        }
      }
    }
  }, [messages, onMessageReceived]);

  const handleSendMessage = async (message: string) => {
    // Notify parent that user has interacted
    if (onUserInteraction) {
      onUserInteraction();
    }

    if (error) {
      clearError();
    }
    await sendMessage(message);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">AI Assistant</h3>
            <p className="text-xs text-slate-500">{isLoading ? 'Thinking...' : ''}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ChatHistory messages={messages} />

      {/* Error Display */}
      {error && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-950/30 border-t border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">⚠️ {error}</p>
        </div>
      )}

      {/* Input */}
      <ChatInput
        ref={chatInputRef}
        onSendMessage={handleSendMessage}
        disabled={isLastMessageLoading}
        placeholder={
          messages.length === 0
            ? 'Describe your database or application idea...'
            : 'Describe changes or ask questions...'
        }
      />
    </div>
  );
}
