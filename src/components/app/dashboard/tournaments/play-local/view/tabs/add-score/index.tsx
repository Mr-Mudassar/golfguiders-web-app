'use client';

import type {
  CourseScoreCard,
  CourseTeeDetails,
  HandiCap,
  ParsedTournament,
  ScorePermission,
  TournamentOverviewList,
  TournamentScoreInput,
  TournamentTeam,
} from '@/lib/definitions';
import React, { useEffect, useMemo, useState } from 'react';
import { AddScoreButton } from './submit';
import { ScoreCard } from './score-card';
import { useFetchGolfCourseCoordinates } from '@/lib/hooks/use-fetch-course';
import { useAppSelector } from '@/lib';
import { useSearchParams } from 'next/navigation';
import { SelectedPlayerCard } from './tee-marker';
import { Button, Icon } from '@/components/ui';
import { cn } from '@/lib/utils';
import { ChevronDown, Lock, Users } from 'lucide-react';
import AvatarBox from '@/components/app/common/avatar-box';

/* ── Quick-tap option config (values relative to hole par) ── */
type QuickOption = {
  label: string;
  fullLabel: string;
  value: number;
  activeCls: string;
  idleCls: string;
};

/** All possible golf score names ordered from best to worst, with style config */
const SCORE_CATALOG: Omit<QuickOption, 'value'>[] = [
  { label: 'HIO', fullLabel: 'Hole in One', activeCls: 'bg-purple-500 text-white border-purple-500 shadow-md shadow-purple-200', idleCls: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' },
  { label: 'Albatross', fullLabel: 'Albatross', activeCls: 'bg-pink-500 text-white border-pink-500 shadow-md shadow-pink-200', idleCls: 'bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100' },
  { label: 'Eagle', fullLabel: 'Eagle', activeCls: 'bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-200', idleCls: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
  { label: 'Birdie', fullLabel: 'Birdie', activeCls: 'bg-green-500 text-white border-green-500 shadow-md shadow-green-200', idleCls: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' },
  { label: 'Par', fullLabel: 'Par', activeCls: 'bg-slate-600 text-white border-slate-600 shadow-md', idleCls: 'bg-muted text-foreground border-border hover:bg-muted/80' },
  { label: 'Bogey', fullLabel: 'Bogey', activeCls: 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-200', idleCls: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' },
  { label: '+2', fullLabel: 'Double Bogey', activeCls: 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-200', idleCls: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100' },
  { label: '+3', fullLabel: 'Triple Bogey', activeCls: 'bg-red-500 text-white border-red-500 shadow-md shadow-red-200', idleCls: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' },
];

/** Build exactly 6 quick-tap buttons based on the hole's par */
function getQuickOptions(holePar: number): QuickOption[] {
  // Map each catalog entry to its stroke value relative to par
  const scored: (QuickOption & { order: number })[] = [
    { ...SCORE_CATALOG[0], value: 1, order: 0 },              // HIO = always 1
    { ...SCORE_CATALOG[1], value: holePar - 3, order: 1 },    // Albatross
    { ...SCORE_CATALOG[2], value: holePar - 2, order: 2 },    // Eagle
    { ...SCORE_CATALOG[3], value: holePar - 1, order: 3 },    // Birdie
    { ...SCORE_CATALOG[4], value: holePar, order: 4 },        // Par
    { ...SCORE_CATALOG[5], value: holePar + 1, order: 5 },    // Bogey
    { ...SCORE_CATALOG[6], value: holePar + 2, order: 6 },    // Double Bogey
    { ...SCORE_CATALOG[7], value: holePar + 3, order: 7 },    // Triple Bogey
  ];

  // Deduplicate (keep first = better name) and remove value < 1
  const seen = new Set<number>();
  const unique = scored.filter((o) => {
    if (o.value < 1) return false;
    if (seen.has(o.value)) return false;
    seen.add(o.value);
    return true;
  });

  // Always pick exactly 6: start from Par, take 1 above-par slot per missing below-par slot
  const belowPar = unique.filter((o) => o.order < 4);   // HIO..Birdie
  const parAndAbove = unique.filter((o) => o.order >= 4); // Par..Triple Bogey
  const need = 6;
  const belowCount = Math.min(belowPar.length, need - 1); // at least 1 slot for Par
  const aboveCount = need - belowCount;
  return [...belowPar.slice(-belowCount), ...parAndAbove.slice(0, aboveCount)];
}

export default function AddScoreTab({
  players,
  teamData = [],
  scorePermission,
  getHCP,
  setActiveTab,
  activeTab,
  details,
  started,
  fetchState,
}: {
  players: TournamentOverviewList[];
  scorePermission: ScorePermission[];
  setActiveTab: (v: string) => void;
  activeTab: string;
  started: boolean;
  teamData?: TournamentTeam[];
  getHCP: (id: string) => number | undefined;
  details: ParsedTournament;
  fetchState: () => Promise<void>;
}) {
  const u = useAppSelector((s) => s.auth?.user);
  const p = useSearchParams();

  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [teamPlayer, setTeamPlayer] = useState<{ id: string; name: string }>({
    id: '',
    name: '',
  });
  const [score, setScore] = useState<number | ''>('');
  const [scoreLabel, setScoreLabel] = useState<string | null>(null);
  const [overlayText, setOverlayText] = useState<string | null>(null);
  const [selectHole, setSelectHole] = useState<number>(1);
  const [selectRound, setSelectRound] = useState<number>(1);
  const [anim, setAnim] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [teamDropdownOpen, setTeamDropdownOpen] = useState(false);
  const [localCompleted, setLocalCompleted] = useState<Set<string>>(new Set());
  const [visibleDropdown, setVisibleDropdown] = useState(10);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const teamDropdownRef = React.useRef<HTMLDivElement>(null);

  // Close player dropdown on click outside
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: PointerEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('pointerdown', handler, true);
    return () => document.removeEventListener('pointerdown', handler, true);
  }, [dropdownOpen]);

  // Close team dropdown on click outside
  useEffect(() => {
    if (!teamDropdownOpen) return;
    const handler = (e: PointerEvent) => {
      if (teamDropdownRef.current && !teamDropdownRef.current.contains(e.target as Node)) {
        setTeamDropdownOpen(false);
      }
    };
    document.addEventListener('pointerdown', handler, true);
    return () => document.removeEventListener('pointerdown', handler, true);
  }, [teamDropdownOpen]);

  const isTeam = teamData.length > 0;
  const isScram = details?.scoring_method === 'SCRAMBLE';
  const isBestBall = details?.scoring_method === 'BESTBALL';
  const isOrganizer =
    details?.organizer_id === u?.userid ||
    details?.co_organizers?.includes(u?.userid!);

  const { scorecardDetails, courseHoles, teeDetails } =
    useFetchGolfCourseCoordinates(details?.id_course!);

  const isMen = details?.players?.some((e) => e.gender === 'MALE');

  const adminTeams = useMemo(() => {
    if (!isTeam || !u?.userid) return [];
    return teamData?.filter((t) => Array.isArray(t.team_admin_id) && t.team_admin_id.includes(u.userid));
  }, [teamData, isTeam, u]);

  const myTeam = teamData?.find((t) =>
    t.team_player?.includes(u?.userid as string)
  );

  // Best Ball: filter teams by team_admin_id (user must be in team's admin list)
  const filteredTeamData = useMemo(() => {
    if (!isBestBall) return teamData;
    if (isOrganizer) return teamData;
    if (adminTeams.length > 0) return adminTeams;
    return teamData;
  }, [isBestBall, teamData, isOrganizer, adminTeams]);

  // Best Ball: auto-select first team
  useEffect(() => {
    if (isBestBall && !selectedTeamId && filteredTeamData.length > 0) {
      // Prefer the team the user administers, otherwise first permitted team
      const myAdminTeam = adminTeams?.[0];
      const firstTeam = myAdminTeam && filteredTeamData.some((t) => t.team_id === myAdminTeam.team_id)
        ? myAdminTeam
        : filteredTeamData[0];
      setSelectedTeamId(firstTeam.team_id);
    }
  }, [isBestBall, selectedTeamId, filteredTeamData, adminTeams]);

  // Best Ball: all players in the currently selected team
  const bestBallTeamPlayers = useMemo(() => {
    if (!isBestBall || !selectedTeamId) return [];
    const team = teamData.find((t) => t.team_id === selectedTeamId);
    if (!team) return [];
    return players?.filter((p) =>
      team.team_player?.includes(p?.userInfo?.userid as string)
    ) ?? [];
  }, [isBestBall, selectedTeamId, teamData, players]);

  const filteredPlayers = useMemo(() => {
    if (isScram) {
      // Scramble: organizer sees all teams; others see teams where they're admin
      if (isOrganizer) return players;
      if (adminTeams.length > 0) {
        const teamPlayerIds = adminTeams?.flatMap((t) => t.team_id || []);
        return players?.filter((p) => teamPlayerIds.includes(p.id as string));
      }
      return players?.filter((p) => p.id === myTeam?.team_id);
    }
    if (isTeam && !isScram) {
      // Best Ball: organizer sees all; others see players from their admin teams
      if (isOrganizer) return players;
      if (adminTeams.length > 0) {
        const allIds = adminTeams?.flatMap((t) => t.team_player || []);
        return players?.filter((p) =>
          allIds.includes(p.userInfo?.userid as string)
        );
      }
      return [];
    }
    // Stable Ford / Stroke Play: permission-based filtering applies to everyone
    // marker can add score for their assigned competitor only
    const permittedIds = new Set<string>();
    scorePermission?.forEach((s) => {
      if (s.player_id_marker === u?.userid) permittedIds.add(s.player_id_competitor);
    });
    // Organizer with no specific permission can score for all players
    if (isOrganizer && permittedIds.size === 0) return players;
    return players?.filter((p) =>
      permittedIds.has(p.userInfo?.userid as string)
    );
  }, [players, isTeam, isScram, adminTeams, scorePermission, isOrganizer, u, myTeam]);

  useEffect(() => {
    if (isBestBall) {
      // For Best Ball, auto-select first player only when no player is selected
      // or when the currently selected player isn't in the new team
      if (bestBallTeamPlayers.length > 0) {
        const alreadyInTeam = bestBallTeamPlayers.some((p) => p.userInfo?.userid === selectedPlayerId);
        if (!selectedPlayerId || !alreadyInTeam) {
          const first = bestBallTeamPlayers.find((p) => !p.is_match_completed) ?? bestBallTeamPlayers[0];
          if (first?.userInfo?.userid) setSelectedPlayerId(first.userInfo.userid);
        }
      }
    } else if (!selectedPlayerId) {
      const playersToUse = filteredPlayers?.length > 0 ? filteredPlayers : players;
      if (playersToUse?.length > 0) {
        const first = playersToUse.find((p) => !p.is_match_completed)?.id || playersToUse[0]?.id;
        if (first) setSelectedPlayerId(first);
      }
    }
  }, [filteredPlayers, selectedPlayerId, players, isBestBall, bestBallTeamPlayers, selectedTeamId]);

  const selectedPlayer =
    (selectedPlayerId
      ? (players?.find((p) => p.id === selectedPlayerId)
        ?? players?.find((p) => p.userInfo?.userid === selectedPlayerId))
      : players?.find((p) => p?.id === u?.userid) ?? filteredPlayers?.[0] ?? players?.[0]
    ) ?? null;

  const curPlayer = details?.players?.find((p) =>
    isScram ? p.user_id === teamPlayer?.id
      : isBestBall ? p.user_id === selectedPlayerId || p.user_id === selectedPlayer?.userInfo?.userid
      : p?.user_id === selectedPlayerId
  ) as HandiCap;

  const curTee = teeDetails?.find(
    (t) => t.display_order === curPlayer?.tee_order
  ) as CourseTeeDetails;

  const par = isMen
    ? scorecardDetails?.men_par_hole
    : scorecardDetails?.wmn_par_hole;

  const strokeIndex = isMen
    ? scorecardDetails?.men_hcp_hole
    : scorecardDetails?.wmn_hcp_hole;

  useEffect(() => {
    if (!selectedPlayer) return;
    const maxHoles = courseHoles ?? 18;
    const totalRounds = Number(details?.rounds) || 1;
    let round = selectedPlayer.round_played || 1;
    let hole = selectedPlayer.hole_played + 1;

    // If all holes in the current round are played, advance to next round
    if (hole > maxHoles) {
      if (round < totalRounds) {
        round += 1;
        hole = 1;
      } else {
        // Stay at last hole of last round (match completed)
        hole = maxHoles;
      }
    }

    setSelectHole(hole);
    setSelectRound(round);
  }, [selectedPlayer, filteredPlayers, activeTab, p, courseHoles, details?.rounds]);

  const clamp = (v: number) => Math.max(1, Math.min(20, Math.round(v)));

  const handleQuick = (o: { fullLabel: string; value: number }) => {
    setScoreLabel(o.fullLabel);
    setScore(o.value);
  };

  const matchQuickLabel = (val: number) =>
    quickOptions.find((o) => o.value === val)?.fullLabel ?? null;

  const handleCustomChange = (v: string) => {
    if (v === '') { setScore(''); setScoreLabel(null); return; }
    const n = Number(v);
    if (Number.isNaN(n)) return;
    const clamped = clamp(n);
    setScore(clamped);
    setScoreLabel(matchQuickLabel(clamped));
  };

  const inc = (v: number) => {
    const cur = score === '' ? 1 : clamp(Number(score) + v);
    setScore(cur);
    setScoreLabel(matchQuickLabel(cur));
  };

  const getTeamId = (id: string) => {
    if (!isTeam) return '';
    const t = teamData.find((t) => t.team_player?.includes(id));
    return t?.team_id ?? '';
  };

  const teamName =
    selectedPlayer?.name ??
    teamData?.find((t) => t.team_player?.includes(selectedPlayerId))?.team_name;

  const holePar = par?.[selectHole - 1] ?? 4;
  const quickOptions = useMemo(() => getQuickOptions(holePar), [holePar]);

  // Default-select Par whenever hole or player changes
  useEffect(() => {
    setScore(holePar);
    setScoreLabel('Par');
  }, [selectHole, selectedPlayerId, holePar]);

  const resolvedHcp = isScram
    ? (teamData?.find((t) => t?.team_id === selectedPlayerId)?.team_hcp ?? 0)
    : (curPlayer?.hcp ?? getHCP(selectedPlayer?.userInfo?.userid!) ?? 0);

  const basePayload: TournamentScoreInput = {
    tournament_id: selectedPlayer?.tournament_id as string,
    player_id: (selectedPlayer?.userInfo?.userid as string) ?? teamPlayer?.id,
    hcp: resolvedHcp,
    hole: selectHole ?? 1,
    round: selectRound ?? 1,
    gross_score: clamp(Number(score)),
    stroke_index: strokeIndex?.[selectHole - 1] as number,
    par: par?.[selectHole - 1] as number,
    tournament_rounds: details?.rounds,
    tournament_created: details?.created,
    tournament_user_id: details?.user_id,
    tournament_scoring_method: details?.scoring_method,
    name: `${selectedPlayer?.userInfo?.first_name} ${selectedPlayer?.userInfo?.last_name}`,
    tournament_holes: courseHoles ?? 18,
  };

  const bestBallTeamId = isBestBall ? selectedTeamId : getTeamId(selectedPlayerId);

  const payload: TournamentScoreInput = isTeam
    ? { ...basePayload, team_id: isScram ? selectedPlayer?.id : bestBallTeamId, name: teamName || basePayload.name }
    : basePayload;

  const me = u?.userid === selectedPlayer?.userInfo?.userid;

  const isPlayerCompleted = selectedPlayer?.is_match_completed
    || localCompleted.has(selectedPlayer?.userInfo?.userid ?? '')
    || localCompleted.has(selectedPlayer?.id ?? '');

  const handleMatchCompleted = () => {
    setLocalCompleted((prev) => {
      const next = new Set(prev);
      if (selectedPlayer?.userInfo?.userid) next.add(selectedPlayer.userInfo.userid);
      if (selectedPlayer?.id) next.add(selectedPlayer.id);
      return next;
    });
  };

  return (
    <>
      {/* Score overlay animation */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
        <span
          className={cn(
            'text-6xl md:text-8xl font-bold text-primary transition-all duration-500',
            anim ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
          )}
        >
          {overlayText}
        </span>
      </div>

      <div className="space-y-4">

        {/* ── Best Ball: Team dropdown + Player dropdown ── */}
        {isBestBall && filteredTeamData.length > 0 && (() => {
          const selTeam = filteredTeamData.find((t) => t.team_id === selectedTeamId);
          const selName = selectedPlayer ? `${selectedPlayer?.userInfo?.first_name ?? ''} ${selectedPlayer?.userInfo?.last_name ?? ''}` : '';

          return (
            <div className="space-y-3">
              {/* Team selector */}
              <div ref={teamDropdownRef} className="relative">
                <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                  Select Team
                </label>
                <button
                  type="button"
                  onClick={() => setTeamDropdownOpen((o) => !o)}
                  className={cn(
                    'flex items-center gap-3 w-full h-11 px-3 rounded-xl border border-border/60 bg-background text-sm font-medium transition-all',
                    'hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50',
                    teamDropdownOpen && 'ring-2 ring-primary/30 border-primary/50',
                  )}
                >
                  <Users className="w-4 h-4 text-primary shrink-0" />
                  <span className="flex-1 text-left truncate">
                    {selTeam?.team_name ?? 'Select a team'}
                    <span className="text-muted-foreground ml-1">— {selTeam?.team_player?.length ?? 0} players</span>
                  </span>
                  <ChevronDown className={cn('w-4 h-4 text-muted-foreground shrink-0 transition-transform', teamDropdownOpen && 'rotate-180')} />
                </button>

                {teamDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-border/40 bg-popover shadow-lg overflow-hidden animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 duration-150">
                    <div className="max-h-64 overflow-y-auto py-1">
                      {filteredTeamData.map((t) => {
                        const isActive = t.team_id === selectedTeamId;
                        return (
                          <button
                            key={t.team_id}
                            type="button"
                            onClick={() => {
                              setSelectedTeamId(t.team_id);
                              setSelectedPlayerId(''); // reset player when team changes
                              setTeamDropdownOpen(false);
                            }}
                            className={cn(
                              'flex items-center gap-3 w-full px-3 py-2.5 text-sm transition-colors',
                              isActive ? 'bg-primary/10 text-primary font-semibold' : 'text-foreground hover:bg-muted/60',
                            )}
                          >
                            <Users className="w-4 h-4 shrink-0" />
                            <span className="flex-1 text-left truncate">
                              {t.team_name}
                              <span className="text-muted-foreground font-normal ml-1">— {t.team_player?.length ?? 0} players</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Player selector within team */}
              <div ref={dropdownRef} className="relative">
                <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                  Select Player
                </label>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((o) => !o)}
                  className={cn(
                    'flex items-center gap-3 w-full h-11 px-3 rounded-xl border border-border/60 bg-background text-sm font-medium transition-all',
                    'hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50',
                    dropdownOpen && 'ring-2 ring-primary/30 border-primary/50',
                  )}
                >
                  {selectedPlayer?.userInfo && (
                    <AvatarBox
                      name={selName}
                      src={selectedPlayer.userInfo.photo_profile!}
                      className="w-7 h-7 shrink-0 text-[10px] rounded-full"
                    />
                  )}
                  <span className="flex-1 text-left truncate">
                    {selName || 'Select a player'}
                    {false && selectedPlayer && <span className="text-muted-foreground ml-1">— {getHCP(selectedPlayer?.userInfo?.userid!) ?? 0} HCP</span>}
                  </span>
                  <ChevronDown className={cn('w-4 h-4 text-muted-foreground shrink-0 transition-transform', dropdownOpen && 'rotate-180')} />
                </button>

                {dropdownOpen && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-border/40 bg-popover shadow-lg overflow-hidden animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 duration-150">
                    <div className="max-h-64 overflow-y-auto py-1">
                      {bestBallTeamPlayers.map((p, i) => {
                        const name = `${p?.userInfo?.first_name ?? ''} ${p?.userInfo?.last_name ?? ''}`;
                        const isActive = p?.userInfo?.userid === selectedPlayerId;
                        return (
                          <button
                            key={(p?.userInfo?.userid ?? '') + i}
                            type="button"
                            onClick={() => { setSelectedPlayerId(p?.userInfo?.userid as string); setDropdownOpen(false); }}
                            className={cn(
                              'flex items-center gap-3 w-full px-3 py-2 text-sm transition-colors',
                              isActive ? 'bg-primary/10 text-primary font-semibold' : 'text-foreground hover:bg-muted/60',
                            )}
                          >
                            {p?.userInfo && (
                              <AvatarBox
                                name={name}
                                src={p.userInfo.photo_profile!}
                                className="w-7 h-7 shrink-0 text-[10px] rounded-full"
                              />
                            )}
                            <span className="flex-1 text-left truncate">
                              {name}
                              {false && <span className="text-muted-foreground font-normal ml-1">— {getHCP(p?.userInfo?.userid!) ?? 0} HCP</span>}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* ── Standard player selector (non-Best Ball) ── */}
        {!isBestBall && (filteredPlayers?.length > 0 || players?.length > 0) && (() => {
          const list = filteredPlayers?.length > 0 ? filteredPlayers : players;
          const selName = selectedPlayer?.name ?? `${selectedPlayer?.userInfo?.first_name ?? ''} ${selectedPlayer?.userInfo?.last_name ?? ''}`;

          return (
            <div ref={dropdownRef} className="relative">
              <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                {isScram ? 'Select Team' : 'Select Player'}
              </label>
              <button
                type="button"
                onClick={() => setDropdownOpen((o) => !o)}
                className={cn(
                  'flex items-center gap-3 w-full h-11 px-3 rounded-xl border border-border/60 bg-background text-sm font-medium transition-all',
                  'hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50',
                  dropdownOpen && 'ring-2 ring-primary/30 border-primary/50',
                )}
              >
                {!isScram && selectedPlayer?.userInfo && (
                  <AvatarBox
                    name={selName}
                    src={selectedPlayer.userInfo.photo_profile!}
                    className="w-7 h-7 shrink-0 text-[10px] rounded-full"
                  />
                )}
                <span className="flex-1 text-left truncate">
                  {selName}
                  {false && !isScram && <span className="text-muted-foreground ml-1">— {getHCP(selectedPlayer?.userInfo?.userid!) ?? 0} HCP</span>}
                </span>
                <ChevronDown className={cn('w-4 h-4 text-muted-foreground shrink-0 transition-transform', dropdownOpen && 'rotate-180')} />
              </button>

              {dropdownOpen && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-border/40 bg-popover shadow-lg overflow-hidden animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 duration-150">
                  <div className="max-h-64 overflow-y-auto py-1">
                    {list.slice(0, visibleDropdown).map((p, i) => {
                      const name = p?.name ?? `${p?.userInfo?.first_name ?? ''} ${p?.userInfo?.last_name ?? ''}`;
                      const isActive = p?.id === selectedPlayerId;
                      return (
                        <button
                          key={p?.id + i}
                          type="button"
                          onClick={() => { setSelectedPlayerId(p?.id); setDropdownOpen(false); }}
                          className={cn(
                            'flex items-center gap-3 w-full px-3 py-2 text-sm transition-colors',
                            isActive ? 'bg-primary/10 text-primary font-semibold' : 'text-foreground hover:bg-muted/60',
                          )}
                        >
                          {!isScram && p?.userInfo && (
                            <AvatarBox
                              name={name}
                              src={p.userInfo.photo_profile!}
                              className="w-7 h-7 shrink-0 text-[10px] rounded-full"
                            />
                          )}
                          <span className="flex-1 text-left truncate">
                            {name}
                            {false && !isScram && <span className="text-muted-foreground font-normal ml-1">— {getHCP(p?.userInfo?.userid!) ?? 0} HCP</span>}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {visibleDropdown < list.length && (
                    <button
                      type="button"
                      onClick={() => setVisibleDropdown((v) => v + 10)}
                      className="w-full py-2 border-t border-border/40 text-xs font-semibold text-primary hover:bg-primary/5 transition-colors"
                    >
                      Load More ({list.length - visibleDropdown} remaining)
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })()}

        {/* Selected player card */}
        {(selectedPlayer || players?.length > 0) && (
          <SelectedPlayerCard
            isScram={isScram}
            isMatchCompleted={isPlayerCompleted}
            teamData={teamData?.find((t) => t.team_name === teamName) as TournamentTeam}
            getHCP={getHCP}
            selectHole={selectHole}
            setHole={setSelectHole}
            selectRound={selectRound}
            selectedPlayer={selectedPlayer || players?.[0]}
            setTeamPlayer={setTeamPlayer}
            teamPlayer={teamPlayer}
            courseHoles={courseHoles ?? 18}
            tees={{ p: curPlayer, t: curTee }}
          />
        )}

        {/* Not started */}
        {!started && (
          <div className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-border/40 bg-muted/20 text-center">
            <Lock className="w-8 h-8 text-muted-foreground/40" />
            <p className="text-sm font-semibold text-foreground">Tournament not started yet</p>
            <p className="text-xs text-muted-foreground">
              Score entry will unlock when the tournament goes live.
            </p>
            <Button size="sm" variant="outline" className="mt-1" onClick={() => setActiveTab('overview')}>
              View Details <Icon name="chevron-right" className="ml-1" />
            </Button>
          </div>
        )}

        {/* Match complete */}
        {started && isPlayerCompleted && (
          <div className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-primary/20 bg-primary/5 text-center">
            <p className="text-sm font-semibold text-foreground">
              Match completed
              {!me && ` for ${selectedPlayer?.userInfo ? `${selectedPlayer.userInfo.first_name} ${selectedPlayer.userInfo.last_name}` : selectedPlayer?.name ?? ''}`}!
            </p>
            <p className="text-xs text-muted-foreground">
              {me ? 'Nice round! Check the leaderboard.' : 'Switch player or go to leaderboard.'}
            </p>
            <Button size="sm" onClick={() => setActiveTab('leaderboard')}>
              View Leaderboard
            </Button>
          </div>
        )}

        {/* Score inputs (active round) */}
        {started && !isPlayerCompleted && (
          <div className="space-y-4">

            {/* Quick-tap buttons */}
            <div className="p-4 rounded-2xl border border-border/40 bg-card space-y-3">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                Quick Select
              </p>
              <div className="grid grid-cols-3 gap-2">
                {quickOptions.map((o) => {
                  const isSelected = scoreLabel === o.fullLabel;
                  return (
                    <button
                      key={o.label}
                      type="button"
                      disabled={isPlayerCompleted}
                      onClick={() => handleQuick(o)}
                      className={cn(
                        'flex flex-col items-center justify-center py-3 rounded-xl border-2 text-center transition-all duration-150 gap-0.5',
                        isSelected ? o.activeCls : o.idleCls
                      )}
                    >
                      <span className="text-sm font-black">{o.label}</span>
                      <span className="text-[9px] font-medium opacity-75">{o.fullLabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom score */}
            <div className="p-4 rounded-2xl border border-border/40 bg-card space-y-3">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                Custom Score (1–20)
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => inc(-1)}
                  className="w-11 h-11 rounded-xl border-2 border-border text-xl font-bold hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center"
                >
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  max={20}
                  disabled={isPlayerCompleted}
                  value={score === '' ? '' : String(score)}
                  onChange={(e) => handleCustomChange(e.target.value)}
                  className="flex-1 h-11 text-center text-2xl font-black border-2 border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                />
                <button
                  type="button"
                  onClick={() => inc(1)}
                  className="w-11 h-11 rounded-xl border-2 border-border text-xl font-bold hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center"
                >
                  +
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground text-center">
                Tap a quick option above or enter a custom number
              </p>
            </div>

          </div>
        )}

        {/* Submit */}
        {started && !isPlayerCompleted && <AddScoreButton
          payload={payload}
          score={score}
          scoreLabel={scoreLabel || ''}
          selectedPlayer={selectedPlayer as TournamentOverviewList}
          setAnim={setAnim}
          setOverlayText={setOverlayText}
          setScore={setScore}
          setHole={setSelectHole}
          setRound={setSelectRound}
          setScoreLabel={setScoreLabel}
          fetchState={fetchState}
          onMatchCompleted={handleMatchCompleted}
        />}

        {/* Scorecard */}
        <ScoreCard
          scoreCard={scorecardDetails as CourseScoreCard}
          hole={selectHole ?? 1}
          isMen={isMen}
          d={{
            gId: selectedPlayer?.tournament_id as string,
            pId: isTeam
              ? isScram
                ? (selectedPlayer?.id as string)
                : getTeamId(selectedPlayer?.id as string)
              : (selectedPlayer?.id as string),
            round: selectRound,
            method: details?.scoring_method,
          }}
        />

      </div>
    </>
  );
}
