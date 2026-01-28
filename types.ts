export type TaskModule = 'chinese' | 'math' | 'english' | 'sports' | 'general';

export interface Task {
  id: string;
  title: string;
  points: number;
  icon: string;
  isCompleted: boolean;
  category: 'daily' | 'one-time';
  module: TaskModule;
}

export interface Reward {
  id: string;
  title: string;
  cost: number;
  icon: string;
}

export interface LogEntry {
  id: string;
  description: string;
  pointsChange: number;
  timestamp: number;
}

export interface AIAdviceResponse {
  advice: string;
  suggestedTasks?: Array<{ title: string; points: number }>;
}

export enum Tab {
  TASKS = 'TASKS',
  REWARDS = 'REWARDS',
  COACH = 'COACH',
}
