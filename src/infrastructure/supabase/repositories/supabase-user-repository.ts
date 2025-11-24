import { SupabaseClient } from '@supabase/supabase-js';
import { UserRepository } from 'src/domains/shared/repositories/user-repository';

export class SupabaseUserRepository implements UserRepository {
  constructor(private readonly client: SupabaseClient) {}

  async findOrCreateByExternalId(externalId: string): Promise<string> {
    const { data, error } = await this.client
      .from('users')
      .select('id')
      .eq('external_line_user_id', externalId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (data?.id) {
      return data.id as string;
    }

    const { data: inserted, error: insertError } = await this.client
      .from('users')
      .insert({
        external_line_user_id: externalId,
        display_name: 'LINE User',
      })
      .select('id')
      .single();

    if (insertError) {
      throw insertError;
    }

    return inserted.id as string;
  }
}
