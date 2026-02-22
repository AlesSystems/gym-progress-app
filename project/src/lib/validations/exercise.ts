import { z } from "zod";

export const EXERCISE_TYPES = ["compound", "isolation"] as const;
export const MOVEMENT_CATEGORIES = ["push", "pull", "legs", "core", "cardio", "other"] as const;
export const WEIGHT_UNITS = ["kg", "lb"] as const;

export type ExerciseType = (typeof EXERCISE_TYPES)[number];
export type MovementCategory = (typeof MOVEMENT_CATEGORIES)[number];
export type WeightUnit = (typeof WEIGHT_UNITS)[number];

export const createExerciseSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  type: z.enum(EXERCISE_TYPES),
  movementCategory: z.enum(MOVEMENT_CATEGORIES),
  primaryMuscle: z.string().min(2, "Primary muscle is required").max(50),
  secondaryMuscles: z.array(z.string().max(50)).max(10),
  defaultUnit: z.enum(WEIGHT_UNITS).optional(),
  defaultReps: z.number().int().min(1).max(100).optional(),
  defaultWeight: z.number().min(0).max(9999).optional(),
  demoImageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  demoVideoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  description: z.string().max(1000).optional(),
});

export const updateExerciseSchema = createExerciseSchema.partial().omit({
  // name is allowed to change
});

export type CreateExerciseInput = z.infer<typeof createExerciseSchema>;
export type UpdateExerciseInput = z.infer<typeof updateExerciseSchema>;
