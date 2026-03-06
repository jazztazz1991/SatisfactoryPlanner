import { auth } from "@/auth";
import { getAllPlansForUser, createPlan } from "@/repositories/planRepository";
import { createPlanSchema } from "@/domain/validation/planSchemas";
import { ok, err, unauthorized } from "@/lib/apiResponse";
import { TEMPLATE_MAP } from "@/domain/templates/spaceElevatorTemplates";
import { createTarget } from "@/repositories/targetRepository";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  try {
    const plans = await getAllPlansForUser(session.user.id);
    return ok(plans);
  } catch (e) {
    console.error(e);
    return err("Failed to fetch plans", 500);
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const body = await request.json().catch(() => null);
  const parsed = createPlanSchema.safeParse(body);
  if (!parsed.success) {
    return err("Validation failed", 400, parsed.error.flatten());
  }

  try {
    const plan = await createPlan(session.user.id, parsed.data);

    // If a template was specified, seed the targets
    if (parsed.data.templateKey) {
      const template = TEMPLATE_MAP.get(parsed.data.templateKey);
      if (template) {
        await Promise.all(
          template.targets.map((t) =>
            createTarget(plan.id, { itemClassName: t.itemClassName, targetRate: t.targetRate })
          )
        );
      }
    }

    return ok(plan, 201);
  } catch (e) {
    console.error(e);
    return err("Failed to create plan", 500);
  }
}
