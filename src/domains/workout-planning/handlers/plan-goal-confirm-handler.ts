import { EventHandler } from 'src/application/mediator/handler';
import { LineWebhookEvent } from 'src/types/line';
import { buildPlanStartMessage } from '../messages/start';
import { PlanSessionData } from '../types';

const isTextEvent = (event: LineWebhookEvent): event is LineWebhookEvent & {
  type: 'message';
  message: { type: 'text'; text: string };
} => event.type === 'message' && 'message' in event && event.message.type === 'text';

const normalize = (text: string) => text.trim().toLowerCase();

export const planGoalConfirmHandler: EventHandler = async (event, session) => {
  if (!isTextEvent(event)) return null;
  if (session.currentFlow !== 'workout_planning' || session.currentStep !== 'confirm_goal') {
    return null;
  }

  const text = normalize(event.message.text);
  const planData: PlanSessionData =
    (session.tempData.workoutPlanning as PlanSessionData | undefined) ?? {};

  if (['はい', 'yes', 'y', '承認', 'ok'].includes(text)) {
    return {
      messages: [buildPlanStartMessage()],
      nextState: {
        ...session,
        currentFlow: 'workout_planning',
        currentStep: 'collect_environment',
        tempData: {
          ...session.tempData,
          workoutPlanning: { ...planData, goalConfirmed: true },
        },
      },
    };
  }

  return {
    messages: [
      {
        type: 'text',
        text: '目標を修正したい場合は内容を教えてください。（例: 期間を延長したい、体重の目標を変更したい）',
      },
    ],
    nextState: session,
  };
};
