'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { Input, Skeleton, Badge, Table, TableHeader, TableRow, TableHead, TableBody, Card, CardContent } from '@/components/ui';
import { useDebounceValue } from 'usehooks-ts';
import { Trophy, Users, Target, Medal, Calendar, Clock } from 'lucide-react';
import { LeaderboardRowSkeleton } from '@/components/app/common/skeletons';
import type {
  LeaderBoardPlayer,
  ProTournamentFormats,
  StrokePlayEntry,
  TeamCupEntry,
  TeamStroke,
  TeamStrokeEntry,
} from '../../_interface';
import { StrokePlayLeaderboard } from './formats/stroke';
import { TeamStrokeLeaderboard } from './formats/team-stroke';
import { StablefordLeaderboard } from './formats/stableford';
import { TeamCupLeaderboard } from './formats/team-cup';
import { BaseLeaderboard } from './formats/base';
import { useLeaderboard } from '../../hook';
import { useAppDispatch, useAppSelector } from '@/lib';
import { setActiveTournament } from '@/lib/redux/slices';
import Image from 'next/image';
import { useParams } from 'next/navigation';

interface ProLeaderboardProps {
  className?: string;
}

// Utility functions
const groupTeamStroke = (leaderboard: LeaderBoardPlayer[]): TeamStroke[] => {
  // group by team_id
  const teamsMap: Record<string, LeaderBoardPlayer[]> = {};

  leaderboard.forEach((player) => {
    if (!player.team_id) return;
    if (!teamsMap[player.team_id]) teamsMap[player.team_id] = [];
    teamsMap[player.team_id].push(player);
  });

  return Object.values(teamsMap).map((players) => ({
    teamName: `Team ${players[0]?.position}`,
    id: players[0]?.team_id as string,
    pos: players[0]?.position,
    players: players as TeamStrokeEntry[],
  }));
};

const groupTeamCupMatches = (
  leaderboard: TeamCupEntry[]
): Record<string, TeamCupEntry[]> => {
  const matches: Record<string, TeamCupEntry[]> = {};

  leaderboard.forEach((player) => {
    const matchId = player.match_id;
    if (!matches[matchId]) {
      matches[matchId] = [];
    }
    matches[matchId].push(player);
  });

  return matches;
};

