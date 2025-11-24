/* eslint-disable no-console */
import assert from 'node:assert';
import { taskCompleteHandler } from '../../../src/domains/workout-execution/handlers/task-complete-handler';

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

const run = async () => {
  const res = await taskCompleteHandler(createTextEvent('完了しました') as any, defaultSession() as any);
  assert.ok(res);
  assert.strictEqual(res?.nextState?.currentStep, 'task_completed');
  console.log('task-complete handler test passed');
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
