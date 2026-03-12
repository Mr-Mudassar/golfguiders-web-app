// pro-leagues.interfaces.ts

export type ProTournaments = {
  tour: ProTournamentType;
  tournament_type: ProTournamentFormats | null;
  id: string;
  name: string;
  year: 2026;
  month: string;
  start_date: string;
  end_date: string;
  purse_amount: string;
  fedex_cup: string;
  status: ProTournamentStatus;
  previous_winner: string;
  winner_prize: string;
  tournament_url: string;
  tournament_logo: string;
  ticket_url: string;
  course: {
    name: string;
    city: string;
    state: string;
    country: string;
  };
};

export type ProTournamentDetail = {
  tour: string;
  tournament_type: null;
  id: string;
  name: string;
  year: number;
  month: string;
  start_date: string;
  end_date: string;
  purse_amount: string;
  fedex_cup: string;
  status: string;
  previous_winner: string;
  winner_prize: string;
  tournament_url: string;
  tournament_logo: string;
  ticket_url: string;
  course: {
    name: string;
    city: string;
    state: string;
    country: string;
    location: string;
  };
};

export interface LeaderboardItem {
  tour: string;
  tournament_id: string;
  tournament_name: string;
  tournament_type: ProTournamentFormats;
  start_date: string;
  end_date: string;
  status: string;
  year: number;
  leaderboard: LeaderBoardPlayer[] | [];
}

export type LeaderBoardPlayer = {
  player_id: string;
  player_name?: string;
  match_id?: string;
  team_id?: string;
  team_name?: string;
  first_name: string;
  last_name: string;
  position: string;
  total: string;
  to_par?: string;
  thru?: string;
  score?: string;
  r1?: number | string;
  r2?: number | string;
  r3?: number | string;
  r4?: number | string;
  strokes?: string | number;
  points?: number;
  prize_money?: string;
  projected?: string;
  starting?: string;
  country?: string;
  country_flag: string;
  player_url?: string;
  image_url?: string;
  is_following: boolean;
};
// ------------------------------

// STROKE_PLAY and STABLEFORD format
export interface StrokePlayEntry extends LeaderBoardPlayer {
  position: string;
  total: string;
  team_id?: string;
}
export interface TeamStrokeEntry extends LeaderBoardPlayer {
  team_id: string;
}

export interface TeamStroke {
  teamName: string;
  id: string;
  pos: string;
  players: TeamStrokeEntry[];
}

// TEAM_CUP format
export interface TeamCupEntry extends LeaderBoardPlayer {
  match_id: string;
  team_id: string;
  title: string;
  match_title: string;
  match_status: string;
  location_sort: number;
  team_name: string;
  team_score: string;
  team_color?: string;
  team_flag: string;
  team_status: string;
}
export interface TeamCupGroup {
  match_id: string;
  title: string;
  match_title: string;
  match_status: string;
  players: TeamCupEntry[];
}

export interface LeaderboardData {
  tour: string;
  tournament_type: ProTournamentFormats;
  tournament_id: string;
  tournament_name: string;
  start_date: string;
  end_date: string;
  status: string;
  year: number;
  leaderboard: (StrokePlayEntry | TeamStrokeEntry | TeamCupEntry)[];
}

// Grouped data for team formats
export interface GroupedTeamData {
  team_id: string;
  team_name: string;
  team_flag?: string;
  team_score?: string;
  team_status?: string;
  players: (TeamStrokeEntry | TeamCupEntry)[];
  totalScore?: number;
  position?: string;
}

// ------------

export type TeamCupPlayer = {
  player_id: string;
  team_id: string;
  team_color: string;
  team_name: string;
  team_flag?: string;
  first_name: string;
  last_name: string;
  rounds: ProScoreHoles[];
};

export type ProScores = {
  tournament_id: string;
  player_id: string;
  rounds: ProScoreHoles[];
  match_id?: string;
  players?: TeamCupPlayer[];
};

export type ProScoreHoles = {
  number: number;
  holes: TeamCupHole[];
};

export type TeamCupHole = {
  hole_number: number;
  par: number;
  score: string;
  round_score: string;
  status: string;
  yardage: number;
  sequence_number: number;
  team_status?: string;
  team_score?: string;
  team_total?: string;
  hole_played_status?: string;
  points?: string;
};

export interface TournamentPlayer {
  tour: string;
  id: string;
  first_name: string;
  last_name: string;
  image_url: string;
  country: string;
  country_flag: string; // alpha-3 (USA, IND)
  is_following: boolean;
}

export interface TournamentPlayerDetails extends TournamentPlayer {
  height?: string;
  weight?: string;
  age?: number;
  birthday?: string;
  residence?: string;
  birth_place?: string;
  family?: string;
  college?: string;
  turned_pro?: number;

  statistics?: {
    events_played?: number;
    cuts_made?: string;
    pga_tour_wins?: number;
    international_wins?: number;
    second_place?: number;
    third_place?: number;
    top_10?: number;
    top_25?: number;
    official_money?: string;
    career_earnings?: string;
  };
}

export interface Ticket {
  type: string;
  price: number;
  currency: string;
}

