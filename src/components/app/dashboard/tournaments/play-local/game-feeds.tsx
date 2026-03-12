'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils/cn';
import { Trophy } from 'lucide-react';
import {
  Button,
  Icon,
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui';
import { useIntersectionObserver } from 'usehooks-ts';
import { useAppSelector } from '@/lib';
import type { Tournament } from '@/lib/definitions';
import { useRouter, useSearchParams } from 'next/navigation';
import CreateTournamentWizard from './create';
import { useInfiniteGames } from '@/lib/hooks/use-tournament/use-infinite-games';
const TournamentCard = dynamic(() =>
  import('../../../common/tournament').then((mod) => mod.TournamentCard)
);
const ConfirmationModal = dynamic(() =>
  import('@/components/common/confirmationDialog').then((mod) => mod.ConfirmationModal)
);
const TournamentCardSkeleton = dynamic(() =>
  import('../../../common/tournament/skeleton').then(
    (mod) => mod.GameCardSkeleton
  )
);

type GameType = 'organizer' | 'co-organizer' | 'player';

const TournamentFeeds: React.FC<{ className?: string }> = ({ className }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const isRefresh: number | null = useAppSelector(
    (state) => state.user.isRefreshPost
  );

  const activeTab = (searchParams.get('tab') as GameType) || 'organizer';
  const gamesObserver = useIntersectionObserver({
    initialIsIntersecting: false, // Changed to false to prevent immediate fetch
  });

  const gamesInfiniteQuery = useInfiniteGames({
    type: activeTab,
    variables: {},
    change: { activeTab, isRefresh },
    enabled: !!activeTab,
    refetchOnMount: true,
  });

  const refetchGames = async () => {
    await gamesInfiniteQuery.refetch?.();
  };

  const games = React.useMemo(() => {
    return (gamesInfiniteQuery.data?.pages?.flat() ?? []) as Tournament[];
  }, [gamesInfiniteQuery.data]);

  // Store fetchNextPage in a ref to avoid dependency issues
  const fetchNextPageRef = React.useRef(gamesInfiniteQuery.fetchNextPage);
  React.useEffect(() => {
    fetchNextPageRef.current = gamesInfiniteQuery.fetchNextPage;
  }, [gamesInfiniteQuery.fetchNextPage]);

  useEffect(() => {
    if (
      gamesObserver.isIntersecting &&
      gamesInfiniteQuery.hasNextPage &&
      !gamesInfiniteQuery.isFetching &&
      !gamesInfiniteQuery.isLoading
    ) {
      // Use a small delay to prevent rapid successive calls
      const timeoutId = setTimeout(() => {
        if (
          gamesObserver.isIntersecting &&
          gamesInfiniteQuery.hasNextPage &&
          !gamesInfiniteQuery.isFetching &&
          !gamesInfiniteQuery.isLoading
        ) {
          fetchNextPageRef.current();
        }
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [
    gamesObserver.isIntersecting,
    gamesInfiniteQuery.hasNextPage,
    gamesInfiniteQuery.isFetching,
    gamesInfiniteQuery.isLoading,
  ]);

  const handleTabChange = (tab: GameType) => {
    router.push(`?tab=${tab?.toLowerCase()}`);
  };

  // Store refetch in a ref to avoid dependency issues
  const refetchRef = React.useRef(gamesInfiniteQuery.refetch);
  React.useEffect(() => {
    refetchRef.current = gamesInfiniteQuery.refetch;
  }, [gamesInfiniteQuery.refetch]);

  useEffect(() => {
    if (activeTab) {
      // Use a small delay to prevent rapid successive calls
      const timeoutId = setTimeout(() => {
        refetchRef.current();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [activeTab]);

  return (
    <>
      <TopBar activeTab={activeTab} refetchGames={refetchGames} />
      <section className={className}>
        {/* Tab selector */}
        <div className="mb-5 flex items-center bg-muted/40 p-1 rounded-2xl border border-border/40 w-full">
          {(['organizer', 'co-organizer', 'player'] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={cn(
                  'flex-1 px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 capitalize cursor-pointer',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                )}
              >
                {tab.replace('-', ' ')}
              </button>
            );
          })}
        </div>

        {/* List / empty / loading */}
        {!gamesInfiniteQuery.isFetching && !games?.length ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-primary/50" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">No tournaments yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                {activeTab === 'organizer'
                  ? 'Create your first tournament to get started.'
                  : 'You have not been added to any tournaments here.'}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3 mb-2">
              {games?.map((tournament) => (
                <TournamentCard
                  key={tournament?.tournament_id ?? tournament?.created}
                  tournament={tournament}
                  role={activeTab}
                  refetchGames={refetchGames}
                />
              ))}
            </div>
            {gamesInfiniteQuery.isFetching && (
              <TournamentCardSkeleton className="mt-2" />
            )}
            <div className="h-8" ref={gamesObserver.ref} />
          </>
        )}
      </section>
    </>
  );
};

export { TournamentFeeds };

// ----------------
// TopBar
// ----------------

const TopBar = ({
  activeTab,
  refetchGames,
}: {
  activeTab: GameType;
  refetchGames: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);

  return (
    <div className="flex items-center justify-between px-1 py-4 mb-1">
      <div>
        <h1 className="text-xl font-bold text-foreground tracking-tight">
          Play Tournament
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Manage and track your golf tournaments
        </p>
      </div>

      <Sheet
        open={open}
        onOpenChange={(val) => {
          if (!val) {
            setConfirm(true);
            return;
          }
          setOpen(val);
        }}
      >
        <SheetTrigger asChild>
          {activeTab === 'organizer' ? (
            <Button
              onClick={() => setOpen(true)}
              title="Create local tournament"
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/25 rounded-xl px-4"
            >
              <Icon name="plus" className="mr-1.5" />
              Create
            </Button>
          ) : (
            <span />
          )}
        </SheetTrigger>
        <SheetContent side="right" className="p-0 flex flex-col w-full border-l border-primary/20">
          <SheetTitle className="sr-only">Create tournament</SheetTitle>
          <CreateTournamentWizard
            close={() => setOpen(false)}
            refetchGames={refetchGames}
          />
          <ConfirmationModal
            title="Discard Changes?"
            cancelText="Keep Editing"
            confirmText="Discard"
            description="Are you sure you want to discard the changes to this tournament?"
            onConfirm={() => {
              setConfirm(false);
              setOpen(false);
            }}
            open={confirm}
            onOpenChange={() => setConfirm(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
};
