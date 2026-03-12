// 'use client';

// import { useFormContext } from 'react-hook-form';
// import { FormItem, FormLabel } from '@/components/ui/form';
// import { Button } from '@/components/ui/button';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import { useState } from 'react';
// import type { TournamentFormValues } from '../';
// import { Loader2, X } from 'lucide-react';
// import { Modal } from '../dialog';
// import { DialogInput } from './organizers';
// import { toast } from 'sonner';
// import { useGetUserDetails } from '@/lib/hooks/use-user/use-users-details';
// import { getName } from '@/lib/utils';

// export default function ScorePermissionsStep() {
//   const { watch, setValue, formState } = useFormContext<TournamentFormValues>();
//   const players = watch('players');
//   const teams = watch('teams');
//   const permissions = watch('scorePermissions') ?? [];

//   const [open, setOpen] = useState(false);

//   const [competitorTeamId, setCompetitorTeamId] = useState('');
//   const [competitor, setCompetitor] = useState('');
//   const [markerTeamId, setMarkerTeamId] = useState('');
//   const [marker, setMarker] = useState('');

//   const playerIds = players?.map((e) => e?.user_id) as string[];
//   const { usersArray: users, usersMap, loading } = useGetUserDetails(playerIds);

//   const isTeamMatch = Array.isArray(teams) && teams.length > 0;

//   const handleAdd = () => {
//     if (!competitor || !marker) {
//       toast.error('Both competitor and marker are required');
//       return;
//     }

//     if (competitor === marker) {
//       toast.error("A player can't mark their own score");
//       return;
//     }

//     const exists = permissions.some(
//       (p: any) =>
//         p.player_id_competitor === competitor && p.player_id_marker === marker
//     );
//     if (exists) {
//       toast.error('Permission already added');
//       return;
//     }

//     const newPermission = {
//       player_id_competitor: competitor,
//       player_id_marker: marker,
//     };

//     setValue('scorePermissions', [...permissions, newPermission]);

//     setCompetitor('');
//     setMarker('');
//     setCompetitorTeamId('');
//     setMarkerTeamId('');
//   };

//   const handleRemove = (index: number) => {
//     const updated = [...permissions];
//     updated.splice(index, 1);
//     setValue('scorePermissions', updated);
//   };

//   const getUName = (uid?: string) => {
//     const user = users?.find((u) => u.userid === uid);
//     return getName(user?.first_name, user?.last_name) || 'Unknown';
//   };

//   return (
//     <div className="space-y-6">
//       {/* <h2 className="text-2xl font-bold border-b p-2 my-2">
//         Manage Permissions
//       </h2> */}
//       <FormItem>
//         <FormLabel>Score Permission</FormLabel>
//         <DialogInput
//           data={permissions}
//           emptyTitle="No permission added"
//           setOpen={() => setOpen(true)}
//           title="permission added"
//           className={
//             players.length < 1
//               ? 'bg-gray-200 cursor-auto'
//               : 'cursor-pointer bg-transparent'
//           }
//         />

//         {/* <div className="p-3 bg-gray-100 rounded-md text-xs font-mono whitespace-pre-wrap">
//           <h3 className="font-bold mb-1 text-gray-800">Error Preview:</h3>
//           {JSON.stringify(formState.errors, null, 2)}
//         </div>
//         <Button>Check</Button> */}

//         <Modal
//           title="Add New Permission"
//           description="Select score permission assignment"
//           open={open && players?.length > 0}
//           setOpen={() => setOpen(false)}
//         >
//           <div className="space-y-3">
//             {isTeamMatch ? (
//               <>
//                 {/* Competitor Team */}
//                 <Select
//                   value={competitorTeamId}
//                   onValueChange={(v) => {
//                     setCompetitorTeamId(v);
//                     setCompetitor('');
//                     setMarkerTeamId('');
//                     setMarker('');
//                   }}
//                 >
//                   <SelectTrigger className="w-[220px]">
//                     <SelectValue placeholder="Competitor Team" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {teams?.map((team) => (
//                       <SelectItem key={team.team_name} value={team.team_name}>
//                         {team.team_name}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>

