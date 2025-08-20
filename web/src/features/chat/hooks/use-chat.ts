'use client';

import { useState, useCallback, useMemo } from 'react';
import { Message, MessageType, MessageFrom, ChatState } from '../types/chat.types';
import { sendChatMessage, ChatApiError } from '../api/chat.api';

interface UseChatOptions {
  initialPrompt?: string;
}

export function useChat(options: UseChatOptions = {}) {
  const conversationId = useMemo(() => Math.random().toString(), []);
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    conversationId,
    initialPrompt: options.initialPrompt,
    error: undefined
  });
  const [hasInitialized, setHasInitialized] = useState(false);

  const addMessage = useCallback((content: string, type: MessageType, from: MessageFrom, agentInfo?: any, metadata?: any) => {
    const newMessage: Message = {
      id: Math.random().toString(),
      text: content,
      type,
      from,
      timestamp: new Date(),
      agentInfo,
      metadata
    };

    setChatState((prev) => ({
      ...prev,
      messages: [...prev.messages, newMessage],
      error: undefined
    }));
  }, []);

  const updateLastMessage = useCallback((content: string, type: MessageType, agentInfo?: any, metadata?: any) => {
    setChatState((prev) => {
      const updatedMessages = [...prev.messages];
      const lastMessage = updatedMessages.pop();

      if (lastMessage) {
        updatedMessages.push({
          ...lastMessage,
          text: content,
          type,
          agentInfo: agentInfo || lastMessage.agentInfo,
          metadata: metadata || lastMessage.metadata
        });
      }

      return {
        ...prev,
        messages: updatedMessages
      };
    });
  }, []);

  const setError = useCallback((error: string) => {
    setChatState((prev) => ({
      ...prev,
      error,
      isLoading: false
    }));
  }, []);

  const clearError = useCallback(() => {
    setChatState((prev) => ({
      ...prev,
      error: undefined
    }));
  }, []);

  const sendMessage = useCallback(
    async (userInput: string) => {
      if (!userInput.trim() || chatState.isLoading) return;

      // Add user message
      addMessage(userInput, MessageType.TEXT, MessageFrom.USER);

      // Add loading message
      addMessage('Thinking', MessageType.LOADING, MessageFrom.AGENT);

      setChatState((prev) => ({ ...prev, isLoading: true }));

      try {
        // Use Scafoldr Inc API (via /api/chat which proxies to /scafoldr-inc/consult)
        const response = await sendChatMessage({
          userInput,
          conversationId: chatState.conversationId
        });

        if (response.response_type === 'question') {
          updateLastMessage(response.response, MessageType.TEXT, response.agent_info, response.metadata);
        } else if (response.response_type === 'dbml') {
          updateLastMessage(response.response, MessageType.RESULT, response.agent_info, response.metadata);

          // Automatically add a code generation message after DBML result with agent info
          setTimeout(() => {
            addMessage(response.response, MessageType.CODE_GENERATION, MessageFrom.AGENT, response.agent_info, response.metadata);
          }, 500); // Small delay for better UX
        } else if (response.response_type === 'error') {
          updateLastMessage(response.response, MessageType.ERROR, response.agent_info, response.metadata);
          setError(response.response);
        }
      } catch (error) {
        const errorMessage =
          error instanceof ChatApiError ? error.message : 'An unexpected error occurred';
        updateLastMessage(errorMessage, MessageType.ERROR);
        setError(errorMessage);
      } finally {
        setChatState((prev) => ({ ...prev, isLoading: false }));
      }
    },
    [chatState.conversationId, chatState.isLoading, addMessage, updateLastMessage, setError]
  );

  const initializeWithPrompt = useCallback(async () => {
    if (options.initialPrompt && !hasInitialized && chatState.messages.length === 0) {
      setHasInitialized(true);
      await sendMessage(options.initialPrompt);
    }
  }, [options.initialPrompt, hasInitialized, chatState.messages.length, sendMessage]);

  const isLastMessageLoading = useMemo(() => {
    if (chatState.messages.length === 0) return false;
    const lastMessage = chatState.messages[chatState.messages.length - 1];
    return lastMessage && lastMessage.type === MessageType.LOADING;
  }, [chatState.messages]);

  return {
    messages: chatState.messages,
    isLoading: chatState.isLoading,
    error: chatState.error,
    conversationId: chatState.conversationId,
    initialPrompt: chatState.initialPrompt,
    isLastMessageLoading,
    sendMessage,
    initializeWithPrompt,
    clearError
  };
}
