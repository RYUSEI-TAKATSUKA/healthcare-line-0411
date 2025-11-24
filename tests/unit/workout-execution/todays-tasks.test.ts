/* eslint-disable no-console */
import assert from 'node:assert';
import { createTodaysTasksHandler } from '../../../src/domains/workout-execution/handlers/todays-tasks-handler';
import { TaskViewRepository } from '../../../src/domains/workout-execution/repositories/task-view-repository';

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

class MemoryTaskRepo implements TaskViewRepository {
  constructor(private readonly tasks: any[]) {}
  async findTodayTasks(): Promise<any[]> {
    return this.tasks;
  }
}

const run = async () => {
  const handler = createTodaysTasksHandler(new MemoryTaskRepo([]) as any);
  const res = await handler(createTextEvent('今日のタスク教えて') as any, defaultSession() as any);
  assert.ok(res);
  assert.strictEqual(res?.nextState?.currentFlow, 'workout_execution');
  assert.strictEqual(res?.nextState?.currentStep, 'show_tasks');

  const handlerWithTasks = createTodaysTasksHandler(
    new MemoryTaskRepo([{ id: '1', title: 'スクワット', durationMinutes: 20, status: 'scheduled' }]) as any
  );
  const res2 = await handlerWithTasks(createTextEvent('today') as any, defaultSession() as any);
  assert.ok(res2);
  assert.strictEqual(res2?.nextState?.currentFlow, 'workout_execution');
  console.log('todays-tasks handler test passed');
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
