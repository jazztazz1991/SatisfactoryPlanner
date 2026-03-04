import { Handle, Position, type NodeProps } from "@xyflow/react";

export interface FactoryBuildingData {
  recipeName: string;
  buildingName: string | null;
  machineCount: number;
  powerUsageKW: number;
  [key: string]: unknown;
}

const BUILDING_EMOJI: Record<string, string> = {
  Assembler: "🔧",
  Constructor: "⚙️",
  Smelter: "🔥",
  Foundry: "🏗️",
  Refinery: "🛢️",
  Manufacturer: "🏭",
  Blender: "🧪",
  Packager: "📦",
};

export function FactoryBuildingNode({ data }: NodeProps) {
  const d = data as FactoryBuildingData;
  const emoji = d.buildingName ? (BUILDING_EMOJI[d.buildingName] ?? "🏗️") : "🏗️";

  return (
    <div className="min-w-[200px] rounded-lg border-2 border-orange-500 bg-gray-800 text-sm shadow-lg">
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center gap-2 rounded-t-lg bg-orange-500 px-3 py-2">
        <span>{emoji}</span>
        <span className="font-semibold text-white">{d.buildingName ?? "Building"}</span>
      </div>
      <div className="px-3 py-2">
        <div className="font-medium text-white">{d.recipeName}</div>
        <div className="mt-1 flex gap-3 text-xs text-gray-300">
          <span>×{d.machineCount} machines</span>
          <span>{d.powerUsageKW.toFixed(1)} kW</span>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
