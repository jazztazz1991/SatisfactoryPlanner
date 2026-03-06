import { TIER_RECIPES } from "./tierRecipeMap.generated";

export { TIER_RECIPES };

/**
 * Returns the cumulative set of recipe classNames available at the given
 * milestone tier (0-9). Tier 0 = tutorial only, tier 9 = all milestones.
 */
export function getAvailableRecipes(maxTier: number): Set<string> {
  const clamped = Math.max(0, Math.min(9, Math.floor(maxTier)));
  const recipes = TIER_RECIPES[clamped];
  return new Set(recipes ?? []);
}
