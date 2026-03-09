interface FloorTabsProps {
  floorCount: number;
  activeFloor: number;
  onFloorChange: (floor: number) => void;
}

export function FloorTabs({ floorCount, activeFloor, onFloorChange }: FloorTabsProps) {
  return (
    <div className="flex gap-1" role="tablist" aria-label="Factory floors">
      {Array.from({ length: floorCount }, (_, i) => (
        <button
          key={i}
          role="tab"
          aria-selected={i === activeFloor}
          onClick={() => onFloorChange(i)}
          className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
            i === activeFloor
              ? "bg-orange-500 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          Floor {i + 1}
        </button>
      ))}
    </div>
  );
}
