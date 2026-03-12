import type { ChatRoles } from './constants';

export type User = {
  first_name: string;
  last_name: string;
  email: string;
  userid: string;
  fcm_token: string;
  postalcode: number;
  address: string;
  bio: string;
  city: string;
  country: string;
  created: string;
  photo_profile: string;
  type: string;
  price: number;
  price_type: string;
  photo_cover: string;
  state: string;
  username: string;
  id_country: string;
  id_state: string;
  id_city: string;
  latitude: number;
  longitude: number;
  handicap: string;
  signin_via: string;
  phone: string;
  status: string;
  hobbies: string[];
  gender: string;
  calendly: string;
  country_latlng: number[];
  mobile: string;
  mobile_country_code: string;
  mobile_country_flag: string;
  has_personal_info: boolean;
  has_contact_info: boolean;
  has_experience: boolean;
  has_pricing: boolean;
  has_profile_completed: boolean;
  language: string[];
  training_type: string[];
};

export type PaginatedPosts = {
  pages: Post[][];
  pageParams: unknown[];
};

export type UserFriend = {
  user_id: string;
  created: string;
  friend_user_id: string;
  room_id: string;
  userInfo: UserInfo;
};

export type BlockUser = {
  user_id?: string;
  block_user_id: string;
  created: string;
  userInfo: UserInfo;
};

export type ReceivedFriendRequest = {
  user_id?: string;
  created?: string;
  from_user_id?: string;
  status?: string;
  userInfo?: UserInfo;
};

export type SentFriendRequest = {
  user_id?: string;
  created?: string;
  to_user_id?: string;
  friend_user_id: string;
  status?: string;
  userInfo?: UserInfo;
};

export type Post = {
  user_id: string;
  postal_code?: number;
  friend_id?: string;
  postid?: string;
  is_deleted?: boolean;
  geohash?: string;
  created: string;
  background_color?: string;
  comment_count?: number;
  date_from?: string;
  date_to?: string;
  description?: string;
  feeling_emoji?: string;
  has_buddy_accepted?: boolean;
  is_draft?: boolean;
  latitude?: number;
  longitude?: number;
  location?: string;
  modified?: string;
  post_attrs?: PostAttribute[];
  golfcourse_json?: string;
  shared_by_user_id?: string;
  shared_of_user_id?: string;
  shared_by_postid?: string;
  shared_at?: string;
  status?: string;
  tee_time?: string;
  visibility?: string;
  thumbnail_preview?: string;
  title?: string;
  type?: string;
  has_media?: boolean;
  user_favorites?: string[];
  user_likes?: string[];
  user_saves?: string[];
  user_shares?: string[];
  user_tags?: string[];
  group_tags?: string[];
  like_Count?: number;
  youtube_url?: string;
  youtube_channel_name?: string;
  share_Count?: number;
  userInfo?: UserInfo;
  sharedOfUserInfo?: UserInfo;
  post_activity_created?: string;
};

export type BuddyPost = {
  user_id: string;
  created: string;
  post_id: string;
  date_from: string;
  date_to: string;
  post_user_id: string;
  is_deleted?: boolean;
  golfcourse_json: string;
  tee_time: string;
  type?: string;
  userInfo?: UserInfo;
  user_tags: string[];
  group_tags: string[];
  description?: string;
};

export type ActivityTypePost = Post & {
  post_activity_created?: string;
};

export type PostAttribute = {
  key: string;
  value: string;
};

export type PostMedias = {
  post_id: string;
  created: string;
  json: string;
  mime_type: string;
  modified: string;
  postmediaid: string;
  thumbnail_url: string;
  type: string;
  url: string;
  file_id: string;
  thumbnail_file_id: string;
};

export type PostAcitivity = {
  user_id?: string;
  created?: string;
  post_id?: string;
  activity_type?: string;
};

export type Media = {
  id?: string;
  url?: string;
  mimeType?: string;
  thumbnailUrl?: string;
  createdAt?: string;
  file_id?: string;
  thumbnail_file_id?: string;
  postId?: string;
  type?: string;
  created?: string;
};

export type Comment = {
  comment_id: string;
  post_id?: string;
  created?: string;
  modified?: string;
  comment?: string;
  parent_id?: string;
  reply_count?: number;
  status?: string;
  type?: string;
  user_id?: string;
  likes?: string[];
  userInfo?: UserInfo;
};

