import type { Node, Edge } from "@xyflow/react";
import type { IProductionStep, IRawResourceRequirement } from "@/domain/types/solver";

/** Pixels per foundation. Re-exported for test convenience. */
export const CELL_PX = 48;

// ─── Belt tier (duplicated to keep this module pure / avoid circular import) ─

const BELT_TIERS = [
  { maxRate: 60, tier: 1 },
  { maxRate: 120, tier: 2 },
  { maxRate: 270, tier: 3 },
  { maxRate: 480, tier: 4 },
] as const;

function getBeltTier(rate: number): 1 | 2 | 3 | 4 | 5 {
  for (const { maxRate, tier } of BELT_TIERS) {
    if (rate <= maxRate) return tier;
  }
  return 5;
}

// ─── Item flow map ──────────────────────────────────────────────────────────

export interface ItemFlow {
  itemClassName: string;
  itemName: string;
  totalRate: number;
  producerNodeIds: string[];
  consumers: Array<{
    recipeClassName: string;
    machineIds: string[];
    rate: number;
  }>;
}

/**
 * Builds a map of item flows: for each item that is consumed by at least one step,
 * identifies its producers (machine IDs or raw resource IDs) and all consumer steps.
 */
export function buildItemFlowMap(
  steps: IProductionStep[],
  rawResources: IRawResourceRequirement[],
  stepMachineIds: Map<string, string[]>,
  rawNodeIds: Map<string, string>,
): Map<string, ItemFlow> {
  // Build producer map: itemClassName → producing recipe
  const producedByRecipe = new Map<string, string>();
  const itemNameMap = new Map<string, string>();
  steps.forEach((step) => {
    step.outputs.forEach((o) => {
      producedByRecipe.set(o.itemClassName, step.recipeClassName);
      itemNameMap.set(o.itemClassName, o.itemName);
    });
    step.inputs.forEach((i) => itemNameMap.set(i.itemClassName, i.itemName));
  });
  rawResources.forEach((r) => itemNameMap.set(r.itemClassName, r.itemName));

  const flowMap = new Map<string, ItemFlow>();

  // Iterate over all consumed items
  steps.forEach((step) => {
    step.inputs.forEach((input) => {
      if (!flowMap.has(input.itemClassName)) {
        // Determine producers
        const rawNodeId = rawNodeIds.get(input.itemClassName);
        const producerRecipe = producedByRecipe.get(input.itemClassName);
        const producerIds = rawNodeId
          ? [rawNodeId]
          : producerRecipe
            ? (stepMachineIds.get(producerRecipe) ?? [])
            : [];

        flowMap.set(input.itemClassName, {
          itemClassName: input.itemClassName,
          itemName: itemNameMap.get(input.itemClassName) ?? input.itemClassName,
          totalRate: 0,
          producerNodeIds: producerIds,
          consumers: [],
        });
      }

      const flow = flowMap.get(input.itemClassName)!;
      flow.consumers.push({
        recipeClassName: step.recipeClassName,
        machineIds: stepMachineIds.get(step.recipeClassName) ?? [],
        rate: input.rate,
      });
      flow.totalRate += input.rate;
    });
  });

  return flowMap;
}

// ─── Splitter manifold ──────────────────────────────────────────────────────

export interface SplitterManifoldOptions {
  consumerIds: string[];
  busX: number;
  machineYPositions: number[];
  itemClassName: string;
  itemName: string;
  totalRate: number;
  sourceNodeId: string;
  sourceHandleId: string;
  splitterIdStart: number;
}

/**
 * Creates a vertical chain of splitter nodes (manifold) that distributes
 * one belt to N consumer machines.
 *
 * Bus runs top→bottom. Each splitter branches right to its machine.
 */
