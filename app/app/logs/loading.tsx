import { Skeleton } from '@/components/ui/skeleton'

export default function LogsLoading() {
  return (
    <div className="space-y-4">
      {/* Header + filters */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-32 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
      </div>

      {/* List of 8 skeleton rows */}
      <div className="rounded-lg border overflow-hidden divide-y">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-start gap-4 px-4 py-3">
            <Skeleton className="h-5 w-5 rounded-full mt-0.5 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-3 w-full max-w-md" />
            </div>
            <Skeleton className="h-3 w-24 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}
