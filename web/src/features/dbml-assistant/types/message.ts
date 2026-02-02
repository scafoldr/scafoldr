import { Message as BaseMessage } from '@/components/ui/chat-message';
import { DbmlData } from '../hooks/use-dbml-ai-agent';

export interface DbmlMessage extends BaseMessage {
  dbmlData?: DbmlData;
}
