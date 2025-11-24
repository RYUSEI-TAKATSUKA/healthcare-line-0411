export interface SessionState {
  currentFlow: string | null;
  currentStep: string | null;
  tempData: Record<string, unknown>;
  lastActiveAt?: string;
}

export interface SessionStore {
  getSession(userId: string): Promise<SessionState | null>;
  saveSession(userId: string, state: SessionState): Promise<void>;
  clearSession(userId: string): Promise<void>;
}

export interface SessionRecord {
  user_id: string;
  current_flow: string | null;
  current_step: string | null;
  temp_data: Record<string, unknown> | null;
  last_active_at?: string | null;
}
