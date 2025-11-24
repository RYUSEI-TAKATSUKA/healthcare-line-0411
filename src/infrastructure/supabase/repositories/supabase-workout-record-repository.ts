import { SupabaseClient } from '@supabase/supabase-js';
import { WorkoutRecordCreatePayload, WorkoutRecordRepository } from 'src/domains/workout-execution/repositories/workout-record-repository';

export class SupabaseWorkoutRecordRepository implements WorkoutRecordRepository {
  constructor(private readonly client: SupabaseClient) {}

  async createRecord(payload: WorkoutRecordCreatePayload): Promise<void> {
    const { error } = await this.client.from('workout_records').insert({
      user_id: payload.userId,
      session_id: payload.sessionId,
      record_date: payload.recordDate,
      workout_type: payload.workoutType,
      duration_minutes: payload.durationMinutes,
      exercises_completed: [],
      status: 'completed',
    });

    if (error) throw error;
  }
}
