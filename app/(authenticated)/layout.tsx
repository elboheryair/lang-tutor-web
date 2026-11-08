import { AppNav } from "@/components/app-nav";
import { Suspense } from "react";

export const instant = false;

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col bg-zinc-950 text-zinc-100">
      <Suspense
        fallback={
          <header className="border-b border-white/10 bg-zinc-950/80 px-6 py-4">
            <span className="text-sm font-semibold text-white">Lang Tutor</span>
          </header>
        }
      >
        <AppNav />
      </Suspense>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">{children}</main>
    </div>
  );
}
