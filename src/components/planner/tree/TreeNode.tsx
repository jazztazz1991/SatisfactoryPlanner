"use client";
import { useState } from "react";
import type { IProductionStep } from "@/domain/types/solver";

/** Pre-built tree node — each step appears at most once across the tree. */
export interface TreeItem {
  step: IProductionStep;
  children: TreeItem[];
}

interface TreeNodeProps {
  item: TreeItem;
  depth?: number;
}

export function TreeNode({ item, depth = 0 }: TreeNodeProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { step, children } = item;
  const hasChildren = children.length > 0;

  return (
    <li style={{ paddingLeft: `${depth * 16}px` }} className="my-1">
      <div className="flex items-center gap-2 rounded-xl bg-surface-overlay px-3 py-2 text-sm border border-surface-border">
        {hasChildren && (
          <button
            aria-expanded={!collapsed}
            aria-label={collapsed ? `Expand ${step.recipeName}` : `Collapse ${step.recipeName}`}
            onClick={() => setCollapsed((c) => !c)}
            className="w-4 text-content-muted hover:text-brand"
          >
            {collapsed ? "▶" : "▼"}
          </button>
        )}
        {!hasChildren && <span className="w-4" />}
        <span className="font-medium text-content">{step.recipeName}</span>
        <span className="ml-auto text-xs font-mono text-brand">
          ×{step.machineCount.toFixed(2)} — {step.powerUsageKW.toFixed(1)} kW
        </span>
      </div>
      {!collapsed && hasChildren && (
        <ul className="mt-1">
          {children.map((child) => (
            <TreeNode
              key={`${child.step.recipeClassName}-${depth}`}
              item={child}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
