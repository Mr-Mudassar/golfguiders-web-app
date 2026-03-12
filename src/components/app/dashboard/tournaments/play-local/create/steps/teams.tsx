'use client';

import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import UserSelectDialog from './select-user';
import type { TournamentFormValues } from '..';
import { useFetchGolfCourseCoordinates } from '@/lib/hooks/use-fetch-course';
import { getName } from '@/lib/utils';
import type { Team, UserSelectHandler } from '../../_interface';
import { TeamCard } from '../team-card';
import { Plus, Users, AlertCircle } from 'lucide-react';

export default function TeamsStep({
  setValid,
}: {
  setValid: (b: boolean) => void;
}) {
  const { watch, setValue } = useFormContext<TournamentFormValues>();
  const scoringMethod = watch('scoring_method');
  const teams = watch('teams') ?? [];
  const players = watch('players') ?? [];
  const { teeDetails } = useFetchGolfCourseCoordinates(watch('id_course'));

  const [showForm, setShowForm] = useState(false);
  const [openTeam, setOpenTeam] = useState<Team | null>(null);
  const [teamName, setTeamName] = useState('');
  const [teamMarker, setTeamMarker] = useState({ name: '', value: '' });

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
    // Also update team tee_marker/tee_color to match new course
    if (teeDetails?.length > 0 && teams.length > 0) {
      const firstTee = teeDetails[0];
      const needsUpdate = teams.some(
        (t) => !t.tee_marker?.length || t.tee_marker[0] !== firstTee.teecolorname
      );
      if (needsUpdate) {
        const updatedTeams = teams.map((t) => ({
          ...t,
          tee_marker: [firstTee.teecolorname],
          tee_color: [firstTee.teecolorvalue],
        }));
        setValue('teams', updatedTeams);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teeDetails]);

  const isTeamMatch =
    scoringMethod === 'SCRAMBLE' || scoringMethod === 'BESTBALL';

  useEffect(() => {
    if (
      isTeamMatch &&
      teams?.length >= 2 &&
      teams?.every((t) => t.team_player.length >= 2)
    ) {
      setValid(true);
    } else {
      setValid(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teams, watch, setValid, isTeamMatch]);

  if (!isTeamMatch) return;

  const handleAddTeam = () => {
    if (!teamName.trim()) return toast('Team name is required!');

    if (
      teams?.some(
        (t) => t?.team_name?.toLowerCase() === teamName?.toLowerCase()
      )
    )
      return toast('Team already exist');

    const newTeam: Team = {
      team_name: teamName.trim(),
      team_admin_id: [],
      team_player: [],
      tee_marker: [teamMarker.name],
      tee_color: [teamMarker.value],
    };

    setValue('teams', [...teams, newTeam]);
    setTeamName('');
    setTeamMarker({ name: '', value: '' });
    setShowForm(false);
  };

  const handleRemoveTeam = (index: number) => {
    const removedTeam = teams[index];
    const updatedTeams = [...teams];
    updatedTeams.splice(index, 1);
    setValue('teams', updatedTeams);
    // Remove players that were only in this team
    if (removedTeam?.team_player?.length) {
      const remainingTeamPlayerIds = new Set(
        updatedTeams.flatMap((t) => t.team_player)
      );
      setValue(
        'players',
        players.filter((p) => remainingTeamPlayerIds.has(p.user_id))
      );
    }
  };

  const handleRemovePlayerFromTeam = (teamName: string, userId: string) => {
    const updatedTeams = teams.map((t) =>
      t.team_name === teamName
        ? { ...t, team_player: t.team_player.filter((id) => id !== userId) }
        : t
    );
    setValue('teams', updatedTeams);
    // Remove from players if not in any other team
    const stillInATeam = updatedTeams.some((t) => t.team_player.includes(userId));
    if (!stillInATeam) {
      setValue('players', players.filter((p) => p.user_id !== userId));
    }
  };

  const handleTeamPlayerSelect: UserSelectHandler = (
    user,
    hcp,
    hcpPercent,
    teeMarker,
    type = 'add'
  ) => {
    if (!openTeam) return;

    const uid = user?.userid as string;
    const currentTeam = teams.find((t) => t.team_name === openTeam.team_name);
    const isCurrentlyInTeam = currentTeam?.team_player?.includes(uid);

    // Validate tee marker when adding (not when removing)
    if (!isCurrentlyInTeam && !teeMarker?.name) {
      toast.error('Please select a Team Tee before adding players');
      return;
    }

    const playerObj = {
      user_id: uid,
      name: getName(user.first_name, user.last_name),
      email: user.email,
      gender: teeMarker?.gen,
      hcp: hcp != null ? hcp * (hcpPercent / 100) : undefined,
      hcp_percentage: hcpPercent,
      tee: teeMarker?.name,
      tee_color: teeMarker?.value,
      tee_order: teeMarker?.order,
    };

    const updatedTeams = teams.map((team) => {
      if (team.team_name !== openTeam.team_name) return team;

      const inTeam = team.team_player.includes(uid);

      if (type === 'add' && inTeam) {
        return {
          ...team,
          team_player: team.team_player.filter((id) => id !== uid),
        };
      }

      if (!inTeam) {
        return { ...team, team_player: [...team.team_player, uid] };
      }
      return team;
    });

    setValue('teams', updatedTeams);

    const inTeamNow = updatedTeams
      .find((t) => t.team_name === openTeam.team_name)
      ?.team_player.includes(uid);

    const existingIndex = players?.findIndex((p) => p.user_id === uid);

    if (!inTeamNow) {
      setValue(
        'players',
        players?.filter((p) => p.user_id !== uid)
      );
      return;
    }

    if (existingIndex !== -1) {
      const updated = [...players];
      updated[existingIndex] = playerObj;
      setValue('players', updated);
      return;
    }
    setValue('players', [...players, playerObj]);
  };

  const courseSelected = watch('id_course') !== '';
  const needsMoreTeams = teams.length < 2;
  const hasTeamsWithFewPlayers = teams?.some((t) => t.team_player.length < 2);

  return (
    <>
      <div className="space-y-5">
        {/* Header info */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
          <Users className="w-5 h-5 text-primary shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              {scoringMethod === 'SCRAMBLE' ? 'Scramble' : 'Best Ball'} — Team Setup
            </p>
            <p className="text-xs text-muted-foreground">
              Create at least 2 teams with 2+ players each
            </p>
          </div>
        </div>

        {/* Create Team Section */}
        <FormField
          name="teams"
          render={() => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel className="text-sm font-semibold">
                  Teams
                  {teams.length > 0 && (
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      ({teams.length} created)
                    </span>
                  )}
                </FormLabel>
                {!showForm && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!courseSelected}
                    onClick={() => setShowForm(true)}
                    className="gap-1.5 h-8 text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Team
                  </Button>
                )}
              </div>

              {showForm && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 min-w-0">
                    <Input
                      placeholder="Team name"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTeam())}
                      className="h-9 w-full"
                      autoFocus
                    />
                  </div>
                  <Button type="button" size="sm" onClick={handleAddTeam} className="h-9 px-4 shrink-0">
                    Add
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => { setShowForm(false); setTeamName(''); }} className="h-9 shrink-0">
                    Cancel
                  </Button>
                </div>
              )}

              {!courseSelected && (
                <p className="text-xs text-amber-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" />
                  Select a golf course first to create teams
                </p>
              )}

              <FormMessage />

              {/* Validation messages */}
              {needsMoreTeams && teams.length > 0 && (
                <p className="text-xs text-amber-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" />
                  Minimum 2 teams are required to proceed
                </p>
              )}
              {hasTeamsWithFewPlayers && teams.length > 0 && (
                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" />
                  Each team needs at least 2 players
                </p>
              )}
            </FormItem>
          )}
        />

        {/* Teams list */}
        <div className="space-y-3">
          {teams.length > 0 ? (
            teams.map((team, index) => (
              <TeamCard
                key={team.team_name}
                index={index + 1}
                team={team}
                players={players}
                onRemove={() => handleRemoveTeam(index)}
                onEdit={() => setOpenTeam(team)}
                onRemovePlayer={(userId) => handleRemovePlayerFromTeam(team.team_name, userId)}
              />
            ))
          ) : (
            <div className="flex flex-col items-center gap-2 py-8 text-center border border-dashed border-border/60 rounded-xl">
              <Users className="w-8 h-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No teams created yet</p>
              <p className="text-xs text-muted-foreground/60">
                Add your first team to get started
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Edit / Add Players Dialog */}
      {openTeam && (
        <UserSelectDialog
          open={!!openTeam}
          onOpenChange={() => setOpenTeam(null)}
          isTeam={true}
          team={openTeam}
          teeData={teeDetails}
          onSelect={(user, hcp, hcpPercent, teeMarker) =>
            handleTeamPlayerSelect(user, hcp, hcpPercent, teeMarker)
          }
        />
      )}
    </>
  );
}
