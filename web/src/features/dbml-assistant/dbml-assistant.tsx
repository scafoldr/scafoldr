import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import DbmlMessage from './components/dbml-message';
import { useDbmlAiAgent } from './hooks/use-dbml-ai-agent';

interface DbmlAssistantProps {
  // eslint-disable-next-line no-unused-vars
  setDbmlCode: (dbmlCode: string) => void;
}

const DbmlAssistant = ({ setDbmlCode }: DbmlAssistantProps) => {
  const { data, isLoading, isStreaming, error, invokeAgent } = useDbmlAiAgent({
    conversationId: 'default',
    projectId: 'project1'
  });
  const [newMessage, setNewMessage] = useState('');
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

  // Handle AI generation (placeholder for now)
  const handleAiGenerate = () => {
    invokeAgent(newMessage);
  };

  const handleSchemaClick = (schemaId: string, dbmlCode: string) => {
    setActiveSchemaId(schemaId);
    setDbmlCode(dbmlCode);
  };

  return (
    <>
      <div className="flex-1 p-2 overflow-y-auto">
        <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg mb-2 max-w-[80%]">
          <p className="text-sm">How can I help you with your database schema?</p>
        </div>

        <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg mb-2 max-w-[80%]">
          <p className="text-sm">{data}</p>
        </div>

        {/* DBML Schema Messages */}
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
      <div className="p-2 border-t border-slate-200 dark:border-slate-800">
        <div className="flex gap-2">
          <Textarea
            placeholder="Describe your database schema..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="min-h-[60px] resize-none text-sm"
          />
          <Button
            onClick={handleAiGenerate}
            disabled={isLoading || !newMessage.trim()}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white self-end">
            {isStreaming ? (
              <div className="flex items-center">
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Generating...</span>
              </div>
            ) : (
              <span>Send</span>
            )}
          </Button>
        </div>
      </div>
    </>
  );
};

export default DbmlAssistant;
