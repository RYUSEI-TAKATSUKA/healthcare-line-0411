import { EventHandler } from 'src/application/mediator/handler';
import { LineWebhookEvent } from 'src/types/line';
import { buildFrequencyPrompt } from '../messages/start';
import { PlanSessionData } from '../types';

const isTextEvent = (event: LineWebhookEvent): event is LineWebhookEvent & {
  type: 'message';
  message: { type: 'text'; text: string };
} => event.type === 'message' && 'message' in event && event.message.type === 'text';

export const planEnvironmentHandler: EventHandler = async (event, session) => {
  if (!isTextEvent(event)) return null;
  if (session.currentFlow !== 'workout_planning' || session.currentStep !== 'collect_environment') {
    return null;
  }

  const environment = event.message.text?.trim();
  if (!environment) {
    return {
      messages: [
        {
          type: 'text',
          text: '環境が読み取れませんでした。自宅、ジム、屋外などで教えてください。',
        },
      ],
      nextState: session,
    };
  }

  const data: PlanSessionData =
    (session.tempData.workoutPlanning as PlanSessionData | undefined) ?? {};

  return {
    messages: [buildFrequencyPrompt()],
    nextState: {
      ...session,
      currentFlow: 'workout_planning',
      currentStep: 'collect_frequency',
      tempData: {
        ...session.tempData,
        workoutPlanning: { ...data, environment },
      },
    },
  };
};
