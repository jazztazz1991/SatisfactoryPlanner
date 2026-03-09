import { Handle, Position, type NodeProps } from "@xyflow/react";
import { CELL_PX } from "../factoryLayout";
import type { LiftNodeData } from "@/domain/factory/floorAssignment";

export function LiftNode({ data, selected }: NodeProps) {
  const d = data as LiftNodeData;
  const isDown = d.direction === "down";
  const arrow = isDown ? "▼" : "▲";
  const bg = isDown ? "bg-violet-800/80" : "bg-violet-800/80";
  const border = selected ? "border-yellow-400" : "border-violet-400";

  return (
    <div
      style={{ width: CELL_PX, height: CELL_PX }}
      className={`flex flex-col items-center justify-center rounded border-2 ${bg} ${border}`}
    >
      <span className="text-[12px] font-bold text-violet-200">{arrow}</span>
      <span className="text-[7px] text-violet-300">F{d.connectedFloor + 1}</span>
      <div className="truncate px-0.5 text-center text-[6px] text-violet-400">{d.itemName}</div>

      <Handle
        type="target"
        position={isDown ? Position.Left : Position.Top}
        id="lift-in"
        style={{ background: "#3b82f6", width: 8, height: 8 }}
      />
      <Handle
        type="source"
        position={isDown ? Position.Bottom : Position.Right}
        id="lift-out"
        style={{ background: "#f97316", width: 8, height: 8 }}
      />
    </div>
  );
}
