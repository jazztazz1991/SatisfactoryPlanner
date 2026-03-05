import { describe, it, expect } from "vitest";
import {
  createSplitterManifold,
  createMergerManifold,
  buildItemFlowMap,
  CELL_PX,
} from "./manifoldLayout";
import type { IProductionStep, IRawResourceRequirement } from "@/domain/types/solver";

describe("createSplitterManifold", () => {
  it("creates N splitter nodes for N consumers", () => {
    const result = createSplitterManifold({
      consumerIds: ["m1", "m2", "m3"],
      busX: 0,
      machineYPositions: [0, 96, 192],
      itemClassName: "Desc_IronIngot_C",
      itemName: "Iron Ingot",
      totalRate: 90,
      sourceNodeId: "src-1",
      sourceHandleId: "out-Desc_IronIngot_C",
      splitterIdStart: 0,
    });

    const splitters = result.nodes.filter((n) => n.type === "splitterMerger");
    expect(splitters).toHaveLength(3);
  });

  it("creates bus chain edges between splitters (N-1 bus edges)", () => {
    const result = createSplitterManifold({
      consumerIds: ["m1", "m2", "m3"],
      busX: 0,
      machineYPositions: [0, 96, 192],
      itemClassName: "Desc_IronIngot_C",
      itemName: "Iron Ingot",
      totalRate: 90,
      sourceNodeId: "src-1",
      sourceHandleId: "out-Desc_IronIngot_C",
      splitterIdStart: 0,
    });

    // 1 source→S1 edge + 2 bus edges (S1→S2, S2→S3) + 3 branch edges = 6 total
    const busEdges = result.edges.filter((e) =>
      e.sourceHandle?.startsWith("bus-out-") && e.targetHandle?.startsWith("bus-in-")
    );
    expect(busEdges).toHaveLength(2);
  });

  it("creates N branch edges (splitter→machine)", () => {
    const result = createSplitterManifold({
      consumerIds: ["m1", "m2", "m3"],
      busX: 0,
      machineYPositions: [0, 96, 192],
      itemClassName: "Desc_IronIngot_C",
      itemName: "Iron Ingot",
      totalRate: 90,
      sourceNodeId: "src-1",
      sourceHandleId: "out-Desc_IronIngot_C",
      splitterIdStart: 0,
    });

    const branchEdges = result.edges.filter((e) =>
      e.sourceHandle?.startsWith("branch-out-")
    );
    expect(branchEdges).toHaveLength(3);
    expect(branchEdges[0].target).toBe("m1");
    expect(branchEdges[1].target).toBe("m2");
    expect(branchEdges[2].target).toBe("m3");
  });

  it("creates 1 source→S1 edge", () => {
    const result = createSplitterManifold({
      consumerIds: ["m1", "m2"],
      busX: 0,
      machineYPositions: [0, 96],
      itemClassName: "Desc_IronIngot_C",
      itemName: "Iron Ingot",
      totalRate: 60,
      sourceNodeId: "src-1",
      sourceHandleId: "out-Desc_IronIngot_C",
      splitterIdStart: 0,
    });

    const sourceEdge = result.edges.find((e) => e.source === "src-1");
    expect(sourceEdge).toBeDefined();
    expect(sourceEdge!.target).toBe("bp-splitter-0");
  });

  it("bus rates decrease along the chain", () => {
    const result = createSplitterManifold({
      consumerIds: ["m1", "m2", "m3"],
      busX: 0,
      machineYPositions: [0, 96, 192],
      itemClassName: "Desc_IronIngot_C",
      itemName: "Iron Ingot",
      totalRate: 90,
      sourceNodeId: "src-1",
      sourceHandleId: "out-Desc_IronIngot_C",
      splitterIdStart: 0,
    });

    // Source→S1 carries full rate (90)
    const sourceEdge = result.edges.find((e) => e.source === "src-1");
    expect((sourceEdge!.data as { rate: number }).rate).toBe(90);

    // S1→S2 carries 60 (90 - 30)
    const busEdges = result.edges.filter((e) =>
      e.sourceHandle?.startsWith("bus-out-") && e.targetHandle?.startsWith("bus-in-")
    );
    expect((busEdges[0].data as { rate: number }).rate).toBe(60);
    // S2→S3 carries 30 (90 - 60)
    expect((busEdges[1].data as { rate: number }).rate).toBe(30);
  });

  it("branch rates are equal (totalRate / N)", () => {
    const result = createSplitterManifold({
      consumerIds: ["m1", "m2", "m3"],
      busX: 0,
      machineYPositions: [0, 96, 192],
      itemClassName: "Desc_IronIngot_C",
      itemName: "Iron Ingot",
      totalRate: 90,
      sourceNodeId: "src-1",
      sourceHandleId: "out-Desc_IronIngot_C",
      splitterIdStart: 0,
    });

    const branchEdges = result.edges.filter((e) =>
      e.sourceHandle?.startsWith("branch-out-")
    );
    for (const edge of branchEdges) {
      expect((edge.data as { rate: number }).rate).toBe(30);
    }
  });

  it("splitter positions are at busX and aligned with machine Y positions", () => {
    const result = createSplitterManifold({
      consumerIds: ["m1", "m2"],
      busX: 48,
      machineYPositions: [0, 144],
      itemClassName: "Desc_IronIngot_C",
      itemName: "Iron Ingot",
      totalRate: 60,
      sourceNodeId: "src-1",
      sourceHandleId: "out-Desc_IronIngot_C",
      splitterIdStart: 0,
    });

    const splitters = result.nodes;
    expect(splitters[0].position.x).toBe(48);
    expect(splitters[0].position.y).toBe(0);
    expect(splitters[1].position.x).toBe(48);
    expect(splitters[1].position.y).toBe(144);
  });
});

