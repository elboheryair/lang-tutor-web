export function AuthenticatedPageFallback() {
  return (
    <div className="animate-pulse space-y-4" aria-busy="true" aria-label="Loading">
      <div className="h-4 w-28 rounded bg-white/10" />
      <div className="h-10 w-72 max-w-full rounded bg-white/10" />
      <div className="h-5 w-full max-w-xl rounded bg-white/10" />
      <div className="h-5 w-4/5 max-w-md rounded bg-white/10" />
    </div>
  );
}
