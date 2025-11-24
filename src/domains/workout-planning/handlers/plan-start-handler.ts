import { EventHandler } from 'src/application/mediator/handler';
import { LineWebhookEvent } from 'src/types/line';
import { buildPlanStartMessage, buildPlanConfirmGoalMessage } from '../messages/start';

const isTextEvent = (event: LineWebhookEvent): event is LineWebhookEvent & {
  type: 'message';
  message: { type: 'text'; text: string };
} => event.type === 'message' && 'message' in event && event.message.type === 'text';

const normalize = (text: string) => text.trim().toLowerCase();

const planKeywords = ['プラン', '計画', 'today', 'menu', 'schedule', 'workout', 'タスク'];

export const planStartHandler: EventHandler = async (event, session) => {
  if (!isTextEvent(event)) return null;
  const text = normalize(event.message.text);

  const isTrigger = planKeywords.some((kw) => text.includes(kw));
  if (!isTrigger && session.currentFlow !== 'workout_planning') return null;

  // 既にフロー中ならそのまま案内を続行
  if (session.currentFlow === 'workout_planning') {
    return {
      messages: [buildPlanStartMessage()],
      nextState: {
        ...session,
        currentFlow: 'workout_planning',
        currentStep: 'collect_environment',
      },
    };
  }

  return {
    messages: [buildPlanConfirmGoalMessage()],
    nextState: {
      ...session,
      currentFlow: 'workout_planning',
      currentStep: 'confirm_goal',
    },
  };
};
