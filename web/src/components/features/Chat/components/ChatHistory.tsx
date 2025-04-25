import ChatBubble from './ChatBubble';

interface ChatHistoryProps {
  chatHistory: string[];
}

const ChatHistory = ({ chatHistory }: ChatHistoryProps) => {
  return (
    <div className="">
      {chatHistory.map((chatText, index) => (
        <ChatBubble
          chatText={chatText}
          key={index}
          direction={index % 2 === 0 ? 'outgoing' : 'incoming'}
        />
      ))}
    </div>
  );
};

export default ChatHistory;