export const ProLeaderboard: React.FC<ProLeaderboardProps> = ({
  className = '',
}) => {
  const [search, setSearch] = useDebounceValue('', 500);
  const dis = useAppDispatch();
  const params: { leagueId: string } = useParams();
  const ac = useAppSelector((s) => s?.leagues?.activeProLeague);

  // Use URL param (leagueId) instead of Redux state for fetching data
  const {
    scores: rawData,
    loading,
    error,
  } = useLeaderboard(ac?.type!, params?.leagueId || ac?.gameId!);

  // Normalize data: default tournament_type to STROKE_PLAY if missing (e.g. LIV Golf)
  const data = useMemo(() => {
    if (!rawData) return rawData;
    return {
      ...rawData,
      tournament_type: rawData.tournament_type || 'STROKE_PLAY' as ProTournamentFormats,
    };
  }, [rawData]);

  // Sync Redux state with URL params and fetched data (only once per tournament)
  const syncedTournamentRef = useRef<string | null>(null);
  useEffect(() => {
    const tournamentId = data?.tournament_id;
    if (tournamentId && params?.leagueId && syncedTournamentRef.current !== tournamentId) {
      syncedTournamentRef.current = tournamentId;
      dis(setActiveTournament({
        gameId: params.leagueId,
        format: data?.tournament_type,
        type: ac?.type,
        name: ac?.name,
        status: ac?.status,
      }));
    }
  }, [data?.tournament_id, params?.leagueId]);

  const getFormatConfig = (format: ProTournamentFormats) => {
    const configs = {
      STROKE_PLAY: {
        title: 'Stroke Play',
        icon: <Target className="w-5 h-5" />,
        color: 'bg-primary',
      },
      TEAM_STROKE: {
        title: 'Team Stroke',
        icon: <Users className="w-5 h-5" />,
        color: 'bg-primary',
      },
      STABLEFORD: {
        title: 'Stableford',
        icon: <Medal className="w-5 h-5" />,
        color: 'bg-primary',
      },
      TEAM_CUP: {
        title: 'Team Cup',
        icon: <Trophy className="w-5 h-5" />,
        color: 'bg-primary',
      },
    };
    return configs[format];
  };

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!data?.leaderboard) return [];

    if (!search) return data.leaderboard;

    return data.leaderboard.filter((item) => {
      const name = `${item.first_name} ${item.last_name}`.toLowerCase();
      const teamName =
        data?.tournament_type === 'TEAM_CUP'
          ? `Group ${item?.match_id}`?.toLowerCase()
          : '';
      return (
        name.includes(search.toLowerCase()) ||
        teamName.includes(search.toLowerCase())
      );
    });
  }, [data?.leaderboard, search]);

  const teamStrokeGroups = useMemo(() => {
    if (!data || data.tournament_type !== 'TEAM_STROKE') return [];
    return groupTeamStroke(filteredData);
  }, [data, filteredData]);

  const teamCupMatches = useMemo(() => {
    if (!data || data.tournament_type !== 'TEAM_CUP') return {};
    return groupTeamCupMatches(filteredData as TeamCupEntry[]);
  }, [data, filteredData]);

  const renderLeaderboardContent = () => {
    if (!data) return null;

    switch (data.tournament_type) {
      case 'STROKE_PLAY':
        return (
          <StrokePlayLeaderboard players={filteredData as StrokePlayEntry[]} />
        );

      case 'TEAM_STROKE':
        return <TeamStrokeLeaderboard teams={teamStrokeGroups} />;

      case 'STABLEFORD':
        return (
          <StablefordLeaderboard players={filteredData as StrokePlayEntry[]} />
        );

      case 'TEAM_CUP':
        return <TeamCupLeaderboard matches={teamCupMatches} />;

      default:
        return null;
    }
  };

  if (loading && !data) {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-card rounded-lg border">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>
          <Skeleton className="h-10 w-48" />
        </div>

        {/* Leaderboard table skeleton */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pos</TableHead>
                <TableHead>Player</TableHead>
                <TableHead className="text-center">Total</TableHead>
                <TableHead className="text-center">Thru</TableHead>
                <TableHead className="text-center">Round</TableHead>
                <TableHead className="text-center">R1</TableHead>
                <TableHead className="text-center">R2</TableHead>
                <TableHead className="text-center">R3</TableHead>
                <TableHead className="text-center">R4</TableHead>
                <TableHead className="text-center">Strokes</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <LeaderboardRowSkeleton format="stroke" count={10} />
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center p-8 border rounded-lg ${className}`}>
        <Trophy className="w-12 h-12 text-destructive mx-auto mb-3" />
        <h3 className="font-semibold text-destructive">
          Can't Load Leaderboard
        </h3>
        {/* <p className="text-sm text-muted-foreground mt-2">{error.message}</p> */}
        <p className="text-sm text-muted-foreground mt-2">Please try again later</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={`text-center p-8 border rounded-lg ${className}`}>
        <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <h3 className="font-semibold">No Tournament Data</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Select a tournament to view leaderboard
        </p>
      </div>
    );
  }

  const formatConfig = getFormatConfig(data.tournament_type);

  const teamBatch = teamCupMatches[Object.keys(teamCupMatches)[0]];


  // const teamTotals = (name: string) => (
  //   Object.values(teamCupMatches).flat()
  //     .filter(item => item.team_name === name)
  //     .reduce((sum, item) => sum + Number(item.team_score || 0), 0)
  // );


  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 bg-card rounded-lg border-border/50 border shadow-sm">
        <div className="flex items-center gap-4">
          {formatConfig && (
            <div className="relative">
              <div className={`p-2.5 rounded-lg ${formatConfig.color} text-white shadow-md`}>
                {formatConfig.icon}
              </div>
            </div>
          )}
          <div>
            <h2 className="font-bold text-xl mb-1.5">{data.tournament_name}</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className="bg-primary/5 border-primary/20 text-primary font-medium text-xs"
              >
                {data.year}
              </Badge>
              <Badge
                variant={data.status === 'INPROGRESS' ? 'default' : 'secondary'}
                className={`capitalize font-semibold text-xs ${data.status === 'INPROGRESS'
                    ? 'bg-gradient-to-r from-green-600 to-green-500 animate-pulse'
                    : data.status === 'UPCOMING'
                      ? 'bg-blue-100 text-blue-700 border-blue-200'
                      : 'bg-gray-100 text-gray-700'
                  }`}
              >
                {data.status === 'INPROGRESS' && (
                  <span className="relative flex h-1.5 w-1.5 mr-1">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                  </span>
                )}
                {data.status === 'INPROGRESS' ? 'LIVE' : data.status?.toLowerCase()}
              </Badge>
              <Badge variant="secondary" className="text-xs font-medium">
                {formatConfig?.title}
              </Badge>
            </div>
          </div>
        </div>

        <Input
          placeholder="Search players or teams..."
          className="w-48 h-9"
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {data.tournament_type === 'TEAM_CUP' && (
        <>
          {/* Team Standings Summary */}
          {(() => {
            const teamStandings = teamBatch?.reduce((acc, player) => {
              const teamName = player.team_name;
              const teamScore = parseFloat(player.team_score || '0');

              if (!acc[teamName]) {
                acc[teamName] = {
                  name: teamName,
                  flag: player.team_flag,
                  color: player.team_color ?? '',
                  points: 0,
                };
              }
              acc[teamName].points += teamScore;

              return acc;
            }, {} as Record<string, { name: string; flag: string; color: string; points: number }>);

            const sortedTeams = Object.values(teamStandings || {}).sort((a, b) => b.points - a.points);

            return sortedTeams.length > 0 ? (
              <div className='grid gap-4 p-5 bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl border-2 border-border/50 shadow-sm'
                style={{
                  gridTemplateColumns: `repeat(${sortedTeams.length}, minmax(0, 1fr))`,
                }}
              >
                {sortedTeams.map((team, idx) => (
                  <div
                    key={team.name}
                    className='flex flex-col items-center gap-3 p-4 rounded-xl border-2 shadow-md transition-all hover:shadow-lg'
                    style={{
                      backgroundColor: `${team.color}08`,
                      borderColor: `${team.color}30`,
                    }}
                  >
                    <div className='flex items-center gap-2'>
                      <Image
                        className='size-10 rounded-lg shadow-sm'
                        src={team.flag}
                        alt={team.name}
                        width={40}
                        height={40}
                      />
                      <div>
                        <p className='font-bold text-lg leading-tight'>{team.name}</p>
                        <p className='text-xs text-muted-foreground font-medium'>
                          {idx === 0 ? '1st Place' : idx === 1 ? '2nd Place' : '3rd Place'}
                        </p>
                      </div>
                    </div>
                    <div
                      className='w-full py-3 rounded-lg text-center border-2'
                      style={{
                        backgroundColor: `${team.color}15`,
                        borderColor: `${team.color}40`,
                      }}
                    >
                      <div className='text-3xl font-extrabold' style={{ color: team.color }}>
                        {team.points.toFixed(1)}
                      </div>
                      <div className='text-xs font-semibold text-muted-foreground mt-1'>
                        Total Points
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null;
          })()}

          {/* Team badges aligned with player columns */}
          <div className='grid gap-3 items-center'
            style={{
              gridTemplateColumns: `96px repeat(${teamBatch?.length ?? 1}, minmax(0, 1fr)) 160px`,
            }}
          >
            {/* Empty space for Group column */}
            <div></div>

            {teamBatch?.sort((a, b) => b.team_name.localeCompare(a.team_name))?.map((t) => (
              <div key={t.player_id} className='p-3 flex items-center justify-center gap-2'>
                <Image className='size-8 rounded-md shadow-sm' src={t.team_flag} alt={t.team_name} width={32} height={32} />
                <p className='font-bold text-lg'>{t.team_name}</p>
              </div>
            ))}

            {/* Empty space for Match Status column */}
            <div></div>
          </div>
        </>
      )}

      {/* Leaderboard Table */}
      {data.leaderboard.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16 px-8">
            {/* Icon with gradient background */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full blur-xl" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 flex items-center justify-center">
                <Trophy className="w-10 h-10 text-primary" />
              </div>
            </div>

            {/* Heading */}
            <h3 className="text-xl font-bold mb-2">No Scores Available Yet</h3>

            {/* Description */}
            <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
              The leaderboard is currently empty. Scores will appear here once the tournament begins and players start posting their rounds.
            </p>

            {/* Info cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                <div className="p-2 rounded-lg bg-blue-50">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</p>
                  <p className="text-sm font-bold capitalize">{data.status?.toLowerCase() || 'Upcoming'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                <div className="p-2 rounded-lg bg-amber-50">
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Updates</p>
                  <p className="text-sm font-bold">Real-time</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <BaseLeaderboard data={data}>
          {renderLeaderboardContent()}
        </BaseLeaderboard>
      )}

      {/* Info Footer */}
      {data?.tournament_type !== 'TEAM_CUP' && (<div className="text-sm text-muted-foreground text-center">
        Showing {filteredData.length} of {data.leaderboard.length} entries
      </div>)}
    </div>
  );
};
