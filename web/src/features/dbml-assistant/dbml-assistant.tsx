import React, { useState, useCallback, useEffect } from 'react';
import { Chat } from '@/components/ui/chat';
import { type Message } from '@/components/ui/chat-message';
import DbmlMessage from './components/dbml-message';
import { useDbmlAiAgent } from './hooks/use-dbml-ai-agent';

interface DbmlAssistantProps {
  // eslint-disable-next-line no-unused-vars
  setDbmlCode: (dbmlCode: string) => void;
}

const DbmlAssistant = ({ setDbmlCode }: DbmlAssistantProps) => {
  const { data, isLoading, isStreaming, invokeAgent } = useDbmlAiAgent({
    conversationId: 'default',
    projectId: 'project1'
  });

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'How can I help you with your database schema?',
      createdAt: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [activeSchemaId, setActiveSchemaId] = useState<string>('schema1');

  // Example DBML schemas
  const schemas = {
    schema1: {
      id: 'schema1',
      version: '1',
      code: `Table users {
  id integer [primary key]
  username varchar
  email varchar [unique]
  created_at timestamp
}

Table posts {
  id integer [primary key]
  title varchar
  content text
  user_id integer [ref: > users.id]
  created_at timestamp
}`
    },
    schema2: {
      id: 'schema2',
      version: '2',
      code: `Table old_users {
  id integer [primary key]
  name varchar
  email varchar
}`
    }
  };

  // Update messages when AI agent responds
  useEffect(() => {
    if (data && data.trim()) {
      setMessages((prev) => {
        // Check if the last message is from assistant and update it, or add new one
        const lastMessage = prev[prev.length - 1];
        if (lastMessage && lastMessage.role === 'assistant') {
          // Update the thinking message with actual response
          return prev.map((msg, index) =>
            index === prev.length - 1 ? { ...msg, content: data, createdAt: new Date() } : msg
          );
        }
      });
    }
  }, [data]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  }, []);

  const handleSubmit = useCallback(
    (event?: { preventDefault?: () => void }) => {
      event?.preventDefault?.();

      if (!input.trim()) return;

      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: input,
        createdAt: new Date()
      };

      // Add thinking message
      const thinkingMessage: Message = {
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

  const handleSchemaClick = (schemaId: string, dbmlCode: string) => {
    setActiveSchemaId(schemaId);
    setDbmlCode(dbmlCode);
  };

  const stop = useCallback(() => {
    // Implementation for stopping generation if needed
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* DBML Schema Messages - Show above chat */}
      {/* <div className="p-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex flex-col gap-2">
          {Object.values(schemas).map((schema) => (
            <DbmlMessage
              key={schema.id}
              dbmlCode={schema.code}
              version={schema.version}
              onClick={() => handleSchemaClick(schema.id, schema.code)}
              isActive={activeSchemaId === schema.id}
            />
          ))}
        </div>
      </div> */}

      {/* Chat Component */}
      <div className="flex-1 min-h-0 px-2 pb-10">
        <Chat
          messages={messages}
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          isGenerating={isLoading || isStreaming}
          stop={stop}
        />
      </div>
    </div>
  );
};

export default DbmlAssistant;
