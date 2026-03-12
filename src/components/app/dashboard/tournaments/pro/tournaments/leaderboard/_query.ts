type EventPropertyType = {
  id: string;
  type: string;
  name: string;
  value: string;
  n: string;
  ut: string;
};

type EventType = {
  id: string;
  name: string;
  tournament_stageFK: string;
  startdate: string;
  status_type: string;
  status_descFK: string;
  round_typeFK: string;
  n: string;
  ut: string;
  tournamentFK: string;
  tournament_templateFK: string;
  sportFK: string;
  tournament_stage_name: string;
  tournament_name: string;
  tournament_template_name: string;
  sport_name: string;
  property: Record<string, EventPropertyType> | EventPropertyType[];
};

type GetEventsType = {
  events: Record<string, EventType>;
};

export async function getEvents({
  tournamentId,
}: {
  tournamentId: string | null;
}) {
  // const { data } = await axios.get<GetEventsType>(
  // );
  // if (!data.events) {
  //   throw new Error('No data found');
  // }
  // const event = Object.values(data.events)[0];
  // event.property = Object.values(event.property);
  // return event;
}

type ParticipantType = {
  id: string;
  name: string;
  gender: string;
  type: string;
  countryFK: string;
  n: string;
  ut: string;
  country_name: string;
};

type ScopeResultType = {
  id: string;
  event_participantsFK: string;
  event_scopeFK: string;
  scope_data_typeFK: string;
  value: string;
  n: string;
  ut: string;
};

export type EventResultType = {
  id: string;
  event_participantsFK: string;
  result_typeFK: string;
  result_code: string;
  value: string;
  n: string;
  ut: string;
};

export type EventScopeType = {
  id: string;
  eventFK: string;
  scope_typeFK: string;
  n: string;
  ut: string;
};

export type EventParticipantType = {
  id: string;
  number: string;
  participantFK: string;
  eventFK: string;
  n: string;
  ut: string;
  result?: EventResultType[];
  scope_result?: ScopeResultType[];
  participant?: ParticipantType;
};

export type EventDetailType = {
  id: string;
  name: string;
  tournament_stageFK: string;
  startdate: string;
  status_type: string;
  status_descFK: string;
  round_typeFK: string;
  n: string;
  ut: string;
  tournamentFK: string;
  tournament_templateFK: string;
  sportFK: string;
  tournament_stage_name: string;
  tournament_name: string;
  tournament_template_name: string;
  sport_name: string;
  gender: string;
  property: EventPropertyType[];
  event_scope: EventScopeType[];
  event_participants: EventParticipantType[];
};

type GetEventDetailsType = {
  event: Record<string, EventDetailType>;
};

export async function getEventDetails({ id }: { id: string | null }) {
  // const { data } = await axios.get<GetEventDetailsType>(
  // );
  // if (!data.event) {
  //   throw new Error('No data found');
  // }
  // const event = Object.values(data.event)[0];
  // if (event.property) {
  //   event.property = Object.values(event.property);
  // }
  // if (event.event_scope) {
  //   event.event_scope = Object.values(event.event_scope);
  // }
  // if (event.event_participants) {
  //   event.event_participants = Object.values(event.event_participants).map(
  //     (p) => {
  //       p.result = p.result ? Object.values(p.result) : [];
  //       p.scope_result = p.scope_result ? Object.values(p.scope_result) : [];
  //       return p;
  //     }
  //   );
  // }
  // return event;
}
