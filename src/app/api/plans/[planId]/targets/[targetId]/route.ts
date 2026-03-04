import { auth } from "@/auth";
import { getPlanById } from "@/repositories/planRepository";
import { getTargetById, updateTarget, deleteTarget } from "@/repositories/targetRepository";
import { updateTargetSchema } from "@/domain/validation/targetSchemas";
import { ok, err, notFound, unauthorized, forbidden } from "@/lib/apiResponse";

type Params = { params: Promise<{ planId: string; targetId: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const { planId, targetId } = await params;
  const plan = await getPlanById(planId);
  if (!plan) return notFound();
  if (plan.userId !== session.user.id) return forbidden();

  const target = await getTargetById(targetId);
  if (!target || target.planId !== planId) return notFound();

  const body = await request.json().catch(() => null);
  const parsed = updateTargetSchema.safeParse(body);
  if (!parsed.success) {
    return err("Validation failed", 400, parsed.error.flatten());
  }

  try {
    const updated = await updateTarget(targetId, parsed.data);
    return ok(updated);
  } catch (e) {
    console.error(e);
    return err("Failed to update target", 500);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const { planId, targetId } = await params;
  const plan = await getPlanById(planId);
  if (!plan) return notFound();
  if (plan.userId !== session.user.id) return forbidden();

  const target = await getTargetById(targetId);
  if (!target || target.planId !== planId) return notFound();

  try {
    await deleteTarget(targetId);
    return ok({ deleted: true });
  } catch (e) {
    console.error(e);
    return err("Failed to delete target", 500);
  }
}
