export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-slate-200 rounded-lg" />
      <div className="grid gap-4 md:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
            <div className="h-5 w-32 bg-slate-200 rounded" />
            <div className="h-24 bg-slate-100 rounded-lg" />
            <div className="h-9 bg-slate-200 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}
