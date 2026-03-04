import type { Node, Edge } from "@xyflow/react";
import type { ISolverOutput, IProductionStep, IRawResourceRequirement } from "@/domain/types/solver";

const BELT_TIERS = [
  { maxRate: 60, tier: 1 },
  { maxRate: 120, tier: 2 },
  { maxRate: 270, tier: 3 },
  { maxRate: 480, tier: 4 },
] as const;

export function getBeltTier(rate: number): 1 | 2 | 3 | 4 | 5 {
  for (const { maxRate, tier } of BELT_TIERS) {
    if (rate <= maxRate) return tier;
  }
  return 5;
}

const NODE_W = 240;
const NODE_H = 130;
const GAP_X = 40;
const GAP_Y = 60;

export function solverOutputToFactoryGraph(result: ISolverOutput): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Build a name lookup for all items
  const itemNameMap = new Map<string, string>();
  result.steps.forEach((step) => {
    step.inputs.forEach((i) => itemNameMap.set(i.itemClassName, i.itemName));
    step.outputs.forEach((o) => itemNameMap.set(o.itemClassName, o.itemName));
  });
  result.rawResources.forEach((r) => itemNameMap.set(r.itemClassName, r.itemName));

  // --- Depth assignment (topological) ---
  const stepIds = new Set(result.steps.map((s) => s.recipeClassName));
  const producedBy = new Map<string, string>();
  result.steps.forEach((step) => {
    step.outputs.forEach((o) => producedBy.set(o.itemClassName, step.recipeClassName));
  });

  const depth = new Map<string, number>();
  function getDepth(recipeClassName: string, visited = new Set<string>()): number {
    if (depth.has(recipeClassName)) return depth.get(recipeClassName)!;
    if (visited.has(recipeClassName)) return 0;
    visited.add(recipeClassName);
    const step = result.steps.find((s) => s.recipeClassName === recipeClassName)!;
    const inputDepths = step.inputs
      .map((i) => producedBy.get(i.itemClassName))
      .filter((id): id is string => !!id && stepIds.has(id))
      .map((id) => getDepth(id, visited) + 1);
    const d = inputDepths.length > 0 ? Math.max(...inputDepths) : 0;
    depth.set(recipeClassName, d);
    return d;
  }
  result.steps.forEach((s) => getDepth(s.recipeClassName));

  // Group steps by depth column
  const columns = new Map<number, IProductionStep[]>();
  result.steps.forEach((step) => {
    const col = depth.get(step.recipeClassName) ?? 0;
    if (!columns.has(col)) columns.set(col, []);
    columns.get(col)!.push(step);
  });

  // Track node positions for splitter placement
  const nodePosition = new Map<string, { x: number; y: number }>();

  // --- Step nodes ---
  columns.forEach((steps, col) => {
    steps.forEach((step, row) => {
      const pos = { x: row * (NODE_W + GAP_X), y: col * (NODE_H + GAP_Y) };
      nodePosition.set(`factory-step-${step.recipeClassName}`, pos);
      nodes.push({
        id: `factory-step-${step.recipeClassName}`,
        type: "factoryBuilding",
        position: pos,
        data: {
          recipeName: step.recipeName,
          buildingName: step.buildingName,
          machineCount: Math.ceil(step.machineCount),
          powerUsageKW: step.powerUsageKW,
        },
      });
    });
  });

  // --- Raw resource nodes ---
  result.rawResources.forEach((r: IRawResourceRequirement, i) => {
    const pos = { x: i * (NODE_W + GAP_X), y: -(NODE_H + GAP_Y) };
    nodePosition.set(`factory-raw-${r.itemClassName}`, pos);
    nodes.push({
      id: `factory-raw-${r.itemClassName}`,
      type: "resource",
      position: pos,
      data: { itemName: r.itemName, rate: r.rate },
    });
  });

  // --- Producer/Consumer maps ---
  const itemProducer = new Map<string, string>();
  result.steps.forEach((step) => {
    step.outputs.forEach((o) => {
      itemProducer.set(o.itemClassName, `factory-step-${step.recipeClassName}`);
    });
  });
  result.rawResources.forEach((r) => {
    itemProducer.set(r.itemClassName, `factory-raw-${r.itemClassName}`);
  });

  const itemConsumers = new Map<string, Array<{ nodeId: string; rate: number }>>();
  result.steps.forEach((step) => {
    step.inputs.forEach((input) => {
      if (!itemConsumers.has(input.itemClassName)) {
        itemConsumers.set(input.itemClassName, []);
      }
      itemConsumers.get(input.itemClassName)!.push({
        nodeId: `factory-step-${step.recipeClassName}`,
        rate: input.rate,
      });
    });
  });

  // --- Splitter insertion and edge creation ---
  itemConsumers.forEach((consumers, itemClassName) => {
    const producerNodeId = itemProducer.get(itemClassName);
    if (!producerNodeId) return;

    const itemName = itemNameMap.get(itemClassName) ?? itemClassName;
    const totalRate = consumers.reduce((sum, c) => sum + c.rate, 0);

    if (consumers.length > 1) {
      const splitterId = `factory-split-${itemClassName}`;
      const producerPos = nodePosition.get(producerNodeId) ?? { x: 0, y: 0 };
      const splitterPos = {
        x: producerPos.x,
        y: producerPos.y + (NODE_H + GAP_Y) * 0.5,
      };
      nodes.push({
        id: splitterId,
        type: "splitter",
        position: splitterPos,
        data: { itemName, rate: totalRate },
      });

      edges.push({
        id: `e-${producerNodeId}-${splitterId}`,
        source: producerNodeId,
        target: splitterId,
        type: "belt",
        data: { itemName, rate: totalRate, beltTier: getBeltTier(totalRate) },
      });

      consumers.forEach((consumer) => {
        edges.push({
          id: `e-${splitterId}-${consumer.nodeId}`,
          source: splitterId,
          target: consumer.nodeId,
          type: "belt",
          data: { itemName, rate: consumer.rate, beltTier: getBeltTier(consumer.rate) },
        });
      });
    } else {
      const consumer = consumers[0];
      edges.push({
        id: `e-${producerNodeId}-${consumer.nodeId}`,
        source: producerNodeId,
        target: consumer.nodeId,
        type: "belt",
        data: { itemName, rate: consumer.rate, beltTier: getBeltTier(consumer.rate) },
      });
    }
  });

  return { nodes, edges };
}
