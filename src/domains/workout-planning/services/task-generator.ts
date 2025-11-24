import { TrainingPlanCreatePayload } from '../repositories/training-plan-repository';

// 仮のタスク生成。後続でworkout_sessions作成ロジックに置き換える。
export type GeneratedTask = {
  title: string;
  durationMinutes: number;
  sessionType?: string;
};

export const generateDailyTasks = (
  payload: TrainingPlanCreatePayload
): GeneratedTask[] => {
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
