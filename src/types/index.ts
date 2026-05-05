export type WorkoutType = 'PULL' | 'PUSH' | 'LEGS' | 'REST' | 'UNSET';

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  restSeconds: number;
  notes: string;
  muscles: string[];
  imageUrl: string;
  equipment: string;
  tips: string[];
}

export interface WorkoutDay {
  type: WorkoutType;
  exercises: Exercise[];
  cardioMinutes: number;
  notes?: string;
}

export type WeekSchedule = Record<number, WorkoutDay>;

export type SetCompletion = Record<string, boolean[]>;
