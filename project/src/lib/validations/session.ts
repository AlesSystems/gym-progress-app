import { z } from "zod";

export const startSessionSchema = z.object({
  templateId: z.string().cuid().optional(),
  name: z.string().max(100).optional(),
  scheduledWorkoutId: z.string().cuid().optional(),
});

export const completeSessionSchema = z.object({
  status: z.enum(["completed", "abandoned"]),
  notes: z.string().max(1000).optional(),
});

export const logSetSchema = z.object({
  weight: z.number().min(0).max(9999).optional(),
  weightUnit: z.enum(["kg", "lb"]).optional(),
  reps: z.number().int().min(0).max(999).optional(),
  rpe: z.number().min(1).max(10).multipleOf(0.5).optional(),
  notes: z.string().max(500).optional(),
  isWarmup: z.boolean().default(false),
  completedAt: z.string().datetime().optional(),
});

export const updateSetSchema = z.object({
  weight: z.number().min(0).max(9999).nullable().optional(),
  weightUnit: z.enum(["kg", "lb"]).nullable().optional(),
  reps: z.number().int().min(0).max(999).nullable().optional(),
  rpe: z.number().min(1).max(10).multipleOf(0.5).nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
  isWarmup: z.boolean().optional(),
  completedAt: z.string().datetime().nullable().optional(),
});

export const addSessionExerciseSchema = z.object({
  exerciseId: z.string().cuid(),
  orderIndex: z.number().int().min(0).optional(),
  restSeconds: z.number().int().min(0).max(600).optional(),
  notes: z.string().max(500).optional(),
});

export const updateSessionExerciseSchema = z.object({
  restSeconds: z.number().int().min(0).max(600).nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
});

export type StartSessionInput = z.infer<typeof startSessionSchema>;
export type CompleteSessionInput = z.infer<typeof completeSessionSchema>;
export type LogSetInput = z.infer<typeof logSetSchema>;
export type UpdateSetInput = z.infer<typeof updateSetSchema>;
export type AddSessionExerciseInput = z.infer<typeof addSessionExerciseSchema>;
export type UpdateSessionExerciseInput = z.infer<typeof updateSessionExerciseSchema>;
