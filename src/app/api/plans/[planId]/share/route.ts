import { randomUUID } from "crypto";
import { auth } from "@/auth";
import { updatePlanShareSettings } from "@/repositories/planRepository";
import { updateShareSchema } from "@/domain/validation/collaboratorSchemas";
import { requirePlanAccess } from "@/lib/planAuth";
import { ok, err, unauthorized } from "@/lib/apiResponse";

type Params = { params: Promise<{ planId: string }> };

export async function POST(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const { planId } = await params;
  const { error } = await requirePlanAccess(planId, session.user.id, "owner");
  if (error) return error;

  const body = await request.json().catch(() => null);
  const parsed = updateShareSchema.safeParse(body);
  if (!parsed.success) {
    return err("Validation failed", 400, parsed.error.flatten());
  }

  try {
    const shareToken = parsed.data.enabled ? randomUUID() : null;
    const shareRole = parsed.data.enabled ? parsed.data.role : null;
    const updated = await updatePlanShareSettings(planId, shareToken, shareRole);
    return ok({ shareToken: updated?.shareToken, shareRole: updated?.shareRole });
  } catch (e) {
    console.error(e);
    return err("Failed to update share settings", 500);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const { planId } = await params;
  const { error } = await requirePlanAccess(planId, session.user.id, "owner");
  if (error) return error;

  try {
    await updatePlanShareSettings(planId, null, null);
    return ok({ shareToken: null, shareRole: null });
  } catch (e) {
    console.error(e);
    return err("Failed to disable sharing", 500);
  }
}
