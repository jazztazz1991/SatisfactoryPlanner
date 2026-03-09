import type { FloorConfig } from "@/domain/factory/floorAssignment";

interface FloorConfigPopoverProps {
  floorConfig: FloorConfig;
  onConfigChange: (config: FloorConfig) => void;
}

export function FloorConfigPopover({ floorConfig, onConfigChange }: FloorConfigPopoverProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-medium text-gray-400">Floor Size</span>

      <label className="flex items-center gap-1.5 text-xs text-gray-400">
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
          className="w-14 rounded border border-gray-600 bg-gray-900 px-2 py-0.5 text-xs text-white"
          aria-label="Floor width"
        />
      </label>

      <label className="flex items-center gap-1.5 text-xs text-gray-400">
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
          className="w-14 rounded border border-gray-600 bg-gray-900 px-2 py-0.5 text-xs text-white"
          aria-label="Floor depth"
        />
      </label>
    </div>
  );
}
