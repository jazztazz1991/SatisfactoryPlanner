"use client";
import { useMemo } from "react";
import { ReactFlow, Background, Controls, MiniMap } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCanvasStore } from "@/store/canvasStore";
import { solverOutputToFactoryGraph } from "./factoryLayout";
import { FactoryBuildingNode } from "./nodes/FactoryBuildingNode";
import { SplitterNode } from "./nodes/SplitterNode";
import { BeltEdge } from "./edges/BeltEdge";
import { ResourceNode } from "@/components/planner/canvas/nodes/ResourceNode";

const nodeTypes = {
  factoryBuilding: FactoryBuildingNode,
  splitter: SplitterNode,
  resource: ResourceNode,
};

const edgeTypes = {
  belt: BeltEdge,
};

export function FactoryCanvas() {
  const { solverResult } = useCanvasStore();

  const { nodes, edges } = useMemo(() => {
    if (!solverResult) return { nodes: [], edges: [] };
    return solverOutputToFactoryGraph(solverResult);
  }, [solverResult]);

  if (!solverResult) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        Calculate first to see the factory view.
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        colorMode="dark"
      >
        <Background />
        <Controls />
        <MiniMap nodeColor="#f59e0b" />
      </ReactFlow>
    </div>
  );
}
