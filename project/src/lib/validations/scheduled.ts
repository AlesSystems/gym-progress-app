import { z } from "zod";

export const createScheduledWorkoutSchema = z.object({
  scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  templateId: z.string().cuid().optional(),
  title: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
});

export const updateScheduledWorkoutSchema = createScheduledWorkoutSchema.partial();

export type CreateScheduledWorkoutInput = z.infer<typeof createScheduledWorkoutSchema>;
export type UpdateScheduledWorkoutInput = z.infer<typeof updateScheduledWorkoutSchema>;
