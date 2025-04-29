'use client';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import ChatHistory from './components/ChatHistory';
import { Message, MessageFrom, MessageType } from './types/messageTypes';

interface ChatProps {
  // eslint-disable-next-line no-unused-vars
  onDbmlCodeChange: (value: string | undefined) => void;
}

const Chat = ({ onDbmlCodeChange }: ChatProps) => {
  const conversationId = useMemo(() => Math.random().toString(), []);
  const [chatInput, setChatInput] = useState('');

  const bottomRef = useRef<HTMLDivElement>(null);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const addMessage = (content: string, type: MessageType, from: MessageFrom) => {
    setChatHistory((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        text: content,
        type,
        from
      }
    ]);
  };

  const updateLastMessage = (content: string, type: MessageType) => {
    setChatHistory((prev) => {
      const updatedHistory = [...prev];
      const lastMessage = updatedHistory.pop();
      if (lastMessage) {
        updatedHistory.push({
          ...lastMessage,
          text: content,
          type
        });
      }
      return updatedHistory;
    });
  };

  const isLastMessageLoading = () => {
    if (chatHistory.length === 0) return false;
    const lastMessage = chatHistory[chatHistory.length - 1];
    return lastMessage && lastMessage.type === MessageType.LOADING;
  };

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addMessage(chatInput, MessageType.TEXT, MessageFrom.USER);
    addMessage('Thinking', MessageType.LOADING, MessageFrom.AGENT);
    const userInput = chatInput;
    setChatInput('');

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userInput, conversationId })
    });

    if (!res.ok || !res.body) {
      const errText = await res.text();
      updateLastMessage(errText || 'API error', MessageType.ERROR);
      return;
    }

    const responseData = await res.json();

    if (responseData.response_type === 'question') {
      updateLastMessage(responseData.response, MessageType.TEXT);
    } else if (responseData.response_type === 'dbml') {
      onDbmlCodeChange(responseData.response);
      updateLastMessage('Done, you can now generate backend code!', MessageType.TEXT);
    }
  };

  return (
    <div className="flex flex-col h-full gap-2">
      <div className="w-full grow overflow-y-scroll">
        <ChatHistory chatHistory={chatHistory} />
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleFormSubmit}>
        <div className="join w-full">
          <div className="w-full">
            <label className="input input-xl w-full validator join-item">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                type="text"
                placeholder="Describe your database"
                required
              />
            </label>
          </div>
          <button
            type="submit"
            // onClick={handleAskButtonClick}
            className="btn btn-xl btn-primary join-item"
            disabled={isLastMessageLoading()}>
            Ask
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
