import { Skeleton } from '@/components/ui';

const CommentSkeleton = ({ count = 1 }: { count?: number }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="flex gap-2 items-start animate-in fade-in duration-300"
          style={{ animationDelay: `${idx * 80}ms` }}
        >
          <Skeleton className="w-10 h-10 rounded-full shrink-0" />

          <div className="flex-1 space-y-2">
            {/* Comment bubble */}
            <div className="bg-muted/30 rounded-2xl rounded-tl-sm p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-24" /> {/* Name */}
                <Skeleton className="h-2 w-16" /> {/* Timestamp */}
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 px-2">
              <Skeleton className="h-3 w-12" /> {/* Like */}
              <Skeleton className="h-3 w-12" /> {/* Reply */}
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export { CommentSkeleton };
