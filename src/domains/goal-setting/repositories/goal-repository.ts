import { GoalType } from '../types';

export interface CreateGoalPayload {
  userId: string;
  goalType: GoalType;
  description: string;
  motivation?: string;
  targetMetrics?: Record<string, unknown> | null;
  startDate: string; // ISO date string
  targetDate: string; // ISO date string
}

export interface GoalRepository {
  createGoal(payload: CreateGoalPayload): Promise<void>;
}
