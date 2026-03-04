"use client";
import { useState } from "react";
import { useCanvasStore } from "@/store/canvasStore";
import { Input } from "@/components/shared/Input";
import { Button } from "@/components/shared/Button";
import type { MachineNodeData } from "../canvas/nodes/MachineNode";

interface NodeInspectorProps {
  planId: string;
  onUpdate?: (nodeId: string, data: Partial<MachineNodeData>) => void;
  onDelete?: (nodeId: string) => void;
}

export function NodeInspector({ onUpdate, onDelete }: NodeInspectorProps) {
  const { nodes, selectedNodeId } = useCanvasStore();
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const [overclock, setOverclock] = useState<string>("");

  if (!selectedNode) {
    return (
      <div className="p-4 text-sm text-gray-500">
        Select a node to inspect
      </div>
    );
  }

  const data = selectedNode.data as MachineNodeData;

  function handleOverclockChange() {
    const val = Number(overclock);
    if (!isNaN(val) && val >= 1 && val <= 250 && selectedNodeId) {
      onUpdate?.(selectedNodeId, { overclockPercent: val });
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <h2 className="font-semibold text-white">{data.recipeName ?? "Node"}</h2>
      {data.buildingName && (
        <p className="text-xs text-gray-400">{data.buildingName}</p>
      )}
      <div className="text-xs text-gray-300 space-y-1">
        <div>Machines: <span className="text-white">{(data.machineCount ?? 0).toFixed(2)}</span></div>
        <div>Power: <span className="text-white">{(data.powerUsageKW ?? 0).toFixed(1)} kW</span></div>
      </div>
      <Input
        id="overclock"
        label="Overclock %"
        type="number"
        min={1}
        max={250}
        value={overclock || (data.overclockPercent ?? 100)}
        onChange={(e) => setOverclock(e.target.value)}
      />
      <Button size="sm" onClick={handleOverclockChange}>Apply</Button>
      {onDelete && selectedNodeId && (
        <Button
          size="sm"
          variant="danger"
          onClick={() => onDelete(selectedNodeId)}
        >
          Delete Node
        </Button>
      )}
    </div>
  );
}
