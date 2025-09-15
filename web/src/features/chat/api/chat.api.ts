import { ChatApiRequest, ScafoldrIncResponse } from '../types/chat.types';

export class ChatApiError extends Error {
  constructor(
    message: string,
    public status?: number
  ) {
    super(message);
    this.name = 'ChatApiError';
  }
}

export async function sendChatMessage(request: ChatApiRequest): Promise<ScafoldrIncResponse> {
  try {
    const response = await fetch('/api/scafoldr-inc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new ChatApiError(errorText || 'Scafoldr Inc API error', response.status);
    }

    const responseData = await response.json();

    // Return Scafoldr Inc response format directly
    return responseData as ScafoldrIncResponse;
  } catch (error) {
    if (error instanceof ChatApiError) {
      throw error;
    }
    throw new ChatApiError(error instanceof Error ? error.message : 'An unknown error occurred');
  }
}

/**
 * Sends a chat message to the streaming API endpoint and processes the response as a stream.
 * @param request The chat API request
 * @param onChunk Callback function that receives each chunk of the response as it arrives
 * @param onComplete Callback function that is called when the stream is complete
 * @param onError Callback function that is called if an error occurs
 */
export async function sendChatMessageStream(
  request: ChatApiRequest,
  onChunk: (chunk: string) => void,
  onComplete?: (fullResponse: string) => void,
  onError?: (error: Error) => void
): Promise<void> {
  try {
    const response = await fetch('/api/scafoldr-inc-stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new ChatApiError(errorText || 'Scafoldr Inc API streaming error', response.status);
    }

    // Ensure we have a readable stream
    const reader = response.body?.getReader();
    if (!reader) {
      throw new ChatApiError('Stream not available');
    }

    const decoder = new TextDecoder();
    let fullResponse = '';

    // Process the stream
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      // Decode the chunk and pass it to the callback
      const chunk = decoder.decode(value, { stream: true });
      fullResponse += chunk;
      onChunk(chunk);
    }

    // Call the completion callback with the full response
    if (onComplete) {
      onComplete(fullResponse);
    }
  } catch (error) {
    if (onError) {
      onError(
        error instanceof ChatApiError
          ? error
          : new ChatApiError(error instanceof Error ? error.message : 'An unknown error occurred')
      );
    } else {
      console.error('Error in streaming chat:', error);
    }
  }
}
