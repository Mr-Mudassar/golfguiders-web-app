import React from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useLazyQuery } from '@apollo/client/react';
import type { Tournament } from '@/lib/definitions';
import {
  GetTournamentByCo,
  GetTournamentByPlayer,
  GetTournamentByUser,
} from './_query';
import type {
  TournamentByCo,
  TournamentByPlayer,
  TournamentByUser,
  TournamentVariable,
} from './_interface';

const GameQueries = {
  organizer: {
    query: GetTournamentByUser,
    type: {} as TournamentByUser,
    variables: {} as TournamentVariable,
    dataKey: 'getTournamentByUser',
  },
  'co-organizer': {
    query: GetTournamentByCo,
    type: {} as TournamentByCo,
    variables: {} as TournamentVariable,
    dataKey: 'getTournamentByCoOrganizer',
  },
  player: {
    query: GetTournamentByPlayer,
    type: {} as TournamentByPlayer,
    variables: {} as TournamentVariable,
    dataKey: 'getTournamentByPlayer',
  },
} as const;

type TournamentType = keyof typeof GameQueries;
export type GamesFeedType = TournamentType;

interface TournamentRes {
  values: Tournament[];
  pageState: string | null;
}

interface UseInfiniteGamesType<T extends TournamentType> {
  type: T;
  variables?: TournamentVariable;
  change?: { activeTab: string; isRefresh: number | null };
  enabled?: boolean;
  initialPageParam?: string;
  refetchOnMount?: boolean | 'always';
}

export function useInfiniteGames<T extends TournamentType>({
  type,
  variables,
  change,
  ...options
}: UseInfiniteGamesType<T>) {
  const [hasNextPage, setHasNextPage] = React.useState<boolean>(true);

  const queryConfig = GameQueries[type];

  const [fetchGames] = useLazyQuery<
    typeof queryConfig.type,
    typeof queryConfig.variables
  >(queryConfig.query, {
    fetchPolicy: 'no-cache',
  });

  // Store the last pageState to use in getNextPageParam
  const lastPageStateRef = React.useRef<string | null>(null);

  // Reset pageState when query key changes (type, activeTab, etc.)
  React.useEffect(() => {
    lastPageStateRef.current = null;
    setHasNextPage(true);
  }, [type, change?.activeTab, change?.isRefresh]);

  const infiniteQuery = useInfiniteQuery({
    queryKey: [
      'games',
      type,
      change?.activeTab,
      change?.isRefresh,
    ],
    queryFn: async ({ pageParam }) => {
      // Use pageParam if available, otherwise use null for first page
      const pageValue = pageParam && typeof pageParam === 'string' ? pageParam : null;

      const { data, error } = await fetchGames({
        variables: { page: pageValue },
      });

      if (error) {
        console.error('Error fetching games:', error);
        return [];
      }

      if (!data) return [];

      const games = data[
        queryConfig.dataKey as keyof typeof data
      ] as TournamentRes;

      // Store the pageState for use in getNextPageParam
      lastPageStateRef.current = games.pageState;

      setHasNextPage(!!games.pageState);
      return games.values;
    },
    getNextPageParam: (lastPage) => {
      // Use the stored pageState from the last response
      // If pageState is null or empty, there are no more pages
      if (!lastPageStateRef.current || lastPage.length === 0) {
        return undefined;
      }
      return lastPageStateRef.current;
    },
    initialPageParam: options.initialPageParam || null,
    refetchOnMount: options.refetchOnMount ?? false,
    refetchOnWindowFocus: false, // Prevent refetch on window focus
    enabled: options.enabled !== false, // Only disable if explicitly set to false
    ...options,
  });

  return { ...infiniteQuery, hasNextPage };
}
