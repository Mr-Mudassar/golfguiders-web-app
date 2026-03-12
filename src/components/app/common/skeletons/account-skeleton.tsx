import { Skeleton } from '@/components/ui';
import React from 'react';

const AccountSkeleton = () => {
  return (
    <div className="flex items-center gap-2 py-0.5">
      <Skeleton className="w-12 aspect-square rounded-full" />
      <div className="space-y-1">
        <Skeleton className="w-40 h-4" />
        <Skeleton className="w-20 h-3" />
      </div>
    </div>
  );
};

export { AccountSkeleton };
