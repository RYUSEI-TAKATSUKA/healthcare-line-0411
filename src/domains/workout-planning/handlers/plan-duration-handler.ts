import { EventHandler } from 'src/application/mediator/handler';
import { LineWebhookEvent } from 'src/types/line';
import { buildPlanSummaryMessage } from '../messages/start';
import { PlanSessionData } from '../types';

const isTextEvent = (event: LineWebhookEvent): event is LineWebhookEvent & {
  type: 'message';
  message: { type: 'text'; text: string };
} => event.type === 'message' && 'message' in event && event.message.type === 'text';

const extractNumber = (text: string): number | null => {
  const match = text.match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : null;
};

export const planDurationHandler: EventHandler = async (event, session) => {
  if (!isTextEvent(event)) return null;
  if (session.currentFlow !== 'workout_planning' || session.currentStep !== 'collect_duration') {
    return null;
  }

  const duration = extractNumber(event.message.text ?? '');
  const data: PlanSessionData =
    (session.tempData.workoutPlanning as PlanSessionData | undefined) ?? {};

  const summaryMessage = buildPlanSummaryMessage({
    environment: data.environment ?? '未入力',
    frequency: data.weeklyFrequency ?? null,
    duration: duration ?? null,
  });

  return {
    messages: [summaryMessage],
    nextState: {
      ...session,
      currentFlow: 'workout_planning',
      currentStep: 'confirm_plan_inputs',
      tempData: {
        ...session.tempData,
        workoutPlanning: { ...data, sessionDurationMinutes: duration },
      },
    },
  };
};
