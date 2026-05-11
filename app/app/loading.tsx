export default function Loading() {
  return (
    <div className="flex-1 space-y-6 p-6 md:p-8 animate-pulse">
      {/* Page Header Skeleton */}
      <div className="flex flex-col gap-2">
        <div className="h-8 w-1/4 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
        <div className="h-4 w-1/3 bg-slate-100 dark:bg-slate-800/50 rounded-lg"></div>
      </div>

      {/* Stats/Cards Row Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="h-4 w-1/2 bg-slate-100 dark:bg-slate-800 rounded"></div>
              <div className="h-4 w-4 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
            </div>
            <div className="mt-4 h-8 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
          </div>
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 shadow-sm">
        <div className="space-y-4">
          <div className="h-6 w-1/4 bg-slate-200 dark:bg-slate-800 rounded"></div>
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 w-full bg-slate-50 dark:bg-slate-800/30 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
