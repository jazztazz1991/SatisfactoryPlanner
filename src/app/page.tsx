import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-950 px-6 text-center">
      <h1 className="text-4xl font-bold text-white">
        Satisfactory<span className="text-orange-400">Planner</span>
      </h1>
      <p className="max-w-md text-gray-400">
        Plan production chains, calculate machine counts, and visualise your factory — for Satisfactory 1.0.
      </p>
      <div className="flex gap-4">
        <Link
          href="/sign-in"
          className="rounded bg-orange-500 px-6 py-3 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
        >
          Sign In
        </Link>
        <Link
          href="/sign-up"
          className="rounded border border-gray-600 px-6 py-3 text-sm font-medium text-gray-300 hover:border-gray-400 hover:text-white transition-colors"
        >
          Create Account
        </Link>
      </div>
    </main>
  );
}
