import { AuthPanel } from "@/components/auth-panel";

export default function Home() {
  return (
    <div className="relative min-h-full overflow-hidden bg-zinc-950">
      <div
        className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-indigo-500/30 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-violet-500/25 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto flex min-h-full max-w-6xl flex-col gap-12 px-6 py-16 lg:flex-row lg:items-center lg:justify-between lg:gap-16 lg:py-24">
        <section className="max-w-xl text-center lg:text-left">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">
            Lang Tutor
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl sm:leading-tight">
            Learn languages with confidence
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-zinc-400">
            Practice conversation, track progress, and build fluency at your own
            pace. Create a free account or log in to get started.
          </p>
          <ul className="mt-8 hidden gap-6 text-sm text-zinc-500 sm:grid sm:grid-cols-3 lg:flex lg:flex-col lg:gap-3">
            <li className="flex items-center justify-center gap-2 lg:justify-start">
              <span className="text-indigo-400">✓</span> Email & password auth
            </li>
            <li className="flex items-center justify-center gap-2 lg:justify-start">
              <span className="text-indigo-400">✓</span> Secure Supabase sessions
            </li>
            <li className="flex items-center justify-center gap-2 lg:justify-start">
              <span className="text-indigo-400">✓</span> Ready for your tutor features
            </li>
          </ul>
        </section>

        <section className="mx-auto w-full max-w-md rounded-2xl border border-white/10 bg-white p-8 shadow-2xl shadow-indigo-500/10 lg:mx-0">
          <AuthPanel />
        </section>
      </div>
    </div>
  );
}
