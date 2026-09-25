export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface ScheduledTask {
  id: string;
  name: string;
  type: string;
  estimatedMinutes: number;
  actualMinutes?: number;
  progress: number;
  zone: string;
  status: TaskStatus;
  weatherFactor: number;
  slopeFactor: number;
}
