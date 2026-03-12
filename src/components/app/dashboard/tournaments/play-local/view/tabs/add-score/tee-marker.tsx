import AvatarBox from '@/components/app/common/avatar-box';
import {
  CourseTeeDetails,
  HandiCap,
  TournamentOverviewList,
  TournamentTeam,
} from '@/lib/definitions';
import { StatusBadge } from '../overview/player-row';
import { Icon } from '@/components/ui';
import { useGetUserDetails } from '@/lib/hooks/use-user/use-users-details';
import { useEffect } from 'react';
import { Users } from 'lucide-react';

export const SelectedPlayerCard = ({
  selectedPlayer,
  getHCP,
  selectHole,
  setHole,
  courseHoles,
  selectRound,
  teamData: td,
  tees,
  isScram = true,
  isMatchCompleted,
  setTeamPlayer,
  teamPlayer,
}: {
  selectedPlayer: TournamentOverviewList;
  selectRound: number;
  selectHole: number;
  courseHoles: number;
  teamData: TournamentTeam;
  isScram: boolean;
  setHole: React.Dispatch<React.SetStateAction<number>>;
  getHCP: (id: string) => number | undefined;
  isMatchCompleted?: boolean;
  tees: { p: HandiCap; t: CourseTeeDetails };
  setTeamPlayer: React.Dispatch<
    React.SetStateAction<{
      id: string;
      name: string;
    }>
  >;
  teamPlayer: { id: string; name: string };
}) => {
  // console.log('cc', tees);
  const { usersArray } = useGetUserDetails(td?.team_player);

  const name = isScram
    ? teamPlayer?.name
    : `${selectedPlayer?.userInfo?.first_name ?? ''} ${selectedPlayer?.userInfo?.last_name ?? ''}`;

  useEffect(() => {
    if (!usersArray?.length) return;

    // keep current selection if valid
    if (teamPlayer?.id && td?.team_player?.includes(teamPlayer.id)) {
      return;
    }

    const first = usersArray[0];
    setTeamPlayer({
      id: first.userid as string,
      name: `${first.first_name ?? ''} ${first.last_name ?? ''}`,
    });
  }, [usersArray?.length, td?.team_player]);

  const isCurrentHolePlayed =
    isMatchCompleted ||
    selectRound < selectedPlayer?.round_played ||
    (selectRound === selectedPlayer?.round_played &&
      selectHole <= selectedPlayer?.hole_played);

  return (
    <>
      <div className="flex items-center gap-4 p-4 rounded border relative overflow-hidden">
        {isCurrentHolePlayed && (
            <div className="absolute top-5 z-0 -right-16.25 w-52 h-6 flex items-center justify-center font-semibold rotate-45 bg-primary text-white">
              PLAYED
            </div>
          )}

        {/* Scramble: show team info */}
        {isScram ? (
          <>
            <div className="flex items-center justify-center size-24 rounded-full bg-primary/10 shrink-0">
              <Users className="size-10 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold text-lg">
                    {selectedPlayer?.name ?? td?.team_name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {td?.team_player?.length ?? 0} players
                  </div>
                </div>

                <div className="text-center w-[36%]">
                  <div className="text-sm font-medium">
                    Round-{selectRound || 1}
                  </div>
                  <div>
                    <div className="grid grid-cols-3 justify-items-center gap-2">
                      {!selectedPlayer?.is_match_completed ? (
                        <button
                          disabled={selectHole === 1}
                          onClick={() => setHole((p) => (p <= 1 ? 1 : p - 1))}
                        >
                          <Icon name="chevron-left" />
                        </button>
                      ) : (
                        <span></span>
                      )}
                      <p className="text-5xl text-primary">{selectHole || 1}</p>
                      {!selectedPlayer?.is_match_completed ? (
                        <button
                          disabled={selectHole === courseHoles || !isCurrentHolePlayed}
                          onClick={() =>
                            setHole((p) =>
                              p === courseHoles ? courseHoles : p + 1
                            )
                          }
                          className={!isCurrentHolePlayed && selectHole !== courseHoles ? 'opacity-40' : ''}
                        >
                          <Icon name="chevron-right" />
                        </button>
                      ) : (
                        <span></span>
                      )}
                    </div>
                    <p>Hole</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Non-Scramble: show individual player info */
          <>
            <AvatarBox
              name={name ?? selectedPlayer?.name}
              src={selectedPlayer?.userInfo?.photo_profile ?? '...'}
              className="size-24"
            />
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold gap-4 flex items-center text-lg">
                    {name}
                  </div>
                  {false && <div className="text-xs text-gray-500">
                    <p>
                      Handicap:{' '}
                      {getHCP(selectedPlayer.userInfo?.userid!) ?? tees?.p?.hcp}
                    </p>
                  </div>}
                  <div className="flex items-center gap-6 mt-4">
                    <StatusBadge selectedPlayer={selectedPlayer} />
                    <div className="flex gap-1">
                      <p className="text-xs text-muted-foreground">Marker:</p>
                      <PlayerTeeMarker tee={tees.t as CourseTeeDetails} />
                    </div>
                  </div>
                </div>

                <div className="text-center w-[36%]">
                  <div className="text-sm font-medium">
                    Round-{selectRound || 1}
                  </div>
                  <div>
                    <div className="grid grid-cols-3 justify-items-center gap-2">
                      {!selectedPlayer?.is_match_completed ? (
                        <button
                          disabled={selectHole === 1}
                          onClick={() => setHole((p) => (p <= 1 ? 1 : p - 1))}
                        >
                          <Icon name="chevron-left" />
                        </button>
                      ) : (
                        <span></span>
                      )}
                      <p className="text-5xl text-primary">{selectHole || 1}</p>
                      {!selectedPlayer?.is_match_completed ? (
                        <button
                          disabled={selectHole === courseHoles || !isCurrentHolePlayed}
                          onClick={() =>
                            setHole((p) =>
                              p === courseHoles ? courseHoles : p + 1
                            )
                          }
                          className={!isCurrentHolePlayed && selectHole !== courseHoles ? 'opacity-40' : ''}
                        >
                          <Icon name="chevron-right" />
                        </button>
                      ) : (
                        <span></span>
                      )}
                    </div>
                    <p>Hole</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

const PlayerTeeMarker = ({ tee }: { tee: CourseTeeDetails }) => {
  return (
    <div className="text-xs flex items-center gap-1">
      <div
        className="size-3.5 border-2 rounded-full"
        style={{ background: `#${tee?.teecolorvalue}` }}
      />
      <p>
        {tee?.teename} ({tee?.ydstotal})
      </p>
    </div>
  );
};

