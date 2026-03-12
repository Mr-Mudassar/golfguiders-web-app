'use client';

import dynamic from 'next/dynamic';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { useTournamentDetail } from '@/lib/hooks/use-tournament/tournament-details';
import { useQuery } from '@apollo/client/react';
import { GetMatchStatus } from '@/lib/hooks/use-tournament/_query';
import { LoadingScreen } from '@/components/common';
import { useEffect, useState } from 'react';
import { TournamentTeam } from '@/lib/definitions';
import { ArrowLeft, Users, Trophy, Plus, BarChart3, MapPin, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/lib';
import { getScoreMethodLabel } from '../helper';
import Link from 'next/link';
import TeamsTab from './tabs/teams';

const Overview = dynamic(() => import('./tabs/overview'));
const Leaderboard = dynamic(() => import('./tabs/leaderboard'));
const AddScore = dynamic(() => import('./tabs/add-score'));

type StatusConfig = { label: string; color: string; pulse: boolean };

export default function TournamentDetailLayout() {
  const params: { uid: string; gameId: string; date: string } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data, state, isNotActive: na } = useTournamentDetail({
    created: params?.date,
    gameId: params?.gameId,
    organizerId: params?.uid,
  });

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (na) setActiveTab('leaderboard');
    if (tab) setActiveTab(tab);
  }, [searchParams, na]);

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('tab', val);
    router.replace(`?${newParams.toString()}`);
  };

  const getHCP = (id: string) =>
    data?.game?.players?.find((e) => e.user_id === id)?.hcp;

  const user = useAppSelector((s) => s.auth.user);

  // Reactive clock: re-evaluate tournament status every 30 seconds
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  // Refetch tab-specific data whenever the active tab changes
  useEffect(() => {
    if (!data?.game) return;
    if (activeTab === 'overview') state.overview?.refetch();
    else if (activeTab === 'leaderboard') state.leaderBoard?.refetch();
  }, [activeTab]);

  // Use first round start time if available, fallback to tournament start_time
  const parseTime = (val: string | undefined) => {
    if (!val) return null;
    const byNum = new Date(+val);
    if (!isNaN(byNum.getTime())) return byNum;
    return new Date(val);
  };
  const firstRoundTime = parseTime(data?.game?.rounds_time?.[0]);
  const tournamentStartTime = parseTime(data?.game?.start_time);
  const effectiveStartTime = firstRoundTime && !isNaN(firstRoundTime.getTime())
    ? firstRoundTime
    : tournamentStartTime;
  const started = effectiveStartTime
    ? effectiveStartTime <= now
    : false;

  // Effective end: latest of end_time and last round time
  const endTimeParsed = parseTime(data?.game?.end_time);
  const roundsTimes = data?.game?.rounds_time ?? [];
  const lastRoundTime = roundsTimes.length
    ? parseTime(roundsTimes[roundsTimes.length - 1])
    : null;
  const effectiveEndTime =
    lastRoundTime && !isNaN(lastRoundTime.getTime()) && endTimeParsed && lastRoundTime > endTimeParsed
      ? lastRoundTime
      : endTimeParsed;
  const ended = effectiveEndTime
    ? effectiveEndTime <= now
    : false;

  const isTeamMatch =
    data?.game?.scoring_method === 'SCRAMBLE' || data?.game?.scoring_method === 'BESTBALL';

  // Fetch match status from API only when tournament has started
  // Must be called before any early returns to satisfy Rules of Hooks
  const overviewType = data?.game?.scoring_method === 'SCRAMBLE' ? 'TEAM' : 'PLAYER';
  const matchStatusQuery = useQuery<{ getTournamentPlayedStatus: boolean }>(GetMatchStatus, {
    variables: {
      tournament_id: params?.gameId,
      tournament_user_id: data?.game?.organizer_id,
      tournament_created: data?.game?.created,
      type: overviewType,
    },
    fetchPolicy: 'network-only',
    skip: !started || !params?.gameId || !data?.game?.organizer_id || !data?.game?.created,
  });

  const isOrganizer = data?.game?.organizer_id === user?.userid;
  const isCoOrganizer = data?.game?.co_organizers?.includes(user?.userid!);

  if (state?.tournament?.loading && !data?.game) return <LoadingScreen />;

  const fetchState = async () => {
    await state.overview?.refetch();
  };

  const getStatusConfig = (): StatusConfig => {
    if (!started) return { label: 'Not Started', color: 'bg-amber-400', pulse: false };
    // If time has passed end_time, it's finished regardless
    if (ended) return { label: 'Finished', color: 'bg-slate-400', pulse: false };
    // Tournament started, check API response
    if (matchStatusQuery.loading) return { label: 'Loading...', color: 'bg-gray-300', pulse: true };
    // API returns true = all scores added = Finished, false = still Live
    if (matchStatusQuery.data?.getTournamentPlayedStatus === true)
      return { label: 'Finished', color: 'bg-slate-400', pulse: false };
    return { label: 'Live', color: 'bg-green-400', pulse: true };
  };

  const statusConfig = getStatusConfig();
  const showTeams = !na && data?.team && data?.team[0]?.team_name === 'Best Ball';

  // Single mode: check scorePermission API
  const hasScorePermission = (data?.score ?? []).some(
    (s) => s.player_id_marker === user?.userid || s.player_id_competitor === user?.userid
  );
  // Team mode: check team_admin_id on teams
  const hasTeamAdminPermission = isTeamMatch && (data?.team ?? []).some(
    (t) => Array.isArray(t.team_admin_id) && user?.userid && t.team_admin_id.includes(user.userid)
  );
  const isFinished = ended || matchStatusQuery.data?.getTournamentPlayedStatus === true;
  const canAddScore = started && !isFinished && (isOrganizer || isCoOrganizer || hasScorePermission || hasTeamAdminPermission);

  type TabItem = { value: string; label: string; icon: React.ElementType; live?: boolean };
  const tabs: TabItem[] = [
    { value: 'overview', label: 'Overview', icon: BarChart3 },
    ...(showTeams ? [{ value: 'teams', label: 'Teams', icon: Users }] : []),
    { value: 'leaderboard', label: 'Leaderboard', icon: Trophy, live: started && !isFinished },
    ...(canAddScore ? [{ value: 'add-score', label: 'Add Score', icon: Plus }] : []),
  ];

  return (
    <div className="min-h-screen bg-background">

      {/* ── Hero Header ── */}
      <div className="bg-primary text-white">
        <div className="max-w-6xl mx-auto px-4 pt-5 pb-0">

          {/* Back link */}
          <Link
            href="/dashboard/tournaments/play-local/"
            className="inline-flex items-center gap-1.5 text-white/65 hover:text-white text-xs font-medium mb-4 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            All Tournaments
          </Link>

          {/* Title + status */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <h1 className="text-xl font-bold leading-tight">
              {data?.game?.name || '—'}
            </h1>
            <div className="flex items-center gap-1.5 shrink-0 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5">
              <span
                className={cn(
                  'w-2 h-2 rounded-full',
                  statusConfig.color,
                  statusConfig.pulse && 'animate-pulse'
                )}
              />
              <span className="text-xs font-semibold">{statusConfig.label}</span>
            </div>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-4">
            {data?.game?.coursename && (
              <span className="flex items-center gap-1 text-white/70 text-xs">
                <MapPin className="w-3 h-3" />
                {data.game.coursename}
              </span>
            )}
            {data?.game?.start_time && (
              <span className="flex items-center gap-1 text-white/70 text-xs">
                <Calendar className="w-3 h-3" />
                {format(new Date(+data.game.start_time), 'MMM d, yyyy · h:mm a')}
              </span>
            )}
          </div>

          {/* Quick info pills */}
          <div className="flex flex-wrap gap-2 mb-5">
            {data?.game?.scoring_method && (
              <span className="bg-white/15 text-white/90 text-[11px] font-medium px-2.5 py-1 rounded-full">
                {getScoreMethodLabel(data.game.scoring_method)}
              </span>
            )}
            {data?.game?.rounds && (
              <span className="bg-white/15 text-white/90 text-[11px] font-medium px-2.5 py-1 rounded-full">
                {data.game.rounds} Round{Number(data.game.rounds) !== 1 ? 's' : ''}
              </span>
            )}
            <span className="bg-white/15 text-white/90 text-[11px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
              <Users className="w-3 h-3" />
              {isTeamMatch
                ? `${data?.team?.length ?? 0} Team${(data?.team?.length ?? 0) !== 1 ? 's' : ''}`
                : `${data?.overview?.length ?? 0} Player${(data?.overview?.length ?? 0) !== 1 ? 's' : ''}`
              }
            </span>
          </div>

          {/* Horizontal tab bar (flush with hero bottom) */}
          <div className="flex gap-0.5 -mb-px overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.value || (!activeTab && tab.value === 'overview');
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => handleTabChange(tab.value)}
                  className={cn(
                    'flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-t-xl whitespace-nowrap transition-all duration-150 shrink-0 cursor-pointer',
                    isActive
                      ? 'bg-background text-primary shadow-sm'
                      : 'text-white/65 hover:text-white hover:bg-white/10'
                  )}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  {tab.label}
                  {tab.live && (
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div className="max-w-6xl mx-auto px-4 py-5">
        <Tabs value={activeTab || 'overview'} onValueChange={handleTabChange}>

          <TabsContent value="overview" className="m-0">
            <Overview
              getHCP={getHCP}
              teamData={data?.team}
              loading={
                state?.tournament.loading ||
                state?.overview?.loading ||
                state?.team?.loading
              }
              refetch={state?.overview?.refetch}
              overView={data?.overview!}
              gameData={data?.game!}
              organizer={data?.game?.organizer_id!}
              coOrganizers={data?.game?.co_organizers!}
              started={started}
              ended={isFinished}
            />
          </TabsContent>

          <TabsContent value="teams" className="m-0">
            <TeamsTab
              getHCP={getHCP}
              overView={data?.overview!}
              teamData={data?.team!}
              isScram={data?.game?.scoring_method === 'SCRAMBLE'}
            />
          </TabsContent>

          <TabsContent value="leaderboard" className="m-0">
            <Leaderboard
              roundsLength={Number(data?.game?.rounds) || 1}
              isTeam={data?.team && data?.team.length > 0}
              teams={data?.team}
              started={started}
              ended={ended}
              datalist={data?.leaderboard}
              refetch={state?.leaderBoard?.refetch}
              loading={state?.leaderBoard?.loading}
              scoreMethod={data?.game?.scoring_method}
              players={data?.overview}
              courseId={data?.game?.id_course}
            />
          </TabsContent>

          <TabsContent value="add-score" className="m-0">
            <AddScore
              players={data?.overview!}
              started={started}
              details={data?.game!}
              activeTab={activeTab}
              scorePermission={data?.score!}
              getHCP={getHCP}
              setActiveTab={setActiveTab}
              teamData={data?.team as TournamentTeam[]}
              fetchState={fetchState}
            />
          </TabsContent>

        </Tabs>
      </div>

    </div>
  );
}
