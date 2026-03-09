import { Handle, Position, type NodeProps } from "@xyflow/react";

export interface MachineNodeData {
  recipeName: string;
  buildingName: string | null;
  machineCount: number;
  overclockPercent: number;
  powerUsageKW: number;
  [key: string]: unknown;
}

export function MachineNode({ data, selected }: NodeProps) {
  const d = data as MachineNodeData;
  return (
    <div
      className={`min-w-[180px] rounded-lg border-2 bg-gray-800 p-3 text-sm shadow-lg transition-colors ${
        selected ? "border-orange-500" : "border-gray-600"
      }`}
    >
      <Handle type="target" position={Position.Top} style={{ background: "#3b82f6", width: 10, height: 10 }} />
      <div className="mb-1 font-semibold text-white">{d.recipeName}</div>
      {d.buildingName && (
        <div className="text-xs text-gray-400">{d.buildingName}</div>
      )}
      <div className="mt-2 flex gap-3 text-xs text-gray-300">
        <span>×{d.machineCount.toFixed(2)}</span>
        <span>{d.overclockPercent}%</span>
        <span>{d.powerUsageKW.toFixed(1)} kW</span>
      </div>
      <Handle type="source" position={Position.Bottom} style={{ background: "#f97316", width: 10, height: 10 }} />
    </div>
  );
}
