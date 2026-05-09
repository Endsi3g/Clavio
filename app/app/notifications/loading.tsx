import { Skeleton } from '@/components/ui/skeleton'

export default function NotificationsLoading() {
  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="rounded-xl border bg-white divide-y divide-slate-100">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 px-6 py-4">
            <Skeleton className="h-4 w-4 mt-0.5 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-64" />
            </div>
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}
