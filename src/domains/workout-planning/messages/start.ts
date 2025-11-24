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

export const buildEnvironmentPrompt = (): LineReplyMessage => ({
  type: 'text',
  text: 'トレーニング環境を教えてください。（例: 自宅、ジム、屋外）',
});

export const buildFrequencyPrompt = (): LineReplyMessage => ({
  type: 'text',
  text: '週に何回トレーニングできますか？（例: 2回、3-4回など）',
});

export const buildDurationPrompt = (): LineReplyMessage => ({
  type: 'text',
  text: '1回のトレーニング時間は何分くらい確保できますか？（例: 30分、45分、60分）',
});

export const buildPlanSummaryMessage = (params: {
  environment: string;
  frequency: number | null;
  duration: number | null;
}): LineReplyMessage => ({
  type: 'text',
  text: [
    'プラン作成の入力を受け取りました。',
    `環境: ${params.environment}`,
    `週回数: ${params.frequency ?? '未入力'}`,
    `1回の時間: ${params.duration ?? '未入力'} 分`,
    '',
    'この内容でプラン案を作成します。問題なければ「承認」、修正があれば再度入力してください。',
  ].join('\n'),
});
