import { useMutation } from '@apollo/client/react';
import {
  CreateTournamentMutation,
  CreateTournamentVariable,
  DeleteTournamentMutation,
  DeleteTournamentVariable,
  EditTournamentMutation,
  EditTournamentVariable,
} from './_interface';
import {
  CreateTournament,
  DeleteTournament,
  EditTournament,
} from './_mutation';

export const useTournament = () => {
  const [createGame, createGameState] = useMutation<
    CreateTournamentMutation,
    CreateTournamentVariable
  >(CreateTournament);

  const [editGame, editGameState] = useMutation<
    EditTournamentMutation,
    EditTournamentVariable
  >(EditTournament);

  const [deleteGame, deleteGameState] = useMutation<
    DeleteTournamentMutation,
    DeleteTournamentVariable
  >(DeleteTournament);

  return {
    createGame,
    editGame,
    deleteGame,
    status: {
      create: createGameState,
      edit: editGameState,
      delete: deleteGameState,
    },
  };
};
