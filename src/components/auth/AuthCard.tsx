import type { ReactNode } from "react";

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-sm rounded-lg border border-gray-700 bg-gray-800 p-8 shadow-xl">
        <h1 className="mb-1 text-center text-2xl font-bold text-white">{title}</h1>
        {subtitle && (
          <p className="mb-6 text-center text-sm text-gray-400">{subtitle}</p>
        )}
        {children}
      </div>
    </div>
  );
}
