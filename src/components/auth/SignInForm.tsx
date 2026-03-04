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
        <p role="alert" className="rounded bg-red-900/40 px-3 py-2 text-sm text-red-300">
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
        <div className="flex-1 border-t border-gray-600" />
        <span className="mx-3 text-xs text-gray-500">or</span>
        <div className="flex-1 border-t border-gray-600" />
      </div>
      <Button type="button" variant="secondary" className="w-full" onClick={handleGitHub}>
        Continue with GitHub
      </Button>
    </form>
  );
}
