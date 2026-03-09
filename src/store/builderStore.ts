import { create } from "zustand";
import type { Node, Edge } from "@xyflow/react";
import type { IRecipe, IItem } from "@/domain/types/game";
import { getSpriteKey } from "@/domain/factory/buildingSprites";
import { getBuildingFootprint } from "@/domain/factory/buildingFootprints";
import { computeBuilderRates, computeMachineItemRates, type BuilderNodeInfo, type BuilderEdgeInfo, type BuilderResourceInfo, type BuilderSplitterMergerInfo } from "@/domain/builder/rateCalculation";
import { CELL_PX } from "@/components/planner/factory/factoryLayout";

/** Generate a UUID, falling back when crypto.randomUUID is unavailable (non-HTTPS). */
function genId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback: random hex string in UUID-like format
  const h = () => Math.random().toString(16).slice(2, 10);
  return `${h()}-${h().slice(0, 4)}-4${h().slice(1, 4)}-${(8 + Math.floor(Math.random() * 4)).toString(16)}${h().slice(1, 4)}-${h()}${h().slice(0, 4)}`;
}

export interface BuilderMachineNodeData {
  buildingClassName: string;
  buildingName: string;
  recipeClassName: string | null;
  recipeName: string | null;
  spriteKey: string;
  widthPx: number;
  depthPx: number;
  inputItems: string[];
  outputItems: string[];
  /** Per-item display names (parallel to inputItems). */
  inputItemNames: string[];
  /** Per-item display names (parallel to outputItems). */
  outputItemNames: string[];
  /** Per-item input rates in items/min (parallel to inputItems). */
  inputRates: number[];
  /** Per-item output rates in items/min (parallel to outputItems). */
  outputRates: number[];
  machineCount: number;
  overclockPercent: number;
  [key: string]: unknown;
}

export interface BuilderResourceNodeData {
  itemClassName: string;
  itemName: string;
  rate: number;
  [key: string]: unknown;
}

export interface BuilderSplitterMergerNodeData {
  kind: "splitter" | "merger";
  itemClassName: string;
  [key: string]: unknown;
}

interface BuilderState {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  isDirty: boolean;
  recipeAssignNodeId: string | null;

  addMachineNode: (buildingClassName: string, buildingName: string, position: { x: number; y: number }) => void;
  addResourceNode: (itemClassName: string, itemName: string, position: { x: number; y: number }) => void;
  addSplitterMergerNode: (kind: "splitter" | "merger", position: { x: number; y: number }) => void;
  assignRecipe: (nodeId: string, recipe: IRecipe, items: Map<string, IItem>) => void;
  removeNode: (nodeId: string) => void;
  updateMachineCount: (nodeId: string, count: number, recipes: Map<string, IRecipe>) => void;
  updateOverclock: (nodeId: string, percent: number, recipes: Map<string, IRecipe>) => void;
  updateResourceRate: (nodeId: string, rate: number) => void;
  updateSplitterMergerItem: (nodeId: string, itemClassName: string) => void;
  setSelectedNodeId: (id: string | null) => void;
  setRecipeAssignNodeId: (id: string | null) => void;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  removeEdges: (edgeIds: string[]) => void;
  updateNodePosition: (nodeId: string, x: number, y: number) => void;
  recomputeRates: (recipes: Map<string, IRecipe>, items: Map<string, IItem>, maxTier: number) => void;
  loadFromServer: (nodes: Node[], edges: Edge[]) => void;
  markClean: () => void;
  reset: () => void;
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  isDirty: false,
  recipeAssignNodeId: null,

