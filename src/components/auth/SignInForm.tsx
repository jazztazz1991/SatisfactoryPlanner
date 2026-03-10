"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/shared/Input";
import { Button } from "@/components/shared/Button";

export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/dashboard");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGitHub() {
    await signIn("github", { callbackUrl: "/dashboard" });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <p role="alert" className="rounded-xl border border-danger/30 bg-danger-muted px-4 py-3 text-sm text-danger-light">
          {error}
        </p>
      )}
      <Input
        id="email"
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
      />
      <Input
        id="password"
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoComplete="current-password"
      />
      <Button type="submit" loading={loading} className="w-full mt-2">
        Sign in
      </Button>
      <div className="relative my-1 flex items-center">
        <div className="flex-1 border-t border-surface-border" />
        <span className="mx-3 text-xs uppercase tracking-widest text-content-muted">or</span>
        <div className="flex-1 border-t border-surface-border" />
      </div>
      <button type="button" className="w-full rounded-full border border-surface-border bg-surface-overlay py-2.5 text-sm font-medium text-content hover:border-brand/30 hover:shadow-glow transition-all" onClick={handleGitHub}>
        Continue with GitHub
      </button>
    </form>
  );
}
