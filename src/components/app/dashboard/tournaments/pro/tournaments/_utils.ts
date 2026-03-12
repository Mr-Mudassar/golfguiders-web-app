import { useMemo } from 'react';
import {
  ProScores,
  ProTournamentParams,
  ProTournamentStatus,
  TeamCupEntry,
  TeamCupGroup,
  TeamCupHole,
  UnifiedPlayer,
} from '../_interface';
import { alpha3ToAlpha2 } from '@/lib/utils';

export const groupTeamCupMatches = (
  leaderboard: TeamCupEntry[]
): TeamCupGroup[] => {
  const matches: Record<string, TeamCupGroup> = {};

  leaderboard.forEach((player) => {
    const matchId = player.match_id;

    if (!matches[matchId]) {
      matches[matchId] = {
        match_id: matchId,
        title: player.title,
        match_title: player.match_title,
        match_status: player.match_status,
        players: [],
      };
    }

    matches[matchId].players.push(player);
  });

  Object.values(matches).forEach((match) => {
    match.players.sort((a, b) => {
      const scoreA = parseFloat(a.team_score) || 0;
      const scoreB = parseFloat(b.team_score) || 0;
      return scoreB - scoreA;
    });
  });

  return Object.values(matches).sort((a, b) => {
    return (
      (a.players[0]?.location_sort || 0) - (b.players[0]?.location_sort || 0)
    );
  });
};

// export const calcStats = (holes: TeamCupHole[]) => {
//   if (!holes) return null;

//   const eagles = holes.filter(
//     (h) => h.status ?? h.team_status === 'EAGLE'
//   ).length;
//   const birdies = holes.filter(
//     (h) => h.status ?? h.team_status === 'BIRDIE'
//   ).length;
//   const pars = holes.filter((h) => h.status ?? h.team_status === 'PAR').length;
//   const bogeys = holes?.filter(
//     (h) => h.status ?? h.team_status === 'BOGEY'
//   ).length;
//   const doubleBogeys = holes.filter(
//     (h) => h.status ?? h.team_status === 'DOUBLE_BOGEY+'
//   ).length;

//   const totalStrokes = holes.reduce(
//     (sum, h) => sum + (Number(h.score ?? h?.team_score) || 0),
//     0
//   );
//   const totalPar = holes.reduce((sum, h) => sum + (h.par || 0), 0);
//   const toPar = totalStrokes - totalPar;

//   return {
//     eagles,
//     birdies,
//     pars,
//     bogeys,
//     doubleBogeys,
//     totalStrokes,
//     totalPar,
//     toPar,
//   };
// };

export const calcStats = (holes: TeamCupHole[]) => {
  if (!holes?.length) return null;

  const getScore = (h: TeamCupHole) => Number(h.score ?? h?.team_score) || 0;

  // Scoring stats
  const eagles = holes.filter(
    (h) => (h.status ?? h?.team_status) === 'EAGLE'
  ).length;
  const birdies = holes.filter(
    (h) => (h.status ?? h?.team_status) === 'BIRDIE'
  ).length;
  const pars = holes.filter(
    (h) => (h.status ?? h?.team_status) === 'PAR'
  ).length;
  const bogeys = holes.filter(
    (h) => (h.status ?? h?.team_status) === 'BOGEY'
  ).length;
  const doubleBogeys = holes.filter(
    (h) => (h.status ?? h?.team_status) === 'DOUBLE_BOGEY+'
  ).length;

  const totalStrokes = holes.reduce((sum, h) => sum + getScore(h), 0);
  const totalPar = holes.reduce((sum, h) => sum + (h.par || 0), 0);
  const toPar = totalStrokes - totalPar;

  // NOT AVAILABLE FROM BE
  const fairwaysHit = 0;
  const fairwaysPossible = holes.filter((h) => h.par >= 4).length;
  const fairwayPercentage = 0;

  const totalPutts = 0;

  return {
    eagles,
    birdies,
    pars,
    bogeys,
    doubleBogeys,
    totalStrokes,
    totalPar,
    toPar,
    fairwaysHit,
    fairwaysPossible,
    fairwayPercentage,
    totalPutts,
  };
};

export const teeColor = (status: string) =>
  status === 'EAGLE'
    ? 'text-blue-600'
    : status === 'BIRDIE'
      ? 'text-green-600'
      : status === 'BOGEY'
        ? 'text-yellow-600'
        : status === 'DOUBLE_BOGEY+'
          ? 'text-red-600'
          : 'text-gray-700';

export const statusName = (v: ProTournamentStatus) => {
  switch (v) {
    case 'INPROGRESS':
      return {
        n: 'Live Tournaments',
        d: 'Currently active tournaments. Watch the action unfold!',
        icon: '🔴',
        badgeVariant: 'default' as const,
      };
    case 'UPCOMING':
      return {
        n: 'Upcoming Tournaments',
        d: 'Scheduled events. Get ready to compete!',
        icon: '📅',
        badgeVariant: 'secondary' as const,
      };
    default:
      return {
        n: 'Finished Tournaments',
        d: 'Completed events with final results available.',
        icon: '✅',
        badgeVariant: 'outline' as const,
      };
  }
};