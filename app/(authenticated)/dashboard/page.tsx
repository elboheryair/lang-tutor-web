import { AuthenticatedPageFallback } from "@/components/authenticated-page-fallback";
import { requireUser } from "@/lib/auth/require-user";
import { getProfileForUser } from "@/lib/profiles";
import { Suspense } from "react";

async function DashboardContent() {
  const user = await requireUser();
  const profile = await getProfileForUser(user.id);
  const nickname = profile?.nickname ?? user.email?.split("@")[0] ?? "there";

  return (
    <>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        Hi, {nickname}
      </h1>
      <p className="mt-4 max-w-xl text-lg leading-relaxed text-zinc-400">
        Welcome back. Use the menu to update your profile or sign out when you are
        done.
      </p>
    </>
  );
}

export default function DashboardPage() {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">
        Dashboard
      </p>
      <Suspense fallback={<AuthenticatedPageFallback />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
