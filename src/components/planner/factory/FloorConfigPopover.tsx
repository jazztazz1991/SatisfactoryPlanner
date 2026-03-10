import type { FloorConfig } from "@/domain/factory/floorAssignment";

interface FloorConfigPopoverProps {
  floorConfig: FloorConfig;
  onConfigChange: (config: FloorConfig) => void;
}

export function FloorConfigPopover({ floorConfig, onConfigChange }: FloorConfigPopoverProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-bold uppercase tracking-widest text-content-muted">Floor Size</span>

      <label className="flex items-center gap-1.5 text-xs text-content-secondary">
        <span>W</span>
        <input
          type="number"
          min={4}
          max={64}
          value={floorConfig.floorWidth}
          onChange={(e) => {
            const val = Math.max(4, Math.min(64, parseInt(e.target.value) || 4));
            onConfigChange({ ...floorConfig, floorWidth: val });
          }}
          className="w-14 rounded-xl border border-surface-border bg-surface-overlay px-2 py-0.5 text-xs font-mono text-content focus:outline-none focus:glow-ring"
          aria-label="Floor width"
        />
      </label>

      <label className="flex items-center gap-1.5 text-xs text-content-secondary">
        <span>D</span>
        <input
          type="number"
          min={4}
          max={64}
          value={floorConfig.floorDepth}
          onChange={(e) => {
            const val = Math.max(4, Math.min(64, parseInt(e.target.value) || 4));
            onConfigChange({ ...floorConfig, floorDepth: val });
          }}
          className="w-14 rounded-xl border border-surface-border bg-surface-overlay px-2 py-0.5 text-xs font-mono text-content focus:outline-none focus:glow-ring"
          aria-label="Floor depth"
        />
      </label>
    </div>
  );
}
