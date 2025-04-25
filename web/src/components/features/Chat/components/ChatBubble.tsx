interface ChatBubbleProps {
  chatText: string;
  direction: 'incoming' | 'outgoing';
}

const directionClass = {
  ['incoming']: 'chat-start',
  ['outgoing']: 'chat-end'
};

const ChatBubble = ({ chatText, direction }: ChatBubbleProps) => (
  <div className={`chat ${directionClass[direction]}`}>
    <div className="chat-bubble">{chatText}</div>
  </div>
);

export default ChatBubble;
