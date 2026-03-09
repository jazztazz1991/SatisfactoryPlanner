import { describe, it, expect } from "vitest";
import type { Node, Edge } from "@xyflow/react";
import {
  assignFloors,
  DEFAULT_FLOOR_CONFIG,
  type FloorConfig,
  type LiftNodeData,
} from "./floorAssignment";

const CELL_PX = 48;

/** Helper: create a machine node at a given position. */
function machineNode(id: string, x: number, y: number, recipe = "Recipe_A"): Node {
  return {
    id,
    type: "blueprintMachine",
    position: { x: x * CELL_PX, y: y * CELL_PX },
    data: {
      buildingName: "Smelter",
      recipeName: recipe,
      spriteKey: "smelter",
      widthPx: CELL_PX,
      depthPx: 2 * CELL_PX,
      inputItems: ["Desc_OreIron_C"],
      outputItems: ["Desc_IronIngot_C"],
    },
  };
}

/** Helper: create a resource node at a given position. */
function resourceNode(id: string, x: number, y: number): Node {
  return {
    id,
    type: "factoryResource",
    position: { x: x * CELL_PX, y: y * CELL_PX },
    data: { itemClassName: "Desc_OreIron_C", itemName: "Iron Ore", rate: 60 },
  };
}

/** Helper: create a splitter/merger node. */
function splitterNode(id: string, x: number, y: number, kind: "splitter" | "merger" = "splitter"): Node {
  return {
    id,
    type: "splitterMerger",
    position: { x: x * CELL_PX, y: y * CELL_PX },
    data: { kind, itemClassName: "Desc_IronIngot_C" },
  };
}

/** Helper: create a belt edge. */
function beltEdge(id: string, source: string, target: string, sourceHandle?: string, targetHandle?: string): Edge {
  return {
    id,
    source,
    target,
    sourceHandle,
    targetHandle,
    type: "belt",
    data: { itemName: "Iron Ingot", rate: 30, beltTier: 1, laneIndex: 0, laneCount: 1 },
  };
}

