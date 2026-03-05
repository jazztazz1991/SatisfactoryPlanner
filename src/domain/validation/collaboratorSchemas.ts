import { z } from "zod";

export const inviteCollaboratorSchema = z.object({
  email: z.string().email(),
  role: z.enum(["editor", "viewer"]).optional().default("editor"),
});

export const updateCollaboratorSchema = z.object({
  role: z.enum(["editor", "viewer"]),
});

export const updateShareSchema = z.object({
  enabled: z.boolean(),
  role: z.enum(["editor", "viewer"]).optional().default("viewer"),
});

export type InviteCollaboratorInput = z.infer<typeof inviteCollaboratorSchema>;
export type UpdateCollaboratorInput = z.infer<typeof updateCollaboratorSchema>;
export type UpdateShareInput = z.infer<typeof updateShareSchema>;
