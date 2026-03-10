interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
}

const sizeClasses = { sm: "h-4 w-4", md: "h-8 w-8", lg: "h-12 w-12" };

export function Spinner({ size = "md", label = "Loading..." }: SpinnerProps) {
  return (
    <div role="status" aria-label={label} className="flex items-center justify-center">
      <span
        className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-surface-border border-t-brand`}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
