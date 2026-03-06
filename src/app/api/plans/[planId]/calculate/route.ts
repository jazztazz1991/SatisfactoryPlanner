import { z } from "zod";
import { auth } from "@/auth";
import { getTargetsByPlan } from "@/repositories/targetRepository";
import { getAllRecipes, getAllItems, getAllBuildings } from "@/repositories/gameDataRepository";
import { savePlanCalculation, getSavedCalculation } from "@/repositories/planRepository";
import { solveProductionChain } from "@/domain/solver/rateCalculator";
import { getAvailableRecipes } from "@/domain/progression/tierRecipeMap";
import { requirePlanAccess } from "@/lib/planAuth";
import { ok, err, unauthorized } from "@/lib/apiResponse";

const calculateSchema = z.object({
  enabledAlternates: z.array(z.string()).optional().default([]),
  overclockPercent: z.number().min(1).max(250).optional().default(100),
});

type Params = { params: Promise<{ planId: string }> };

export async function POST(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const { planId } = await params;
  const { plan, error } = await requirePlanAccess(planId, session.user.id, "editor");
  if (error) return error;

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

    // Filter recipes to only those unlocked at the plan's milestone tier
    const availableRecipeSet = getAvailableRecipes(plan!.maxTier);
    const filteredRecipes = recipes.filter((r) => availableRecipeSet.has(r.className));

    const result = solveProductionChain({
      targets: targets.map((t) => ({ itemClassName: t.itemClassName, targetRate: t.targetRate })),
      recipeMap: new Map(filteredRecipes.map((r) => [r.className, r])),
      itemMap: new Map(items.map((i) => [i.className, i])),
      buildingMap: new Map(buildings.map((b) => [b.className, b])),
      enabledAlternates: new Set(parsed.data.enabledAlternates),
      overclockPercent: parsed.data.overclockPercent,
    });

    // Save calculation result to the plan
    await savePlanCalculation(planId, result);

    return ok(result);
  } catch (e) {
    console.error(e);
    const message = e instanceof Error ? e.message : "Calculation failed";
    return err(message, 500);
  }
}

export async function GET(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const { planId } = await params;
  const { error } = await requirePlanAccess(planId, session.user.id, "viewer");
  if (error) return error;

  const saved = await getSavedCalculation(planId);
  if (!saved) return ok(null);
  return ok(saved);
}
