import { EventHandler } from 'src/application/mediator/handler';
import { LineWebhookEvent } from 'src/types/line';
import { GoalSessionData } from '../types';

const isTextEvent = (event: LineWebhookEvent): event is LineWebhookEvent & {
  type: 'message';
  message: { type: 'text'; text: string };
} => event.type === 'message' && 'message' in event && event.message.type === 'text';

export const goalBaselineHandler: EventHandler = async (event, session) => {
  if (!isTextEvent(event)) return null;
  if (session.currentFlow !== 'goal_setting' || session.currentStep !== 'collect_baseline') {
    return null;
  }

  const baseline = event.message.text?.trim();
  if (!baseline) {
    return {
      messages: [
        {
          type: 'text',
          text: '現在の状態が読み取れませんでした。年齢・身長・体重・週の運動回数などをまとめて教えてください。',
        },
      ],
      nextState: session,
    };
  }

  const data: GoalSessionData = {
    ...(session.tempData.goalSetting as GoalSessionData | undefined),
    baselineDescription: baseline,
  };

  return {
    messages: [
      {
        type: 'text',
        text: [
          'ありがとうございます。次に目指したい状態を教えてください。',
          '例: 3ヶ月で体重を60kg→55kg、週3回のトレーニングを続ける、フルマラソン完走など',
        ].join('\n'),
      },
    ],
    nextState: {
      ...session,
      currentFlow: 'goal_setting',
      currentStep: 'collect_goal_detail',
      tempData: { ...session.tempData, goalSetting: data },
    },
  };
};
