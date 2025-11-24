/* eslint-disable no-console */
import assert from 'node:assert';
import { createTaskCompleteHandler } from '../../../src/domains/workout-execution/handlers/task-complete-handler';
import { WorkoutSessionCommandRepository } from '../../../src/domains/workout-execution/repositories/workout-session-repository';

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

class MemorySessionRepo implements WorkoutSessionCommandRepository {
  public updated: any[] = [];
  async updateStatus(payload: any): Promise<void> {
    this.updated.push(payload);
  }
}

const run = async () => {
  const repo = new MemorySessionRepo();
  const handler = createTaskCompleteHandler(repo as any);
  const res = await handler(
    createTextEvent('完了 id:session-1') as any,
    defaultSession() as any
  );
  assert.ok(res);
  assert.strictEqual(res?.nextState?.currentStep, 'task_completed');
  assert.strictEqual(repo.updated.length, 1);
  assert.strictEqual(repo.updated[0].sessionId, 'session-1');
  console.log('task-complete handler test passed');
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
