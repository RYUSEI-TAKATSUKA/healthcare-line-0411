/* eslint-disable no-console */
import assert from 'node:assert';
import { todaysTasksHandler } from '../../../src/domains/workout-execution/handlers/todays-tasks-handler';

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
  const res = await todaysTasksHandler(createTextEvent('今日のタスク教えて') as any, defaultSession() as any);
  assert.ok(res);
  assert.strictEqual(res?.nextState?.currentFlow, 'workout_execution');
  assert.strictEqual(res?.nextState?.currentStep, 'show_tasks');
  console.log('todays-tasks handler test passed');
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
