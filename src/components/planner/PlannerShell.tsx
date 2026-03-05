"use client";
import { useState, startTransition } from "react";
import { useMutation } from "@tanstack/react-query";
import { useCanvasStore } from "@/store/canvasStore";
import { PlanCanvas } from "./canvas/PlanCanvas";
import { ProductionTree } from "./tree/ProductionTree";
import { FactoryCanvas } from "./factory/FactoryCanvas";
import { TargetList } from "./targets/TargetList";
import { RecipePicker } from "./sidebar/RecipePicker";
import { NodeInspector } from "./sidebar/NodeInspector";
import { ShareDialog } from "./ShareDialog";
import { PresenceAvatars } from "./PresenceAvatars";
import { RemoteCursors } from "./RemoteCursors";
import { useCollaboration } from "@/hooks/useCollaboration";
import { useCursorTracking } from "@/hooks/useCursors";
import { Button } from "@/components/shared/Button";
import type { ViewMode, CollaboratorRole } from "@/domain/types/plan";
import type { ISolverOutput, IProductionStep, IRawResourceRequirement } from "@/domain/types/solver";
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

type ShellViewMode = ViewMode | "factory";

interface PlannerShellProps {
  planId: string;
  initialViewMode: ViewMode;
  shareToken?: string | null;
  shareRole?: CollaboratorRole | null;
}

async function calculate(planId: string): Promise<ISolverOutput> {
  const res = await fetch(`/api/plans/${planId}/calculate`, { method: "POST" });
  if (!res.ok) throw new Error("Calculation failed");
  return res.json();
}

export function PlannerShell({ planId, initialViewMode, shareToken, shareRole }: PlannerShellProps) {
  const [viewMode, setViewMode] = useState<ShellViewMode>(initialViewMode);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const { setSolverResult, setNodes, setEdges, solverResult, nodes } = useCanvasStore();

  const { sendCursorPosition, broadcastSolverResult } = useCollaboration(planId);
  const { onMouseMove } = useCursorTracking(sendCursorPosition);

  const calcMutation = useMutation({
    mutationFn: () => calculate(planId),
    onSuccess: (result) => {
      // Store the result and show tree view immediately — don't block the
      // main thread by converting to graph nodes here.
      setSolverResult(result);
      broadcastSolverResult(result);
      setViewMode("tree");
    },
  });

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
    <div className="flex h-[calc(100vh-56px)] overflow-hidden">
      {/* Left sidebar */}
      <aside className="flex w-64 flex-col gap-2 border-r border-gray-800 bg-gray-900 overflow-y-auto">
        <TargetList planId={planId} />
        <div className="border-t border-gray-800" />
        <RecipePicker onSelect={() => {}} />
        <div className="border-t border-gray-800" />
        <NodeInspector planId={planId} />
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col">
        {/* Toolbar */}
        <div className="flex items-center gap-3 border-b border-gray-800 bg-gray-900 px-4 py-2">
          <div className="flex rounded border border-gray-700 overflow-hidden">
            <button
              aria-pressed={viewMode === "graph"}
              onClick={switchToGraph}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === "graph"
                  ? "bg-orange-500 text-white"
                  : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              Graph
            </button>
            <button
              aria-pressed={viewMode === "tree"}
              onClick={() => setViewMode("tree")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === "tree"
                  ? "bg-orange-500 text-white"
                  : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              Tree
            </button>
            <button
              aria-pressed={viewMode === "factory"}
              onClick={() => setViewMode("factory")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === "factory"
                  ? "bg-orange-500 text-white"
                  : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              Factory
            </button>
          </div>
          <Button
            size="sm"
            onClick={() => calcMutation.mutate()}
            loading={calcMutation.isPending}
          >
            Calculate
          </Button>
          {calcMutation.isError && (
            <span className="text-xs text-red-400">Calculation failed</span>
          )}

          <div className="ml-auto flex items-center gap-2">
            <PresenceAvatars />
            <Button size="sm" onClick={() => setShareDialogOpen(true)}>
              Share
            </Button>
          </div>
        </div>

        {/* View */}
        <div className="relative flex-1 overflow-hidden" onMouseMove={onMouseMove}>
          <RemoteCursors />
          {viewMode === "graph" ? (
            <PlanCanvas planId={planId} />
          ) : viewMode === "factory" ? (
            <FactoryCanvas />
          ) : (
            <ProductionTree />
          )}
        </div>
      </div>

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
