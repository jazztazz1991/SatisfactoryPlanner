import { z } from "zod";
import { auth } from "@/auth";
import { getPlanById } from "@/repositories/planRepository";
import { createEdge } from "@/repositories/edgeRepository";
import { ok, err, notFound, unauthorized, forbidden } from "@/lib/apiResponse";

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
  const plan = await getPlanById(planId);
  if (!plan) return notFound();
  if (plan.userId !== session.user.id) return forbidden();

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
