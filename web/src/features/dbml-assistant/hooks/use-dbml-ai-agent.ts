import { fetchEventSource } from '@microsoft/fetch-event-source';
import { useState } from 'react';

interface DbmlAIAgentRequest {
  conversationId?: string;
  projectId?: string;
}

export interface DbmlData {
  dbml: string;
}

export function useDbmlAiAgent(params: DbmlAIAgentRequest) {
  const [data, setData] = useState<string | null>(null);
  const [dbmlData, setDbmlData] = useState<DbmlData | null>(null);

  // different states for loading and streaming, streaming will
  // become true when first data chunk is received while loading
  // isLoading will be true from moment of request start until
  // request is finished
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);

  const invokeAgent = async (prompt: string) => {
    setIsLoading(true);
    setError(null);
    setData(null);
    setDbmlData(null);
    setIsStreaming(false);

    try {
      await fetchEventSource('/api/ai-agents/software-architect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: prompt,
          conversation_id: params.conversationId,
          project_id: params.projectId
        }),
        onmessage(event) {
          const data = JSON.parse(event.data);
          if (data.type === 'text_delta') {
            setData((prev) => (prev ? prev + data.content : data.content));
          }
          if (data.type === 'dbml_data') {
            setDbmlData({
              dbml: data.dbml
            });
          }
          if (!isStreaming) {
            setIsStreaming(true);
          }
        },
        onerror(err) {
          console.error('Stream error:', err);
          setError(err.message);
        },
        openWhenHidden: true // Keep the connection open even when the tab is hidden
      });
    } catch (error: unknown) {
      setError((error as Error).message);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  return { data, dbmlData, isLoading, isStreaming, error, invokeAgent };
}