//                 {/* Competitor Player */}
//                 <Select
//                   value={competitor}
//                   onValueChange={(v) => {
//                     setCompetitor(v);
//                     setMarkerTeamId('');
//                     setMarker('');
//                   }}
//                   disabled={!competitorTeamId}
//                 >
//                   <SelectTrigger className="w-[220px]">
//                     <SelectValue placeholder="Competitor Player" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {competitorTeamId &&
//                       teams
//                         .find((t) => t.team_name === competitorTeamId)
//                         ?.team_player.map((pid) => {
//                           const u = usersMap[pid];
//                           return (
//                             <SelectItem key={pid} value={pid}>
//                               {getName(u?.first_name, u?.last_name)}
//                             </SelectItem>
//                           );
//                         })}
//                   </SelectContent>
//                 </Select>

//                 {/* Marker Team */}
//                 <Select
//                   value={markerTeamId}
//                   onValueChange={(v) => {
//                     setMarkerTeamId(v);
//                     setMarker('');
//                   }}
//                   disabled={!competitor}
//                 >
//                   <SelectTrigger className="w-[220px]">
//                     <SelectValue placeholder="Marker Team" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {teams
//                       .filter((t) => t.team_name !== competitorTeamId)
//                       .map((team) => (
//                         <SelectItem key={team.team_name} value={team.team_name}>
//                           {team.team_name}
//                         </SelectItem>
//                       ))}
//                   </SelectContent>
//                 </Select>

//                 {/* Marker Player
//                 <Select
//                   value={marker}
//                   onValueChange={setMarker}
//                   disabled={!markerTeamId}
//                 >
//                   <SelectTrigger className="w-[220px]">
//                     <SelectValue placeholder="Marker Player" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {markerTeamId &&
//                       teams
//                         .find((t) => t.team_name === markerTeamId)
//                         ?.team_player.map((pid) => {
//                           const u = usersMap[pid];
//                           return (
//                             <SelectItem key={pid} value={pid}>
//                               {getName(u?.first_name, u?.last_name)}
//                             </SelectItem>
//                           );
//                         })}
//                   </SelectContent>
//                 </Select> */}
//               </>
//             ) : (
//               /* SINGLE PLAYER MODE */
//               <div className="grid grid-cols-2 gap-3">
//                 <Select value={competitor} onValueChange={setCompetitor}>
//                   <SelectTrigger className="w-[180px]">
//                     <SelectValue placeholder="Competitor" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {loading ? (
//                       <Loader2 className="animate-spin" />
//                     ) : (
//                       users?.map((p) => (
//                         <SelectItem key={p.userid} value={p.userid ?? ''}>
//                           {getName(p.first_name, p.last_name)}
//                         </SelectItem>
//                       ))
//                     )}
//                   </SelectContent>
//                 </Select>

//                 <Select
//                   value={marker}
//                   onValueChange={setMarker}
//                   disabled={!competitor}
//                 >
//                   <SelectTrigger className="w-[180px]">
//                     <SelectValue placeholder="Marker" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {loading ? (
//                       <Loader2 className="animate-spin" />
//                     ) : (
//                       users
//                         ?.filter((e) => e?.userid !== competitor)
//                         ?.map((u, i) => (
//                           <SelectItem
//                             key={u.userid || i}
//                             value={u?.userid as string}
//                           >
//                             {getName(u.first_name, u.last_name)}
//                           </SelectItem>
//                         ))
//                     )}
//                   </SelectContent>
//                 </Select>
//               </div>
//             )}

//             <Button onClick={handleAdd} className="w-full mt-3">
//               Add
//             </Button>
//           </div>
//         </Modal>
//       </FormItem>

