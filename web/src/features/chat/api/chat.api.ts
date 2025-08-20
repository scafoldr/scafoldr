import { ChatApiRequest, ChatApiResponse, ScafoldrIncResponse } from '../types/chat.types';

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