describe("assignFloors", () => {
  it("returns single floor when all nodes fit within floor depth", () => {
    const nodes: Node[] = [
      machineNode("bp-Recipe_A-0", 5, 0),
      machineNode("bp-Recipe_A-1", 5, 3),
    ];
    const edges: Edge[] = [beltEdge("e1", "bp-Recipe_A-0", "bp-Recipe_A-1")];
    const config: FloorConfig = { floorWidth: 16, floorDepth: 16 };

    const result = assignFloors({ nodes, edges }, config);

    expect(result.floorCount).toBe(1);
    expect(result.floors).toHaveLength(1);
    expect(result.floors[0].label).toBe("Floor 1");
    expect(result.floors[0].nodes).toHaveLength(2);
    expect(result.floors[0].edges).toHaveLength(1);
    expect(result.floors[0].liftNodes).toHaveLength(0);
    expect(result.floors[0].liftEdges).toHaveLength(0);
  });

  it("distributes nodes across two floors when Y exceeds floor depth", () => {
    // Floor depth = 8 foundations = 384px. Place machines at Y=0 and Y=10 (480px).
    const nodes: Node[] = [
      machineNode("bp-Recipe_A-0", 5, 0, "Recipe_A"),
      machineNode("bp-Recipe_B-0", 5, 10, "Recipe_B"),
    ];
    const edges: Edge[] = [beltEdge("e1", "bp-Recipe_A-0", "bp-Recipe_B-0")];
    const config: FloorConfig = { floorWidth: 16, floorDepth: 8 };

    const result = assignFloors({ nodes, edges }, config);

    expect(result.floorCount).toBe(2);
    expect(result.floors).toHaveLength(2);

    // Floor 0 should have Recipe_A machine
    const floor0Ids = result.floors[0].nodes.map((n) => n.id);
    expect(floor0Ids).toContain("bp-Recipe_A-0");

    // Floor 1 should have Recipe_B machine
    const floor1Ids = result.floors[1].nodes.map((n) => n.id);
    expect(floor1Ids).toContain("bp-Recipe_B-0");
  });

  it("normalizes Y positions per floor", () => {
    const floorDepth = 8; // 8 foundations = 384px
    const nodes: Node[] = [
      machineNode("bp-Recipe_A-0", 5, 0, "Recipe_A"),
      machineNode("bp-Recipe_B-0", 5, 10, "Recipe_B"),
    ];
    const edges: Edge[] = [];
    const config: FloorConfig = { floorWidth: 16, floorDepth };

    const result = assignFloors({ nodes, edges }, config);

    // Floor 0 node should keep original Y
    const f0Node = result.floors[0].nodes.find((n) => n.id === "bp-Recipe_A-0");
    expect(f0Node!.position.y).toBe(0);

    // Floor 1 node Y should be normalized (subtract floor offset)
    const f1Node = result.floors[1].nodes.find((n) => n.id === "bp-Recipe_B-0");
    expect(f1Node!.position.y).toBe(10 * CELL_PX - floorDepth * CELL_PX);
  });

  it("keeps machine groups on same floor (group-aware assignment)", () => {
    // Two machines of same recipe, one just above floor boundary, one just below
    // Both should end up on the floor of the topmost machine
    const floorDepth = 8;
    const nodes: Node[] = [
      machineNode("bp-Recipe_A-0", 5, 6, "Recipe_A"),  // Y=6, floor 0
      machineNode("bp-Recipe_A-1", 5, 9, "Recipe_A"),  // Y=9, would be floor 1
    ];
    const edges: Edge[] = [];
    const config: FloorConfig = { floorWidth: 16, floorDepth };

    const result = assignFloors({ nodes, edges }, config);

    // Both machines should be on the same floor (floor of topmost = floor 0)
    const floor0Ids = result.floors[0].nodes.map((n) => n.id);
    expect(floor0Ids).toContain("bp-Recipe_A-0");
    expect(floor0Ids).toContain("bp-Recipe_A-1");
  });

  it("creates lift nodes for cross-floor edges", () => {
    const nodes: Node[] = [
      machineNode("bp-Recipe_A-0", 5, 0, "Recipe_A"),
      machineNode("bp-Recipe_B-0", 5, 10, "Recipe_B"),
    ];
    const edges: Edge[] = [
      beltEdge("e1", "bp-Recipe_A-0", "bp-Recipe_B-0", "out-Desc_IronIngot_C", "in-Desc_IronIngot_C"),
    ];
    const config: FloorConfig = { floorWidth: 16, floorDepth: 8 };

    const result = assignFloors({ nodes, edges }, config);

    // Floor 0 should have a departure lift
    expect(result.floors[0].liftNodes.length).toBeGreaterThanOrEqual(1);
    const departureLift = result.floors[0].liftNodes[0];
    const departureData = departureLift.data as LiftNodeData;
    expect(departureData.direction).toBe("down");
    expect(departureData.connectedFloor).toBe(1);

    // Floor 1 should have an arrival lift
    expect(result.floors[1].liftNodes.length).toBeGreaterThanOrEqual(1);
    const arrivalLift = result.floors[1].liftNodes[0];
    const arrivalData = arrivalLift.data as LiftNodeData;
    expect(arrivalData.direction).toBe("up");
    expect(arrivalData.connectedFloor).toBe(0);
  });

  it("creates replacement edges for cross-floor connections", () => {
    const nodes: Node[] = [
      machineNode("bp-Recipe_A-0", 5, 0, "Recipe_A"),
      machineNode("bp-Recipe_B-0", 5, 10, "Recipe_B"),
    ];
    const edges: Edge[] = [
      beltEdge("e1", "bp-Recipe_A-0", "bp-Recipe_B-0", "out-Desc_IronIngot_C", "in-Desc_IronIngot_C"),
    ];
    const config: FloorConfig = { floorWidth: 16, floorDepth: 8 };

    const result = assignFloors({ nodes, edges }, config);

    // Original cross-floor edge should NOT be in either floor's edges
    const allEdgeIds = [
      ...result.floors[0].edges.map((e) => e.id),
      ...result.floors[1].edges.map((e) => e.id),
    ];
    expect(allEdgeIds).not.toContain("e1");

    // Floor 0 should have a lift edge from source to departure lift
    expect(result.floors[0].liftEdges.length).toBeGreaterThanOrEqual(1);
    expect(result.floors[0].liftEdges[0].source).toBe("bp-Recipe_A-0");

    // Floor 1 should have a lift edge from arrival lift to target
    expect(result.floors[1].liftEdges.length).toBeGreaterThanOrEqual(1);
    expect(result.floors[1].liftEdges[0].target).toBe("bp-Recipe_B-0");
  });

  it("returns single empty floor for empty layout", () => {
    const result = assignFloors({ nodes: [], edges: [] }, DEFAULT_FLOOR_CONFIG);

    expect(result.floorCount).toBe(1);
    expect(result.floors).toHaveLength(1);
    expect(result.floors[0].nodes).toHaveLength(0);
    expect(result.floors[0].edges).toHaveLength(0);
  });

  it("puts everything on floor 0 when floorDepth is very large", () => {
    const nodes: Node[] = [
      machineNode("bp-Recipe_A-0", 5, 0, "Recipe_A"),
      machineNode("bp-Recipe_B-0", 5, 50, "Recipe_B"),
      machineNode("bp-Recipe_C-0", 5, 100, "Recipe_C"),
    ];
    const edges: Edge[] = [];
    const config: FloorConfig = { floorWidth: 16, floorDepth: 1000 };

    const result = assignFloors({ nodes, edges }, config);

    expect(result.floorCount).toBe(1);
    expect(result.floors[0].nodes).toHaveLength(3);
  });

  it("assigns resource nodes to floor 0", () => {
    const nodes: Node[] = [
      resourceNode("bp-raw-Desc_OreIron_C", -5, 0),
      machineNode("bp-Recipe_A-0", 5, 10, "Recipe_A"),
    ];
    const edges: Edge[] = [];
    const config: FloorConfig = { floorWidth: 16, floorDepth: 8 };

    const result = assignFloors({ nodes, edges }, config);

    const floor0Ids = result.floors[0].nodes.map((n) => n.id);
    expect(floor0Ids).toContain("bp-raw-Desc_OreIron_C");
  });

  it("assigns splitter nodes to same floor as connected machines", () => {
    // Splitter at Y=10 (would be floor 1), but connected to machine at Y=0 (floor 0)
    const nodes: Node[] = [
      machineNode("bp-Recipe_A-0", 5, 0, "Recipe_A"),
      splitterNode("bp-splitter-0", 3, 0),
    ];
    const edges: Edge[] = [
      beltEdge("e1", "bp-splitter-0", "bp-Recipe_A-0", "branch-out-Desc_IronIngot_C", "in-Desc_IronIngot_C"),
    ];
    const config: FloorConfig = { floorWidth: 16, floorDepth: 8 };

    const result = assignFloors({ nodes, edges }, config);

    // Both should be on floor 0
    const floor0Ids = result.floors[0].nodes.map((n) => n.id);
    expect(floor0Ids).toContain("bp-splitter-0");
    expect(floor0Ids).toContain("bp-Recipe_A-0");
  });

  it("handles lift direction correctly for upward connections", () => {
    // Source on floor 1, target on floor 0
    const nodes: Node[] = [
      machineNode("bp-Recipe_A-0", 5, 10, "Recipe_A"),  // floor 1
      machineNode("bp-Recipe_B-0", 5, 0, "Recipe_B"),   // floor 0
    ];
    const edges: Edge[] = [
      beltEdge("e1", "bp-Recipe_A-0", "bp-Recipe_B-0", "out-Desc_IronIngot_C", "in-Desc_IronIngot_C"),
    ];
    const config: FloorConfig = { floorWidth: 16, floorDepth: 8 };

    const result = assignFloors({ nodes, edges }, config);

    // Source floor (1) should have departure lift going "up" (to lower floor number)
    const f1Lift = result.floors[1].liftNodes[0];
    const f1Data = f1Lift.data as LiftNodeData;
    expect(f1Data.direction).toBe("up");
    expect(f1Data.connectedFloor).toBe(0);

    // Target floor (0) should have arrival lift coming "down" (from higher floor number)
    const f0Lift = result.floors[0].liftNodes[0];
    const f0Data = f0Lift.data as LiftNodeData;
    expect(f0Data.direction).toBe("down");
    expect(f0Data.connectedFloor).toBe(1);
  });
});
