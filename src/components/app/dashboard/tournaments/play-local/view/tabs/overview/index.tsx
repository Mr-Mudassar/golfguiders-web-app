'use client';

import { useState, useMemo } from 'react';
import { format, differenceInMinutes } from 'date-fns';
import type {
  ParsedTournament,
  TournamentOverviewList,
  TournamentTeam,
} from '@/lib/definitions';
import { Skeleton } from '@/components/ui';
import { getScoreMethodLabel } from '../../../helper';
import AvatarBox from '@/components/app/common/avatar-box';
import {
  Hash,
  Timer,
  Target,
  Users,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGetUserDetails } from '@/lib/hooks/use-user/use-users-details';
import { useLocale } from 'next-intl';
import Link from 'next/link';

/* ── Small building blocks ── */

const StatCard = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1.5 p-4 rounded-2xl bg-muted/40 border border-border/50">
    <div className="flex items-center gap-1.5 text-muted-foreground">
      <Icon className="w-3.5 h-3.5" />
      <span className="text-[10px] font-semibold uppercase tracking-wide">{label}</span>
    </div>
    <p className="text-base font-bold text-foreground leading-tight">{value}</p>
  </div>
);

const statusStyle = (player: TournamentOverviewList, ended?: boolean) => {
  if (player?.is_match_completed)
    return { label: 'Done', cls: 'bg-primary/10 text-primary' };
  if (ended) {
    if (player?.round_played > 0 || player?.hole_played > 0)
      return { label: 'Done', cls: 'bg-primary/10 text-primary' };
    return { label: 'Did Not Play', cls: 'bg-muted text-muted-foreground' };
  }
  if (player?.round_played > 0 || player?.hole_played > 0)
    return { label: 'Playing', cls: 'bg-blue-50 text-blue-600' };
  return { label: 'Ready', cls: 'bg-muted text-muted-foreground' };
};

/* ── Player Card ── */

