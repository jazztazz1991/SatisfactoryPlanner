"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  type Node,
  type Edge,
  type NodeChange,
  type NodePositionChange,
  type EdgeChange,
  type Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useQuery } from "@tanstack/react-query";
import { useBuilderStore, type BuilderMachineNodeData, type BuilderSplitterMergerNodeData } from "@/store/builderStore";
import { validateConnection, parseHandleItem } from "@/domain/builder/connectionValidation";
import { computeMachineItemRates } from "@/domain/builder/rateCalculation";
import { getBuildingFootprint } from "@/domain/factory/buildingFootprints";
import { getSpriteKey, getSpriteLabel } from "@/domain/factory/buildingSprites";
import { CELL_PX } from "@/components/planner/factory/factoryLayout";
import { BuilderMachineNode } from "./nodes/BuilderMachineNode";
import { FactoryResourceNode } from "@/components/planner/factory/nodes/FactoryResourceNode";
import { SplitterMergerNode } from "@/components/planner/factory/nodes/SplitterMergerNode";
import { BeltEdge } from "@/components/planner/factory/edges/BeltEdge";
import { BuilderToolbar } from "./BuilderToolbar";
import { RecipeAssignDialog } from "./RecipeAssignDialog";
import type { IRecipe, IItem } from "@/domain/types/game";

/** Generate a UUID, falling back when crypto.randomUUID is unavailable (non-HTTPS). */
function genId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  const h = () => Math.random().toString(16).slice(2, 10);
  return `${h()}-${h().slice(0, 4)}-4${h().slice(1, 4)}-${(8 + Math.floor(Math.random() * 4)).toString(16)}${h().slice(1, 4)}-${h()}${h().slice(0, 4)}`;
}

const nodeTypes = {
  builderMachine: BuilderMachineNode,
  factoryResource: FactoryResourceNode,
  splitterMerger: SplitterMergerNode,
};

const edgeTypes = {
  belt: BeltEdge,
};

function snapToGrid(value: number): number {
  return Math.round(value / CELL_PX) * CELL_PX;
}

interface BuilderCanvasProps {
  planId: string;
  maxTier: number;
}

