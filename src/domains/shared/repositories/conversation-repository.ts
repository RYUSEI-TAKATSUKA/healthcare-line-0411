export type ConversationMessageType = 'user' | 'bot' | 'system';

export interface ConversationMessagePayload {
  userId: string;
  messageType: ConversationMessageType;
  userMessage?: string | null;
  botMessage?: string | null;
  contextData?: Record<string, unknown> | null;
}

export interface ConversationRepository {
  saveMessage(payload: ConversationMessagePayload): Promise<void>;
}
