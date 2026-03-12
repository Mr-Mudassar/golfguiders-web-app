import { TournamentGender, User } from '@/lib/definitions';

export type UserSelectHandler = (
  user: User,
  hcp: number | null,
  hcpPercent: number,
  teeMarker: ITeeMark,
  type?: 'edit' | 'add'
) => void;

export type ITeeMark = {
  name: string;
  value: string;
  gen: TournamentGender | '';
  order: string;
};

export type Team = {
  team_name: string;
  team_admin_id: string[];
  team_player: string[];
  tee_marker: string[];
  tee_color: string[];
};
export type IPlayer = {
  name: string;
  user_id: string;
  email?: string;
  gender: '' | 'MALE' | 'FEMALE' | 'OTHER';
  tee: string;
  tee_order: string;
  tee_color?: string;
  hcp_percentage: number;
  hcp?: number | undefined;
};