export interface HoleStat {
  hole: number;
  par: number;
  averageScore: number;
}

export interface ProTicketType {
  tour: string;
  tournament_id: string;
  tournament_name: string;
  year: number;
  month: string;
  start_date: string;
  end_date: string;
  ticket_url: string;
  tournament_logo: string;
}

export interface ProTicketsResponse {
  getProTournamentsTickets: {
    data: {
      tickets: ProTicketType[];
      has_more: boolean;
      page: number;
      page_size: number;
    };
  };
}

export interface ProTicketVar {
  tournament?: ProTournamentType;
  pageState: number;
  params?: ProTournamentParams;
}

// Response types

export interface ProTournamentsRes {
  getProTournaments: {
    data: { tournaments: ProTournaments[]; has_more: boolean };
  };
}

export interface ProTournamentsDetailRes {
  getProTournamentDetail: {
    data: ProTournamentDetail;
  };
}
export type ProTournamentParams = Record<
  string,
  string | number | boolean | null | []
>;

export type ProTournamentFormats =
  | 'STROKE_PLAY'
  | 'TEAM_STROKE'
  | 'TEAM_CUP'
  | 'STABLEFORD';

export interface ProTournamentsVar {
  tournament?: ProTournamentType;
  status: ProTournamentStatus;
  pageState: number;
  params?: ProTournamentParams;
}

export type ProTournamentType =
  | 'pga'
  | 'lpga'
  | 'livgolf'
  | 'pgachampions'
  | undefined;

export type ProTournamentStatus = 'UPCOMING' | 'COMPLETED' | 'INPROGRESS';

export interface ProTournamentDetailVar {
  tournament_id: string;
  tournament?: ProTournamentType;
}

export interface LeaderboardRes {
  getProTournamentLeaderBoard: {
    data: LeaderboardItem;
  };
}

export interface LeaderboardVar {
  tournament_id: string;
  tournament: ProTournamentType;
  pageState: number | 1;
}

export interface ProScoreCardRes {
  getProTournamentPlayerScoreCard: {
    data: ProScores;
  };
}

export interface ProScoreCardVar {
  tournament: ProTournamentType;
  params?: ProTournamentParams;
}

export interface PlayersRes {
  getProTournamentPlayers: {
    data: {
      players: TournamentPlayer[];
      has_more: boolean;
      page_size: number;
      page: number;
    };
  };
}

export interface PlayersVar {
  pageState: number;
  tournament?: ProTournamentType;
}

export interface PlayerDetailRes {
  getProTournamentPlayerDetail: {
    data: UnifiedPlayer;
  };
}

export interface PlayerDetailVar {
  player_id: string;
  tournament?: ProTournamentType;
}

export interface HoleStatsRes {
  getProTournamentHoleStatistics: HoleStat[];
}

export interface HoleStatsVar {
  id: string;
}

export interface FollowPlayerResultType {
  followPlayer: boolean;
}

export interface FollowPlayerVariablesType {
  tournament: ProTournamentType;
  player_id: string;
  is_follow: boolean;
}

export type TypeItem = {
  id: string;
  name: string;
  url: string;
  pre_fix: string;
};

export type ResType = {
  getProTournamentsTypes: TypeItem[];
};

export type ResYear = {
  getProTournamentsYears: YearItem[];
};
export type YearItem = {
  id: string;
  name: string;
  year: string;
  pre_fix: string;
};

// player util

// export type UnifiedPlayer = {
//   id: string;
//   tour: 'pga' | 'lpga' | 'pgachampions' | 'liv';

//   name: string;
//   image?: string;
//   countryCode?: string;

//   personal: {
//     age?: number | string;
//     height?: string;
//     weight?: string;
//     residence?: string;
//     college?: string;
//     turnedPro?: number | string;
//   };

//   stats: Record<string, string | number>;
//   tournaments?: any[];

//   flags: {
//     hasStats: boolean;
//     hasTournaments: boolean;
//     emptyState?: string;
//   };
// };

export type UnifiedPlayer = {
  id: string;
  tour: string;
  first_name: string;
  last_name: string;
  image_url: string;
  country_flag: string;

  // PGA & Champions fields
  height: string;
  weight: string;
  age: number;
  birthday: string;
  country: string;
  residence: string;
  birth_place: string;
  family: string;
  college: string | null;
  turned_pro: number;

  // LPGA specific fields
  rookie_year: number;
  year_joined: number;
  starts: number;
  cuts_made: number;
  top_10: number;
  wins: number;
  low_round: number;
  official_earnings_amount: number;
  cme_points_rank: number;
  cme_points: string;

  personal: {
    age: number;
    height: string;
    weight: string;
    residence: string;
    college: string;
    turned_pro: number;
  };

  statistics: Record<string, string | number | null>;
  tournaments: Tournament[];
  is_following: boolean;
};

export type Tournament = {
  tournament_name: string;
  start_date: string;
  position: string;
  to_par: string;
  official_money_text?: string;
  official_money_amount?: number;
  r1?: number;
  r2?: number;
  r3?: number;
  r4?: number;
  total?: number;
  cme_points?: number;
};
