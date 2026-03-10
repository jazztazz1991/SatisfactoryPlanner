import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { BuilderMachineNodeData } from "@/store/builderStore";
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

const DEFAULT_COLORS = { bg: "bg-surface-raised", border: "border-surface-border" };

function formatRate(rate: number): string {
  if (rate === Math.floor(rate)) return String(rate);
  return rate.toFixed(1);
}

export function BuilderMachineNode({ data, selected }: NodeProps) {
  const d = data as BuilderMachineNodeData;
  const isAssigned = d.recipeClassName !== null;
  const colors = isAssigned
    ? (BUILDING_COLORS[d.spriteKey as SpriteKey] ?? DEFAULT_COLORS)
    : DEFAULT_COLORS;
  const selectedBorder = selected ? "border-brand shadow-glow" : colors.border;

  if (!isAssigned) {
    return (
      <div
        style={{ width: d.widthPx, height: d.depthPx }}
        className={`flex flex-col items-center justify-center rounded border-2 border-dashed ${DEFAULT_COLORS.bg} ${selectedBorder}`}
      >
        <span className="truncate px-1 text-center text-[10px] font-bold text-white/90">
          {d.buildingName}
        </span>
        <span className="truncate px-1 text-center text-[8px] text-orange-400">
          Double-click to assign
        </span>
      </div>
    );
  }

  const multiInput = d.inputItems.length > 1;
  const multiOutput = d.outputItems.length > 1;

  return (
    <div
      style={{ width: d.widthPx, height: d.depthPx }}
      className={`relative flex flex-col items-center justify-center rounded border-2 ${colors.bg} ${selectedBorder}`}
    >
      <span className="truncate px-1 text-center text-[10px] font-bold text-white/90">
        {d.buildingName}
      </span>
      <span className="truncate px-1 text-center text-[8px] text-white/60">
        {d.recipeName}
      </span>
      {d.machineCount > 1 && (
        <span className="text-[7px] text-white/40">×{d.machineCount}</span>
      )}

      {d.inputItems.map((item, i) => {
        const handleTop = (d.depthPx / (d.inputItems.length + 1)) * (i + 1);
        const rate = d.inputRates?.[i];
        const itemName = d.inputItemNames?.[i];
        return (
          <div key={`in-${item}`}>
            <Handle
              type="target"
              position={Position.Left}
              id={`in-${item}`}
              style={{ top: handleTop, background: "#3b82f6", width: 8, height: 8 }}
            />
            {rate != null && rate > 0 && (
              <span
                className="pointer-events-none absolute whitespace-nowrap text-[7px] font-medium text-blue-400"
                style={{ left: 10, top: handleTop - 5 }}
              >
                {multiInput && itemName ? `${itemName} ` : ""}{formatRate(rate)}/m
              </span>
            )}
          </div>
        );
      })}

      {d.outputItems.map((item, i) => {
        const handleTop = (d.depthPx / (d.outputItems.length + 1)) * (i + 1);
        const rate = d.outputRates?.[i];
        const itemName = d.outputItemNames?.[i];
        return (
          <div key={`out-${item}`}>
            <Handle
              type="source"
              position={Position.Right}
              id={`out-${item}`}
              style={{ top: handleTop, background: "#f97316", width: 8, height: 8 }}
            />
            {rate != null && rate > 0 && (
              <span
                className="pointer-events-none absolute whitespace-nowrap text-[7px] font-medium text-orange-400"
                style={{ right: 10, top: handleTop - 5 }}
              >
                {formatRate(rate)}/m{multiOutput && itemName ? ` ${itemName}` : ""}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
