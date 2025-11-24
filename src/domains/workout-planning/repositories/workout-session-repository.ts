export interface WorkoutSessionCreatePayload {
  planId: string;
  userId: string;
  name: string;
  scheduledDate: string; // ISO date
  durationMinutes: number;
  sessionType?: string;
  status?: 'scheduled' | 'completed' | 'skipped';
}

export interface WorkoutSessionRepository {
  createSessions(payloads: WorkoutSessionCreatePayload[]): Promise<void>;
}
