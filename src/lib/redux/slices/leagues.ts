import {
  ProTournamentFormats,
  ProTournamentParams,
  ProTournamentStatus,
  ProTournamentType,
} from '@/components/app/dashboard/tournaments/pro/_interface';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ActiveTournament {
  name?: string;
  gameId?: string;
  format?: ProTournamentFormats;
  type?: ProTournamentType;
  status?: ProTournamentStatus;
}

export interface FilterType {
  status?: ProTournamentStatus;
  tournament?: ProTournamentType;
  params?: { year: string; };
}

interface ProState {
  activeProLeague: ActiveTournament;
  activeFilters: FilterType;
}

const initialState: ProState = {
  activeProLeague: {},
  activeFilters: {},
};

const proLeagueSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setActiveTournament(state, action: PayloadAction<ActiveTournament>) {
      state.activeProLeague = action.payload;
    },
    setFilters(state, action: PayloadAction<FilterType>) {
      state.activeFilters = action?.payload;
    },
    resetActiveLeague() {
      localStorage.clear();
      location.reload();
    },
  },
});

export const { resetActiveLeague, setActiveTournament, setFilters } =
  proLeagueSlice.actions;
export default proLeagueSlice.reducer;
