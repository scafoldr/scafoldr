import { fetchEventSource } from '@microsoft/fetch-event-source';
import { useState } from 'react';

interface DbmlAIAgentRequest {
  conversationId?: string;
  projectId?: string;
}
export function useDbmlAiAgent(params: DbmlAIAgentRequest) {
  const [data, setData] = useState<string | null>(null);

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
    setIsStreaming(false);

    try {
      await fetchEventSource('/api/dbml-ai-agent/stream', {
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
          setData((prev) => (prev ? prev + event.data : event.data));
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

  return { data, isLoading, isStreaming, error, invokeAgent };
}
