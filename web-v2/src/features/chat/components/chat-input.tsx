import { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export interface ChatInputRef {
  focus: () => void;
}

export const ChatInput = forwardRef<ChatInputRef, ChatInputProps>(({
  onSendMessage,
  disabled = false,
  placeholder = "Describe changes or ask questions..."
}, ref) => {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    }
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || disabled) return;
    
    onSendMessage(input.trim());
    setInput('');
  };

  return (
    <div className="p-4 border-t border-slate-200 dark:border-slate-800">
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          className="flex-1"
          disabled={disabled}
          data-chat-input
        />
        <Button 
          type="submit" 
          size="sm" 
          disabled={!input.trim() || disabled}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
});

ChatInput.displayName = 'ChatInput';