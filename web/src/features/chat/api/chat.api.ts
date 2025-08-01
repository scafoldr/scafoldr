import { ChatApiRequest, ChatApiResponse } from '../types/chat.types';

export class ChatApiError extends Error {
  constructor(
    message: string,
    public status?: number
  ) {
    super(message);
    this.name = 'ChatApiError';
  }
}

export async function sendChatMessage(request: ChatApiRequest): Promise<ChatApiResponse> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new ChatApiError(errorText || 'API error', response.status);
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    if (error instanceof ChatApiError) {
      throw error;
    }
    throw new ChatApiError(error instanceof Error ? error.message : 'An unknown error occurred');
  }
}
