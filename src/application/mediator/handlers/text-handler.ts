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

  return {
    messages: [
      {
        type: 'text',
        text: [
          'メニュー:',
          '1) 目標設定を始める → 「目標」や「ダイエット」と送信してください',
          '2) 質問だけする → このまま質問を入力してください',
        ].join('\n'),
      },
    ],
    nextState: session,
  };
};
