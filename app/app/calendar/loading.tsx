import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-56" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16 rounded-md" />
          <Skeleton className="h-8 w-48 rounded-lg" />
        </div>
      </div>
      <div className="rounded-xl border overflow-hidden">
        <div className="grid grid-cols-7 border-b">
          {[...Array(7)].map((_, i) => <div key={i} className="py-2 px-2"><Skeleton className="h-3 w-8 mx-auto" /></div>)}
        </div>
        <div className="grid grid-cols-7">
          {[...Array(35)].map((_, i) => (
            <div key={i} className="min-h-[100px] p-2 border-b border-r space-y-1.5">
              <Skeleton className="h-5 w-5 rounded-full" />
              {i % 4 === 0 && <Skeleton className="h-4 w-full rounded" />}
              {i % 7 === 0 && <Skeleton className="h-4 w-3/4 rounded" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
