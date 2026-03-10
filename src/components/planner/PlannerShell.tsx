"use client";
import { useState, useEffect, useRef, useCallback, startTransition } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCanvasStore } from "@/store/canvasStore";
import { PlanCanvas } from "./canvas/PlanCanvas";
import { ProductionTree } from "./tree/ProductionTree";
import { FactoryCanvas } from "./factory/FactoryCanvas";
import { TargetList } from "./targets/TargetList";
import { RecipePicker } from "./sidebar/RecipePicker";
import { NodeInspector } from "./sidebar/NodeInspector";
import { ShareDialog } from "./ShareDialog";
import { ControlsPanel } from "./ControlsPanel";
import { PresenceAvatars } from "./PresenceAvatars";
import { RemoteCursors } from "./RemoteCursors";
import { useCollaboration } from "@/hooks/useCollaboration";
import { useCursorTracking } from "@/hooks/useCursors";
import { Button } from "@/components/shared/Button";
import { BuilderCanvas } from "./builder/BuilderCanvas";
import { BuilderNodeInspector } from "./builder/BuilderNodeInspector";
import { useBuilderStore } from "@/store/builderStore";
import { ReactFlowProvider } from "@xyflow/react";
import type { ViewMode, CollaboratorRole, IPlanTarget, IPlan } from "@/domain/types/plan";
import type { ISolverOutput, IProductionStep, IRawResourceRequirement } from "@/domain/types/solver";
import type { IRecipe } from "@/domain/types/game";
import type { Node, Edge } from "@xyflow/react";

function solverOutputToGraph(result: ISolverOutput): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Assign a column depth to each step based on how many inputs come from other steps
  const stepIds = new Set(result.steps.map((s) => s.recipeClassName));
  const producedBy = new Map<string, string>(); // itemClassName → recipeClassName that produces it
  result.steps.forEach((step) => {
    step.outputs.forEach((o) => producedBy.set(o.itemClassName, step.recipeClassName));
  });

  // Topological depth: steps with no step-produced inputs are depth 0
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

  const NODE_W = 240;
  const NODE_H = 130;
  const GAP_X = 40;
  const GAP_Y = 60;

  columns.forEach((steps, col) => {
    steps.forEach((step, row) => {
      nodes.push({
        id: `step-${step.recipeClassName}`,
        type: "machine",
        position: { x: row * (NODE_W + GAP_X), y: col * (NODE_H + GAP_Y) },
        data: {
          recipeName: step.recipeName,
          buildingName: step.buildingName ?? "",
          machineCount: step.machineCount,
          overclockPercent: 100,
          powerUsageKW: step.powerUsageKW,
        },
      });
    });
  });

  // Raw resource nodes above the top row
  result.rawResources.forEach((r: IRawResourceRequirement, i) => {
    nodes.push({
      id: `raw-${r.itemClassName}`,
      type: "resource",
      position: { x: i * (NODE_W + GAP_X), y: -(NODE_H + GAP_Y) },
      data: { itemName: r.itemName, rate: r.rate },
    });
  });

  // Edges: step→step and raw→step
  result.steps.forEach((step) => {
    step.inputs.forEach((input) => {
      const producerRecipe = producedBy.get(input.itemClassName);
      if (producerRecipe && stepIds.has(producerRecipe)) {
        edges.push({
          id: `e-${producerRecipe}-${step.recipeClassName}-${input.itemClassName}`,
          source: `step-${producerRecipe}`,
          target: `step-${step.recipeClassName}`,
          type: "rate",
          data: { rate: input.rate, itemName: input.itemName },
        });
      } else {
        // Check if it's a raw resource
        const isRaw = result.rawResources.some((r) => r.itemClassName === input.itemClassName);
        if (isRaw) {
          edges.push({
            id: `e-raw-${input.itemClassName}-${step.recipeClassName}`,
            source: `raw-${input.itemClassName}`,
            target: `step-${step.recipeClassName}`,
            type: "rate",
            data: { rate: input.rate, itemName: input.itemName },
          });
        }
      }
    });
  });

  return { nodes, edges };
}

