import type { IRecipe, IItem } from "@/domain/types/game";
import { getBeltTier } from "@/domain/factory/beltTiers";
import { isBeltOverCapacity } from "@/domain/progression/beltConstraints";
import { parseHandleItem } from "./connectionValidation";

export interface BuilderNodeInfo {
  id: string;
  recipeClassName: string | null;
  machineCount: number;
  overclockPercent: number;
}

export interface BuilderResourceInfo {
  id: string;
  itemClassName: string;
  rate: number;
}

export interface BuilderSplitterMergerInfo {
  id: string;
  kind: "splitter" | "merger";
  itemClassName: string;
}

export interface BuilderEdgeInfo {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourceHandle: string;
  targetHandle: string;
}

export interface ComputedEdgeRate {
  edgeId: string;
  itemClassName: string;
  itemName: string;
  rate: number;
  beltTier: 1 | 2 | 3 | 4 | 5 | 6;
  overCapacity: boolean;
}

/**
 * Compute the production rate for a machine node's output handle.
 * Returns total rate for a given product item across all machines.
 */
function getMachineOutputRate(
  node: BuilderNodeInfo,
  itemClassName: string,
  recipes: Map<string, IRecipe>,
): number {
  if (!node.recipeClassName) return 0;
  const recipe = recipes.get(node.recipeClassName);
  if (!recipe) return 0;
  const product = recipe.products.find((p) => p.itemClassName === itemClassName);
  if (!product) return 0;
  return (60 / recipe.timeSeconds) * product.amountPerCycle * node.machineCount * (node.overclockPercent / 100);
}

/**
 * Computes the throughput rate for every edge in a builder graph.
 *
 * Machine/resource nodes produce rates directly from their recipe/configured rate.
 * Splitter/merger nodes are pass-through: they sum their input rates and distribute
 * evenly across their output edges. This requires topological processing.
 */
