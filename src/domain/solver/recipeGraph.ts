import type { IRecipe } from "../types/game";

/**
 * Builds a map of itemClassName → recipes that produce that item.
 * Includes both standard and alternate recipes.
 */
export function buildRecipesByProduct(
  recipes: IRecipe[]
): Map<string, IRecipe[]> {
  const map = new Map<string, IRecipe[]>();
  for (const recipe of recipes) {
    for (const product of recipe.products) {
      const existing = map.get(product.itemClassName) ?? [];
      existing.push(recipe);
      map.set(product.itemClassName, existing);
    }
  }
  return map;
}

/**
 * Returns the set of item class names that are raw resources
 * (i.e., items with no recipe that produces them, or explicitly marked).
 */
export function identifyRawResources(
  itemClassNames: string[],
  recipesByProduct: Map<string, IRecipe[]>
): Set<string> {
  const raw = new Set<string>();
  for (const className of itemClassNames) {
    const producers = recipesByProduct.get(className);
    if (!producers || producers.length === 0) {
      raw.add(className);
    }
  }
  return raw;
}
