import { auth } from "@/auth";
import { getPlanById } from "@/repositories/planRepository";
import { getEdgeById, deleteEdge } from "@/repositories/edgeRepository";
import { ok, err, notFound, unauthorized, forbidden } from "@/lib/apiResponse";

type Params = { params: Promise<{ planId: string; edgeId: string }> };

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const { planId, edgeId } = await params;
  const plan = await getPlanById(planId);
  if (!plan) return notFound();
  if (plan.userId !== session.user.id) return forbidden();

  const edge = await getEdgeById(edgeId);
  if (!edge || edge.planId !== planId) return notFound();

  try {
    await deleteEdge(edgeId);
    return ok({ deleted: true });
  } catch (e) {
    console.error(e);
    return err("Failed to delete edge", 500);
  }
}
