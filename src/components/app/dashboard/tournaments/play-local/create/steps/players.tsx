'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui';
import UserSelectDialog from './select-user';
import type { TournamentFormValues } from '../';
import { toast } from 'sonner';
import { useFetchGolfCourseCoordinates } from '@/lib/hooks/use-fetch-course';
import { Modal } from '../dialog';
import type { UserSelectHandler } from '../../_interface';
import { Users, UserPlus, AlertCircle, CheckCircle2, X } from 'lucide-react';
import AvatarBox from '@/components/app/common/avatar-box';
import { cn } from '@/lib/utils';

export default function PlayersStep({
  setValid,
}: {
  setValid: (b: boolean) => void;
}) {
  const { watch, setValue, setError, clearErrors } = useFormContext<TournamentFormValues>();
  const players = watch('players') || [];
  const teams = watch('teams') || [];
  const [dialogOpen, setDialogOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const { teeDetails } = useFetchGolfCourseCoordinates(watch('id_course'));

  const scoringMethod = watch('scoring_method');
  const isTeamMethod =
    scoringMethod === 'SCRAMBLE' || scoringMethod === 'BESTBALL';
  const golfCourse = watch('id_course');

  const scorePermissions = watch('scorePermissions') || [];
  const prevCourseRef = useRef(golfCourse);

  // Auto-assign first tee of new course when teeDetails load and players have empty tees
  useEffect(() => {
    if (teeDetails?.length > 0 && players.length > 0) {
      const playersNeedTee = players.some((p) => !p.tee);
      if (playersNeedTee) {
        const firstTee = teeDetails[0];
        const updated = players.map((p) =>
          !p.tee
            ? {
                ...p,
                tee: firstTee.teecolorname,
                tee_color: firstTee.teecolorvalue,
                tee_order: firstTee.display_order,
                gender: (firstTee.gender === 'men' ? 'MALE' : firstTee.gender === 'wmn' ? 'FEMALE' : 'OTHER') as typeof p.gender,
              }
            : p
        );
        setValue('players', updated);
      }
    }
    prevCourseRef.current = golfCourse;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teeDetails]);

  const removePlayer = (userId: string) => {
    setValue('players', players.filter((p) => p.user_id !== userId));
    // Remove any score permissions involving this player
    if (scorePermissions.length > 0) {
      setValue(
        'scorePermissions',
        scorePermissions.filter(
          (s) => s.player_id_marker !== userId && s.player_id_competitor !== userId
        )
      );
    }
  };

  const handlePlayerSelect: UserSelectHandler = (
    user,
    hcp,
    hcpPercent,
    teeMarker,
    type = 'add'
  ) => {
    if (!teeMarker?.name) {
      toast.error('Please set valid HCP, HCP %, and Tee Marker before adding');
      return;
    }

    const idx = players.findIndex((p) => p.user_id === user.userid);

    if (idx !== -1 && type === 'add') {
      removePlayer(user.userid as string);
      return;
    }

    const playerObj = {
      user_id: user.userid as string,
      name: `${user.first_name} ${user.last_name}`,
      email: user.email as string,
      gender: teeMarker?.gen,
      hcp: hcp != null ? hcp * (hcpPercent / 100) : undefined,
      hcp_percentage: hcpPercent,
      photo: user.photo_profile ?? '',
      tee: teeMarker?.name,
      tee_color: teeMarker?.value,
      tee_order: teeMarker?.order,
    };

    if (idx !== -1 && type === 'edit') {
      const updated = [...players];
      updated[idx] = playerObj;
      setValue('players', updated);
      return;
    }

    if (idx === -1) {
      setValue('players', [...players, playerObj]);
    }
  };

  useEffect(() => {
    const hasMinPlayers = players?.length >= 2;
    const allHaveTee = players?.length ? players.every((u) => u.tee !== '') : false;
    if (hasMinPlayers && allHaveTee) {
      setValid(true);
      clearErrors('players');
    } else {
      setValid(false);
      setError('players', {
        type: 'manual',
        message: 'At least 2 players are required',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [players, setValid, setError, clearErrors]);

  const isReady = players.length >= 2;

  return (
    <div className="space-y-5">
      <FormItem>
        <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" />
          Players
        </FormLabel>

        {/* No course selected */}
        {!golfCourse ? (
          <div className="flex items-center gap-2.5 p-3 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            Select a golf course first (in the Basic step)
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              if (isTeamMethod && teams.length < 2) {
                toast('Create at least 2 teams to add players');
                return;
              }
              setDialogOpen(true);
            }}
            className={cn(
              'w-full flex items-center justify-between p-4 rounded-xl border text-sm transition-all duration-200',
              isReady
                ? 'border-primary/30 bg-primary/5 hover:border-primary/50'
                : 'border-border/60 bg-muted/30 text-muted-foreground hover:border-primary/30 hover:bg-primary/5',
              isTeamMethod && teams.length < 2 && 'opacity-50 cursor-not-allowed'
            )}
          >
            <span className="flex items-center gap-2 font-medium">
              {players.length > 0 ? (
                <>
                  <CheckCircle2 className={cn('w-4 h-4', isReady ? 'text-primary' : 'text-muted-foreground')} />
                  {players.length} player{players.length !== 1 ? 's' : ''} selected
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Tap to add players
                </>
              )}
            </span>
          </button>
        )}

        {/* Validation hint */}
        {golfCourse && players.length < 2 && (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1.5">
            <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />
            Minimum 2 players required
            {players.length > 0 && ` · ${2 - players.length} more needed`}
          </p>
        )}

        <FormMessage />
      </FormItem>

      {/* Player list preview */}
      {players.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Selected Players
            </p>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="text-[11px] text-primary hover:underline"
            >
              Manage
            </button>
          </div>
          <div className="space-y-1.5">
            {players.map((p) => (
              <div
                key={p.user_id}
                className="flex items-center justify-between px-3 py-2 rounded-xl bg-muted/40 border border-border/40"
              >
                <div className="flex items-center gap-2">
                  <AvatarBox
                    className="w-8 h-8 shrink-0 text-[11px]"
                    name={p.name}
                    src={p.photo ?? ''}
                  />
                  <div>
                    <p className="text-xs font-semibold text-foreground">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {p.hcp != null ? `${p.hcp} HCP` : 'No HCP'}{p.hcp != null && p.hcp >= 1 && p.hcp_percentage != null && p.hcp_percentage !== 100 ? ` · ${p.hcp_percentage}%` : ''} · {p.tee || <span className="text-amber-500">No tee</span>}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removePlayer(p.user_id)}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground hover:bg-red-100 hover:text-red-600 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full player list modal */}
      <Modal
        title="Selected Players"
        description="All players added to this tournament"
        open={open}
        setOpen={() => setOpen(false)}
      >
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {!players?.length ? (
            <div className="grid place-items-center min-h-32 text-muted-foreground text-sm">
              No players added yet
            </div>
          ) : (
            players.map((u) => (
              <div key={u.user_id} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-muted/40 border border-border/40">
                <div className="flex items-center gap-2.5">
                  <AvatarBox
                    className="w-8 h-8 shrink-0 text-[11px]"
                    name={u?.name}
                    src={u?.photo ?? ''}
                  />
                  <div>
                    <p className="text-sm font-semibold">{u?.name}</p>
                    <p className="text-xs text-muted-foreground">{u?.hcp} HCP</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 h-7 text-xs"
                  onClick={() => removePlayer(u.user_id)}
                >
                  Remove
                </Button>
              </div>
            ))
          )}
        </div>
      </Modal>

      <UserSelectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        teeData={teeDetails}
        onSelect={handlePlayerSelect}
      />
    </div>
  );
}
