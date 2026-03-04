import type { ISolverInput, ISolverOutput, IProductionStep, IRawResourceRequirement } from "../types/solver";
import { CycleDetectedError } from "../types/solver";
import { ratePerMachine, powerAtOverclock } from "./machineCounter";
import { buildRecipesByProduct } from "./recipeGraph";

interface AccumulatedStep {
  recipeClassName: string;
  machineCount: number;
}

/**
 * Resolves the full production chain for all targets.
 *
 * Algorithm (three phases):
 * 1. Compute the maximum depth ("level") of each item reachable from any target.
 * 2. Seed the demand map with target rates.
 * 3. Process items in level order (shallowest first). Each item is processed
 *    exactly once at its fully-accumulated demand, then its ingredient demands
 *    are added for later processing.
 *
 * This avoids the exponential blowup of a naive recursive DFS when items are
 * shared across multiple production branches (e.g. iron ingots consumed by
 * both iron plates and iron rods).
 */
export function solveProductionChain(input: ISolverInput): ISolverOutput {
  const { targets, recipeMap, itemMap, buildingMap, enabledAlternates, overclockPercent } = input;

  // Build an item→recipes index once so lookups are O(1).
  const recipesByProduct = buildRecipesByProduct(Array.from(recipeMap.values()));

  function findRecipe(itemClassName: string) {
    const candidates = recipesByProduct.get(itemClassName) ?? [];
    let standard = null;
    for (const recipe of candidates) {
      if (recipe.isAlternate && enabledAlternates.has(recipe.className)) {
        return recipe; // enabled alternate takes priority
      }
      if (!recipe.isAlternate && standard === null) {
        standard = recipe;
      }
    }
    return standard;
  }

  // ── Phase 1: compute the maximum depth (level) of each item ──────────────
  const itemLevels = new Map<string, number>();
  const cycleCheck = new Set<string>();

  function computeItemLevel(itemClassName: string, level: number): void {
    if (cycleCheck.has(itemClassName)) throw new CycleDetectedError(itemClassName);
    if ((itemLevels.get(itemClassName) ?? -1) >= level) return;
    itemLevels.set(itemClassName, level);

    const item = itemMap.get(itemClassName);
    const recipe = findRecipe(itemClassName);
    if (!recipe || item?.isRawResource) return;

    cycleCheck.add(itemClassName);
    for (const ingredient of recipe.ingredients) {
      computeItemLevel(ingredient.itemClassName, level + 1);
    }
    cycleCheck.delete(itemClassName);
  }

  for (const target of targets) {
    if (target.targetRate > 0) computeItemLevel(target.itemClassName, 0);
  }

  // ── Phase 2: seed demand map with target rates ────────────────────────────
  const itemDemands = new Map<string, number>();
  for (const target of targets) {
    if (target.targetRate > 0) {
      itemDemands.set(
        target.itemClassName,
        (itemDemands.get(target.itemClassName) ?? 0) + target.targetRate,
      );
    }
  }

  // ── Phase 3: process items in level order ─────────────────────────────────
  const stepsAccum = new Map<string, AccumulatedStep>();
  const rawAccum = new Map<string, number>();

  const sortedItems = [...itemLevels.entries()]
    .sort((a, b) => a[1] - b[1])
    .map(([itemClassName]) => itemClassName);

  for (const itemClassName of sortedItems) {
    const requiredRate = itemDemands.get(itemClassName) ?? 0;
    if (requiredRate === 0) continue;

    const item = itemMap.get(itemClassName);
    const chosenRecipe = findRecipe(itemClassName);

    if (!chosenRecipe || item?.isRawResource) {
      rawAccum.set(itemClassName, (rawAccum.get(itemClassName) ?? 0) + requiredRate);
      continue;
    }

    const product = chosenRecipe.products.find((p) => p.itemClassName === itemClassName)!;
    const machinesNeeded = requiredRate / ratePerMachine(chosenRecipe.timeSeconds, product.amountPerCycle);

    const existing = stepsAccum.get(chosenRecipe.className);
    if (existing) {
      existing.machineCount += machinesNeeded;
    } else {
      stepsAccum.set(chosenRecipe.className, {
        recipeClassName: chosenRecipe.className,
        machineCount: machinesNeeded,
      });
    }

    // Propagate ingredient demands — they're at higher levels, processed later.
    const cyclesPerMinute = (60 / chosenRecipe.timeSeconds) * machinesNeeded;
    for (const ingredient of chosenRecipe.ingredients) {
      const ingredientRate = ingredient.amountPerCycle * cyclesPerMinute;
      itemDemands.set(
        ingredient.itemClassName,
        (itemDemands.get(ingredient.itemClassName) ?? 0) + ingredientRate,
      );
    }
  }

  // ── Build output steps ────────────────────────────────────────────────────
  const steps: IProductionStep[] = [];
  for (const [recipeClassName, accum] of stepsAccum) {
    const recipe = recipeMap.get(recipeClassName)!;
    const building = recipe.producedInClass ? buildingMap.get(recipe.producedInClass) : undefined;
    const basePower = building?.powerConsumption ?? 0;
    const exponent = building?.powerConsumptionExponent ?? 1.6;

    const cyclesPerMinute = (60 / recipe.timeSeconds) * accum.machineCount;

    steps.push({
      recipeClassName,
      recipeName: recipe.name,
      buildingClassName: recipe.producedInClass,
      buildingName: building?.name ?? null,
      machineCount: accum.machineCount,
      powerUsageKW: powerAtOverclock(basePower * accum.machineCount, overclockPercent, exponent),
      inputs: recipe.ingredients.map((ing) => ({
        itemClassName: ing.itemClassName,
        itemName: itemMap.get(ing.itemClassName)?.name ?? ing.itemClassName,
        rate: ing.amountPerCycle * cyclesPerMinute,
      })),
      outputs: recipe.products.map((prod) => ({
        itemClassName: prod.itemClassName,
        itemName: itemMap.get(prod.itemClassName)?.name ?? prod.itemClassName,
        rate: prod.amountPerCycle * cyclesPerMinute,
      })),
    });
  }

  const rawResources: IRawResourceRequirement[] = [];
  for (const [itemClassName, rate] of rawAccum) {
    rawResources.push({
      itemClassName,
      itemName: itemMap.get(itemClassName)?.name ?? itemClassName,
      rate,
    });
  }

  const totalPowerKW = steps.reduce((sum, s) => sum + s.powerUsageKW, 0);

  return { steps, rawResources, totalPowerKW };
}
