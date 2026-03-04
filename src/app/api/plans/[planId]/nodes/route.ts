import { auth } from "@/auth";
import { getPlanById } from "@/repositories/planRepository";
import { getNodesByPlan, createNode } from "@/repositories/nodeRepository";
import { createNodeSchema } from "@/domain/validation/nodeSchemas";
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
    const nodes = await getNodesByPlan(planId);
    return ok(nodes);
  } catch (e) {
    console.error(e);
    return err("Failed to fetch nodes", 500);
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
  const parsed = createNodeSchema.safeParse(body);
  if (!parsed.success) {
    return err("Validation failed", 400, parsed.error.flatten());
  }

  try {
    const node = await createNode(planId, parsed.data);
    return ok(node, 201);
  } catch (e) {
    console.error(e);
    return err("Failed to create node", 500);
  }
}
