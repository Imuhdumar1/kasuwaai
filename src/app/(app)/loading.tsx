/**
 * Route-level loading skeleton for every page under (app). Next.js renders this
 * as the Suspense fallback while the server component fetches data, so pages no
 * longer flash empty. The AppShell (sidebar/topbar) stays; only content swaps.
 */
function Bar({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-surface-2 ${className}`} />;
}

export default function Loading() {
  return (
    <div className="animate-fade-up" aria-busy="true" aria-label="Loading">
      {/* Page header */}
      <div className="mb-6 space-y-2.5">
        <Bar className="h-7 w-44" />
        <Bar className="h-4 w-64 max-w-[70%]" />
      </div>

      {/* KPI cards */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-line bg-surface p-4 shadow-card">
            <Bar className="h-3 w-20" />
            <Bar className="mt-3 h-6 w-24" />
          </div>
        ))}
      </div>

      {/* List rows */}
      <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 border-b border-line p-4 last:border-0">
            <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-surface-2" />
            <div className="min-w-0 flex-1 space-y-2">
              <Bar className="h-4 w-1/3" />
              <Bar className="h-3 w-1/4" />
            </div>
            <Bar className="h-4 w-16 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
