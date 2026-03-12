import type {
  CreateTournamentInput,
  EditTournamentInput,
  ScorePermission,
  ScoringMethod,
  Tournament,
  TournamentTeam,
  User,
} from '@/lib/definitions';
import type { TournamentFormValues } from './create';
import { format } from 'date-fns';
import type { IPlayer } from './_interface';

/**
 * Offset a Date so date-fns `format()` outputs UTC values.
 * Use this whenever displaying timestamps that the backend stores as UTC.
 */
export function toUTC(date: Date): Date {
  return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
}

// export function buildRecipientInput(
//   data: TournamentFormValues
// ): RecipientTournamentInput {
//   return {
//     co_organizer_email: data?.co_organizers.map((o) => o.email!),
//     player_email: data?.players.map((p) => p.email!),
//   };
// }

export function buildCreateInput(
  data: TournamentFormValues
): CreateTournamentInput {
  return {
    name: data.name,
    description: data.description,
    coursename: data.coursename,
    id_course: data.id_course,
    scoring_method: data.scoring_method,
    start_time: new Date(data.start_time).toISOString(),
    end_time: new Date(data.end_time).toISOString(),
    rounds: Number(data.rounds),
    rounds_time: data?.rounds_times?.map((r) =>
      format(new Date(r), 'yyyy-MM-dd HH:mm:ss')
    ),
    tee_interval: data.tee_interval,
    players: data.players?.map((p) => {
      const hasHcp = p?.hcp != null && !isNaN(Number(p.hcp));
      const hcp = hasHcp ? Number(p.hcp) : undefined;
      return {
        user_id: p.user_id,
        tee: p?.tee,
        tee_order: p?.tee_order,
        hcp_percentage: hcp != null && hcp >= 1 ? p?.hcp_percentage : undefined,
        gender: p?.gender || 'OTHER',
        ...(hcp != null ? { hcp } : {}),
      };
    }),
    co_organizers: data?.co_organizers?.length ? data.co_organizers : [],
    teams:
      data.teams?.length === 0
        ? null
        : data?.teams?.map(({ team_player, team_admin_id, team_name }) => ({
          team_name,
          team_player: team_player ?? [],
          team_admin_id: team_admin_id ?? [],
        })),
    organizer_name: data.organizer_name,
  };
}

export function buildEditInput(
  data: TournamentFormValues,
  created: string,
  id: string,
): EditTournamentInput {
  return {
    created,
    tournament_id: id,
    ...buildCreateInput(data),
  };
}

type methods = 'STROKEPLAY' | 'STABLEFORD' | 'SCRAMBLE' | 'BESTBALL';

export function mapTournamentToForm(
  t: Tournament,
  team: TournamentTeam[],
  score: ScorePermission[],
  usersMap?: Record<string, User>
): TournamentFormValues {
  // parse players
  const rawPlayers = t.players
    ? typeof t.players === 'string'
      ? JSON.parse(t.players)
      : t.players
    : [];

  const players: IPlayer[] = rawPlayers.map((p: IPlayer) => {
    const u = usersMap?.[p.user_id];
    const name = [u?.first_name, u?.last_name].filter(Boolean).join(' ') ?? '';
    const email = u?.email ?? p.email ?? '';
    return {
      user_id: p?.user_id,
      hcp: Number(p?.hcp),
      email,
      name,
      gender: p?.gender,
      tee: p?.tee, // BE data required to update
      tee_order: p?.tee_order, // BE data required to update
      hcp_percentage: p?.hcp_percentage, // BE data required to update
    };
  });

  // const co_organizers = (t.co_organizers || []).map((id: string) => {
  //   const u = usersMap?.[id];
  //   const email = u?.email!;
  //   return { user_id: id, email };
  // });

  return {
    created: t?.created,
    tournament_id: t?.tournament_id,
    name: t?.name,
    play_organizer: Boolean(players?.find((f) => f?.user_id === t?.user_id)), // BE data required to update
    rounds_times: t?.rounds_time?.map((r) =>
      format(new Date(r), "yyyy-MM-dd'T'HH:mm")
    ),
    description: t?.description,
    coursename: t?.coursename,
    automate_rounds: false,
    round_delay_hours: 2,
    id_course: t?.id_course,
    scoring_method: (t?.scoring_method ?? 'STROKEPLAY') as methods,
    start_time: format(new Date(+t?.start_time), "yyyy-MM-dd'T'HH:mm"),
    end_time: format(new Date(+t?.end_time), "yyyy-MM-dd'T'HH:mm"),
    rounds: String(t?.rounds) ?? '1',
    tee_interval: t?.tee_interval ?? 2,
    players,
    teams: team?.map(({ team_player, team_admin_id, team_name }) => ({
      team_name,
      team_player: team_player ?? [],
      team_admin_id: team_admin_id ?? [],
      tee_marker: [],
      tee_color: [],
    })),
    scorePermissions: score?.map(
      ({ player_id_marker, player_id_competitor }) => ({
        player_id_competitor,
        player_id_marker,
      })
    ),
    co_organizers: typeof t?.co_organizers === 'string'
      ? (t.co_organizers as string).split(',').filter(Boolean)
      : t?.co_organizers ?? [],
    organizer_name: t.organizer_name,
  };
}

type Methods = {
  title: methods;
  description: string;
};

export const scoringMethods: Methods[] = [
  {
    title: 'STROKEPLAY',
    description:
      'Every stroke counts. Each player adds up all their shots for the round, and the lowest total wins. Simple and straightforward — but one bad hole can hurt your score just as much as any other.',
  },
  {
    title: 'STABLEFORD',
    description:
      'Points instead of strokes. Good holes (like birdies and pars) give points, while bad holes cost fewer. It keeps the game fun and competitive even if you mess up on one or two holes.',
  },
  {
    title: 'SCRAMBLE',
    description:
      'A team game. Everyone hits, then you pick the best shot and all play from there until the ball is holed. Fast, social, and perfect for groups with mixed skill levels.',
  },
  {
    title: 'BESTBALL',
    description:
      'Each player plays their own ball, but only the lowest score on the hole counts for the team. It rewards strong shots while letting teammates cover for each other.',
  },
];

interface MinDateTimeConstraints {
  minDate: string;
  minTime: string | undefined;
}

export const getMinConstraints = (
  referenceDate?: Date | number | string
): MinDateTimeConstraints => {
  const now = referenceDate ? new Date(referenceDate) : new Date();
  const minDate = format(now, 'yyyy-MM-dd');
  const minTime = format(now, 'HH:mm');
  return {
    minDate,
    minTime,
  };
};

export const getScoreMethodLabel = (method: ScoringMethod) => {
  switch (method) {
    case 'STROKEPLAY':
      return 'Stroke Play';
    case 'BESTBALL':
      return 'Best Ball';
    case 'SCRAMBLE':
      return 'Scramble';
    case 'STABLEFORD':
      return 'Stable Ford';
    default:
      return;
  }
};
