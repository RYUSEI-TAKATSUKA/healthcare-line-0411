import { TrainingPlanCreatePayload } from '../repositories/training-plan-repository';
import { WorkoutSessionCreatePayload } from '../repositories/workout-session-repository';
import { generateDailyTasks, buildWeeklySpreadDates } from './task-generator';

export const scheduleSessions = (
  planId: string,
  payload: TrainingPlanCreatePayload,
  weeks = 4
): WorkoutSessionCreatePayload[] => {
  const tasks = generateDailyTasks(payload);
  const perWeek = payload.weeklyFrequency ?? 3;
  const dates = buildWeeklySpreadDates(payload.startDate, Math.max(perWeek, 1), weeks);

  return dates.flatMap((scheduledDate) =>
    tasks.map((t) => ({
      planId,
      userId: payload.userId,
      name: t.title,
      scheduledDate,
      durationMinutes: t.durationMinutes,
      sessionType: t.sessionType,
      status: 'scheduled',
    }))
  );
};
