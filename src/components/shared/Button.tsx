import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50",
  secondary: "bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50",
  danger: "bg-red-600 text-white hover:bg-red-700 disabled:opacity-50",
  ghost: "bg-transparent text-gray-300 hover:bg-gray-700 disabled:opacity-50",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-2 py-1 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  );
}
