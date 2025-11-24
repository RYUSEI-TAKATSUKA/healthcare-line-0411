import { SupabaseClient } from '@supabase/supabase-js';
import { CreateGoalPayload, GoalRepository } from 'src/domains/goal-setting/repositories/goal-repository';

export class SupabaseGoalRepository implements GoalRepository {
  constructor(private readonly client: SupabaseClient) {}

  async createGoal(payload: CreateGoalPayload): Promise<void> {
    const { error } = await this.client.from('goals').insert({
      user_id: payload.userId,
      goal_type: payload.goalType,
      description: payload.description,
      motivation: payload.motivation ?? null,
      target_metrics: payload.targetMetrics ?? null,
      start_date: payload.startDate,
      target_date: payload.targetDate,
      progress_percentage: 0,
      status: 'active',
    });

    if (error) {
      throw error;
    }
  }
}
