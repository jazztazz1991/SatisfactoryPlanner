import { create } from "zustand";
import type { Node, Edge } from "@xyflow/react";
import type { ISolverOutput } from "@/domain/types/solver";

interface CanvasState {
  nodes: Node[];
  edges: Edge[];
  solverResult: ISolverOutput | null;
  selectedNodeId: string | null;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  updateNodePosition: (id: string, x: number, y: number) => void;
  setSolverResult: (result: ISolverOutput | null) => void;
  setSelectedNodeId: (id: string | null) => void;
  reset: () => void;
}

export const useCanvasStore = create<CanvasState>((set) => ({
  nodes: [],
  edges: [],
  solverResult: null,
  selectedNodeId: null,

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

  reset: () =>
    set({ nodes: [], edges: [], solverResult: null, selectedNodeId: null }),
}));
