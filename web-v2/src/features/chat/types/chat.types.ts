export enum MessageType {
  ERROR = 'error',
  TEXT = 'text',
  LOADING = 'loading',
  DBML = 'dbml',
  CALL_TO_ACTION = 'call_to_action',
  RESULT = 'result',
  CODE_GENERATION = 'code_generation'
}

export enum MessageFrom {
  AGENT = 'agent',
  USER = 'user'
}

export interface Message {
  id: string;
  text: string;
  type: MessageType;
  from: MessageFrom;
  timestamp: Date;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  conversationId: string;
  initialPrompt?: string;
  error?: string;
}

export interface ChatApiRequest {
  userInput: string;
  conversationId: string;
}

export interface ChatApiResponse {
  response_type: 'question' | 'dbml';
  response: string;
}