export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-28 bg-slate-200 rounded-lg" />
      <div className="flex gap-2">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-8 w-24 bg-slate-200 rounded-full" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="aspect-video bg-slate-100" />
            <div className="p-4 space-y-3">
              <div className="flex gap-2">
                <div className="h-5 w-20 bg-slate-200 rounded-full" />
                <div className="h-5 w-16 bg-slate-100 rounded-full" />
              </div>
              <div className="space-y-1.5">
                <div className="h-4 bg-slate-200 rounded w-full" />
                <div className="h-4 bg-slate-200 rounded w-4/5" />
              </div>
              <div className="h-3 bg-slate-100 rounded w-3/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
