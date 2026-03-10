import Link from "next/link";

export function NewPlanButton() {
  return (
    <Link
      href="/plans/new"
      className="flex h-14 w-14 items-center justify-center rounded-full gradient-brand text-2xl font-bold text-content-inverse shadow-glow-brand transition-transform hover:scale-110"
      title="New Plan"
    >
      <span aria-hidden="true">+</span>
      <span className="sr-only">New Plan</span>
    </Link>
  );
}
