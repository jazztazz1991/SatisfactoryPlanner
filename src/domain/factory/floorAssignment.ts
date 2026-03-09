import type { Node, Edge } from "@xyflow/react";

// ─── Configuration ────────────────────────────────────────────────────────

export interface FloorConfig {
  /** Floor width in foundations (X dimension). Visual guide only; not used for assignment yet. */
  floorWidth: number;
  /** Floor depth in foundations (Y dimension). Determines floor height bands. */
  floorDepth: number;
}

export const DEFAULT_FLOOR_CONFIG: FloorConfig = {
  floorWidth: 16,
  floorDepth: 16,
};

// ─── Output types ─────────────────────────────────────────────────────────

export interface FloorData {
  /** 0-indexed floor number. */
  floor: number;
  /** Display label (e.g. "Floor 1"). */
  label: string;
  /** Nodes on this floor with Y positions normalized (offset subtracted). */
  nodes: Node[];
  /** Edges where both source and target are on this floor. */
  edges: Edge[];
  /** Lift indicator nodes for cross-floor connections on this floor. */
  liftNodes: Node[];
  /** Edges connecting nodes to lift indicators on this floor. */
  liftEdges: Edge[];
}

export interface MultiFloorLayout {
  floors: FloorData[];
  floorCount: number;
}

// ─── Lift node data ───────────────────────────────────────────────────────

export interface LiftNodeData {
  /** "up" if the item goes to a higher (lower-numbered) floor, "down" if lower (higher-numbered). */
  direction: "up" | "down";
  /** Which floor the other end of the lift connects to. */
  connectedFloor: number;
  itemClassName: string;
  itemName: string;
  rate: number;
  [key: string]: unknown;
}

// ─── Constants ────────────────────────────────────────────────────────────

const CELL_PX = 48;
const LIFT_SIZE_PX = CELL_PX;

// ─── Floor assignment ─────────────────────────────────────────────────────

/**
 * Takes a flat layout (nodes + edges) and partitions it into floors based
 * on Y-position bands. Creates lift nodes for cross-floor edges.
 */
