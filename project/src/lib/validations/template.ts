import { z } from "zod";

export const createTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

export const updateTemplateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
});

export const addTemplateExerciseSchema = z.object({
  exerciseId: z.string().min(1),
  sets: z.number().int().min(1).max(20).default(3),
  reps: z.string().max(10).default("8-12"),
  targetWeight: z.number().min(0).max(9999).optional(),
  targetWeightUnit: z.enum(["kg", "lb"]).optional(),
  restSeconds: z.number().int().min(0).max(600).optional(),
  tempoNotes: z.string().max(20).optional(),
  notes: z.string().max(500).optional(),
});

export const updateTemplateExerciseSchema = z.object({
  sets: z.number().int().min(1).max(20).optional(),
  reps: z.string().max(10).optional(),
  targetWeight: z.number().min(0).max(9999).nullable().optional(),
  targetWeightUnit: z.enum(["kg", "lb"]).nullable().optional(),
  restSeconds: z.number().int().min(0).max(600).nullable().optional(),
  tempoNotes: z.string().max(20).nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
});

export const reorderExercisesSchema = z
  .array(z.object({ id: z.string().min(1), orderIndex: z.number().int().min(0) }))
  .max(30);

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;
export type AddTemplateExerciseInput = z.infer<typeof addTemplateExerciseSchema>;
export type UpdateTemplateExerciseInput = z.infer<typeof updateTemplateExerciseSchema>;
export type ReorderExercisesInput = z.infer<typeof reorderExercisesSchema>;