//       <div className="space-y-2">
//         {permissions.length > 0 ? (
//           <ul className="max-h-28 overflow-y-auto divide-y rounded border">
//             {permissions.map((perm, idx) => (
//               <li
//                 key={idx}
//                 className="flex items-center justify-between p-2 text-sm"
//               >
//                 <span>
//                   <span className="font-medium">
//                     {getUName(perm.player_id_marker)}
//                   </span>{' '}
//                   can add score for{' '}
//                   <span className="font-medium">
//                     {getUName(perm.player_id_competitor)}
//                   </span>
//                 </span>
//                 <Button
//                   type="button"
//                   variant="ghost"
//                   size="icon"
//                   onClick={() => handleRemove(idx)}
//                 >
//                   <X className="h-4 w-4" />
//                 </Button>
//               </li>
//             ))}
//           </ul>
//         ) : (
//           <p className="text-sm text-muted-foreground">
//             No permissions added yet
//           </p>
//         )}
//       </div>
//     </div>
//   );
// }

'use client';

import { useFormContext } from 'react-hook-form';
import { FormItem, FormLabel } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEffect, useState } from 'react';
import type { TournamentFormValues } from '../';
import { Loader2, X } from 'lucide-react';
import { Modal } from '../dialog';
import { DialogInput } from './organizers';
import { toast } from 'sonner';
import { useGetUserDetails } from '@/lib/hooks/use-user/use-users-details';
import { getName } from '@/lib/utils';
import type { Team } from '../../_interface';
import { Icon } from '@/components/ui';
import { useAppSelector } from '@/lib';

