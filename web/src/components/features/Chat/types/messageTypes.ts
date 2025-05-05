/* eslint-disable no-unused-vars */
export enum MessageType {
  ERROR = 'error',
  TEXT = 'text',
  LOADING = 'loading',
  DBML = 'dbml',
  CALL_TO_ACTION = 'call_to_action'
}

export enum MessageFrom {
  AGENT = 'agent',
  USER = 'user'
}

export interface Message {
  id: string;
  text: string;
  type: MessageType;
  from: MessageFrom;
}
