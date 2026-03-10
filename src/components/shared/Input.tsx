import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, id, className = "", ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-xs font-bold uppercase tracking-widest text-content-muted">
          {label}
        </label>
      )}
      <input
        {...props}
        id={id}
        className={`rounded-xl border bg-surface-raised/50 px-4 py-2.5 text-sm text-content placeholder-content-muted transition-all focus:outline-none focus:border-brand focus:glow-ring ${
          error ? "border-danger focus:glow-ring-accent" : "border-surface-border"
        } ${className}`}
      />
      {error && (
        <p role="alert" className="text-xs text-danger-light">
          {error}
        </p>
      )}
    </div>
  );
}
