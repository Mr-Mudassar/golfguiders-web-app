'use client';

import React, { useMemo, useState } from 'react';
import { Calendar, MapPin, Loader2, Eye, Trash2, Pencil } from 'lucide-react';
import type {
  ScorePermission,
  Tournament,
  TournamentTeam,
} from '@/lib/definitions';
import {
  Button,
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui';
import Link from 'next/link';
import { differenceInMinutes, format, isSameDay, isSameMonth } from 'date-fns';
import CreateTournamentWizard from '../../dashboard/tournaments/play-local/create';
import {
  getScoreMethodLabel,
  mapTournamentToForm,
} from '../../dashboard/tournaments/play-local/helper';
import { useGetUserDetails } from '@/lib/hooks/use-user/use-users-details';
import { useTournamentDetail } from '@/lib/hooks/use-tournament/tournament-details';
import { useLocale } from 'next-intl';
import { useTournament } from '@/lib/hooks/use-tournament';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';

const ConfirmationModal = dynamic(() =>
  import('@/components/common/confirmationDialog').then((mod) => mod.ConfirmationModal)
);

interface TournamentCardProps {
  tournament: Tournament;
  role?: string;
  readonly className?: string;
  refetchGames: () => void;
  compact?: boolean;
}

const TournamentCard: React.FC<TournamentCardProps> = ({
  tournament,
  role,
  refetchGames,
  className,
  compact = false,
}) => {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const { deleteGame, status } = useTournament();

  async function handleDelete(t: Tournament) {
    try {
      await deleteGame({
        variables: {
          created: t?.created,
          id: t?.tournament_id,
        },
      });
      await refetchGames();
      toast.success('Tournament deleted!');
    } catch (err) {
      console.log('Deletion error: ', err);
      toast.error('Failed to delete tournament');
    }
  }

  const parseTimestamp = (val?: string): Date => {
    if (!val) return new Date(NaN);
    const byNum = new Date(+val);
    if (!isNaN(byNum.getTime())) return byNum;
    return new Date(val);
  };

  const { data } = useTournamentDetail({
    gameId: open ? tournament?.tournament_id : undefined,
    organizerId: open ? tournament?.organizer_id : undefined,
    created: open ? tournament?.created : undefined,
  });

  const ids = React.useMemo(() => {
    if (!open) return [];
    return [
      ...(data?.team?.flatMap((t) => [
        ...(t?.team_player ?? []),
        ...(t?.team_admin_id ?? []),
      ]) ?? []),
      ...(data?.score?.flatMap(({ player_id_competitor, player_id_marker }) => [
        player_id_competitor ?? [],
        player_id_marker ?? [],
      ]) ?? []),
      ...(tournament?.co_organizers ?? []),
      ...(() => {
        try {
          return JSON.parse(tournament.players || '[]').map(
            (e: { user_id: string }) => e.user_id
          );
        } catch {
          return [];
        }
      })(),
    ];
  }, [open, data?.team, data?.score, tournament?.co_organizers, tournament.players]);

  const uniqueIds = [...new Set(ids)];
  const { usersMap } = useGetUserDetails(open ? uniqueIds : []);
  const en = useLocale();
  const loading = status.delete.loading || status.edit.loading;

  const detailHref = `play-local/${tournament?.organizer_id}/${tournament?.tournament_id}/${tournament?.created}`;

  // Edit: allowed for organizer, 30+ min before start
  const startDate = parseTimestamp(tournament?.start_time);
  const canEdit = (role === 'organizer' || !role) &&
    !isNaN(startDate.getTime()) &&
    differenceInMinutes(startDate, new Date()) >= 30;

  const editFormData = useMemo(() => {
    if (!open || !data?.game) return undefined;
    const rawTournament = { ...tournament, players: tournament.players };
    return mapTournamentToForm(
      rawTournament,
      data.team ?? [],
      data.score ?? [],
      usersMap
    );
  }, [open, data?.game, data?.team, data?.score, usersMap, tournament]);

  return (
    <div
      className={cn(
        'relative w-full bg-background rounded-2xl border transition-all duration-300 cursor-pointer',
        'hover:shadow-lg hover:-translate-y-0.5',
        'border-border/50 hover:border-border hover:shadow-slate-200/50',
        compact ? 'p-3' : 'p-4',
        className
      )}
    >
      {/* Full-card clickable link overlay */}
      <Link
        href={detailHref}
        className="absolute inset-0 z-0 rounded-2xl"
        aria-label={`View ${tournament?.name}`}
      />
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-background/70 backdrop-blur-[1px] z-20 rounded-2xl flex items-center justify-center">
          <Loader2 className="animate-spin size-6 text-primary" />
        </div>
      )}

      {/* Top row: scoring method + actions */}
      <div className="relative z-10 flex items-center gap-2 mb-3 pointer-events-none">
        {/* Scoring method badge */}
        <span
          className={cn(
            'rounded-lg font-medium capitalize',
            compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
            'bg-primary/10 text-primary border border-primary/20'
          )}
        >
          {getScoreMethodLabel(tournament?.scoring_method)}
        </span>

        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* View */}
          <Link
            href={detailHref}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
            title="View"
          >
            <Eye className="w-3.5 h-3.5" />
          </Link>

          {/* Edit */}
          {canEdit && (
            <button
              onClick={() => setOpen(true)}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary cursor-pointer"
              title="Edit tournament"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}

          {(role === 'organizer' || !role) && (
            <>
              {/* Delete */}
              <button
                onClick={() => setDeleteConfirm(true)}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 transition-all duration-200 cursor-pointer"
                title="Delete tournament"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tournament name + organizer */}
      <div className="relative z-10 flex items-start justify-between gap-3 pb-3 mb-3 border-b border-border/50 pointer-events-none">
        <h3
          className={cn(
            'font-bold text-foreground leading-tight',
            compact ? 'text-sm' : 'text-base'
          )}
        >
          {tournament?.name}
        </h3>
        <Link
          href={`/${en}/profile/${tournament?.user_id}`}
          className="shrink-0 text-[11px] text-primary hover:text-primary/80 font-medium transition-colors pointer-events-auto"
        >
          by {tournament?.organizer_name}
        </Link>
      </div>

      {/* Meta details */}
      <div
        className={cn(
          'flex flex-col gap-1.5 text-muted-foreground pointer-events-none',
          compact ? 'text-xs' : 'text-sm'
        )}
      >
        <Timer dateTime={parseTimestamp(tournament?.start_time)} endDateTime={parseTimestamp(tournament?.end_time)} compact={compact} rounds={tournament?.rounds} />

        {!compact && (
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate">{tournament?.coursename}</span>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      <ConfirmationModal
        title="Delete Tournament?"
        description={`Are you sure you want to delete "${tournament?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Keep it"
        open={deleteConfirm}
        onOpenChange={() => setDeleteConfirm(false)}
        onConfirm={() => {
          setDeleteConfirm(false);
          handleDelete(tournament);
        }}
      />

      {/* Edit Tournament Sheet */}
      <Sheet
        open={open}
        onOpenChange={(val) => {
          if (!val) {
            setConfirm(true);
            return;
          }
          setOpen(val);
        }}
      >
        <SheetContent side="right" className="p-0 flex flex-col w-full">
          <SheetTitle className="sr-only">Edit Tournament</SheetTitle>
          {editFormData && (
            <CreateTournamentWizard
              initialData={editFormData}
              close={() => setOpen(false)}
              refetchGames={refetchGames}
            />
          )}
          <ConfirmationModal
            title="Discard Changes?"
            cancelText="Keep Editing"
            confirmText="Discard"
            description="Are you sure you want to discard the changes to this tournament?"
            onConfirm={() => {
              setConfirm(false);
              setOpen(false);
            }}
            open={confirm}
            onOpenChange={() => setConfirm(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export { TournamentCard };

const Timer = ({
  dateTime,
  endDateTime,
  compact = false,
  rounds,
}: {
  dateTime: Date;
  endDateTime?: Date;
  compact?: boolean;
  rounds?: number;
}) => {
  if (isNaN(dateTime.getTime())) return null;
  const minsLeft = differenceInMinutes(dateTime, new Date());

  const getTimer = () => {
    if (minsLeft <= 0) return 'Started';
    const hrs = Math.floor(minsLeft / 60);
    const mins = minsLeft % 60;
    if (hrs > 0) return `${hrs}h ${mins}m left`;
    return `${mins}m left`;
  };

  const start = dateTime;
  const end = endDateTime && !isNaN(endDateTime.getTime()) ? endDateTime : null;

  const formatDateRange = () => {
    const startTime = format(start, 'h:mm a');
    if (!end) return `${format(start, 'd MMM, yyyy')} \u2022 ${startTime}`;

    const endTime = format(end, 'h:mm a');

    if (isSameDay(start, end)) {
      return `${format(start, 'd MMM, yyyy')} \u2022 ${startTime} - ${endTime}`;
    }
    if (isSameMonth(start, end)) {
      return `${format(start, 'd')}-${format(end, 'd')} ${format(start, 'MMM, yyyy')} \u2022 ${startTime} - ${endTime}`;
    }
    return `${format(start, 'd MMM')} - ${format(end, 'd MMM, yyyy')} \u2022 ${startTime} - ${endTime}`;
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Calendar className={cn('text-primary shrink-0', compact ? 'h-3 w-3' : 'h-3.5 w-3.5')} />
      <span className="flex-1">{formatDateRange()}</span>

      {minsLeft > 0 && minsLeft <= 120 && (
        <span className="ml-1 inline-flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          {getTimer()}
        </span>
      )}

      {rounds != null && rounds > 0 && (
        <span className={cn('shrink-0 font-medium text-muted-foreground', compact ? 'text-[10px]' : 'text-xs')}>
          {rounds} {rounds === 1 ? 'round' : 'rounds'}
        </span>
      )}
    </div>
  );
};
