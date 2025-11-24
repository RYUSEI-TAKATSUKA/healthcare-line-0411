import { EventHandler } from 'src/application/mediator/handler';
import { LineWebhookEvent } from 'src/types/line';
import {
  WorkoutSessionCommandRepository,
  WorkoutSessionQueryRepository,
} from '../repositories/workout-session-repository';
import { WorkoutRecordRepository } from '../repositories/workout-record-repository';

const keywords = ['完了', 'done', 'complete', '記録', '達成'];

const isTextEvent = (event: LineWebhookEvent): event is LineWebhookEvent & {
  type: 'message';
  message: { type: 'text'; text: string };
} => event.type === 'message' && 'message' in event && event.message.type === 'text';

const extractSessionId = (text: string): string | null => {
  const match = text.match(/id[:：]?\s*([a-zA-Z0-9-]+)/);
  return match ? match[1] : null;
};

export const createTaskCompleteHandler =
  (
    sessionQueryRepo: WorkoutSessionQueryRepository,
    sessionCommandRepo: WorkoutSessionCommandRepository,
    recordRepo: WorkoutRecordRepository
  ): EventHandler =>
  async (event, session) => {
    if (!isTextEvent(event)) return null;
    const text = event.message.text?.toLowerCase() ?? '';
    if (!keywords.some((kw) => text.includes(kw.toLowerCase()))) return null;

    const sessionId = extractSessionId(text);
    const userId =
      ('source' in event && event.source && 'userId' in event.source && event.source.userId) ||
      null;

    if (!sessionId || !userId) {
      return {
        messages: [
          {
            type: 'text',
            text: '完了するタスクIDが確認できませんでした。「完了 id:<タスクID>」の形式で送ってください。',
          },
        ],
        nextState: session,
      };
    }

    try {
      await sessionCommandRepo.updateStatus({ sessionId, userId, status: 'completed' });

      const today = new Date().toISOString().slice(0, 10);
      const sessions = await sessionQueryRepo.findByDate({ userId, dateIso: today });
      const target = sessions.find((s) => s.id === sessionId);
      if (target) {
        const lowerName = target.name?.toLowerCase?.() ?? '';
        const workoutType = lowerName.includes('run') || lowerName.includes('cardio')
          ? 'cardio'
          : 'strength';
        await recordRepo.createRecord({
          userId,
          sessionId,
          recordDate: today,
          durationMinutes: target.durationMinutes,
          workoutType,
        });
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[taskCompleteHandler] failed to update status', error);
      return {
        messages: [
          {
            type: 'text',
            text: '完了の記録に失敗しました。時間をおいて再度お試しください。',
          },
        ],
        nextState: session,
      };
    }

    return {
      messages: [
        {
          type: 'text',
          text: `タスク(${sessionId})の完了を記録しました。お疲れさまでした！`,
        },
      ],
      nextState: {
        ...session,
        currentFlow: 'workout_execution',
        currentStep: 'task_completed',
      },
    };
  };
