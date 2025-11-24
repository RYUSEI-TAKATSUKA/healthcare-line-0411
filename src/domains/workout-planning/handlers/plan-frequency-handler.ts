import { EventHandler } from 'src/application/mediator/handler';
import { LineWebhookEvent } from 'src/types/line';
import { buildDurationPrompt } from '../messages/start';
import { PlanSessionData } from '../types';

const isTextEvent = (event: LineWebhookEvent): event is LineWebhookEvent & {
  type: 'message';
  message: { type: 'text'; text: string };
} => event.type === 'message' && 'message' in event && event.message.type === 'text';

const extractNumber = (text: string): number | null => {
  const match = text.match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : null;
};

export const planFrequencyHandler: EventHandler = async (event, session) => {
  if (!isTextEvent(event)) return null;
  if (session.currentFlow !== 'workout_planning' || session.currentStep !== 'collect_frequency') {
    return null;
  }

  const frequency = extractNumber(event.message.text ?? '');
  const data: PlanSessionData =
    (session.tempData.workoutPlanning as PlanSessionData | undefined) ?? {};

  return {
    messages: [buildDurationPrompt()],
    nextState: {
      ...session,
      currentFlow: 'workout_planning',
      currentStep: 'collect_duration',
      tempData: {
        ...session.tempData,
        workoutPlanning: { ...data, weeklyFrequency: frequency },
      },
    },
  };
};
