import { SupabaseClient } from '@supabase/supabase-js';
import {
  ConversationMessagePayload,
  ConversationRepository,
} from 'src/domains/shared/repositories/conversation-repository';

export class SupabaseConversationRepository implements ConversationRepository {
  constructor(private readonly client: SupabaseClient) {}

  async saveMessage(payload: ConversationMessagePayload): Promise<void> {
    const { error } = await this.client.from('conversation_history').insert({
      user_id: payload.userId,
      message_type: payload.messageType,
      user_message: payload.userMessage ?? null,
      bot_message: payload.botMessage ?? null,
      context_data: payload.contextData ?? null,
    });

    if (error) {
      throw error;
    }
  }
}
