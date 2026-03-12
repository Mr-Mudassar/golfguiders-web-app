'use client';

import React from 'react';
import { Card, Skeleton } from '@/components/ui';

const GameCardSkeleton: React.FC<{ compact?: boolean; className?: string }> = ({
  compact = false,
}) => {
  return (
    <Card
      className={`w-full rounded-lg border border-border/30 shadow-sm ${compact ? 'p-3' : 'p-4'}`}
    >
      {/* Title + Organizer */}
      <div className="flex items-start justify-between">
        <Skeleton className={`h-4 ${compact ? 'w-28' : 'w-40'}`} />
        <Skeleton className="h-3 w-20" />
      </div>

      {/* Date & Course */}
      <div className="mt-2 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-3 w-24" />
        </div>
        {!compact && (
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-32" />
          </div>
        )}
      </div>

      {/* Players / Teams */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-4 w-14 rounded-full" />
      </div>
    </Card>
  );
};

export { GameCardSkeleton };
