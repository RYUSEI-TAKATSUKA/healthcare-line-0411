import { buildSimpleFlexMessage } from 'src/application/ui/flex-message-builder';
import { buildYesNoQuickReply, withQuickReply } from 'src/application/ui/quick-reply-factory';
import { EventHandler } from '../handler';
import { LineWebhookEvent } from '../../../types/line';

const isTextMessageEvent = (event: LineWebhookEvent): event is LineWebhookEvent & {
  type: 'message';
  message: { type: 'text'; text: string };
} => event.type === 'message' && 'message' in event && event.message.type === 'text';

export const textHandler: EventHandler = async (event, session) => {
  if (!isTextMessageEvent(event)) return null;

  const text = event.message.text?.trim() ?? '';

  if (!text) {
    return {
      messages: [
        {
          type: 'text',
          text: '内容が確認できませんでした。もう一度入力してください。',
        },
      ],
      nextState: session,
    };
  }

  // プレースホルダー: 目標設定フローへの誘導。
  const flex = buildSimpleFlexMessage(
    '目標設定をはじめましょう',
    'あなたの目標に合わせてプランを作成します。進めますか？'
  );

  const messageWithQuickReply = withQuickReply(
    {
      type: 'flex',
      altText: flex.altText,
      contents: flex.contents,
    },
    buildYesNoQuickReply()
  );

  return {
    messages: [messageWithQuickReply],
    nextState: {
      ...session,
      currentFlow: 'goal_setting',
      currentStep: 'confirm_start',
    },
  };
};
