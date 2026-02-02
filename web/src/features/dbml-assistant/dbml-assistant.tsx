import React, { useState, useCallback, useEffect } from 'react';
import { ChatContainer, ChatForm } from '@/components/ui/chat';
import { ChatMessages } from '@/components/ui/chat';
import { MessageInput } from '@/components/ui/message-input';
import { useDbmlAiAgent } from './hooks/use-dbml-ai-agent';
import { DbmlMessage as DbmlMessageType } from './types/message';
import { DbmlMessageList } from './components/dbml-message-list';

interface DbmlAssistantProps {
  // eslint-disable-next-line no-unused-vars
  setDbmlCode: (dbmlCode: string) => void;
}

const DbmlAssistant = ({ setDbmlCode }: DbmlAssistantProps) => {
  const { data, dbmlData, isLoading, isStreaming, invokeAgent } = useDbmlAiAgent({
    conversationId: 'default',
    projectId: 'project1'
  });

  const [messages, setMessages] = useState<DbmlMessageType[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'How can I help you with your database schema?',
      createdAt: new Date()
    }
  ]);
  const [input, setInput] = useState('');

  // Update messages when AI agent responds
  useEffect(() => {
    if (data && data.trim()) {
      setMessages((prev) => {
        // Check if the last message is from assistant and update it, or add new one
        const lastMessage = prev[prev.length - 1];
        if (lastMessage && lastMessage.role === 'assistant') {
          // Update the thinking message with actual response
          return prev.map((msg, index) =>
            index === prev.length - 1
              ? { ...msg, content: data, dbmlData: dbmlData || undefined, createdAt: new Date() }
              : msg
          );
        }
        return prev;
      });
    }
  }, [data, dbmlData]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  }, []);

  const handleSubmit = useCallback(
    (event?: { preventDefault?: () => void }) => {
      event?.preventDefault?.();

      if (!input.trim()) return;

      // Add user message
      const userMessage: DbmlMessageType = {
        id: Date.now().toString(),
        role: 'user',
        content: input,
        createdAt: new Date()
      };

      // Add thinking message
      const thinkingMessage: DbmlMessageType = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Thinking...',
        createdAt: new Date()
      };

      setMessages((prev) => [...prev, userMessage, thinkingMessage]);

      // Invoke the AI agent
      invokeAgent(input);

      // Clear input
      setInput('');
    },
    [input, invokeAgent]
  );

  const stop = useCallback(() => {
    // Implementation for stopping generation if needed
  }, []);

  const handleDbmlClick = useCallback(
    (dbmlCode: string) => {
      setDbmlCode(dbmlCode);
    },
    [setDbmlCode]
  );

  return (
    <div className="flex flex-col h-full">
      {/* Chat Component with DBML Messages */}
      <div className="flex-1 min-h-0 p-2 content-end">
        <ChatContainer>
          {messages.length > 0 ? (
            <ChatMessages messages={messages}>
              <DbmlMessageList
                messages={messages}
                isTyping={isLoading || isStreaming}
                onDbmlClick={handleDbmlClick}
              />
            </ChatMessages>
          ) : null}

          <ChatForm
            className="mt-auto"
            isPending={isLoading || isStreaming}
            handleSubmit={handleSubmit}>
            {() => (
              <MessageInput
                value={input}
                onChange={handleInputChange}
                allowAttachments={false}
                stop={stop}
                isGenerating={isLoading || isStreaming}
              />
            )}
          </ChatForm>
        </ChatContainer>
      </div>
    </div>
  );
};

export default DbmlAssistant;
