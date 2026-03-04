import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { SignUpForm } from "@/components/auth/SignUpForm";

export const metadata = { title: "Sign Up — Satisfactory Planner" };

export default function SignUpPage() {
  return (
    <AuthCard title="Create Account" subtitle="Start planning your factory">
      <SignUpForm />
      <p className="mt-4 text-center text-sm text-gray-400">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-orange-400 hover:underline">
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
