'use client';

import React, { useState, useMemo } from 'react';
import { Skeleton } from '@/components/ui';
import type {
  ScoringMethod,
  TournamentLeaderBoardType,
  TournamentOverviewList,
  TournamentScore,
  TournamentTeam,
} from '@/lib/definitions';
import { RefreshCw, Trophy, ChevronDown, ChevronUp, Users } from 'lucide-react';
import type { TournamentLeaderBoard } from '@/lib/hooks/use-tournament/_interface';
import { ExpandableScoreCard } from './expand-card';
import AvatarBox from '@/components/app/common/avatar-box';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useLocale } from 'next-intl';

type leaderType = {
  created: string;
  user_id: string;
};

/* ── Medal colours ── */
const medals = [
  { bg: 'bg-primary/10 border-green-700', badge: 'bg-primary text-white', label: '1st' },
  { bg: 'bg-slate-50 border-slate-200', badge: 'bg-slate-400 text-white', label: '2nd' },
  { bg: 'bg-orange-50 border-orange-200', badge: 'bg-orange-400 text-white', label: '3rd' },
];

export default function LeaderboardTab({
  roundsLength,
  datalist,
  loading,
  started,
  ended = false,
  refetch,
  isTeam = false,
  scoreMethod,
  teams,
  players,
  courseId,
}: {
  datalist: TournamentLeaderBoardType[] | undefined;
  roundsLength: number;
  loading: boolean;
  refetch: (variables?: leaderType) => Promise<unknown>;
  started: boolean;
  ended?: boolean;
  isTeam?: boolean;
  teams?: TournamentTeam[];
  scoreMethod: ScoringMethod;
  players?: TournamentOverviewList[];
  courseId?: string;
}) {
  const locale = useLocale();
  const [expandedPlayers, setExpandedPlayers] = useState<string[]>([]);
  const [scoresCache, setScoresCache] = useState<
    Record<string, Record<number, TournamentScore[]>>
  >({});

  const isBestBall = scoreMethod === 'BESTBALL';

  // Best Ball: per-team player selection (teamId → selected playerId)
  const [bbPlayerByTeam, setBbPlayerByTeam] = useState<Record<string, string>>({});

  // Get players for a given Best Ball team
  const getTeamPlayers = (teamId: string) => {
    if (!isBestBall || !teams || !players) return [];
    const team = teams.find((t) => t.team_id === teamId);
    if (!team) return [];
    return players.filter((p) => team.team_player?.includes(p.userInfo?.userid ?? p.id));
  };

  /* Group by team if needed */
  const groupedPlayers = useMemo(() => {
    if (!isTeam || !teams || !datalist) return datalist ?? [];
    const teamMap: Record<string, TournamentLeaderBoardType[]> = {};
    datalist.forEach((player) => {
      const team = teams.find((t) => t.team_player.includes(player.id));
      const teamName = team?.team_name ?? 'No Team';
      if (!teamMap[teamName]) teamMap[teamName] = [];
      teamMap[teamName].push(player);
    });
    return Object.values(teamMap).flatMap((p) => p);
  }, [datalist, teams, isTeam]);

  /* Display players: always the team leaderboard for Best Ball */
  const displayPlayers = useMemo(() => groupedPlayers, [groupedPlayers]);

  /* Round totals helper */
  const getRounds = (player: TournamentLeaderBoardType) => {
    const rounds = Array.from({ length: roundsLength }).map((_, i) => {
      const key = `round_${i + 1}` as keyof TournamentLeaderBoardType;
      return typeof player[key] === 'number' ? (player[key] as number) : 0;
    });
    const total = rounds.reduce((acc, val) => acc + val, 0);
    return { rounds, total };
  };

  const togglePlayer = (playerId: string) =>
    setExpandedPlayers((prev) =>
      prev.includes(playerId)
        ? prev.filter((p) => p !== playerId)
        : [...prev, playerId]
    );

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-14 rounded-2xl" />
        ))}
      </div>
    );
  }

  /* ── Not started ── */
  if (!started) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Trophy className="w-8 h-8 text-primary/40" />
        </div>
        <p className="text-sm font-semibold text-foreground">Leaderboard not live yet</p>
        <p className="text-xs text-muted-foreground max-w-xs">
          Rankings will appear here once the tournament starts.
        </p>
      </div>
    );
  }

  /* ── Started / Finished but no scores ── */
  if (started && displayPlayers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <div className={cn(
          'w-16 h-16 rounded-2xl border flex items-center justify-center',
          ended ? 'bg-slate-50 border-slate-200' : 'bg-amber-50 border-amber-200'
        )}>
          <Trophy className={cn('w-8 h-8', ended ? 'text-slate-400' : 'text-amber-400')} />
        </div>
        <p className="text-sm font-semibold text-foreground">
          {ended ? 'Tournament Finished' : "We're live!"}
        </p>
        <p className="text-xs text-muted-foreground max-w-xs">
          {ended
            ? 'This tournament has ended. No scores were submitted.'
            : 'Waiting on players to submit their scores.'}
        </p>
      </div>
    );
  }

  const podiumPlayers = displayPlayers.slice(0, 3);
  const remainingPlayers = displayPlayers.slice(3);

  /* ── Column headers ── */
  const roundCols = Array.from({ length: Math.min(roundsLength, 4) }, (_, i) => `R${i + 1}`);

  return (
    <div className="space-y-4">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          Leaderboard
          {started && !ended && (
            <span className="ml-1 w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          )}
        </p>
        <button
          onClick={() => refetch?.()}
          className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
        >
          <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
        </button>
      </div>

      {/* ── Podium (top 3) ── */}
      {podiumPlayers.length >= 2 && (
        <div className="grid grid-cols-3 gap-3">
          {podiumPlayers.map((player, idx) => {
            const { total } = getRounds(player);
            const m = medals[idx];
            const name = player.name ?? `${player.userInfo?.first_name ?? ''} ${player.userInfo?.last_name ?? ''}`;
            return (
              <div
                key={player.id}
                className={cn(
                  'flex flex-col items-center gap-2 p-3 rounded-2xl border text-center',
                  m.bg,
                  idx === 0 && 'ring-1 ring-green-700'
                )}
              >
                {false && <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', m.badge)}>
                  {m.label}
                </span>}
                {player.userInfo?.userid ? (
                  <Link href={`/${locale}/profile/${player.userInfo.userid}`}>
                    <AvatarBox
                      name={name}
                      src={player.userInfo?.photo_profile!}
                      className={cn('shrink-0 text-sm cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all rounded-full', idx === 0 ? 'w-12 h-12' : 'w-10 h-10')}
                    />
                  </Link>
                ) : (
                  <AvatarBox
                    name={name}
                    src={player.userInfo?.photo_profile!}
                    className={cn('shrink-0 text-sm', idx === 0 ? 'w-12 h-12' : 'w-10 h-10')}
                  />
                )}
                <div>
                  {player.userInfo?.userid ? (
                    <Link href={`/${locale}/profile/${player.userInfo.userid}`} className="text-xs font-bold text-foreground leading-tight line-clamp-1 hover:text-primary transition-colors">
                      {name}
                    </Link>
                  ) : (
                    <p className="text-xs font-bold text-foreground leading-tight line-clamp-1">
                      {name}
                    </p>
                  )}
                  <p className="text-lg font-black text-foreground mt-0.5">{total}</p>
                  <p className="text-[10px] text-muted-foreground">total</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Full ranked table ── */}
      <div className="rounded-2xl border border-border/50 overflow-hidden bg-card">
        {/* Table header */}
        <div className="grid bg-muted/40 px-4 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide"
          style={{ gridTemplateColumns: '2rem 1fr repeat(' + roundCols.length + ', 2.5rem) 3rem' }}
        >
          <span>#</span>
          <span>{isTeam ? 'Team' : 'Player'}</span>
          {roundCols.map((r) => (
            <span key={r} className="text-center">{r}</span>
          ))}
          <span className="text-center">Total</span>
        </div>

        {/* Rows */}
        {displayPlayers.map((player, idx) => {
          const { rounds, total } = getRounds(player);
          const isExpanded = expandedPlayers.includes(player.id);
          const name = player.name ?? `${player.userInfo?.first_name ?? ''} ${player.userInfo?.last_name ?? ''}`;

          return (
            <React.Fragment key={player.id}>
              <button
                type="button"
                className={cn(
                  'w-full grid items-center px-4 py-3 border-t border-border/40 hover:bg-primary/5 transition-colors text-left',
                  isExpanded && 'bg-primary/5'
                )}
                style={{ gridTemplateColumns: '2rem 1fr repeat(' + roundCols.length + ', 2.5rem) 3rem' }}
                onClick={() => togglePlayer(player.id)}
              >
                {/* Rank */}
                <span className="text-xs font-bold text-muted-foreground">
                  {idx + 1}
                </span>

                {/* Name + avatar */}
                <div className="flex items-center gap-2 min-w-0">
                  {player.userInfo?.userid ? (
                    <Link href={`/${locale}/profile/${player.userInfo.userid}`} onClick={(e) => e.stopPropagation()}>
                      <AvatarBox
                        name={name}
                        src={player.userInfo?.photo_profile!}
                        className="w-7 h-7 shrink-0 text-[10px] cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all rounded-full"
                      />
                    </Link>
                  ) : (
                    <AvatarBox
                      name={name}
                      src={player.userInfo?.photo_profile!}
                      className="w-7 h-7 shrink-0 text-[10px]"
                    />
                  )}
                  {player.userInfo?.userid ? (
                    <Link
                      href={`/${locale}/profile/${player.userInfo.userid}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs font-semibold text-foreground truncate hover:text-primary transition-colors"
                    >
                      {name}
                    </Link>
                  ) : (
                    <span className="text-xs font-semibold text-foreground truncate">{name}</span>
                  )}
                </div>

                {/* Round scores */}
                {roundCols.map((_, i) => (
                  <span key={i} className="text-center text-xs text-muted-foreground">
                    {rounds[i] > 0 ? rounds[i] : '—'}
                  </span>
                ))}

                {/* Total */}
                <div className="flex items-center justify-center gap-1">
                  <span className="text-sm font-black text-foreground">{total}</span>
                  {isExpanded ? (
                    <ChevronUp className="w-3 h-3 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-muted-foreground" />
                  )}
                </div>
              </button>

              {/* Expanded hole-by-hole */}
              {isExpanded && (
                <div className="border-t border-border/40 bg-muted/20 px-4 py-3">
                  {/* Team scorecard */}
                  <ExpandableScoreCard
                    player={player}
                    roundsLength={roundsLength}
                    scoreMethod={scoreMethod}
                    scoresCache={scoresCache}
                    setScoresCache={setScoresCache}
                    courseId={courseId}
                  />

                  {/* Best Ball: player dropdown under each team */}
                  {isBestBall && (() => {
                    const teamForRow = teams?.find((t) => t.team_id === player.id || t.team_player?.includes(player.id));
                    if (!teamForRow) return null;
                    const teamPlayers = getTeamPlayers(teamForRow.team_id);
                    if (teamPlayers.length === 0) return null;
                    const selectedPid = bbPlayerByTeam[player.id] ?? '';
                    const selP = teamPlayers.find((p) => (p.userInfo?.userid ?? p.id) === selectedPid);

                    return (
                      <div className="mt-4 pt-4 border-t border-border/30 space-y-3">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                          View Individual Player Scores
                        </p>
                        <select
                          className="w-full h-10 px-3 rounded-xl border border-border/60 bg-background text-sm font-medium"
                          value={selectedPid}
                          onChange={(e) => setBbPlayerByTeam((prev) => ({ ...prev, [player.id]: e.target.value }))}
                        >
                          <option value="">Select Player</option>
                          {teamPlayers.map((p) => {
                            const pName = `${p.userInfo?.first_name ?? ''} ${p.userInfo?.last_name ?? ''}`.trim() || p.name;
                            const pid = p.userInfo?.userid ?? p.id;
                            return (
                              <option key={pid} value={pid}>{pName}</option>
                            );
                          })}
                        </select>

                        {selectedPid && selP && (() => {
                          const pName = `${selP.userInfo?.first_name ?? ''} ${selP.userInfo?.last_name ?? ''}`.trim() || selP.name;
                          const pseudoPlayer: TournamentLeaderBoardType = {
                            tournament_id: selP.tournament_id,
                            id: selP.userInfo?.userid ?? selP.id,
                            name: pName,
                            userInfo: selP.userInfo!,
                            round_1: 0, round_2: 0, round_3: 0, round_4: 0,
                            round_5: 0, round_6: 0, round_7: 0, round_8: 0,
                            round_9: 0, round_10: 0, round_11: 0, round_12: 0,
                            round_13: 0, round_14: 0, round_15: 0, round_16: 0,
                            round_17: 0, round_18: 0,
                          };
                          return (
                            <div>
                              <div className="flex items-center gap-3 mb-3">
                                <AvatarBox name={pName} src={selP.userInfo?.photo_profile!} className="w-9 h-9 shrink-0 text-sm rounded-full" />
                                <div>
                                  <p className="text-sm font-bold text-foreground">{pName}</p>
                                  <p className="text-[11px] text-muted-foreground">Individual Scores</p>
                                </div>
                              </div>
                              <ExpandableScoreCard
                                player={pseudoPlayer}
                                roundsLength={roundsLength}
                                scoreMethod={scoreMethod}
                                scoresCache={scoresCache}
                                setScoresCache={setScoresCache}
                                bestBallTeamId={teamForRow.team_id}
                                courseId={courseId}
                              />
                            </div>
                          );
                        })()}
                      </div>
                    );
                  })()}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

    </div>
  );
}
