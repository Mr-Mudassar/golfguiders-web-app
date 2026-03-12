import type {
  CreateTournamentInput,
  EditTournamentInput,
  RecipientTournamentInput,
  ScorePermission,
  ScorePermissionsInput,
  Tournament,
  TournamentOverviewList,
  TournamentTeam,
  TournamentScore,
  TournamentScoreInput,
  TournamentLeaderBoardType,
  ScoringMethod,
} from '@/lib/definitions';

export interface TournamentByUser {
  getTournamentByUser: {
    values: Tournament[];
    pageState: string | null;
  };
}

export interface TournamentByCo {
  getTournamentByCoOrganizer: {
    values: Tournament[];
    pageState: string | null;
  };
}

export interface TournamentByPlayer {
  getTournamentByPlayer: {
    values: Tournament[];
    pageState: string | null;
  };
}

export interface TournamentVariable {
  page?: null | string;
}

export interface CreateTournamentMutation {
  createTournament: Tournament;
}
export interface CreateTournamentVariable {
  createInput: CreateTournamentInput;
  recepientInput?: RecipientTournamentInput;
  score?: ScorePermissionsInput[];
}

// edit

export interface EditTournamentMutation {
  editTournament: Tournament;
}

export interface EditTournamentVariable {
  editInput: EditTournamentInput;
  recepientInput: RecipientTournamentInput;
  score?: ScorePermissionsInput[];
}

// delete

export interface DeleteTournamentMutation {
  deleteTournament: boolean;
}

export interface DeleteTournamentVariable {
  created: string;
  id: string;
}

export interface GetGameDetail {
  getTournamentDetail: Tournament;
}

export type GameDetailVariable = {
  created: string;
  user_id?: string;
};
export interface GetGameTeam {
  getTeamByTournament: TournamentTeam[];
}

export interface GetScorePermit {
  getPermissionByTournament: ScorePermission[];
}

export interface GameOverview {
  getTournamentOverView: {
    values: TournamentOverviewList[];
    pageState: string;
  };
}

export interface GameOverviewVariable {
  gameId: string;
  type: string;
  page?: string;
}

// Score Mutation

export interface TournamentScoreMutate {
  addTournamentScore: TournamentScore;
}

export interface TournamentScoreVar {
  scoreInput: TournamentScoreInput;
}

export interface AddStrokeScore {
  addStrokeScore: TournamentScore;
}

export interface AddStableFordScore {
  addstableFordScore: TournamentScore;
}

export interface TournamentLeaderBoard {
  getTournamentLeaderBoard: {
    values: TournamentLeaderBoardType[];
  };
}

export interface ITournamentScoreVar {
  scoringMethod: ScoringMethod;
  gameId: string;
  playerId: string;
  round: number;
}

export interface ITournamentScoreType {
  getTournamentScore: TournamentScore[];
}

// Best Ball score by team player
export interface BestBallScoreByTeamPlayersData {
  getBestBallScoreByTeamPlayers: TournamentScore[];
}

export interface BestBallScoreByTeamPlayersVar {
  teamId: string;
  playerId: string;
  round: number;
}
