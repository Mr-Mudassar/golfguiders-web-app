export type TournamentByYearType = {
  id: string;
  name: string;
  tournament_templateFK: string;
  n: string;
  ut: string;
};

type GetTournamentsGroupedByYear = {
  tournaments: Record<string, TournamentByYearType>;
};

export async function getTournamentsGroupedByYear({
  leagueId,
}: {
  leagueId: string | null;
}) {
  // const { data } = await axios.get<GetTournamentsGroupedByYear>(
  // );
  // if (!data.tournaments) {
  //   throw new Error('No data found');
  // }
  // return Object.values(data.tournaments).sort((a, b) =>
  //   Number(a.name) > Number(b.name) ? -1 : 1
  // );
}

export type TournamentStageType = {
  id: string;
  name: string;
  tournamentFK: string;
  gender: string;
  countryFK: string;
  startdate: string;
  enddate: string;
  n: string;
  ut: string;
  country_name: string;
};

type GetTournamentsStagesByYearGroupType = {
  tournament_stages: Record<string, TournamentStageType>;
};

export async function getTournamentStagesByYearGroup({
  yearGroupId,
}: {
  yearGroupId: string | null;
}) {
  // const { data } = await axios.get<GetTournamentsStagesByYearGroupType>();
  // if (!data.tournament_stages) {
  //   throw new Error('No data found');
  // }
  // return Object.values(data.tournament_stages);
}
