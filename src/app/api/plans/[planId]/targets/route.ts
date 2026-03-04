import { auth } from "@/auth";
import { getPlanById } from "@/repositories/planRepository";
import { getTargetsByPlan, createTarget } from "@/repositories/targetRepository";
import { createTargetSchema } from "@/domain/validation/targetSchemas";
import { ok, err, notFound, unauthorized, forbidden } from "@/lib/apiResponse";

type Params = { params: Promise<{ planId: string }> };

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const { planId } = await params;
  const plan = await getPlanById(planId);
  if (!plan) return notFound();
  if (plan.userId !== session.user.id) return forbidden();

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
  const plan = await getPlanById(planId);
  if (!plan) return notFound();
  if (plan.userId !== session.user.id) return forbidden();

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
