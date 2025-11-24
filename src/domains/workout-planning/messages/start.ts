import { LineReplyMessage } from 'src/types/line';

export const buildPlanStartMessage = (): LineReplyMessage => ({
  type: 'text',
  text: [
    'トレーニング計画を作成します。',
    '目標と環境（自宅/ジム/屋外）、週の回数、1回の時間を教えてください。',
    'まず、どこでトレーニングすることが多いか教えてください。（例: 自宅、ジム、屋外）',
  ].join('\n'),
});

export const buildPlanConfirmGoalMessage = (): LineReplyMessage => ({
  type: 'text',
  text: '最新の目標に基づいてプランを作ります。よろしければ「はい」、別の目標で作りたい場合は内容を教えてください。',
});
