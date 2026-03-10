import { Handle, Position, type NodeProps } from "@xyflow/react";
import { CELL_PX } from "../factoryLayout";
import type { FactoryResourceNodeData } from "../factoryLayout";

function formatRate(rate: number): string {
  return rate % 1 === 0 ? `${rate}` : rate.toFixed(1);
}

export function FactoryResourceNode({ data, selected }: NodeProps) {
  const d = data as FactoryResourceNodeData;

  return (
    <div
      style={{ width: CELL_PX, height: CELL_PX }}
      className={`flex flex-col items-center justify-center rounded border-2 bg-green-900/80 ${
        selected ? "border-brand shadow-glow" : "border-green-500"
      }`}
    >
      <div className="truncate px-1 text-center text-[8px] font-medium text-green-300">{d.itemName}</div>
      <div className="text-[7px] font-mono text-green-500">{formatRate(d.rate)}/m</div>
      <Handle
        type="source"
        position={Position.Right}
        id={`out-${d.itemClassName}`}
        style={{ background: "#f97316", width: 8, height: 8 }}
      />
    </div>
  );
}
