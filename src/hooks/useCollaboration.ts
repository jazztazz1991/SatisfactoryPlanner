"use client";

import { useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { getSocket, disconnectSocket } from "@/lib/socketClient";
import { useCanvasStore } from "@/store/canvasStore";
import type { ISolverOutput } from "@/domain/types/solver";

export function useCollaboration(planId: string) {
  const { data: session } = useSession();
  const socketRef = useRef(getSocket());

  const setCollaborators = useCanvasStore((s) => s.setCollaborators);
  const updateRemoteCursor = useCanvasStore((s) => s.updateRemoteCursor);
  const removeRemoteCursor = useCanvasStore((s) => s.removeRemoteCursor);
  const setIsConnected = useCanvasStore((s) => s.setIsConnected);
  const setSolverResult = useCanvasStore((s) => s.setSolverResult);

  useEffect(() => {
    const socket = socketRef.current;

    if (!session?.user?.id) return;

    socket.connect();

    socket.on("connect", () => {
      setIsConnected(true);
      socket.emit("join-plan", {
        planId,
        userId: session.user!.id,
        userName: session.user!.name ?? "Anonymous",
      });
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("presence", (data: { users: Array<{ userId: string; name: string; color: string }> }) => {
      setCollaborators(data.users);
    });

    socket.on("cursor-update", (data: { userId: string; name: string; color: string; x: number; y: number }) => {
      updateRemoteCursor(data);
    });

    socket.on("cursor-remove", (data: { userId: string }) => {
      removeRemoteCursor(data.userId);
    });

    socket.on("target-changed", () => {
      // Invalidate react-query cache for targets
      // This will be handled by the component that uses this hook
    });

    socket.on("solver-result", (data: { result: ISolverOutput }) => {
      setSolverResult(data.result);
    });

    return () => {
      socket.emit("leave-plan");
      socket.off("connect");
      socket.off("disconnect");
      socket.off("presence");
      socket.off("cursor-update");
      socket.off("cursor-remove");
      socket.off("target-changed");
      socket.off("solver-result");
      disconnectSocket();
      setIsConnected(false);
    };
  }, [planId, session?.user?.id, session?.user?.name, setCollaborators, updateRemoteCursor, removeRemoteCursor, setIsConnected, setSolverResult]);

  const sendCursorPosition = useCallback((x: number, y: number) => {
    socketRef.current.emit("cursor-move", { x, y });
  }, []);

  const broadcastTargetChange = useCallback((action: string, target: unknown) => {
    socketRef.current.emit("target-changed", { action, target });
  }, []);

  const broadcastSolverResult = useCallback((result: ISolverOutput) => {
    socketRef.current.emit("solver-result", { result });
  }, []);

  return {
    sendCursorPosition,
    broadcastTargetChange,
    broadcastSolverResult,
  };
}
