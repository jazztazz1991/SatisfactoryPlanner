import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { SignInForm } from "@/components/auth/SignInForm";

export const metadata = { title: "Sign In — Satisfactory Planner" };

export default function SignInPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left branding panel */}
      <div className="relative hidden w-2/5 flex-col justify-between overflow-hidden bg-surface-raised p-10 lg:flex">
        <div className="pointer-events-none absolute inset-0 dot-grid opacity-40" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-brand/6 blur-[100px]" />
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-accent/6 blur-[100px]" />

        <div className="relative z-10">
          <Link href="/" className="text-lg font-black uppercase tracking-widest text-gradient-brand">
            Satisfactory Planner
          </Link>
        </div>
        <div className="relative z-10">
          <p className="text-3xl font-bold leading-tight text-content">
            Plan your factory.
            <br />
            <span className="text-gradient-brand">Optimize everything.</span>
          </p>
          <p className="mt-4 text-sm text-content-muted leading-relaxed">
            Production chains, machine calculations, and
            spatial layouts — all in one tool.
          </p>
        </div>
        <div className="relative z-10 text-xs text-content-muted">
          For Satisfactory 1.0
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center p-6">
        <AuthCard title="Sign In" subtitle="Welcome back">
          <SignInForm />
          <p className="mt-6 text-center text-sm text-content-muted">
            No account?{" "}
            <Link href="/sign-up" className="text-brand transition-colors hover:text-brand-light">
              Sign up
            </Link>
          </p>
        </AuthCard>
      </div>
    </div>
  );
}
