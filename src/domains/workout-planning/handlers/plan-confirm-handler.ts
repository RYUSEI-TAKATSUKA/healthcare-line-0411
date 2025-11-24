import { EventHandler } from 'src/application/mediator/handler';
import { LineWebhookEvent } from 'src/types/line';
import { TrainingPlanRepository } from '../repositories/training-plan-repository';
import { PlanSessionData } from '../types';
import { GoalRepository } from '../../goal-setting/repositories/goal-repository';
import { WorkoutSessionRepository } from '../repositories/workout-session-repository';
import { buildUpcomingDates, generateDailyTasks } from '../services/task-generator';

const isTextEvent = (event: LineWebhookEvent): event is LineWebhookEvent & {
  type: 'message';
  message: { type: 'text'; text: string };
} => event.type === 'message' && 'message' in event && event.message.type === 'text';

const normalize = (text: string) => text.trim().toLowerCase();

export const createPlanConfirmHandler =
  (
    planRepo: TrainingPlanRepository,
    goalRepo: GoalRepository,
    workoutSessionRepo: WorkoutSessionRepository
  ): EventHandler =>
  async (event, session) => {
    if (!isTextEvent(event)) return null;
    if (session.currentFlow !== 'workout_planning' || session.currentStep !== 'confirm_plan_inputs') {
      return null;
    }

    const text = normalize(event.message.text);
    if (!['承認', 'はい', 'yes', 'ok'].includes(text)) {
      return {
        messages: [
          {
            type: 'text',
            text: '修正したい点があれば入力してください。問題なければ「承認」と送ってください。',
          },
        ],
        nextState: session,
      };
    }

    const userId =
      ('source' in event && event.source && 'userId' in event.source && event.source.userId) ||
      null;
    if (!userId) {
      return {
        messages: [{ type: 'text', text: 'ユーザーIDを取得できませんでした。再度お試しください。' }],
        nextState: session,
      };
    }

    const planData: PlanSessionData =
      (session.tempData.workoutPlanning as PlanSessionData | undefined) ?? {};

    try {
      const startDate = new Date().toISOString().slice(0, 10);
      const endDate = new Date(Date.now() + 56 * 24 * 60 * 60 * 1000) // +8週
        .toISOString()
        .slice(0, 10);

      const latestGoal = await goalRepo.findLatestActiveGoal(userId);

      const planId = await planRepo.createTrainingPlan({
        userId,
        goalId: latestGoal?.id ?? null,
        name: 'パーソナライズドプラン',
        description: latestGoal?.description ?? '最近の目標に基づくプラン',
        environment: planData.environment ?? 'unspecified',
        weeklyFrequency: planData.weeklyFrequency ?? null,
        sessionDurationMinutes: planData.sessionDurationMinutes ?? null,
        startDate,
        endDate,
      });

      const tasks = generateDailyTasks({
        userId,
        goalId: latestGoal?.id ?? null,
        name: 'パーソナライズドプラン',
        description: latestGoal?.description ?? '最近の目標に基づくプラン',
        environment: planData.environment ?? 'unspecified',
        weeklyFrequency: planData.weeklyFrequency ?? null,
        sessionDurationMinutes: planData.sessionDurationMinutes ?? null,
        startDate,
        endDate,
        planType: 'custom',
      } as any);

      const perWeek = planData.weeklyFrequency ?? 3;
      const dates = buildUpcomingDates(startDate, Math.max(perWeek, 1));
      await workoutSessionRepo.createSessions(
        dates.flatMap((scheduledDate) =>
          tasks.map((t) => ({
            planId,
            userId,
            name: t.title,
            scheduledDate,
            durationMinutes: t.durationMinutes,
            sessionType: t.sessionType,
          }))
        )
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[planConfirmHandler] failed to save plan', error);
      return {
        messages: [
          {
            type: 'text',
            text: 'プランの保存に失敗しました。通信環境を確認のうえ、再度お試しください。',
          },
        ],
        nextState: session,
      };
    }

    return {
      messages: [
        {
          type: 'text',
          text: [
            'プランを保存しました。',
            '今日のタスクを確認するには「今日のタスク」と送信してください。',
          ].join('\n'),
        },
      ],
      nextState: {
        ...session,
        currentFlow: null,
        currentStep: null,
      },
    };
  };
