import { EventHandler } from 'src/application/mediator/handler';
import { LineWebhookEvent } from 'src/types/line';
import { buildNoTasksMessage, buildTasksPlaceholderMessage } from '../messages/todays-tasks';
import { TaskViewRepository } from '../repositories/task-view-repository';

const isTextEvent = (event: LineWebhookEvent): event is LineWebhookEvent & {
  type: 'message';
  message: { type: 'text'; text: string };
} => event.type === 'message' && 'message' in event && event.message.type === 'text';

const keywords = ['今日のタスク', 'today', 'task', 'tasks', 'todo', 'タスク'];

export const createTodaysTasksHandler =
  (taskRepo: TaskViewRepository): EventHandler =>
  async (event, session) => {
    if (!isTextEvent(event)) return null;
    const text = event.message.text?.toLowerCase() ?? '';
    if (!keywords.some((kw) => text.includes(kw.toLowerCase()))) return null;

    const userId =
      ('source' in event && event.source && 'userId' in event.source && event.source.userId) ||
      null;
    if (!userId) return null;

    const today = new Date().toISOString().slice(0, 10);
    const tasks = await taskRepo.findTodayTasks(userId, today);

    if (!tasks.length) {
      return {
        messages: [buildNoTasksMessage()],
        nextState: {
          ...session,
          currentFlow: 'workout_execution',
          currentStep: 'show_tasks',
        },
      };
    }

    const titles = tasks.map((t) => t.title);
    return {
      messages: [buildTasksPlaceholderMessage(titles)],
      nextState: {
        ...session,
        currentFlow: 'workout_execution',
        currentStep: 'show_tasks',
      },
    };
  };
