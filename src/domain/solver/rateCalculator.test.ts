import { describe, it, expect } from "vitest";
import { solveProductionChain } from "./rateCalculator";
import { CycleDetectedError } from "../types/solver";
import type { ISolverInput } from "../types/solver";
import type { IItem, IRecipe, IBuilding } from "../types/game";

// ── helpers ──────────────────────────────────────────────────────────────────

function makeItem(className: string, isRaw = false): IItem {
  return {
    className,
    slug: className,
    name: className,
    description: null,
    stackSize: 100,
    sinkPoints: null,
    energyValue: null,
    radioactiveDecay: null,
    isLiquid: false,
    fluidColor: null,
    isRawResource: isRaw,
  };
}

function makeBuilding(className: string, power = 30): IBuilding {
  return {
    className,
    slug: className,
    name: className,
    description: null,
    powerConsumption: power,
    powerConsumptionExponent: 1.6,
    manufacturingSpeed: 1,
  };
}

function makeRecipe(
  className: string,
  timeSeconds: number,
  products: Array<{ itemClassName: string; amountPerCycle: number }>,
  ingredients: Array<{ itemClassName: string; amountPerCycle: number }> = [],
  isAlternate = false,
  producedInClass: string | null = "Desc_ConstructorMk1_C"
): IRecipe {
  return {
    className,
    slug: className,
    name: className,
    isAlternate,
    timeSeconds,
    producedInClass,
    ingredients: ingredients.map((i) => ({ ...i, recipeClassName: className })),
    products: products.map((p) => ({ ...p, recipeClassName: className })),
  };
}

function makeInput(
  targets: Array<{ itemClassName: string; targetRate: number }>,
  recipes: IRecipe[],
  items: IItem[],
  buildings: IBuilding[] = [],
  enabledAlternates: Set<string> = new Set(),
  overclockPercent = 100
): ISolverInput {
  return {
    targets,
    recipeMap: new Map(recipes.map((r) => [r.className, r])),
    itemMap: new Map(items.map((i) => [i.className, i])),
    buildingMap: new Map(buildings.map((b) => [b.className, b])),
    enabledAlternates,
    overclockPercent,
  };
}

// ── tests ─────────────────────────────────────────────────────────────────────

