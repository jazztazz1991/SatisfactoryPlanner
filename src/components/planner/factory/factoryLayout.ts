import type { Node, Edge } from "@xyflow/react";
import type { ISolverOutput, IProductionStep, IRawResourceRequirement } from "@/domain/types/solver";
import { getSpriteKey, type SpriteKey } from "@/domain/factory/buildingSprites";
import { getBuildingFootprint } from "@/domain/factory/buildingFootprints";
import {
  buildItemFlowMap,
  createSplitterManifold,
  createMergerManifold,
} from "@/domain/factory/manifoldLayout";
import { getMaxBeltRate } from "@/domain/progression/beltConstraints";
import { assignFloors, DEFAULT_FLOOR_CONFIG, type FloorConfig, type MultiFloorLayout } from "@/domain/factory/floorAssignment";

// ─── Belt tier ───────────────────────────────────────────────────────────────

import { getBeltTier } from "@/domain/factory/beltTiers";
export { getBeltTier };

// ─── Grid constants ─────────────────────────────────────────────────────────

/** Pixels per foundation (1 foundation = 8m in-game). */
export const CELL_PX = 48;

const MACHINE_GAP = 1;       // foundations between stacked machines
const GROUP_GAP_Y = 3;       // foundations between recipe groups in same column
const BUS_GAP = 2;           // foundations between bus column and machines
const SPLITTER_W = 1;        // splitter/merger is 1×1 foundation
const INTER_COL_GAP = 3;     // foundations gap between depth columns (after output bus)

// ─── Data interfaces ─────────────────────────────────────────────────────────

export interface BlueprintMachineNodeData {
  buildingName: string | null;
  recipeName: string;
  spriteKey: SpriteKey;
  widthPx: number;
  depthPx: number;
  inputItems: string[];
  outputItems: string[];
  [key: string]: unknown;
}

export interface FactoryResourceNodeData {
  itemClassName: string;
  itemName: string;
  rate: number;
  [key: string]: unknown;
}

// ─── Main layout function ────────────────────────────────────────────────────

export interface BlueprintFlowOptions {
  maxTier?: number;
}