export type IGolfCoursesEntity = {
  id?: string;
  id_course?: string;
  active?: string;
  address1?: string;
  address2?: string;
  city?: string;
  id_country?: string;
  countryfull?: string;
  countryshort?: string;
  coursename?: string;
  email?: string;
  thumbnailimage?: string;
  distance?: string;
  gpsavailable?: string;
  layoutholes?: string;
  layouttotalholes?: string;
  layoutname?: string;
  otherstate?: string;
  id_state?: string;
  statefull?: string;
  stateshort?: string;
  zipcode?: string;
  scorecardavailable?: string;
  syncoutputavailable?: string;
  vectoravailable?: string;
  elevationavailable?: string;
  conditionrating?: string;
  teetimesavailable?: string;
  recommendrating?: string;
  latitude?: string;
  longitude?: string;
  classification?: string;
  favoriteCourse?: string;
};

export type CourseTeeDetails = {
  id_course: string;
  teename: string;
  display_order: string;
  teeslist: null;
  ydshole: number[];
  gender: string;
  ratingmen: string;
  ratingwomen: string;
  slopewomen: string;
  slopemen: string;
  id_courseteetype: string;
  id_courseteecolor: string;
  teecolorname: string;
  teecolorvalue: string;
  ydstotal: string;
  yds1to9: string;
  yds10to18: string;
  yds1to18: string;
};

export type CourseScoreCard = {
  men_hcp_hole: number[];
  men_par_hole: number[];
  id_course: string;
  status: string;
  men_par_out: string;
  men_par_in: string;
  men_par_total: string;
  wmn_hcp_hole: number[];
  wmn_par_hole: number[];
  wmn_par_out: string;
  wmn_par_in: string;
  wmn_par_total: string;
};

export type CourseCoords = {
  id: number;
  id_course: string;
  holenumber: string;
  frontlat: string;
  frontlon: string;
  centerlat: string;
  centerlon: string;
  backlat: string;
  backlon: string;
  teelat1: string;
  teelon1: string;
  teelat2: string;
  teelon2: string;
  teelat3: string;
  teelon3: string;
  teelat4: string;
  teelon4: string;
  teelat5: string;
  teelon5: string;
  customlat1: string;
  customlon1: string;
  customname1: string;
  customdesc1: string;
  customlat2: string;
  customlon2: string;
  customname2: string;
  customdesc2: string;
  customlat3: string;
  customlon3: string;
  customname3: string;
  customdesc3: string;
  customlat4: string;
  customlon4: string;
  customname4: string;
  customdesc4: string;
};

export type BuddyPostRequest = {
  post_id?: string;
  created?: string;
  user_id?: string;
  modified?: string;
  post_user_id?: string;
  postbuddyid?: string;
  status?: string;
  status_modified?: string;
  userInfo?: UserInfo;
};

export type UserInfo = {
  userid?: string;
  first_name?: string;
  last_name?: string;
  fcm_token?: string;
  type?: string;
  handicap?: string;
  photo_profile?: string;
};

export type Chat = {
  user_id: string;
  chat_id: string;
  created: string;
  title: string;
};

export type ChatMessage = {
  chat_id: string;
  history_id: string;
  role: (typeof ChatRoles)[keyof typeof ChatRoles];
  content: string;
  created: string;
};

export type AIGolfCourse = {
  score: number;
  id_course: string;
  course_name: string;
  city: string;
  address: string;
  country: string;
};

export type BellNotification = {
  id: string;
  type: string;
  content: {
    message: string;
    created: string;
    url: string;
  };
  metadata: {
    action_id: string;
    action_created: string;
  };
  sender: {
    userid?: string;
    first_name?: string;
    last_name?: string;
    photo_profile?: string;
  };
  read: boolean;
  seen: boolean;
};

// Tournament

export type Tournament = {
  user_id: string;
  created: string;
  tournament_id: string;
  organizer_name: string;
  name: string;
  description: string;
  coursename: string;
  id_course: string;
  organizer_id: string;
  scoring_method: ScoringMethod;
  start_time: string;
  end_time: string;
  tee_interval: number;
  tournament_code: number;
  rounds: number;
  rounds_time: string[];
  co_organizers: string | string[];
  players: string;
};

