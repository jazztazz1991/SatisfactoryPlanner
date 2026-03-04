import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session) redirect("/sign-in");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-gray-800 bg-gray-900 px-6 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/dashboard" className="text-lg font-bold text-orange-400">
            SatisfactoryPlanner
          </Link>
          <nav className="flex items-center gap-4 text-sm text-gray-300">
            <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
            <form action="/api/auth/signout" method="POST">
              <button type="submit" className="hover:text-white">Sign out</button>
            </form>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
