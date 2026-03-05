import { Handle, Position, type NodeProps } from "@xyflow/react";
import { CELL_PX } from "../factoryLayout";

export interface SplitterMergerNodeData {
  kind: "splitter" | "merger";
  itemClassName: string;
  [key: string]: unknown;
}

export function SplitterMergerNode({ data, selected }: NodeProps) {
  const d = data as SplitterMergerNodeData;
  const isSplitter = d.kind === "splitter";
  const bg = isSplitter ? "bg-amber-700/80" : "bg-teal-700/80";
  const border = selected ? "border-yellow-400" : isSplitter ? "border-amber-400" : "border-teal-400";
  const label = isSplitter ? "S" : "M";

  return (
    <div
      style={{ width: CELL_PX, height: CELL_PX }}
      className={`flex items-center justify-center rounded border-2 ${bg} ${border}`}
    >
      <span className="text-[10px] font-bold text-white/90">{label}</span>

      {/* Bus handles: top (in) and bottom (out) for vertical chain */}
      <Handle type="target" position={Position.Top} id={`bus-in-${d.itemClassName}`} />
      <Handle type="source" position={Position.Bottom} id={`bus-out-${d.itemClassName}`} />

      {/* Branch handle: right (out) for splitter, left (in) for merger */}
      {isSplitter ? (
        <Handle type="source" position={Position.Right} id={`branch-out-${d.itemClassName}`} />
      ) : (
        <Handle type="target" position={Position.Left} id={`branch-in-${d.itemClassName}`} />
      )}
    </div>
  );
}