describe("solveProductionChain", () => {
  it("resolves a single-step chain to a raw resource", () => {
    const oreIron = makeItem("Desc_OreIron_C", true);
    const ironIngot = makeItem("Desc_IronIngot_C");
    const recipe = makeRecipe(
      "Recipe_IronIngot_C",
      2,
      [{ itemClassName: "Desc_IronIngot_C", amountPerCycle: 1 }],
      [{ itemClassName: "Desc_OreIron_C", amountPerCycle: 1 }]
    );

    const result = solveProductionChain(
      makeInput([{ itemClassName: "Desc_IronIngot_C", targetRate: 30 }], [recipe], [oreIron, ironIngot])
    );

    // rate_per_machine = (60/2)*1 = 30 → 1 machine
    expect(result.steps).toHaveLength(1);
    expect(result.steps[0].recipeClassName).toBe("Recipe_IronIngot_C");
    expect(result.steps[0].machineCount).toBeCloseTo(1);
    expect(result.rawResources).toHaveLength(1);
    expect(result.rawResources[0].itemClassName).toBe("Desc_OreIron_C");
    expect(result.rawResources[0].rate).toBeCloseTo(30);
  });

  it("resolves a multi-step chain", () => {
    const oreIron = makeItem("Desc_OreIron_C", true);
    const ironIngot = makeItem("Desc_IronIngot_C");
    const ironPlate = makeItem("Desc_IronPlate_C");

    const ingotRecipe = makeRecipe(
      "Recipe_IronIngot_C",
      2,
      [{ itemClassName: "Desc_IronIngot_C", amountPerCycle: 1 }],
      [{ itemClassName: "Desc_OreIron_C", amountPerCycle: 1 }]
    );
    const plateRecipe = makeRecipe(
      "Recipe_IronPlate_C",
      6,
      [{ itemClassName: "Desc_IronPlate_C", amountPerCycle: 2 }],
      [{ itemClassName: "Desc_IronIngot_C", amountPerCycle: 3 }]
    );

    const result = solveProductionChain(
      makeInput(
        [{ itemClassName: "Desc_IronPlate_C", targetRate: 20 }],
        [ingotRecipe, plateRecipe],
        [oreIron, ironIngot, ironPlate]
      )
    );

    expect(result.steps).toHaveLength(2);
    const plateStep = result.steps.find((s) => s.recipeClassName === "Recipe_IronPlate_C")!;
    // rate = (60/6)*2 = 20/min → 1 machine for 20/min
    expect(plateStep.machineCount).toBeCloseTo(1);

    const ingotStep = result.steps.find((s) => s.recipeClassName === "Recipe_IronIngot_C")!;
    // Plates need 3 ingots/cycle at 10 cycles/min = 30 ingots/min
    // ingot rate = (60/2)*1 = 30/min → 1 machine
    expect(ingotStep.machineCount).toBeCloseTo(1);

    expect(result.rawResources[0].rate).toBeCloseTo(30);
  });

  it("uses enabled alternate recipe over standard", () => {
    const oreIron = makeItem("Desc_OreIron_C", true);
    const ironIngot = makeItem("Desc_IronIngot_C");

    const standard = makeRecipe(
      "Recipe_IronIngot_C",
      2,
      [{ itemClassName: "Desc_IronIngot_C", amountPerCycle: 1 }],
      [{ itemClassName: "Desc_OreIron_C", amountPerCycle: 1 }]
    );
    const alternate = makeRecipe(
      "Recipe_Alternate_PureIronIngot_C",
      12,
      [{ itemClassName: "Desc_IronIngot_C", amountPerCycle: 13 }],
      [{ itemClassName: "Desc_OreIron_C", amountPerCycle: 7 }],
      true
    );

    const result = solveProductionChain(
      makeInput(
        [{ itemClassName: "Desc_IronIngot_C", targetRate: 65 }],
        [standard, alternate],
        [oreIron, ironIngot],
        [],
        new Set(["Recipe_Alternate_PureIronIngot_C"])
      )
    );

    const step = result.steps[0];
    expect(step.recipeClassName).toBe("Recipe_Alternate_PureIronIngot_C");
  });

  it("handles byproducts without breaking the chain", () => {
    const crudeOil = makeItem("Desc_LiquidOil_C", true);
    const plastic = makeItem("Desc_Plastic_C");
    const heavyOil = makeItem("Desc_HeavyOilResidue_C");

    const recipe = makeRecipe(
      "Recipe_Plastic_C",
      6,
      [
        { itemClassName: "Desc_Plastic_C", amountPerCycle: 2 },
        { itemClassName: "Desc_HeavyOilResidue_C", amountPerCycle: 1 },
      ],
      [{ itemClassName: "Desc_LiquidOil_C", amountPerCycle: 3 }]
    );

    const result = solveProductionChain(
      makeInput(
        [{ itemClassName: "Desc_Plastic_C", targetRate: 20 }],
        [recipe],
        [crudeOil, plastic, heavyOil]
      )
    );

    expect(result.steps).toHaveLength(1);
    const step = result.steps[0];
    // rate = (60/6)*2 = 20/min → 1 machine
    expect(step.machineCount).toBeCloseTo(1);
    // Byproduct is included in outputs
    const byproduct = step.outputs.find((o) => o.itemClassName === "Desc_HeavyOilResidue_C");
    expect(byproduct).toBeDefined();
    expect(byproduct!.rate).toBeCloseTo(10);
  });

  it("returns zero-rate target without creating any steps", () => {
    const item = makeItem("Desc_IronPlate_C");
    const recipe = makeRecipe(
      "Recipe_IronPlate_C",
      6,
      [{ itemClassName: "Desc_IronPlate_C", amountPerCycle: 2 }],
      []
    );

    const result = solveProductionChain(
      makeInput([{ itemClassName: "Desc_IronPlate_C", targetRate: 0 }], [recipe], [item])
    );

    expect(result.steps).toHaveLength(0);
    expect(result.rawResources).toHaveLength(0);
    expect(result.totalPowerKW).toBe(0);
  });

  it("accumulates machine counts when the same recipe is needed by multiple targets", () => {
    const oreIron = makeItem("Desc_OreIron_C", true);
    const ironIngot = makeItem("Desc_IronIngot_C");
    const ironPlate = makeItem("Desc_IronPlate_C");
    const ironRod = makeItem("Desc_IronRod_C");

    const ingotRecipe = makeRecipe(
      "Recipe_IronIngot_C",
      2,
      [{ itemClassName: "Desc_IronIngot_C", amountPerCycle: 1 }],
      [{ itemClassName: "Desc_OreIron_C", amountPerCycle: 1 }]
    );
    const plateRecipe = makeRecipe(
      "Recipe_IronPlate_C",
      6,
      [{ itemClassName: "Desc_IronPlate_C", amountPerCycle: 2 }],
      [{ itemClassName: "Desc_IronIngot_C", amountPerCycle: 3 }]
    );
    const rodRecipe = makeRecipe(
      "Recipe_IronRod_C",
      4,
      [{ itemClassName: "Desc_IronRod_C", amountPerCycle: 1 }],
      [{ itemClassName: "Desc_IronIngot_C", amountPerCycle: 1 }]
    );

    const result = solveProductionChain(
      makeInput(
        [
          { itemClassName: "Desc_IronPlate_C", targetRate: 20 },
          { itemClassName: "Desc_IronRod_C", targetRate: 15 },
        ],
        [ingotRecipe, plateRecipe, rodRecipe],
        [oreIron, ironIngot, ironPlate, ironRod]
      )
    );

    const ingotStep = result.steps.find((s) => s.recipeClassName === "Recipe_IronIngot_C")!;
    // Plates need 30 ingots/min (1 machine), rods need 15 ingots/min (0.5 machine) → 1.5 total
    expect(ingotStep.machineCount).toBeCloseTo(1.5);
  });

  it("throws CycleDetectedError for cyclic dependencies", () => {
    const a = makeItem("Item_A");
    const b = makeItem("Item_B");

    // A requires B, B requires A
    const recipeA = makeRecipe(
      "Recipe_A",
      4,
      [{ itemClassName: "Item_A", amountPerCycle: 1 }],
      [{ itemClassName: "Item_B", amountPerCycle: 1 }]
    );
    const recipeB = makeRecipe(
      "Recipe_B",
      4,
      [{ itemClassName: "Item_B", amountPerCycle: 1 }],
      [{ itemClassName: "Item_A", amountPerCycle: 1 }]
    );

    expect(() =>
      solveProductionChain(
        makeInput([{ itemClassName: "Item_A", targetRate: 10 }], [recipeA, recipeB], [a, b])
      )
    ).toThrow(CycleDetectedError);
  });
});
