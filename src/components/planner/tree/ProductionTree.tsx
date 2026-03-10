"use client";
import { useCanvasStore } from "@/store/canvasStore";
import type { IProductionStep } from "@/domain/types/solver";
import { TreeNode } from "./TreeNode";
import type { TreeItem } from "./TreeNode";

/**
 * Builds a deduplicated tree rooted at `step`.
 *
 * Each step can appear at most once in the tree — when a shared ingredient
 * (e.g. iron ingots consumed by multiple recipes) is first encountered it is
 * added to `visited` so that later references to the same recipe are skipped.
 * This prevents exponential node duplication for complex production chains.
 */
export function buildStepTree(
  step: IProductionStep,
  allSteps: IProductionStep[],
  visited: Set<string>
): TreeItem {
  visited.add(step.recipeClassName);

  const children = step.inputs.flatMap((input) => {
    const producer = allSteps.find((s) =>
      s.outputs.some((o) => o.itemClassName === input.itemClassName)
    );
    if (!producer || visited.has(producer.recipeClassName)) return [];
    return [buildStepTree(producer, allSteps, visited)];
  });

  return { step, children };
}

export function ProductionTree() {
  const { solverResult } = useCanvasStore();

  if (!solverResult) {
    return (
      <div className="p-6 text-center text-content-muted text-sm">
        Calculate your production chain to see the tree view.
      </div>
    );
  }

  if (!solverResult.steps.length) {
    return (
      <div className="p-6 text-center text-content-muted text-sm">
        No production steps. Add targets and calculate.
      </div>
    );
  }

  // Root steps = steps whose outputs are not consumed by any other step
  const consumedItems = new Set(
    solverResult.steps.flatMap((s) => s.inputs.map((i) => i.itemClassName))
  );
  const rootSteps = solverResult.steps.filter((s) =>
    s.outputs.every((o) => !consumedItems.has(o.itemClassName))
  );

  const displayRoots = rootSteps.length > 0 ? rootSteps : solverResult.steps.slice(0, 1);

  // Pre-compute the deduplicated tree before rendering — avoids mutating props
  // during React's render phase (which breaks React Strict Mode).
  const visited = new Set<string>();
  const treeItems = displayRoots.map((root) =>
    buildStepTree(root, solverResult.steps, visited)
  );

  return (
    <div className="overflow-auto p-4">
      <div className="mb-3 flex items-center justify-between text-xs text-content-muted">
        <span className="font-mono text-brand">{solverResult.steps.length} steps</span>
        <span className="font-mono text-brand">{solverResult.totalPowerKW.toFixed(1)} kW total</span>
      </div>
      <ul role="tree" aria-label="Production chain">
        {treeItems.map((item) => (
          <TreeNode
            key={item.step.recipeClassName}
            item={item}
          />
        ))}
      </ul>
      {solverResult.rawResources.length > 0 && (
        <div className="mt-4 border-t border-surface-border pt-4">
          <h3 className="mb-2 text-xs font-bold text-content-muted uppercase tracking-widest">
            Raw Resources
          </h3>
          <ul className="space-y-1">
            {solverResult.rawResources.map((r) => (
              <li key={r.itemClassName} className="flex justify-between text-xs text-content-secondary">
                <span>{r.itemName}</span>
                <span className="font-mono text-brand">{r.rate.toFixed(2)}/min</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
