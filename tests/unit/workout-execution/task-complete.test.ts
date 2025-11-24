/* eslint-disable no-console */
import assert from 'node:assert';
import { createTaskCompleteHandler } from '../../../src/domains/workout-execution/handlers/task-complete-handler';
import {
  WorkoutSessionCommandRepository,
  WorkoutSessionQueryRepository,
} from '../../../src/domains/workout-execution/repositories/workout-session-repository';
import { WorkoutRecordRepository } from '../../../src/domains/workout-execution/repositories/workout-record-repository';

const createTextEvent = (text: string) => ({
  type: 'message' as const,
  message: { type: 'text' as const, text },
  replyToken: 'dummy',
  source: { type: 'user' as const, userId: 'user-1' },
  timestamp: Date.now(),
});

const defaultSession = () => ({
  currentFlow: null,
  currentStep: null,
  tempData: {},
});

class MemorySessionRepo implements WorkoutSessionCommandRepository, WorkoutSessionQueryRepository {
  public updated: any[] = [];
  public sessions: any[] = [
    { id: 'session-1', durationMinutes: 30, status: 'scheduled', name: 'dummy' },
  ];
  async updateStatus(payload: any): Promise<void> {
    this.updated.push(payload);
  }
  async findByDate(): Promise<any[]> {
    return this.sessions;
  }
}

class MemoryRecordRepo implements WorkoutRecordRepository {
  public saved: any[] = [];
  async createRecord(payload: any): Promise<void> {
    this.saved.push(payload);
  }
}

const run = async () => {
  const sessionRepo = new MemorySessionRepo();
  const recordRepo = new MemoryRecordRepo();
  const handler = createTaskCompleteHandler(
    sessionRepo as any,
    sessionRepo as any,
    recordRepo as any
  );
  const res = await handler(
    createTextEvent('完了 id:session-1') as any,
    defaultSession() as any
  );
  assert.ok(res);
  assert.strictEqual(res?.nextState?.currentStep, 'task_completed');
  assert.strictEqual(sessionRepo.updated.length, 1);
  assert.strictEqual(sessionRepo.updated[0].sessionId, 'session-1');
  assert.strictEqual(recordRepo.saved.length, 1);
  console.log('task-complete handler test passed');
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
