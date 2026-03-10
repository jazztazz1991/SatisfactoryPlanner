import type { ReactNode } from "react";

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="w-full max-w-sm">
      <h1 className="mb-1 text-center text-2xl font-black uppercase tracking-tight text-content">{title}</h1>
      {subtitle && (
        <p className="mb-6 text-center text-sm text-content-muted">{subtitle}</p>
      )}
      <div className="mt-6">
        {children}
      </div>
    </div>
  );
}
