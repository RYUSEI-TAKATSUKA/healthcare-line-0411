export interface TrainingPlanCreatePayload {
  userId: string;
  goalId: string | null;
  name: string;
  description: string;
  environment: string;
  weeklyFrequency: number | null;
  sessionDurationMinutes: number | null;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
}

export interface TrainingPlanRepository {
  createTrainingPlan(payload: TrainingPlanCreatePayload): Promise<string>;
}