  addMachineNode: (buildingClassName, buildingName, position) => {
    const fp = getBuildingFootprint(buildingClassName);
    const spriteKey = getSpriteKey(buildingClassName);
    const node: Node = {
      id: genId(),
      type: "builderMachine",
      position,
      data: {
        buildingClassName,
        buildingName,
        recipeClassName: null,
        recipeName: null,
        spriteKey,
        widthPx: fp.w * CELL_PX,
        depthPx: fp.d * CELL_PX,
        inputItems: [],
        outputItems: [],
        inputItemNames: [],
        outputItemNames: [],
        inputRates: [],
        outputRates: [],
        machineCount: 1,
        overclockPercent: 100,
      } satisfies BuilderMachineNodeData,
    };
    set((s) => ({ nodes: [...s.nodes, node], isDirty: true }));
  },

  addResourceNode: (itemClassName, itemName, position) => {
    const node: Node = {
      id: genId(),
      type: "factoryResource",
      position,
      data: {
        itemClassName,
        itemName,
        rate: 0,
      } satisfies BuilderResourceNodeData,
    };
    set((s) => ({ nodes: [...s.nodes, node], isDirty: true }));
  },

  addSplitterMergerNode: (kind, position) => {
    const node: Node = {
      id: genId(),
      type: "splitterMerger",
      position,
      data: {
        kind,
        itemClassName: "",
      } satisfies BuilderSplitterMergerNodeData,
    };
    set((s) => ({ nodes: [...s.nodes, node], isDirty: true }));
  },

  assignRecipe: (nodeId, recipe, items) => {
    set((s) => ({
      nodes: s.nodes.map((n) => {
        if (n.id !== nodeId) return n;
        const data = n.data as BuilderMachineNodeData;
        const fp = getBuildingFootprint(recipe.producedInClass);
        const spriteKey = getSpriteKey(recipe.producedInClass);
        const rates = computeMachineItemRates(recipe, data.machineCount, data.overclockPercent);
        return {
          ...n,
          data: {
            ...data,
            recipeClassName: recipe.className,
            recipeName: recipe.name,
            buildingClassName: recipe.producedInClass ?? data.buildingClassName,
            buildingName: recipe.producedInClass
              ? items.get(recipe.producedInClass)?.name ?? data.buildingName
              : data.buildingName,
            spriteKey,
            widthPx: fp.w * CELL_PX,
            depthPx: fp.d * CELL_PX,
            inputItems: recipe.ingredients.map((i) => i.itemClassName),
            outputItems: recipe.products.map((p) => p.itemClassName),
            inputItemNames: recipe.ingredients.map((i) => items.get(i.itemClassName)?.name ?? i.itemClassName),
            outputItemNames: recipe.products.map((p) => items.get(p.itemClassName)?.name ?? p.itemClassName),
            inputRates: rates.inputs.map((r) => r.ratePerMin),
            outputRates: rates.outputs.map((r) => r.ratePerMin),
          } satisfies BuilderMachineNodeData,
        };
      }),
      isDirty: true,
      recipeAssignNodeId: null,
    }));
  },

  removeNode: (nodeId) => {
    set((s) => ({
      nodes: s.nodes.filter((n) => n.id !== nodeId),
      edges: s.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      selectedNodeId: s.selectedNodeId === nodeId ? null : s.selectedNodeId,
      isDirty: true,
    }));
  },

  updateMachineCount: (nodeId, count, recipes) => {
    set((s) => ({
      nodes: s.nodes.map((n) => {
        if (n.id !== nodeId) return n;
        const d = n.data as BuilderMachineNodeData;
        const recipe = d.recipeClassName ? recipes.get(d.recipeClassName) : undefined;
        if (recipe) {
          const rates = computeMachineItemRates(recipe, count, d.overclockPercent);
          return { ...n, data: { ...d, machineCount: count, inputRates: rates.inputs.map((r) => r.ratePerMin), outputRates: rates.outputs.map((r) => r.ratePerMin) } };
        }
        return { ...n, data: { ...d, machineCount: count } };
      }),
      isDirty: true,
    }));
  },

