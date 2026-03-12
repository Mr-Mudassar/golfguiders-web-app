import { Skeleton } from '@/components/ui';
import { cn } from '@/lib/utils';
import React from 'react';

interface PostCardSkeletonProps {
  className?: string;
  count?: number;
  showBuddyInfo?: boolean;
  showGolfCourse?: boolean;
}

const PostCardSkeleton: React.FC<PostCardSkeletonProps> = ({
  className,
  count = 1,
  showBuddyInfo = false,
  showGolfCourse = false,
}) => {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div 
          key={idx}
          className={cn(
            'flex w-full flex-col rounded-lg border border-border/40 bg-card/50 backdrop-blur-sm p-4',
            'animate-in fade-in slide-in-from-bottom-4 duration-500',
            className
          )}
          style={{
            animationDelay: `${idx * 100}ms`,
            animationFillMode: 'both',
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="w-12 h-12 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>

          {/* Golf Buddy Info - Optional */}
          {showBuddyInfo && (
            <div className="px-4 mb-3 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-20 rounded-full" /> {/* Badge */}
                <Skeleton className="h-4 w-24" /> {/* Date */}
              </div>
              <Skeleton className="h-4 w-32" /> {/* Players count */}
            </div>
          )}

          {/* Content */}
          <div className="space-y-3 mb-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>

          {/* Golf Course - Optional */}
          {showGolfCourse && (
            <div className="mx-4 mb-3 p-3 rounded-xl border border-border/40 bg-muted/20">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" /> {/* Icon */}
                <Skeleton className="h-4 w-40" /> {/* Course name */}
              </div>
              <Skeleton className="h-3 w-32 mt-1.5" /> {/* Location */}
            </div>
          )}

          {/* Media */}
          <Skeleton className="w-full h-[400px] rounded-lg mb-4" />

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full ml-auto" />
          </div>
        </div>
      ))}
    </>
  );
};

export { PostCardSkeleton };
