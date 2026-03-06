interface TierPickerProps {
  value: number;
  onChange: (tier: number) => void;
}

const TIERS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export function TierPicker({ value, onChange }: TierPickerProps) {
  return (
    <div className="flex flex-wrap gap-1">
      {TIERS.map((tier) => {
        const isSelected = tier === value;
        return (
          <button
            key={tier}
            type="button"
            aria-label={`Tier ${tier}`}
            aria-pressed={isSelected}
            onClick={() => { if (!isSelected) onChange(tier); }}
            className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
              isSelected
                ? "bg-orange-500 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
            }`}
          >
            {tier}
          </button>
        );
      })}
    </div>
  );
}
