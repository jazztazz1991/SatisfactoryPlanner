"use client";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type NodeChange,
  type EdgeChange,
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
}

export function PlanCanvas({ onNodePositionChange }: PlanCanvasProps) {
  const { nodes, edges, setNodes, setEdges, setSelectedNodeId } = useCanvasStore();

  function onNodesChange(changes: NodeChange[]) {
    setNodes(applyNodeChanges(changes, nodes));
  }

  function onEdgesChange(changes: EdgeChange[]) {
    setEdges(applyEdgeChanges(changes, edges));
  }

  function onNodeDragStop(_: React.MouseEvent, node: { id: string; position: { x: number; y: number } }) {
    onNodePositionChange?.(node.id, node.position.x, node.position.y);
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
