import { SessionState, SessionStore } from './session-store';

const defaultSessionState = (): SessionState => ({
  currentFlow: null,
  currentStep: null,
  tempData: {},
  lastActiveAt: new Date().toISOString(),
});

export class SessionManager {
  constructor(private readonly sessionStore: SessionStore) {}

  async loadSession(userId: string): Promise<SessionState> {
    const existing = await this.sessionStore.getSession(userId);
    return existing ?? defaultSessionState();
  }

  async saveSession(userId: string, state: SessionState): Promise<void> {
    const nextState = {
      ...state,
      lastActiveAt: new Date().toISOString(),
    };
    await this.sessionStore.saveSession(userId, nextState);
  }

  async clearSession(userId: string): Promise<void> {
    await this.sessionStore.clearSession(userId);
  }
}
