'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Input,
  Button,
  Icon,
} from '@/components/ui';
import { ProTicketType, ProTournamentType } from '../../_interface';
import { useInfiniteTickets } from './hook';
import { TicketSkeleton } from './skeleton';
import TicketCard from './card';
import { cn } from '@/lib/utils';
import { useDebounceValue } from 'usehooks-ts';
import { Ticket, AlertCircle, CheckCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppDispatch, useAppSelector } from '@/lib';
import { setFilters } from '@/lib/redux/slices';

const TOUR_FILTERS: {
  label: string;
  value: string | undefined;
  colorClass: string;
}[] = [
  { label: 'All', value: undefined, colorClass: 'bg-primary' },
  { label: 'PGA', value: 'pga', colorClass: 'bg-blue-600' },
  { label: 'LPGA', value: 'lpga', colorClass: 'bg-rose-500' },
  { label: 'LIV', value: 'livgolf', colorClass: 'bg-orange-600' },
  { label: 'Champions', value: 'pgachampions', colorClass: 'bg-emerald-600' },
];

export function ProTicketList({
  className,
  type,
}: {
  className?: string;
  type: ProTournamentType;
}) {
  const [search, setSearchValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useDebounceValue('', 500);
  const { ticketsQuery, allTickets } = useInfiniteTickets(
    type as ProTournamentType
  );

  const dispatch = useAppDispatch();
  const filters = useAppSelector((s) => s.leagues.activeFilters);

  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDebouncedSearch(search);
  }, [search, setDebouncedSearch]);

  useEffect(() => {
    ticketsQuery?.refetch();
  }, [type]);

  // Infinite scroll observer
  useEffect(() => {
    if (
      !loadMoreRef.current ||
      !ticketsQuery.hasNextPage ||
      ticketsQuery.isFetchingNextPage
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          ticketsQuery.hasNextPage &&
          !ticketsQuery.isFetchingNextPage
        ) {
          ticketsQuery.fetchNextPage();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [
    ticketsQuery.hasNextPage,
    ticketsQuery.isFetchingNextPage,
    ticketsQuery.fetchNextPage,
  ]);

  const filteredTickets = useMemo(
    () =>
      !debouncedSearch
        ? allTickets
        : allTickets?.filter(
            (f) =>
              f?.tour === debouncedSearch?.toLowerCase() ||
              f?.tournament_name
                ?.toLowerCase()
                ?.includes(debouncedSearch?.toLowerCase())
          ),
    [debouncedSearch, allTickets]
  );

  // Group tickets by month
  const groupedTickets = useMemo(() => {
    if (!filteredTickets?.length) return [];
    const groups: { label: string; tickets: ProTicketType[] }[] = [];
    let currentLabel = '';
    for (const ticket of filteredTickets) {
      const label = `${ticket.month} ${ticket.year}`;
      if (label !== currentLabel) {
        groups.push({ label, tickets: [ticket] });
        currentLabel = label;
      } else {
        groups[groups.length - 1].tickets.push(ticket);
      }
    }
    return groups;
  }, [filteredTickets]);

  const handleTourChange = (value: string | undefined) => {
    dispatch(
      setFilters({ ...filters, tournament: value as ProTournamentType })
    );
  };

  const getTicketCountText = () => {
    if (ticketsQuery?.isLoading || ticketsQuery?.isFetching)
      return <Skeleton className="h-4 w-28" />;
    if (filteredTickets?.length === 0) return 'No tickets';
    if (debouncedSearch && filteredTickets?.length > 0)
      return `${filteredTickets?.length} found`;
    return `${filteredTickets?.length} ticket${filteredTickets?.length !== 1 ? 's' : ''}`;
  };

  return (
    <Card className={cn('border-border/50', className)}>
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex flex-col gap-3">
          {/* Title row */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Ticket className="size-[18px] text-primary" />
              <h2 className="text-lg font-bold">Available Tickets</h2>
            </div>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search..."
                className="h-8 w-44 text-xs"
                value={search}
                icon={search ? 'close' : 'search'}
                onIconClick={() => setSearchValue('')}
                onChange={(e) => setSearchValue(e.target.value)}
              />
              <Button
                onClick={() => ticketsQuery?.refetch()}
                size="icon"
                variant="ghost"
                disabled={ticketsQuery?.isRefetching}
                className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <Icon
                  name="refresh"
                  size={16}
                  className={ticketsQuery?.isRefetching ? 'animate-spin' : ''}
                />
              </Button>
            </div>
          </div>

          {/* Tour filter pills + count */}
          <div className="flex items-center justify-between gap-3">
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
            <div className="text-xs font-medium text-muted-foreground shrink-0">
              {getTicketCountText()}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 relative overflow-hidden">
        {/* Initial loading */}
        {ticketsQuery?.isLoading && !allTickets.length && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <TicketSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error state */}
        {ticketsQuery?.isError && (
          <div className="flex flex-col items-center justify-center min-h-75 p-8 text-center">
            <div className="rounded-full bg-destructive/10 p-4 mb-4">
              <AlertCircle className="h-10 w-10 text-destructive" />
            </div>
            <h3 className="font-semibold text-base mb-1">
              Unable to Load Tickets
            </h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md">
              {ticketsQuery?.error?.message ||
                'There was an error loading tickets. Please try again.'}
            </p>
            <Button
              onClick={() => ticketsQuery?.refetch()}
              variant="outline"
              size="sm"
            >
              <Icon name="refresh" size={14} className="mr-1.5" />
              Retry
            </Button>
          </div>
        )}

        {/* Empty state */}
        {!ticketsQuery?.isLoading &&
          !ticketsQuery?.isError &&
          filteredTickets?.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-75 p-8 text-center animate-in fade-in duration-300">
              <div className="rounded-full bg-muted/50 p-4 mb-3">
                <Ticket className="size-6 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-base mb-1">
                No Tickets Found
              </h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                {debouncedSearch
                  ? `No tickets matching "${debouncedSearch}"`
                  : 'Check back later for upcoming tournaments.'}
              </p>
              {debouncedSearch && (
                <Button
                  onClick={() => setSearchValue('')}
                  variant="ghost"
                  size="sm"
                  className="text-primary"
                >
                  Clear search
                </Button>
              )}
            </div>
          )}

        {/* Tickets with month grouping */}
        {!ticketsQuery?.isLoading && groupedTickets.length > 0 && (
          <div>
            {groupedTickets.map((group) => (
              <div key={group.label}>
                <div className="sticky top-0 z-10 px-4 py-2 bg-muted/60 backdrop-blur-sm border-b border-border/30">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {group.label}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                  {group.tickets.map((ticket) => (
                    <TicketCard
                      key={`${ticket.tournament_id}-${ticket.year}`}
                      ticket={ticket}
                    />
                  ))}
                </div>
              </div>
            ))}

            {/* Loading more indicator */}
            {ticketsQuery?.isFetchingNextPage && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <TicketSkeleton key={i} />
                ))}
              </div>
            )}

            {/* Observer element for infinite scroll */}
            {ticketsQuery?.hasNextPage && !ticketsQuery?.isFetchingNextPage && (
              <div ref={loadMoreRef} className="h-10" />
            )}

            {/* End of list */}
            {!ticketsQuery?.hasNextPage && filteredTickets?.length > 0 && (
              <div className="py-4 flex items-center justify-center gap-2 text-xs text-muted-foreground border-t border-border/30">
                <CheckCircle className="size-3.5 text-primary" />
                All {filteredTickets?.length} tickets loaded
              </div>
            )}
          </div>
        )}

        {/* Loading overlay for refetch */}
        {ticketsQuery?.isRefetching && !ticketsQuery?.isFetchingNextPage && (
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
}
