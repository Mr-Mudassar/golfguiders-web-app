'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  ScrollArea,
  Input,
  Button,
  Icon,
} from '@/components/ui';
import { LeagueCard } from '../../league-card';
import { useDebounceValue } from 'usehooks-ts';
import type { ProTournamentStatus, ProTournamentType } from '../_interface';
import { useFetchTournaments } from './infinite';
import { Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { statusName } from '../tournaments/_utils';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/lib';
import { setFilters } from '@/lib/redux/slices';

interface LeaguesListProps {
  readonly className?: string;
  type?: ProTournamentType;
  status: ProTournamentStatus;
  year: string;
}

const STATUS_TABS: { label: string; value: ProTournamentStatus }[] = [
  { label: 'Live', value: 'INPROGRESS' },
  { label: 'Upcoming', value: 'UPCOMING' },
  { label: 'Finished', value: 'COMPLETED' },
];

const TOUR_FILTERS: { label: string; value: ProTournamentType; colorClass: string }[] = [
  { label: 'All', value: undefined, colorClass: 'bg-primary' },
  { label: 'PGA', value: 'pga', colorClass: 'bg-blue-600' },
  { label: 'LPGA', value: 'lpga', colorClass: 'bg-rose-500' },
  { label: 'LIV', value: 'livgolf', colorClass: 'bg-orange-600' },
  { label: 'Champions', value: 'pgachampions', colorClass: 'bg-emerald-600' },
];

const ProLeaguesList: React.FC<LeaguesListProps> = ({
  className,
  type,
  status,
  year,
}) => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useDebounceValue('', 500);
  const observerRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const dispatch = useAppDispatch();
  const filters = useAppSelector((s) => s.leagues.activeFilters);

  // Initialize status to 'INPROGRESS' if not set
  useEffect(() => {
    if (!filters?.status) {
      dispatch(setFilters({
        ...filters,
        status: 'INPROGRESS' as ProTournamentStatus
      }));
    }
  }, []);

  const { data: allLeagues, leagueQuery } = useFetchTournaments();

  // Handle search with debounce
  useEffect(() => {
    setDebouncedSearch(search);
  }, [search, setDebouncedSearch]);

  const filteredLeagues = React.useMemo(() => {
    if (!debouncedSearch) {
      return allLeagues;
    }
    return allLeagues.filter((league) =>
      league?.name?.toLowerCase()?.includes(debouncedSearch?.toLowerCase())
    );
  }, [debouncedSearch, allLeagues]);

  // Group tournaments by month
  const groupedLeagues = React.useMemo(() => {
    if (!filteredLeagues?.length) return [];
    const groups: { label: string; leagues: typeof filteredLeagues }[] = [];
    let currentLabel = '';
    for (const league of filteredLeagues) {
      const label = `${league.month} ${league.year}`;
      if (label !== currentLabel) {
        groups.push({ label, leagues: [league] });
        currentLabel = label;
      } else {
        groups[groups.length - 1].leagues.push(league);
      }
    }
    return groups;
  }, [filteredLeagues]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          leagueQuery?.hasNextPage &&
          !leagueQuery?.isFetchingNextPage
        ) {
          leagueQuery?.fetchNextPage();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    const currentObserverRef = observerRef.current;
    if (currentObserverRef) {
      observer.observe(currentObserverRef);
    }

    return () => {
      if (currentObserverRef) {
        observer.unobserve(currentObserverRef);
      }
    };
  }, [
    leagueQuery?.hasNextPage,
    leagueQuery?.isFetchingNextPage,
    leagueQuery?.fetchNextPage,
  ]);

  // Scroll to top when year or status changes
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = 0;
    }
  }, [year, status]);

  const handleStatusChange = (value: ProTournamentStatus) => {
    dispatch(setFilters({ ...filters, status: value }));
  };

  const handleTourChange = (value: ProTournamentType) => {
    dispatch(setFilters({ ...filters, tournament: value }));
  };

  const getTournamentCountText = () => {
    if (leagueQuery?.isLoading || leagueQuery?.isFetching)
      return <Skeleton className="h-4 w-28" />;
    if (filteredLeagues?.length === 0) return 'No tournaments';
    if (debouncedSearch && filteredLeagues?.length > 0)
      return `${filteredLeagues?.length} found`;
    return `${filteredLeagues?.length} tournament${filteredLeagues?.length !== 1 ? 's' : ''}`;
  };

  const TournamentSkeleton = () => (
    <div className="p-4 border-b border-border/30">
      <div className="flex items-center space-x-3">
        <Skeleton className="size-11 rounded-lg" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    </div>
  );

  return (
    <Card className={cn('border-border/50', className)}>
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex flex-col gap-3">
          {/* Title row */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="size-[18px] text-primary" />
              <h2 className="text-lg font-bold">{year} Tournaments</h2>
            </div>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search..."
                className="h-8 w-44 text-xs"
                value={search}
                icon={search ? 'close' : 'search'}
                onIconClick={() => setSearch('')}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button
                onClick={() => leagueQuery?.refetch()}
                size="icon"
                variant="ghost"
                disabled={leagueQuery?.isRefetching}
                className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <Icon
                  name="refresh"
                  size={16}
                  className={leagueQuery?.isRefetching ? 'animate-spin' : ''}
                />
              </Button>
            </div>
          </div>

          {/* Status tabs + count */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center bg-muted/50 rounded-lg p-0.5 gap-0.5">
                {STATUS_TABS.map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => handleStatusChange(tab.value)}
                    className={cn(
                      'px-3 py-1.5 text-xs font-medium rounded-md transition-all',
                      status === tab.value
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-xs font-medium text-muted-foreground shrink-0">
              {getTournamentCountText()}
            </div>
          </div>

          {/* Tour filter pills */}
          <div className="flex items-center gap-1.5">
            {TOUR_FILTERS.map((tour) => (
              <button
                key={tour.label}
                type="button"
                onClick={() => handleTourChange(tour.value)}
                className={cn(
                  'px-2.5 py-1 text-[11px] font-semibold rounded-full transition-all',
                  filters?.tournament === tour.value
                    ? `${tour.colorClass} text-white`
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                )}
              >
                {tour.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 relative overflow-hidden">
        <ScrollArea className="h-[68vh]" ref={scrollAreaRef}>
          {/* Initial loading */}
          {leagueQuery?.isLoading && !allLeagues.length && (
            <div>
              {Array.from({ length: 8 }).map((_, i) => (
                <TournamentSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Error state */}
          {leagueQuery?.isError && (
            <div className="flex flex-col items-center justify-center min-h-75 p-8 text-center">
              <div className="rounded-full bg-destructive/10 p-4 mb-4">
                <AlertCircle className="h-10 w-10 text-destructive" />
              </div>
              <h3 className="font-semibold text-base mb-1">
                Unable to Load Tournaments
              </h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-md">
                {leagueQuery?.error?.message ||
                  'There was an error loading the tournaments. Please try again.'}
              </p>
              <Button
                onClick={() => leagueQuery?.refetch()}
                variant="outline"
                size="sm"
              >
                <Icon name="refresh" size={14} className="mr-1.5" />
                Retry
              </Button>
            </div>
          )}

          {/* Empty state */}
          {!leagueQuery?.isLoading &&
            !leagueQuery?.isError &&
            filteredLeagues?.length === 0 && (
              <div className="flex flex-col items-center justify-center min-h-75 p-8 text-center animate-in fade-in duration-300">
                <div className="rounded-full bg-muted/50 p-4 mb-3">
                  <Calendar className="size-6 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-base mb-1">
                  No {statusName(status).n} Found
                </h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                  {debouncedSearch
                    ? `No tournaments matching "${debouncedSearch}"`
                    : statusName(status).d}
                </p>
                {debouncedSearch && (
                  <Button
                    onClick={() => setSearch('')}
                    variant="ghost"
                    size="sm"
                    className="text-primary"
                  >
                    Clear search
                  </Button>
                )}
              </div>
            )}

          {/* Tournaments list with month grouping */}
          {!leagueQuery?.isLoading && groupedLeagues.length > 0 && (
            <div>
              {groupedLeagues.map((group) => (
                <div key={group.label}>
                  <div className="sticky top-0 z-10 px-4 py-2 bg-muted/60 backdrop-blur-sm border-b border-border/30">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      {group.label}
                    </span>
                  </div>
                  <div className="divide-y divide-border/30">
                    {group.leagues.map((league) => (
                      <LeagueCard key={league?.id} league={league} />
                    ))}
                  </div>
                </div>
              ))}

              {/* Loading more indicator */}
              {leagueQuery?.isFetchingNextPage && (
                <div>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <TournamentSkeleton key={i} />
                  ))}
                </div>
              )}

              {/* Observer element for infinite scroll */}
              {leagueQuery?.hasNextPage && !leagueQuery?.isFetchingNextPage && (
                <div ref={observerRef} className="h-10" />
              )}

              {/* End of list */}
              {!leagueQuery?.hasNextPage && filteredLeagues?.length > 0 && (
                <div className="py-4 flex items-center justify-center gap-2 text-xs text-muted-foreground border-t border-border/30">
                  <CheckCircle className="size-3.5 text-primary" />
                  All {filteredLeagues?.length} tournaments loaded
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Loading overlay for refetch */}
        {leagueQuery?.isRefetching && !leagueQuery?.isFetchingNextPage && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-sm font-medium">Refreshing...</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { ProLeaguesList };