  updateOverclock: (nodeId, percent, recipes) => {
    set((s) => ({
      nodes: s.nodes.map((n) => {
        if (n.id !== nodeId) return n;
        const d = n.data as BuilderMachineNodeData;
        const recipe = d.recipeClassName ? recipes.get(d.recipeClassName) : undefined;
        if (recipe) {
          const rates = computeMachineItemRates(recipe, d.machineCount, percent);
          return { ...n, data: { ...d, overclockPercent: percent, inputRates: rates.inputs.map((r) => r.ratePerMin), outputRates: rates.outputs.map((r) => r.ratePerMin) } };
        }
        return { ...n, data: { ...d, overclockPercent: percent } };
      }),
      isDirty: true,
    }));
  },

  updateResourceRate: (nodeId, rate) => {
    set((s) => ({
      nodes: s.nodes.map((n) => {
        if (n.id !== nodeId) return n;
        return { ...n, data: { ...n.data, rate } };
      }),
      isDirty: true,
    }));
  },

  updateSplitterMergerItem: (nodeId, itemClassName) => {
    set((s) => ({
      nodes: s.nodes.map((n) => {
        if (n.id !== nodeId) return n;
        return { ...n, data: { ...n.data, itemClassName } };
      }),
      isDirty: true,
    }));
  },

  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  setRecipeAssignNodeId: (id) => set({ recipeAssignNodeId: id }),
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges, isDirty: true }),
  removeEdges: (edgeIds) => {
    const removedSet = new Set(edgeIds);
    set((s) => ({
      edges: s.edges.filter((e) => !removedSet.has(e.id)),
      isDirty: true,
    }));
  },

  updateNodePosition: (nodeId, x, y) => {
    set((s) => ({
      nodes: s.nodes.map((n) => (n.id === nodeId ? { ...n, position: { x, y } } : n)),
      isDirty: true,
    }));
  },

  recomputeRates: (recipes, items, maxTier) => {
    const { nodes, edges } = get();
    const nodeInfos: BuilderNodeInfo[] = nodes
      .filter((n) => n.type === "builderMachine")
      .map((n) => {
        const data = n.data as BuilderMachineNodeData;
        return {
          id: n.id,
          recipeClassName: data.recipeClassName,
          machineCount: data.machineCount,
          overclockPercent: data.overclockPercent,
        };
      });

    const resourceInfos: BuilderResourceInfo[] = nodes
      .filter((n) => n.type === "factoryResource")
      .map((n) => {
        const data = n.data as BuilderResourceNodeData;
        return {
          id: n.id,
          itemClassName: data.itemClassName,
          rate: data.rate,
        };
      });

    const smInfos: BuilderSplitterMergerInfo[] = nodes
      .filter((n) => n.type === "splitterMerger")
      .map((n) => {
        const data = n.data as BuilderSplitterMergerNodeData;
        return {
          id: n.id,
          kind: data.kind,
          itemClassName: data.itemClassName,
        };
      });

    const edgeInfos: BuilderEdgeInfo[] = edges.map((e) => ({
      id: e.id,
      sourceNodeId: e.source,
      targetNodeId: e.target,
      sourceHandle: e.sourceHandle ?? "",
      targetHandle: e.targetHandle ?? "",
    }));

    const computed = computeBuilderRates(nodeInfos, edgeInfos, recipes, items, maxTier, resourceInfos, smInfos);
    const rateMap = new Map(computed.map((c) => [c.edgeId, c]));

    set((s) => ({
      edges: s.edges.map((e) => {
        const rate = rateMap.get(e.id);
        if (!rate) return e;
        return {
          ...e,
          data: {
            ...e.data,
            itemName: rate.itemName,
            rate: rate.rate,
            beltTier: rate.beltTier,
            overCapacity: rate.overCapacity,
            laneIndex: 0,
            laneCount: 1,
          },
        };
      }),
    }));
  },

  loadFromServer: (nodes, edges) => {
    set({ nodes, edges, isDirty: false });
  },

  markClean: () => set({ isDirty: false }),

  reset: () =>
    set({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      isDirty: false,
      recipeAssignNodeId: null,
    }),
}));
