'use client';

import React from 'react';
import { useAppSelector } from '@/lib';
import { useProScoreCard } from '../../hook';
import {
  ProScores,
  ProTournamentFormats,
  ProTournamentType,
  TeamStrokeEntry,
} from '../../_interface';
import { Skeleton } from '@/components/ui';
import { TeamCupScoreCard } from './cup';
import { IndividualScoreCard } from './solo';
import { TeamStrokeScoreCard } from './stroke';
import { toast } from 'sonner';

interface ScoreCardProps {
  player: {
    id: string;
    name: string;
  };
  isTeam?: boolean;
  isTeamCup?: boolean;
  teamPlayers?: TeamStrokeEntry[];
}

export const ScoreCard: React.FC<ScoreCardProps> = ({
  player,
  isTeam = false,
  isTeamCup = false,
  teamPlayers = [],
}) => {
  const { activeProLeague: l } = useAppSelector((s) => s?.leagues);
  const { scoreInfo, loading, refetch } = useProScoreCard(
    player?.id,
    l?.format as ProTournamentFormats,
    l?.type as ProTournamentType,
    l?.gameId as string
  );

  const handleFetch = async () => {
    await refetch();
  };

  if (loading) {
    return (
      <div className="p-4">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (!scoreInfo) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No score data available
      </div>
    );
  }

  // Determine which component to render based on format
  const format = l?.format;

  if (format === 'TEAM_CUP') {
    if (scoreInfo?.players) {
      return (
        <TeamCupScoreCard
          matchId={scoreInfo?.match_id as string}
          groupName={`Group ${scoreInfo?.match_id}`}
          players={scoreInfo?.players}
          scoreData={scoreInfo as ProScores}
        />
      );
    }
  }

  if (format === 'TEAM_STROKE' && isTeam && teamPlayers.length > 0) {
    return (
      <TeamStrokeScoreCard
        refetch={handleFetch}
        teamId={player.id}
        teamPlayers={teamPlayers}
        data={scoreInfo}
      />
    );
  }

  return <IndividualScoreCard data={scoreInfo} playerName={player.name} />;
};
