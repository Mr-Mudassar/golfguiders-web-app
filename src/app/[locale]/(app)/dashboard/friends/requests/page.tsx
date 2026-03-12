'use client';

import React from 'react';
import { useDebounceValue } from 'usehooks-ts';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Icon,
  Input,
} from '@/components/ui';
import { getInitials, getName, useFormattedDate } from '@/lib/utils';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { useFetchSentReq } from '@/lib/hooks/use-user';
import { useAppDispatch, useFriends } from '@/lib';
import { setSentReqList, setSentFriendRequestCount } from '@/lib/redux/slices';
import { useAppSelector } from '@/lib';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';

const AccountSkeleton = dynamic(() =>
  import('@/components/app').then((mod) => mod.AccountSkeleton)
);

const FriendRequestsPage = () => {
  const date = useFormattedDate();
  const dispatch = useAppDispatch();
  const friends = useFriends();
  const sentFriendRequestCount = useAppSelector((s) => s.user.sentFriendRequestCount);

  const [search, setSearch] = useDebounceValue('', 500);
  const [loadingMap, setLoadingMap] = React.useState<Map<string, boolean>>(new Map());

  const {
    mergedList: sentRequests,
    infiniteQuery,
    observer,
  } = useFetchSentReq();

  const handleCancelRequest = async (userId: string, createdAt: string) => {
    if (!userId || !createdAt) return;
    setLoadingMap((prev) => new Map(prev).set(userId, true));
    try {
      await friends.cancelFriendRequest({
        variables: { userId, createdAt },
      });
      if (!friends.status.cancelFriendRequest.error) {
        dispatch(setSentReqList({ action: 'remove', userId }));
        if (sentFriendRequestCount != null) {
          dispatch(setSentFriendRequestCount(sentFriendRequestCount - 1));
        }
        friends.status.cancelFriendRequest.reset();
        toast.success('Request cancelled');
        infiniteQuery.refetch();
      } else {
        toast.error('Failed to cancel request');
        friends.status.cancelFriendRequest.reset();
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to cancel request');
    } finally {
      setLoadingMap((prev) => {
        const next = new Map(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  // Filter the requests based on the search value
  const filtteredRequests = React.useMemo(() => {
    if (!search) {
      return sentRequests;
    }
    return sentRequests?.filter((req) => {
      const userName = req.userInfo?.first_name + ' ' + req.userInfo?.last_name;
      return userName.toLowerCase()?.includes(search.toLowerCase());
    });
  }, [search, sentRequests]);

  const t = useTranslations('profilePage.friends');

  return (
    <>
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row justify-between items-center space-y-0 px-6 pt-5 pb-3">
          <div className="space-y-0.5">
            <CardTitle className="text-lg font-bold tracking-tight">{t('requests.label')}</CardTitle>
            <CardDescription className="text-xs">{t('requests.description')}</CardDescription>
          </div>
          <Input
            className="h-8 w-44 text-xs"
            placeholder={t('searchName')}
            onChange={(e) => setSearch(e.target.value)}
          />
        </CardHeader>
        <CardContent className="px-6 pb-6">
          {infiniteQuery.isError && !infiniteQuery.isFetching ? (
            <div className="w-full flex flex-col items-center justify-center h-40 gap-2 animate-in fade-in duration-300">
              <p className="text-sm text-muted-foreground italic">Failed to load requests</p>
              <button
                className="text-xs text-primary hover:underline"
                onClick={() => infiniteQuery.refetch()}
              >
                Try again
              </button>
            </div>
          ) : !infiniteQuery.isFetching && !sentRequests?.length ? (
            <div className="w-full flex items-center justify-center h-40 text-sm text-muted-foreground italic animate-in fade-in duration-300">
              {t('requests.noRequests')}
            </div>
          ) : (
            filtteredRequests?.map((user) => {
              const dateStamp = new Date(user.created!).getTime().toString();
              return (
                <div
                  key={user.to_user_id}
                  className="flex items-center gap-2 justify-between py-1.5"
                >
                  <Link
                    href={`/profile/${user.to_user_id}`}
                    className="flex items-center gap-3"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={user.userInfo?.photo_profile}
                        alt={user.userInfo?.first_name}
                      />
                      <AvatarFallback className="text-sm">
                        {getInitials(
                          user.userInfo?.first_name,
                          user.userInfo?.last_name
                        )}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <p className="font-medium">
                        {getName(
                          user.userInfo?.first_name,
                          user.userInfo?.last_name
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {/* {formatDistanceToNow(new Date(user.created!), {
                        addSuffix: true,
                      })} */}
                        {date(dateStamp)}
                      </p>
                    </div>
                  </Link>

                  <div className="min-w-20">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelRequest(user.to_user_id!, user.created!)}
                      loading={loadingMap.get(user.to_user_id!)}
                      disabled={loadingMap.get(user.to_user_id!)}
                    >
                      {!loadingMap.get(user.to_user_id!) && (
                        <Icon name="user-minus" className="mr-2" size={16} />
                      )}
                      {t('requested.label')}
                    </Button>
                  </div>
                </div>
              );
            })
          )}

          {infiniteQuery.isFetching &&
            Array.from({ length: 6 }).map((_, i) => (
              <AccountSkeleton key={i} />
            ))}

          {/* Observer elements, will allow us to call next fetch when its intersecting the view */}
          <div ref={observer.ref} />
        </CardContent>
      </Card>
    </>
  );
};

export default FriendRequestsPage;
