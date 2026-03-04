import { z } from "zod";

export const createPlanSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).nullable().optional(),
  viewMode: z.enum(["graph", "tree"]).optional().default("graph"),
  templateKey: z.string().nullable().optional(),
});

export const updatePlanSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  viewMode: z.enum(["graph", "tree"]).optional(),
  canvasViewport: z
    .object({ x: z.number(), y: z.number(), zoom: z.number() })
    .nullable()
    .optional(),
});

export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;
