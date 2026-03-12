'use client';

import { Skeleton, TableRow, TableCell } from '@/components/ui';

type LeaderboardFormat = 'stroke' | 'local' | 'player';

interface LeaderboardRowSkeletonProps {
  format?: LeaderboardFormat;
  roundsCount?: number; // For local tournaments
  count?: number;
}

export const LeaderboardRowSkeleton = ({
  format = 'stroke',
  roundsCount = 4,
  count = 5,
}: LeaderboardRowSkeletonProps) => {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <TableRow
          key={idx}
          className="animate-in fade-in duration-300"
          style={{ animationDelay: `${idx * 60}ms` }}
        >
          {format === 'stroke' && (
            <>
              <TableCell>
                <Skeleton className="h-6 w-10 rounded" />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded" /> {/* Flag */}
                  <Skeleton className="h-4 w-32" /> {/* Name */}
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-12 mx-auto" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16 mx-auto rounded" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-12 mx-auto" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-8 mx-auto" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-8 mx-auto" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-8 mx-auto" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-8 mx-auto" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16 mx-auto rounded" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-4" />
              </TableCell>
            </>
          )}

          {format === 'local' && (
            <>
              <TableCell>
                <Skeleton className="h-6 w-8 rounded" />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-2 justify-center">
                  {Array.from({ length: roundsCount }).map((_, i) => (
                    <Skeleton key={i} className="h-4 w-8" />
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-12 mx-auto" />
              </TableCell>
            </>
          )}

          {format === 'player' && (
            <>
              <TableCell>
                <Skeleton className="h-4 w-6" />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-4 w-4 rounded" /> {/* Flag */}
                  <Skeleton className="h-4 w-32" />
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-8 w-20 rounded-lg ml-auto" />
              </TableCell>
            </>
          )}
        </TableRow>
      ))}
    </>
  );
};
