import { z } from "zod";

export const updateProfileSchema = z.object({
  displayName: z.string().min(2).max(50).optional(),
  name: z.string().min(2).max(100).optional(),
  unitPreference: z.enum(["kg", "lb"]).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
