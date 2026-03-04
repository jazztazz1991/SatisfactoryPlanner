import { z } from "zod";

export const createNodeSchema = z.object({
  recipeClassName: z.string().nullable().optional(),
  buildingClassName: z.string().nullable().optional(),
  machineCount: z.number().nonnegative().default(1),
  overclockPercent: z.number().min(1).max(250).default(100),
  useAlternate: z.boolean().default(false),
  positionX: z.number().default(0),
  positionY: z.number().default(0),
  nodeType: z.enum(["machine", "resource", "sink"]),
});

export const updateNodeSchema = z.object({
  recipeClassName: z.string().nullable().optional(),
  buildingClassName: z.string().nullable().optional(),
  machineCount: z.number().nonnegative().optional(),
  overclockPercent: z.number().min(1).max(250).optional(),
  useAlternate: z.boolean().optional(),
  positionX: z.number().optional(),
  positionY: z.number().optional(),
  nodeType: z.enum(["machine", "resource", "sink"]).optional(),
});

export type CreateNodeInput = z.infer<typeof createNodeSchema>;
export type UpdateNodeInput = z.infer<typeof updateNodeSchema>;