export function solverOutputToBlueprintFlow(result: ISolverOutput, options: BlueprintFlowOptions = {}): { nodes: Node[]; edges: Edge[] } {
  const maxTier = options.maxTier ?? 9;
  const maxBeltRate = getMaxBeltRate(maxTier);
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // ─── Depth assignment (topological) ──────────────────────────────────────

  const stepIds = new Set(result.steps.map((s) => s.recipeClassName));
  const producedBy = new Map<string, string>();
  result.steps.forEach((step) => {
    step.outputs.forEach((o) => producedBy.set(o.itemClassName, step.recipeClassName));
  });

  const depthMap = new Map<string, number>();
  function getDepth(recipeClassName: string, visited = new Set<string>()): number {
    if (depthMap.has(recipeClassName)) return depthMap.get(recipeClassName)!;
    if (visited.has(recipeClassName)) return 0;
    visited.add(recipeClassName);
    const step = result.steps.find((s) => s.recipeClassName === recipeClassName)!;
    const inputDepths = step.inputs
      .map((i) => producedBy.get(i.itemClassName))
      .filter((id): id is string => !!id && stepIds.has(id))
      .map((id) => getDepth(id, visited) + 1);
    const d = inputDepths.length > 0 ? Math.max(...inputDepths) : 0;
    depthMap.set(recipeClassName, d);
    return d;
  }
  result.steps.forEach((s) => getDepth(s.recipeClassName));

  // Group steps by depth column
  const columns = new Map<number, IProductionStep[]>();
  result.steps.forEach((step) => {
    const col = depthMap.get(step.recipeClassName) ?? 0;
    if (!columns.has(col)) columns.set(col, []);
    columns.get(col)!.push(step);
  });

  // ─── Barycentric ordering: sort steps within columns to minimize crossings ─

  // Build a map of which steps consume items produced by which other steps
  const consumerStepsOf = new Map<string, string[]>(); // recipe → list of consumer recipes
  result.steps.forEach((step) => {
    step.inputs.forEach((input) => {
      const producer = producedBy.get(input.itemClassName);
      if (producer && stepIds.has(producer)) {
        const list = consumerStepsOf.get(producer) ?? [];
        list.push(step.recipeClassName);
        consumerStepsOf.set(producer, list);
      }
    });
  });

  const sortedDepths = [...columns.keys()].sort((a, b) => a - b);

  // Process right-to-left: assign a sort index to each step based on its
  // consumers' positions. Steps feeding top consumers go to the top.
  const stepSortWeight = new Map<string, number>();

  // Rightmost column gets initial weights based on their original order
  for (let di = sortedDepths.length - 1; di >= 0; di--) {
    const depth = sortedDepths[di];
    const steps = columns.get(depth)!;

    if (di === sortedDepths.length - 1) {
      // Rightmost column: assign sequential weights
      steps.forEach((s, i) => stepSortWeight.set(s.recipeClassName, i));
    } else {
      // For each step, compute average weight of its consumers
      steps.forEach((s) => {
        const consumers = consumerStepsOf.get(s.recipeClassName) ?? [];
        if (consumers.length > 0) {
          const avgWeight = consumers.reduce(
            (sum, c) => sum + (stepSortWeight.get(c) ?? 0), 0
          ) / consumers.length;
          stepSortWeight.set(s.recipeClassName, avgWeight);
        } else {
          stepSortWeight.set(s.recipeClassName, 0);
        }
      });
    }

    // Sort this column's steps by their computed weight
    steps.sort((a, b) =>
      (stepSortWeight.get(a.recipeClassName) ?? 0) -
      (stepSortWeight.get(b.recipeClassName) ?? 0)
    );

    // Re-assign sequential weights after sorting (for use by the next column left)
    steps.forEach((s, i) => stepSortWeight.set(s.recipeClassName, i));
  }

  // ─── Machine nodes — vertical stacking ───────────────────────────────────

  const stepMachineIds = new Map<string, string[]>();
  // Track machine Y positions per step (needed for manifold splitter alignment)
  const stepMachineYPositions = new Map<string, number[]>();
  let columnX = 0;

  // Track each column's machine area X range
  const columnMachineX = new Map<number, number>();

  for (const depth of sortedDepths) {
    const steps = columns.get(depth)!;
    let maxFpW = 0;
    let maxInputItems = 0;
    let maxOutputItems = 0;

    // First pass: find max footprint width and max input/output item counts
    for (const step of steps) {
      const fp = getBuildingFootprint(step.buildingClassName);
      maxFpW = Math.max(maxFpW, fp.w);
      maxInputItems = Math.max(maxInputItems, step.inputs.length);
      maxOutputItems = Math.max(maxOutputItems, step.outputs.length);
    }

    // Reserve space for input bus columns (one per input item, to the left)
    const inputBusWidth = maxInputItems * (SPLITTER_W + 1); // +1 gap between buses
    // Machine area starts after input buses + gap
    const machineAreaX = columnX + inputBusWidth + BUS_GAP;
    columnMachineX.set(depth, machineAreaX);

    let groupY = 0;

    for (const step of steps) {
      const fp = getBuildingFootprint(step.buildingClassName);
      const count = Math.ceil(step.machineCount);
      const machineIds: string[] = [];
      const machineYs: number[] = [];
      const spriteKey = getSpriteKey(step.buildingClassName);
      const inputItems = step.inputs.map((i) => i.itemClassName);
      const outputItems = step.outputs.map((o) => o.itemClassName);

      // Vertical stacking: all machines at same X, increasing Y
      for (let i = 0; i < count; i++) {
        const x = machineAreaX;
        const y = groupY + i * (fp.d + MACHINE_GAP);

        const nodeId = `bp-${step.recipeClassName}-${i}`;
        machineIds.push(nodeId);
        machineYs.push(y * CELL_PX);

        nodes.push({
          id: nodeId,
          type: "blueprintMachine",
          position: { x: x * CELL_PX, y: y * CELL_PX },
          data: {
            buildingName: step.buildingName,
            recipeName: step.recipeName,
            spriteKey,
            widthPx: fp.w * CELL_PX,
            depthPx: fp.d * CELL_PX,
            inputItems,
            outputItems,
          } satisfies BlueprintMachineNodeData,
        });
      }

      stepMachineIds.set(step.recipeClassName, machineIds);
      stepMachineYPositions.set(step.recipeClassName, machineYs);

      const groupHeight = count * (fp.d + MACHINE_GAP) - MACHINE_GAP;
      groupY += groupHeight + GROUP_GAP_Y;
    }

    // Advance columnX past machine area + output bus space + inter-column gap
    const outputBusWidth = maxOutputItems * (SPLITTER_W + 1);
    columnX = machineAreaX + maxFpW + BUS_GAP + outputBusWidth + INTER_COL_GAP;
  }

  // ─── Raw resource nodes ──────────────────────────────────────────────────

  const rawX = -(1 + BUS_GAP + SPLITTER_W + BUS_GAP) * CELL_PX;
  let rawY = 0;
  for (const r of result.rawResources) {
    nodes.push({
      id: `bp-raw-${r.itemClassName}`,
      type: "factoryResource",
      position: { x: rawX, y: rawY },
      data: {
        itemClassName: r.itemClassName,
        itemName: r.itemName,
        rate: r.rate,
      } satisfies FactoryResourceNodeData,
    });
    rawY += (1 + MACHINE_GAP) * CELL_PX;
  }

  // ─── Build raw node ID map ───────────────────────────────────────────────

  const rawNodeIds = new Map<string, string>();
  result.rawResources.forEach((r: IRawResourceRequirement) => {
    rawNodeIds.set(r.itemClassName, `bp-raw-${r.itemClassName}`);
  });

  // ─── Build item flow map and create manifold edges ───────────────────────

  const itemFlows = buildItemFlowMap(result.steps, result.rawResources, stepMachineIds, rawNodeIds);

  let splitterIdx = 0;
  let mergerIdx = 0;

  for (const flow of itemFlows.values()) {
    const { itemClassName, itemName, producerNodeIds, consumers } = flow;

    // ── Source side: if multiple producers, create merger manifold ──────

    let effectiveSourceId: string;
    let effectiveSourceHandle: string;

    if (producerNodeIds.length > 1) {
      // Find the producer step to get Y positions
      const producerRecipe = [...depthMap.entries()].find(([recipe]) => {
        const ids = stepMachineIds.get(recipe) ?? [];
        return ids.length > 0 && ids[0] === producerNodeIds[0];
      });

      if (producerRecipe) {
        const producerDepth = producerRecipe[1];
        const producerMachineAreaX = columnMachineX.get(producerDepth) ?? 0;
        const fp = getBuildingFootprint(
          result.steps.find((s) => s.recipeClassName === producerRecipe[0])!.buildingClassName
        );
        // Find output item index for bus X offset
        const producerStep = result.steps.find((s) => s.recipeClassName === producerRecipe[0])!;
        const outputItemIdx = producerStep.outputs.findIndex((o) => o.itemClassName === itemClassName);
        const mergerBusX = (producerMachineAreaX + fp.w + BUS_GAP + outputItemIdx * (SPLITTER_W + 1)) * CELL_PX;

        const machineYs = stepMachineYPositions.get(producerRecipe[0]) ?? [];

        const mergerResult = createMergerManifold({
          producerIds: producerNodeIds,
          busX: mergerBusX,
          machineYPositions: machineYs,
          itemClassName,
          itemName,
          totalRate: flow.totalRate,
          targetNodeId: "__placeholder__",
          targetHandleId: `in-${itemClassName}`,
          mergerIdStart: mergerIdx,
          maxBeltRate,
        });

        mergerIdx += producerNodeIds.length;

        // Add merger nodes
        nodes.push(...mergerResult.nodes);

        // Add all merger edges EXCEPT the last one (which goes to placeholder)
        const lastMergerId = `bp-merger-${mergerIdx - 1}`;
        edges.push(...mergerResult.edges.filter((e) => e.target !== "__placeholder__"));

        effectiveSourceId = lastMergerId;
        effectiveSourceHandle = `bus-out-${itemClassName}`;
      } else {
        effectiveSourceId = producerNodeIds[0];
        effectiveSourceHandle = `out-${itemClassName}`;
      }
    } else if (producerNodeIds.length === 1) {
      effectiveSourceId = producerNodeIds[0];
      effectiveSourceHandle = `out-${itemClassName}`;
    } else {
      continue; // No producers, skip
    }

    // ── Consumer side: for each consumer step, create splitter manifold ─

    if (consumers.length === 1) {
      // Single consumer step
      const consumer = consumers[0];
      const consumerIds = consumer.machineIds;

      if (consumerIds.length > 1) {
        // Multiple machines → splitter manifold
        const consumerDepth = depthMap.get(consumer.recipeClassName) ?? 0;
        const consumerMachineAreaX = columnMachineX.get(consumerDepth) ?? 0;

        // Find input item index for bus X offset
        const consumerStep = result.steps.find((s) => s.recipeClassName === consumer.recipeClassName)!;
        const inputItemIdx = consumerStep.inputs.findIndex((inp) => inp.itemClassName === itemClassName);
        const splitterBusX = (consumerMachineAreaX - BUS_GAP - SPLITTER_W - inputItemIdx * (SPLITTER_W + 1)) * CELL_PX;

        const machineYs = stepMachineYPositions.get(consumer.recipeClassName) ?? [];

        const splitterResult = createSplitterManifold({
          consumerIds,
          busX: splitterBusX,
          machineYPositions: machineYs,
          itemClassName,
          itemName,
          totalRate: consumer.rate,
          sourceNodeId: effectiveSourceId,
          sourceHandleId: effectiveSourceHandle,
          splitterIdStart: splitterIdx,
          maxBeltRate,
        });

        splitterIdx += consumerIds.length;
        nodes.push(...splitterResult.nodes);
        edges.push(...splitterResult.edges);
      } else if (consumerIds.length === 1) {
        // Single machine → direct edge
        edges.push({
          id: `e-${effectiveSourceId}-to-${consumerIds[0]}-${itemClassName}`,
          source: effectiveSourceId,
          sourceHandle: effectiveSourceHandle,
          target: consumerIds[0],
          targetHandle: `in-${itemClassName}`,
          type: "belt",
          data: { itemName, rate: consumer.rate, beltTier: getBeltTier(consumer.rate), overCapacity: consumer.rate > maxBeltRate, laneIndex: 0, laneCount: 1 },
        });
      }
    } else if (consumers.length > 1) {
      // Multiple consumer steps → chain of N-1 splitters.
      // Each splitter peels off one branch; the last consumer connects
      // directly from the final splitter's bus-out (no extra node).

      const splitterCount = consumers.length - 1; // N-1 splitters for N consumers
      const interStepSplitterIds: string[] = [];

      // Compute Y positions: use each consumer step's first machine Y,
      // but ensure no two splitters overlap by offsetting duplicates.
      const rawYs: number[] = consumers.map((c) => {
        const ys = stepMachineYPositions.get(c.recipeClassName) ?? [0];
        return ys[0];
      });
      const interSplitterYs: number[] = [];
      const usedYSet = new Set<number>();
      for (let ci = 0; ci < splitterCount; ci++) {
        let y = rawYs[ci];
        while (usedYSet.has(y)) {
          y += SPLITTER_W * CELL_PX; // offset by one splitter height
        }
        usedYSet.add(y);
        interSplitterYs.push(y);
      }

      // Position inter-step splitters midway between source and first consumer
      const sourceNode = nodes.find((n) => n.id === effectiveSourceId);
      const firstConsumerDepth = depthMap.get(consumers[0].recipeClassName) ?? 0;
      const firstConsumerMachineX = columnMachineX.get(firstConsumerDepth) ?? 0;

      const interSplitterX = sourceNode
        ? Math.round(((sourceNode.position.x + firstConsumerMachineX * CELL_PX) / 2) / CELL_PX) * CELL_PX
        : 0;

      for (let ci = 0; ci < splitterCount; ci++) {
        const interId = `bp-splitter-${splitterIdx++}`;
        interStepSplitterIds.push(interId);

        nodes.push({
          id: interId,
          type: "splitterMerger",
          position: { x: interSplitterX, y: interSplitterYs[ci] },
          data: { kind: "splitter", itemClassName },
        });
      }

      // Source → first inter-step splitter
      edges.push({
        id: `e-${effectiveSourceId}-to-${interStepSplitterIds[0]}-${itemClassName}`,
        source: effectiveSourceId,
        sourceHandle: effectiveSourceHandle,
        target: interStepSplitterIds[0],
        targetHandle: `bus-in-${itemClassName}`,
        type: "belt",
        data: { itemName, rate: flow.totalRate, beltTier: getBeltTier(flow.totalRate), overCapacity: flow.totalRate > maxBeltRate, laneIndex: 0, laneCount: 1 },
      });

      // Chain inter-step splitters (only between the N-1 splitter nodes)
      for (let ci = 0; ci < splitterCount - 1; ci++) {
        const remainingRate = flow.totalRate - consumers.slice(0, ci + 1).reduce((s, c) => s + c.rate, 0);
        edges.push({
          id: `e-${interStepSplitterIds[ci]}-bus-to-${interStepSplitterIds[ci + 1]}-${itemClassName}`,
          source: interStepSplitterIds[ci],
          sourceHandle: `bus-out-${itemClassName}`,
          target: interStepSplitterIds[ci + 1],
          targetHandle: `bus-in-${itemClassName}`,
          type: "belt",
          data: { itemName, rate: remainingRate, beltTier: getBeltTier(remainingRate), overCapacity: remainingRate > maxBeltRate, laneIndex: 0, laneCount: 1 },
        });
      }

      // Connect each consumer to its splitter.
      // Consumers 0..N-2 use branch-out from their splitter.
      // Consumer N-1 (last) uses bus-out from the last splitter (no extra node needed).
      for (let ci = 0; ci < consumers.length; ci++) {
        const consumer = consumers[ci];
        const consumerIds = consumer.machineIds;
        const isLast = ci === consumers.length - 1;

        // Determine which splitter node and handle feeds this consumer
        const feedSplitterId = isLast
          ? interStepSplitterIds[splitterCount - 1]
          : interStepSplitterIds[ci];
        const feedHandle = isLast
          ? `bus-out-${itemClassName}`
          : `branch-out-${itemClassName}`;

        if (consumerIds.length > 1) {
          // Intra-step splitter manifold
          const consumerDepth = depthMap.get(consumer.recipeClassName) ?? 0;
          const consumerMachineAreaX = columnMachineX.get(consumerDepth) ?? 0;
          const consumerStep = result.steps.find((s) => s.recipeClassName === consumer.recipeClassName)!;
          const inputItemIdx = consumerStep.inputs.findIndex((inp) => inp.itemClassName === itemClassName);
          const splitterBusX = (consumerMachineAreaX - BUS_GAP - SPLITTER_W - inputItemIdx * (SPLITTER_W + 1)) * CELL_PX;
          const machineYs = stepMachineYPositions.get(consumer.recipeClassName) ?? [];

          const splitterResult = createSplitterManifold({
            consumerIds,
            busX: splitterBusX,
            machineYPositions: machineYs,
            itemClassName,
            itemName,
            totalRate: consumer.rate,
            sourceNodeId: feedSplitterId,
            sourceHandleId: feedHandle,
            splitterIdStart: splitterIdx,
            maxBeltRate,
          });

          splitterIdx += consumerIds.length;
          nodes.push(...splitterResult.nodes);
          edges.push(...splitterResult.edges);
        } else if (consumerIds.length === 1) {
          // Direct from splitter to single machine
          edges.push({
            id: `e-${feedSplitterId}-to-${consumerIds[0]}-${itemClassName}`,
            source: feedSplitterId,
            sourceHandle: feedHandle,
            target: consumerIds[0],
            targetHandle: `in-${itemClassName}`,
            type: "belt",
            data: { itemName, rate: consumer.rate, beltTier: getBeltTier(consumer.rate), overCapacity: consumer.rate > maxBeltRate, laneIndex: 0, laneCount: 1 },
          });
        }
      }
    }
  }

  return { nodes, edges };
}

// ─── Multi-floor wrapper ──────────────────────────────────────────────────

export function solverOutputToMultiFloorLayout(
  result: ISolverOutput,
  options: BlueprintFlowOptions & { floorConfig?: FloorConfig },
): MultiFloorLayout {
  const flat = solverOutputToBlueprintFlow(result, options);
  return assignFloors(flat, options.floorConfig ?? DEFAULT_FLOOR_CONFIG);
}
