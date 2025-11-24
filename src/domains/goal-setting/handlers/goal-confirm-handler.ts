import { EventHandler } from 'src/application/mediator/handler';
import { LineWebhookEvent } from 'src/types/line';
import { GoalSessionData, GoalType } from '../types';
import { GoalRepository } from '../repositories/goal-repository';
import { buildTargetMetrics } from '../utils/goal-metrics-parser';
import { ConversationRepository } from '../../shared/repositories/conversation-repository';

const isTextEvent = (event: LineWebhookEvent): event is LineWebhookEvent & {
  type: 'message';
  message: { type: 'text'; text: string };
} => event.type === 'message' && 'message' in event && event.message.type === 'text';

const normalize = (text: string) => text.trim().toLowerCase();

const inferGoalType = (text: string): GoalType => {
  if (text.includes('減') || text.includes('痩') || text.includes('脂肪')) {
    return 'weight_loss';
  }
  if (text.includes('筋') || text.includes('増') || text.includes('バルク')) {
    return 'muscle_gain';
  }
  if (text.includes('走') || text.includes('マラソン') || text.includes('持久')) {
    return 'endurance';
  }
  if (text.includes('柔軟') || text.includes('ストレッチ') || text.includes('ヨガ')) {
    return 'flexibility';
  }
  return 'habit_formation';
};

export const createGoalConfirmHandler =
  (goalRepository: GoalRepository, conversationRepo?: ConversationRepository): EventHandler =>
  async (event, session) => {
    if (!isTextEvent(event)) return null;
    if (session.currentFlow !== 'goal_setting' || session.currentStep !== 'confirm_goal_draft') {
      return null;
    }

    const text = normalize(event.message.text);

    if (['はい', 'yes', 'y'].includes(text)) {
      const data: GoalSessionData =
        (session.tempData.goalSetting as GoalSessionData | undefined) ?? {};

      const userId =
        ('source' in event && event.source && 'userId' in event.source && event.source.userId) ||
        null;

      if (!userId) {
        return {
          messages: [
            {
              type: 'text',
              text: 'ユーザーIDを取得できませんでした。もう一度お試しください。',
            },
          ],
          nextState: session,
        };
      }

      try {
        const goalType: GoalType = inferGoalType(
          data.desiredOutcome ?? data.suggestedGoal ?? ''
        );
        const targetMetrics =
          data.baselineDescription && data.desiredOutcome
            ? buildTargetMetrics(data.baselineDescription, data.desiredOutcome)
            : null;
        const startDate = new Date().toISOString().slice(0, 10);
        const targetDate = new Date(Date.now() + 84 * 24 * 60 * 60 * 1000) // +12週
          .toISOString()
          .slice(0, 10);

        await goalRepository.createGoal({
          userId,
          goalType,
          description: data.suggestedGoal ?? data.desiredOutcome ?? 'フィットネス目標',
          motivation: data.motivation,
          targetMetrics: targetMetrics ?? data.draft?.targetMetrics ?? null,
          startDate,
          targetDate,
        });

        if (conversationRepo) {
          await conversationRepo.saveMessage({
            userId,
            messageType: 'system',
            botMessage: 'goal_saved',
            contextData: {
              goalType,
              startDate,
              targetDate,
            },
          });
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('[goalConfirmHandler] failed to save goal', error);
        return {
          messages: [
            {
              type: 'text',
              text: '目標の保存に失敗しました。通信状況を確認のうえ、再度お試しください。',
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
              '承知しました。この目標を保存しました。',
              '次は週間プランを提案します。準備ができたら「プラン作成」と送ってください。',
            ].join('\n'),
          },
        ],
        nextState: {
          ...session,
          currentFlow: null,
          currentStep: null,
          tempData: {
            ...session.tempData,
            goalSetting: {
              ...data,
              hasConfirmedStart: true,
            },
          },
        },
      };
    }

    return {
      messages: [
        {
          type: 'text',
          text: '修正したい点を具体的に教えてください。（例: 期間を延長したい、週の頻度を下げたいなど）',
        },
      ],
      nextState: session,
    };
  };
