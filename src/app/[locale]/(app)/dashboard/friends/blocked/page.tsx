'use client';

import {
  Card,
  Input,
  Avatar,
  Button,
  CardTitle,
  CardHeader,
  AvatarImage,
  CardContent,
  AvatarFallback,
  CardDescription,
} from '@/components/ui';
import React from 'react';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import { Link } from '@/i18n/routing';
import { useDebounceValue } from 'usehooks-ts';
import { formatDistanceToNow } from 'date-fns';
import { setBlockList } from '@/lib/redux/slices';
import type { BlockUser } from '@/lib/definitions';
import { useAppDispatch, useFriends } from '@/lib';
import { useFetchBlockListPaginated } from '@/lib/hooks/use-user';
import { getInitials, getName, useFormattedDate } from '@/lib/utils';

const AccountSkeleton = dynamic(() =>
  import('@/components/app/common').then((mod) => mod.AccountSkeleton)
);

const BlockedUsersPage = () => {
  const friends = useFriends();
  const dispatch = useAppDispatch();
  const [search, setSearch] = useDebounceValue('', 500);
  const [unblockLoadingMap, setUnblockLoadingMap] = React.useState<
    Map<string, boolean>
  >(new Map());
  const [blockCreatedTimestampMap, setBlockCreatedTimestampMap] =
    React.useState<Map<string, string>>(new Map());

  const {
    mergedList: blockedUsers,
    infiniteQuery,
    observer,
  } = useFetchBlockListPaginated();

  // Filter the blocked users based on the search value
  const filteredBlockedUsers = React.useMemo(() => {
    if (!search) {
      return blockedUsers;
    }
    return blockedUsers?.filter((user: BlockUser) => {
      const userName =
        (user.userInfo?.first_name || '') + ' ' + (user.userInfo?.last_name || '');
      return userName.toLowerCase()?.includes(search.toLowerCase());
    });
  }, [search, blockedUsers]);

  const handleUnblock = async (user: BlockUser) => {
    const userId = user.block_user_id;
    if (!userId) return;

    setUnblockLoadingMap((prev) => new Map(prev).set(userId, true));

    // Try to get created timestamp - check stored value first, then user object
    let timestampToUse: string | undefined = blockCreatedTimestampMap.get(userId) || user.created;

    // If still not found, try to get from the current block list
    if (!timestampToUse) {
      const blockedUserData = blockedUsers.find(
        (block: BlockUser) => block.block_user_id === userId
      );
      timestampToUse = blockedUserData?.created;
    }

    if (!timestampToUse) {
      toast.error('Unable to unblock user: missing block data');
      setUnblockLoadingMap((prev) => {
        const newMap = new Map(prev);
        newMap.delete(userId);
        return newMap;
      });
      return;
    }

    try {
      await friends.unblockUser({
        variables: {
          userId: userId,
          createdAt: timestampToUse,
        },
      });

      if (!friends.status.unblockUser.error) {
        dispatch(setBlockList({ action: 'remove', userId }));
        toast.success('User unblocked successfully');
        friends.status.unblockUser.reset();

        // Remove from local state
        setBlockCreatedTimestampMap((prev) => {
          const newMap = new Map(prev);
          newMap.delete(userId);
          return newMap;
        });

        // Refetch the block list
        infiniteQuery.refetch();
      } else {
        toast.error('Failed to unblock user');
      }
    } catch (error) {
      console.error('Error unblocking user:', error);
      toast.error('Failed to unblock user');
    } finally {
      setUnblockLoadingMap((prev) => {
        const newMap = new Map(prev);
        newMap.delete(userId);
        return newMap;
      });
    }
  };


  return (
    <>
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row justify-between items-center space-y-0 px-6 pt-5 pb-3">
          <div className="space-y-0.5">
            <CardTitle className="text-lg font-bold tracking-tight">Blocked Users</CardTitle>
            <CardDescription className="text-xs">
              Manage users you have blocked
            </CardDescription>
          </div>
          <Input
            className="h-8 w-44 text-xs"
            placeholder="Search by name..."
            onChange={(e) => setSearch(e.target.value)}
          />
        </CardHeader>
        <CardContent className="px-6 pb-6">
          {!infiniteQuery.isFetching && !blockedUsers?.length ? (
            <div className="w-full flex items-center justify-center h-40 text-sm text-muted-foreground italic animate-in fade-in duration-300">
              No blocked users found
            </div>
          ) : (
            filteredBlockedUsers?.map((user: BlockUser) => {
              // The created field is already a timestamp string in milliseconds
              // const dateStamp = user.created || '';
              return (
                <div
                  key={user.block_user_id}
                  className="flex items-center gap-2 justify-between py-1.5"
                >
                  <Link
                    href={`/profile/${user.block_user_id}`}
                    className="flex items-center gap-3"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={user.userInfo?.photo_profile}
                        alt={user.userInfo?.first_name || 'User'}
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
                      {user?.created && (
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(user?.created || 0), { addSuffix: true })}
                        </p>
                      )}
                    </div>
                  </Link>

                  <div className="min-w-20">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnblock(user)}
                      loading={unblockLoadingMap.get(user.block_user_id!)}
                    >
                      Unblock
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

export default BlockedUsersPage;
