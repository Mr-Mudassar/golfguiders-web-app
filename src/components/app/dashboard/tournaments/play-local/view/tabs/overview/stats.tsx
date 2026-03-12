import AvatarBox from '@/components/app/common/avatar-box';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Icon,
} from '@/components/ui';
import { useGetUserDetails } from '@/lib/hooks/use-user/use-users-details';
import { Loader } from 'lucide-react';
import { useLocale } from 'next-intl';
import Link from 'next/link';

export default function QuickStats({
  organizer,
  coOrganizers,
  started,
}: {
  organizer: string;
  started: boolean;
  coOrganizers: string[];
}) {
  const { usersArray } = useGetUserDetails([organizer!]);

  if (!usersArray.length) return <Loader className="animate-spin" />;

  const { first_name, userid, last_name, photo_profile, email } = usersArray[0];
  return (
    <>
      <Card>
        <CardHeader className="font-semibold">Quick Stats</CardHeader>
        <CardContent className={started ? '' : 'text-muted-foreground'}>
          {started ? 'Started' : 'Tournament Not Started'}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="font-semibold">Organizer Info</CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 w-full">
              <AvatarBox
                name={`${first_name} ${last_name}`}
                src={photo_profile!}
                className="size-12"
              />
              <p>
                <Link href={userid!} className="font-semibold">
                  {`${first_name} ${last_name}`} •
                </Link>
                <span className="text-primary opacity-70 text-sm">
                  {' '}
                  Organizer
                </span>
              </p>
            </div>
            <p>
              <span className="font-semibold">email: </span>
              <a href={`mailto:${email}`}>{email}</a>
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="font-semibold">Co-organizers</CardHeader>
        <CardContent className="space-y-2">
          {coOrganizers?.length > 0 ? (
            <CoList ids={coOrganizers} />
          ) : (
            <span className="text-muted-foreground">No Co-organizers</span>
          )}
        </CardContent>
      </Card>
    </>
  );
}

const CoList = ({ ids }: { ids: string[] }) => {
  const { usersArray: co } = useGetUserDetails(ids);
  const en = useLocale();
  if (!co) return <Loader className="animate-spin" />;

  return (
    <>
      {co?.map((e, index) => {
        const name = `${e?.first_name} ${e?.last_name}`;
        return (
          <div key={index} className="flex items-center gap-2">
            <AvatarBox name={name} src={e?.photo_profile!} className="size-8" />
            <div>
              <Link
                href={`/${en}/profile/${e?.userid}`}
                className="text-sm font-semibold"
              >
                {name}
              </Link>
              <p className="text-xxs text-muted-foreground">
                {e?.type} • {e?.handicap || 6.3} HCP
              </p>
            </div>
            <Button size="icon-sm" className="ml-auto">
              <Icon name="message" />
            </Button>
          </div>
        );
      })}
    </>
  );
};
