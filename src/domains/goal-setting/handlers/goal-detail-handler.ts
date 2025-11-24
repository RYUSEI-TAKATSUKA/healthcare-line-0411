import { EventHandler } from 'src/application/mediator/handler';
import { LineWebhookEvent } from 'src/types/line';
import { GoalSessionData } from '../types';
import { GoalDraftService } from '../services/goal-draft-service';

const isTextEvent = (event: LineWebhookEvent): event is LineWebhookEvent & {
  type: 'message';
  message: { type: 'text'; text: string };
} => event.type === 'message' && 'message' in event && event.message.type === 'text';

// Draftサービスは呼び出し側でDIする想定だが、暫定で遅延初期化
let draftService: GoalDraftService | null = null;
const getDraftService = () => {
  if (draftService) return draftService;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }
  // eslint-disable-next-line global-require
  const { OpenAiClient } = require('src/infrastructure/openai/openai-client');
  draftService = new GoalDraftService(new OpenAiClient(apiKey));
  return draftService;
};

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

  let draft: string | undefined;
  try {
    draft = await getDraftService().generateDraft(
      previous.baselineDescription ?? '',
      desiredOutcome
    );
  } catch (error) {
    // OpenAI未設定や失敗時は簡易文面でフォールバック
    draft = [
      '初回目標案（暫定）',
      `現在: ${previous.baselineDescription ?? '未入力'}`,
      `目標: ${desiredOutcome}`,
      '週3-4回の運動と食事改善を組み合わせて進めましょう。',
    ].join('\n');
    // ログだけ残す
    // eslint-disable-next-line no-console
    console.warn('[goalDetailHandler] failed to generate draft', error);
  }

  const summary = [
    'ここまでの内容をまとめ、目標案を用意しました。',
    `現在の状態: ${previous.baselineDescription ?? '未入力'}`,
    `目指す状態: ${desiredOutcome}`,
    '',
    '【提案】',
    draft,
    '',
    'この目標案で進めてよろしいですか？ 「はい」または修正点を教えてください。',
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
          suggestedGoal: draft,
        },
      },
    },
  };
};
