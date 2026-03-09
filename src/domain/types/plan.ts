export type ViewMode = "graph" | "tree";
export type NodeType = "machine" | "resource" | "sink" | "splitter" | "merger";
export type NodeViewType = "graph" | "builder";

export interface IPlan {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  viewMode: ViewMode;
  templateKey: string | null;
  canvasViewport: { x: number; y: number; zoom: number } | null;
  shareToken: string | null;
  shareRole: CollaboratorRole | null;
  maxTier: number;
  factoryNodePositions: Record<string, { x: number; y: number }> | null;
  floorConfig: { floorWidth: number; floorDepth: number } | null;
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
  viewType: NodeViewType;
}

export interface IPlanEdge {
  id: string;
  planId: string;
  sourceNodeId: string;
  targetNodeId: string;
  itemClassName: string;
  rate: number;
  viewType: NodeViewType;
  sourceHandle: string | null;
  targetHandle: string | null;
}

export type CollaboratorRole = "editor" | "viewer";

export interface IPlanCollaborator {
  id: string;
  planId: string;
  userId: string | null;
  email: string | null;
  role: CollaboratorRole;
  inviteToken: string | null;
  acceptedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type PlanAccessRole = "owner" | "editor" | "viewer";

export interface IPlanWithRole extends IPlan {
  accessRole: PlanAccessRole;
  ownerName?: string | null;
}
