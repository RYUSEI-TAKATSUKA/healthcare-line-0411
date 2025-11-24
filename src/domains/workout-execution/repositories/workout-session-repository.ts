export interface WorkoutSessionRecordPayload {
  sessionId: string;
  status: 'completed' | 'skipped';
  userId: string;
}

export interface WorkoutSessionQuery {
  userId: string;
  dateIso: string;
}

export interface WorkoutSessionData {
  id: string;
  name: string;
  durationMinutes: number;
  status: 'scheduled' | 'completed' | 'skipped';
}

export interface WorkoutSessionQueryRepository {
  findByDate(query: WorkoutSessionQuery): Promise<WorkoutSessionData[]>;
}

export interface WorkoutSessionCommandRepository {
  updateStatus(payload: WorkoutSessionRecordPayload): Promise<void>;
}