export function computeBuilderRates(
  nodes: BuilderNodeInfo[],
  edges: BuilderEdgeInfo[],
  recipes: Map<string, IRecipe>,
  items: Map<string, IItem>,
  maxTier: number,
  resourceNodes: BuilderResourceInfo[] = [],
  splitterMergerNodes: BuilderSplitterMergerInfo[] = [],
): ComputedEdgeRate[] {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const resourceMap = new Map(resourceNodes.map((r) => [r.id, r]));
  const smMap = new Map(splitterMergerNodes.map((sm) => [sm.id, sm]));

  // Pre-compute outgoing edge counts per (nodeId, sourceHandle) for machines/resources
  const handleOutCounts = new Map<string, number>();
  // Pre-compute total outgoing edge count per nodeId for splitters/mergers
  const nodeOutCounts = new Map<string, number>();
  for (const edge of edges) {
    const key = `${edge.sourceNodeId}::${edge.sourceHandle}`;
    handleOutCounts.set(key, (handleOutCounts.get(key) ?? 0) + 1);
    nodeOutCounts.set(edge.sourceNodeId, (nodeOutCounts.get(edge.sourceNodeId) ?? 0) + 1);
  }

  // Build incoming edges per node for splitter/merger resolution
  const incomingEdges = new Map<string, BuilderEdgeInfo[]>();
  for (const edge of edges) {
    const list = incomingEdges.get(edge.targetNodeId) ?? [];
    list.push(edge);
    incomingEdges.set(edge.targetNodeId, list);
  }

  // Resolved rates per edge
  const edgeRates = new Map<string, number>();
  // Resolved total output rates per node (for splitters/mergers)
  const nodeRateCache = new Map<string, number>();
  // Cycle guard
  const resolving = new Set<string>();

  /**
   * Resolve the total output rate for a given node.
   * For machines: recipe-based calculation (handled per-edge).
   * For resources: configured rate.
   * For splitters/mergers: sum of incoming edge rates (recursive).
   */
  function resolveNodeOutputRate(nodeId: string): number {
    const cached = nodeRateCache.get(nodeId);
    if (cached !== undefined) return cached;

    // Machine node — per-item, handled in resolveEdgeRate
    if (nodeMap.has(nodeId)) return 0;

    // Resource node
    const resource = resourceMap.get(nodeId);
    if (resource) return resource.rate;

    // Splitter/merger: sum incoming edge rates
    const sm = smMap.get(nodeId);
    if (sm) {
      if (resolving.has(nodeId)) return 0; // cycle guard
      resolving.add(nodeId);

      const incoming = incomingEdges.get(nodeId) ?? [];
      let total = 0;
      for (const inEdge of incoming) {
        total += resolveEdgeRate(inEdge);
      }
      nodeRateCache.set(nodeId, total);
      resolving.delete(nodeId);
      return total;
    }

    return 0;
  }

  function resolveEdgeRate(edge: BuilderEdgeInfo): number {
    // Already resolved?
    const cached = edgeRates.get(edge.id);
    if (cached !== undefined) return cached;

    const itemClassName = parseHandleItem(edge.sourceHandle) ?? "";

    let totalRate: number;
    let splitCount: number;

    // Machine source — split per handle
    const machine = nodeMap.get(edge.sourceNodeId);
    if (machine) {
      totalRate = getMachineOutputRate(machine, itemClassName, recipes);
      const splitKey = `${edge.sourceNodeId}::${edge.sourceHandle}`;
      splitCount = handleOutCounts.get(splitKey) ?? 1;
    }
    // Resource source — split per handle
    else if (resourceMap.has(edge.sourceNodeId)) {
      totalRate = resourceMap.get(edge.sourceNodeId)!.rate;
      const splitKey = `${edge.sourceNodeId}::${edge.sourceHandle}`;
      splitCount = handleOutCounts.get(splitKey) ?? 1;
    }
    // Splitter/merger source — split across ALL outgoing edges from the node
    else if (smMap.has(edge.sourceNodeId)) {
      totalRate = resolveNodeOutputRate(edge.sourceNodeId);
      splitCount = nodeOutCounts.get(edge.sourceNodeId) ?? 1;
    }
    else {
      totalRate = 0;
      splitCount = 1;
    }

    const rate = Math.round((totalRate / splitCount) * 100) / 100;
    edgeRates.set(edge.id, rate);
    return rate;
  }

  // Resolve all edges
  return edges.map((edge) => {
    const itemClassName = parseHandleItem(edge.sourceHandle) ?? "";
    const item = items.get(itemClassName);
    const itemName = item?.name ?? itemClassName;

    const rate = resolveEdgeRate(edge);
    const beltTier = getBeltTier(rate);
    const overCapacity = isBeltOverCapacity(rate, maxTier);

    return { edgeId: edge.id, itemClassName, itemName, rate, beltTier, overCapacity };
  });
}

export interface MachineItemRate {
  itemClassName: string;
  ratePerMin: number;
}

/**
 * Compute per-item input and output rates for a machine given its recipe,
 * machine count, and overclock percentage.
 *
 * Rate = (amountPerCycle / timeSeconds) * 60 * machineCount * (overclockPercent / 100)
 */
export function computeMachineItemRates(
  recipe: IRecipe,
  machineCount: number,
  overclockPercent: number,
): { inputs: MachineItemRate[]; outputs: MachineItemRate[] } {
  const multiplier = (60 / recipe.timeSeconds) * machineCount * (overclockPercent / 100);
  const inputs = recipe.ingredients.map((ing) => ({
    itemClassName: ing.itemClassName,
    ratePerMin: Math.round(ing.amountPerCycle * multiplier * 100) / 100,
  }));
  const outputs = recipe.products.map((prod) => ({
    itemClassName: prod.itemClassName,
    ratePerMin: Math.round(prod.amountPerCycle * multiplier * 100) / 100,
  }));
  return { inputs, outputs };
}
