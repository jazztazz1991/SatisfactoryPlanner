import { Handle, Position, type NodeProps } from "@xyflow/react";

export interface SinkNodeData {
  itemName: string;
  rate: number;
  [key: string]: unknown;
}

export function SinkNode({ data, selected }: NodeProps) {
  const d = data as SinkNodeData;
  return (
    <div
      className={`min-w-[140px] rounded-lg border-2 bg-purple-900/40 p-3 text-sm shadow-lg transition-colors ${
        selected ? "border-orange-500" : "border-purple-700"
      }`}
    >
      <Handle type="target" position={Position.Top} style={{ background: "#3b82f6", width: 10, height: 10 }} />
      <div className="font-semibold text-purple-300">{d.itemName}</div>
      <div className="mt-1 text-xs text-purple-400">{d.rate.toFixed(2)}/min</div>
    </div>
  );
}
