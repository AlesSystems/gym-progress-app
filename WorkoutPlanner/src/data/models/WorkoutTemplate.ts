export interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: TemplateExercise[];
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface TemplateExercise {
  id: string;
  name: string;
  sets: TemplateSet[];
  notes?: string;
  order: number;
}

export interface TemplateSet {
  id: string;
  reps: number;
  weight: number;
  isWarmup: boolean;
  order: number;
}
