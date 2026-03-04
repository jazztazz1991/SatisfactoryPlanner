import { describe, it, expect } from "vitest";
import { getBeltTier, solverOutputToFactoryGraph } from "./factoryLayout";
import type { ISolverOutput } from "@/domain/types/solver";

describe("getBeltTier", () => {
  it("returns tier 1 for rate <= 60", () => {
    expect(getBeltTier(1)).toBe(1);
    expect(getBeltTier(60)).toBe(1);
  });

  it("returns tier 2 for rate 61–120", () => {
    expect(getBeltTier(61)).toBe(2);
    expect(getBeltTier(120)).toBe(2);
  });

  it("returns tier 3 for rate 121–270", () => {
    expect(getBeltTier(121)).toBe(3);
    expect(getBeltTier(270)).toBe(3);
  });

  it("returns tier 4 for rate 271–480", () => {
    expect(getBeltTier(271)).toBe(4);
    expect(getBeltTier(480)).toBe(4);
  });

  it("returns tier 5 for rate > 480", () => {
    expect(getBeltTier(481)).toBe(5);
    expect(getBeltTier(780)).toBe(5);
  });
});

describe("solverOutputToFactoryGraph", () => {
  it("single-step chain: no splitter, one direct belt edge", () => {
    const result: ISolverOutput = {
      steps: [
        {
          recipeClassName: "Recipe_IronIngot_C",
          recipeName: "Iron Ingot",
          buildingClassName: "Desc_Smelter_C",
          buildingName: "Smelter",
          machineCount: 1,
          powerUsageKW: 4,
          inputs: [{ itemClassName: "Desc_OreIron_C", itemName: "Iron Ore", rate: 30 }],
          outputs: [{ itemClassName: "Desc_IronIngot_C", itemName: "Iron Ingot", rate: 30 }],
        },
      ],
      rawResources: [{ itemClassName: "Desc_OreIron_C", itemName: "Iron Ore", rate: 30 }],
      totalPowerKW: 4,
    };

    const { nodes, edges } = solverOutputToFactoryGraph(result);

    const splitterNodes = nodes.filter((n) => n.type === "splitter");
    expect(splitterNodes).toHaveLength(0);

    const beltEdges = edges.filter((e) => e.type === "belt");
    expect(beltEdges).toHaveLength(1);
    expect(beltEdges[0].source).toBe("factory-raw-Desc_OreIron_C");
    expect(beltEdges[0].target).toBe("factory-step-Recipe_IronIngot_C");
  });

  it("two steps sharing ingredient: one splitter inserted with two belt edges from splitter", () => {
    const result: ISolverOutput = {
      steps: [
        {
          recipeClassName: "Recipe_IronIngot_C",
          recipeName: "Iron Ingot",
          buildingClassName: "Desc_Smelter_C",
          buildingName: "Smelter",
          machineCount: 2,
          powerUsageKW: 8,
          inputs: [{ itemClassName: "Desc_OreIron_C", itemName: "Iron Ore", rate: 60 }],
          outputs: [{ itemClassName: "Desc_IronIngot_C", itemName: "Iron Ingot", rate: 60 }],
        },
        {
          recipeClassName: "Recipe_IronPlate_C",
          recipeName: "Iron Plate",
          buildingClassName: "Desc_Constructor_C",
          buildingName: "Constructor",
          machineCount: 1,
          powerUsageKW: 4,
          inputs: [{ itemClassName: "Desc_IronIngot_C", itemName: "Iron Ingot", rate: 30 }],
          outputs: [{ itemClassName: "Desc_IronPlate_C", itemName: "Iron Plate", rate: 20 }],
        },
        {
          recipeClassName: "Recipe_IronRod_C",
          recipeName: "Iron Rod",
          buildingClassName: "Desc_Constructor_C",
          buildingName: "Constructor",
          machineCount: 1,
          powerUsageKW: 4,
          inputs: [{ itemClassName: "Desc_IronIngot_C", itemName: "Iron Ingot", rate: 30 }],
          outputs: [{ itemClassName: "Desc_IronRod_C", itemName: "Iron Rod", rate: 15 }],
        },
      ],
      rawResources: [{ itemClassName: "Desc_OreIron_C", itemName: "Iron Ore", rate: 60 }],
      totalPowerKW: 16,
    };

    const { nodes, edges } = solverOutputToFactoryGraph(result);

    const splitterNodes = nodes.filter((n) => n.type === "splitter");
    expect(splitterNodes).toHaveLength(1);
    expect(splitterNodes[0].id).toBe("factory-split-Desc_IronIngot_C");

    const toSplitter = edges.filter((e) => e.target === "factory-split-Desc_IronIngot_C");
    expect(toSplitter).toHaveLength(1);
    expect(toSplitter[0].source).toBe("factory-step-Recipe_IronIngot_C");

    const fromSplitter = edges.filter((e) => e.source === "factory-split-Desc_IronIngot_C");
    expect(fromSplitter).toHaveLength(2);
    const targets = fromSplitter.map((e) => e.target).sort();
    expect(targets).toContain("factory-step-Recipe_IronPlate_C");
    expect(targets).toContain("factory-step-Recipe_IronRod_C");
  });

  it("raw resource feeding two steps: splitter inserted after raw resource node", () => {
    const result: ISolverOutput = {
      steps: [
        {
          recipeClassName: "Recipe_IronIngot_C",
          recipeName: "Iron Ingot",
          buildingClassName: "Desc_Smelter_C",
          buildingName: "Smelter",
          machineCount: 1,
          powerUsageKW: 4,
          inputs: [{ itemClassName: "Desc_OreIron_C", itemName: "Iron Ore", rate: 30 }],
          outputs: [{ itemClassName: "Desc_IronIngot_C", itemName: "Iron Ingot", rate: 30 }],
        },
        {
          recipeClassName: "Recipe_IronPlate_C",
          recipeName: "Iron Plate",
          buildingClassName: "Desc_Constructor_C",
          buildingName: "Constructor",
          machineCount: 1,
          powerUsageKW: 4,
          inputs: [{ itemClassName: "Desc_OreIron_C", itemName: "Iron Ore", rate: 30 }],
          outputs: [{ itemClassName: "Desc_IronPlate_C", itemName: "Iron Plate", rate: 20 }],
        },
      ],
      rawResources: [{ itemClassName: "Desc_OreIron_C", itemName: "Iron Ore", rate: 60 }],
      totalPowerKW: 8,
    };

    const { nodes, edges } = solverOutputToFactoryGraph(result);

    const splitterNodes = nodes.filter((n) => n.type === "splitter");
    expect(splitterNodes).toHaveLength(1);
    expect(splitterNodes[0].id).toBe("factory-split-Desc_OreIron_C");

    const toSplitter = edges.filter((e) => e.target === "factory-split-Desc_OreIron_C");
    expect(toSplitter).toHaveLength(1);
    expect(toSplitter[0].source).toBe("factory-raw-Desc_OreIron_C");

    const fromSplitter = edges.filter((e) => e.source === "factory-split-Desc_OreIron_C");
    expect(fromSplitter).toHaveLength(2);
  });

  it("machine count is Math.ceil(machineCount) in node data", () => {
    const result: ISolverOutput = {
      steps: [
        {
          recipeClassName: "Recipe_IronIngot_C",
          recipeName: "Iron Ingot",
          buildingClassName: "Desc_Smelter_C",
          buildingName: "Smelter",
          machineCount: 2.5,
          powerUsageKW: 10,
          inputs: [],
          outputs: [{ itemClassName: "Desc_IronIngot_C", itemName: "Iron Ingot", rate: 30 }],
        },
      ],
      rawResources: [],
      totalPowerKW: 10,
    };

    const { nodes } = solverOutputToFactoryGraph(result);

    const stepNode = nodes.find((n) => n.id === "factory-step-Recipe_IronIngot_C");
    expect(stepNode).toBeDefined();
    expect((stepNode!.data as { machineCount: number }).machineCount).toBe(3);
  });
});
