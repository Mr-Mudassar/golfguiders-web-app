import { Skeleton } from '@/components/ui';

export function TicketSkeleton() {
  return (
    <div className="rounded-xl border border-border/50 overflow-hidden">
      <Skeleton className="h-1 w-full rounded-none" />
      <div className="p-4">
        <div className="flex items-start gap-3">
          <Skeleton className="shrink-0 size-11 rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <Skeleton className="h-4 w-3/4 rounded" />
              <Skeleton className="h-4 w-10 rounded" />
            </div>
            <Skeleton className="h-3 w-24 rounded" />
          </div>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
          <Skeleton className="h-3 w-24 rounded" />
          <Skeleton className="h-7 w-20 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
