import { Skeleton } from '@/components/ui/skeleton'

export default function PublishingLoading() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-9 w-32 rounded-md" />
      </div>

      {/* Tab skeleton */}
      <div className="flex gap-1 border-b pb-0">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-t-md rounded-b-none" />
        ))}
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <div className="flex items-center gap-4 bg-muted/50 px-4 py-3">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-24 ml-auto" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-t px-4 py-3">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-5 w-24 ml-auto rounded-full" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  )
}
