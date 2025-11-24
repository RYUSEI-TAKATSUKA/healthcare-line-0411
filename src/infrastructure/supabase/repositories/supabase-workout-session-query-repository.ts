import { SupabaseClient } from '@supabase/supabase-js';
import {
  WorkoutSessionCommandRepository,
  WorkoutSessionData,
  WorkoutSessionQuery,
  WorkoutSessionQueryRepository,
  WorkoutSessionRecordPayload,
} from 'src/domains/workout-execution/repositories/workout-session-repository';

export class SupabaseWorkoutSessionQueryRepository
  implements WorkoutSessionQueryRepository, WorkoutSessionCommandRepository
{
  constructor(private readonly client: SupabaseClient) {}

  async findByDate(query: WorkoutSessionQuery): Promise<WorkoutSessionData[]> {
    const { data, error } = await this.client
      .from('workout_sessions')
      .select('id, name, duration_minutes, status')
      .eq('user_id', query.userId)
      .eq('scheduled_date', query.dateIso);

    if (error) {
      throw error;
    }

    return (
      data?.map((row) => ({
        id: row.id as string,
        name: row.name as string,
        durationMinutes: Number(row.duration_minutes) || 0,
        status: (row.status as WorkoutSessionData['status']) ?? 'scheduled',
      })) ?? []
    );
  }

  async updateStatus(payload: WorkoutSessionRecordPayload): Promise<void> {
    const { error } = await this.client
      .from('workout_sessions')
      .update({ status: payload.status })
      .eq('id', payload.sessionId)
      .eq('user_id', payload.userId);

    if (error) {
      throw error;
    }
  }
}
