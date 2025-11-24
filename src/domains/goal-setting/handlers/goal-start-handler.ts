import { buildStartGoalSettingMessage, buildCollectBaselineMessage } from '../messages/start';
import { GoalSessionData } from '../types';
import { EventHandler } from '../../../application/mediator/handler';
import { LineWebhookEvent } from '../../../types/line';

const isTextEvent = (event: LineWebhookEvent): event is LineWebhookEvent & {
  type: 'message';
  message: { type: 'text'; text: string };
} => event.type === 'message' && 'message' in event && event.message.type === 'text';

const normalize = (text: string) => text.trim().toLowerCase();

export const goalStartHandler: EventHandler = async (event, session) => {
  if (!isTextEvent(event)) return null;

  const text = normalize(event.message.text);

  // フロー未開始で「目標」「ダイエット」などのキーワードで誘導
  const triggerKeywords = ['目標', 'ダイエット', '筋トレ', '痩せたい', 'goal', 'plan', '設定'];
  const hasFlow = session.currentFlow === 'goal_setting';

  if (!hasFlow && !triggerKeywords.some((kw) => text.includes(kw))) {
    return null;
  }

  const sessionData: GoalSessionData =
    (session.tempData.goalSetting as GoalSessionData | undefined) ?? {};

  // 進行中の確認ステップ
  if (session.currentFlow === 'goal_setting' && session.currentStep === 'confirm_start') {
    if (['はい', 'はい。', 'yes', 'y'].includes(text)) {
      return {
        messages: [buildCollectBaselineMessage()],
        nextState: {
          ...session,
          currentFlow: 'goal_setting',
          currentStep: 'collect_baseline',
          tempData: { ...session.tempData, goalSetting: { ...sessionData, hasConfirmedStart: true } },
        },
      };
    }

    if (['いいえ', 'no', 'n'].includes(text)) {
      return {
        messages: [
          {
            type: 'text',
            text: 'また準備ができたら「目標設定」と送ってください。',
          },
        ],
        nextState: { ...session, currentFlow: null, currentStep: null },
      };
    }

    return {
      messages: [
        {
          type: 'text',
          text: '進めてよいか「はい」または「いいえ」で教えてください。',
        },
      ],
      nextState: session,
    };
  }

  // 新規開始
  return {
    messages: [buildStartGoalSettingMessage()],
    nextState: {
      ...session,
      currentFlow: 'goal_setting',
      currentStep: 'confirm_start',
      tempData: { ...session.tempData, goalSetting: sessionData },
    },
  };
};
