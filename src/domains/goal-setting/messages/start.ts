import { LineReplyMessage } from 'src/types/line';
import { buildYesNoQuickReply, withQuickReply } from 'src/application/ui/quick-reply-factory';

export const buildStartGoalSettingMessage = (): LineReplyMessage =>
  withQuickReply(
    {
      type: 'text',
      text: [
        'フィットネス目標の設定を始めます。',
        '現在の状態を伺って、SMARTな目標に整形します。進めてもよろしいですか？',
      ].join('\n'),
    },
    buildYesNoQuickReply()
  );

export const buildCollectBaselineMessage = (): LineReplyMessage => ({
  type: 'text',
  text: [
    'まず現在の状態を教えてください。',
    '例: 年齢 30歳 / 性別 女性 / 身長 165cm / 体重 60kg / 週の運動回数 1-2回',
  ].join('\n'),
});
