import { EventHandler } from 'src/application/mediator/handler';
import { LineWebhookEvent } from 'src/types/line';

const keywords = ['完了', 'done', 'complete', '記録', '達成'];

const isTextEvent = (event: LineWebhookEvent): event is LineWebhookEvent & {
  type: 'message';
  message: { type: 'text'; text: string };
} => event.type === 'message' && 'message' in event && event.message.type === 'text';

export const taskCompleteHandler: EventHandler = async (event, session) => {
  if (!isTextEvent(event)) return null;
  const text = event.message.text?.toLowerCase() ?? '';
  if (!keywords.some((kw) => text.includes(kw.toLowerCase()))) return null;

  return {
    messages: [
      {
        type: 'text',
        text: 'タスク完了を記録しました！（実際の記録保存は今後実装）',
      },
    ],
    nextState: {
      ...session,
      currentFlow: 'workout_execution',
      currentStep: 'task_completed',
    },
  };
};
