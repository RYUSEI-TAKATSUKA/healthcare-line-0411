export type GoalType =
  | 'weight_loss'
  | 'muscle_gain'
  | 'endurance'
  | 'flexibility'
  | 'health_recovery'
  | 'habit_formation';

export interface GoalDraft {
  goalType: GoalType;
  description: string;
  motivation?: string;
  targetMetrics?: {
    startValue?: number;
    targetValue?: number;
    unit?: string;
  };
  timeframeWeeks?: number;
}

export interface GoalSessionData {
  draft?: GoalDraft;
  hasConfirmedStart?: boolean;
}
