import Link from "next/link";

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      {/* Dot-grid background */}
      <div className="pointer-events-none absolute inset-0 dot-grid" />

      {/* Floating neon orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-1/3 h-[500px] w-[500px] rounded-full bg-brand/4 blur-[120px]" />
        <div className="absolute -right-32 bottom-1/4 h-[400px] w-[400px] rounded-full bg-accent/4 blur-[120px]" />
        <div className="absolute left-1/2 top-0 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-secondary/3 blur-[100px]" />
      </div>

      {/* Scan-line overlay */}
      <div className="pointer-events-none absolute inset-0 scanlines" />

      <div className="relative z-10 flex flex-col items-center px-6">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-surface-border bg-surface-raised/60 px-4 py-1.5 text-xs font-medium tracking-wider uppercase text-content-secondary backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse-glow" />
          Factory Planning Tool
        </div>

        {/* Hero text */}
        <h1 className="text-center text-6xl font-black tracking-tighter sm:text-8xl">
          <span className="block text-content">SATISFACTORY</span>
          <span className="block text-gradient-brand">PLANNER</span>
        </h1>

        <p className="mt-6 max-w-md text-center text-base text-content-muted leading-relaxed">
          Design production chains. Calculate throughput.
          <br />
          Visualise your factory in real time.
        </p>

        {/* CTA buttons */}
        <div className="mt-10 flex gap-4">
          <Link
            href="/sign-in"
            className="group relative rounded-full px-8 py-3 text-sm font-bold uppercase tracking-wider text-content-inverse transition-all gradient-brand shadow-glow hover:shadow-glow-brand"
          >
            Get Started
          </Link>
          <Link
            href="/sign-up"
            className="rounded-full border border-surface-border px-8 py-3 text-sm font-bold uppercase tracking-wider text-content-secondary transition-all hover:border-brand/50 hover:text-brand hover:shadow-glow"
          >
            Create Account
          </Link>
        </div>

        {/* Feature strip */}
        <div className="mt-20 flex max-w-4xl flex-col gap-px sm:flex-row">
          {[
            { num: "01", title: "PRODUCTION CHAINS", desc: "Graph & tree views of your full pipeline" },
            { num: "02", title: "FACTORY LAYOUT", desc: "Multi-floor spatial layouts with belt routing" },
            { num: "03", title: "FREEFORM BUILDER", desc: "Drag-and-drop machines, splitters, mergers" },
          ].map((f, i) => (
            <div
              key={f.num}
              className={`group flex-1 border-t border-surface-border p-6 transition-all hover:bg-brand/3 ${
                i > 0 ? "sm:border-l sm:border-t-0" : ""
              }`}
            >
              <span className="font-mono text-xs text-brand">{f.num}</span>
              <h3 className="mt-2 text-xs font-bold uppercase tracking-widest text-content">
                {f.title}
              </h3>
              <p className="mt-2 text-xs text-content-muted leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
