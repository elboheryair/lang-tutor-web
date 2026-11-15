import { AuthenticatedPageFallback } from "@/components/authenticated-page-fallback";
import { FileUploadZone } from "@/components/learn/file-upload-zone";
import { SavedDocumentsList } from "@/components/learn/saved-documents-list";
import { UrlImportForm } from "@/components/learn/url-import-form";
import { requireLearningLanguage } from "@/lib/auth/learning-session";
import { listUserDocumentsForLanguage } from "@/lib/user-documents";
import Link from "next/link";
import { Suspense } from "react";

async function LearnSourceContent() {
  const { user, language, languageCode } = await requireLearningLanguage();
  const documents = await listUserDocumentsForLanguage(user.id, languageCode);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="inline-flex items-center gap-2 rounded-full bg-indigo-500/15 px-3 py-1 text-sm text-indigo-100">
          <span aria-hidden>{language.flag}</span>
          Learning: {language.name}
        </p>
        <Link
          href="/dashboard"
          className="text-sm text-zinc-400 transition hover:text-white"
        >
          Change language
        </Link>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section
          className="rounded-2xl border border-white/10 bg-white/5 p-6"
          aria-labelledby="upload-heading"
        >
          <h2 id="upload-heading" className="text-lg font-semibold text-white">
            Upload file
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Import text from your device to start learning.
          </p>
          <div className="mt-5">
            <FileUploadZone />
          </div>
        </section>

        <section
          className="rounded-2xl border border-white/10 bg-white/5 p-6"
          aria-labelledby="url-heading"
        >
          <h2 id="url-heading" className="text-lg font-semibold text-white">
            Insert URL
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Paste a link to an article or page; we extract readable text.
          </p>
          <div className="mt-5">
            <UrlImportForm />
          </div>
        </section>
      </div>

      <section className="mt-12" aria-labelledby="saved-heading">
        <h2 id="saved-heading" className="text-lg font-semibold text-white">
          Resume saved document
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Your documents for {language.name}, newest activity first.
        </p>
        <div className="mt-5">
          <SavedDocumentsList documents={documents} languageName={language.name} />
        </div>
      </section>
    </>
  );
}

export default function LearnSourcePage() {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">
        Learning source
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
        Choose your content
      </h1>
      <p className="mt-2 max-w-2xl text-zinc-400">
        Upload a file, import from the web, or continue a document you saved earlier.
      </p>
      <Suspense fallback={<AuthenticatedPageFallback />}>
        <LearnSourceContent />
      </Suspense>
    </div>
  );
}
