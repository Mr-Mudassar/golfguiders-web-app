// useFetchPlayers.ts - Updated version
import { useLazyQuery } from '@apollo/client/react';
import { useInfiniteQuery } from '@tanstack/react-query';
import React from 'react';
import { GET_PLAYERS } from '../../_query';
import type {
  PlayersRes,
  PlayersVar,
  ProTournamentType,
} from '../../_interface';

export function useFetchPlayers(type: ProTournamentType) {
  const [fetchPlayers] = useLazyQuery<PlayersRes, PlayersVar>(GET_PLAYERS, {
    fetchPolicy: 'no-cache',
  });

  const queryFn = async ({ pageParam = 1 }) => {
    console.log('Fetching page:', pageParam); // Debug log
    const { data } = await fetchPlayers({
      variables: { pageState: pageParam, tournament: type },
    });

    if (!data) return { players: [], hasMore: false };

    const players = data.getProTournamentPlayers?.data?.players ?? [];
    const hasMore = data.getProTournamentPlayers?.data?.has_more ?? false;
    return { players, hasMore };
  };

  const playersQuery = useInfiniteQuery({
    queryKey: ['players', type],
    queryFn,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });

  const allPlayers = React.useMemo(
    () => playersQuery?.data?.pages.flatMap((p) => p.players) ?? [],
    [playersQuery.data]
  );

  return {
    playersQuery,
    allPlayers,
  };
}
