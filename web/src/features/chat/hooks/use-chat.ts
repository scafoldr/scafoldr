'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  Message,
  MessageType,
  MessageFrom,
  ChatState,
  ScafoldrIncAgent
} from '../types/chat.types';
import { sendChatMessageStream, ChatApiError } from '../api/chat.api';
import { useProjectManager } from '@/contexts/project-manager-context';

interface UseChatOptions {
  initialPrompt?: string;
  useStreaming?: boolean;
}

export function useChat(options: UseChatOptions = {}) {
  const conversationId = useMemo(() => Math.random().toString(), []);
  const { activeProjectId } = useProjectManager();
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    conversationId,
    initialPrompt: options.initialPrompt,
    error: undefined
  });
  const [hasInitialized, setHasInitialized] = useState(false);

  const addMessage = useCallback(
    (
      content: string,
      type: MessageType,
      from: MessageFrom,
      agentInfo?: ScafoldrIncAgent,
      metadata?: Record<string, unknown>
    ) => {
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
    },
    []
  );

  const updateLastMessage = useCallback(
    (
      // eslint-disable-next-line no-unused-vars
      content: string | ((prevContent: string) => string),
      type: MessageType,
      agentInfo?: ScafoldrIncAgent,
      metadata?: Record<string, unknown>
    ) => {
      setChatState((prev) => {
        const updatedMessages = [...prev.messages];
        const lastMessage = updatedMessages.pop();

        if (lastMessage) {
          const newText = typeof content === 'function' ? content(lastMessage.text) : content;

          updatedMessages.push({
            ...lastMessage,
            text: newText,
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
    },
    []
  );

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

  const sendMessageStreaming = useCallback(
    async (userInput: string) => {
      if (!userInput.trim() || chatState.isLoading) return;

      // Add user message
      addMessage(userInput, MessageType.TEXT, MessageFrom.USER);

      // Add loading message that will be updated with streaming content
      addMessage('', MessageType.LOADING, MessageFrom.AGENT);

      setChatState((prev) => ({ ...prev, isLoading: true }));

      try {
        // Use streaming API
        await sendChatMessageStream(
          {
            userInput,
            conversationId: chatState.conversationId,
            projectId: activeProjectId
          },
          // Handle each chunk as it arrives
          (chunk) => {
            updateLastMessage((prev) => prev + chunk, MessageType.LOADING);
          },
          // Handle complete response
          (fullResponse) => {
            const metadata: Record<string, unknown> = {};
            const agentInfo: ScafoldrIncAgent | undefined = undefined;

            updateLastMessage(fullResponse, MessageType.TEXT, agentInfo, metadata);

            setChatState((prev) => ({ ...prev, isLoading: false }));
          },
          // Handle errors
          (error) => {
            const errorMessage =
              error instanceof ChatApiError ? error.message : 'An unexpected error occurred';

            updateLastMessage(errorMessage, MessageType.ERROR);
            setError(errorMessage);
            setChatState((prev) => ({ ...prev, isLoading: false }));
          }
        );
      } catch (error) {
        const errorMessage =
          error instanceof ChatApiError ? error.message : 'An unexpected error occurred';
        updateLastMessage(errorMessage, MessageType.ERROR);
        setError(errorMessage);
        setChatState((prev) => ({ ...prev, isLoading: false }));
      }
    },
    [chatState.conversationId, chatState.isLoading, addMessage, updateLastMessage, setError]
  );

  // Choose the appropriate send function based on streaming preference
  const sendMessage = useCallback(
    async (userInput: string) => {
      await sendMessageStreaming(userInput);
    },
    [sendMessageStreaming]
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
