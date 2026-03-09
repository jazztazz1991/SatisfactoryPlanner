import { describe, it, expect } from "vitest";
import { computeBuilderRates, computeMachineItemRates, type BuilderNodeInfo, type BuilderEdgeInfo, type BuilderResourceInfo, type BuilderSplitterMergerInfo } from "./rateCalculation";
import type { IRecipe, IItem } from "@/domain/types/game";

function makeRecipe(overrides: Partial<IRecipe> = {}): IRecipe {
  return {
    className: "Recipe_IronIngot_C",
    slug: "iron-ingot",
    name: "Iron Ingot",
    isAlternate: false,
    timeSeconds: 2,
    producedInClass: "Desc_SmelterMk1_C",
    ingredients: [{ recipeClassName: "Recipe_IronIngot_C", itemClassName: "Desc_OreIron_C", amountPerCycle: 1 }],
    products: [{ recipeClassName: "Recipe_IronIngot_C", itemClassName: "Desc_IronIngot_C", amountPerCycle: 1 }],
    ...overrides,
  };
}

function makeItems(): Map<string, IItem> {
  const items = new Map<string, IItem>();
  items.set("Desc_IronIngot_C", {
    className: "Desc_IronIngot_C", slug: "iron-ingot", name: "Iron Ingot",
    description: null, stackSize: 100, sinkPoints: 2, energyValue: null,
    radioactiveDecay: null, isLiquid: false, fluidColor: null, isRawResource: false,
  });
  items.set("Desc_OreIron_C", {
    className: "Desc_OreIron_C", slug: "iron-ore", name: "Iron Ore",
    description: null, stackSize: 100, sinkPoints: 1, energyValue: null,
    radioactiveDecay: null, isLiquid: false, fluidColor: null, isRawResource: true,
  });
  return items;
}

