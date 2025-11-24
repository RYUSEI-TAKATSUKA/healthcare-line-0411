import { SupabaseClient } from '@supabase/supabase-js';

import {
  SessionRecord,
  SessionState,
  SessionStore,
} from '../../application/session/session-store';

const TABLE_NAME = 'user_sessions';

export class SupabaseSessionStore implements SessionStore {
  constructor(private readonly client: SupabaseClient) {}

  async getSession(userId: string): Promise<SessionState | null> {
    const { data, error } = await this.client.from(TABLE_NAME).select('*').eq('user_id', userId).single();

    if (error) {
      if (
        error.code === 'PGRST116' ||
        (error.details && error.details.includes('0 rows'))
      ) {
        return null;
      }
      throw error;
    }

    return {
      currentFlow: data.current_flow,
      currentStep: data.current_step,
      tempData: data.temp_data ?? {},
      lastActiveAt: data.last_active_at ?? new Date().toISOString(),
    };
  }

  async saveSession(userId: string, state: SessionState): Promise<void> {
    const payload: SessionRecord = {
      user_id: userId,
      current_flow: state.currentFlow,
      current_step: state.currentStep,
      temp_data: state.tempData ?? {},
      last_active_at: state.lastActiveAt ?? new Date().toISOString(),
    };

    const { error } = await this.client
      .from(TABLE_NAME)
      .upsert(payload, { onConflict: 'user_id' });

    if (error) {
      throw error;
    }
  }

  async clearSession(userId: string): Promise<void> {
    const { error } = await this.client
      .from(TABLE_NAME)
      .delete()
      .eq('user_id', userId);

    if (error) {
      throw error;
    }
  }
}
