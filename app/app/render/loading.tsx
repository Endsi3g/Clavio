export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-44 bg-slate-200 rounded-lg" />
      <div className="rounded-xl border border-slate-200 bg-white">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-slate-100 last:border-0">
            <div className="h-4 w-4 rounded-full bg-slate-200" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-48 bg-slate-200 rounded" />
              <div className="h-3 w-32 bg-slate-100 rounded" />
            </div>
            <div className="h-6 w-20 bg-slate-200 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
