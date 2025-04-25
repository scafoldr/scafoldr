import { MessageFrom, MessageType } from '../types/messageTypes';

interface ChatBubbleProps {
  chatText: string;
  from: MessageFrom;
  type: MessageType;
}

const directionClass = {
  [MessageFrom.AGENT]: 'chat-start',
  [MessageFrom.USER]: 'chat-end'
};

const ChatBubble = ({ chatText, from, type }: ChatBubbleProps) => (
  <div className={`chat ${directionClass[from]}`}>
    <div className="chat-bubble">
      {type === MessageType.TEXT && chatText}
      {type === MessageType.LOADING && (
        <>
          {chatText}
          <span className="loading loading-dots loading-xl"></span>
        </>
      )}
    </div>
    {type === MessageType.ERROR && (
      <div role="alert" className="alert alert-error">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 shrink-0 stroke-current"
          fill="none"
          viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>{chatText}</span>
      </div>
    )}
  </div>
);

export default ChatBubble;
