import { LineReplyMessage } from 'src/types/line';

export const buildNoTasksMessage = (): LineReplyMessage => ({
  type: 'text',
  text: '本日のタスクはまだ設定されていません。プランを作成すると今日のタスクを案内します。',
});

export const buildTasksPlaceholderMessage = (tasks: string[]): LineReplyMessage => ({
  type: 'text',
  text: ['本日のタスク一覧です:', ...tasks.map((t, i) => `${i + 1}. ${t}`)].join('\n'),
});
