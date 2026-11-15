"use client";

import { importDocumentFromFile } from "@/app/(authenticated)/learn/source/actions";
import { UPLOAD_ACCEPT } from "@/lib/documents/parse-file";
import { useRouter } from "next/navigation";
import { FormEvent, useRef, useState, useTransition } from "react";

export function FileUploadZone() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function openFilePicker() {
    inputRef.current?.click();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const file = inputRef.current?.files?.[0];
    if (!file || file.size === 0) {
      setError("Choose a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    startTransition(async () => {
      const result = await importDocumentFromFile({}, formData);
      if (result.documentId) {
        router.push(`/learn/reader?documentId=${result.documentId}`);
        return;
      }
      if (result.error) {
        setError(result.error);
      }
    });
  }

  return (
    <form
      encType="multipart/form-data"
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <input
        ref={inputRef}
        type="file"
        name="file"
        accept={UPLOAD_ACCEPT}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          setSelectedName(file?.name ?? null);
          setError(null);
        }}
      />

      <div
        role="button"
        tabIndex={0}
        onClick={openFilePicker}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openFilePicker();
          }
        }}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragActive(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragActive(false);
          const file = event.dataTransfer.files?.[0];
          if (!file || !inputRef.current) return;
          const dt = new DataTransfer();
          dt.items.add(file);
          inputRef.current.files = dt.files;
          setSelectedName(file.name);
          setError(null);
        }}
        className={`flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition ${
          dragActive
            ? "border-indigo-400 bg-indigo-500/10"
            : "border-white/20 bg-zinc-900/50 hover:border-indigo-400/60"
        }`}
        aria-label="Upload a learning document"
      >
        <p className="text-sm font-medium text-white">Drop a file here</p>
        <p className="mt-1 text-xs text-zinc-400">
          .txt, .pdf, .docx supported · .epub coming soon
        </p>
        {selectedName && (
          <p className="mt-3 text-sm text-indigo-200">Selected: {selectedName}</p>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending || !selectedName}
        className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
      >
        {isPending ? "Processing file…" : "Upload and open reader"}
      </button>
    </form>
  );
}