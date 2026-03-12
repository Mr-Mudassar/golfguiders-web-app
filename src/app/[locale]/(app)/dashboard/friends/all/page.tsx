'use client';

import React from 'react';
import { useDebounceValue } from 'usehooks-ts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from '@/components/ui';
import type { SentFriendRequest } from '@/lib/definitions';
import { useFetchAllFriends } from '@/lib/hooks/use-user';
import { useAppSelector } from '@/lib';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';

const UserAccountCard = dynamic(() =>
  import('@/components/app').then((mod) => mod.UserAccountCard)
);
const AccountSkeleton = dynamic(() =>
  import('@/components/app').then((mod) => mod.AccountSkeleton)
);

const AllFriendsPage = () => {
  const [search, setSearch] = useDebounceValue('', 500);
  const blockedUsers = useAppSelector((state) => state.user.blockedUsers);
  const {
    mergedList: friendsList,
    infiniteQuery,
    observer,
  } = useFetchAllFriends();

  const t = useTranslations('profilePage.friends');

  // Filtering the friends list based on the search query and blocked users
  const filtteredFriends = React.useMemo(() => {
    const filtered = friendsList?.filter((friend) =>
      !blockedUsers.includes(friend.friend_user_id)
    );

    if (!search) {
      return filtered;
    }
    return filtered?.filter((friend) => {
      const userName =
        friend.userInfo?.first_name + ' ' + friend.userInfo?.last_name;
      return userName.toLowerCase()?.includes(search.toLowerCase());
    });
  }, [search, friendsList, blockedUsers]);

  return (
    <>
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row justify-between items-center space-y-0 px-6 pt-5 pb-3">
          <div className="space-y-0.5">
            <CardTitle className="text-lg font-bold tracking-tight">Your Friends</CardTitle>
            <CardDescription className="text-xs">All your friends</CardDescription>
          </div>
          <Input
            className="h-8 w-44 text-xs"
            placeholder={t('searchName')}
            onChange={(e) => setSearch(e.target.value)}
          />
        </CardHeader>
        <CardContent className="px-6 pb-6">
          {!infiniteQuery.isFetching && !friendsList?.length ? (
            <div className="w-full flex items-center justify-center h-40 text-sm text-muted-foreground italic animate-in fade-in duration-300">
              {t('noFriends')}
            </div>
          ) : (
            filtteredFriends?.map((user: SentFriendRequest) => (
              <UserAccountCard key={user?.created} user={user} />
            ))
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

export default AllFriendsPage;
