'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useDebounceValue } from 'usehooks-ts';

import { Container } from '@/components/layout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
} from '@/components/ui';
import { useTranslations } from 'next-intl';
import { useFetchPeopleFriends } from '@/lib/hooks/use-user';
import { useAppSelector } from '@/lib';
import dynamic from 'next/dynamic';

const UserAccountCard = dynamic(() =>
  import('@/components/app').then((mod) => mod.UserAccountCard)
);
const AccountSkeleton = dynamic(() =>
  import('@/components/app').then((mod) => mod.AccountSkeleton)
);

const UserFriendList = () => {
  const { id }: { id: string } = useParams();
  const [search, setSearch] = useDebounceValue('', 500);
  const blockedUsers = useAppSelector((state) => state.user.blockedUsers);
  const t = useTranslations('profilePage.friends');

  const { filteredFriends, friendsObserver, friendsQuery } =
    useFetchPeopleFriends({ search, friendId: id });
  
  // Filter out blocked users from friends list
  const filteredFriendsWithoutBlocked = React.useMemo(() => {
    return filteredFriends?.filter((friend) => 
      !blockedUsers.includes(friend.friend_user_id)
    );
  }, [filteredFriends, blockedUsers]);

  return (
    <Container className="p-12">
      <Card>
        <CardHeader className="space-y-0 flex-row items-center justify-between">
          <CardTitle>Friends</CardTitle>
          <div className="flex items-center gap-2">
            <Input
              placeholder={t('searchName')}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {friendsQuery.isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <AccountSkeleton key={i} />)
          ) : !filteredFriendsWithoutBlocked?.length ? (
            <div className="w-full flex items-center justify-center h-60">
              {t('noFriends')}
            </div>
          ) : (
            filteredFriendsWithoutBlocked.map((user) => (
              <UserAccountCard
                key={user?.created || user?.userInfo?.userid}
                user={user}
              />
            ))
          )}

          {friendsQuery.isFetching &&
            !friendsQuery.isLoading &&
            Array.from({ length: 3 }).map((_, i) => (
              <AccountSkeleton key={`loading-${i}`} />
            ))}

          {/* Intersection observer element for infinite scroll */}
          <div ref={friendsObserver.ref} />
        </CardContent>
      </Card>
    </Container>
  );
};

export default UserFriendList;
