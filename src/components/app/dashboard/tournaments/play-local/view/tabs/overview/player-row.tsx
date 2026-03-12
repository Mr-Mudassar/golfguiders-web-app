import AvatarBox from '@/components/app/common/avatar-box';
import { Badge } from '@/components/ui';
import { TournamentOverviewList, TournamentTeam } from '@/lib/definitions';
import Link from 'next/link';

export const PlayerRow = ({
  player: e,
  getHCP,
  team,
  isScram,
  locale,
}: {
  player: TournamentOverviewList;
  team?: TournamentTeam[];
  getHCP: (id: string) => number | undefined;
  isScram: boolean;
  locale: string;
}) => {
  const name =
    e?.name ?? `${e?.userInfo?.first_name} ${e?.userInfo?.last_name}`;

  const curTeam = team?.find((t) =>
    !!e?.name ? t.team_id === e?.id : t.team_player?.includes(e?.id)
  );

  const isTeam = Boolean(team && team?.length > 0);
  const profileUrl = e?.userInfo?.userid ? `/${locale}/profile/${e.userInfo.userid}` : undefined;

  return (
    <div className="grid grid-cols-8 items-center pt-4 px-0" key={e?.id}>
      <div className="flex items-center gap-4 col-span-4">
        {profileUrl ? (
          <Link href={profileUrl}>
            <AvatarBox name={name} src={e?.userInfo?.photo_profile!} className="cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all rounded-full" />
          </Link>
        ) : (
          <AvatarBox name={name} src={e?.userInfo?.photo_profile!} />
        )}
        <div className="font-medium flex items-center gap-3">
          {profileUrl ? (
            <Link href={profileUrl} className="hover:text-primary transition-colors">
              {name}
            </Link>
          ) : (
            name
          )}{' '}
          {isTeam && !isScram && (
            <Badge variant="outline" size="sm">
              {curTeam?.team_name}
            </Badge>
          )}
        </div>
      </div>
      {!isScram && (
        <p className="text-center">
          {e?.userInfo?.handicap ?? getHCP(e?.id) ?? 'No HCP'}
        </p>
      )}
      <p className="text-center">{e?.round_played || '-'}</p>
      <p className="text-center">{e?.hole_played || '-'}</p>
      <div className="flex items-center justify-center">
        <StatusBadge selectedPlayer={e} />
      </div>
    </div>
  );
};

export const StatusBadge = ({
  selectedPlayer,
  size = 'sm',
}: {
  selectedPlayer: TournamentOverviewList;
  size?: 'sm' | 'default' | 'lg';
}) => {
  const status = selectedPlayer
    ? selectedPlayer?.is_match_completed
      ? 'Completed'
      : selectedPlayer?.round_played > 0 || selectedPlayer?.hole_played > 0
        ? 'In Progress'
        : 'Not Started'
    : '-';
  return (
    <Badge
      size={size}
      variant={
        status === 'Completed'
          ? 'default'
          : status === 'Not Started'
            ? 'outline'
            : 'secondary'
      }
      className="w-fit col-span-2"
    >
      {status}
    </Badge>
  );
};
