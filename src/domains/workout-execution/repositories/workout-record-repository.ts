export interface WorkoutRecordCreatePayload {
  userId: string;
  sessionId: string;
  recordDate: string; // ISO date
  durationMinutes: number;
  workoutType: string;
}

export interface WorkoutRecordRepository {
  createRecord(payload: WorkoutRecordCreatePayload): Promise<void>;
}
