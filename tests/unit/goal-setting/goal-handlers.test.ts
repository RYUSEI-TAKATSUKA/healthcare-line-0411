/* eslint-disable no-console */
import assert from 'node:assert';
import { goalStartHandler } from '../../../src/domains/goal-setting/handlers/goal-start-handler';
import { goalBaselineHandler } from '../../../src/domains/goal-setting/handlers/goal-baseline-handler';
import { createGoalDetailHandler } from '../../../src/domains/goal-setting/handlers/goal-detail-handler';
import { createGoalConfirmHandler } from '../../../src/domains/goal-setting/handlers/goal-confirm-handler';
import { GoalSessionData } from '../../../src/domains/goal-setting/types';
import { GoalRepository } from '../../../src/domains/goal-setting/repositories/goal-repository';

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

class MemoryGoalRepository implements GoalRepository {
  public saved: any[] = [];

  async createGoal(payload: any): Promise<void> {
    this.saved.push(payload);
  }

  async findLatestActiveGoal(
    _userId: string
  ): Promise<{ id: string; description: string } | null> {
    return null;
  }
}

const run = async () => {
  // start handler keyword
  const startRes = await goalStartHandler(createTextEvent('目標設定') as any, defaultSession() as any);
  assert.ok(startRes);
  assert.strictEqual(startRes?.nextState?.currentFlow, 'goal_setting');
  assert.strictEqual(startRes?.nextState?.currentStep, 'confirm_start');

  // approval to baseline
  const toBaseline = await goalStartHandler(
    createTextEvent('はい') as any,
    {
      currentFlow: 'goal_setting',
      currentStep: 'confirm_start',
      tempData: { goalSetting: {} },
    } as any
  );
  assert.ok(toBaseline);
  assert.strictEqual(toBaseline?.nextState?.currentStep, 'collect_baseline');

  // baseline handler
  const baselineRes = await goalBaselineHandler(
    createTextEvent('年齢30 身長170cm 体重70kg 週2回運動') as any,
    {
      currentFlow: 'goal_setting',
      currentStep: 'collect_baseline',
      tempData: { goalSetting: {} },
    } as any
  );
  assert.ok(baselineRes);
  const baselineData = (baselineRes?.nextState?.tempData as any).goalSetting as GoalSessionData;
  assert.ok(baselineData.baselineDescription?.includes('170'));
  assert.strictEqual(baselineRes?.nextState?.currentStep, 'collect_goal_detail');

  // detail handler with stub draft
  const draftService = { generateDraft: async () => 'draft goal' };
  const detailHandler = createGoalDetailHandler(draftService as any);
  const detailRes = await detailHandler(
    createTextEvent('3ヶ月で5kg減量したい') as any,
    {
      currentFlow: 'goal_setting',
      currentStep: 'collect_goal_detail',
      tempData: { goalSetting: { baselineDescription: '体重70kg 週2運動' } },
    } as any
  );
  assert.ok(detailRes);
  const detailData = (detailRes?.nextState?.tempData as any).goalSetting as GoalSessionData;
  assert.strictEqual(detailData.suggestedGoal, 'draft goal');
  assert.strictEqual(detailRes?.nextState?.currentStep, 'confirm_goal_draft');

  // confirm handler saves goal
  const repo = new MemoryGoalRepository();
  const confirmHandler = createGoalConfirmHandler(repo);
  const confirmRes = await confirmHandler(
    createTextEvent('はい') as any,
    {
      currentFlow: 'goal_setting',
      currentStep: 'confirm_goal_draft',
      tempData: {
        goalSetting: {
          baselineDescription: '体重70kg 週2運動',
          desiredOutcome: '3ヶ月で65kgまで減量',
          suggestedGoal: '初回目標案',
        },
      },
    } as any
  );
  assert.ok(confirmRes);
  assert.strictEqual(confirmRes?.nextState?.currentFlow, null);
  assert.strictEqual(repo.saved.length, 1);
  assert.strictEqual(repo.saved[0].targetMetrics?.targetValue, 65);

  console.log('goal-handlers tests passed');
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
