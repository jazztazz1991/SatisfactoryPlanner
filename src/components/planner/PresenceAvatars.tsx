"use client";

import { useCanvasStore } from "@/store/canvasStore";

export function PresenceAvatars() {
  const collaborators = useCanvasStore((s) => s.collaborators);
  const isConnected = useCanvasStore((s) => s.isConnected);

  if (!isConnected || collaborators.length === 0) return null;

  return (
    <div className="flex items-center gap-1" aria-label="Online collaborators">
      {collaborators.map((user) => (
        <div
          key={user.userId}
          title={user.name}
          className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white"
          style={{ backgroundColor: user.color }}
        >
          {user.name.charAt(0).toUpperCase()}
        </div>
      ))}
    </div>
  );
}
