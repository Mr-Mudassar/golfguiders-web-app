export type LeagueType = {
  id: string;
  name: string;
  sportFK: string;
  gender: string;
  n: string;
  ut: string;
};

type GetLeaguesResponseType = {
  tournament_templates: Record<string, LeagueType>;
};

export async function getLeagues() {
  // const { data } = await axios.get<GetLeaguesResponseType>(
  //
  // );
  // if (!data.tournament_templates) {
  //   throw new Error('No data found');
  // }
  // return Object.values(data.tournament_templates);
}
