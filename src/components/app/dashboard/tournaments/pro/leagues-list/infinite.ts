// useFetchPlayers.ts - Updated version
import { useLazyQuery } from '@apollo/client/react';
import { useInfiniteQuery } from '@tanstack/react-query';
import React, { useEffect } from 'react';
import {
  ProTournaments,
  ProTournamentsRes,
  ProTournamentStatus,
  ProTournamentsVar,
  ProTournamentType,
} from '../_interface';
import { GET_PRO_TOURNAMENTS } from '../_query';
import { useAppSelector } from '@/lib';

export function useFetchTournaments() {
  const t = useAppSelector((s) => s.leagues.activeFilters);

  // @ts-expect-error
  const type = t.tournament == 'all' ? undefined : t.tournament;

  const [fetchTournaments] = useLazyQuery<ProTournamentsRes, ProTournamentsVar>(
    GET_PRO_TOURNAMENTS,
    {
      fetchPolicy: 'no-cache',
    }
  );

  const queryFn = async ({ pageParam = 1 }) => {
    // Provide default status if not set to prevent GraphQL error
    const status = t?.status || 'INPROGRESS';

    const { data } = await fetchTournaments({
      variables: {
        pageState: pageParam,
        status: status as ProTournamentStatus,
        params: t?.params,
        tournament: type,
      },
    });

    if (!data) return { players: [], hasMore: false };

    const tournaments = data.getProTournaments?.data?.tournaments ?? [];
    const hasMore = data.getProTournaments?.data?.has_more ?? false;

    return { tournaments, hasMore };
  };

  const leagueQuery = useInfiniteQuery({
    queryKey: ['pro_tournaments', t?.params?.year, t?.status, type],
    queryFn,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });

  useEffect(() => {
    leagueQuery?.refetch();
  }, [t]);

  const allLeagues = React.useMemo(
    () => leagueQuery?.data?.pages.flatMap((p) => p?.tournaments) ?? [],
    [leagueQuery.data]
  );

  return {
    leagueQuery,
    data: allLeagues as ProTournaments[],
  };
}
