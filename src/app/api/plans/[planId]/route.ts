import { auth } from "@/auth";
import { getPlanById, updatePlan, deletePlan } from "@/repositories/planRepository";
import { updatePlanSchema } from "@/domain/validation/planSchemas";
import { ok, err, notFound, unauthorized, forbidden } from "@/lib/apiResponse";

type Params = { params: Promise<{ planId: string }> };

async function requirePlanOwner(planId: string, userId: string) {
  const plan = await getPlanById(planId);
  if (!plan) return { plan: null, error: notFound() };
  if (plan.userId !== userId) return { plan: null, error: forbidden() };
  return { plan, error: null };
}

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const { planId } = await params;
  const { plan, error } = await requirePlanOwner(planId, session.user.id);
  if (error) return error;
  return ok(plan);
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const { planId } = await params;
  const { plan: existing, error } = await requirePlanOwner(planId, session.user.id);
  if (error) return error;
  void existing;

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
  const { error } = await requirePlanOwner(planId, session.user.id);
  if (error) return error;

  try {
    await deletePlan(planId);
    return ok({ deleted: true });
  } catch (e) {
    console.error(e);
    return err("Failed to delete plan", 500);
  }
}
