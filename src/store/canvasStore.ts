import { create } from "zustand";
import type { Node, Edge } from "@xyflow/react";
import type { ISolverOutput } from "@/domain/types/solver";

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
  selectedNodeId: string | null;

  // Collaboration state
  collaborators: Collaborator[];
  remoteCursors: Map<string, RemoteCursor>;
  isConnected: boolean;

  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  updateNodePosition: (id: string, x: number, y: number) => void;
  setSolverResult: (result: ISolverOutput | null) => void;
  setSelectedNodeId: (id: string | null) => void;

  // Collaboration actions
  setCollaborators: (users: Collaborator[]) => void;
  updateRemoteCursor: (cursor: RemoteCursor) => void;
  removeRemoteCursor: (userId: string) => void;
  setIsConnected: (connected: boolean) => void;

  reset: () => void;
}

export const useCanvasStore = create<CanvasState>((set) => ({
  nodes: [],
  edges: [],
  solverResult: null,
  selectedNodeId: null,
  collaborators: [],
  remoteCursors: new Map(),
  isConnected: false,

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  updateNodePosition: (id, x, y) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === id ? { ...n, position: { x, y } } : n
      ),
    })),

  setSolverResult: (result) => set({ solverResult: result }),
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
  setIsConnected: (connected) => set({ isConnected: connected }),

  reset: () =>
    set({
      nodes: [],
      edges: [],
      solverResult: null,
      selectedNodeId: null,
      collaborators: [],
      remoteCursors: new Map(),
      isConnected: false,
    }),
}));
