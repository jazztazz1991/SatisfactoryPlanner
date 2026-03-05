import { auth } from "@/auth";
import {
  getCollaboratorsByPlan,
  createCollaborator,
  findUserByEmail,
} from "@/repositories/collaboratorRepository";
import { inviteCollaboratorSchema } from "@/domain/validation/collaboratorSchemas";
import { requirePlanAccess } from "@/lib/planAuth";
import { ok, err, unauthorized } from "@/lib/apiResponse";

type Params = { params: Promise<{ planId: string }> };

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const { planId } = await params;
  const { error } = await requirePlanAccess(planId, session.user.id, "viewer");
  if (error) return error;

  try {
    const collaborators = await getCollaboratorsByPlan(planId);
    return ok(collaborators);
  } catch (e) {
    console.error(e);
    return err("Failed to fetch collaborators", 500);
  }
}

export async function POST(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const { planId } = await params;
  const { error } = await requirePlanAccess(planId, session.user.id, "owner");
  if (error) return error;

  const body = await request.json().catch(() => null);
  const parsed = inviteCollaboratorSchema.safeParse(body);
  if (!parsed.success) {
    return err("Validation failed", 400, parsed.error.flatten());
  }

  try {
    const existingUser = await findUserByEmail(parsed.data.email);
    const collab = await createCollaborator({
      planId,
      userId: existingUser?.id,
      email: parsed.data.email,
      role: parsed.data.role,
    });
    return ok(collab, 201);
  } catch (e) {
    console.error(e);
    return err("Failed to invite collaborator", 500);
  }
}
