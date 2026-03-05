import { auth } from "@/auth";
import { getEdgeById, deleteEdge } from "@/repositories/edgeRepository";
import { requirePlanAccess } from "@/lib/planAuth";
import { ok, err, notFound, unauthorized } from "@/lib/apiResponse";

type Params = { params: Promise<{ planId: string; edgeId: string }> };

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const { planId, edgeId } = await params;
  const { error } = await requirePlanAccess(planId, session.user.id, "editor");
  if (error) return error;

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
