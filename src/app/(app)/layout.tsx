import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { NotificationBell } from "@/components/shared/NotificationBell";
import type { ReactNode } from "react";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session) redirect("/sign-in");

  return (
    <div className="flex min-h-screen">
      {/* Vertical side nav */}
      <nav className="fixed left-0 top-0 z-40 flex h-screen w-14 flex-col items-center gap-6 border-r border-surface-border bg-surface-raised py-4">
        {/* Logo */}
        <Link
          href="/dashboard"
          className="flex h-8 w-8 items-center justify-center rounded-lg gradient-brand text-xs font-black text-content-inverse"
          title="SatisfactoryPlanner"
        >
          SP
        </Link>

        {/* Nav links */}
        <div className="flex flex-1 flex-col items-center gap-2">
          <Link
            href="/dashboard"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-content-muted transition-colors hover:bg-surface-overlay hover:text-brand"
            title="Dashboard"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </Link>
          <NotificationBell />
        </div>

        {/* Sign out at bottom */}
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-content-muted transition-colors hover:bg-surface-overlay hover:text-danger"
            title="Sign out"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </form>
      </nav>

      {/* Main content offset by sidebar width */}
      <main className="ml-14 flex-1">{children}</main>
    </div>
  );
}
