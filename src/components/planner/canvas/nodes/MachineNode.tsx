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
      className={`min-w-[180px] rounded-xl border-2 bg-surface-raised p-4 text-sm transition-colors ${
        selected ? "border-brand shadow-glow" : "border-surface-border"
      }`}
    >
      <Handle type="target" position={Position.Top} style={{ background: "#3b82f6", width: 10, height: 10 }} />
      <div className="mb-1 font-semibold text-content">{d.recipeName}</div>
      {d.buildingName && (
        <div className="text-xs text-content-muted uppercase tracking-widest">{d.buildingName}</div>
      )}
      <div className="mt-2 flex gap-3 text-xs text-content-secondary">
        <span className="font-mono text-brand">×{d.machineCount.toFixed(2)}</span>
        <span className="font-mono">{d.overclockPercent}%</span>
        <span className="font-mono">{d.powerUsageKW.toFixed(1)} kW</span>
      </div>
      <Handle type="source" position={Position.Bottom} style={{ background: "#f97316", width: 10, height: 10 }} />
    </div>
  );
}
