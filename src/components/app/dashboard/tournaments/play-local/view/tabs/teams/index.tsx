import { Card, CardContent, CardHeader } from '@/components/ui';
import { TournamentOverviewList, TournamentTeam } from '@/lib/definitions';
import { PlayerRow } from '../overview/player-row';
import { useState } from 'react';
import { useLocale } from 'next-intl';

export default function TeamsTab({
  overView,
  teamData,
  getHCP,
  isScram = false,
}: {
  teamData: TournamentTeam[];
  overView: TournamentOverviewList[];
  getHCP: (val: string) => number | undefined;
  isScram: boolean;
}) {
  const [show, setShow] = useState(false);
  const locale = useLocale();
  return (
    <>
      <Card className="mb-4">
        <CardHeader
          onClick={() => setShow(!show)}
          className="py-4 text-primary text-3xl text-center font-bold cursor-pointer"
        >
          Team Overview
        </CardHeader>
        <CardContent
          className="text-sm p-0 transition-all"
          style={{
            height: show ? 44 : 0,
            visibility: show ? 'visible' : 'hidden',
          }}
        >
          <div className="grid grid-cols-2 divide-x px-4 py-3">
            <p>
              <span className="font-semibold">Total Teams:</span>{' '}
              {teamData?.length}
            </p>
            <p className="ps-4">
              <span className="font-semibold">Players per Teams:</span>{' '}
              {teamData[0]?.team_player?.length}
            </p>
          </div>
        </CardContent>
      </Card>
      {teamData && teamData?.length > 0 && (
        <div className="space-y-4">
          {teamData?.map((t, index) => (
            <Card key={t?.team_id || index}>
              <CardHeader className="text-lg bg-primary font-semibold text-white">
                Team - {t?.team_name}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-6 text-muted-foreground text-xs text-center font-semibold leading-4">
                  <p className="text-start col-span-2">Name</p>
                  <p>HCP</p>
                  <p>Round</p>
                  <p>Hole</p>
                  <p>Status</p>
                </div>
                {t?.team_player.length > 0 && (
                  <div className="grid divide-y">
                    {t?.team_player?.map((player, index) => (
                      <PlayerRow
                        isScram={isScram}
                        key={index}
                        player={overView?.find((e) => e?.id === player)!}
                        getHCP={getHCP}
                        locale={locale}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
