import { ChatMessage, type ChatMessageProps, type Message } from '@/components/ui/chat-message';
import { TypingIndicator } from '@/components/ui/typing-indicator';
import { DbmlMessage as DbmlMessageType } from '../types/message';
import DbmlMessage from './dbml-message';

type AdditionalMessageOptions = Omit<ChatMessageProps, keyof Message>;

interface DbmlMessageListProps {
  messages: DbmlMessageType[];
  showTimeStamps?: boolean;
  isTyping?: boolean;
  messageOptions?:
    | AdditionalMessageOptions
    // eslint-disable-next-line no-unused-vars
    | ((message: DbmlMessageType) => AdditionalMessageOptions);
  // eslint-disable-next-line no-unused-vars
  onDbmlClick?: (dbmlCode: string) => void;
}

export function DbmlMessageList({
  messages,
  showTimeStamps = true,
  isTyping = false,
  messageOptions,
  onDbmlClick
}: DbmlMessageListProps) {
  return (
    <div className="space-y-4 overflow-visible">
      {messages.map((message, index) => {
        const additionalOptions =
          typeof messageOptions === 'function' ? messageOptions(message) : messageOptions;

        return (
          <div key={index}>
            <ChatMessage showTimeStamp={showTimeStamps} {...message} {...additionalOptions} />
            {/* Render DbmlMessage if dbmlData exists */}
            {message.dbmlData && message.role === 'assistant' && (
              <div className="mt-2">
                <DbmlMessage
                  dbmlCode={message.dbmlData.dbml}
                  version="1"
                  onClick={() => onDbmlClick?.(message.dbmlData!.dbml)}
                  isActive={true}
                />
              </div>
            )}
          </div>
        );
      })}
      {isTyping && <TypingIndicator />}
    </div>
  );
}