export function assignFloors(
  flatLayout: { nodes: Node[]; edges: Edge[] },
  config: FloorConfig,
): MultiFloorLayout {
  const { nodes, edges } = flatLayout;

  if (nodes.length === 0) {
    return {
      floors: [{ floor: 0, label: "Floor 1", nodes: [], edges: [], liftNodes: [], liftEdges: [] }],
      floorCount: 1,
    };
  }

  const floorHeightPx = config.floorDepth * CELL_PX;

  // ── Step 1: Group-aware floor assignment ────────────────────────────

  const nodeFloorMap = new Map<string, number>();

  // Group blueprint machines by recipe prefix
  const recipeGroups = new Map<string, string[]>();
  for (const node of nodes) {
    if (node.type === "blueprintMachine") {
      // ID pattern: bp-{recipeClassName}-{index}
      const match = node.id.match(/^bp-(.+)-\d+$/);
      if (match) {
        const recipe = match[1];
        const group = recipeGroups.get(recipe) ?? [];
        group.push(node.id);
        recipeGroups.set(recipe, group);
      }
    }
  }

  // Assign each recipe group to the floor of its topmost machine
  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  for (const [, groupIds] of recipeGroups) {
    const minY = Math.min(...groupIds.map((id) => nodeById.get(id)!.position.y));
    const groupFloor = Math.max(0, Math.floor(minY / floorHeightPx));
    for (const id of groupIds) {
      nodeFloorMap.set(id, groupFloor);
    }
  }

  // Assign resource nodes to floor 0
  for (const node of nodes) {
    if (node.type === "factoryResource") {
      nodeFloorMap.set(node.id, 0);
    }
  }

  // Assign splitter/merger nodes based on connected machines
  // First pass: find connections from edges
  for (const node of nodes) {
    if (node.type === "splitterMerger" && !nodeFloorMap.has(node.id)) {
      // Find a connected machine node via edges
      const connectedFloor = findConnectedMachineFloor(node.id, edges, nodeFloorMap);
      if (connectedFloor !== null) {
        nodeFloorMap.set(node.id, connectedFloor);
      } else {
        // Fallback: assign by Y position
        const rawFloor = Math.max(0, Math.floor(node.position.y / floorHeightPx));
        nodeFloorMap.set(node.id, rawFloor);
      }
    }
  }

  // Catch any remaining unassigned nodes
  for (const node of nodes) {
    if (!nodeFloorMap.has(node.id)) {
      const rawFloor = Math.max(0, Math.floor(node.position.y / floorHeightPx));
      nodeFloorMap.set(node.id, rawFloor);
    }
  }

  // ── Step 2: Determine floor count ──────────────────────────────────

  const maxFloor = Math.max(0, ...nodeFloorMap.values());
  const floorCount = maxFloor + 1;

  // ── Step 3: Partition nodes and normalize Y positions ──────────────

  const floorNodes = new Map<number, Node[]>();
  for (let f = 0; f < floorCount; f++) {
    floorNodes.set(f, []);
  }

  for (const node of nodes) {
    const floor = nodeFloorMap.get(node.id)!;
    const yOffset = floor * floorHeightPx;
    floorNodes.get(floor)!.push({
      ...node,
      position: { x: node.position.x, y: node.position.y - yOffset },
    });
  }

  // ── Step 4: Partition edges (intra-floor vs cross-floor) ───────────

  const floorEdges = new Map<number, Edge[]>();
  for (let f = 0; f < floorCount; f++) {
    floorEdges.set(f, []);
  }
  const crossFloorEdges: Edge[] = [];

  for (const edge of edges) {
    const sourceFloor = nodeFloorMap.get(edge.source);
    const targetFloor = nodeFloorMap.get(edge.target);
    if (sourceFloor === undefined || targetFloor === undefined) continue;

    if (sourceFloor === targetFloor) {
      floorEdges.get(sourceFloor)!.push(edge);
    } else {
      crossFloorEdges.push(edge);
    }
  }

  // ── Step 5: Create lift nodes for cross-floor edges ────────────────

  const floorLiftNodes = new Map<number, Node[]>();
  const floorLiftEdges = new Map<number, Edge[]>();
  for (let f = 0; f < floorCount; f++) {
    floorLiftNodes.set(f, []);
    floorLiftEdges.set(f, []);
  }

  for (const edge of crossFloorEdges) {
    const sourceFloor = nodeFloorMap.get(edge.source)!;
    const targetFloor = nodeFloorMap.get(edge.target)!;
    const sourceNode = nodeById.get(edge.source);
    const targetNode = nodeById.get(edge.target);
    if (!sourceNode || !targetNode) continue;

    // Extract item info from edge data
    const edgeData = (edge.data ?? {}) as Record<string, unknown>;
    const itemName = (edgeData.itemName as string) ?? "";
    const rate = (edgeData.rate as number) ?? 0;

    // Extract item class name from handle IDs
    const itemClassName = extractItemFromHandle(edge.sourceHandle) || extractItemFromHandle(edge.targetHandle) || "";

    // Direction: "down" means going to a higher floor number, "up" means lower
    const departureDirection: "up" | "down" = targetFloor > sourceFloor ? "down" : "up";
    const arrivalDirection: "up" | "down" = targetFloor > sourceFloor ? "up" : "down";

    // Departure lift on source floor
    const departureLiftId = `bp-lift-${edge.id}-src`;
    const sourceYOffset = sourceFloor * floorHeightPx;
    const departureLiftNode: Node = {
      id: departureLiftId,
      type: "factoryLift",
      position: {
        x: sourceNode.position.x + LIFT_SIZE_PX,
        y: sourceNode.position.y - sourceYOffset,
      },
      data: {
        direction: departureDirection,
        connectedFloor: targetFloor,
        itemClassName,
        itemName,
        rate,
      } satisfies LiftNodeData,
    };
    floorLiftNodes.get(sourceFloor)!.push(departureLiftNode);

    // Edge: source → departure lift
    const departureLiftEdge: Edge = {
      id: `e-lift-${edge.id}-departure`,
      source: edge.source,
      target: departureLiftId,
      sourceHandle: edge.sourceHandle,
      targetHandle: "lift-in",
      type: "belt",
      data: edge.data,
    };
    floorLiftEdges.get(sourceFloor)!.push(departureLiftEdge);

    // Arrival lift on target floor
    const arrivalLiftId = `bp-lift-${edge.id}-dst`;
    const targetYOffset = targetFloor * floorHeightPx;
    const arrivalLiftNode: Node = {
      id: arrivalLiftId,
      type: "factoryLift",
      position: {
        x: targetNode.position.x - LIFT_SIZE_PX,
        y: targetNode.position.y - targetYOffset,
      },
      data: {
        direction: arrivalDirection,
        connectedFloor: sourceFloor,
        itemClassName,
        itemName,
        rate,
      } satisfies LiftNodeData,
    };
    floorLiftNodes.get(targetFloor)!.push(arrivalLiftNode);

    // Edge: arrival lift → target
    const arrivalLiftEdge: Edge = {
      id: `e-lift-${edge.id}-arrival`,
      source: arrivalLiftId,
      target: edge.target,
      sourceHandle: "lift-out",
      targetHandle: edge.targetHandle,
      type: "belt",
      data: edge.data,
    };
    floorLiftEdges.get(targetFloor)!.push(arrivalLiftEdge);
  }

  // ── Step 6: Assemble FloorData[] ───────────────────────────────────

  const floors: FloorData[] = [];
  for (let f = 0; f < floorCount; f++) {
    floors.push({
      floor: f,
      label: `Floor ${f + 1}`,
      nodes: floorNodes.get(f) ?? [],
      edges: floorEdges.get(f) ?? [],
      liftNodes: floorLiftNodes.get(f) ?? [],
      liftEdges: floorLiftEdges.get(f) ?? [],
    });
  }

  return { floors, floorCount };
}

// ─── Helpers ──────────────────────────────────────────────────────────────

/**
 * Finds the floor of a machine connected to the given splitter/merger node.
 * Searches edges for branch connections to/from machine nodes.
 */
function findConnectedMachineFloor(
  nodeId: string,
  edges: Edge[],
  nodeFloorMap: Map<string, number>,
): number | null {
  for (const edge of edges) {
    if (edge.source === nodeId) {
      const floor = nodeFloorMap.get(edge.target);
      if (floor !== undefined) return floor;
    }
    if (edge.target === nodeId) {
      const floor = nodeFloorMap.get(edge.source);
      if (floor !== undefined) return floor;
    }
  }
  return null;
}

/**
 * Extracts item class name from a handle ID.
 * Handles formats: out-Item, in-Item, bus-in-Item, bus-out-Item, branch-out-Item, branch-in-Item
 */
function extractItemFromHandle(handle: string | null | undefined): string {
  if (!handle) return "";
  return handle.replace(/^(out|in|bus-in|bus-out|branch-out|branch-out-left|branch-in|branch-in-right)-/, "");
}
