import { gql } from '@apollo/client';

export const GetTournamentByUser = gql`
  query getTournamentByUser($page: String) {
    getTournamentByUser(pageState: $page) {
      values {
        user_id
        created
        tournament_id
        organizer_name
        name
        description
        coursename
        id_course
        organizer_id
        scoring_method
        start_time
        end_time
        tee_interval
        tournament_code
        rounds
        rounds_time
        co_organizers
        players
      }
      pageState
    }
  }
`;

export const GetTournamentByCo = gql`
  query getTournamentByCoOrganizer($page: String) {
    getTournamentByCoOrganizer(pageState: $page) {
      values {
        user_id
        created
        tournament_id
        organizer_name
        name
        description
        coursename
        id_course
        organizer_id
        scoring_method
        start_time
        end_time
        tee_interval
        tournament_code
        rounds
        rounds_time
        co_organizers
        players
      }
      pageState
    }
  }
`;

export const GetTournamentByPlayer = gql`
  query getTournamentByPlayer($page: String) {
    getTournamentByPlayer(pageState: $page) {
      values {
        user_id
        created
        tournament_id
        organizer_name
        name
        description
        coursename
        id_course
        organizer_id
        scoring_method
        start_time
        end_time
        tee_interval
        tournament_code
        rounds
        rounds_time
        co_organizers
        players
      }
      pageState
    }
  }
`;

export const GetTournamentDetail = gql`
  query getTournamentDetail($created: String!, $user_id: String) {
    getTournamentDetail(created: $created, userId: $user_id) {
      user_id
      created
      tournament_id
      organizer_name
      name
      description
      coursename
      id_course
      organizer_id
      scoring_method
      start_time
      end_time
      tee_interval
      tournament_code
      rounds
      rounds_time
      co_organizers
      players
    }
  }
`;

export const GetGameOverview = gql`
  query getTournamentOverView(
    $gameId: String!
    $type: OverViewType!
    $page: String
  ) {
    getTournamentOverView(
      tournament_id: $gameId
      type: $type
      pageState: $page
    ) {
      values {
        tournament_id
        type
        id
        name
        round_played
        hole_played
        is_match_completed
        userInfo {
          first_name
          last_name
          photo_profile
          userid
          handicap
          type
        }
      }
      pageState
    }
  }
`;

export const GetTeamById = gql`
  query getTeamByTournament($id: String!) {
    getTeamByTournament(tournamentId: $id) {
      tournament_id
      created
      team_id
      team_admin_id
      team_name
      team_hcp
      team_player
    }
  }
`;

export const GetMatchStatus = gql`
  query ($tournament_id: String!, $tournament_user_id: String!, $tournament_created: String!, $type: FormatType!) {
    getTournamentPlayedStatus(tournament_id: $tournament_id, tournament_user_id: $tournament_user_id, tournament_created: $tournament_created, type: $type)
  }
`;

export const GetScorePermission = gql`
  query ($id: String!) {
    getPermissionByTournament(tournamentId: $id) {
      tournament_id
      player_id_marker
      player_id_competitor
    }
  }
`;

// Score

export const GetTournamentScore = gql`
  query getTournamentScore(
    $scoringMethod: ScoringMethod!
    $gameId: String!
    $playerId: String!
    $round: Float!
  ) {
    getTournamentScore(
      scoringMethod: $scoringMethod
      tournament_id: $gameId
      id: $playerId
      round: $round
    ) {
      tournament_user_id
      tournament_created
      tournament_scoring_method
      tournament_id
      player_id
      team_id
      round
      hole
      name
      gross_score
      par
      stroke_index
      hcp
      hcp_strokes
      net_points
      net_score
      gross_points
      tournament_rounds
      tournament_holes
    }
  }
`;

// Best Ball score by team player

export const GetBestBallScoreByTeamPlayers = gql`
  query getBestBallScoreByTeamPlayers(
    $teamId: String!
    $playerId: String!
    $round: Float!
  ) {
    getBestBallScoreByTeamPlayers(
      teamId: $teamId
      playerId: $playerId
      round: $round
    ) {
      tournament_user_id
      tournament_created
      tournament_scoring_method
      tournament_id
      player_id
      team_id
      round
      hole
      name
      gross_score
      par
      stroke_index
      hcp
      hcp_strokes
      net_points
      net_score
      gross_points
      tournament_rounds
      tournament_holes
    }
  }
`;

// Leader board

export const GetLeaderBoard = gql`
  query getLeaderBoard($gameId: String!) {
    getTournamentLeaderBoard(tournament_id: $gameId) {
      values {
        tournament_id
        id
        name
        userInfo {
          first_name
          last_name
          photo_profile
          handicap
        }
        round_1
        round_2
        round_3
        round_4
        round_5
        round_6
        round_7
        round_8
        round_9
        round_10
        round_11
        round_12
        round_13
        round_14
        round_15
        round_16
        round_17
        round_18
      }
    }
  }
`;
