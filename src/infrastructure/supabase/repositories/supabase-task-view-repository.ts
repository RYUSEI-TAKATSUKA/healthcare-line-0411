import { SupabaseClient } from '@supabase/supabase-js';
import { TaskView, TaskViewRepository } from 'src/domains/workout-execution/repositories/task-view-repository';

export class SupabaseTaskViewRepository implements TaskViewRepository {
  constructor(private readonly client: SupabaseClient) {}

  async findTodayTasks(userId: string, dateIso: string): Promise<TaskView[]> {
    const { data, error } = await this.client
      .from('workout_sessions')
      .select('id, name, duration_minutes, status, scheduled_date')
      .eq('user_id', userId)
      .eq('scheduled_date', dateIso);

    if (error) {
      throw error;
    }

    return (
      data?.map((row) => ({
        id: row.id as string,
        title: row.name as string,
        durationMinutes: Number(row.duration_minutes) || 0,
        status: (row.status as TaskView['status']) ?? 'scheduled',
      })) ?? []
    );
  }
}
