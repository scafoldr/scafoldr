import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatBubble } from './chat-bubble';
import { Message } from '../types/chat.types';

interface ChatHistoryProps {
  messages: Message[];
  onViewCode?: (files: any) => void;
  onViewDB?: (dbmlCode: string) => void;
}

export function ChatHistory({ messages, onViewCode, onViewDB }: ChatHistoryProps) {
  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4">
        {messages.map((message) => (
          <ChatBubble key={message.id} message={message} onViewCode={onViewCode} onViewDB={onViewDB} />
        ))}
      </div>
    </ScrollArea>
  );
}