describe("createMergerManifold", () => {
  it("creates N merger nodes for N producers", () => {
    const result = createMergerManifold({
      producerIds: ["m1", "m2"],
      busX: 200,
      machineYPositions: [0, 96],
      itemClassName: "Desc_IronIngot_C",
      itemName: "Iron Ingot",
      totalRate: 60,
      targetNodeId: "consumer-1",
      targetHandleId: "in-Desc_IronIngot_C",
      mergerIdStart: 0,
    });

    const mergers = result.nodes.filter((n) => n.type === "splitterMerger");
    expect(mergers).toHaveLength(2);
  });

  it("creates N branch edges (machine→merger) and bus chain", () => {
    const result = createMergerManifold({
      producerIds: ["m1", "m2", "m3"],
      busX: 200,
      machineYPositions: [0, 96, 192],
      itemClassName: "Desc_IronIngot_C",
      itemName: "Iron Ingot",
      totalRate: 90,
      targetNodeId: "consumer-1",
      targetHandleId: "in-Desc_IronIngot_C",
      mergerIdStart: 0,
    });

    const branchEdges = result.edges.filter((e) =>
      e.targetHandle?.startsWith("branch-in-")
    );
    expect(branchEdges).toHaveLength(3);

    // Bus chain: M1→M2, M2→M3
    const busEdges = result.edges.filter((e) =>
      e.sourceHandle?.startsWith("bus-out-") && e.targetHandle?.startsWith("bus-in-")
    );
    expect(busEdges).toHaveLength(2);

    // Last merger → target
    const outputEdge = result.edges.find((e) => e.target === "consumer-1");
    expect(outputEdge).toBeDefined();
  });

  it("bus rates increase along the merger chain", () => {
    const result = createMergerManifold({
      producerIds: ["m1", "m2", "m3"],
      busX: 200,
      machineYPositions: [0, 96, 192],
      itemClassName: "Desc_IronIngot_C",
      itemName: "Iron Ingot",
      totalRate: 90,
      targetNodeId: "consumer-1",
      targetHandleId: "in-Desc_IronIngot_C",
      mergerIdStart: 0,
    });

    // M1→M2 carries 30 (1 machine's worth), M2→M3 carries 60 (2 machines' worth)
    const busEdges = result.edges.filter((e) =>
      e.sourceHandle?.startsWith("bus-out-") && e.targetHandle?.startsWith("bus-in-")
    );
    expect((busEdges[0].data as { rate: number }).rate).toBe(30);
    expect((busEdges[1].data as { rate: number }).rate).toBe(60);
  });
});

describe("buildItemFlowMap", () => {
  const steps: IProductionStep[] = [
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
      machineCount: 1,
      powerUsageKW: 4,
      inputs: [{ itemClassName: "Desc_IronIngot_C", itemName: "Iron Ingot", rate: 30 }],
      outputs: [{ itemClassName: "Desc_IronPlate_C", itemName: "Iron Plate", rate: 20 }],
    },
    {
      recipeClassName: "Recipe_IronRod_C",
      recipeName: "Iron Rod",
      buildingClassName: "Desc_ConstructorMk1_C",
      buildingName: "Constructor",
      machineCount: 1,
      powerUsageKW: 4,
      inputs: [{ itemClassName: "Desc_IronIngot_C", itemName: "Iron Ingot", rate: 30 }],
      outputs: [{ itemClassName: "Desc_IronRod_C", itemName: "Iron Rod", rate: 15 }],
    },
  ];

  const rawResources: IRawResourceRequirement[] = [
    { itemClassName: "Desc_OreIron_C", itemName: "Iron Ore", rate: 60 },
  ];

  const stepMachineIds = new Map<string, string[]>([
    ["Recipe_IronIngot_C", ["bp-Recipe_IronIngot_C-0", "bp-Recipe_IronIngot_C-1"]],
    ["Recipe_IronPlate_C", ["bp-Recipe_IronPlate_C-0"]],
    ["Recipe_IronRod_C", ["bp-Recipe_IronRod_C-0"]],
  ]);

  const rawNodeIds = new Map<string, string>([
    ["Desc_OreIron_C", "bp-raw-Desc_OreIron_C"],
  ]);

  it("groups producers and consumers for each item", () => {
    const flowMap = buildItemFlowMap(steps, rawResources, stepMachineIds, rawNodeIds);

    // Iron Ingot: produced by smelter step, consumed by plate + rod steps
    const ingotFlow = flowMap.get("Desc_IronIngot_C")!;
    expect(ingotFlow).toBeDefined();
    expect(ingotFlow.producerNodeIds).toEqual(["bp-Recipe_IronIngot_C-0", "bp-Recipe_IronIngot_C-1"]);
    expect(ingotFlow.consumers).toHaveLength(2);
  });

  it("handles raw resources as producers", () => {
    const flowMap = buildItemFlowMap(steps, rawResources, stepMachineIds, rawNodeIds);

    // Iron Ore: raw resource, consumed by smelter step
    const oreFlow = flowMap.get("Desc_OreIron_C")!;
    expect(oreFlow).toBeDefined();
    expect(oreFlow.producerNodeIds).toEqual(["bp-raw-Desc_OreIron_C"]);
    expect(oreFlow.consumers).toHaveLength(1);
    expect(oreFlow.consumers[0].recipeClassName).toBe("Recipe_IronIngot_C");
  });
});
