import { describe, it, expect } from "vitest";
import { getBeltTier, solverOutputToBlueprintFlow, CELL_PX } from "./factoryLayout";
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

const SINGLE_STEP: ISolverOutput = {
  steps: [
    {
      recipeClassName: "Recipe_IronIngot_C",
      recipeName: "Iron Ingot",
      buildingClassName: "Desc_SmelterMk1_C",
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

describe("solverOutputToBlueprintFlow", () => {
  it("creates individual machine nodes (ceil of machineCount)", () => {
    const result: ISolverOutput = {
      ...SINGLE_STEP,
      steps: [{ ...SINGLE_STEP.steps[0], machineCount: 2.5 }],
    };

    const { nodes } = solverOutputToBlueprintFlow(result);
    const machines = nodes.filter((n) => n.type === "blueprintMachine");
    expect(machines).toHaveLength(3); // ceil(2.5) = 3
  });

  it("machine IDs follow bp-{recipe}-{index} pattern", () => {
    const { nodes } = solverOutputToBlueprintFlow(SINGLE_STEP);
    const machine = nodes.find((n) => n.type === "blueprintMachine");
    expect(machine?.id).toBe("bp-Recipe_IronIngot_C-0");
  });

  it("node data includes building footprint dimensions", () => {
    const { nodes } = solverOutputToBlueprintFlow(SINGLE_STEP);
    const machine = nodes.find((n) => n.type === "blueprintMachine")!;
    const data = machine.data as { widthPx: number; depthPx: number };
    // Smelter = 1×2 foundations
    expect(data.widthPx).toBe(1 * CELL_PX);
    expect(data.depthPx).toBe(2 * CELL_PX);
  });

  it("node data includes spriteKey, inputItems, outputItems", () => {
    const { nodes } = solverOutputToBlueprintFlow(SINGLE_STEP);
    const machine = nodes.find((n) => n.type === "blueprintMachine")!;
    const data = machine.data as { spriteKey: string; inputItems: string[]; outputItems: string[] };
    expect(data.spriteKey).toBe("smelter");
    expect(data.inputItems).toEqual(["Desc_OreIron_C"]);
    expect(data.outputItems).toEqual(["Desc_IronIngot_C"]);
  });

  it("positions are snapped to CELL_PX grid", () => {
    const { nodes } = solverOutputToBlueprintFlow(SINGLE_STEP);
    for (const node of nodes) {
      expect(Math.abs(node.position.x % CELL_PX)).toBe(0);
      expect(Math.abs(node.position.y % CELL_PX)).toBe(0);
    }
  });

  it("raw resources are positioned left of depth 0 machines", () => {
    const { nodes } = solverOutputToBlueprintFlow(SINGLE_STEP);
    const raw = nodes.find((n) => n.id === "bp-raw-Desc_OreIron_C")!;
    const machine = nodes.find((n) => n.type === "blueprintMachine")!;
    expect(raw.position.x).toBeLessThan(machine.position.x);
  });

  it("left-to-right layout: deeper steps have larger X", () => {
    const result: ISolverOutput = {
      steps: [
        {
          recipeClassName: "Recipe_IronIngot_C",
          recipeName: "Iron Ingot",
          buildingClassName: "Desc_SmelterMk1_C",
          buildingName: "Smelter",
          machineCount: 1,
          powerUsageKW: 4,
          inputs: [{ itemClassName: "Desc_OreIron_C", itemName: "Iron Ore", rate: 30 }],
          outputs: [{ itemClassName: "Desc_IronIngot_C", itemName: "Iron Ingot", rate: 30 }],
        },
        {
          recipeClassName: "Recipe_IronPlate_C",
          recipeName: "Iron Plate",
          buildingClassName: "Desc_ConstructorMk1_C",
          buildingName: "Constructor",
          machineCount: 1,
          powerUsageKW: 4,
          inputs: [{ itemClassName: "Desc_IronIngot_C", itemName: "Iron Ingot", rate: 30 }],
          outputs: [{ itemClassName: "Desc_IronPlate_C", itemName: "Iron Plate", rate: 20 }],
        },
      ],
      rawResources: [{ itemClassName: "Desc_OreIron_C", itemName: "Iron Ore", rate: 30 }],
      totalPowerKW: 8,
    };

    const { nodes } = solverOutputToBlueprintFlow(result);
    const ingot = nodes.find((n) => n.id === "bp-Recipe_IronIngot_C-0")!;
    const plate = nodes.find((n) => n.id === "bp-Recipe_IronPlate_C-0")!;
    expect(plate.position.x).toBeGreaterThan(ingot.position.x);
  });

  it("creates splitter node when multiple producers feed multiple consumers", () => {
    const result: ISolverOutput = {
      steps: [
        {
          recipeClassName: "Recipe_IronIngot_C",
          recipeName: "Iron Ingot",
          buildingClassName: "Desc_SmelterMk1_C",
          buildingName: "Smelter",
          machineCount: 2,
          powerUsageKW: 8,
          inputs: [{ itemClassName: "Desc_OreIron_C", itemName: "Iron Ore", rate: 60 }],
          outputs: [{ itemClassName: "Desc_IronIngot_C", itemName: "Iron Ingot", rate: 60 }],
        },
        {
          recipeClassName: "Recipe_IronPlate_C",
          recipeName: "Iron Plate",
          buildingClassName: "Desc_ConstructorMk1_C",
          buildingName: "Constructor",
          machineCount: 2,
          powerUsageKW: 8,
          inputs: [{ itemClassName: "Desc_IronIngot_C", itemName: "Iron Ingot", rate: 60 }],
          outputs: [{ itemClassName: "Desc_IronPlate_C", itemName: "Iron Plate", rate: 40 }],
        },
      ],
      rawResources: [{ itemClassName: "Desc_OreIron_C", itemName: "Iron Ore", rate: 60 }],
      totalPowerKW: 16,
    };

    const { nodes, edges } = solverOutputToBlueprintFlow(result);

    // Should create a splitter node for the fan-out/fan-in
    const splitters = nodes.filter((n) => n.type === "splitterMerger");
    expect(splitters.length).toBeGreaterThanOrEqual(1);

    // Edges should route through splitter: producers → splitter → consumers
    const toSplitter = edges.filter((e) => e.target === splitters[0].id);
    const fromSplitter = edges.filter((e) => e.source === splitters[0].id);
    expect(toSplitter.length).toBeGreaterThan(0);
    expect(fromSplitter.length).toBeGreaterThan(0);
  });

  it("uses direct 1:1 edges when producer and consumer counts match", () => {
    // 1 producer → 1 consumer = direct edge, no splitter
    const { nodes, edges } = solverOutputToBlueprintFlow(SINGLE_STEP);
    const splitters = nodes.filter((n) => n.type === "splitterMerger");
    expect(splitters).toHaveLength(0);

    const ingotEdges = edges.filter(
      (e) => e.sourceHandle === "out-Desc_IronIngot_C" && e.targetHandle === "in-Desc_IronIngot_C"
    );
    // No consumer for iron ingot in SINGLE_STEP, so no edges for that item
    // But raw→smelter edge should exist
    const rawEdges = edges.filter((e) => e.source === "bp-raw-Desc_OreIron_C");
    expect(rawEdges).toHaveLength(1);
  });

  it("resource nodes use factoryResource type", () => {
    const { nodes } = solverOutputToBlueprintFlow(SINGLE_STEP);
    const resources = nodes.filter((n) => n.type === "factoryResource");
    expect(resources).toHaveLength(1);
    expect(resources[0].id).toBe("bp-raw-Desc_OreIron_C");
  });

  it("creates manifold chain for multi-machine steps", () => {
    const result: ISolverOutput = {
      steps: [
        {
          recipeClassName: "Recipe_IronIngot_C",
          recipeName: "Iron Ingot",
          buildingClassName: "Desc_SmelterMk1_C",
          buildingName: "Smelter",
          machineCount: 2,
          powerUsageKW: 8,
          inputs: [{ itemClassName: "Desc_OreIron_C", itemName: "Iron Ore", rate: 60 }],
          outputs: [{ itemClassName: "Desc_IronIngot_C", itemName: "Iron Ingot", rate: 60 }],
        },
        {
          recipeClassName: "Recipe_IronPlate_C",
          recipeName: "Iron Plate",
          buildingClassName: "Desc_ConstructorMk1_C",
          buildingName: "Constructor",
          machineCount: 2,
          powerUsageKW: 8,
          inputs: [{ itemClassName: "Desc_IronIngot_C", itemName: "Iron Ingot", rate: 60 }],
          outputs: [{ itemClassName: "Desc_IronPlate_C", itemName: "Iron Plate", rate: 40 }],
        },
      ],
      rawResources: [{ itemClassName: "Desc_OreIron_C", itemName: "Iron Ore", rate: 60 }],
      totalPowerKW: 16,
    };

    const { nodes, edges } = solverOutputToBlueprintFlow(result);

    // Should create splitter/merger nodes for multi-machine steps
    const splitterMergers = nodes.filter((n) => n.type === "splitterMerger");
    expect(splitterMergers.length).toBeGreaterThanOrEqual(2);

    // Bus chain edges should exist (chaining splitters/mergers together)
    const busEdges = edges.filter((e) =>
      (e.sourceHandle?.startsWith("bus-out-") && e.targetHandle?.startsWith("bus-in-"))
    );
    expect(busEdges.length).toBeGreaterThan(0);

    // Branch edges should exist (splitter→machine or machine→merger)
    const branchEdges = edges.filter((e) =>
      e.sourceHandle?.startsWith("branch-out-") || e.targetHandle?.startsWith("branch-in-")
    );
    expect(branchEdges.length).toBeGreaterThan(0);
  });

  it("machines are stacked vertically (same X, increasing Y)", () => {
    const result: ISolverOutput = {
      ...SINGLE_STEP,
      steps: [{ ...SINGLE_STEP.steps[0], machineCount: 3 }],
    };

    const { nodes } = solverOutputToBlueprintFlow(result);
    const machines = nodes
      .filter((n) => n.type === "blueprintMachine")
      .sort((a, b) => a.position.y - b.position.y);

    expect(machines).toHaveLength(3);
    // All same X
    expect(machines[0].position.x).toBe(machines[1].position.x);
    expect(machines[1].position.x).toBe(machines[2].position.x);
    // Increasing Y
    expect(machines[1].position.y).toBeGreaterThan(machines[0].position.y);
    expect(machines[2].position.y).toBeGreaterThan(machines[1].position.y);
  });

  it("edges include laneIndex and laneCount in data", () => {
    const { edges } = solverOutputToBlueprintFlow(SINGLE_STEP);
    for (const edge of edges) {
      const data = edge.data as { laneIndex: number; laneCount: number };
      expect(data.laneIndex).toBeGreaterThanOrEqual(0);
      expect(data.laneCount).toBeGreaterThanOrEqual(1);
    }
  });
});
