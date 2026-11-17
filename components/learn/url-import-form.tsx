"use client";

import { importDocumentFromUrl } from "@/app/(authenticated)/learn/source/actions";
import { useRouter } from "next/navigation";
import { FormEvent, useRef, useState, useTransition } from "react";

export function UrlImportForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const url = (formData.get("url") as string | null)?.trim() ?? "";
    if (!url) {
      setError("Paste a URL to import.");
      return;
    }

    startTransition(async () => {
      const result = await importDocumentFromUrl({}, formData);
      if (result.documentId) {
        formRef.current?.reset();
        router.push(`/learn/reader?documentId=${result.documentId}`);
        return;
      }
      if (result.error) {
        setError(result.error);
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="source-url" className="block text-sm font-medium text-zinc-300">
          Article or page URL
        </label>
        <input
          id="source-url"
          name="url"
          type="url"
          required
          placeholder="https://example.com/article"
          className="mt-1.5 w-full rounded-xl border border-white/15 bg-zinc-900 px-3.5 py-2.5 text-white outline-none ring-indigo-500 transition focus:border-indigo-500 focus:ring-2"
        />
      </div>

      {error && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60"
      >
        {isPending ? "Fetching page…" : "Import and open reader"}
      </button>
    </form>
  );
}