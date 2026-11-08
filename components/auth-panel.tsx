"use client";

import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

type AuthMode = "sign-in" | "sign-up";

export function AuthPanel() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "error" | "success" | "info";
    text: string;
  } | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        router.replace("/dashboard");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        router.replace("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (mode === "sign-up") {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user && !data.session) {
          setMessage({
            type: "success",
            text: "Account created. Check your email to confirm, then sign in.",
          });
          setMode("sign-in");
          setPassword("");
        } else {
          router.replace("/dashboard");
          router.refresh();
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.replace("/dashboard");
        router.refresh();
      }
    } catch (err) {
      const text =
        err instanceof Error ? err.message : "Something went wrong. Try again.";
      setMessage({ type: "error", text });
    } finally {
      setLoading(false);
    }
  }

  if (user) {
    return (
      <div className="w-full max-w-sm py-8 text-center text-sm text-zinc-600">
        Taking you to your dashboard…
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="flex rounded-xl bg-zinc-100 p-1">
        {(["sign-in", "sign-up"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              setMode(tab);
              setMessage(null);
            }}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
              mode === tab
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            {tab === "sign-in" ? "Log in" : "Sign up"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-zinc-700"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-zinc-900 outline-none ring-indigo-500 transition focus:border-indigo-500 focus:ring-2"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-zinc-700"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete={
              mode === "sign-up" ? "new-password" : "current-password"
            }
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-zinc-900 outline-none ring-indigo-500 transition focus:border-indigo-500 focus:ring-2"
            placeholder="••••••••"
          />
        </div>

        {message && (
          <p
            className={`text-sm ${
              message.type === "error"
                ? "text-red-600"
                : message.type === "success"
                  ? "text-emerald-600"
                  : "text-zinc-600"
            }`}
            role="status"
          >
            {message.text}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:opacity-60"
        >
          {loading
            ? "Please wait…"
            : mode === "sign-up"
              ? "Create account"
              : "Log in"}
        </button>
      </form>
    </div>
  );
}
