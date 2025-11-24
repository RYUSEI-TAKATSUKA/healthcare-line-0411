import { EventHandler } from 'src/application/mediator/handler';
import { LineWebhookEvent } from 'src/types/line';
import { GoalSessionData } from '../types';

const isTextEvent = (event: LineWebhookEvent): event is LineWebhookEvent & {
  type: 'message';
  message: { type: 'text'; text: string };
} => event.type === 'message' && 'message' in event && event.message.type === 'text';

const normalize = (text: string) => text.trim().toLowerCase();

export const goalConfirmHandler: EventHandler = async (event, session) => {
  if (!isTextEvent(event)) return null;
  if (session.currentFlow !== 'goal_setting' || session.currentStep !== 'confirm_goal_draft') {
    return null;
  }

  const text = normalize(event.message.text);

  if (['はい', 'yes', 'y'].includes(text)) {
    const data: GoalSessionData =
      (session.tempData.goalSetting as GoalSessionData | undefined) ?? {};

    return {
      messages: [
        {
          type: 'text',
          text: [
            '承知しました。この目標を基にプランを作成します。',
            '次回は週間プランの提案をお送りします。',
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
