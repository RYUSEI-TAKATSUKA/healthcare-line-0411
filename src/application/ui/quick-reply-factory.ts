import { LineReplyMessage } from 'src/types/line';

interface QuickReplyAction {
  type: 'message' | 'postback';
  label: string;
  text?: string;
  data?: string;
}

export interface QuickReplyItem {
  type: 'action';
  action: QuickReplyAction;
}

export interface QuickReply {
  items: QuickReplyItem[];
}

export const buildYesNoQuickReply = (): QuickReply => ({
  items: [
    {
      type: 'action',
      action: { type: 'message', label: 'はい', text: 'はい' },
    },
    {
      type: 'action',
      action: { type: 'message', label: 'いいえ', text: 'いいえ' },
    },
  ],
});

export const withQuickReply = (
  message: LineReplyMessage,
  quickReply: QuickReply
): LineReplyMessage => ({
  ...message,
  quickReply,
});
