export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-52 bg-slate-200 rounded-lg" />
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-5 space-y-2">
            <div className="h-4 w-24 bg-slate-200 rounded" />
            <div className="h-7 w-16 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
        <div className="h-5 w-36 bg-slate-200 rounded" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-12 bg-slate-100 rounded-lg" />
        ))}
      </div>
    </div>
  )
}
