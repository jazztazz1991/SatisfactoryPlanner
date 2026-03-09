import { create } from "zustand";
import type { Node, Edge } from "@xyflow/react";
import type { ISolverOutput } from "@/domain/types/solver";
import { DEFAULT_FLOOR_CONFIG, type FloorConfig } from "@/domain/factory/floorAssignment";

export interface RemoteCursor {
  userId: string;
  name: string;
  color: string;
  x: number;
  y: number;
}

export interface Collaborator {
  userId: string;
  name: string;
  color: string;
}

interface CanvasState {
  nodes: Node[];
  edges: Edge[];
  solverResult: ISolverOutput | null;
  maxTier: number;
  selectedNodeId: string | null;

  // Collaboration state
  collaborators: Collaborator[];
  remoteCursors: Map<string, RemoteCursor>;
  remoteFactoryPositions: Record<string, { x: number; y: number }> | null;
  remoteNewEdge: Edge | null;
  isConnected: boolean;

  // Floor state
  floorConfig: FloorConfig;
  activeFloor: number;
  floorCount: number;

  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  updateNodePosition: (id: string, x: number, y: number) => void;
  setSolverResult: (result: ISolverOutput | null) => void;
  setMaxTier: (tier: number) => void;
  setSelectedNodeId: (id: string | null) => void;

  // Collaboration actions
  setCollaborators: (users: Collaborator[]) => void;
  updateRemoteCursor: (cursor: RemoteCursor) => void;
  removeRemoteCursor: (userId: string) => void;
  setRemoteFactoryPositions: (positions: Record<string, { x: number; y: number }> | null) => void;
  setRemoteNewEdge: (edge: Edge | null) => void;
  setIsConnected: (connected: boolean) => void;

  // Floor actions
  setFloorConfig: (config: FloorConfig) => void;
  setActiveFloor: (floor: number) => void;
  setFloorCount: (count: number) => void;

  reset: () => void;
}

export const useCanvasStore = create<CanvasState>((set) => ({
  nodes: [],
  edges: [],
  solverResult: null,
  maxTier: 9,
  selectedNodeId: null,
  collaborators: [],
  remoteCursors: new Map(),
  remoteFactoryPositions: null,
  remoteNewEdge: null,
  isConnected: false,
  floorConfig: DEFAULT_FLOOR_CONFIG,
  activeFloor: 0,
  floorCount: 1,

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  updateNodePosition: (id, x, y) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === id ? { ...n, position: { x, y } } : n
      ),
    })),

  setSolverResult: (result) => set({ solverResult: result }),
  setMaxTier: (tier) => set({ maxTier: tier }),
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),

  setCollaborators: (users) => set({ collaborators: users }),
  updateRemoteCursor: (cursor) =>
    set((state) => {
      const next = new Map(state.remoteCursors);
      next.set(cursor.userId, cursor);
      return { remoteCursors: next };
    }),
  removeRemoteCursor: (userId) =>
    set((state) => {
      const next = new Map(state.remoteCursors);
      next.delete(userId);
      return { remoteCursors: next };
    }),
  setRemoteFactoryPositions: (positions) => set({ remoteFactoryPositions: positions }),
  setRemoteNewEdge: (edge) => set({ remoteNewEdge: edge }),
  setIsConnected: (connected) => set({ isConnected: connected }),
  setFloorConfig: (config) => set({ floorConfig: config }),
  setActiveFloor: (floor) => set({ activeFloor: floor }),
  setFloorCount: (count) => set({ floorCount: count }),

  reset: () =>
    set({
      nodes: [],
      edges: [],
      solverResult: null,
      maxTier: 9,
      selectedNodeId: null,
      collaborators: [],
      remoteCursors: new Map(),
      remoteFactoryPositions: null,
      remoteNewEdge: null,
      isConnected: false,
      floorConfig: DEFAULT_FLOOR_CONFIG,
      activeFloor: 0,
      floorCount: 1,
    }),
}));
