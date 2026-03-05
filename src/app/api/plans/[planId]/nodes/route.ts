import { auth } from "@/auth";
import { getNodesByPlan, createNode } from "@/repositories/nodeRepository";
import { createNodeSchema } from "@/domain/validation/nodeSchemas";
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
  const { error } = await requirePlanAccess(planId, session.user.id, "editor");
  if (error) return error;

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
