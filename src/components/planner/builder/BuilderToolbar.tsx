"use client";

interface BuilderToolbarProps {
  onAddMachine: (buildingClassName: string, buildingName: string) => void;
  onAddResource: () => void;
  onAddSplitterMerger: (kind: "splitter" | "merger") => void;
}

const BUILDINGS = [
  { className: "Desc_SmelterMk1_C", name: "Smelter" },
  { className: "Desc_ConstructorMk1_C", name: "Constructor" },
  { className: "Desc_AssemblerMk1_C", name: "Assembler" },
  { className: "Desc_ManufacturerMk1_C", name: "Manufacturer" },
  { className: "Desc_FoundryMk1_C", name: "Foundry" },
  { className: "Desc_OilRefinery_C", name: "Refinery" },
  { className: "Desc_Blender_C", name: "Blender" },
  { className: "Desc_Packager_C", name: "Packager" },
];

export function BuilderToolbar({ onAddMachine, onAddResource, onAddSplitterMerger }: BuilderToolbarProps) {
  return (
    <div className="flex items-center gap-1 border-b border-gray-800 bg-gray-900 px-3 py-1.5 overflow-x-auto">
      <span className="mr-1 text-xs font-medium text-gray-400 whitespace-nowrap">Add:</span>
      {BUILDINGS.map((b) => (
        <button
          key={b.className}
          onClick={() => onAddMachine(b.className, b.name)}
          className="rounded bg-gray-700 px-2 py-0.5 text-[11px] text-gray-200 hover:bg-gray-600 whitespace-nowrap"
          aria-label={`Add ${b.name}`}
        >
          {b.name}
        </button>
      ))}
      <div className="mx-1 h-4 w-px bg-gray-700" />
      <button
        onClick={() => onAddSplitterMerger("splitter")}
        className="rounded bg-amber-800 px-2 py-0.5 text-[11px] text-amber-200 hover:bg-amber-700 whitespace-nowrap"
        aria-label="Add Splitter"
      >
        Splitter
      </button>
      <button
        onClick={() => onAddSplitterMerger("merger")}
        className="rounded bg-teal-800 px-2 py-0.5 text-[11px] text-teal-200 hover:bg-teal-700 whitespace-nowrap"
        aria-label="Add Merger"
      >
        Merger
      </button>
      <div className="mx-1 h-4 w-px bg-gray-700" />
      <button
        onClick={onAddResource}
        className="rounded bg-green-800 px-2 py-0.5 text-[11px] text-green-200 hover:bg-green-700 whitespace-nowrap"
        aria-label="Add Resource"
      >
        Resource
      </button>
    </div>
  );
}
