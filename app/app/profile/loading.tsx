import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-9 w-32 rounded-md" />
      </div>
      <div className="rounded-lg border overflow-hidden">
        <div className="flex items-center gap-4 bg-muted/50 px-4 py-3">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-20 ml-auto" />
          <Skeleton className="h-4 w-24" />
        </div>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-t px-4 py-3">
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-5 w-20 ml-auto rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  )
}
