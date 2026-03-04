import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { SignInForm } from "@/components/auth/SignInForm";

export const metadata = { title: "Sign In — Satisfactory Planner" };

export default function SignInPage() {
  return (
    <AuthCard title="Sign In" subtitle="Plan your factory">
      <SignInForm />
      <p className="mt-4 text-center text-sm text-gray-400">
        No account?{" "}
        <Link href="/sign-up" className="text-orange-400 hover:underline">
          Sign up
        </Link>
      </p>
    </AuthCard>
  );
}
