// Main chat interface component
export { ChatInterface } from './components/chat-interface';

// Individual components
export { ChatBubble } from './components/chat-bubble';
export { ChatHistory } from './components/chat-history';
export { ChatInput } from './components/chat-input';

// Hooks
export { useChat } from './hooks/use-chat';

// Types
export type { Message, ChatState, ChatApiRequest } from './types/chat.types';
export { MessageType, MessageFrom } from './types/chat.types';

// API utilities
export { sendChatMessage, ChatApiError } from './api/chat.api';
