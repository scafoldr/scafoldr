/* eslint-disable no-unused-vars */
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
  agentInfo?: ScafoldrIncAgent;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>;
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

export interface ScafoldrIncAgent {
  role: string;
  expertise: string[];
  confidence: number;
}

export interface ScafoldrIncResponse {
  response: string;
  response_type: 'question' | 'dbml' | 'error';
  agent_info: ScafoldrIncAgent;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: Record<string, any>;
  conversation_id: string;
}
