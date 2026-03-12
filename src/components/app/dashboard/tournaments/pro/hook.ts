'use client';
import { useQuery, useLazyQuery } from '@apollo/client/react';
import type {
  ProTournamentsRes,
  ProTournamentsVar,
  ProTournamentDetailVar,
  LeaderboardRes,
  LeaderboardVar,
  PlayerDetailRes,
  PlayerDetailVar,
  HoleStatsRes,
  HoleStatsVar,
  ProTournamentType,
  ResType,
  ResYear,
  ProTournamentsDetailRes,
  ProScoreCardRes,
  ProScoreCardVar,
  ProTournamentFormats,
} from './_interface';
import {
  GET_PRO_TOURNAMENTS,
  GET_PRO_TOURNAMENT_DETAIL,
  GET_LEADERBOARD,
  GET_PLAYERS,
  GET_PLAYER_DETAIL,
  GET_TICKETS,
  GET_HOLE_STATS,
  GET_PRO_TYPES,
  GET_PRO_YEARS,
  GET_PRO_SCORE_CARD,
} from './_query';

export const useProTournaments = ({
  filters,
  details,
}: {
  filters?: ProTournamentsVar;
  details?: { id: string; type: ProTournamentType };
}) => {

  const { data, ...d } = useQuery<ProTournamentsRes, ProTournamentsVar>(
    GET_PRO_TOURNAMENTS,
    {
      variables: { ...filters as ProTournamentsVar, pageState: 1 },
      skip: !filters,
    }
  );

  const { data: detailData, ...l } = useQuery<
    ProTournamentsDetailRes,
    ProTournamentDetailVar
  >(GET_PRO_TOURNAMENT_DETAIL, {
    variables: {
      tournament_id: details?.id as string,
      tournament: details?.type as ProTournamentType,
    },
    skip: !details?.id,
  });

  return {
    games: { d: data?.getProTournaments?.data?.tournaments, ...d },
    detail: { d: detailData?.getProTournamentDetail?.data, ...l },
  };
};

// export const useProTournamentDetail = (id: string, type: ProTournamentType) =>
//   useQuery<ProTournamentDetailRes, ProTournamentDetailVar>(
//     GET_PRO_TOURNAMENT_DETAIL,
//     {
//       variables: { id: id, gameType: type },
//       skip: !id,
//     }
//   );

export const useFilters = (type?: ProTournamentType) => {
  const { data: types, refetch, loading } = useQuery<ResType>(GET_PRO_TYPES);

  const {
    data,
    loading: yearLoad,
    fetchMore,
  } = useQuery<ResYear>(GET_PRO_YEARS, {
    variables: { tournament: type },
  });

  return {
    filterBy: {
      types: types?.getProTournamentsTypes,
      years: data?.getProTournamentsYears,
    },
    load: {
      type: loading,
      year: yearLoad,
    },
    fetch: {
      type: refetch,
      year: fetchMore,
    },
  };
};

export const useLeaderboard = (type: ProTournamentType, id: string) => {
  const leaderBoard = useQuery<LeaderboardRes, LeaderboardVar>(
    GET_LEADERBOARD,
    {
      variables: {
        tournament: type,
        tournament_id: id,
        pageState: 1,
      },
      fetchPolicy: 'cache-first',
    }
  );

  return {
    scores: leaderBoard?.data?.getProTournamentLeaderBoard?.data,
    ...leaderBoard,
  };
};

export const usePlayers = (type: ProTournamentType, id?: string) => {
  const { data, ...activePlayer } = useQuery<PlayerDetailRes, PlayerDetailVar>(
    GET_PLAYER_DETAIL,
    {
      variables: { player_id: id!, tournament: type },
      skip: !id,
      // Use cache-and-network for instant cached display + background refresh
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first',
    }
  );

  const normalPlayer = data?.getProTournamentPlayerDetail?.data;

  return { detail: normalPlayer, ...activePlayer };
};

export const useProScoreCard = (
  playerId: string,
  format: ProTournamentFormats,
  type: ProTournamentType,
  id: string
) => {
  const { data, ...scoreCard } = useQuery<ProScoreCardRes, ProScoreCardVar>(
    GET_PRO_SCORE_CARD,
    {
      variables: {
        tournament: type,
        params: {
          tournament_id: id,
          participant_id: playerId,
          tournament_type: format,
        },
      },
    }
  );

  return {
    scoreInfo: data?.getProTournamentPlayerScoreCard?.data,
    ...scoreCard,
  };
};

export const useHoleStats = () =>
  useLazyQuery<HoleStatsRes, HoleStatsVar>(GET_HOLE_STATS);
