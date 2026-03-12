'use client';

import type { Resolver } from 'react-hook-form';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { useTournament } from '@/lib/hooks/use-tournament';
import { buildCreateInput, buildEditInput } from '../helper';
import FormSteps from './steps';
import { Modal } from './dialog';
import type { RecipientTournamentInput } from '@/lib/definitions';
import { Trophy } from 'lucide-react';

const playerSchema = z.object({
  user_id: z.string(),
  email: z.string().email().optional(),
  hcp: z.number().optional(),
  gender: z.enum(['', 'MALE', 'FEMALE', 'OTHER']),
  name: z.string(),
  photo: z.string().optional(),
  tee: z.string(),
  tee_order: z.string(),
  tee_color: z.string().optional(),
  hcp_percentage: z
    .number()
    .min(0, 'HCP percentage must be between 0 and 100')
    .max(100, 'HCP percentage must be between 0 and 100')
    .transform((v) => Math.min(100, Math.max(0, Math.round(v))))
    .default(100),
});

const teamSchema = z.object({
  team_name: z.string(),
  tee_marker: z.array(z.string()),
  tee_color: z.array(z.string()),
  team_admin_id: z.array(z.string()),
  team_player: z.array(z.string()),
});

const scorePermissionSchema = z.object({
  player_id_competitor: z.string(),
  player_id_marker: z.string(),
});

const userRecipients = {
  co_organizer_email: z.array(z.string()),
  player_email: z.array(z.string()),
};

export const tournamentSchema = z
  .object({
    name: z.string().min(1, 'Tournament name is required'),
    created: z.string().optional(),
    tournament_id: z.string().optional(),
    organizer_name: z.string().min(1, 'Name is required'),
    play_organizer: z.boolean().optional(),
    description: z.string().optional(),
    coursename: z.string().min(1, 'Course name is required'),
    id_course: z.string().min(1, 'Course ID is required'),
    scoring_method: z.enum([
      'STROKEPLAY',
      'STABLEFORD',
      'SCRAMBLE',
      'BESTBALL',
    ]),
    start_time: z.string().min(1, 'Start time is required'),
    end_time: z.string().min(1, 'End time is required'),
    rounds: z.string().min(1, 'Rounds required'),
    rounds_times: z.array(z.string()).default([]),
    automate_rounds: z.boolean().optional(),
    round_delay_hours: z.number().optional(),
    tee_interval: z.number().int('Tee interval must be a whole number').min(2, 'Tee interval must be greater than or equal to 2'),
    co_organizers: z.array(z.string()),
    scorePermissions: z.array(scorePermissionSchema).optional(),
    recipients: z.object(userRecipients).optional(),
    players: z.array(playerSchema).min(2, 'At least 2 players are required'),
    teams: z.array(teamSchema).optional(),
  })
  .refine(
    (data) => Number(data.rounds) <= 1 || data.rounds_times.length > 0,
    {
      message: 'Rounds times are required when rounds > 1',
      path: ['rounds_times'],
    }
  )
  .refine(
    (data) => {
      if (['SCRAMBLE', 'BESTBALL'].includes(data.scoring_method)) {
        return (
          data.teams &&
          data.teams.length >= 2 &&
          data.teams.every((t) => t.team_player.length >= 2)
        );
      }
      return true;
    },
    {
      message: 'At least 2 teams with 2+ players each are required',
      path: ['teams'],
    }
  );

export type TournamentFormValues = z.infer<typeof tournamentSchema>;

export default function CreateTournamentWizard({
  initialData,
  refetchGames,
  close,
}: {
  initialData?: TournamentFormValues;
  close: () => void;
  refetchGames: () => void;
}) {
  const { createGame, editGame, status } = useTournament();

  const methods = useForm<TournamentFormValues>({
    resolver: zodResolver(tournamentSchema) as Resolver<TournamentFormValues>,
    reValidateMode: 'onSubmit',
    mode: 'onChange',
    shouldUnregister: false,
    defaultValues: initialData || {
      name: '',
      organizer_name: '',
      play_organizer: false,
      description: '',
      scoring_method: 'STROKEPLAY',
      coursename: '',
      id_course: '',
      start_time: '',
      end_time: '',
      rounds: '1',
      automate_rounds: true,
      round_delay_hours: 2,
      rounds_times: [],
      tee_interval: 2,
      co_organizers: [],
      players: [],
      teams: [],
      scorePermissions: [],
    },
  });

  useEffect(() => {
    if (initialData) {
      methods.reset(initialData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  const onSubmit = async (data: TournamentFormValues) => {
    try {
      // Team mode: permissions live in team_admin_id on each team, no scorePermissions needed
      // Single mode: use scorePermissions array
      const isTeamMode = (data.teams ?? []).length > 0;
      const scorePerms = isTeamMode ? [] : data.scorePermissions ?? [];

      if (!!initialData) {
        await editGame({
          variables: {
            editInput: buildEditInput(data, initialData?.created!, initialData?.tournament_id!),
            recepientInput: data?.recipients as RecipientTournamentInput,
            score: scorePerms,
          },
        });
        await refetchGames?.();
        toast.success('Tournament updated successfully!');
      } else {
        await createGame({
          variables: {
            createInput: buildCreateInput(data),
            recepientInput: data?.recipients,
            score: scorePerms,
          },
        });
        await refetchGames?.();
        toast.success('Tournament created successfully!');
      }
      close();
    } catch (error: any) {
      console.error('Tournament creation/update error:', error);
      const errorMessage =
        error?.graphQLErrors?.[0]?.message ||
        error?.message ||
        'An error occurred';
      toast.error(
        `Failed to ${initialData ? 'update' : 'create'} tournament: ${errorMessage}`
      );
    }
  };

  const load = status.create.loading || status.edit.loading;

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
            e.preventDefault();
          }
        }}
        className="flex flex-col h-full w-full overflow-hidden"
      >
        {/* Premium header */}
        <div className="shrink-0 bg-primary px-5 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
            <Trophy className="w-4.5 h-4.5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-white font-bold text-base leading-tight">
              {initialData ? 'Edit Tournament' : 'Create Tournament'}
            </h1>
            <p className="text-white/65 text-[11px] mt-0.5 truncate">
              {initialData ? 'Update the tournament details' : 'Set up your local golf tournament'}
            </p>
          </div>
        </div>

        {/* Form content (steps) */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <FormSteps
            loading={load}
            initialData={initialData as TournamentFormValues}
          />
        </div>
      </form>
    </FormProvider>
  );
}
