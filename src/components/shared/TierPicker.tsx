interface TierPickerProps {
  value: number;
  onChange: (tier: number) => void;
}

const TIERS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export function TierPicker({ value, onChange }: TierPickerProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {TIERS.map((tier) => {
        const isSelected = tier === value;
        return (
          <button
            key={tier}
            type="button"
            aria-label={`Tier ${tier}`}
            aria-pressed={isSelected}
            onClick={() => { if (!isSelected) onChange(tier); }}
            className={`rounded-full h-8 w-8 text-xs font-mono font-bold transition-all ${
              isSelected
                ? "gradient-brand text-content-inverse shadow-glow"
                : "bg-surface-overlay text-content-muted border border-surface-border hover:border-brand/30 hover:text-brand"
            }`}
          >
            {tier}
          </button>
        );
      })}
    </div>
  );
}
