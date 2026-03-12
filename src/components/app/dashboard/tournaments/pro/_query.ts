import { gql } from '@apollo/client';

export const GET_PRO_TYPES = gql`
  query proTournamentType {
    getProTournamentsTypes {
      name
      url
      pre_fix
    }
  }
`;

export const GET_PRO_YEARS = gql`
  query getProYear($tournament: ProTournamentType) {
    getProTournamentsYears(tournament: $tournament) {
      pre_fix
      name
      id
      year
    }
  }
`;

export const GET_PRO_TOURNAMENTS = gql`
  query GetProTournament(
    $tournament: ProTournamentType
    $status: ProTournamentStatus!
    $pageState: Float!
    $params: JSON
  ) {
    getProTournaments(
      tournament: $tournament
      status: $status
      pageState: $pageState
      params: $params
    ) {
      data
    }
  }
`;

export const GET_PRO_TOURNAMENT_DETAIL = gql`
  query GetProTournamentDetail($tournament_id: String!, $tournament: ProTournamentType!) {
    getProTournamentDetail(tournament_id: $tournament_id, tournament: $tournament) {
      data
    }
  }
`;

export const GET_LEADERBOARD = gql`
  query GetLeaderboard(
    $tournament_id: String!
    $tournament: ProTournamentType!
    $pageState: Float!
  ) {
    getProTournamentLeaderBoard(
      tournament_id: $tournament_id
      tournament: $tournament
      pageState: $pageState
    ) {
      data
    }
  }
`;

export const GET_PRO_SCORE_CARD = gql`
  query getProScoreCard($tournament: ProTournamentType!, $params: JSON) {
    getProTournamentPlayerScoreCard(tournament: $tournament, params: $params) {
      data
    }
  }
`;

export const GET_PLAYERS = gql`
  query GetPlayers($tournament: ProTournamentType, $pageState: Float!) {
    getProTournamentPlayers(pageState: $pageState, tournament: $tournament) {
      data
    }
  }
`;

export const GET_PLAYER_DETAIL = gql`
  query GetPlayerDetail($player_id: String!, $tournament: ProTournamentType!) {
    getProTournamentPlayerDetail(player_id: $player_id, tournament: $tournament) {
      data
    }
  }
`;

export const GET_TICKETS = gql`
  query GetTickets($tournament: ProTournamentType, $params: JSON, $pageState: Float!) {
    getProTournamentsTickets(
      tournament: $tournament
      params: $params
      pageState: $pageState
    ) {
      data
    }
  }
`;

export const GET_HOLE_STATS = gql`
  query GetHoleStats($id: ID!) {
    getProTournamentHoleStatistics(id: $id) {
      hole
      par
      averageScore
    }
  }
`;

export const FollowMutate = gql`
  mutation followPlayer(
    $tournament: ProTournamentType!
    $player_id: String!
    $is_follow: Boolean!
  ) {
    followPlayer(
      tournament: $tournament
      player_id: $player_id
      is_follow: $is_follow
    )
  }
`;
