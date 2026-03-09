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
  addEdge,
  type Node,
  type Edge,
  type NodeChange,
  type NodePositionChange,
  type Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCanvasStore } from "@/store/canvasStore";
import { solverOutputToMultiFloorLayout, CELL_PX } from "./factoryLayout";
import { BlueprintMachineNode } from "./nodes/BlueprintMachineNode";
import { FactoryResourceNode } from "./nodes/FactoryResourceNode";
import { SplitterMergerNode } from "./nodes/SplitterMergerNode";
import { LiftNode } from "./nodes/LiftNode";
import { BeltEdge } from "./edges/BeltEdge";
import { FloorTabs } from "./FloorTabs";
import { FloorConfigPopover } from "./FloorConfigPopover";

const nodeTypes = {
  blueprintMachine: BlueprintMachineNode,
  factoryResource: FactoryResourceNode,
  splitterMerger: SplitterMergerNode,
  factoryLift: LiftNode,
};

const edgeTypes = {
  belt: BeltEdge,
};

function snapToGrid(value: number): number {
  return Math.round(value / CELL_PX) * CELL_PX;
}

interface FactoryCanvasProps {
  savedPositions?: Record<string, { x: number; y: number }> | null;
  onNodePositionChange?: (positions: Record<string, { x: number; y: number }>) => void;
  remotePositions?: Record<string, { x: number; y: number }> | null;
  onEdgeCreate?: (edge: Edge) => void;
  remoteNewEdge?: Edge | null;
  onFloorConfigChange?: (config: { floorWidth: number; floorDepth: number }) => void;
}

export function FactoryCanvas({ savedPositions, onNodePositionChange, remotePositions, onEdgeCreate, remoteNewEdge, onFloorConfigChange }: FactoryCanvasProps) {
  const { solverResult, maxTier, floorConfig, activeFloor, setActiveFloor, setFloorConfig, setFloorCount } = useCanvasStore();

  const multiFloorLayout = useMemo(() => {
    if (!solverResult) return null;
    return solverOutputToMultiFloorLayout(solverResult, { maxTier, floorConfig });
  }, [solverResult, maxTier, floorConfig]);

  // Update floor count in store when layout changes
  useEffect(() => {
    setFloorCount(multiFloorLayout?.floorCount ?? 1);
  }, [multiFloorLayout, setFloorCount]);

  // Clamp activeFloor if it exceeds available floors
  useEffect(() => {
    if (multiFloorLayout && activeFloor >= multiFloorLayout.floorCount) {
      setActiveFloor(Math.max(0, multiFloorLayout.floorCount - 1));
    }
  }, [multiFloorLayout, activeFloor, setActiveFloor]);

  // Extract active floor's nodes and edges
  const activeFloorData = useMemo(() => {
    if (!multiFloorLayout) return null;
    const floor = multiFloorLayout.floors[activeFloor] ?? multiFloorLayout.floors[0];
    if (!floor) return null;
    return {
      nodes: [...floor.nodes, ...floor.liftNodes],
      edges: [...floor.edges, ...floor.liftEdges],
    };
  }, [multiFloorLayout, activeFloor]);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    if (activeFloorData) {
      // Apply saved positions on top of auto-layout
      const positioned = savedPositions
        ? activeFloorData.nodes.map((n) => {
            const saved = savedPositions[n.id];
            return saved ? { ...n, position: saved } : n;
          })
        : activeFloorData.nodes;
      setNodes(positioned);
      setEdges(activeFloorData.edges);
    } else {
      setNodes([]);
      setEdges([]);
    }
  }, [activeFloorData, savedPositions, setNodes, setEdges]);

  // Apply remote position updates from collaborators
  useEffect(() => {
    if (!remotePositions) return;
    setNodes((current) =>
      current.map((n) => {
        const remote = remotePositions[n.id];
        return remote ? { ...n, position: remote } : n;
      })
    );
  }, [remotePositions, setNodes]);

  // Apply remote edge from collaborators
  useEffect(() => {
    if (!remoteNewEdge) return;
    setEdges((eds) => addEdge(remoteNewEdge, eds));
  }, [remoteNewEdge, setEdges]);

  const handleConnect = useCallback(
    (connection: Connection) => {
      const sourceItem = connection.sourceHandle?.replace(/^(out|branch-out|bus-out)-/, "") ?? "";
      const targetItem = connection.targetHandle?.replace(/^(in|branch-in|bus-in)-/, "") ?? "";
      const itemClassName = sourceItem || targetItem;

      const newEdge: Edge = {
        id: `user-e-${connection.source}-${connection.sourceHandle}-${connection.target}-${connection.targetHandle}`,
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle ?? undefined,
        targetHandle: connection.targetHandle ?? undefined,
        type: "belt",
        data: { itemName: itemClassName, rate: 0, beltTier: 1, laneIndex: 0, laneCount: 1 },
      };
      setEdges((eds) => addEdge(newEdge, eds));
      onEdgeCreate?.(newEdge);
    },
    [setEdges, onEdgeCreate]
  );

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

  const handleNodeDragStop = useCallback(() => {
    if (!onNodePositionChange) return;
    const positions: Record<string, { x: number; y: number }> = {};
    setNodes((current) => {
      for (const n of current) {
        positions[n.id] = { x: n.position.x, y: n.position.y };
      }
      return current;
    });
    setTimeout(() => onNodePositionChange(positions), 0);
  }, [onNodePositionChange, setNodes]);

  if (!solverResult) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        Calculate first to see the factory view.
      </div>
    );
  }

  const floorCount = multiFloorLayout?.floorCount ?? 1;

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-center gap-2 border-b border-gray-800 bg-gray-900 px-3 py-1">
        {floorCount > 1 && (
          <FloorTabs
            floorCount={floorCount}
            activeFloor={activeFloor}
            onFloorChange={setActiveFloor}
          />
        )}
        <FloorConfigPopover
          floorConfig={floorConfig}
          onConfigChange={(config) => {
            setFloorConfig(config);
            onFloorConfigChange?.(config);
          }}
        />
      </div>
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeDragStop={handleNodeDragStop}
          onConnect={handleConnect}
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
    </div>
  );
}
