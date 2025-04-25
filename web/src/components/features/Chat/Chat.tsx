'use client';
import { useEffect, useRef, useState } from 'react';
import ChatError from './components/ChatError';
import ChatLoader from './components/ChatLoader';
import ChatHistory from './components/ChatHistory';

interface ChatProps {
  // eslint-disable-next-line no-unused-vars
  onDbmlCodeChange: (value: string | undefined) => void;
}

const Chat = ({ onDbmlCodeChange }: ChatProps) => {
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const [chatHistory, setChatHistory] = useState<string[]>([]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleAskButtonClick = async () => {
    setIsLoading(true);
    setError(null);
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_input: chatInput })
    });

    if (!res.ok || !res.body) {
      const errText = await res.text();
      setError(errText || 'API error');
      setIsLoading(false);
      return;
    }

    setChatHistory((prev) => [...prev, chatInput]);
    setChatInput('');

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let accumulated = '';

    while (!done) {
      const { value, done: streamDone } = await reader.read();
      done = streamDone;
      if (value) {
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
      }
    }
    if (accumulated.startsWith('Table')) {
      // Assuming the response is a DBML code
      onDbmlCodeChange(accumulated);
      setChatHistory((prev) => [...prev, 'Done, you can now use the Diagram']);
    } else {
      setChatHistory((prev) => [...prev, accumulated]);
    }

    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full gap-2">
      <div className="w-full grow overflow-y-scroll">
        {isLoading && <ChatLoader />}
        {error && <ChatError error={error} />}
        <ChatHistory chatHistory={chatHistory} />
        <div ref={bottomRef} />
      </div>
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
        <button onClick={handleAskButtonClick} className="btn btn-xl btn-primary join-item">
          Ask
        </button>
      </div>
    </div>
  );
};

export default Chat;
