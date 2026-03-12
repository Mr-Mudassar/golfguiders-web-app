import { useLazyQuery } from '@apollo/client/react';
import { GET_TICKETS } from '../../_query';
import {
  ProTicketsResponse,
  ProTicketVar,
  ProTournamentType,
} from '../../_interface';
import { useSearchParams } from 'next/navigation';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

export function useInfiniteTickets(type?: ProTournamentType) {
  const [fetchTickets] = useLazyQuery<ProTicketsResponse, ProTicketVar>(
    GET_TICKETS,
    {
      fetchPolicy: 'no-cache',
    }
  );

  const queryFn = async ({ pageParam = 1 }) => {
    const { data } = await fetchTickets({
      variables: {
        pageState: pageParam,
        tournament: type as ProTournamentType,
      },
    });

    if (!data) return { tickets: [], has_more: false };

    const tickets = data?.getProTournamentsTickets.data?.tickets ?? [];
    const has_more = data?.getProTournamentsTickets?.data?.has_more ?? false;

    return { tickets, has_more };
  };

  const ticketsQuery = useInfiniteQuery({
    queryKey: ['tickets'],
    queryFn,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.has_more ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });

  const allTickets = useMemo(
    () => ticketsQuery?.data?.pages.flatMap((p) => p.tickets) ?? [],
    [ticketsQuery.data]
  );

  return {
    ticketsQuery,
    allTickets,
  };
}
