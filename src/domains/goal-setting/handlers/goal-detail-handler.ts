import { EventHandler } from 'src/application/mediator/handler';
import { LineWebhookEvent } from 'src/types/line';
import { GoalSessionData } from '../types';

const isTextEvent = (event: LineWebhookEvent): event is LineWebhookEvent & {
  type: 'message';
  message: { type: 'text'; text: string };
} => event.type === 'message' && 'message' in event && event.message.type === 'text';

export const goalDetailHandler: EventHandler = async (event, session) => {
  if (!isTextEvent(event)) return null;
  if (session.currentFlow !== 'goal_setting' || session.currentStep !== 'collect_goal_detail') {
    return null;
  }

  const desiredOutcome = event.message.text?.trim();
  if (!desiredOutcome) {
    return {
      messages: [
        {
          type: 'text',
          text: '目指したいゴールが読み取れませんでした。期間や数値目標を含めて教えてください。',
        },
      ],
      nextState: session,
    };
  }

  const previous: GoalSessionData =
    (session.tempData.goalSetting as GoalSessionData | undefined) ?? {};

  const summary = [
    'ここまでの内容をまとめました。',
    `現在の状態: ${previous.baselineDescription ?? '未入力'}`,
    `目指す状態: ${desiredOutcome}`,
    '',
    'この内容をもとに目標案を作成します。問題なければ「はい」、修正があれば内容を送り直してください。',
  ].join('\n');

  return {
    messages: [
      {
        type: 'text',
        text: summary,
      },
    ],
    nextState: {
      ...session,
      currentFlow: 'goal_setting',
      currentStep: 'confirm_goal_draft',
      tempData: {
        ...session.tempData,
        goalSetting: {
          ...previous,
          desiredOutcome,
        },
      },
    },
  };
};
