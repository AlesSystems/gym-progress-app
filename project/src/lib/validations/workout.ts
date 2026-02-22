import { z } from "zod";

export const workoutSchema = z.object({
  name: z.string().min(1, "Workout name is required"),
  date: z.string().or(z.date()),
  notes: z.string().optional(),
});

export const exerciseSetSchema = z.object({
  weight: z.number().min(0).optional(),
  reps: z.number().int().min(1).optional(),
  duration: z.number().min(0).optional(),
  distance: z.number().min(0).optional(),
  notes: z.string().optional(),
});

export type WorkoutInput = z.infer<typeof workoutSchema>;
export type ExerciseSetInput = z.infer<typeof exerciseSetSchema>;
