import { z } from "zod";

export const createPlanSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).nullable().optional(),
  viewMode: z.enum(["graph", "tree"]).optional().default("graph"),
  templateKey: z.string().nullable().optional(),
  maxTier: z.number().int().min(0).max(9).optional().default(9),
});

export const updatePlanSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  viewMode: z.enum(["graph", "tree"]).optional(),
  canvasViewport: z
    .object({ x: z.number(), y: z.number(), zoom: z.number() })
    .nullable()
    .optional(),
  maxTier: z.number().int().min(0).max(9).optional(),
  factoryNodePositions: z
    .record(z.string(), z.object({ x: z.number(), y: z.number() }))
    .nullable()
    .optional(),
  floorConfig: z
    .object({
      floorWidth: z.number().int().min(4).max(64),
      floorDepth: z.number().int().min(4).max(64),
    })
    .nullable()
    .optional(),
});

export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;
