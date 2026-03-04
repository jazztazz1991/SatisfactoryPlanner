import { Handle, Position, type NodeProps } from "@xyflow/react";

export interface SplitterData {
  itemName: string;
  rate: number;
  [key: string]: unknown;
}

export function SplitterNode({ data }: NodeProps) {
  const d = data as SplitterData;
  return (
    <div className="relative flex h-20 w-20 items-center justify-center">
      <div className="absolute h-14 w-14 rotate-45 rounded bg-amber-500" />
      <div className="relative z-10 text-center">
        <div className="text-xs font-semibold leading-tight text-gray-900">{d.itemName}</div>
        <div className="text-xs text-gray-900">{d.rate.toFixed(1)}/min</div>
      </div>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
