"use client";

import { useMemo, useState } from "react";
import { useBuilderStore, type BuilderMachineNodeData } from "@/store/builderStore";
import { useQuery } from "@tanstack/react-query";
import type { IRecipe } from "@/domain/types/game";

interface BuilderNodeInspectorProps {
  onReassignRecipe: (nodeId: string) => void;
  onRateChange?: () => void;
}

export function BuilderNodeInspector({ onReassignRecipe, onRateChange }: BuilderNodeInspectorProps) {
  const { data: recipesArr = [] } = useQuery<IRecipe[]>({
    queryKey: ["recipes"],
    queryFn: () => fetch("/api/game-data/recipes").then((r) => r.json()),
  });
  const recipes = useMemo(() => new Map(recipesArr.map((r) => [r.className, r])), [recipesArr]);
  const selectedNodeId = useBuilderStore((s) => s.selectedNodeId);
  const nodes = useBuilderStore((s) => s.nodes);
  const updateMachineCount = useBuilderStore((s) => s.updateMachineCount);
  const updateOverclock = useBuilderStore((s) => s.updateOverclock);
  const updateResourceRate = useBuilderStore((s) => s.updateResourceRate);
  const removeNode = useBuilderStore((s) => s.removeNode);

  const node = nodes.find((n) => n.id === selectedNodeId);
  const [machineInput, setMachineInput] = useState("");
  const [overclockInput, setOverclockInput] = useState("");
  const [rateInput, setRateInput] = useState("");

  if (!node) {
    return (
      <div className="p-3 text-xs text-gray-500">
        Select a node to inspect.
      </div>
    );
  }

  const isSplitterMerger = node.type === "splitterMerger";

  if (isSplitterMerger) {
    const data = node.data as { kind: "splitter" | "merger"; itemClassName: string };
    const label = data.kind === "splitter" ? "Splitter" : "Merger";
    return (
      <div className="space-y-2 p-3">
        <h3 className="text-sm font-medium text-white">{label}</h3>
        <p className="text-xs text-gray-400">
          {data.kind === "splitter" ? "1 input, 3 outputs" : "3 inputs, 1 output"}
        </p>
        {data.itemClassName && (
          <p className="text-xs text-gray-500">Item: {data.itemClassName}</p>
        )}
        <button
          onClick={() => removeNode(node.id)}
          className="w-full rounded bg-red-800 px-2 py-1 text-xs text-red-200 hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    );
  }

  const isResource = node.type === "factoryResource";

  if (isResource) {
    const data = node.data as { itemName: string; rate: number };
    return (
      <div className="space-y-2 p-3">
        <h3 className="text-sm font-medium text-white">{data.itemName}</h3>
        <p className="text-xs text-gray-400">Resource Source</p>

        <label className="flex items-center justify-between text-xs text-gray-400">
          <span>Rate /min</span>
          <input
            type="number"
            min={0}
            max={99999}
            step={1}
            value={rateInput || data.rate}
            onChange={(e) => {
              setRateInput(e.target.value);
              const val = parseFloat(e.target.value);
              if (!isNaN(val) && val >= 0) {
                updateResourceRate(node.id, val);
                onRateChange?.();
              }
            }}
            onBlur={() => setRateInput("")}
            className="w-20 rounded border border-gray-600 bg-gray-900 px-2 py-0.5 text-xs text-white"
            aria-label="Resource rate"
          />
        </label>

        <button
          onClick={() => removeNode(node.id)}
          className="w-full rounded bg-red-800 px-2 py-1 text-xs text-red-200 hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    );
  }

  const data = node.data as BuilderMachineNodeData;

  return (
    <div className="space-y-3 p-3">
      <div>
        <h3 className="text-sm font-medium text-white">{data.buildingName}</h3>
        {data.recipeName && (
          <p className="text-xs text-gray-400">{data.recipeName}</p>
        )}
      </div>

      <button
        onClick={() => onReassignRecipe(node.id)}
        className="w-full rounded bg-orange-800 px-2 py-1 text-xs text-orange-200 hover:bg-orange-700"
      >
        {data.recipeClassName ? "Change Recipe" : "Assign Recipe"}
      </button>

      <label className="flex items-center justify-between text-xs text-gray-400">
        <span>Machines</span>
        <input
          type="number"
          min={1}
          max={100}
          value={machineInput || data.machineCount}
          onChange={(e) => {
            setMachineInput(e.target.value);
            const val = parseInt(e.target.value);
            if (val >= 1 && val <= 100) {
              updateMachineCount(node.id, val, recipes);
              onRateChange?.();
            }
          }}
          onBlur={() => setMachineInput("")}
          className="w-16 rounded border border-gray-600 bg-gray-900 px-2 py-0.5 text-xs text-white"
          aria-label="Machine count"
        />
      </label>

      <label className="flex items-center justify-between text-xs text-gray-400">
        <span>Overclock %</span>
        <input
          type="number"
          min={1}
          max={250}
          value={overclockInput || data.overclockPercent}
          onChange={(e) => {
            setOverclockInput(e.target.value);
            const val = parseInt(e.target.value);
            if (val >= 1 && val <= 250) {
              updateOverclock(node.id, val, recipes);
              onRateChange?.();
            }
          }}
          onBlur={() => setOverclockInput("")}
          className="w-16 rounded border border-gray-600 bg-gray-900 px-2 py-0.5 text-xs text-white"
          aria-label="Overclock percent"
        />
      </label>

      <button
        onClick={() => removeNode(node.id)}
        className="w-full rounded bg-red-800 px-2 py-1 text-xs text-red-200 hover:bg-red-700"
      >
        Delete Node
      </button>
    </div>
  );
}