export default function ScorePermissionsStep() {
  const { watch, setValue, formState } = useFormContext<TournamentFormValues>();
  const players = watch('players');
  const permissions = watch('scorePermissions') ?? [];
  const teams = watch('teams') ?? [];
  const coOrganizers = watch('co_organizers') ?? [];
  const [marker, setMarker] = useState('');
  const organizerId = useAppSelector((s) => s.auth?.user?.userid);
  const excludedIds = new Set([organizerId, ...coOrganizers].filter(Boolean) as string[]);

  const [open, setOpen] = useState(false);

  const [competitorTeamId, setCompetitorTeamId] = useState('');
  const [competitor, setCompetitor] = useState('');
  const [markerTeamId, setMarkerTeamId] = useState('');
  const isTeamMatch = teams.length > 0;

  const playerIds = players?.map((e) => e?.user_id) || [];
  const { usersArray: users, usersMap, loading } = useGetUserDetails(playerIds);

  // Clean up stale permissions for removed players and co-organizers/organizer
  // Co-organizers & organizer already have full rights, so their permissions are redundant
  useEffect(() => {
    const playerIdSet = new Set(playerIds);
    if (!isTeamMatch && permissions.length > 0) {
      const valid = permissions.filter(
        (p) =>
          playerIdSet.has(p.player_id_marker) &&
          playerIdSet.has(p.player_id_competitor) &&
          !excludedIds.has(p.player_id_marker)
      );
      if (valid.length !== permissions.length) {
        setValue('scorePermissions', valid);
      }
    }
    if (isTeamMatch && teams.length > 0) {
      // Remove team_admin_id entries for players no longer in the tournament or now co-organizers
      const needsUpdate = teams.some((t) =>
        t.team_admin_id.some((id) => !playerIdSet.has(id) || excludedIds.has(id))
      );
      if (needsUpdate) {
        const updatedTeams = teams.map((t) => ({
          ...t,
          team_admin_id: t.team_admin_id.filter((id) => playerIdSet.has(id) && !excludedIds.has(id)),
        }));
        setValue('teams', updatedTeams);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerIds.join(','), coOrganizers.join(','), organizerId]);

  const getUName = (uid?: string) => {
    const player = players?.find((p) => p.user_id === uid);
    if (player?.name) return player.name;
    const user = users?.find((u) => u.userid === uid);
    return getName(user?.first_name, user?.last_name) || 'Unknown';
  };

  // TEAM MODE — add player into another team's team_admin_id
  const handleAddTeamMode = () => {
    if (!competitorTeamId || !competitor || !markerTeamId) {
      toast.error('Please select all fields');
      return;
    }

    const targetTeamIndex = teams.findIndex(
      (t: Team) => t.team_name === markerTeamId
    );
    if (targetTeamIndex === -1) return;

    const targetTeam = teams[targetTeamIndex];

    if (targetTeam.team_admin_id.includes(competitor)) {
      toast.error('Already added');
      return;
    }

    const updatedTeam = {
      ...targetTeam,
      team_admin_id: [...targetTeam.team_admin_id, competitor],
    };

    const updatedTeams = [...teams];
    updatedTeams[targetTeamIndex] = updatedTeam;

    setValue('teams', updatedTeams);

    setCompetitor('');
    setMarkerTeamId('');
    setCompetitorTeamId('');
  };

  const handleRemoveTeamPermission = (teamName: string, userId: string) => {
    const updated = teams.map((t) =>
      t.team_name === teamName
        ? { ...t, team_admin_id: t.team_admin_id.filter((id) => id !== userId) }
        : t
    );

    setValue('teams', updated);
  };

  const handleAddSingleMode = () => {
    console.log('single', competitor, marker);

    if (!competitor || !marker) {
      toast.error('Both competitor and marker are required');
      return;
    }

    if (competitor === marker) {
      toast.error("A player can't mark their own score");
      return;
    }

    const exists = permissions.some(
      (p) =>
        p.player_id_marker === competitor && p.player_id_competitor === marker
    );
    if (exists) {
      toast.error('Permission already added');
      return;
    }

    setValue('scorePermissions', [
      ...permissions,
      {
        player_id_marker: competitor,
        player_id_competitor: marker,
      },
    ]);

    setCompetitor('');
    setMarkerTeamId('');
  };

  const handleAdd = () => {
    if (isTeamMatch) handleAddTeamMode();
    else handleAddSingleMode();
  };

  const handleRemove = (index: number) => {
    const updated = [...permissions];
    updated.splice(index, 1);
    setValue('scorePermissions', updated);
  };

  return (
    <div className="space-y-6">
      <FormItem>
        <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Score Permissions
        </FormLabel>

        <DialogInput
          data={permissions}
          emptyTitle="Tap to assign score permissions"
          setOpen={() => setOpen(true)}
          title="permissions added"
          className={players.length < 1 ? 'opacity-50 pointer-events-none' : ''}
        />

        <Modal
          title="Add New Permission"
          description="Select score permission assignment"
          open={open}
          setOpen={() => setOpen(false)}
        >
          <div className="space-y-3">
            {isTeamMatch ? (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Player&apos;s Team</label>
                  <Select
                    value={competitorTeamId}
                    onValueChange={(v) => {
                      setCompetitorTeamId(v);
                      setCompetitor('');
                      setMarkerTeamId('');
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select team the player belongs to" />
                    </SelectTrigger>
                    <SelectContent className="z-[10002]" style={{ zIndex: 10002 }}>
                      {teams.map((t) => (
                        <SelectItem key={t.team_name} value={t.team_name}>
                          {t.team_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Player who will add scores</label>
                  <Select
                    value={competitor}
                    onValueChange={setCompetitor}
                    disabled={!competitorTeamId}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select player" />
                    </SelectTrigger>
                    <SelectContent className="z-[10002]" style={{ zIndex: 10002 }}>
                      {teams
                        .find((t) => t.team_name === competitorTeamId)
                        ?.team_player
                        .filter((pid) => !excludedIds.has(pid))
                        .map((pid) => {
                          const u = usersMap[pid];
                          return (
                            <SelectItem key={pid} value={pid}>
                              {u ? getName(u.first_name, u.last_name) : pid}
                            </SelectItem>
                          );
                        })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Team they can add score for</label>
                  <Select
                    value={markerTeamId}
                    onValueChange={setMarkerTeamId}
                    disabled={!competitor}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select target team" />
                    </SelectTrigger>
                    <SelectContent className="z-[10002]" style={{ zIndex: 10002 }}>
                      {teams
                        .map((team) => (
                          <SelectItem key={team.team_name} value={team.team_name}>
                            {team.team_name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Player who will add scores</label>
                  <Select value={competitor} onValueChange={(v) => { setCompetitor(v); setMarker(''); }}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select player" />
                    </SelectTrigger>
                    <SelectContent className="z-[10002]" style={{ zIndex: 10002 }}>
                      {loading ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="animate-spin text-muted-foreground" />
                        </div>
                      ) : users?.length ? (
                        users
                          .filter((p) => !excludedIds.has(p.userid as string) && !permissions.some((perm) => perm.player_id_marker === p.userid))
                          .map((p) => (
                            <SelectItem key={p.userid} value={p.userid || ''}>
                              {getName(p.first_name, p.last_name)}
                            </SelectItem>
                          ))
                      ) : (
                        <div className="text-muted-foreground text-sm p-4">
                          No players added yet. Add players in the Players step first.
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Player they can add score for</label>
                  <Select
                    value={marker}
                    onValueChange={(v) => setMarker(v)}
                    disabled={!competitor}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select player" />
                    </SelectTrigger>
                    <SelectContent className="z-[10002]" style={{ zIndex: 10002 }}>
                      {loading ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="animate-spin text-muted-foreground" />
                        </div>
                      ) : users?.length ? (
                        users
                          .filter((u) => u.userid !== competitor && !permissions.some((perm) => perm.player_id_competitor === u.userid))
                          .map((u) => (
                            <SelectItem key={u.userid} value={u?.userid as string}>
                              {getName(u.first_name, u.last_name)}
                            </SelectItem>
                          ))
                      ) : (
                        <div className="text-muted-foreground text-sm p-4">
                          No players added yet.
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <Button onClick={handleAdd} className="w-full mt-3">
              Add
            </Button>
          </div>
        </Modal>
      </FormItem>

      {isTeamMatch && (
        <div className="space-y-2 mt-1">
          {teams.some((t) => t.team_admin_id.length > 0) ? (
            <ul className="space-y-1.5">
              {teams.map((team) =>
                team.team_admin_id.map((pid) => {
                  const user = usersMap[pid];
                  return (
                    <li
                      key={pid + team.team_name}
                      className="flex items-center justify-between px-3 py-2 rounded-xl bg-muted/40 border border-border/40 text-sm"
                    >
                      <span className="text-xs">
                        <span className="font-semibold">
                          {getName(user?.first_name, user?.last_name)}
                        </span>{' '}
                        <span className="text-muted-foreground">can add score for</span>{' '}
                        <span className="font-semibold text-primary">
                          {team.team_name}
                        </span>
                      </span>
                      <Icon
                        name="bin"
                        onClick={() =>
                          handleRemoveTeamPermission(team?.team_name, pid)
                        }
                        className="size-3.5 cursor-pointer text-red-500 hover:text-red-600 shrink-0"
                      />
                    </li>
                  );
                })
              )}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">No permissions assigned yet</p>
          )}
        </div>
      )}

      {!isTeamMatch && (
        <div className="space-y-2 mt-1">
          {permissions.length ? (
            <ul className="space-y-1.5">
              {permissions.map((perm, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-muted/40 border border-border/40"
                >
                  <span className="text-xs">
                    <span className="font-semibold">
                      {getUName(perm.player_id_marker)}
                    </span>{' '}
                    <span className="text-muted-foreground">can add score for</span>{' '}
                    <span className="font-semibold text-primary">
                      {getUName(perm.player_id_competitor)}
                    </span>
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6 text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleRemove(idx)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">No permissions assigned yet</p>
          )}
        </div>
      )}
      {/* <div className="p-3 bg-gray-100 rounded-md text-xs font-mono whitespace-pre-wrap">
        <h3 className="font-bold mb-1 text-gray-800">Error Preview:</h3>
        {JSON.stringify(formState.errors, null, 2)}
      </div> */}
    </div>
  );
}

// 'use client';

// import { useFormContext } from 'react-hook-form';
// import { FormItem, FormLabel } from '@/components/ui/form';
// import { Button } from '@/components/ui/button';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import { useState } from 'react';
// import type { TournamentFormValues } from '../';
// import { Loader2, X } from 'lucide-react';
// import { Modal } from '../dialog';
// import { DialogInput } from './organizers';
// import { toast } from 'sonner';
// import { useGetUserDetails } from '@/lib/hooks/use-user/use-users-details';
// import { Badge } from '@/components/ui';
// import { getName } from '@/lib/utils';
// import { IPlayer } from '../../_interface';

// export default function ScorePermissionsStep() {
//   const { watch, setValue } = useFormContext<TournamentFormValues>();
//   const players = watch('players');
//   const teams = watch('teams');
//   const permissions = watch('scorePermissions') ?? [];
//   const [open, setOpen] = useState(false);

//   const [competitor, setCompetitor] = useState('');
//   const [marker, setMarker] = useState('');

//   const playerIds = players?.map((e: IPlayer) => e?.user_id) as string[];

//   const { usersArray: users, usersMap, loading } = useGetUserDetails(playerIds);

//   // find team of competitor
//   const getCompetitorTeam = (competitorId: string) => {
//     return teams?.find((t) => t.team_player.includes(competitorId));
//   };

//   const competitorTeam = competitor ? getCompetitorTeam(competitor) : null;
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   const getUName = (player?: any, user?: any) =>
//     player?.name ||
//     [user?.first_name, user?.last_name].filter(Boolean).join(' ') ||
//     player?.email ||
//     user?.email ||
//     'Unknown';

//   const handleAdd = () => {
//     if (!competitor || !marker) {
//       toast.error('Both competitor and marker are required');
//       return;
//     }
//     if (competitor === marker) {
//       toast.error("A player can't mark their own score");
//       return;
//     }

//     const newPermission = {
//       player_id_competitor: competitor,
//       player_id_marker: marker,
//     };

//     setValue('scorePermissions', [...permissions, newPermission]);
//     setCompetitor('');
//     setMarker('');
//   };

//   const handleRemove = (index: number) => {
//     const updated = [...permissions];
//     updated.splice(index, 1);
//     setValue('scorePermissions', updated);
//   };

//   return (
//     <div className="space-y-6">
//       <FormItem>
//         <FormLabel>Score Permission</FormLabel>
//         <DialogInput
//           data={permissions}
//           emptyTitle="No permission added"
//           setOpen={() => setOpen(true)}
//           title="permission added"
//           className={
//             players.length < 1
//               ? 'bg-gray-200 cursor-auto'
//               : 'cursor-pointer bg-transparent'
//           }
//         />

//         <Modal
//           title="Add New Permission"
//           description="Select a marker for any specific competitor give them permission to add score"
//           open={open && players?.length > 0}
//           setOpen={() => setOpen(false)}
//         >
//           <div className="grid grid-cols-2 gap-3">
//             <Select value={competitor} onValueChange={setCompetitor}>
//               <SelectTrigger className="w-[180px]">
//                 <SelectValue placeholder="Competitor" />
//               </SelectTrigger>
//               <SelectContent style={{ zIndex: 9999 }}>
//                 {loading ? (
//                   <div className="flex items-center justify-center p-4">
//                     <Loader2 className="animate-spin text-muted-foreground" />
//                   </div>
//                 ) : users?.length ? (
//                   users?.map((p) => {
//                     const teamName = getCompetitorTeam(
//                       p?.userid ?? ''
//                     )?.team_name;
//                     return (
//                       <SelectItem key={p.userid} value={p.userid ?? ''}>
//                         <span className="truncate max-w-[150px]">
//                           {getName(p.first_name, p.last_name)}
//                         </span>
//                         {teamName && (
//                           <Badge
//                             variant="secondary"
//                             className="ml-4 shrink-0 text-[10px] px-2 py-0.5"
//                           >
//                             {teamName}
//                           </Badge>
//                         )}
//                       </SelectItem>
//                     );
//                   })
//                 ) : (
//                   <div className="text-muted-foreground text-sm p-4">
//                     No competitor players found
//                   </div>
//                 )}
//               </SelectContent>
//             </Select>

//             <Select
//               value={marker}
//               onValueChange={setMarker}
//               disabled={!competitor}
//             >
//               <SelectTrigger className="w-[180px]">
//                 <SelectValue
//                   placeholder={
//                     competitor
//                       ? `Marker for ${users?.find((e) => e.userid === competitor)?.first_name}`
//                       : 'Marker'
//                   }
//                   title={`Marker for ${users?.find((e) => e.userid === competitor)?.first_name}`}
//                 />
//               </SelectTrigger>
//               <SelectContent style={{ zIndex: 9999 }}>
//                 {loading ? (
//                   <div className="flex items-center justify-center p-4">
//                     <Loader2 className="animate-spin text-muted-foreground" />
//                   </div>
//                 ) : competitor ? (
//                   competitorTeam ? (
//                     competitorTeam.team_player
//                       .filter((pid) => pid !== competitor) // competitor can’t be their own marker
//                       .map((pid) => {
//                         const p = usersMap[pid];
//                         return (
//                           <SelectItem key={pid} value={pid}>
//                             <div className="flex items-center gap-2">
//                               <span>
//                                 {getName(p?.first_name, p?.last_name)}
//                               </span>
//                               <span className="ml-auto rounded bg-muted px-2 py-0.5 text-xs">
//                                 {competitorTeam.team_name}
//                               </span>
//                             </div>
//                           </SelectItem>
//                         );
//                       })
//                   ) : (
//                     users
//                       ?.filter((e) => e?.userid !== competitor)
//                       ?.map((u, index) => (
//                         <SelectItem key={u?.userid || index} value={u?.userid!}>
//                           <div className="flex items-center gap-2">
//                             <span>{getName(u?.first_name, u?.last_name)}</span>
//                           </div>
//                         </SelectItem>
//                       ))
//                   )
//                 ) : (
//                   <div className="text-muted-foreground text-sm p-4">
//                     Select a competitor first
//                   </div>
//                 )}
//               </SelectContent>
//             </Select>
//           </div>
//           <Button onClick={handleAdd}>Add</Button>
//         </Modal>
//       </FormItem>

//       {/* Permission list (compact badge style) */}
//       <div className="space-y-2">
//         {permissions.length > 0 ? (
//           <ul className="max-h-28 overflow-y-auto divide-y divide-border rounded border">
//             {permissions.map((perm, idx) => {
//               const competitorPlayer = players.find(
//                 (p) => p.user_id === perm.player_id_competitor
//               );
//               const competitorUser = users?.find(
//                 (u) => u.userid === perm.player_id_competitor
//               );

//               const markerPlayer = players.find(
//                 (p) => p.user_id === perm.player_id_marker
//               );
//               const markerUser = users?.find(
//                 (u) => u.userid === perm.player_id_marker
//               );

//               return (
//                 <li
//                   key={idx}
//                   className="flex items-center justify-between p-2 text-sm"
//                 >
//                   <span>
//                     <span className="font-medium">
//                       {getUName(markerPlayer, markerUser)}
//                     </span>{' '}
//                     <span className="text-muted-foreground">
//                       can add score for
//                     </span>{' '}
//                     <span className="font-medium">
//                       {getUName(competitorPlayer, competitorUser)}
//                     </span>
//                   </span>
//                   <Button
//                     type="button"
//                     variant="ghost"
//                     size="icon"
//                     onClick={() => handleRemove(idx)}
//                   >
//                     <X className="h-4 w-4" />
//                   </Button>
//                 </li>
//               );
//             })}
//           </ul>
//         ) : (
//           <p className="text-sm text-muted-foreground">
//             No permissions added yet
//           </p>
//         )}
//       </div>
//     </div>
//   );
// }
