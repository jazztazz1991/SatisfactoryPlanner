import { Handle, Position, type NodeProps } from "@xyflow/react";

export interface ResourceNodeData {
  itemName: string;
  rate: number;
  [key: string]: unknown;
}

export function ResourceNode({ data, selected }: NodeProps) {
  const d = data as ResourceNodeData;
  return (
    <div
      className={`min-w-[140px] rounded-lg border-2 bg-green-900/40 p-3 text-sm shadow-lg transition-colors ${
        selected ? "border-orange-500" : "border-green-700"
      }`}
    >
      <div className="font-semibold text-green-300">{d.itemName}</div>
      <div className="mt-1 text-xs text-green-400">{d.rate.toFixed(2)}/min</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
