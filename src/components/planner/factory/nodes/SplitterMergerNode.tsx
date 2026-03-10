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
  const border = selected ? "border-brand shadow-glow" : isSplitter ? "border-amber-400" : "border-teal-400";
  const label = isSplitter ? "S" : "M";

  return (
    <div
      style={{ width: CELL_PX, height: CELL_PX }}
      className={`flex items-center justify-center rounded border-2 ${bg} ${border}`}
    >
      <span className="text-[10px] font-bold text-white/90">{label}</span>

      {isSplitter ? (
        <>
          {/* Splitter: 1 input (top/bus-in), 3 outputs (right, bottom/bus-out, left) */}
          <Handle type="target" position={Position.Top} id={`bus-in-${d.itemClassName}`} style={{ background: "#3b82f6", width: 8, height: 8 }} />
          <Handle type="source" position={Position.Right} id={`branch-out-${d.itemClassName}`} style={{ background: "#f97316", width: 8, height: 8 }} />
          <Handle type="source" position={Position.Bottom} id={`bus-out-${d.itemClassName}`} style={{ background: "#f97316", width: 8, height: 8 }} />
          <Handle type="source" position={Position.Left} id={`branch-out-left-${d.itemClassName}`} style={{ background: "#f97316", width: 8, height: 8 }} />
        </>
      ) : (
        <>
          {/* Merger: 3 inputs (left, top/bus-in, right), 1 output (bottom/bus-out) */}
          <Handle type="target" position={Position.Top} id={`bus-in-${d.itemClassName}`} style={{ background: "#3b82f6", width: 8, height: 8 }} />
          <Handle type="target" position={Position.Left} id={`branch-in-${d.itemClassName}`} style={{ background: "#3b82f6", width: 8, height: 8 }} />
          <Handle type="target" position={Position.Right} id={`branch-in-right-${d.itemClassName}`} style={{ background: "#3b82f6", width: 8, height: 8 }} />
          <Handle type="source" position={Position.Bottom} id={`bus-out-${d.itemClassName}`} style={{ background: "#f97316", width: 8, height: 8 }} />
        </>
      )}
    </div>
  );
}
