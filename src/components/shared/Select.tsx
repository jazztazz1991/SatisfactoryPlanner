import type { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export function Select({ label, error, id, options, className = "", ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-xs font-bold uppercase tracking-widest text-content-muted">
          {label}
        </label>
      )}
      <select
        {...props}
        id={id}
        className={`rounded-xl border bg-surface-raised/50 px-4 py-2.5 text-sm text-content transition-all focus:outline-none focus:border-brand focus:glow-ring ${
          error ? "border-danger focus:glow-ring-accent" : "border-surface-border"
        } ${className}`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p role="alert" className="text-xs text-danger-light">
          {error}
        </p>
      )}
    </div>
  );
}
