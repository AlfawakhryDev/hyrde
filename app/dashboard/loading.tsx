import { RowSkeleton } from "@/components/Loader";

// Dashboard-shaped instant loading state: header, stats, list rows.
export default function Loading() {
  return (
    <div className="mx-auto max-w-[1080px] px-5 md:px-8 py-12" aria-busy="true">
      <div className="mb-10">
        <div className="h-11 w-64 rounded bg-surface-container animate-pulse mb-4" />
        <div className="h-4 w-96 max-w-full rounded bg-surface-container animate-pulse" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-10 mb-10 border-b border-border-crisp">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <div className="h-3.5 w-24 rounded bg-surface-container animate-pulse mb-2.5" />
            <div className="h-8 w-12 rounded bg-surface-container animate-pulse" />
          </div>
        ))}
      </div>
      <div className="h-4 w-28 rounded bg-surface-container animate-pulse mb-5" />
      <RowSkeleton rows={4} />
    </div>
  );
}
