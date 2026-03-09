import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { BlueprintMachineNodeData } from "../factoryLayout";
import type { SpriteKey } from "@/domain/factory/buildingSprites";

const BUILDING_COLORS: Partial<Record<SpriteKey, { bg: string; border: string }>> = {
  smelter: { bg: "bg-amber-900/80", border: "border-amber-500" },
  constructor: { bg: "bg-blue-900/80", border: "border-blue-500" },
  assembler: { bg: "bg-green-900/80", border: "border-green-500" },
  manufacturer: { bg: "bg-purple-900/80", border: "border-purple-500" },
  foundry: { bg: "bg-orange-900/80", border: "border-orange-500" },
  refinery: { bg: "bg-cyan-900/80", border: "border-cyan-500" },
  blender: { bg: "bg-teal-900/80", border: "border-teal-500" },
  packager: { bg: "bg-indigo-900/80", border: "border-indigo-500" },
  particle_accelerator: { bg: "bg-pink-900/80", border: "border-pink-500" },
  miner: { bg: "bg-lime-900/80", border: "border-lime-500" },
};

const DEFAULT_COLORS = { bg: "bg-gray-800", border: "border-gray-500" };

export function BlueprintMachineNode({ data, selected }: NodeProps) {
  const d = data as BlueprintMachineNodeData;
  const colors = BUILDING_COLORS[d.spriteKey] ?? DEFAULT_COLORS;
  const selectedBorder = selected ? "border-yellow-400" : colors.border;

  return (
    <div
      style={{ width: d.widthPx, height: d.depthPx }}
      className={`flex flex-col items-center justify-center rounded border-2 ${colors.bg} ${selectedBorder}`}
    >
      <span className="truncate px-1 text-center text-[10px] font-bold text-white/90">
        {d.buildingName ?? "Building"}
      </span>
      <span className="truncate px-1 text-center text-[8px] text-white/60">
        {d.recipeName}
      </span>

      {d.inputItems.map((item, i) => (
        <Handle
          key={`in-${item}`}
          type="target"
          position={Position.Left}
          id={`in-${item}`}
          style={{ top: (d.depthPx / (d.inputItems.length + 1)) * (i + 1), background: "#3b82f6", width: 8, height: 8 }}
        />
      ))}

      {d.outputItems.map((item, i) => (
        <Handle
          key={`out-${item}`}
          type="source"
          position={Position.Right}
          id={`out-${item}`}
          style={{ top: (d.depthPx / (d.outputItems.length + 1)) * (i + 1), background: "#f97316", width: 8, height: 8 }}
        />
      ))}
    </div>
  );
}
