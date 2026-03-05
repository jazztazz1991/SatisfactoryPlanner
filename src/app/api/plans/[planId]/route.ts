import { auth } from "@/auth";
import { updatePlan, deletePlan } from "@/repositories/planRepository";
import { updatePlanSchema } from "@/domain/validation/planSchemas";
import { requirePlanAccess } from "@/lib/planAuth";
import { ok, err, unauthorized } from "@/lib/apiResponse";

type Params = { params: Promise<{ planId: string }> };

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const { planId } = await params;
  const { plan, error } = await requirePlanAccess(planId, session.user.id, "viewer");
  if (error) return error;
  return ok(plan);
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const { planId } = await params;
  const { error } = await requirePlanAccess(planId, session.user.id, "editor");
  if (error) return error;

  const body = await request.json().catch(() => null);
  const parsed = updatePlanSchema.safeParse(body);
  if (!parsed.success) {
    return err("Validation failed", 400, parsed.error.flatten());
  }

  try {
    const updated = await updatePlan(planId, parsed.data);
    return ok(updated);
  } catch (e) {
    console.error(e);
    return err("Failed to update plan", 500);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const { planId } = await params;
  const { error } = await requirePlanAccess(planId, session.user.id, "owner");
  if (error) return error;

  try {
    await deletePlan(planId);
    return ok({ deleted: true });
  } catch (e) {
    console.error(e);
    return err("Failed to delete plan", 500);
  }
}
