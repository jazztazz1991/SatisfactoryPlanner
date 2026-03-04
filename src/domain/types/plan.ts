export type ViewMode = "graph" | "tree";
export type NodeType = "machine" | "resource" | "sink";

export interface IPlan {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  viewMode: ViewMode;
  templateKey: string | null;
  canvasViewport: { x: number; y: number; zoom: number } | null;
  createdAt: string;
  updatedAt: string;
}

export interface IPlanTarget {
  id: string;
  planId: string;
  itemClassName: string;
  targetRate: number;
}

export interface IPlanNode {
  id: string;
  planId: string;
  recipeClassName: string | null;
  buildingClassName: string | null;
  machineCount: number;
  overclockPercent: number;
  useAlternate: boolean;
  positionX: number;
  positionY: number;
  nodeType: NodeType;
}

export interface IPlanEdge {
  id: string;
  planId: string;
  sourceNodeId: string;
  targetNodeId: string;
  itemClassName: string;
  rate: number;
}
