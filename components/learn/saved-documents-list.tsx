"use client";

import {
  deleteSavedDocument,
  lockSavedDocument,
} from "@/app/(authenticated)/learn/source/actions";
import { SessionCompletionSummary } from "@/components/learn/session-completion-summary";
import {
  statsFromStoredReport,
  storedReportHasFullSummary,
} from "@/lib/reader/completion-report";
import type { UserDocumentSummary } from "@/lib/user-documents";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type SavedDocumentsListProps = {
  documents: UserDocumentSummary[];
  languageName: string;
};

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

function SourceTypeBadge({
  sourceType,
}: {
  sourceType: UserDocumentSummary["source_type"];
}) {
  switch (sourceType) {
    case "file":
      return (
        <span className="shrink-0 rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs font-medium text-indigo-200">
          File
        </span>
      );
    case "url":
      return (
        <span className="shrink-0 rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-200">
          Web
        </span>
      );
    case "pasted_text":
      return (
        <span className="shrink-0 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-200">
          Pasted
        </span>
      );
    default:
      return (
        <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-xs text-zinc-300">
          Source
        </span>
      );
  }
}

function DoneCheckIcon({ className }: { className?: string }) {
  return (
    <span
      className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 ${className ?? ""}`}
      aria-hidden
    >
      <svg
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </span>
  );
}

function TrashIcon() {
  return (
    <svg
      aria-hidden
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      aria-hidden
      className="h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function ProgressBlock({ progress }: { progress: number }) {
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between gap-2 text-xs text-zinc-400">
        <span className="flex items-center gap-1.5">
          Progress
          {progress >= 100 ? (
            <DoneCheckIcon className="!h-5 !w-5" />
          ) : null}
        </span>
        <span>{progress}%</span>
      </div>
      <div
        className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full transition-all ${
            progress >= 100 ? "bg-emerald-500" : "bg-indigo-500"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export function SavedDocumentsList({
  documents,
  languageName,
}: SavedDocumentsListProps) {
  const router = useRouter();
  const [pendingDelete, setPendingDelete] = useState<UserDocumentSummary | null>(
    null,
  );
  const [pendingLock, setPendingLock] = useState<UserDocumentSummary | null>(
    null,
  );
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [lockError, setLockError] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isLocking, startLockTransition] = useTransition();

  if (documents.length === 0) {
    return (
      <p className="text-sm text-zinc-400">
        No saved documents for {languageName} yet. Upload a file or import a URL
        above.
      </p>
    );
  }

  function handleDeleteConfirm() {
    if (!pendingDelete) return;
    setDeleteError(null);
    const id = pendingDelete.id;
    startDeleteTransition(async () => {
      const result = await deleteSavedDocument(id);
      if (!result.ok) {
        setDeleteError(result.error);
        return;
      }
      setPendingDelete(null);
      router.refresh();
    });
  }

  function handleLockConfirm() {
    if (!pendingLock) return;
    setLockError(null);
    const id = pendingLock.id;
    startLockTransition(async () => {
      const result = await lockSavedDocument(id);
      if (!result.ok) {
        setLockError(result.error);
        return;
      }
      setPendingLock(null);
      router.refresh();
    });
  }

  return (
    <>
      <ul className="grid gap-3 sm:grid-cols-2">
        {documents.map((document) => {
          const progress = Math.min(100, Math.max(0, document.last_position));
          const isComplete = progress >= 100;
          const isLocked = document.session_locked;
          const report = document.completion_report;

          if (isLocked) {
            return (
              <li key={document.id}>
                <div className="flex h-full flex-col rounded-2xl border border-emerald-500/25 bg-zinc-900/60">
                  <div className="flex items-start gap-2 p-4 pb-0">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-2">
                        <DoneCheckIcon />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-medium text-white line-clamp-2">
                              {document.title}
                            </h3>
                            <SourceTypeBadge sourceType={document.source_type} />
                          </div>
                          <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-emerald-300">
                            <LockIcon />
                            Finished — session locked
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteError(null);
                        setPendingDelete(document);
                      }}
                      className="shrink-0 rounded-lg p-2 text-zinc-400 transition hover:bg-red-500/15 hover:text-red-300"
                      aria-label={`Delete session: ${document.title}`}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                  <div className="flex flex-1 flex-col p-4 pt-2">
                    <p className="text-xs text-zinc-500">
                      Completed: {formatDate(document.updated_at)}
                    </p>
                    {report && storedReportHasFullSummary(report) ? (
                      <SessionCompletionSummary
                        stats={statsFromStoredReport(report)}
                        className="mt-3"
                      />
                    ) : null}
                    <ProgressBlock progress={100} />
                  </div>
                </div>
              </li>
            );
          }

          return (
            <li key={document.id}>
              <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-zinc-900/60 transition hover:border-indigo-400/50 hover:bg-zinc-900">
                <div className="flex items-start gap-2 p-4 pb-0">
                  <Link
                    href={`/learn/reader?documentId=${document.id}`}
                    className="min-w-0 flex-1"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-white line-clamp-2">
                        {document.title}
                      </h3>
                      <SourceTypeBadge sourceType={document.source_type} />
                    </div>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteError(null);
                      setPendingDelete(document);
                    }}
                    className="shrink-0 rounded-lg p-2 text-zinc-400 transition hover:bg-red-500/15 hover:text-red-300"
                    aria-label={`Delete session: ${document.title}`}
                  >
                    <TrashIcon />
                  </button>
                </div>
                <Link
                  href={`/learn/reader?documentId=${document.id}`}
                  className="flex flex-1 flex-col p-4 pt-2"
                >
                  <p className="text-xs text-zinc-500">
                    Last activity: {formatDate(document.updated_at)}
                  </p>
                  <ProgressBlock progress={progress} />
                  <span className="mt-4 text-sm font-medium text-indigo-300">
                    Resume reading →
                  </span>
                </Link>
                {report && storedReportHasFullSummary(report) ? (
                  <div className="px-4 pb-2">
                    <SessionCompletionSummary
                      stats={statsFromStoredReport(report)}
                    />
                  </div>
                ) : null}
                {isComplete ? (
                  <div className="border-t border-white/10 px-4 py-3">
                    <button
                      type="button"
                      onClick={() => {
                        setLockError(null);
                        setPendingLock(document);
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600/90 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
                    >
                      <DoneCheckIcon className="!h-5 !w-5 !bg-emerald-400/30" />
                      Mark as finished
                    </button>
                    <p className="mt-2 text-center text-xs text-zinc-500">
                      Locks the session and removes the source text after
                      confirming.
                    </p>
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>

      {pendingLock && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="presentation"
          onClick={() => {
            if (!isLocking) setPendingLock(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="lock-session-title"
            className="w-full max-w-md rounded-2xl border border-white/20 bg-zinc-900 p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <DoneCheckIcon className="!h-10 !w-10" />
              <div>
                <h2
                  id="lock-session-title"
                  className="text-lg font-semibold text-white"
                >
                  Mark this session as finished?
                </h2>
                <p className="mt-3 text-sm text-zinc-300">
                  You reached 100% on{" "}
                  <span className="font-medium text-white">
                    {pendingLock.title}
                  </span>
                  . After you confirm:
                </p>
              </div>
            </div>
            <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-zinc-400">
              <li>Your practice summary stays saved on this card.</li>
              <li>The session will be locked — you cannot open it again.</li>
              <li>The original source text will be removed from our servers.</li>
            </ul>
            {lockError && (
              <p className="mt-3 text-sm text-red-400" role="alert">
                {lockError}
              </p>
            )}
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleLockConfirm}
                disabled={isLocking}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
              >
                {isLocking ? "Saving & locking…" : "Yes, mark as finished"}
              </button>
              <button
                type="button"
                onClick={() => setPendingLock(null)}
                disabled={isLocking}
                className="rounded-xl border border-white/20 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-white/5 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {pendingDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="presentation"
          onClick={() => {
            if (!isDeleting) setPendingDelete(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-session-title"
            className="w-full max-w-sm rounded-2xl border border-white/20 bg-zinc-900 p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2
              id="delete-session-title"
              className="text-lg font-semibold text-white"
            >
              Delete this session?
            </h2>
            <p className="mt-3 text-sm text-zinc-300">
              Are you sure you want to delete{" "}
              <span className="font-medium text-white">
                {pendingDelete.title}
              </span>
              ? Your reading progress for this session will be removed. This
              cannot be undone.
            </p>
            {deleteError && (
              <p className="mt-3 text-sm text-red-400" role="alert">
                {deleteError}
              </p>
            )}
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-50"
              >
                {isDeleting ? "Deleting…" : "Yes, delete"}
              </button>
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                disabled={isDeleting}
                className="rounded-xl border border-white/20 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-white/5 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}