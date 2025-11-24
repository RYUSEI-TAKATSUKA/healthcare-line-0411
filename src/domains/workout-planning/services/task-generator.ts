import { TrainingPlanCreatePayload } from '../repositories/training-plan-repository';

// 仮のタスク生成。後続でworkout_sessions作成ロジックに置き換える。
export type GeneratedTask = {
  title: string;
  durationMinutes: number;
  sessionType?: string;
};

export const generateDailyTasks = (payload: TrainingPlanCreatePayload): GeneratedTask[] => {
  const baseDuration = payload.sessionDurationMinutes ?? 30;
  const env = payload.environment.toLowerCase();
  const isGym = env.includes('ジム') || env.includes('gym');

  return [
    {
      title: isGym ? 'ジム：全身サーキット' : '自宅：全身サーキット',
      durationMinutes: baseDuration,
      sessionType: 'strength',
    },
    {
      title: '有酸素 10分（ウォーキングまたはバイク）',
      durationMinutes: 10,
      sessionType: 'cardio',
    },
  ];
};

export const buildWeeklySpreadDates = (
  startDateIso: string,
  frequency: number,
  weeks = 1
): string[] => {
  if (frequency <= 0) return [];
  const dates: string[] = [];
  const start = new Date(startDateIso);

  for (let week = 0; week < weeks; week += 1) {
    const gap = Math.max(1, Math.floor(7 / Math.max(frequency, 1)));
    let day = 0;
    for (let i = 0; i < frequency && day < 7; i += 1) {
      const d = new Date(start);
      d.setDate(start.getDate() + week * 7 + day);
      dates.push(d.toISOString().slice(0, 10));
      day += gap;
    }
  }
  return dates;
};
