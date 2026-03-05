"use client";

import { useCanvasStore } from "@/store/canvasStore";

export function RemoteCursors() {
  const remoteCursors = useCanvasStore((s) => s.remoteCursors);

  if (remoteCursors.size === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden">
      {Array.from(remoteCursors.values()).map((cursor) => (
        <div
          key={cursor.userId}
          className="absolute transition-transform duration-75"
          style={{
            transform: `translate(${cursor.x}px, ${cursor.y}px)`,
          }}
        >
          {/* Cursor arrow */}
          <svg
            width="16"
            height="20"
            viewBox="0 0 16 20"
            fill="none"
            className="drop-shadow-md"
          >
            <path
              d="M0 0L16 12L8 12L4 20L0 0Z"
              fill={cursor.color}
              stroke="white"
              strokeWidth="1"
            />
          </svg>
          {/* Name label */}
          <span
            className="ml-3 -mt-1 inline-block whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-medium text-white"
            style={{ backgroundColor: cursor.color }}
          >
            {cursor.name}
          </span>
        </div>
      ))}
    </div>
  );
}