export type ParsedTournament = {
  user_id: string;
  created: string;
  tournament_id: string;
  organizer_name: string;
  name: string;
  description: string;
  coursename: string;
  id_course: string;
  organizer_id: string;
  scoring_method: ScoringMethod;
  start_time: string;
  end_time: string;
  tee_interval: number;
  tournament_code: number;
  rounds: number;
  rounds_time: string[];
  co_organizers: string[];
  players: HandiCap[];
};

export type TournamentOverviewList = {
  tournament_id: string;
  type: string;
  id: string;
  name: string;
  round_played: number;
  hole_played: number;
  is_match_completed: boolean;
  userInfo: UserInfo;
};

export type CreateTournamentInput = {
  name: string;
  description?: string;
  coursename: string;
  tee_marker?: string;
  gender_team?: string;
  id_course: string;
  scoring_method: ScoringMethod;
  // start_date: string; // old tournament
  start_time: string;
  end_time: string; // new tournament
  rounds: number;
  rounds_time: string[]; // BE data required to update // new tournament
  tee_interval: number;
  organizer_name: string;
  // players_per_team?: number;       //
  // total_teams?: number;           // old tournament
  // total_players: number;         //
  co_organizers: string[];
  players: HandiCap[];
  teams?: CreateTournamentTeamInput[] | null;
};

export type EditTournamentInput = CreateTournamentInput & {
  created: string;
  tournament_id: string;
};

export type HandiCap = {
  user_id: string;
  email?: string;
  hcp?: number;
  hcp_percentage?: number;
  tee: string;
  gender: TournamentGender;
  tee_order: string;
};

export type TournamentGender = '' | 'MALE' | 'FEMALE' | 'OTHER';

type CreateTournamentTeamInput = {
  team_admin_id: string[];
  team_name: string;
  team_player: string[];
};

export type TournamentTeam = {
  tournament_id: string;
  created: string;
  team_id: string;
  team_admin_id: string[];
  team_name: string;
  team_hcp: number;
  team_player: string[];
};

export type RecipientTournamentInput = {
  co_organizer_email: string[];
  player_email: string[];
};

export type ScorePermissionsInput = {
  player_id_marker: string;
  player_id_competitor: string;
};

export type ScorePermission = {
  tournament_id: string;
  created: string;
  player_id_marker: string;
  player_id_competitor: string;
};

// Score

export type TournamentScore = {
  tournament_user_id: string;
  tournament_created: string;
  tournament_scoring_method: string;
  tournament_id: string;
  player_id: string;
  team_id: string;
  round: number;
  hole: number;
  name: string;
  gross_score: number;
  par: number;
  stroke_index: number;
  hcp: number;
  hcp_strokes: number;
  net_points: number;
  net_score: number;
  gross_points: number;
  tournament_rounds: number;
  tournament_holes: number;
};

export type GameScoreInput = {
  tournament_id: string;
  round: number;
  hole: number;
  name: string;
  gross_score: number;
  par: number;
  stroke_index: number;
  hcp: number | undefined;
  tournament_rounds: number;
  tournament_holes?: number;
  player_id?: string;
  team_id?: string;
};

export type ScoringMethod =
  | 'STROKEPLAY'
  | 'STABLEFORD'
  | 'SCRAMBLE'
  | 'BESTBALL';

export type TournamentScoreInput = {
  tournament_user_id: string;
  tournament_created: string;
  tournament_id: string;
  tournament_scoring_method: ScoringMethod;
  tournament_rounds: number;
  tournament_holes: number;
  round: number;
  hole: number;
  name?: string;
  gross_score: number;
  par: number;
  stroke_index: number;
  hcp: number;
  player_id?: string;
  team_id?: string;
};

// Leaderboard

export type TournamentLeaderBoardType = {
  tournament_id: string;
  id: string;
  userInfo: UserInfo;
  name: string;
  round_1: number;
  round_2: number;
  round_3: number;
  round_4: number;
  round_5: number;
  round_6: number;
  round_7: number;
  round_8: number;
  round_9: number;
  round_10: number;
  round_11: number;
  round_12: number;
  round_13: number;
  round_14: number;
  round_15: number;
  round_16: number;
  round_17: number;
  round_18: number;
};
