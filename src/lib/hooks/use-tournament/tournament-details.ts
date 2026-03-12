import { useQuery } from '@apollo/client/react';
import { useEffect, useRef, useState } from 'react';
import type {
  GameOverview,
  GetGameDetail,
  GetGameTeam,
  GetScorePermit,
  ITournamentScoreType,
  ITournamentScoreVar,
  TournamentLeaderBoard,
} from './_interface';
import {
  GetGameOverview,
  GetLeaderBoard,
  GetScorePermission,
  GetTeamById,
  GetTournamentDetail,
  GetTournamentScore,
} from './_query';
import type {
  ParsedTournament,
  ScorePermission,
  TournamentLeaderBoardType,
  TournamentOverviewList,
  TournamentTeam,
} from '@/lib/definitions';

export const useTournamentDetail = ({
  gameId,
  created,
  organizerId,
}: {
  gameId?: string;
  created?: string;
  organizerId?: string;
}) => {
  const [type, setTournamentType] = useState<
    'PLAYER' | 'COORGANIZER' | 'TEAM' | ''
  >('PLAYER');
  const teamState = useQuery<GetGameTeam>(GetTeamById, {
    variables: { id: gameId as string },
    fetchPolicy: 'cache-and-network',
    skip: !gameId,
  });

  const scorePermitState = useQuery<GetScorePermit>(GetScorePermission, {
    variables: { id: gameId! },
    fetchPolicy: 'cache-and-network',
    skip: !gameId,
  });

  const gameState = useQuery<GetGameDetail>(GetTournamentDetail, {
    variables: { created: created as string, user_id: organizerId },
    fetchPolicy: 'cache-and-network',
    skip: !created,
  });

  const leaderBoardState = useQuery<TournamentLeaderBoard>(GetLeaderBoard, {
    variables: { gameId: gameId! },
    fetchPolicy: 'cache-and-network',
    skip: !gameId,
  });

  const game = gameState.data?.getTournamentDetail
    ? {
        ...gameState.data.getTournamentDetail,
        players: JSON.parse(gameState.data.getTournamentDetail.players || '[]'),
      }
    : null;

  useEffect(() => {
    if (!!game && gameId) {
      setTournamentType(
        game?.scoring_method === 'SCRAMBLE' ? 'TEAM' : 'PLAYER'
      );
    }
  }, [gameState, gameId, game]);

  const overViewState = useQuery<GameOverview>(GetGameOverview, {
    variables: {
      gameId: gameId!,
      type: type ?? 'PLAYER',
    },
    fetchPolicy: 'cache-and-network',
    skip: !gameId || !type,
  });

  // Auto-fetch all remaining pages so every consumer gets the full list
  const fetchingMore = useRef(false);
  const pageState = overViewState?.data?.getTournamentOverView?.pageState;

  useEffect(() => {
    if (!pageState || fetchingMore.current) return;
    fetchingMore.current = true;

    overViewState.fetchMore({
      variables: { page: pageState },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          getTournamentOverView: {
            ...fetchMoreResult.getTournamentOverView,
            values: [
              ...(prev.getTournamentOverView?.values ?? []),
              ...(fetchMoreResult.getTournamentOverView?.values ?? []),
            ],
          },
        };
      },
    }).finally(() => {
      fetchingMore.current = false;
    });
  }, [pageState]); // eslint-disable-line react-hooks/exhaustive-deps

  const isNotActive = overViewState?.data?.getTournamentOverView?.values?.every(
    (e) => !!e?.is_match_completed
  );

  return {
    data: {
      game: game as ParsedTournament,
      overview: overViewState?.data?.getTournamentOverView
        ?.values as TournamentOverviewList[],
      score: scorePermitState?.data
        ?.getPermissionByTournament as ScorePermission[],
      leaderboard: leaderBoardState?.data?.getTournamentLeaderBoard
        ?.values as TournamentLeaderBoardType[],
      team: teamState?.data?.getTeamByTournament as TournamentTeam[],
    },
    state: {
      tournament: gameState,
      overview: overViewState,
      leaderBoard: leaderBoardState,
      scorePermission: scorePermitState,
      team: teamState,
    },
    isNotActive,
    setTournamentType,
  };
};