describe("computeBuilderRates", () => {
  const recipe = makeRecipe();
  // rate per machine = (60 / 2) * 1 = 30/min

  it("computes rate for a single machine with one output edge", () => {
    const nodes: BuilderNodeInfo[] = [
      { id: "n1", recipeClassName: "Recipe_IronIngot_C", machineCount: 1, overclockPercent: 100 },
      { id: "n2", recipeClassName: null, machineCount: 1, overclockPercent: 100 },
    ];
    const edges: BuilderEdgeInfo[] = [
      { id: "e1", sourceNodeId: "n1", targetNodeId: "n2", sourceHandle: "out-Desc_IronIngot_C", targetHandle: "in-Desc_IronIngot_C" },
    ];
    const recipes = new Map([["Recipe_IronIngot_C", recipe]]);

    const result = computeBuilderRates(nodes, edges, recipes, makeItems(), 9);

    expect(result).toHaveLength(1);
    expect(result[0].rate).toBe(30);
    expect(result[0].itemClassName).toBe("Desc_IronIngot_C");
    expect(result[0].itemName).toBe("Iron Ingot");
  });

  it("doubles rate for machineCount=2", () => {
    const nodes: BuilderNodeInfo[] = [
      { id: "n1", recipeClassName: "Recipe_IronIngot_C", machineCount: 2, overclockPercent: 100 },
      { id: "n2", recipeClassName: null, machineCount: 1, overclockPercent: 100 },
    ];
    const edges: BuilderEdgeInfo[] = [
      { id: "e1", sourceNodeId: "n1", targetNodeId: "n2", sourceHandle: "out-Desc_IronIngot_C", targetHandle: "in-Desc_IronIngot_C" },
    ];
    const recipes = new Map([["Recipe_IronIngot_C", recipe]]);

    const result = computeBuilderRates(nodes, edges, recipes, makeItems(), 9);
    expect(result[0].rate).toBe(60);
  });

  it("applies overclock percentage", () => {
    const nodes: BuilderNodeInfo[] = [
      { id: "n1", recipeClassName: "Recipe_IronIngot_C", machineCount: 1, overclockPercent: 200 },
      { id: "n2", recipeClassName: null, machineCount: 1, overclockPercent: 100 },
    ];
    const edges: BuilderEdgeInfo[] = [
      { id: "e1", sourceNodeId: "n1", targetNodeId: "n2", sourceHandle: "out-Desc_IronIngot_C", targetHandle: "in-Desc_IronIngot_C" },
    ];
    const recipes = new Map([["Recipe_IronIngot_C", recipe]]);

    const result = computeBuilderRates(nodes, edges, recipes, makeItems(), 9);
    expect(result[0].rate).toBe(60);
  });

  it("returns rate 0 when source has no recipe", () => {
    const nodes: BuilderNodeInfo[] = [
      { id: "n1", recipeClassName: null, machineCount: 1, overclockPercent: 100 },
      { id: "n2", recipeClassName: null, machineCount: 1, overclockPercent: 100 },
    ];
    const edges: BuilderEdgeInfo[] = [
      { id: "e1", sourceNodeId: "n1", targetNodeId: "n2", sourceHandle: "out-Desc_IronIngot_C", targetHandle: "in-Desc_IronIngot_C" },
    ];

    const result = computeBuilderRates(nodes, edges, new Map(), makeItems(), 9);
    expect(result[0].rate).toBe(0);
  });

  it("assigns correct belt tier", () => {
    const nodes: BuilderNodeInfo[] = [
      { id: "n1", recipeClassName: "Recipe_IronIngot_C", machineCount: 1, overclockPercent: 100 },
      { id: "n2", recipeClassName: null, machineCount: 1, overclockPercent: 100 },
    ];
    const edges: BuilderEdgeInfo[] = [
      { id: "e1", sourceNodeId: "n1", targetNodeId: "n2", sourceHandle: "out-Desc_IronIngot_C", targetHandle: "in-Desc_IronIngot_C" },
    ];
    const recipes = new Map([["Recipe_IronIngot_C", recipe]]);

    const result = computeBuilderRates(nodes, edges, recipes, makeItems(), 9);
    expect(result[0].beltTier).toBe(1); // 30/min ≤ 60
  });

  it("detects over-capacity at low tier", () => {
    // 4 machines → 120/min, tier 0 max belt = 60/min
    const nodes: BuilderNodeInfo[] = [
      { id: "n1", recipeClassName: "Recipe_IronIngot_C", machineCount: 4, overclockPercent: 100 },
      { id: "n2", recipeClassName: null, machineCount: 1, overclockPercent: 100 },
    ];
    const edges: BuilderEdgeInfo[] = [
      { id: "e1", sourceNodeId: "n1", targetNodeId: "n2", sourceHandle: "out-Desc_IronIngot_C", targetHandle: "in-Desc_IronIngot_C" },
    ];
    const recipes = new Map([["Recipe_IronIngot_C", recipe]]);

    const result = computeBuilderRates(nodes, edges, recipes, makeItems(), 0);
    expect(result[0].rate).toBe(120);
    expect(result[0].overCapacity).toBe(true);
  });

  it("splits rate evenly when multiple edges leave same handle", () => {
    const nodes: BuilderNodeInfo[] = [
      { id: "n1", recipeClassName: "Recipe_IronIngot_C", machineCount: 2, overclockPercent: 100 },
      { id: "n2", recipeClassName: null, machineCount: 1, overclockPercent: 100 },
      { id: "n3", recipeClassName: null, machineCount: 1, overclockPercent: 100 },
    ];
    const edges: BuilderEdgeInfo[] = [
      { id: "e1", sourceNodeId: "n1", targetNodeId: "n2", sourceHandle: "out-Desc_IronIngot_C", targetHandle: "in-Desc_IronIngot_C" },
      { id: "e2", sourceNodeId: "n1", targetNodeId: "n3", sourceHandle: "out-Desc_IronIngot_C", targetHandle: "in-Desc_IronIngot_C" },
    ];
    const recipes = new Map([["Recipe_IronIngot_C", recipe]]);

    const result = computeBuilderRates(nodes, edges, recipes, makeItems(), 9);
    // Total = 60, split 2 ways = 30 each
    expect(result[0].rate).toBe(30);
    expect(result[1].rate).toBe(30);
  });

  it("handles empty edges", () => {
    const result = computeBuilderRates([], [], new Map(), new Map(), 9);
    expect(result).toEqual([]);
  });

  it("uses resource node rate as source throughput", () => {
    const nodes: BuilderNodeInfo[] = [
      { id: "n2", recipeClassName: "Recipe_IronIngot_C", machineCount: 1, overclockPercent: 100 },
    ];
    const resourceNodes: BuilderResourceInfo[] = [
      { id: "r1", itemClassName: "Desc_OreIron_C", rate: 120 },
    ];
    const edges: BuilderEdgeInfo[] = [
      { id: "e1", sourceNodeId: "r1", targetNodeId: "n2", sourceHandle: "out-Desc_OreIron_C", targetHandle: "in-Desc_OreIron_C" },
    ];
    const recipes = new Map([["Recipe_IronIngot_C", recipe]]);

    const result = computeBuilderRates(nodes, edges, recipes, makeItems(), 9, resourceNodes);

    expect(result).toHaveLength(1);
    expect(result[0].rate).toBe(120);
    expect(result[0].itemClassName).toBe("Desc_OreIron_C");
    expect(result[0].itemName).toBe("Iron Ore");
    expect(result[0].beltTier).toBe(2); // 120/min → tier 2
  });

  it("splits resource rate when multiple edges leave same handle", () => {
    const resourceNodes: BuilderResourceInfo[] = [
      { id: "r1", itemClassName: "Desc_OreIron_C", rate: 120 },
    ];
    const edges: BuilderEdgeInfo[] = [
      { id: "e1", sourceNodeId: "r1", targetNodeId: "n2", sourceHandle: "out-Desc_OreIron_C", targetHandle: "in-Desc_OreIron_C" },
      { id: "e2", sourceNodeId: "r1", targetNodeId: "n3", sourceHandle: "out-Desc_OreIron_C", targetHandle: "in-Desc_OreIron_C" },
    ];

    const result = computeBuilderRates([], edges, new Map(), makeItems(), 9, resourceNodes);

    expect(result[0].rate).toBe(60);
    expect(result[1].rate).toBe(60);
  });

  it("splitter passes through input rate and splits across outputs", () => {
    // Machine (60/min) → Splitter → 3 outputs (20 each)
    const nodes: BuilderNodeInfo[] = [
      { id: "n1", recipeClassName: "Recipe_IronIngot_C", machineCount: 2, overclockPercent: 100 },
    ];
    const smNodes: BuilderSplitterMergerInfo[] = [
      { id: "s1", kind: "splitter", itemClassName: "Desc_IronIngot_C" },
    ];
    const edges: BuilderEdgeInfo[] = [
      { id: "e1", sourceNodeId: "n1", targetNodeId: "s1", sourceHandle: "out-Desc_IronIngot_C", targetHandle: "bus-in-Desc_IronIngot_C" },
      { id: "e2", sourceNodeId: "s1", targetNodeId: "t1", sourceHandle: "branch-out-Desc_IronIngot_C", targetHandle: "in-Desc_IronIngot_C" },
      { id: "e3", sourceNodeId: "s1", targetNodeId: "t2", sourceHandle: "bus-out-Desc_IronIngot_C", targetHandle: "in-Desc_IronIngot_C" },
      { id: "e4", sourceNodeId: "s1", targetNodeId: "t3", sourceHandle: "branch-out-left-Desc_IronIngot_C", targetHandle: "in-Desc_IronIngot_C" },
    ];
    const recipes = new Map([["Recipe_IronIngot_C", recipe]]);

    const result = computeBuilderRates(nodes, edges, recipes, makeItems(), 9, [], smNodes);

    expect(result[0].rate).toBe(60); // input edge: full 60
    expect(result[1].rate).toBe(20); // branch-out: 60/3
    expect(result[2].rate).toBe(20); // bus-out: 60/3
    expect(result[3].rate).toBe(20); // branch-out-left: 60/3
  });

  it("merger sums input rates to single output", () => {
    // 2 machines → Merger → single output
    const nodes: BuilderNodeInfo[] = [
      { id: "n1", recipeClassName: "Recipe_IronIngot_C", machineCount: 1, overclockPercent: 100 },
      { id: "n2", recipeClassName: "Recipe_IronIngot_C", machineCount: 1, overclockPercent: 100 },
    ];
    const smNodes: BuilderSplitterMergerInfo[] = [
      { id: "m1", kind: "merger", itemClassName: "Desc_IronIngot_C" },
    ];
    const edges: BuilderEdgeInfo[] = [
      { id: "e1", sourceNodeId: "n1", targetNodeId: "m1", sourceHandle: "out-Desc_IronIngot_C", targetHandle: "branch-in-Desc_IronIngot_C" },
      { id: "e2", sourceNodeId: "n2", targetNodeId: "m1", sourceHandle: "out-Desc_IronIngot_C", targetHandle: "bus-in-Desc_IronIngot_C" },
      { id: "e3", sourceNodeId: "m1", targetNodeId: "t1", sourceHandle: "bus-out-Desc_IronIngot_C", targetHandle: "in-Desc_IronIngot_C" },
    ];
    const recipes = new Map([["Recipe_IronIngot_C", recipe]]);

    const result = computeBuilderRates(nodes, edges, recipes, makeItems(), 9, [], smNodes);

    expect(result[0].rate).toBe(30); // input edge 1
    expect(result[1].rate).toBe(30); // input edge 2
    expect(result[2].rate).toBe(60); // merged output: 30+30
  });

  it("chained splitter→merger passes through correctly", () => {
    // Resource(120) → Splitter → 2 outputs (60 each) → one goes to Merger
    // Merger also gets Machine(30) → output = 90
    const nodes: BuilderNodeInfo[] = [
      { id: "n1", recipeClassName: "Recipe_IronIngot_C", machineCount: 1, overclockPercent: 100 },
    ];
    const resourceNodes: BuilderResourceInfo[] = [
      { id: "r1", itemClassName: "Desc_IronIngot_C", rate: 120 },
    ];
    const smNodes: BuilderSplitterMergerInfo[] = [
      { id: "s1", kind: "splitter", itemClassName: "Desc_IronIngot_C" },
      { id: "m1", kind: "merger", itemClassName: "Desc_IronIngot_C" },
    ];
    const edges: BuilderEdgeInfo[] = [
      // Resource → Splitter
      { id: "e1", sourceNodeId: "r1", targetNodeId: "s1", sourceHandle: "out-Desc_IronIngot_C", targetHandle: "bus-in-Desc_IronIngot_C" },
      // Splitter → branch out (60)
      { id: "e2", sourceNodeId: "s1", targetNodeId: "t1", sourceHandle: "branch-out-Desc_IronIngot_C", targetHandle: "in-Desc_IronIngot_C" },
      // Splitter → bus out → Merger (60)
      { id: "e3", sourceNodeId: "s1", targetNodeId: "m1", sourceHandle: "bus-out-Desc_IronIngot_C", targetHandle: "bus-in-Desc_IronIngot_C" },
      // Machine → Merger (30)
      { id: "e4", sourceNodeId: "n1", targetNodeId: "m1", sourceHandle: "out-Desc_IronIngot_C", targetHandle: "branch-in-Desc_IronIngot_C" },
      // Merger → output (90)
      { id: "e5", sourceNodeId: "m1", targetNodeId: "t2", sourceHandle: "bus-out-Desc_IronIngot_C", targetHandle: "in-Desc_IronIngot_C" },
    ];
    const recipes = new Map([["Recipe_IronIngot_C", recipe]]);

    const result = computeBuilderRates(nodes, edges, recipes, makeItems(), 9, resourceNodes, smNodes);

    expect(result[0].rate).toBe(120); // resource → splitter
    expect(result[1].rate).toBe(60);  // splitter branch
    expect(result[2].rate).toBe(60);  // splitter bus → merger
    expect(result[3].rate).toBe(30);  // machine → merger
    expect(result[4].rate).toBe(90);  // merger output: 60+30
  });
});