type ShellViewMode = ViewMode | "factory" | "builder";

interface PlannerShellProps {
  planId: string;
  initialViewMode: ViewMode;
  maxTier?: number;
  shareToken?: string | null;
  shareRole?: CollaboratorRole | null;
}

async function calculate(planId: string): Promise<ISolverOutput> {
  const res = await fetch(`/api/plans/${planId}/calculate`, { method: "POST" });
  if (!res.ok) throw new Error("Calculation failed");
  return res.json();
}

export function PlannerShell({ planId, initialViewMode, maxTier: initialMaxTier = 9, shareToken, shareRole }: PlannerShellProps) {
  const [viewMode, setViewMode] = useState<ShellViewMode>(initialViewMode);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [controlsOpen, setControlsOpen] = useState(false);
  const { setSolverResult, setMaxTier, setNodes, setEdges, solverResult, nodes, edges, maxTier, setFloorConfig } = useCanvasStore();
  const queryClient = useQueryClient();

  useEffect(() => { setMaxTier(initialMaxTier); }, [initialMaxTier, setMaxTier]);

  // Load saved calculation and factory node positions on mount
  const [factoryPositions, setFactoryPositions] = useState<Record<string, { x: number; y: number }> | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch(`/api/plans/${planId}/calculate`).then((res) => (res.ok ? res.json() : null)),
      fetch(`/api/plans/${planId}`).then((res) => (res.ok ? res.json() : null)),
    ])
      .then(([saved, plan]: [ISolverOutput | null, IPlan | null]) => {
        if (cancelled) return;
        if (saved) setSolverResult(saved);
        if (plan?.factoryNodePositions) {
          setFactoryPositions(plan.factoryNodePositions);
        }
        if (plan?.floorConfig) {
          setFloorConfig(plan.floorConfig);
        }
      })
      .catch(() => { /* ignore — user can re-calculate manually */ });
    return () => { cancelled = true; };
  }, [planId, setSolverResult]);

  const { sendCursorPosition, broadcastSolverResult, broadcastNodePositions, broadcastEdgeCreated, broadcastFloorConfigChanged } = useCollaboration(planId);
  const remoteFactoryPositions = useCanvasStore((s) => s.remoteFactoryPositions);
  const remoteNewEdge = useCanvasStore((s) => s.remoteNewEdge);
  const { onMouseMove } = useCursorTracking(sendCursorPosition);

  // Save factory node positions (debounced)
  const factoryPositionTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const saveFactoryPositions = useCallback(
    (positions: Record<string, { x: number; y: number }>) => {
      setFactoryPositions(positions);
      broadcastNodePositions("factory", positions);
      clearTimeout(factoryPositionTimer.current);
      factoryPositionTimer.current = setTimeout(() => {
        fetch(`/api/plans/${planId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ factoryNodePositions: positions }),
        }).catch(() => { /* best-effort save */ });
      }, 500);
    },
    [planId, broadcastNodePositions]
  );

  // Subscribe to targets so we can auto-recalculate when they change
  const { data: targets } = useQuery<IPlanTarget[]>({
    queryKey: ["targets", planId],
    queryFn: async () => {
      const res = await fetch(`/api/plans/${planId}/targets`);
      if (!res.ok) throw new Error("Failed to fetch targets");
      return res.json();
    },
  });

  // Auto-recalculate when targets or tier change (debounced, skip initial mount)
  const hasInitialized = useRef(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const targetsFingerprint = targets?.map((t) => `${t.itemClassName}:${t.targetRate}`).join(",") ?? "";

  // Track whether calc was triggered manually (to switch view) vs auto
  const manualCalcRef = useRef(false);

  const calcMutation = useMutation({
    mutationFn: () => calculate(planId),
    onSuccess: (result) => {
      setSolverResult(result);
      broadcastSolverResult(result);
      // Clear saved factory positions so the fresh layout is used
      setFactoryPositions(null);
      // Only switch to tree view on manual Calculate click
      if (manualCalcRef.current) {
        setViewMode("tree");
        manualCalcRef.current = false;
      }
    },
  });

  const handleManualCalculate = useCallback(() => {
    manualCalcRef.current = true;
    calcMutation.mutate();
  }, [calcMutation]);

  const tierMutation = useMutation({
    mutationFn: (tier: number) =>
      fetch(`/api/plans/${planId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maxTier: tier }),
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to update tier");
        return res.json();
      }),
    onSuccess: (_data, tier) => {
      setMaxTier(tier);
    },
  });

  const addTargetFromRecipe = useMutation({
    mutationFn: (recipe: IRecipe) => {
      const primaryOutput = recipe.products[0];
      if (!primaryOutput) throw new Error("Recipe has no outputs");
      const ratePerMin = (primaryOutput.amountPerCycle / recipe.timeSeconds) * 60;
      return fetch(`/api/plans/${planId}/targets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemClassName: primaryOutput.itemClassName,
          targetRate: Math.round(ratePerMin * 100) / 100,
        }),
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to create target");
        return res.json();
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["targets", planId] }),
  });

  // Save graph node positions when dragged
  const nodePositionTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const saveNodePosition = useCallback(
    (nodeId: string, x: number, y: number) => {
      broadcastNodePositions("graph", { [nodeId]: { x, y } });
      const existing = nodePositionTimers.current.get(nodeId);
      if (existing) clearTimeout(existing);
      nodePositionTimers.current.set(
        nodeId,
        setTimeout(() => {
          fetch(`/api/plans/${planId}/nodes/${nodeId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ positionX: x, positionY: y }),
          }).catch(() => { /* best-effort save */ });
          nodePositionTimers.current.delete(nodeId);
        }, 300)
      );
    },
    [planId, broadcastNodePositions]
  );

  const handleNodeUpdate = useCallback(
    (nodeId: string, data: Partial<{ overclockPercent: number }>) => {
      setNodes(
        nodes.map((n) =>
          n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n
        )
      );
    },
    [nodes, setNodes]
  );

  const handleNodeDelete = useCallback(
    (nodeId: string) => {
      setNodes(nodes.filter((n) => n.id !== nodeId));
      setEdges(edges.filter((e) => e.source !== nodeId && e.target !== nodeId));
    },
    [nodes, edges, setNodes, setEdges]
  );

  const handleGraphEdgeCreate = useCallback(
    (edge: Edge) => { broadcastEdgeCreated("graph", edge); },
    [broadcastEdgeCreated]
  );

  const handleFactoryEdgeCreate = useCallback(
    (edge: Edge) => { broadcastEdgeCreated("factory", edge); },
    [broadcastEdgeCreated]
  );

  const floorConfigTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const handleFloorConfigChange = useCallback(
    (config: { floorWidth: number; floorDepth: number }) => {
      broadcastFloorConfigChanged(config);
      clearTimeout(floorConfigTimer.current);
      floorConfigTimer.current = setTimeout(() => {
        fetch(`/api/plans/${planId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ floorConfig: config }),
        }).catch(() => { /* best-effort save */ });
      }, 500);
    },
    [planId, broadcastFloorConfigChanged]
  );

  function switchToGraph() {
    // Only (re)build graph nodes when the user explicitly opens the graph view.
    // Use startTransition so React keeps the UI responsive during the render.
    if (solverResult && nodes.length === 0) {
      startTransition(() => {
        const { nodes: gNodes, edges: gEdges } = solverOutputToGraph(solverResult);
        setNodes(gNodes);
        setEdges(gEdges);
      });
    }
    setViewMode("graph");
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Main canvas area */}
      <div className="relative flex flex-1 flex-col">
        {/* Canvas */}
        <div className="relative flex-1 overflow-hidden" onMouseMove={onMouseMove}>
          <RemoteCursors />
          {controlsOpen && (
            <ControlsPanel
              viewMode={viewMode}
              onClose={() => setControlsOpen(false)}
            />
          )}
          {viewMode === "graph" ? (
            <PlanCanvas planId={planId} onNodePositionChange={saveNodePosition} onEdgeCreate={handleGraphEdgeCreate} />
          ) : viewMode === "factory" ? (
            <FactoryCanvas
              savedPositions={factoryPositions}
              onNodePositionChange={saveFactoryPositions}
              remotePositions={remoteFactoryPositions}
              onEdgeCreate={handleFactoryEdgeCreate}
              remoteNewEdge={remoteNewEdge}
              onFloorConfigChange={handleFloorConfigChange}
            />
          ) : viewMode === "builder" ? (
            <ReactFlowProvider>
              <BuilderCanvas planId={planId} maxTier={maxTier} />
            </ReactFlowProvider>
          ) : (
            <ProductionTree />
          )}
        </div>

        {/* Floating bottom toolbar */}
        <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2">
          <div className="glass glass-border flex items-center gap-2 rounded-full px-3 py-2 shadow-card">
            <div className="flex gap-1">
              {(
                [
                  { key: "graph", label: "Graph", action: switchToGraph },
                  { key: "tree", label: "Tree", action: () => setViewMode("tree") },
                  { key: "factory", label: "Factory", action: () => setViewMode("factory") },
                  { key: "builder", label: "Builder", action: () => setViewMode("builder") },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  aria-pressed={viewMode === tab.key}
                  onClick={tab.action}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                    viewMode === tab.key
                      ? "gradient-brand text-content-inverse rounded-full shadow-glow"
                      : "text-content-muted rounded-full hover:text-brand"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="mx-1 h-5 w-px bg-surface-border" />

            <Button
              size="sm"
              onClick={handleManualCalculate}
              loading={calcMutation.isPending}
            >
              Calc
            </Button>

            <label className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-content-muted">
              T
              <select
                value={maxTier}
                onChange={(e) => tierMutation.mutate(Number(e.target.value))}
                className="rounded-lg border border-surface-border bg-surface-overlay px-1.5 py-1 text-[10px] text-content"
              >
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </label>

            <button
              aria-pressed={controlsOpen}
              aria-label={controlsOpen ? "Hide controls" : "Show controls"}
              onClick={() => setControlsOpen((o) => !o)}
              className={`h-7 w-7 rounded-full text-[10px] font-bold transition-colors ${
                controlsOpen
                  ? "gradient-brand text-content-inverse shadow-glow"
                  : "text-content-muted hover:text-brand"
              }`}
            >
              ?
            </button>

            <div className="mx-1 h-5 w-px bg-surface-border" />

            <PresenceAvatars />
            <Button size="sm" onClick={() => setShareDialogOpen(true)}>
              Share
            </Button>
          </div>
          {calcMutation.isError && (
            <div className="mt-1 text-center text-[10px] text-danger-light">Calculation failed</div>
          )}
        </div>
      </div>

      {/* Right sidebar (was left) */}
      <aside className="flex w-72 flex-col gap-2 border-l border-surface-border bg-surface-raised overflow-y-auto">
        <TargetList planId={planId} />
        <div className="border-t border-surface-border" />
        <RecipePicker onSelect={(recipe) => addTargetFromRecipe.mutate(recipe)} />
        <div className="border-t border-surface-border" />
        {viewMode === "builder" ? (
          <BuilderNodeInspector
            onReassignRecipe={(nodeId) => useBuilderStore.getState().setRecipeAssignNodeId(nodeId)}
          />
        ) : (
          <NodeInspector planId={planId} onUpdate={handleNodeUpdate} onDelete={handleNodeDelete} />
        )}
      </aside>

      <ShareDialog
        planId={planId}
        isOpen={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        shareToken={shareToken ?? null}
        shareRole={shareRole ?? null}
      />
    </div>
  );
}
