import { SupabaseClient } from '@supabase/supabase-js';
import {
  WorkoutSessionCreatePayload,
  WorkoutSessionRepository,
} from 'src/domains/workout-planning/repositories/workout-session-repository';

export class SupabaseWorkoutSessionRepository implements WorkoutSessionRepository {
  constructor(private readonly client: SupabaseClient) {}

  async createSessions(payloads: WorkoutSessionCreatePayload[]): Promise<void> {
    if (!payloads.length) return;
    const rows = payloads.map((p) => ({
      plan_id: p.planId,
      user_id: p.userId,
      name: p.name,
      scheduled_date: p.scheduledDate,
      duration_minutes: p.durationMinutes,
      session_type: p.sessionType ?? 'custom',
      status: p.status ?? 'scheduled',
      exercises: [],
    }));

    const { error } = await this.client.from('workout_sessions').insert(rows);
    if (error) throw error;
  }
}
