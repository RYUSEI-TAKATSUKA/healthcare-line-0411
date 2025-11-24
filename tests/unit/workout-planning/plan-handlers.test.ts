/* eslint-disable no-console */
import assert from 'node:assert';
import { planStartHandler } from '../../../src/domains/workout-planning/handlers/plan-start-handler';
import { planGoalConfirmHandler } from '../../../src/domains/workout-planning/handlers/plan-goal-confirm-handler';
import { planEnvironmentHandler } from '../../../src/domains/workout-planning/handlers/plan-environment-handler';
import { planFrequencyHandler } from '../../../src/domains/workout-planning/handlers/plan-frequency-handler';
import { planDurationHandler } from '../../../src/domains/workout-planning/handlers/plan-duration-handler';
import { createPlanConfirmHandler } from '../../../src/domains/workout-planning/handlers/plan-confirm-handler';
import { TrainingPlanRepository } from '../../../src/domains/workout-planning/repositories/training-plan-repository';
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

class MemoryPlanRepo implements TrainingPlanRepository {
  public saved: any[] = [];
  async createTrainingPlan(payload: any): Promise<string> {
    this.saved.push(payload);
    return 'plan-1';
  }
}

class MemoryGoalRepo implements GoalRepository {
  public latest: { id: string; description: string } | null = {
    id: 'goal-1',
    description: '既存の目標',
  };
  async createGoal(): Promise<void> {
    throw new Error('not implemented');
  }
  async findLatestActiveGoal(): Promise<{ id: string; description: string } | null> {
    return this.latest;
  }
}

const run = async () => {
  // start -> confirm goal
  const startRes = await planStartHandler(createTextEvent('プラン作成') as any, defaultSession() as any);
  assert.ok(startRes);
  assert.strictEqual(startRes?.nextState?.currentFlow, 'workout_planning');
  assert.strictEqual(startRes?.nextState?.currentStep, 'confirm_goal');

  // confirm goal -> collect environment
  const confirmRes = await planGoalConfirmHandler(
    createTextEvent('はい') as any,
    {
      currentFlow: 'workout_planning',
      currentStep: 'confirm_goal',
      tempData: { workoutPlanning: {} },
    } as any
  );
  assert.ok(confirmRes);
  assert.strictEqual(confirmRes?.nextState?.currentStep, 'collect_environment');

  // environment -> frequency
  const envRes = await planEnvironmentHandler(
    createTextEvent('自宅') as any,
    {
      currentFlow: 'workout_planning',
      currentStep: 'collect_environment',
      tempData: { workoutPlanning: {} },
    } as any
  );
  assert.ok(envRes);
  assert.strictEqual(envRes?.nextState?.currentStep, 'collect_frequency');

  // frequency -> duration
  const freqRes = await planFrequencyHandler(
    createTextEvent('週3回') as any,
    {
      currentFlow: 'workout_planning',
      currentStep: 'collect_frequency',
      tempData: { workoutPlanning: { environment: '自宅' } },
    } as any
  );
  assert.ok(freqRes);
  assert.strictEqual(freqRes?.nextState?.currentStep, 'collect_duration');

  // duration -> confirm inputs
  const durRes = await planDurationHandler(
    createTextEvent('45分') as any,
    {
      currentFlow: 'workout_planning',
      currentStep: 'collect_duration',
      tempData: { workoutPlanning: { environment: '自宅', weeklyFrequency: 3 } },
    } as any
  );
  assert.ok(durRes);
  assert.strictEqual(durRes?.nextState?.currentStep, 'confirm_plan_inputs');

  // confirm and save plan
  const planRepo = new MemoryPlanRepo();
  const goalRepo = new MemoryGoalRepo();
  const confirmHandler = createPlanConfirmHandler(planRepo as any, goalRepo as any);
  const saveRes = await confirmHandler(
    createTextEvent('承認') as any,
    {
      currentFlow: 'workout_planning',
      currentStep: 'confirm_plan_inputs',
      tempData: {
        workoutPlanning: {
          environment: '自宅',
          weeklyFrequency: 3,
          sessionDurationMinutes: 45,
        },
      },
    } as any
  );
  assert.ok(saveRes);
  assert.strictEqual(saveRes?.nextState?.currentFlow, null);
  assert.strictEqual(planRepo.saved.length, 1);
  assert.strictEqual(planRepo.saved[0].goalId, 'goal-1');

  console.log('plan-handlers tests passed');
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