export function createSplitterManifold(opts: SplitterManifoldOptions): { nodes: Node[]; edges: Edge[] } {
  const {
    consumerIds, busX, machineYPositions, itemClassName, itemName,
    totalRate, sourceNodeId, sourceHandleId, splitterIdStart,
  } = opts;
  const N = consumerIds.length;
  const ratePerMachine = totalRate / N;

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Create splitter nodes
  const splitterIds: string[] = [];
  for (let i = 0; i < N; i++) {
    const id = `bp-splitter-${splitterIdStart + i}`;
    splitterIds.push(id);
    nodes.push({
      id,
      type: "splitterMerger",
      position: { x: busX, y: machineYPositions[i] },
      data: { kind: "splitter", itemClassName },
    });
  }

  // Source → first splitter
  edges.push({
    id: `e-${sourceNodeId}-to-${splitterIds[0]}-${itemClassName}`,
    source: sourceNodeId,
    sourceHandle: sourceHandleId,
    target: splitterIds[0],
    targetHandle: `bus-in-${itemClassName}`,
    type: "belt",
    data: { itemName, rate: totalRate, beltTier: getBeltTier(totalRate), laneIndex: 0, laneCount: 1 },
  });

  // Bus chain: S[i] → S[i+1]
  for (let i = 0; i < N - 1; i++) {
    const busRate = totalRate - (i + 1) * ratePerMachine;
    edges.push({
      id: `e-${splitterIds[i]}-bus-to-${splitterIds[i + 1]}-${itemClassName}`,
      source: splitterIds[i],
      sourceHandle: `bus-out-${itemClassName}`,
      target: splitterIds[i + 1],
      targetHandle: `bus-in-${itemClassName}`,
      type: "belt",
      data: { itemName, rate: busRate, beltTier: getBeltTier(busRate), laneIndex: 0, laneCount: 1 },
    });
  }

  // Branch edges: S[i] → consumer[i]
  for (let i = 0; i < N; i++) {
    edges.push({
      id: `e-${splitterIds[i]}-branch-to-${consumerIds[i]}-${itemClassName}`,
      source: splitterIds[i],
      sourceHandle: `branch-out-${itemClassName}`,
      target: consumerIds[i],
      targetHandle: `in-${itemClassName}`,
      type: "belt",
      data: { itemName, rate: ratePerMachine, beltTier: getBeltTier(ratePerMachine), laneIndex: 0, laneCount: 1 },
    });
  }

  return { nodes, edges };
}

// ─── Merger manifold ────────────────────────────────────────────────────────

export interface MergerManifoldOptions {
  producerIds: string[];
  busX: number;
  machineYPositions: number[];
  itemClassName: string;
  itemName: string;
  totalRate: number;
  targetNodeId: string;
  targetHandleId: string;
  mergerIdStart: number;
}

/**
 * Creates a vertical chain of merger nodes (manifold) that combines
 * N producer machine outputs into one belt.
 *
 * Bus runs top→bottom. Each merger receives a branch from its machine on the left.
 */
export function createMergerManifold(opts: MergerManifoldOptions): { nodes: Node[]; edges: Edge[] } {
  const {
    producerIds, busX, machineYPositions, itemClassName, itemName,
    totalRate, targetNodeId, targetHandleId, mergerIdStart,
  } = opts;
  const N = producerIds.length;
  const ratePerMachine = totalRate / N;

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Create merger nodes
  const mergerIds: string[] = [];
  for (let i = 0; i < N; i++) {
    const id = `bp-merger-${mergerIdStart + i}`;
    mergerIds.push(id);
    nodes.push({
      id,
      type: "splitterMerger",
      position: { x: busX, y: machineYPositions[i] },
      data: { kind: "merger", itemClassName },
    });
  }

  // Branch edges: producer[i] → M[i]
  for (let i = 0; i < N; i++) {
    edges.push({
      id: `e-${producerIds[i]}-branch-to-${mergerIds[i]}-${itemClassName}`,
      source: producerIds[i],
      sourceHandle: `out-${itemClassName}`,
      target: mergerIds[i],
      targetHandle: `branch-in-${itemClassName}`,
      type: "belt",
      data: { itemName, rate: ratePerMachine, beltTier: getBeltTier(ratePerMachine), laneIndex: 0, laneCount: 1 },
    });
  }

  // Bus chain: M[i] → M[i+1]
  for (let i = 0; i < N - 1; i++) {
    const busRate = (i + 1) * ratePerMachine;
    edges.push({
      id: `e-${mergerIds[i]}-bus-to-${mergerIds[i + 1]}-${itemClassName}`,
      source: mergerIds[i],
      sourceHandle: `bus-out-${itemClassName}`,
      target: mergerIds[i + 1],
      targetHandle: `bus-in-${itemClassName}`,
      type: "belt",
      data: { itemName, rate: busRate, beltTier: getBeltTier(busRate), laneIndex: 0, laneCount: 1 },
    });
  }

  // Last merger → target
  edges.push({
    id: `e-${mergerIds[N - 1]}-to-${targetNodeId}-${itemClassName}`,
    source: mergerIds[N - 1],
    sourceHandle: `bus-out-${itemClassName}`,
    target: targetNodeId,
    targetHandle: targetHandleId,
    type: "belt",
    data: { itemName, rate: totalRate, beltTier: getBeltTier(totalRate), laneIndex: 0, laneCount: 1 },
  });

  return { nodes, edges };
}
