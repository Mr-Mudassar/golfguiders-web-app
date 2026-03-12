'use client';

import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { cn, getName } from '@/lib/utils';
import UserSelectDialog from './select-user';
import type { TournamentFormValues } from '..';
import type { User } from '@/lib/definitions';
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Icon,
} from '@/components/ui';
import { useAppSelector } from '@/lib';
import { ConfirmationModal } from '@/components/common/confirmationDialog';
import { UserCheck, UserX, Users, ChevronRight, CheckCircle2, X } from 'lucide-react';
import { useGetUserDetails } from '@/lib/hooks/use-user/use-users-details';
import AvatarBox from '@/components/app/common/avatar-box';

export default function OrganizersStep({
  setValid,
}: {
  setValid: (b: boolean) => void;
}) {
  const { watch, setValue } = useFormContext<TournamentFormValues>();
  const coOrganizers = watch('co_organizers') || [];
  const players = watch('players') || [];
  const [dialogOpen, setDialogOpen] = useState(false);
  const { first_name, last_name, userid } =
    useAppSelector((s) => s.auth?.user) ?? {};

  const [confirm, setShowConfirm] = useState(false);

  useEffect(() => {
    setValue('organizer_name', getName(first_name, last_name));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setValue, first_name, last_name]);

  const handleToggle = () => {
    const currentlyPlaying = watch('play_organizer');
    if (currentlyPlaying === true) {
      setShowConfirm(true);
      return;
    }
    setValue('play_organizer', true);
  };

  const confirmRemove = () => {
    setValue('play_organizer', false);
    const updated = players.filter((p) => p.user_id !== userid);
    setValue('players', updated);
    setShowConfirm(false);
  };

  const handleOrganizerSelect = ({ user }: { user: User }) => {
    const exists = coOrganizers?.some((c) => c === user?.userid);

    const updated = exists
      ? coOrganizers?.filter((c) => c !== user?.userid)
      : [...coOrganizers, user?.userid as string];

    setValue('co_organizers', updated);

    // When adding a co-organizer, remove their score permissions (they already have full rights)
    if (!exists && user?.userid) {
      const uid = user.userid as string;
      const permissions = watch('scorePermissions') || [];
      if (permissions.length > 0) {
        const cleaned = permissions.filter(
          (s) => s.player_id_marker !== uid && s.player_id_competitor !== uid
        );
        if (cleaned.length !== permissions.length) {
          setValue('scorePermissions', cleaned);
        }
      }
      // Also remove from team_admin_id in team mode
      const teams = watch('teams') || [];
      if (teams.length > 0) {
        const needsUpdate = teams.some((t) => t.team_admin_id.includes(uid));
        if (needsUpdate) {
          setValue('teams', teams.map((t) => ({
            ...t,
            team_admin_id: t.team_admin_id.filter((id) => id !== uid),
          })));
        }
      }
    }
  };

  useEffect(() => {
    setValid(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setValue, setValid]);

  const isPlaying = watch('play_organizer');

  const { usersMap: coOrgUsersMap } = useGetUserDetails(coOrganizers);

  return (
    <>
      <div className="space-y-6">
        {/* Organizer row */}
        <FormField
          name="organizer_name"
          render={() => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Organizer
              </FormLabel>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/50">
                {/* Avatar placeholder */}
                <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">
                    {(first_name?.[0] ?? '').toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {watch('organizer_name')}
                    <span className="ml-1.5 text-xs font-normal text-primary">(You)</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground">Tournament Organizer</p>
                </div>

                {/* Playing toggle */}
                <FormField
                  name="play_organizer"
                  render={() => (
                    <button
                      type="button"
                      onClick={handleToggle}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200',
                        isPlaying
                          ? 'bg-primary text-white border-primary shadow-sm shadow-primary/25'
                          : 'bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
                      )}
                    >
                      {isPlaying ? (
                        <>
                          <UserCheck className="w-3 h-3" />
                          Joined as Player
                        </>
                      ) : (
                        <>
                          <UserX className="w-3 h-3" />
                          Join as Player
                        </>
                      )}
                    </button>
                  )}
                />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Co-Organizers */}
        <FormField
          name="co_organizer"
          render={() => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                Co-Organizers
              </FormLabel>
              <button
                type="button"
                onClick={() => setDialogOpen(true)}
                className={cn(
                  'w-full flex items-center justify-between p-3 rounded-xl border text-sm transition-all duration-200',
                  coOrganizers.length > 0
                    ? 'border-primary/30 bg-primary/5 text-foreground hover:border-primary/50'
                    : 'border-border/60 bg-muted/30 text-muted-foreground hover:border-primary/30 hover:bg-primary/5'
                )}
              >
                <span className="flex items-center gap-2">
                  {coOrganizers.length > 0 ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span className="font-medium">
                        {coOrganizers.length} co-organizer{coOrganizers.length !== 1 ? 's' : ''} added
                      </span>
                    </>
                  ) : (
                    <span>No co-organizers added — tap to add</span>
                  )}
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </button>

              {/* Listed co-organizers */}
              {coOrganizers.length > 0 && (
                <div className="space-y-1.5 mt-2">
                  {coOrganizers.map((id) => {
                    const u = coOrgUsersMap[id];
                    const name = u ? `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() : id;
                    return (
                      <div
                        key={id}
                        className="flex items-center gap-2.5 p-2 rounded-lg bg-muted/40 border border-border/40"
                      >
                        <AvatarBox
                          name={name}
                          src={u?.photo_profile ?? ''}
                          className="w-7 h-7 shrink-0 text-[10px] rounded-full"
                        />
                        <span className="flex-1 text-sm font-medium truncate">{name}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setValue('co_organizers', coOrganizers.filter((c) => c !== id));
                          }}
                          className="w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground hover:bg-red-100 hover:text-red-600 transition-colors shrink-0"
                          title="Remove co-organizer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <UserSelectDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          isOrganizer={true}
          onSelect={(user) => handleOrganizerSelect({ user })}
        />
      </div>

      {/* Confirm remove playing dialog */}
      <ConfirmDialog
        open={confirm}
        cancel={() => setShowConfirm(false)}
        remove={confirmRemove}
      />
    </>
  );
}

const ConfirmDialog = ({
  open,
  cancel,
  remove,
}: {
  open: boolean;
  cancel: () => void;
  remove: () => void;
}) => {
  return (
    <ConfirmationModal
      open={open}
      onOpenChange={(v) => { if (!v) cancel(); }}
      title="Stop Playing?"
      description="Are you sure you don't want to participate in this tournament as a player?"
      cancelText="Keep Playing"
      confirmText="Remove Me"
      variant="destructive"
      onConfirm={remove}
    />
  );
};

export const DialogInput = ({
  data,
  title,
  minLen = 0,
  emptyTitle,
  setOpen,
  className,
  disabled = false,
}: {
  title: string;
  emptyTitle: string;
  minLen?: number;
  className?: string;
  data: string[] | Record<string, unknown>[];
  setOpen: () => void;
  disabled?: boolean;
}) => {
  return disabled ? (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between w-full border border-border/40 p-3 rounded-xl text-muted-foreground bg-muted/50 text-sm',
        className
      )}
    >
      Golf course is required for team creation
    </div>
  ) : (
    <button
      type="button"
      className={cn(
        'flex items-center justify-between w-full border p-3 rounded-xl text-sm transition-all duration-200',
        data?.length > 0
          ? 'border-primary/30 bg-primary/5 text-foreground hover:border-primary/50'
          : 'border-border/60 bg-muted/30 text-muted-foreground hover:border-primary/30 hover:bg-primary/5',
        className
      )}
      onClick={setOpen}
    >
      {data?.length > 0 ? (
        <span className="flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
          {data?.length} {title}
          {data?.length > minLen && (
            <Icon name="check" className="text-primary size-4 ml-1" />
          )}
        </span>
      ) : (
        <span>{emptyTitle}</span>
      )}
      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
    </button>
  );
};
