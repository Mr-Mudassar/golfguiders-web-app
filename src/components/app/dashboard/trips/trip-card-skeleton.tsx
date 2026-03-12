import { Card, Skeleton } from '@/components/ui';

interface TripCardSkeletonProps {
  count?: number;
}

export const TripCardSkeleton = ({ count = 1 }: TripCardSkeletonProps) => {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <Card
          key={idx}
          className="overflow-hidden animate-in fade-in duration-300"
          style={{ animationDelay: `${idx * 60}ms` }}
        >
          <Skeleton className="h-52 w-full" />
          <div className="p-4 space-y-3">
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-2 w-2 rounded-full" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
        </Card>
      ))}
    </>
  );
};
