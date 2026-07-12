// Task-detail-shaped instant loading state: back link, meta, title, facts strip.
export default function Loading() {
  return (
    <div className="mx-auto max-w-[880px] px-5 md:px-8 py-12" aria-busy="true">
      <div className="h-4 w-36 rounded bg-surface-container animate-pulse" />
      <div className="h-3.5 w-48 rounded bg-surface-container animate-pulse mt-9 mb-4" />
      <div className="h-12 w-3/4 rounded bg-surface-container animate-pulse" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-10 pt-8 border-t border-border-crisp">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <div className="h-3.5 w-20 rounded bg-surface-container animate-pulse mb-2.5" />
            <div className="h-6 w-16 rounded bg-surface-container animate-pulse" />
          </div>
        ))}
      </div>
      <div className="pt-10 mt-10 border-t border-border-crisp space-y-3">
        <div className="h-4 w-full max-w-[640px] rounded bg-surface-container animate-pulse" />
        <div className="h-4 w-5/6 max-w-[560px] rounded bg-surface-container animate-pulse" />
        <div className="h-4 w-2/3 max-w-[420px] rounded bg-surface-container animate-pulse" />
      </div>
    </div>
  );
}
