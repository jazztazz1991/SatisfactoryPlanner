"use client";
import { useState, useEffect, useCallback } from "react";

type ViewMode = "graph" | "tree" | "factory" | "builder";

interface ControlSection {
  title: string;
  items: string[];
}

const GRAPH_CONTROLS: ControlSection[] = [
  {
    title: "Navigation",
    items: [
      "Scroll to zoom in/out",
      "Drag background to pan",
      "Use minimap for overview",
    ],
  },
  {
    title: "Nodes",
    items: [
      "Click node to select",
      "Drag node to reposition",
      "Click background to deselect",
    ],
  },
  {
    title: "Sidebar",
    items: [
      "Click node to edit in inspector",
      "Search recipes to add targets",
    ],
  },
];

const FACTORY_CONTROLS: ControlSection[] = [
  {
    title: "Navigation",
    items: [
      "Scroll to zoom (0.05x \u2013 4x)",
      "Drag background to pan",
    ],
  },
  {
    title: "Buildings",
    items: [
      "Drag to reposition (snaps to grid)",
      "S = Splitter, M = Merger",
    ],
  },
  {
    title: "Belts",
    items: [
      "Colors indicate belt tier (Mk1\u2013Mk6)",
      "Red dashed line = over capacity",
    ],
  },
];

const TREE_CONTROLS: ControlSection[] = [
  {
    title: "Navigation",
    items: [
      "Click \u25B6/\u25BC to expand/collapse branches",
      "Scroll to view full tree",
    ],
  },
  {
    title: "Reading the Tree",
    items: [
      "Numbers show machine count and power",
      "Indentation shows dependency depth",
    ],
  },
];

const BUILDER_CONTROLS: ControlSection[] = [
  {
    title: "Placing",
    items: [
      "Click toolbar buttons to add machines",
      "S = Splitter (1→3), M = Merger (3→1)",
      "Drag nodes to reposition (snaps to grid)",
    ],
  },
  {
    title: "Recipes",
    items: [
      "Double-click a machine to assign a recipe",
      "Handles appear after recipe assignment",
    ],
  },
  {
    title: "Belts",
    items: [
      "Drag from output (orange) to input (blue) handle",
      "Belt rate auto-calculates from recipe",
    ],
  },
];

function getControlsForView(viewMode: ViewMode): ControlSection[] {
  switch (viewMode) {
    case "graph":
      return GRAPH_CONTROLS;
    case "factory":
      return FACTORY_CONTROLS;
    case "builder":
      return BUILDER_CONTROLS;
    case "tree":
      return TREE_CONTROLS;
  }
}

function CollapsibleSection({ section }: { section: ControlSection }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div>
      <button
        aria-expanded={!collapsed}
        onClick={() => setCollapsed((c) => !c)}
        className="flex w-full items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-content-muted hover:text-brand"
      >
        <span className="w-3 text-content-muted">{collapsed ? "\u25B6" : "\u25BC"}</span>
        {section.title}
      </button>
      {!collapsed && (
        <ul className="mt-1 ml-4.5 flex flex-col gap-0.5">
          {section.items.map((item) => (
            <li key={item} className="text-xs text-content-secondary">
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface ControlsPanelProps {
  viewMode: ViewMode;
  onClose: () => void;
}

export function ControlsPanel({ viewMode, onClose }: ControlsPanelProps) {
  const sections = getControlsForView(viewMode);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const viewLabel = viewMode === "graph" ? "Graph" : viewMode === "factory" ? "Factory" : viewMode === "builder" ? "Builder" : "Tree";

  return (
    <div
      role="region"
      aria-label="Controls help panel"
      className="absolute bottom-4 left-4 z-50 w-64 glass glass-border rounded-xl shadow-card"
    >
      <div className="flex items-center justify-between border-b border-surface-border px-4 py-3">
        <span className="text-xs font-bold uppercase tracking-widest text-content-muted">
          {viewLabel} Controls
        </span>
        <button
          aria-label="Close controls panel"
          onClick={onClose}
          className="text-content-secondary hover:text-content"
        >
          &times;
        </button>
      </div>
      <div className="flex flex-col gap-2.5 p-3">
        {sections.map((section) => (
          <CollapsibleSection key={section.title} section={section} />
        ))}
      </div>
    </div>
  );
}
