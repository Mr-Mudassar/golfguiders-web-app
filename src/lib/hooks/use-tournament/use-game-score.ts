import { useMutation, useQuery } from '@apollo/client/react';
import type {
  AddStableFordScore,
  AddStrokeScore,
  ITournamentScoreType,
  ITournamentScoreVar,
  TournamentScoreMutate,
  TournamentScoreVar,
} from './_interface';
import { AddTournamentScore, StableFordScore, StrokeScore } from './_mutation';
import { GetTournamentScore } from './_query';
import type { ScoringMethod, TournamentScore } from '@/lib/definitions';

export const useGameScore = ({
  gameId,
  method,
  playerId,
  round,
}: {
  playerId?: string;
  round?: number;
  method?: ScoringMethod;
  gameId?: string;
}) => {
  const [strokeScore, strokeScoreState] = useMutation<
    AddStrokeScore,
    TournamentScoreVar
  >(StrokeScore);

  const [stableFordScore, stableFordState] = useMutation<
    AddStableFordScore,
    TournamentScoreVar
  >(StableFordScore);

  const [tournamentScore, gameScoreState] = useMutation<
    TournamentScoreMutate,
    TournamentScoreVar
  >(AddTournamentScore);

  const gameScore = useQuery<ITournamentScoreType, ITournamentScoreVar>(
    GetTournamentScore,
    {
      variables: {
        gameId: gameId as string,
        playerId: playerId as string,
        round: round as number,
        scoringMethod: method as ScoringMethod,
      },
      skip: !playerId || !round || !gameId,
      fetchPolicy: 'cache-and-network',
    }
  );

  return {
    strokeScore,
    stableFordScore,
    tournamentScore,
    gameScore: gameScore?.data?.getTournamentScore as TournamentScore[],
    status: {
      tournament: gameScoreState,
      stroke: strokeScoreState,
      stableford: stableFordState,
      gameScore: gameScore,
    },
  };
};
