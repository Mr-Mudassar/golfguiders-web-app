'use client';

import { useState, useMemo, useEffect } from 'react';
import { Loader2, UserRoundSearch } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Modal } from '../dialog';
import { UserCard } from '../user-card';
import {
  useFetchAllFriends,
  useFetchRecommendationsPaginated,
} from '@/lib/hooks/use-user';
import { getName } from '@/lib/utils';
import type { CourseTeeDetails, User } from '@/lib/definitions';
import type { TournamentFormValues } from '..';
import { useFormContext, useWatch } from 'react-hook-form';
import { useGetUserDetails } from '@/lib/hooks/use-user/use-users-details';
import { useAppSelector } from '@/lib';
import { ITeeMark, Team, UserSelectHandler } from '../../_interface';
import { TeeDropDown } from '../tee-drop-down';
import { useFetchGolfCourseCoordinates } from '@/lib/hooks/use-fetch-course';
import { useDebounceValue } from 'usehooks-ts';
import { Button, Input } from '@/components/ui';

export default function UserSelectDialog({
  open,
  onOpenChange,
  isTeam = false,
  isOrganizer = false,
  team,
  teeData: teeData = [],
  onSelect,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  isTeam?: boolean;
  isOrganizer?: boolean;
  team?: Team;
  teeData?: CourseTeeDetails[];
  onSelect: UserSelectHandler;
}) {
  const [activeSearchTab, setActiveSearchTab] = useState<'friends' | 'all'>('friends');
  const [rawSearch, setRawSearch] = useState('');
  const [search] = useDebounceValue(rawSearch, 500);
  const { mergedList: friends, infiniteQuery, observer } = useFetchAllFriends();
  const {
    mergedList: allRecs,
    infiniteQuery: recsQuery,
    observer: recsObserver,
    loading: recsLoading,
  } = useFetchRecommendationsPaginated({ search: activeSearchTab === 'all' ? search : '' });

  // Refetch fresh data every time the dialog opens
  useEffect(() => {
    if (open) {
      infiniteQuery.refetch();
      recsQuery.refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  const { user: adminUser } = useAppSelector((s) => s.auth);
  const form = useFormContext<TournamentFormValues>();
  const players = useWatch({
    control: form.control,
    name: 'players',
    defaultValue: [],
  });
  const teams = useWatch({
    control: form.control,
    name: 'teams',
    defaultValue: [],
  });
  const coOrganizer = form.watch('co_organizers');
  const [defMark, setDefMark] = useState<ITeeMark>({
    name: '',
    value: '',
    gen: '',
    order: '',
  });
  // Store original tees before first default application so cancel can restore
  const [preDefaultTees, setPreDefaultTees] = useState<
    Record<string, { tee: string; tee_order: string; tee_color: string; gender: '' | 'MALE' | 'FEMALE' | 'OTHER' }>
  >({});

  // When default tee marker changes, also update all existing players in the form
  const handleDefaultMarkerChange = (mark: ITeeMark) => {
    setDefMark(mark);

    // In team mode, sync the team's tee_marker/tee_color and update only team players
    if (isTeam && team && mark.name) {
      const currentTeams = form.getValues('teams') ?? [];
      const updatedTeams = currentTeams.map((t) =>
        t.team_name === team.team_name
          ? { ...t, tee_marker: [mark.name], tee_color: [mark.value] }
          : t
      );
      form.setValue('teams', updatedTeams);

      // Update only players that belong to this team
      const teamPlayerIds = new Set(
        currentTeams.find((t) => t.team_name === team.team_name)?.team_player ?? []
      );
      if (players?.length > 0 && teamPlayerIds.size > 0) {
        const updated = players.map((p) =>
          teamPlayerIds.has(p.user_id)
            ? {
                ...p,
                tee: mark.name,
                tee_order: mark.order,
                tee_color: mark.value,
                gender: mark.gen || p.gender,
              }
            : p
        );
        form.setValue('players', updated);
      }
      return;
    }

    if (mark.name && players?.length > 0) {
      // Snapshot original tees on first default application
      if (!Object.keys(preDefaultTees).length) {
        const orig: typeof preDefaultTees = {};
        players.forEach((p) => {
          orig[p.user_id] = { tee: p.tee, tee_order: p.tee_order, tee_color: p.tee_color ?? '', gender: p.gender };
        });
        setPreDefaultTees(orig);
      }
      const updated = players.map((p) => ({
        ...p,
        tee: mark.name,
        tee_order: mark.order,
        tee_color: mark.value,
        gender: mark.gen || p.gender,
      }));
      form.setValue('players', updated);
    }
  };

  const handleDefaultMarkerCancel = () => {
    setDefMark({ name: '', value: '', gen: '', order: '' });
    // Restore original tee values for already-added players
    if (Object.keys(preDefaultTees).length > 0 && players?.length > 0) {
      const restored = players.map((p) => {
        const orig = preDefaultTees[p.user_id];
        return orig
          ? { ...p, tee: orig.tee, tee_order: orig.tee_order, tee_color: orig.tee_color, gender: orig.gender }
          : p;
      });
      form.setValue('players', restored);
      setPreDefaultTees({});
    }
  };

  const { teeDetails } = useFetchGolfCourseCoordinates(form.watch('id_course'));

  // Pre-populate team tee from existing team tee_marker when in team mode
  useEffect(() => {
    if (isTeam && team?.tee_marker?.[0] && teeDetails?.length > 0) {
      const teamTeeName = team.tee_marker[0];
      const teeDetail = teeDetails.find(
        (t: CourseTeeDetails) => t.teecolorname === teamTeeName
      );
      if (teeDetail) {
        setDefMark({
          name: teeDetail.teecolorname,
          value: teeDetail.teecolorvalue,
          gen:
            teeDetail.gender === 'men'
              ? 'MALE'
              : teeDetail.gender === 'wmn'
                ? 'FEMALE'
                : 'OTHER',
          order: teeDetail.display_order,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTeam, team?.team_name, teeDetails]);

  const otherTeams = teams?.filter((t) => t?.team_name !== team?.team_name);
  // All player IDs already in any team (used to hide them from the dialog)
  const allTeamPlayerIds = useMemo(() => {
    if (!isTeam) return new Set<string>();
    return new Set(teams?.flatMap((t) => t.team_player) ?? []);
  }, [isTeam, teams]);

  const filteredFriends = useMemo(() => {
    const seen = new Set<string>();
    return (friends ?? []).filter((f) => {
      const id = f.userInfo?.userid ?? f.friend_user_id;
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return getName(f.userInfo?.first_name, f.userInfo?.last_name)
        .toLowerCase()
        .includes(rawSearch.toLowerCase());
    });
  }, [friends, rawSearch]);

  // Deduplicate recommendations
  const filteredAll = useMemo(() => {
    const seen = new Set<string>();
    return (allRecs ?? []).filter((u: User) => {
      if (!u.userid || seen.has(u.userid)) return false;
      seen.add(u.userid);
      return true;
    });
  }, [allRecs]);

  const notEmpty = !isOrganizer ? players?.length > 0 : coOrganizer?.length > 0;

  return (
    <Modal
      open={open}
      setOpen={() => onOpenChange(false)}
      title={isOrganizer ? 'Co-Organizers' : 'Players'}
      description={
        isTeam
          ? `Add Players in "${team?.team_name}"`
          : isOrganizer
            ? 'Add co-organizers in tournament'
            : 'Add players in tournament'
      }
      footer={
        <Button
          variant={notEmpty ? 'default' : 'outline'}
          onClick={() => onOpenChange(false)}
        >
          {notEmpty ? 'Done' : 'Close'}
        </Button>
      }
    >
      <div className="flex items-center gap-3">
        <Input
          value={rawSearch}
          size={100}
          onChange={(e) => setRawSearch(e.target.value)}
          placeholder="Search user by name..."
        />

        {!isOrganizer && (
          <div>
            <p className="text-sm -mt-3">{isTeam ? 'Team Tee' : 'Default Marker'}</p>
            <TeeDropDown
              data={teeDetails}
              teeMarker={defMark}
              handleTeeSelect={handleDefaultMarkerChange}
              handleTeeCancel={isTeam ? undefined : handleDefaultMarkerCancel}
            />
          </div>
        )}
      </div>

      {!isOrganizer && form.watch('play_organizer') &&
        !(isTeam && allTeamPlayerIds.has(adminUser?.userid as string)) && (
        <UserCard
          user={adminUser as User}
          isSelected={Boolean(
            isTeam
              ? teams?.find((t) => t.team_name === team?.team_name)?.team_player?.includes(adminUser?.userid as string)
              : players?.find((e) => e.user_id === adminUser?.userid)
          )}
          currPlayer={
            players?.find((e) => e.user_id === adminUser?.userid) ?? undefined
          }
          team={team}
          defaultMark={defMark}
          teeData={teeDetails}
          onSelect={onSelect}
          isOrganizer={isOrganizer}
        />
      )}

      <Tabs defaultValue="friends" className="space-y-4" onValueChange={(v) => {
        setActiveSearchTab(v as 'friends' | 'all');
        setRawSearch('');
      }}>
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="friends" className="w-full">Friends</TabsTrigger>
          <TabsTrigger value="all" className="w-full">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="space-y-3 h-72 overflow-y-auto">
          {infiniteQuery?.isLoading && !friends?.length ? (
            <div className="grid place-items-center h-40 text-muted-foreground">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            filteredFriends?.map((f, idx) => {
              const u = f.userInfo!;
              const alreadyInAnyTeam = isTeam && allTeamPlayerIds.has(u.userid!);
              const isSelected = Boolean(
                isTeam
                  ? false
                  : isOrganizer
                    ? coOrganizer?.some((e) => e === u.userid)
                    : players?.some((p) => p.user_id === u.userid)
              );

              return (
                !alreadyInAnyTeam && (
                  <UserCard
                    key={`friends-${u.userid}-tab${idx}`}
                    user={u as User}
                    isSelected={isSelected}
                    currPlayer={
                      players?.find((e) => e.user_id === u.userid) ?? undefined
                    }
                    defaultMark={defMark}
                    team={team}
                    onSelect={onSelect}
                    isOrganizer={isOrganizer}
                    teeData={teeDetails}
                  />
                )
              );
            })
          )}

          {/* Infinite scroll sentinel */}
          {infiniteQuery?.hasNextPage && (
            <div ref={observer.ref} className="flex justify-center py-2">
              {infiniteQuery.isFetchingNextPage && <Loader2 className="animate-spin size-5 text-muted-foreground" />}
            </div>
          )}

          {!infiniteQuery?.isLoading && !filteredFriends?.length && (
            <div className="h-48 flex-col flex gap-2 my-auto items-center justify-center text-muted-foreground">
              <UserRoundSearch className="size-12 text-primary" />
              No friend found
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-3 h-72 overflow-y-auto">
          {recsLoading && !allRecs?.length ? (
            <div className="grid place-items-center h-40 text-muted-foreground">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            filteredAll?.map((u: User) => {
              const alreadyInAnyTeam = isTeam && allTeamPlayerIds.has(u.userid!);
              const isSelected = Boolean(
                isTeam
                  ? false
                  : isOrganizer
                    ? coOrganizer?.some((e) => e === u.userid)
                    : players?.some((p) => p.user_id === u.userid)
              );

              return (
                !alreadyInAnyTeam && (
                  <UserCard
                    key={`all-${u.userid}`}
                    user={u as User}
                    isSelected={isSelected}
                    currPlayer={
                      players?.find((e) => e.user_id === u.userid) ?? undefined
                    }
                    defaultMark={defMark}
                    team={team}
                    onSelect={onSelect}
                    isOrganizer={isOrganizer}
                    teeData={teeDetails}
                  />
                )
              );
            })
          )}

          {/* Infinite scroll sentinel */}
          {recsQuery?.hasNextPage && (
            <div ref={recsObserver.ref} className="flex justify-center py-2">
              {recsQuery.isFetchingNextPage && <Loader2 className="animate-spin size-5 text-muted-foreground" />}
            </div>
          )}

          {!recsLoading && !filteredAll?.length && (
            <div className="h-48 flex-col flex gap-2 my-auto items-center justify-center text-muted-foreground">
              <UserRoundSearch className="size-12 text-primary" />
              No user found
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Modal>
  );
}
