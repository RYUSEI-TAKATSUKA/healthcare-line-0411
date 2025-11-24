import { LineReplyMessage } from 'src/types/line';

export const buildNoTasksMessage = (): LineReplyMessage => ({
  type: 'text',
  text: '本日のタスクはまだ設定されていません。プランを作成すると今日のタスクを案内します。',
});

export const buildTasksPlaceholderMessage = (tasks: { id: string; title: string }[]): LineReplyMessage => ({
  type: 'text',
  text: [
    '本日のタスク一覧です:',
    ...tasks.map((t, i) => `${i + 1}. ${t.title} (id: ${t.id})`),
    '',
    '完了したら「完了 id:<タスクID>」のように送ってください。（例: 完了 id:123）',
  ].join('\n'),
});
