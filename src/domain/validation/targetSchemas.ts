import { z } from "zod";

export const createTargetSchema = z.object({
  itemClassName: z.string().min(1),
  targetRate: z.number().positive(),
});

export const updateTargetSchema = z.object({
  targetRate: z.number().positive(),
});

export type CreateTargetInput = z.infer<typeof createTargetSchema>;
export type UpdateTargetInput = z.infer<typeof updateTargetSchema>;
