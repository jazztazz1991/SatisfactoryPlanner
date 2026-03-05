import { auth } from "@/auth";
import { getTargetsByPlan, createTarget } from "@/repositories/targetRepository";
import { createTargetSchema } from "@/domain/validation/targetSchemas";
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
    const targets = await getTargetsByPlan(planId);
    return ok(targets);
  } catch (e) {
    console.error(e);
    return err("Failed to fetch targets", 500);
  }
}

export async function POST(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const { planId } = await params;
  const { error } = await requirePlanAccess(planId, session.user.id, "editor");
  if (error) return error;

  const body = await request.json().catch(() => null);
  const parsed = createTargetSchema.safeParse(body);
  if (!parsed.success) {
    return err("Validation failed", 400, parsed.error.flatten());
  }

  try {
    const target = await createTarget(planId, parsed.data);
    return ok(target, 201);
  } catch (e) {
    console.error(e);
    return err("Failed to create target", 500);
  }
}
