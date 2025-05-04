import { Message } from '../types/messageTypes';
import ChatBubble from './ChatBubble';
import EmptyChat from './EmptyChat';

interface ChatHistoryProps {
  chatHistory: Message[];
}

const ChatHistory = ({ chatHistory }: ChatHistoryProps) => {
  return (
    <>
      {chatHistory.length === 0 && <EmptyChat />}
      {chatHistory.map((message, index) => (
        <ChatBubble chatText={message.text} key={index} from={message.from} type={message.type} />
      ))}
    </>
  );
};

export default ChatHistory;
