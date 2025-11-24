export interface TaskView {
  id: string;
  title: string;
  durationMinutes: number;
  status: 'scheduled' | 'completed' | 'skipped';
}

export interface TaskViewRepository {
  findTodayTasks(userId: string, dateIso: string): Promise<TaskView[]>;
}