export function BuilderCanvas({ planId, maxTier }: BuilderCanvasProps) {
  const store = useBuilderStore();
  const { screenToFlowPosition } = useReactFlow();
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadedRef = useRef(false);

  // Fetch game data
  const { data: recipes = [] } = useQuery<IRecipe[]>({
    queryKey: ["recipes"],
    queryFn: () => fetch("/api/game-data/recipes").then((r) => r.json()),
  });
  const { data: items = [] } = useQuery<IItem[]>({
    queryKey: ["items"],
    queryFn: () => fetch("/api/game-data/items").then((r) => r.json()),
  });

  const recipeMap = useMemo(() => new Map(recipes.map((r) => [r.className, r])), [recipes]);
  const itemMap = useMemo(() => new Map(items.map((i) => [i.className, i])), [items]);

  // Load builder data from server once recipes are available
  useEffect(() => {
    if (loadedRef.current || recipeMap.size === 0) return;
    loadedRef.current = true;
    fetch(`/api/plans/${planId}/builder`)
      .then((r) => r.json())
      .then((data) => {
        if (data.nodes && data.edges) {
          // Convert server nodes to ReactFlow nodes
          const rfNodes: Node[] = data.nodes.map((n: any) => ({
            id: n.id,
            type: n.nodeType === "resource" ? "factoryResource"
              : n.nodeType === "splitter" ? "splitterMerger"
              : n.nodeType === "merger" ? "splitterMerger"
              : "builderMachine",
            position: { x: n.positionX, y: n.positionY },
            data: n.nodeType === "resource"
              ? { itemClassName: n.recipeClassName ?? "", itemName: n.buildingClassName ?? "", rate: n.machineCount ?? 0 }
              : n.nodeType === "splitter" || n.nodeType === "merger"
              ? { kind: n.nodeType, itemClassName: n.recipeClassName ?? "" }
              : (() => {
                  const recipe = n.recipeClassName ? recipeMap.get(n.recipeClassName) : undefined;
                  const bldgClass = recipe?.producedInClass ?? n.buildingClassName ?? "";
                  const spriteKey = getSpriteKey(bldgClass);
                  const fp = getBuildingFootprint(bldgClass);
                  const rates = recipe ? computeMachineItemRates(recipe, n.machineCount ?? 1, n.overclockPercent ?? 100) : undefined;
                  return {
                    buildingClassName: bldgClass,
                    buildingName: getSpriteLabel(spriteKey),
                    recipeClassName: n.recipeClassName,
                    recipeName: recipe?.name ?? null,
                    spriteKey,
                    widthPx: fp.w * CELL_PX,
                    depthPx: fp.d * CELL_PX,
                    inputItems: recipe?.ingredients.map((i: any) => i.itemClassName) ?? [],
                    outputItems: recipe?.products.map((p: any) => p.itemClassName) ?? [],
                    inputItemNames: recipe?.ingredients.map((i: any) => itemMap.get(i.itemClassName)?.name ?? i.itemClassName) ?? [],
                    outputItemNames: recipe?.products.map((p: any) => itemMap.get(p.itemClassName)?.name ?? p.itemClassName) ?? [],
                    inputRates: rates?.inputs.map((r) => r.ratePerMin) ?? [],
                    outputRates: rates?.outputs.map((r) => r.ratePerMin) ?? [],
                    machineCount: n.machineCount ?? 1,
                    overclockPercent: n.overclockPercent ?? 100,
                  };
                })(),
          }));
          const rfEdges: Edge[] = data.edges.map((e: any) => ({
            id: e.id,
            source: e.sourceNodeId,
            target: e.targetNodeId,
            sourceHandle: e.sourceHandle ?? `out-${e.itemClassName}`,
            targetHandle: e.targetHandle ?? `in-${e.itemClassName}`,
            type: "belt",
            data: { itemName: e.itemClassName, rate: e.rate, beltTier: 1, laneIndex: 0, laneCount: 1 },
          }));
          store.loadFromServer(rfNodes, rfEdges);
          // Recompute rates after loading
          if (recipeMap.size > 0) {
            store.recomputeRates(recipeMap, itemMap, maxTier);
          }
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId, recipeMap.size]);

  // Local ReactFlow state synced from store
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    setNodes(store.nodes);
  }, [store.nodes, setNodes]);

  useEffect(() => {
    setEdges(store.edges);
  }, [store.edges, setEdges]);

  // Recompute belt rates whenever nodes change (rate, machineCount, overclock, recipe)
  const nodeDataHash = useMemo(() => {
    return store.nodes.map((n) => {
      const d = n.data as Record<string, unknown>;
      return `${n.id}:${d.rate ?? ""}:${d.machineCount ?? ""}:${d.overclockPercent ?? ""}:${d.recipeClassName ?? ""}:${d.itemClassName ?? ""}`;
    }).join("|");
  }, [store.nodes]);

  useEffect(() => {
    if (recipeMap.size > 0 && store.edges.length > 0) {
      store.recomputeRates(recipeMap, itemMap, maxTier);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeDataHash, recipeMap, itemMap, maxTier]);

  // Auto-save (debounced) — deps must NOT include the full `store` object
  // because any state change (selection, etc.) would reset the debounce timer.
  const isDirty = store.isDirty;
  const storeNodes = store.nodes;
  const storeEdges = store.edges;
  const markClean = store.markClean;

  useEffect(() => {
    if (!isDirty) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const nodeData = storeNodes.map((n) => {
        const d = n.data as any;
        let nodeType: string = "machine";
        if (n.type === "factoryResource") nodeType = "resource";
        else if (n.type === "splitterMerger") nodeType = d.kind; // "splitter" or "merger"

        return {
          id: n.id,
          recipeClassName: d.recipeClassName ?? d.itemClassName ?? null,
          buildingClassName: d.buildingClassName ?? d.itemName ?? null,
          machineCount: d.machineCount ?? d.rate ?? 1,
          overclockPercent: d.overclockPercent ?? 100,
          useAlternate: false,
          positionX: n.position.x,
          positionY: n.position.y,
          nodeType,
        };
      });
      const edgeData = storeEdges.map((e) => ({
        id: e.id,
        sourceNodeId: e.source,
        targetNodeId: e.target,
        sourceHandle: e.sourceHandle ?? "",
        targetHandle: e.targetHandle ?? "",
        itemClassName: (e.data as any)?.itemName ?? "",
        rate: (e.data as any)?.rate ?? 0,
      }));
      console.log("[Builder] Saving:", nodeData.length, "nodes,", edgeData.length, "edges");
      fetch(`/api/plans/${planId}/builder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodes: nodeData, edges: edgeData }),
      }).then((res) => {
        if (!res.ok) {
          res.json().then((body) => console.error("[Builder] Save FAILED:", res.status, body)).catch(() => {});
        } else {
          console.log("[Builder] Save OK");
          markClean();
        }
      }).catch((e) => console.error("[Builder] Save error:", e));
    }, 1500);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [isDirty, storeNodes, storeEdges, planId, markClean]);

  const handleAddMachine = useCallback(
    (buildingClassName: string, buildingName: string) => {
      const center = screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
      const snapped = { x: snapToGrid(center.x), y: snapToGrid(center.y) };
      store.addMachineNode(buildingClassName, buildingName, snapped);
    },
    [screenToFlowPosition, store],
  );

  const handleAddResource = useCallback(() => {
    const center = screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    const snapped = { x: snapToGrid(center.x), y: snapToGrid(center.y) };
    store.addResourceNode("Desc_OreIron_C", "Iron Ore", snapped);
  }, [screenToFlowPosition, store]);

  const handleAddSplitterMerger = useCallback(
    (kind: "splitter" | "merger") => {
      const center = screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
      const snapped = { x: snapToGrid(center.x), y: snapToGrid(center.y) };
      store.addSplitterMergerNode(kind, snapped);
    },
    [screenToFlowPosition, store],
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      const sourceHandle = connection.sourceHandle ?? "";
      const targetHandle = connection.targetHandle ?? "";

      const result = validateConnection(
        {
          source: connection.source,
          target: connection.target,
          sourceHandle,
          targetHandle,
        },
        store.edges.map((e) => ({
          sourceNodeId: e.source,
          targetNodeId: e.target,
          sourceHandle: e.sourceHandle ?? "",
          targetHandle: e.targetHandle ?? "",
        })),
      );
      if (!result.valid) return;

      const resolvedItem = result.resolvedItem ?? parseHandleItem(sourceHandle) ?? "";

      // If source or target is an unassigned splitter/merger, assign the item
      const sourceNode = store.nodes.find((n) => n.id === connection.source);
      const targetNode = store.nodes.find((n) => n.id === connection.target);
      let finalSourceHandle = sourceHandle;
      let finalTargetHandle = targetHandle;

      if (sourceNode?.type === "splitterMerger" && resolvedItem) {
        const sd = sourceNode.data as BuilderSplitterMergerNodeData;
        if (!sd.itemClassName) {
          store.updateSplitterMergerItem(sourceNode.id, resolvedItem);
          // Fix the handle ID: replace empty suffix with the resolved item
          finalSourceHandle = sourceHandle + resolvedItem;
        }
      }
      if (targetNode?.type === "splitterMerger" && resolvedItem) {
        const td = targetNode.data as BuilderSplitterMergerNodeData;
        if (!td.itemClassName) {
          store.updateSplitterMergerItem(targetNode.id, resolvedItem);
          finalTargetHandle = targetHandle + resolvedItem;
        }
      }

      const newEdge: Edge = {
        id: genId(),
        source: connection.source,
        target: connection.target,
        sourceHandle: finalSourceHandle || undefined,
        targetHandle: finalTargetHandle || undefined,
        type: "belt",
        data: { itemName: resolvedItem, rate: 0, beltTier: 1, laneIndex: 0, laneCount: 1 },
      };
      store.setEdges([...store.edges, newEdge]);
      store.recomputeRates(recipeMap, itemMap, maxTier);
    },
    [store, recipeMap, itemMap, maxTier],
  );

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // Handle removals in the store so they persist
      for (const change of changes) {
        if (change.type === "remove") {
          store.removeNode(change.id);
        }
      }

      const snappedChanges = changes.map((change) => {
        if (change.type === "position" && change.position) {
          const posChange = change as NodePositionChange;
          return {
            ...posChange,
            position: {
              x: snapToGrid(posChange.position!.x),
              y: snapToGrid(posChange.position!.y),
            },
          };
        }
        return change;
      });
      onNodesChange(snappedChanges);
    },
    [onNodesChange, store],
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      // Sync edge removals to the store so they persist
      const removedIds = changes
        .filter((c) => c.type === "remove")
        .map((c) => c.id);
      if (removedIds.length > 0) {
        store.removeEdges(removedIds);
      }
      onEdgesChange(changes);
    },
    [onEdgesChange, store],
  );

  const handleNodeDragStop = useCallback(
    (_event: unknown, node: Node) => {
      store.updateNodePosition(node.id, node.position.x, node.position.y);
    },
    [store],
  );

  const handleNodeDoubleClick = useCallback(
    (_event: unknown, node: Node) => {
      if (node.type === "builderMachine") {
        store.setRecipeAssignNodeId(node.id);
      }
    },
    [store],
  );

  const handleNodeClick = useCallback(
    (_event: unknown, node: Node) => {
      store.setSelectedNodeId(node.id);
    },
    [store],
  );

  const handlePaneClick = useCallback(() => {
    store.setSelectedNodeId(null);
  }, [store]);

  const handleRecipeSelect = useCallback(
    (recipe: IRecipe) => {
      if (store.recipeAssignNodeId) {
        store.assignRecipe(store.recipeAssignNodeId, recipe, itemMap);
        store.recomputeRates(recipeMap, itemMap, maxTier);
      }
    },
    [store, itemMap, recipeMap, maxTier],
  );

  // Get building class for recipe dialog filtering
  const assignNode = store.nodes.find((n) => n.id === store.recipeAssignNodeId);
  const assignBuildingClass = assignNode
    ? (assignNode.data as BuilderMachineNodeData).buildingClassName
    : null;

  return (
    <div className="flex h-full w-full flex-col">
      <BuilderToolbar
        onAddMachine={handleAddMachine}
        onAddResource={handleAddResource}
        onAddSplitterMerger={handleAddSplitterMerger}
      />
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onNodeDragStop={handleNodeDragStop}
          onNodeDoubleClick={handleNodeDoubleClick}
          onNodeClick={handleNodeClick}
          onPaneClick={handlePaneClick}
          onConnect={handleConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          minZoom={0.05}
          maxZoom={4}
          snapToGrid
          snapGrid={[CELL_PX, CELL_PX]}
          colorMode="dark"
        >
          <Background variant={BackgroundVariant.Lines} gap={CELL_PX} color="rgba(75, 85, 99, 0.35)" />
          <Controls />
          <MiniMap nodeColor="#f59e0b" />
        </ReactFlow>
      </div>

      <RecipeAssignDialog
        open={store.recipeAssignNodeId !== null}
        buildingClassName={assignBuildingClass}
        recipes={recipes}
        onSelect={handleRecipeSelect}
        onClose={() => store.setRecipeAssignNodeId(null)}
      />
    </div>
  );
}
