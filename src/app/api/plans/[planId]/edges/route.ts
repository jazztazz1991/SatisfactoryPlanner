import { z } from "zod";
import { auth } from "@/auth";
import { createEdge } from "@/repositories/edgeRepository";
import { requirePlanAccess } from "@/lib/planAuth";
import { ok, err, unauthorized } from "@/lib/apiResponse";

const createEdgeSchema = z.object({
  sourceNodeId: z.string().uuid(),
  targetNodeId: z.string().uuid(),
  itemClassName: z.string().min(1),
  rate: z.number().nonnegative(),
});

type Params = { params: Promise<{ planId: string }> };

export async function POST(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const { planId } = await params;
  const { error } = await requirePlanAccess(planId, session.user.id, "editor");
  if (error) return error;

  const body = await request.json().catch(() => null);
  const parsed = createEdgeSchema.safeParse(body);
  if (!parsed.success) {
    return err("Validation failed", 400, parsed.error.flatten());
  }

  try {
    const edge = await createEdge(planId, parsed.data);
    return ok(edge, 201);
  } catch (e) {
    console.error(e);
    return err("Failed to create edge", 500);
  }
}
