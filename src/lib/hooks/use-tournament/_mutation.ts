// Tournament Mutations

import { gql } from '@apollo/client';

export const CreateTournament = gql`
  mutation createTournament(
    $createInput: CreateTournamentInput!
    $recepientInput: RecepientTournamentInput
    $score: [ScorePermissionsInput!]
  ) {
    createTournament(
      createTournamentInput: $createInput
      recepientTournamentInput: $recepientInput
      scorePermissions: $score
    ) {
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

export const EditTournament = gql`
  mutation editTournament(
    $editInput: EditTournamentInput!
    $score: [ScorePermissionsInput!]
    $recepientInput: RecepientTournamentInput
  ) {
    editTournament(
      editTournamentInput: $editInput
      scorePermissions: $score
      recepientTournamentInput: $recepientInput
    ) {
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

export const DeleteTournament = gql`
  mutation deleteTournament($created: String!, $id: String!) {
    deleteTournament(created: $created, tournanmentId: $id)
  }
`;

// Score Mutations

export const StrokeScore = gql`
  mutation addStrokeScore($scoreInput: TournamentScoreInput!) {
    addStrokeScore(strokeScoreInput: $scoreInput) {
      tournament_id
      round
      hole
      name
      gross_score
      par
      stroke_index
      hcp
      tournament_rounds
      tournament_holes
      player_id
      team_id
    }
  }
`;

export const StableFordScore = gql`
  mutation addstableFordScore($scoreInput: TournamentScoreInput!) {
    addstableFordScore(strokeScoreInput: $scoreInput) {
      tournament_id
      round
      hole
      name
      gross_score
      par
      stroke_index
      hcp
      tournament_rounds
      tournament_holes
      player_id
      team_id
    }
  }
`;

export const AddTournamentScore = gql`
  mutation addTournamentScore($scoreInput: AddTournamentScoreInput!) {
    addTournamentScore(addTournamentScoreInput: $scoreInput) {
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
