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
          className={`px-3 py-1 text-xs font-bold uppercase tracking-widest transition-colors ${
            i === activeFloor
              ? "gradient-brand text-content-inverse rounded-full shadow-glow"
              : "bg-surface-overlay text-content-muted rounded-full border border-surface-border hover:border-brand/30"
          }`}
        >
          Floor {i + 1}
        </button>
      ))}
    </div>
  );
}
