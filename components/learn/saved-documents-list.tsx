import type { UserDocumentSummary } from "@/lib/user-documents";
import Link from "next/link";

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

function sourceLabel(sourceType: UserDocumentSummary["source_type"]): string {
  switch (sourceType) {
    case "file":
      return "File";
    case "url":
      return "URL";
    case "pasted_text":
      return "Pasted";
    default:
      return "Source";
  }
}

export function SavedDocumentsList({
  documents,
  languageName,
}: SavedDocumentsListProps) {
  if (documents.length === 0) {
    return (
      <p className="text-sm text-zinc-400">
        No saved documents for {languageName} yet. Upload a file or import a URL
        above.
      </p>
    );
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {documents.map((document) => {
        const progress = Math.min(100, Math.max(0, document.last_position));
        return (
          <li key={document.id}>
            <Link
              href={`/learn/reader?documentId=${document.id}`}
              className="flex h-full flex-col rounded-2xl border border-white/10 bg-zinc-900/60 p-4 transition hover:border-indigo-400/50 hover:bg-zinc-900"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium text-white line-clamp-2">
                  {document.title}
                </h3>
                <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-xs text-zinc-300">
                  {sourceLabel(document.source_type)}
                </span>
              </div>
              <p className="mt-2 text-xs text-zinc-500">
                Last activity: {formatDate(document.updated_at)}
              </p>
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>Progress</span>
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
                    className="h-full rounded-full bg-indigo-500 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <span className="mt-4 text-sm font-medium text-indigo-300">
                Resume reading →
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
