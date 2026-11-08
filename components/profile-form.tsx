"use client";

import {
  updateNickname,
  type ProfileFormState,
} from "@/app/(authenticated)/profile/actions";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";

const initialState: ProfileFormState = {};

type ProfileFormProps = {
  initialNickname: string;
};

export function ProfileForm({ initialNickname }: ProfileFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    updateNickname,
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [state.success, router]);

  return (
    <form
      key={initialNickname}
      action={formAction}
      className="mt-8 max-w-md space-y-4"
    >
      <div>
        <label
          htmlFor="nickname"
          className="block text-sm font-medium text-zinc-300"
        >
          Nickname
        </label>
        <input
          id="nickname"
          name="nickname"
          type="text"
          required
          maxLength={64}
          defaultValue={initialNickname}
          className="mt-1.5 w-full rounded-xl border border-white/15 bg-zinc-900 px-3.5 py-2.5 text-white outline-none ring-indigo-500 transition focus:border-indigo-500 focus:ring-2"
          placeholder="Your display name"
        />
      </div>

      {state.error && (
        <p className="text-sm text-red-400" role="alert">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="text-sm text-emerald-400" role="status">
          Profile saved.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
