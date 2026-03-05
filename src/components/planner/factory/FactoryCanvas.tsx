"use client";
import { useCallback, useEffect, useMemo } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeChange,
  type NodePositionChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCanvasStore } from "@/store/canvasStore";
import { solverOutputToBlueprintFlow, CELL_PX } from "./factoryLayout";
import { BlueprintMachineNode } from "./nodes/BlueprintMachineNode";
import { FactoryResourceNode } from "./nodes/FactoryResourceNode";
import { SplitterMergerNode } from "./nodes/SplitterMergerNode";
import { BeltEdge } from "./edges/BeltEdge";

const nodeTypes = {
  blueprintMachine: BlueprintMachineNode,
  factoryResource: FactoryResourceNode,
  splitterMerger: SplitterMergerNode,
};

const edgeTypes = {
  belt: BeltEdge,
};

function snapToGrid(value: number): number {
  return Math.round(value / CELL_PX) * CELL_PX;
}

export function FactoryCanvas() {
  const { solverResult } = useCanvasStore();

  const layout = useMemo(() => {
    if (!solverResult) return null;
    return solverOutputToBlueprintFlow(solverResult);
  }, [solverResult]);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    if (layout) {
      setNodes(layout.nodes);
      setEdges(layout.edges);
    } else {
      setNodes([]);
      setEdges([]);
    }
  }, [layout, setNodes, setEdges]);

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const snappedChanges = changes.map((change) => {
        if (change.type === "position" && change.position) {
          const posChange = change as NodePositionChange;
          return {
            ...posChange,
            position: {
              x: snapToGrid(posChange.position!.x),
              y: snapToGrid(posChange.position!.y),
            },
          };
        }
        return change;
      });
      onNodesChange(snappedChanges);
    },
    [onNodesChange]
  );

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
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        minZoom={0.05}
        maxZoom={4}
        snapToGrid
        snapGrid={[CELL_PX, CELL_PX]}
        colorMode="dark"
      >
        <Background variant={BackgroundVariant.Lines} gap={CELL_PX} color="rgba(75, 85, 99, 0.35)" />
        <Controls />
        <MiniMap nodeColor="#f59e0b" />
      </ReactFlow>
    </div>
  );
}
