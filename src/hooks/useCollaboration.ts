"use client";

import { useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { getSocket, disconnectSocket } from "@/lib/socketClient";
import { useCanvasStore } from "@/store/canvasStore";
import { useBuilderStore } from "@/store/builderStore";
import type { ISolverOutput } from "@/domain/types/solver";
import type { FloorConfig } from "@/domain/factory/floorAssignment";
import type { Edge } from "@xyflow/react";

export function useCollaboration(planId: string) {
  const { data: session } = useSession();
  const socketRef = useRef(getSocket());

  const setCollaborators = useCanvasStore((s) => s.setCollaborators);
  const updateRemoteCursor = useCanvasStore((s) => s.updateRemoteCursor);
  const removeRemoteCursor = useCanvasStore((s) => s.removeRemoteCursor);
  const setIsConnected = useCanvasStore((s) => s.setIsConnected);
  const setSolverResult = useCanvasStore((s) => s.setSolverResult);
  const updateNodePosition = useCanvasStore((s) => s.updateNodePosition);
  const setRemoteFactoryPositions = useCanvasStore((s) => s.setRemoteFactoryPositions);
  const setRemoteNewEdge = useCanvasStore((s) => s.setRemoteNewEdge);
  const setFloorConfig = useCanvasStore((s) => s.setFloorConfig);

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

    socket.on("node-positions-changed", (data: { viewMode: string; positions: Record<string, { x: number; y: number }> }) => {
      if (data.viewMode === "graph") {
        for (const [id, pos] of Object.entries(data.positions)) {
          updateNodePosition(id, pos.x, pos.y);
        }
      } else if (data.viewMode === "factory") {
        setRemoteFactoryPositions(data.positions);
      } else if (data.viewMode === "builder") {
        const bStore = useBuilderStore.getState();
        for (const [id, pos] of Object.entries(data.positions)) {
          bStore.updateNodePosition(id, pos.x, pos.y);
        }
      }
    });

    socket.on("edge-created", (data: { viewMode: string; edge: Edge }) => {
      if (data.viewMode === "graph") {
        const store = useCanvasStore.getState();
        store.setEdges([...store.edges, data.edge]);
      } else if (data.viewMode === "factory") {
        setRemoteNewEdge(data.edge);
      } else if (data.viewMode === "builder") {
        const bStore = useBuilderStore.getState();
        bStore.setEdges([...bStore.edges, data.edge]);
      }
    });

    socket.on("floor-config-changed", (data: { floorConfig: FloorConfig }) => {
      setFloorConfig(data.floorConfig);
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
      socket.off("node-positions-changed");
      socket.off("edge-created");
      socket.off("floor-config-changed");
      disconnectSocket();
      setIsConnected(false);
    };
  }, [planId, session?.user?.id, session?.user?.name, setCollaborators, updateRemoteCursor, removeRemoteCursor, setIsConnected, setSolverResult, updateNodePosition, setRemoteFactoryPositions, setRemoteNewEdge, setFloorConfig]);

  const sendCursorPosition = useCallback((x: number, y: number) => {
    socketRef.current.emit("cursor-move", { x, y });
  }, []);

  const broadcastTargetChange = useCallback((action: string, target: unknown) => {
    socketRef.current.emit("target-changed", { action, target });
  }, []);

  const broadcastSolverResult = useCallback((result: ISolverOutput) => {
    socketRef.current.emit("solver-result", { result });
  }, []);

  const broadcastNodePositions = useCallback((viewMode: "graph" | "factory" | "builder", positions: Record<string, { x: number; y: number }>) => {
    socketRef.current.emit("node-positions-changed", { viewMode, positions });
  }, []);

  const broadcastEdgeCreated = useCallback((viewMode: "graph" | "factory" | "builder", edge: unknown) => {
    socketRef.current.emit("edge-created", { viewMode, edge });
  }, []);

  const broadcastFloorConfigChanged = useCallback((floorConfig: FloorConfig) => {
    socketRef.current.emit("floor-config-changed", { floorConfig });
  }, []);

  return {
    sendCursorPosition,
    broadcastTargetChange,
    broadcastSolverResult,
    broadcastNodePositions,
    broadcastEdgeCreated,
    broadcastFloorConfigChanged,
  };
}
