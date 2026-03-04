import { describe, it, expect } from "vitest";
import { buildRecipesByProduct, identifyRawResources } from "./recipeGraph";
import type { IRecipe } from "../types/game";

const makeRecipe = (
  className: string,
  products: Array<{ itemClassName: string; amountPerCycle: number }>,
  ingredients: Array<{ itemClassName: string; amountPerCycle: number }> = []
): IRecipe => ({
  className,
  slug: className,
  name: className,
  isAlternate: false,
  timeSeconds: 4,
  producedInClass: "Desc_AssemblerMk1_C",
  ingredients: ingredients.map((i) => ({ ...i, recipeClassName: className })),
  products: products.map((p) => ({ ...p, recipeClassName: className })),
});

describe("buildRecipesByProduct", () => {
  it("maps a single product to its recipe", () => {
    const recipe = makeRecipe("Recipe_IronIngot_C", [
      { itemClassName: "Desc_IronIngot_C", amountPerCycle: 1 },
    ]);
    const map = buildRecipesByProduct([recipe]);
    expect(map.get("Desc_IronIngot_C")).toEqual([recipe]);
  });

  it("maps multiple recipes for same product (standard + alternate)", () => {
    const standard = makeRecipe("Recipe_IronIngot_C", [
      { itemClassName: "Desc_IronIngot_C", amountPerCycle: 1 },
    ]);
    const alternate = {
      ...makeRecipe("Recipe_Alternate_PureIronIngot_C", [
        { itemClassName: "Desc_IronIngot_C", amountPerCycle: 13 },
      ]),
      isAlternate: true,
    };
    const map = buildRecipesByProduct([standard, alternate]);
    expect(map.get("Desc_IronIngot_C")).toHaveLength(2);
  });

  it("handles recipes with multiple products (byproducts)", () => {
    const recipe = makeRecipe("Recipe_Plastic_C", [
      { itemClassName: "Desc_Plastic_C", amountPerCycle: 2 },
      { itemClassName: "Desc_HeavyOilResidue_C", amountPerCycle: 1 },
    ]);
    const map = buildRecipesByProduct([recipe]);
    expect(map.get("Desc_Plastic_C")).toHaveLength(1);
    expect(map.get("Desc_HeavyOilResidue_C")).toHaveLength(1);
  });

  it("returns empty map for empty recipe list", () => {
    const map = buildRecipesByProduct([]);
    expect(map.size).toBe(0);
  });
});

describe("identifyRawResources", () => {
  it("identifies items with no recipe as raw resources", () => {
    const map = buildRecipesByProduct([]);
    const raw = identifyRawResources(["Desc_OreIron_C", "Desc_OreCopper_C"], map);
    expect(raw.has("Desc_OreIron_C")).toBe(true);
    expect(raw.has("Desc_OreCopper_C")).toBe(true);
  });

  it("does not mark items that have recipes as raw resources", () => {
    const recipe = makeRecipe("Recipe_IronIngot_C", [
      { itemClassName: "Desc_IronIngot_C", amountPerCycle: 1 },
    ]);
    const map = buildRecipesByProduct([recipe]);
    const raw = identifyRawResources(["Desc_IronIngot_C", "Desc_OreIron_C"], map);
    expect(raw.has("Desc_IronIngot_C")).toBe(false);
    expect(raw.has("Desc_OreIron_C")).toBe(true);
  });
});