const PlayerCard = ({
  player: e,
  team,
  isScram,
  getHCP,
  locale,
  ended,
}: {
  player: TournamentOverviewList;
  team?: TournamentTeam[];
  isScram: boolean;
  getHCP: (id: string) => number | undefined;
  locale: string;
  ended?: boolean;
}) => {
  const name = e?.name ?? `${e?.userInfo?.first_name ?? ''} ${e?.userInfo?.last_name ?? ''}`;
  const curTeam = team?.find((t) =>
    !!e?.name ? t.team_id === e?.id : t.team_player?.includes(e?.id)
  );
  const hcp = isScram ? curTeam?.team_hcp : (e?.userInfo?.handicap ?? getHCP(e?.id));
  const holesPlayed = e?.hole_played || 0;
  const progress = Math.min(100, (holesPlayed / 18) * 100);
  const { label, cls } = statusStyle(e, ended);
  const profileUrl = e?.userInfo?.userid ? `/${locale}/profile/${e.userInfo.userid}` : undefined;

  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl border border-border/40 bg-card">
      {profileUrl ? (
        <Link href={profileUrl}>
          <AvatarBox
            name={name}
            src={e?.userInfo?.photo_profile!}
            className="w-10 h-10 shrink-0 text-sm cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all rounded-full"
          />
        </Link>
      ) : (
        <AvatarBox
          name={name}
          src={e?.userInfo?.photo_profile!}
          className="w-10 h-10 shrink-0 text-sm"
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          {profileUrl ? (
            <Link href={profileUrl} className="text-sm font-semibold text-foreground truncate hover:text-primary transition-colors">
              {name}
            </Link>
          ) : (
            <p className="text-sm font-semibold text-foreground truncate">{name}</p>
          )}
          <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0', cls)}>
            {label}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
          {false && !isScram && <span>{hcp != null ? `${hcp} HCP` : 'No HCP'}</span>}
          {(e?.round_played > 0 || e?.hole_played > 0) && (
            <span>· R{e.round_played} · H{e.hole_played}</span>
          )}
        </div>
        {holesPlayed > 0 && (
          <div className="mt-1.5 h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary/60 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Organizer Card ── */

const OrganizerCard = ({
  organizer,
  coOrganizers,
}: {
  organizer: string;
  coOrganizers: string[];
}) => {
  const { usersArray } = useGetUserDetails([organizer].filter(Boolean));
  const locale = useLocale();

  if (!usersArray?.length) return null;

  const { first_name, last_name, photo_profile, userid } = usersArray[0];
  const name = `${first_name} ${last_name}`;

  return (
    <div className="p-4 rounded-2xl border border-border/50 bg-muted/20 space-y-3">
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
        Organizer
      </p>
      <div className="flex items-center gap-3">
        <Link href={`/${locale}/profile/${userid}`}>
          <AvatarBox name={name} src={photo_profile!} className="w-10 h-10 shrink-0 text-sm cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all rounded-full" />
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            href={`/${locale}/profile/${userid}`}
            className="text-sm font-semibold hover:text-primary transition-colors"
          >
            {name}
          </Link>
        </div>
        <span className="shrink-0 text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
          Organizer
        </span>
      </div>

      {coOrganizers?.length > 0 && (
        <div className="border-t border-border/50 pt-3 space-y-2">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
            Co-organizers
          </p>
          <CoOrganizerList ids={coOrganizers} locale={locale} />
        </div>
      )}
    </div>
  );
};

const CoOrganizerList = ({ ids, locale }: { ids: string[]; locale: string }) => {
  const { usersArray } = useGetUserDetails(ids);
  return (
    <div className="space-y-2">
      {usersArray?.map((e) => {
        const name = `${e.first_name} ${e.last_name}`;
        return (
          <div key={e.userid} className="flex items-center gap-2.5">
            <Link href={`/${locale}/profile/${e.userid}`}>
              <AvatarBox name={name} src={e.photo_profile!} className="w-8 h-8 text-xs cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all rounded-full" />
            </Link>
            <Link
              href={`/${locale}/profile/${e.userid}`}
              className="text-xs font-medium hover:text-primary transition-colors"
            >
              {name}
            </Link>
          </div>
        );
      })}
    </div>
  );
};

/* ── Main Overview Component ── */

export default function Overview({
  gameData,
  overView = [],
  getHCP,
  refetch,
  loading,
  teamData,
  organizer,
  coOrganizers,
  started,
  ended,
}: {
  gameData: ParsedTournament;
  overView: TournamentOverviewList[];
  loading?: boolean;
  refetch: () => void;
  teamData: TournamentTeam[] | undefined;
  getHCP: (id: string) => number | undefined;
  organizer: string;
  coOrganizers: string[];
  started: boolean;
  ended: boolean;
}) {

  const [showFullDesc, setShowFullDesc] = useState(false);
  const [visiblePlayers, setVisiblePlayers] = useState(10);
  const locale = useLocale();

  const isTeam = teamData && teamData.length > 0;
  const isBestBall = Boolean(isTeam && gameData?.scoring_method === 'BESTBALL');
  const isScram = Boolean(isTeam && gameData?.scoring_method === 'SCRAMBLE');

  /* Timeline progress 0–100 */
  const timelineProgress = useMemo(() => {
    if (!gameData?.start_time || !gameData?.end_time) return 0;
    const start = new Date(+gameData.start_time);
    const end = new Date(+gameData.end_time);
    const total = differenceInMinutes(end, start);
    if (total <= 0) return 100;
    const elapsed = differenceInMinutes(new Date(), start);
    return Math.max(0, Math.min(100, (elapsed / total) * 100));
  }, [gameData]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={Hash} label="Rounds" value={gameData?.rounds ?? '—'} />
        <StatCard icon={Users} label="Players" value={overView?.length ?? '—'} />
        <StatCard
          icon={Target}
          label="Scoring"
          value={getScoreMethodLabel(gameData?.scoring_method) ?? '—'}
        />
        <StatCard
          icon={Timer}
          label="Tee Interval"
          value={gameData?.tee_interval ? `${gameData.tee_interval} min` : '—'}
        />
      </div>

      {/* ── Schedule / Timeline ── */}
      {gameData?.start_time && (
        <div className="p-4 rounded-2xl border border-border/50 bg-muted/20 space-y-3">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Schedule
          </p>
          <div className="flex justify-between text-xs font-medium">
            <span className="text-foreground">
              {format(new Date(+gameData.start_time), 'MMM d · h:mm a')}
            </span>
            {gameData?.end_time && (
              <span className="text-muted-foreground">
                {format(new Date(+gameData.end_time), 'MMM d · h:mm a')}
              </span>
            )}
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-700"
              style={{ width: `${timelineProgress}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Start</span>
            <span className={cn(
              ended ? 'text-destructive font-semibold' :
              started ? 'text-primary font-semibold' : ''
            )}>
              {ended ? 'Finished' : started ? 'In Progress' : 'Not Started'}
            </span>
            <span>End</span>
          </div>
        </div>
      )}

      {/* ── Description ── */}
      {gameData?.description && (
        <div className="p-4 rounded-2xl border border-border/50 bg-muted/20">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Description
          </p>
          <p
            className={cn(
              'text-sm text-foreground/80 leading-relaxed',
              !showFullDesc && 'line-clamp-2'
            )}
          >
            {gameData.description}
          </p>
          {gameData.description.split(' ').length > 15 && (
            <button
              onClick={() => setShowFullDesc(!showFullDesc)}
              className="text-primary text-xs mt-1.5 font-medium hover:underline flex items-center gap-0.5"
            >
              {showFullDesc ? (
                <><ChevronUp className="w-3 h-3" /> Show less</>
              ) : (
                <><ChevronDown className="w-3 h-3" /> Read more</>
              )}
            </button>
          )}
        </div>
      )}

      {/* ── Organizer ── */}
      <OrganizerCard organizer={organizer} coOrganizers={coOrganizers ?? []} />

      {/* ── Player / Team List ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {isScram || isBestBall ? 'Teams' : 'Players'}
            <span className="ml-1.5 text-primary font-bold">{isScram || isBestBall ? teamData?.length : overView?.length}</span>
          </p>
          <button
            onClick={() => refetch?.()}
            className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
          </button>
        </div>

        {isBestBall && teamData ? (
          /* ── Best Ball: group players under their team ── */
          <div className="space-y-4">
            {teamData.map((team) => {
              const teamPlayers = overView.filter((p) =>
                team.team_player?.includes(p?.userInfo?.userid ?? p?.id)
              );
              if (teamPlayers.length === 0) return null;
              return (
                <div key={team.team_id} className="rounded-2xl border border-border/50 bg-muted/20 overflow-hidden">
                  <div className="px-4 py-2.5 bg-primary/5 border-b border-border/40 flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-bold text-foreground">{team.team_name}</span>
                    <span className="text-[10px] text-muted-foreground ml-auto">{teamPlayers.length} players</span>
                  </div>
                  <div className="p-2 space-y-2">
                    {teamPlayers.map((e, i) => (
                      <PlayerCard
                        key={i}
                        player={e}
                        team={teamData}
                        isScram={false}
                        getHCP={getHCP}
                        locale={locale}
                        ended={ended}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ── Flat player list for other scoring methods ── */
          <>
            <div className="space-y-2">
              {overView.slice(0, visiblePlayers).map((e, i) => (
                <PlayerCard
                  key={i}
                  player={e}
                  team={teamData}
                  isScram={isScram}
                  getHCP={getHCP}
                  locale={locale}
                  ended={ended}
                />
              ))}
            </div>

            {visiblePlayers < overView.length && (
              <button
                type="button"
                onClick={() => setVisiblePlayers((v) => v + 10)}
                className="w-full py-2.5 rounded-xl border border-border/50 text-xs font-semibold text-primary hover:bg-primary/5 transition-colors"
              >
                Load More ({overView.length - visiblePlayers} remaining)
              </button>
            )}
          </>
        )}
      </div>

    </div>
  );
}
