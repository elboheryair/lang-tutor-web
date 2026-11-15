import { AuthenticatedPageFallback } from "@/components/authenticated-page-fallback";
import { ReaderView } from "@/components/learn/reader-view";
import { requireLearningLanguage } from "@/lib/auth/learning-session";
import { getUserDocument } from "@/lib/user-documents";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

type ReaderPageProps = {
  searchParams: Promise<{ documentId?: string }>;
};

async function ReaderContent({ documentId }: { documentId: string }) {
  const { user, language, languageCode } = await requireLearningLanguage();
  const document = await getUserDocument(user.id, documentId);

  if (!document) {
    notFound();
  }

  if (document.language !== languageCode) {
    redirect("/learn/source");
  }

  return (
    <div className="h-full min-h-0">
      <ReaderView
        documentId={document.id}
        title={document.title}
        content={document.content}
        initialPosition={document.last_position}
        languageName={language.name}
      />
    </div>
  );
}

export default async function LearnReaderPage({ searchParams }: ReaderPageProps) {
  const { documentId } = await searchParams;

  if (!documentId) {
    redirect("/learn/source");
  }

  return (
    <div className="mx-auto h-[calc(100dvh-10.5rem)] w-full max-w-6xl overflow-hidden">
      <Suspense fallback={<AuthenticatedPageFallback />}>
        <ReaderContent documentId={documentId} />
      </Suspense>
    </div>
  );
}
