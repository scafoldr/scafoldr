'use client';

import { useEffect } from 'react';
import { Sparkles } from "lucide-react";
import { ChatHistory } from './chat-history';
import { ChatInput } from './chat-input';
import { useChat } from '../hooks/use-chat';

interface ChatInterfaceProps {
  initialPrompt?: string;
  onViewCode?: (files: any) => void;
  onViewDB?: (dbmlCode: string) => void;
}

export function ChatInterface({ initialPrompt, onViewCode, onViewDB }: ChatInterfaceProps) {
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

  const handleSendMessage = async (message: string) => {
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
            <p className="text-xs text-slate-500">
              {isLoading ? 'Thinking...' : 'Building your app...'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ChatHistory messages={messages} onViewCode={onViewCode} onViewDB={onViewDB} />

      {/* Error Display */}
      {error && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-950/30 border-t border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">
            ⚠️ {error}
          </p>
        </div>
      )}

      {/* Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        disabled={isLastMessageLoading}
        placeholder={
          messages.length === 0 
            ? "Describe your database or application idea..." 
            : "Describe changes or ask questions..."
        }
      />
    </div>
  );
}