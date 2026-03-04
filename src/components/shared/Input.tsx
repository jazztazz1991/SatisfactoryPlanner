import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, id, className = "", ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      <input
        {...props}
        id={id}
        className={`rounded border px-3 py-2 text-sm bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
          error ? "border-red-500" : "border-gray-600"
        } ${className}`}
      />
      {error && (
        <p role="alert" className="text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
