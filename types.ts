export enum ActivityType {
  MORNING_ROUTINE = 'Morning Routine',
  FIELD_WORK = 'Field Work',
  DEEP_WORK = 'Deep Work',
  LEARNING = 'Learning',
  HEALTH = 'Health',
  TRANSIT = 'Transit'
}

export interface SubTask {
  id: string;
  text: string;
  completed: boolean;
}

export interface ScheduleBlock {
  id: string;
  timeRange: string;
  title: string;
  description?: string;
  type: ActivityType;
  subTasks: SubTask[];
}

export interface ChartData {
  name: string;
  value: number;
  color: string;
}

export interface Priority {
  id: number;
  text: string;
  done: boolean;
}
