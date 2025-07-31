'use client';

import { MessageCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PreviewIndicatorProps {
  tabName: string;
  className?: string;
  show?: boolean;
}

export function PreviewIndicator({ tabName, className = '', show = true }: PreviewIndicatorProps) {
  if (!show) return null;
  return (
    <div
      className={`absolute top-4 left-4 right-4 z-50 bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-blue-950/80 dark:to-purple-950/80 backdrop-blur-md border border-blue-200/60 dark:border-blue-800/60 rounded-lg p-3 shadow-lg ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {tabName} Preview Mode
            </span>
          </div>
          <div className="hidden sm:block text-xs text-slate-500 dark:text-slate-400">
            This is just a preview. Chat with Scafoldr AI to see the real magic!
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-xs px-3 py-1"
          onClick={() => {
            // Focus on the chat input or scroll to chat
            const chatInput = document.querySelector('[data-chat-input]') as HTMLElement;
            if (chatInput) {
              chatInput.focus();
            }
          }}>
          <MessageCircle className="w-3 h-3 mr-1" />
          <span className="hidden sm:inline">Chat with AI</span>
          <span className="sm:hidden">Chat</span>
        </Button>
      </div>
    </div>
  );
}
