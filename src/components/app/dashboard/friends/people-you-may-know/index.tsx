'use client';

import React from 'react';
import { useDebounceValue } from 'usehooks-ts';

import { Link } from '@/i18n/routing';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Icon,
  Input,
  AnimatedCard,
} from '@/components/ui';
import { getName, cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector, useFriends } from '@/lib';

import type { User } from '@/lib/definitions';
import { useTranslations } from 'next-intl';
import { setSentFriendRequestCount, setSentReqList } from '@/lib/redux/slices';
import { toast } from 'sonner';
import { useFetchUserRecommendations } from '@/lib/hooks/use-user';
import dynamic from 'next/dynamic';

const AccountCard = dynamic(() =>
  import('./account-card').then((mod) => mod.AccountCard)
);
const AccountSkeleton = dynamic(() =>
  import('@/components/app/common').then((mod) => mod.AccountSkeleton)
);

interface PeopleYouMayKnowProps {
  readonly className?: string;
  limitTo?: number;
  sm?: boolean;
}

const PeopleYouMayKnow: React.FC<PeopleYouMayKnowProps> = ({
  className,
  limitTo,
  sm = false,
}) => {
  const friends = useFriends();
  const dispatch = useAppDispatch();
  const blockedUsers = useAppSelector((state) => state.user.blockedUsers);

  const sentFriendRequestCount: number | null = useAppSelector(
    (state) => state.user.sentFriendRequestCount
  );
  const t = useTranslations('profilePage.friends.knownPeople');

  const [load, setLoad] = React.useState<boolean>(false);
  const [requestLoading, setRequestLoading] = React.useState<string | null>(
    null
  );
  const [successMap, setSuccessMap] = React.useState<Map<string, boolean>>(
    new Map()
  );

  const [search, setSearch] = useDebounceValue('', 500);

  const { friendRecommendations, filteredFriendRecommendations } =
    useFetchUserRecommendations({ search });

  return (
    <AnimatedCard index={2}>
      <Card className={cn("bg-card/50 backdrop-blur-sm", className)}>
        <CardHeader className="flex flex-row justify-between items-center space-y-0 px-6 pt-5 pb-3">
          <div className="space-y-0.5">
            <CardTitle className="text-lg font-bold tracking-tight">{t('label')}</CardTitle>
            <CardDescription className="text-xs">{t('description')}</CardDescription>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
            onClick={async () => {
              setLoad(true);
              const res = await friendRecommendations.refetch();
              setSearch('');
              if (!!res) {
                setLoad(false);
              }
            }}
          >
            <Icon name="refresh" size={16} className={load ? 'animate-spin' : ''} />
          </Button>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          {!limitTo && (
            <div className="mb-4">
              <Input
                className="bg-muted/50 border-border/50 rounded-xl"
                placeholder={t('searchName')}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}
          <div
            className={cn(
              'flex flex-col gap-1',
              friendRecommendations.loading && 'min-h-[320px]'
            )}
          >
            {friendRecommendations.loading ? (
              <div className="flex flex-col gap-1 animate-in fade-in duration-200 ease-out">
                {Array.from({ length: 6 }).map((_, i) => (
                  <AccountSkeleton key={i} />
                ))}
              </div>
            ) : !friendRecommendations.data?.getUserFriendRecommendation.values
              ?.length ? (
              <div className="w-full flex items-center justify-center h-40 text-sm text-muted-foreground italic animate-in fade-in duration-300">
                {t('noKnown')}
              </div>
            ) : (
              <div className="flex flex-col gap-1 animate-in fade-in duration-300 ease-out">
                {filteredFriendRecommendations
                  ?.filter((user: User) => !blockedUsers.includes(user.userid!))
                  ?.slice(0, limitTo)
                  .map((user: User) => (
                    <AccountCard
                      sm={sm}
                      key={user.userid}
                      userId={user.userid!}
                      name={getName(user.first_name, user.last_name)}
                      avatar={user.photo_profile}
                      onSendRequest={async () => {
                        setRequestLoading(user.userid!);

                        await friends.sendFriendRequest({
                          variables: {
                            userId: user.userid!,
                          },
                        });

                        if (!friends.status.sendFriendRequest.error) {
                          setSuccessMap((prev) =>
                            new Map(prev).set(user.userid!, true)
                          );
                          friends.status.sendFriendRequest.reset();
                        }
                        dispatch(
                          setSentReqList({ action: 'add', userId: user.userid! })
                        );
                        friendRecommendations.refetch();
                        toast.success(t('toast'));
                        setRequestLoading(null);
                        dispatch(setSentFriendRequestCount(sentFriendRequestCount + 1));
                      }}
                      isLoading={requestLoading === user.userid}
                      requestSent={successMap.get(user.userid!) || false}
                    />
                  ))}
              </div>
            )}
          </div>
          {limitTo && (
            <Button
              asChild
              variant="outline"
              className="w-full mt-4 h-10 rounded-xl border-border/50 bg-muted/30 text-muted-foreground hover:text-primary hover:bg-primary/5 hover:border-primary/30 font-medium transition-all"
            >
              <Link prefetch={false} href="/dashboard/friends">
                {t('view')}
                <Icon name="chevron-right" size={16} className="ml-1" />
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </AnimatedCard>
  );
};

export { PeopleYouMayKnow };
