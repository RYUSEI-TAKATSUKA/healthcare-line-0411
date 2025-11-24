import { SupabaseClient } from '@supabase/supabase-js';
import {
  TrainingPlanCreatePayload,
  TrainingPlanRepository,
} from 'src/domains/workout-planning/repositories/training-plan-repository';

export class SupabaseTrainingPlanRepository implements TrainingPlanRepository {
  constructor(private readonly client: SupabaseClient) {}

  async createTrainingPlan(payload: TrainingPlanCreatePayload): Promise<string> {
    const { data, error } = await this.client
      .from('training_plans')
      .insert({
        user_id: payload.userId,
        goal_id: payload.goalId,
        name: payload.name,
        description: payload.description,
        plan_type: 'custom',
        start_date: payload.startDate,
        end_date: payload.endDate,
        status: 'active',
        schedule_settings: {
          environment: payload.environment,
          weekly_frequency: payload.weeklyFrequency,
          session_duration_minutes: payload.sessionDurationMinutes,
        },
      })
      .select('id')
      .single();

    if (error) {
      throw error;
    }

    return data.id as string;
  }
}
