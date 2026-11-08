"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type SignOutButtonProps = {
  className?: string;
  variant?: "nav" | "standalone";
};

export function SignOutButton({
  className = "",
  variant = "nav",
}: SignOutButtonProps) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
    setLoading(false);
  }

  const baseStyles =
    variant === "nav"
      ? "w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-zinc-300 transition hover:bg-white/10 hover:text-white disabled:opacity-60 lg:w-auto"
      : "rounded-xl bg-zinc-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-60";

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      className={`${baseStyles} ${className}`}
    >
      {loading ? "Signing out…" : "Sign out"}
    </button>
  );
}
