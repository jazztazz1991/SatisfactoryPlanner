import { z } from "zod";
import { auth } from "@/auth";
import { getPlanById } from "@/repositories/planRepository";
import { getTargetsByPlan } from "@/repositories/targetRepository";
import { getAllRecipes, getAllItems, getAllBuildings } from "@/repositories/gameDataRepository";
import { solveProductionChain } from "@/domain/solver/rateCalculator";
import { ok, err, notFound, unauthorized, forbidden } from "@/lib/apiResponse";

const calculateSchema = z.object({
  enabledAlternates: z.array(z.string()).optional().default([]),
  overclockPercent: z.number().min(1).max(250).optional().default(100),
});

type Params = { params: Promise<{ planId: string }> };

export async function POST(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const { planId } = await params;
  const plan = await getPlanById(planId);
  if (!plan) return notFound();
  if (plan.userId !== session.user.id) return forbidden();

  const body = await request.json().catch(() => ({}));
  const parsed = calculateSchema.safeParse(body);
  if (!parsed.success) {
    return err("Validation failed", 400, parsed.error.flatten());
  }

  try {
    const [targets, recipes, items, buildings] = await Promise.all([
      getTargetsByPlan(planId),
      getAllRecipes(),
      getAllItems(),
      getAllBuildings(),
    ]);

    const result = solveProductionChain({
      targets: targets.map((t) => ({ itemClassName: t.itemClassName, targetRate: t.targetRate })),
      recipeMap: new Map(recipes.map((r) => [r.className, r])),
      itemMap: new Map(items.map((i) => [i.className, i])),
      buildingMap: new Map(buildings.map((b) => [b.className, b])),
      enabledAlternates: new Set(parsed.data.enabledAlternates),
      overclockPercent: parsed.data.overclockPercent,
    });

    return ok(result);
  } catch (e) {
    console.error(e);
    const message = e instanceof Error ? e.message : "Calculation failed";
    return err(message, 500);
  }
}
