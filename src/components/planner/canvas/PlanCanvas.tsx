"use client";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  type NodeChange,
  type EdgeChange,
  type Connection,
  type Edge,
  applyNodeChanges,
  applyEdgeChanges,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCanvasStore } from "@/store/canvasStore";
import { MachineNode } from "./nodes/MachineNode";
import { ResourceNode } from "./nodes/ResourceNode";
import { SinkNode } from "./nodes/SinkNode";
import { RateEdge } from "./edges/RateEdge";

const nodeTypes = {
  machine: MachineNode,
  resource: ResourceNode,
  sink: SinkNode,
};

const edgeTypes = {
  rate: RateEdge,
};

interface PlanCanvasProps {
  planId: string;
  onNodePositionChange?: (nodeId: string, x: number, y: number) => void;
  onEdgeCreate?: (edge: Edge) => void;
}

export function PlanCanvas({ onNodePositionChange, onEdgeCreate }: PlanCanvasProps) {
  const { nodes, edges, setNodes, setEdges, setSelectedNodeId } = useCanvasStore();

  function onNodesChange(changes: NodeChange[]) {
    const currentNodes = useCanvasStore.getState().nodes;
    setNodes(applyNodeChanges(changes, currentNodes));
  }

  function onEdgesChange(changes: EdgeChange[]) {
    const currentEdges = useCanvasStore.getState().edges;
    setEdges(applyEdgeChanges(changes, currentEdges));
  }

  function onNodeDragStop(_: React.MouseEvent, node: { id: string; position: { x: number; y: number } }) {
    onNodePositionChange?.(node.id, node.position.x, node.position.y);
  }

  function handleConnect(connection: Connection) {
    const currentEdges = useCanvasStore.getState().edges;
    const newEdge: Edge = {
      id: `e-${connection.source}-${connection.target}-${Date.now()}`,
      source: connection.source,
      target: connection.target,
      sourceHandle: connection.sourceHandle ?? undefined,
      targetHandle: connection.targetHandle ?? undefined,
      type: "rate",
      data: {},
    };
    setEdges(addEdge(newEdge, currentEdges));
    onEdgeCreate?.(newEdge);
  }

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        onConnect={handleConnect}
        onNodeClick={(_, node) => setSelectedNodeId(node.id)}
        onPaneClick={() => setSelectedNodeId(null)}
        fitView
        colorMode="dark"
      >
        <Background />
        <Controls />
        <MiniMap nodeColor="#f97316" />
      </ReactFlow>
    </div>
  );
}
