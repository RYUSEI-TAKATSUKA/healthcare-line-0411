import { EventHandler } from 'src/application/mediator/handler';
import { LineWebhookEvent } from 'src/types/line';
import { buildNoTasksMessage, buildTasksPlaceholderMessage } from '../messages/todays-tasks';

const isTextEvent = (event: LineWebhookEvent): event is LineWebhookEvent & {
  type: 'message';
  message: { type: 'text'; text: string };
} => event.type === 'message' && 'message' in event && event.message.type === 'text';

const keywords = ['今日のタスク', 'today', 'task', 'tasks', 'todo', 'タスク'];

export const todaysTasksHandler: EventHandler = async (event, session) => {
  if (!isTextEvent(event)) return null;
  const text = event.message.text?.toLowerCase() ?? '';
  if (!keywords.some((kw) => text.includes(kw.toLowerCase()))) return null;

  // TODO: fetch actual tasks from workout_sessions/workout_records
  const hasTasks = false;

  if (!hasTasks) {
    return {
      messages: [buildNoTasksMessage()],
      nextState: {
        ...session,
        currentFlow: 'workout_execution',
        currentStep: 'show_tasks',
      },
    };
  }

  const sampleTasks = ['ウォームアップ（10分ウォーキング）', 'スクワット 3x12', 'プランク 3x30秒'];
  return {
    messages: [buildTasksPlaceholderMessage(sampleTasks)],
    nextState: {
      ...session,
      currentFlow: 'workout_execution',
      currentStep: 'show_tasks',
    },
  };
};
