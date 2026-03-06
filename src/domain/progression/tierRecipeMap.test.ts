import { describe, it, expect } from "vitest";
import { getAvailableRecipes, TIER_RECIPES } from "./tierRecipeMap";

describe("getAvailableRecipes", () => {
  it("returns a Set for tier 0", () => {
    const recipes = getAvailableRecipes(0);
    expect(recipes).toBeInstanceOf(Set);
    expect(recipes.size).toBeGreaterThan(0);
  });

  it("tier 9 has the most recipes", () => {
    const tier0 = getAvailableRecipes(0);
    const tier9 = getAvailableRecipes(9);
    expect(tier9.size).toBeGreaterThan(tier0.size);
  });

  it("each tier is a superset of the previous tier", () => {
    for (let t = 1; t <= 9; t++) {
      const prev = getAvailableRecipes(t - 1);
      const curr = getAvailableRecipes(t);
      for (const recipe of prev) {
        expect(curr.has(recipe)).toBe(true);
      }
    }
  });

  it("tier 0 includes tutorial recipes like ConveyorBeltMk1", () => {
    const recipes = getAvailableRecipes(0);
    expect(recipes.has("Recipe_ConveyorBeltMk1_C")).toBe(true);
    expect(recipes.has("Recipe_SmelterBasicMk1_C")).toBe(true);
  });

  it("tier 3 includes Coal Power recipes", () => {
    const recipes = getAvailableRecipes(3);
    expect(recipes.has("Recipe_GeneratorCoal_C")).toBe(true);
    expect(recipes.has("Recipe_WaterPump_C")).toBe(true);
  });

  it("tier 2 does NOT include Coal Power recipes", () => {
    const recipes = getAvailableRecipes(2);
    expect(recipes.has("Recipe_GeneratorCoal_C")).toBe(false);
  });

  it("tier 5 includes Oil Processing recipes", () => {
    const recipes = getAvailableRecipes(5);
    expect(recipes.has("Recipe_OilPump_C")).toBe(true);
    expect(recipes.has("Recipe_CircuitBoard_C")).toBe(true);
  });

  it("clamps out-of-range values", () => {
    const below = getAvailableRecipes(-1);
    expect(below.size).toBe(getAvailableRecipes(0).size);

    const above = getAvailableRecipes(99);
    expect(above.size).toBe(getAvailableRecipes(9).size);
  });
});

describe("TIER_RECIPES", () => {
  it("has entries for tiers 0 through 9", () => {
    for (let t = 0; t <= 9; t++) {
      expect(TIER_RECIPES[t]).toBeDefined();
      expect(Array.isArray(TIER_RECIPES[t])).toBe(true);
    }
  });
});
