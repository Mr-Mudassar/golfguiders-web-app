'use client';

import React from 'react';
import { toast } from 'sonner';
import { getName, cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import { setAllFriendsCount } from '@/lib/redux/slices';
import type { ReceivedFriendRequest } from '@/lib/definitions';
import { useAppDispatch, useAppSelector, useFriends } from '@/lib';
import { useFetchAllFriends, useReqReceive } from '@/lib/hooks/use-user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import dynamic from 'next/dynamic';

const RequestCard = dynamic(() =>
  import('./request-card').then((mod) => mod.RequestCard)
);
const AccountSkeleton = dynamic(() =>
  import('@/components/app/common').then((mod) => mod.AccountSkeleton)
);

interface FriendRequestProps {
  className?: string;
}

interface ICacheReq {
  pageParams: number[];
  pages: ReceivedFriendRequest[][];
}
const FriendRequest: React.FC<FriendRequestProps> = ({ className }) => {
  const friends = useFriends();
  const dispatch = useAppDispatch();
  const t = useTranslations('profilePage.friends.reqReceive');
  const [requestLoading, setRequestLoading] = React.useState<string | null>(
    null
  );
  const allFriendsCount: number = useAppSelector(
    (state) => state.user.allFriendsCount
  );

  const client = useQueryClient();
  const [acceptSuccessMap, setAcceptSuccessMap] = React.useState<
    Map<string, boolean>
  >(new Map());
  const [rejectSuccessMap, setRejectSuccessMap] = React.useState<
    Map<string, boolean>
  >(new Map());

  const {
    observer,
    infiniteQuery: requestsQuery,
    mergedList: friendRequests,
  } = useReqReceive();

  // Disable useFetchAllFriends on main friends page - it should only be called on /dashboard/friends/all
  const { infiniteQuery } = useFetchAllFriends(undefined, false);

  return (
    <Card className={cn("bg-card/50 backdrop-blur-sm", className)}>
      <CardHeader className="flex flex-row justify-between items-center space-y-0 px-6 pt-5 pb-3">
        <div className="space-y-0.5">
          <CardTitle className="text-lg font-bold tracking-tight">{t('label')}</CardTitle>
          <CardDescription className="text-xs">Requests sent by you</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        {!requestsQuery.isFetching && !friendRequests?.length ? (
          <div className="w-full flex items-center justify-center h-40 text-sm text-muted-foreground italic animate-in fade-in duration-300">
            {t('text')}
          </div>
        ) : (
          friendRequests?.map((user) => (
            <RequestCard
              key={user.from_user_id}
              userId={user.from_user_id!}
              name={getName(
                user.userInfo?.first_name,
                user.userInfo?.last_name
              )}
              avatar={user.userInfo?.photo_profile}
              createdAt={user.created!}
              onAccept={async () => {
                setRequestLoading(user.from_user_id!);

                await friends.acceptFriendRequest({
                  variables: {
                    userId: user.from_user_id!,
                    createdAt: user.created!,
                  },
                });

                setRequestLoading(null);

                if (!friends.status.acceptFriendRequest.error) {
                  setAcceptSuccessMap((prev) =>
                    new Map(prev).set(user.from_user_id!, true)
                  );

                  friends.status.acceptFriendRequest.reset();
                }
                // Invalidate cache instead of refetching - API should only be called on /dashboard/friends/all page
                client.invalidateQueries({ queryKey: ['userFriendList'] });
                toast.success(
                  `${getName(user.userInfo?.first_name, user?.userInfo?.last_name)} has been added as your friend`
                );

                dispatch(setAllFriendsCount(allFriendsCount + 1));
              }}
              onReject={async () => {
                setRequestLoading(user.from_user_id!);

                await friends.rejectFriendRequest({
                  variables: {
                    userId: user.from_user_id!,
                    createdAt: user.created!,
                  },
                });

                if (!friends.status.rejectFriendRequest.error) {
                  setRejectSuccessMap((prev) =>
                    new Map(prev).set(user.from_user_id!, true)
                  );

                  friends.status.rejectFriendRequest.reset();
                }
                client.setQueryData<ICacheReq>(['getRequests'], (oldData) => {
                  if (!oldData) return oldData;
                  return {
                    pageParams: oldData.pageParams, // preserve pagination info
                    pages: oldData.pages?.map((page) =>
                      page.filter(
                        (req) => req.from_user_id !== user.from_user_id!
                      )
                    ),
                  };
                });

                toast.success('Friend request removed');
                setRequestLoading(null);
              }}
              isLoading={requestLoading === user.from_user_id}
              requestAccepted={
                acceptSuccessMap.get(user.from_user_id!) ?? false
              }
              requestRejected={
                rejectSuccessMap.get(user.from_user_id!) ?? false
              }
            />
          ))
        )}

        {requestsQuery.isFetching &&
          Array.from({ length: 6 }).map((_, i) => <AccountSkeleton key={i} />)}

        {/* Observer elements, will allow us to call next fetch when its intersecting the view */}
        <div ref={observer.ref} />
      </CardContent>
    </Card>
  );
};

export { FriendRequest };
