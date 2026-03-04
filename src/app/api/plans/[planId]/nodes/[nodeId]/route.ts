import { auth } from "@/auth";
import { getPlanById } from "@/repositories/planRepository";
import { getNodeById, updateNode, deleteNode } from "@/repositories/nodeRepository";
import { updateNodeSchema } from "@/domain/validation/nodeSchemas";
import { ok, err, notFound, unauthorized, forbidden } from "@/lib/apiResponse";

type Params = { params: Promise<{ planId: string; nodeId: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const { planId, nodeId } = await params;
  const plan = await getPlanById(planId);
  if (!plan) return notFound();
  if (plan.userId !== session.user.id) return forbidden();

  const node = await getNodeById(nodeId);
  if (!node || node.planId !== planId) return notFound();

  const body = await request.json().catch(() => null);
  const parsed = updateNodeSchema.safeParse(body);
  if (!parsed.success) {
    return err("Validation failed", 400, parsed.error.flatten());
  }

  try {
    const updated = await updateNode(nodeId, parsed.data);
    return ok(updated);
  } catch (e) {
    console.error(e);
    return err("Failed to update node", 500);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const { planId, nodeId } = await params;
  const plan = await getPlanById(planId);
  if (!plan) return notFound();
  if (plan.userId !== session.user.id) return forbidden();

  const node = await getNodeById(nodeId);
  if (!node || node.planId !== planId) return notFound();

  try {
    await deleteNode(nodeId);
    return ok({ deleted: true });
  } catch (e) {
    console.error(e);
    return err("Failed to delete node", 500);
  }
}
