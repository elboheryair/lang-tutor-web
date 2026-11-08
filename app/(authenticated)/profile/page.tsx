import { AuthenticatedPageFallback } from "@/components/authenticated-page-fallback";
import { ProfileForm } from "@/components/profile-form";
import { requireUser } from "@/lib/auth/require-user";
import { getProfileForUser } from "@/lib/profiles";
import { Suspense } from "react";

async function ProfileEditor() {
  const user = await requireUser();
  const profile = await getProfileForUser(user.id);
  const nickname = profile?.nickname ?? user.email?.split("@")[0] ?? "";

  return <ProfileForm initialNickname={nickname} />;
}

export default function ProfilePage() {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">
        Profile
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
        Edit your profile
      </h1>
      <p className="mt-2 max-w-xl text-zinc-400">
        Update how your name appears across the app.
      </p>
      <Suspense fallback={<AuthenticatedPageFallback />}>
        <ProfileEditor />
      </Suspense>
    </div>
  );
}
