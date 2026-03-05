import { auth } from "@/auth";
import {
  updateCollaboratorRole,
  deleteCollaborator,
} from "@/repositories/collaboratorRepository";
import { updateCollaboratorSchema } from "@/domain/validation/collaboratorSchemas";
import { requirePlanAccess } from "@/lib/planAuth";
import { ok, err, unauthorized } from "@/lib/apiResponse";

type Params = { params: Promise<{ planId: string; collabId: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const { planId, collabId } = await params;
  const { error } = await requirePlanAccess(planId, session.user.id, "owner");
  if (error) return error;

  const body = await request.json().catch(() => null);
  const parsed = updateCollaboratorSchema.safeParse(body);
  if (!parsed.success) {
    return err("Validation failed", 400, parsed.error.flatten());
  }

  try {
    const updated = await updateCollaboratorRole(collabId, parsed.data.role);
    if (!updated) return err("Collaborator not found", 404);
    return ok(updated);
  } catch (e) {
    console.error(e);
    return err("Failed to update collaborator", 500);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const { planId, collabId } = await params;
  const { error } = await requirePlanAccess(planId, session.user.id, "owner");
  if (error) return error;

  try {
    const deleted = await deleteCollaborator(collabId);
    if (!deleted) return err("Collaborator not found", 404);
    return ok({ deleted: true });
  } catch (e) {
    console.error(e);
    return err("Failed to remove collaborator", 500);
  }
}