describe("computeMachineItemRates", () => {
  it("computes correct rates for a smelter (Iron Ingot)", () => {
    // Iron Ingot: 1 ore in, 1 ingot out, 2s cycle → 30/min per machine
    const smelterRecipe = makeRecipe();
    const { inputs, outputs } = computeMachineItemRates(smelterRecipe, 1, 100);
    expect(inputs).toEqual([{ itemClassName: "Desc_OreIron_C", ratePerMin: 30 }]);
    expect(outputs).toEqual([{ itemClassName: "Desc_IronIngot_C", ratePerMin: 30 }]);
  });

  it("scales rates with machine count", () => {
    const smelterRecipe = makeRecipe();
    const { inputs, outputs } = computeMachineItemRates(smelterRecipe, 3, 100);
    expect(inputs[0].ratePerMin).toBe(90);
    expect(outputs[0].ratePerMin).toBe(90);
  });

  it("scales rates with overclock", () => {
    const smelterRecipe = makeRecipe();
    const { inputs, outputs } = computeMachineItemRates(smelterRecipe, 1, 200);
    expect(inputs[0].ratePerMin).toBe(60);
    expect(outputs[0].ratePerMin).toBe(60);
  });

  it("handles multi-input/output recipes", () => {
    const assemblerRecipe = makeRecipe({
      className: "Recipe_ModularFrame_C",
      timeSeconds: 60,
      ingredients: [
        { recipeClassName: "Recipe_ModularFrame_C", itemClassName: "Desc_IronRod_C", amountPerCycle: 12 },
        { recipeClassName: "Recipe_ModularFrame_C", itemClassName: "Desc_IronPlate_C", amountPerCycle: 6 },
      ],
      products: [
        { recipeClassName: "Recipe_ModularFrame_C", itemClassName: "Desc_ModularFrame_C", amountPerCycle: 2 },
      ],
    });
    const { inputs, outputs } = computeMachineItemRates(assemblerRecipe, 1, 100);
    expect(inputs).toEqual([
      { itemClassName: "Desc_IronRod_C", ratePerMin: 12 },
      { itemClassName: "Desc_IronPlate_C", ratePerMin: 6 },
    ]);
    expect(outputs).toEqual([
      { itemClassName: "Desc_ModularFrame_C", ratePerMin: 2 },
    ]);
  });
});
