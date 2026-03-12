// 'use client';

// import { Button, Icon } from '@/components/ui';
// import { useFriends } from '@/lib';
// import type { User } from '@/lib/definitions';
// import { cn } from '@/lib/utils';
// import Link from 'next/link';
// import React from 'react';

// interface IFriendButtonProps {
//   readonly className?: string;
//   profile: User;
// }

// const FriendButton: React.FC<IFriendButtonProps> = ({ className, profile }) => {
//   const friends = useFriends();

//   const classes = React.useMemo(() => cn('w-full', className), [className]);

//   /**
//    * Returns the friend object if the profile user is already in the authenticated user's friend list.
//    */
//   const friend = React.useMemo(() => {
//     return friends.status.friendsList.data?.getUserFriendList.values.find(
//       (f) => f.friend_user_id === profile.userid
//     );
//   }, [friends.status.friendsList.data, profile]);

//   /**
//    * Returns the friend request object if a request has already been sent by the authenticated user to the profile user.
//    */
//   const sentRequest = React.useMemo(() => {
//     return friends.status.sentRequests.data?.getUserFriendReqSent.values.find(
//       (r) => r.to_user_id === profile.userid
//     );
//   }, [friends.status.sentRequests.data, profile]);

//   /**
//    * Returns the friend request object if a request has been received from the profile user to the authenticated user.
//    */
//   const friendRequest = React.useMemo(() => {
//     return friends.status.friendRequests.data?.getUserFriendisReqReceived.values.find(
//       (r) => r.from_user_id === profile.userid
//     );
//   }, [friends.status.friendRequests.data, profile]);

//   return friend ? (
//     <div className="flex gap-2">
//     <Button className={classes} variant="outline" asChild>
//       <Link href={`/messages/${profile.userid}`}>
//         {rejLoad && <Icon name="message" className="mr-2" size={18} />}
//         Message
//       </Link>
//     </Button>

//     <Button
//       className={classes}
//       variant="destructive"
//       onClick={async () => {
//         await friends.removeFriend({
//           variables: {
//             friendId: friend.friend_user_id!,
//             createdAt: friend.created!,
//           },
//         });
//         await friends.status.friendsList.refetch();
//         friends.status.removeFriend.reset();
//       }}
//       loading={friends.status.removeFriend.loading}
//       disabled={!!friends.status.removeFriend.data}
//     >
//       {rejLoad && <Icon name="user-minus" className="mr-2" size={18} />}
//       Remove
//     </Button>
//   </div>
//   ) : sentRequest ? (
//     <Button
//       className={classes}
//       variant={'outline'}
//       onClick={async () => {
//         await friends.cancelFriendRequest({
//           variables: {
//             userId: sentRequest.to_user_id!,
//             createdAt: sentRequest.created!,
//           },
//         });
//         await friends.status.sentRequests.refetch();
//         friends.status.cancelFriendRequest.reset();
//       }}
//       loading={friends.status.cancelFriendRequest.loading}
//       disabled={!!friends.status.cancelFriendRequest.data}
//     >
//       Cancel Request
//     </Button>
//   ) : friendRequest ? (
//     <Button
//       className={classes}
//       onClick={async () => {
//         await friends.acceptFriendRequest({
//           variables: {
//             userId: friendRequest.from_user_id!,
//             createdAt: friendRequest.created!,
//           },
//         });
//         await friends.status.friendsList.refetch();
//         friends.status.acceptFriendRequest.reset();
//       }}
//       loading={friends.status.acceptFriendRequest.loading}
//       disabled={!!friends.status.acceptFriendRequest.data}
//     >
//       Accept Friend Request
//     </Button>
//   ) : (
//     <Button
//       className={classes}
//       onClick={async () => {
//         await friends.sendFriendRequest({
//           variables: {
//             userId: profile.userid!,
//           },
//         });
//         await friends.status.sentRequests.refetch();
//         friends.status.sendFriendRequest.reset();
//       }}
//       loading={friends.status.sendFriendRequest.loading}
//       disabled={!!friends.status.sendFriendRequest.data}
//     >
//       {rejLoad && <Icon name="user-plus" className="mr-3" size={20} />}
//       Add Friend
//     </Button>
//   );
// };

// export { FriendButton };
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { usePathname, useRouter } from '@/i18n/routing';
import { useAppDispatch, useAppSelector, useFriends } from '@/lib';
import {
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  Icon,
} from '@/components/ui';
import { cn, getName } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import {
  useFetchAllFriends,
  useFetchSentReq,
  useReqReceive,
} from '@/lib/hooks/use-user';
import {
  setFriendList,
  setSentReqList,
  setReceivedReq,
  setBlockList,
  setSentFriendRequestCount,
  setAllFriendsCount,
} from '@/lib/redux/slices';
import type {
  ReceivedFriendRequest,
  SentFriendRequest,
  UserFriend,
} from '@/lib/definitions';
import dynamic from 'next/dynamic';

const ShareDialog = dynamic(() =>
  import('@/components/common').then((mod) => mod.ShareDialog)
);
const ConfirmationModal = dynamic(() =>
  import('@/components/common/confirmationDialog').then(
    (mod) => mod.ConfirmationModal
  )
);

interface ICacheSent {
  pageParams: number[];
  pages: SentFriendRequest[][];
}

interface ICacheRec {
  pageParams: number[];
  pages: ReceivedFriendRequest[][];
}

interface ICacheFriend {
  pageParams: number[];
  pages: UserFriend[][];
}

const FriendButton = ({
  friendProfile = false,
  userId,
  classes,
}: {
  friendProfile?: boolean;
  userId: string;
  classes?: string;
}) => {
  const dispatch = useAppDispatch();
  const client = useQueryClient();
  const t = useTranslations('profilePage.friends');
  const auth = useAppSelector((s) => s.auth.user);
  const sentFriendRequestCount: number | null = useAppSelector(
    (state) => state.user.sentFriendRequestCount
  );
  const allFriendsCount: number | null = useAppSelector(
    (state) => state.user.allFriendsCount
  );

  const friends = useFriends();
  // Only enable these APIs on their respective pages:
  // - GetUserFriendList should only be called on /dashboard/friends/all
  // - GetUserFriendReqSent should only be called on /dashboard/friends/requests
  const pathname = usePathname();
  const router = useRouter();
  const isOnAllFriendsPage = pathname?.includes('/dashboard/friends/all');
  const isOnRequestsPage = pathname?.includes('/dashboard/friends/requests');

  // Only fetch on their respective pages
  const { mergedList: friendsList } = useFetchAllFriends(undefined, isOnAllFriendsPage);
  const { mergedList: sentRequests } = useFetchSentReq(isOnRequestsPage);
  const { mergedList: friendRequests } = useReqReceive();

  const friendIds = useAppSelector((state) => state.user.friendIds);
  const sentReqList = useAppSelector((state) => state.user.sentRequests);
  const receiveReq = useAppSelector((state) => state.user.receiveReq);
  const blockedUsers = useAppSelector((state) => state.user.blockedUsers);

  const friendCreated = friendsList?.find((f) => f.friend_user_id === userId);
  const isFriend = Boolean(friendIds.includes(userId) || friendCreated);

  const reqRecUser = friendRequests?.find((f) => f.from_user_id === userId);
  const isReqReceived = Boolean(receiveReq.includes(userId) || reqRecUser);

  const sentReqUser = sentRequests?.find((f) => f.to_user_id === userId);
  const isRequestSent = Boolean(sentReqList.includes(userId) || sentReqUser);

  const isBlocked = blockedUsers.includes(userId);

  // Note: Block data is now retrieved dynamically in handleUnblockNonFriend
  // to ensure we always have the latest data from blockList or refetch

  const [openConfirm, setOpenConfirm] = useState<boolean>(false);
  const [openBlockModal, setOpenBlockModal] = useState<boolean>(false);

  // --------------------------------
  //          ✅ Handlers
  // --------------------------------

  const handleAdd = async () => {
    const optimisticRequest: SentFriendRequest = {
      to_user_id: userId,
      user_id: auth?.userid ?? '',
      friend_user_id: userId,
      created: new Date().toISOString(),
      userInfo: undefined, // Will be populated by server response if needed
    };

    try {
      // Optimistic: Update Redux + RQ cache immediately
      dispatch(setSentReqList({ action: 'add', userId }));

      client.setQueryData<ICacheSent>(['sentFriendRequests'], (oldData) => {
        if (!oldData) return { pageParams: [1], pages: [[optimisticRequest]] };
        const pages = [...oldData.pages];
        if (pages.length > 0) {
          pages[0] = [optimisticRequest, ...pages[0]]; // Prepend to first page
        } else {
          pages.push([optimisticRequest]);
        }
        return { ...oldData, pages };
      });

      const result = await friends.sendFriendRequest({ variables: { userId } });

      // Replace optimistic request with real one (has server-generated created timestamp)
      const realRequest = result.data?.sendUserFriendReq;
      if (realRequest?.created) {
        client.setQueryData<ICacheSent>(['sentFriendRequests'], (oldData) => {
          if (!oldData) return oldData;
          const pages = oldData.pages.map((page) =>
            page.map((req) =>
              req.created === optimisticRequest.created
                ? { ...optimisticRequest, ...realRequest }
                : req
            )
          );
          return { ...oldData, pages };
        });
      }

      toast.success(t('addFriend.success'));
    } catch (err) {
      console.error(err);
      // Rollback: Remove from Redux + RQ cache
      dispatch(setSentReqList({ action: 'remove', userId }));
      client.setQueryData<ICacheSent>(['sentFriendRequests'], (oldData) => {
        if (!oldData) return oldData;
        const pages = oldData.pages.map((page) =>
          page.filter((req) => req.created !== optimisticRequest.created)
        );
        return { ...oldData, pages };
      });
      toast.error(t('addFriend.error'));
    }
  };

  // ------------------- Remove -----------------------

  const handleRemove = async () => {
    if (!friendCreated) {
      toast.error(t('removeFriend.error'));
      return;
    }
    try {
      await friends.removeFriend({
        variables: {
          friendId: friendCreated.friend_user_id,
          createdAt: friendCreated.created,
        },
      });
      await client.setQueryData<ICacheFriend>(['userFriendList'], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) =>
            page.filter((f) => f.friend_user_id !== userId)
          ),
        };
      });

      dispatch(setFriendList({ action: 'remove', userId }));
      dispatch(setSentReqList({ action: 'remove', userId }));

      toast.success(t('removeFriend.success'));
      dispatch(setAllFriendsCount(allFriendsCount - 1));
    } catch (err) {
      console.error(err);
      dispatch(setFriendList({ action: 'add', userId }));
      toast.error(t('removeFriend.error'));
    }
  };

  // ---------------------- Block Friend ---------------------------

  const handleBlock = async () => {
    // Can block both friends and non-friends
    const targetUserId = friendCreated?.friend_user_id || userId;

    try {
      // Optimistic: Update Redux immediately
      dispatch(setBlockList({ action: 'add', userId }));
      if (friendCreated) {
        dispatch(setAllFriendsCount(allFriendsCount - 1));
      }

      await friends.blockUser({
        variables: {
          userId: targetUserId,
        },
      });

      if (friends.status.blockUser.error) {
        // Rollback on error
        dispatch(setBlockList({ action: 'remove', userId }));
        if (friendCreated) {
          dispatch(setAllFriendsCount(allFriendsCount + 1));
        }
        toast.error(t('blockFriend.error'));
        friends.status.blockUser.reset();
      } else {
        friends.status.blockUser.reset();
        toast.success(t('blockFriend.success'));
      }
    } catch (err) {
      console.error(err);
      // Rollback: Restore Redux state
      dispatch(setBlockList({ action: 'remove', userId }));
      if (friendCreated) {
        dispatch(setAllFriendsCount(allFriendsCount + 1));
      }
      toast.error(t('blockFriend.error'));
    }
  };

  // ---------------------- Block Non-Friend ---------------------------

  const handleBlockNonFriend = async () => {
    try {
      // Optimistic: Update Redux immediately
      dispatch(setBlockList({ action: 'add', userId }));

      const result = await friends.blockUser({
        variables: {
          userId: userId,
        },
      });

      if (friends.status.blockUser.error) {
        // Rollback
        dispatch(setBlockList({ action: 'remove', userId }));
        toast.error(t('blockFriend.error'));
        friends.status.blockUser.reset();
      } else {
        friends.status.blockUser.reset();
        toast.success(t('blockFriend.success'));
      }
    } catch (err) {
      console.error(err);
      // Rollback
      dispatch(setBlockList({ action: 'remove', userId }));
      toast.error(t('blockFriend.error'));
    }
  };

  // ------------------- Accept Receive Request -----------------------

  const handleAccept = async () => {
    const name = getName(
      reqRecUser?.userInfo?.first_name,
      reqRecUser?.userInfo?.last_name
    );
    try {
      await friends.acceptFriendRequest({
        variables: {
          userId: reqRecUser?.from_user_id!,
          createdAt: reqRecUser?.created!,
        },
      });

      await client.setQueryData<ICacheRec>(['getRequests'], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) =>
            page.filter((f) => f.from_user_id !== userId)
          ),
        };
      });
      dispatch(setFriendList({ action: 'add', userId }));
      dispatch(setReceivedReq({ action: 'remove', userId }));

      await client.invalidateQueries({ queryKey: ['userFriendList'] });
      toast.success(t('reqReceive.accept.toast', { name }));
      dispatch(setAllFriendsCount(allFriendsCount + 1));
    } catch (err) {
      console.error(err);
      toast.error(t('reqReceive.accept.error', { name }));
    }
  };

  // ------------------- Reject Receive Request -----------------------

  const handleReject = async () => {
    const name = getName(
      reqRecUser?.userInfo?.first_name,
      reqRecUser?.userInfo?.last_name
    );
    try {
      await friends.rejectFriendRequest({
        variables: {
          userId: reqRecUser?.from_user_id!,
          createdAt: reqRecUser?.created!,
        },
      });

      await client.setQueryData<ICacheRec>(['getRequests'], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) =>
            page.filter((f) => f.from_user_id !== userId)
          ),
        };
      });
      dispatch(setReceivedReq({ action: 'remove', userId }));
      await client.invalidateQueries({ queryKey: ['getRequests'] });
      toast.success(t('reqReceive.reject.toast', { name }));
    } catch (err) {
      console.error(err);
      toast.error(t('reqReceive.reject.error', { name }));
    }
  };

  // ---------------------------------------------------
  //               ✅ Render Button Logic
  // ---------------------------------------------------

  if (isFriend) {
    const remLoad = friends.status.removeFriend.loading;
    const blockLoad = friends.status.blockUser.loading;
    if (friendProfile) {
      return (
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                loading={remLoad || blockLoad}
              >
                {!(remLoad || blockLoad) && <Icon name="more-horizontal" size={18} />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onSelect={() => setOpenConfirm(true)}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <Icon name="user-minus" className="mr-2" size={16} />
                {t('removeFriend.label')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => setOpenBlockModal(true)}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <Icon name="lock" className="mr-2" size={16} />
                {t('blockFriend.label')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ConfirmationModal
            title={t('removeFriend.confirm.title')}
            description={t('removeFriend.confirm.description')}
            confirmText={t('removeFriend.confirm.confirm')}
            cancelText={t('removeFriend.confirm.cancel')}
            isLoading={remLoad}
            variant="destructive"
            onConfirm={() => {
              handleRemove();
              setOpenConfirm(false);
            }}
            open={openConfirm}
            onOpenChange={setOpenConfirm}
          />

          <ConfirmationModal
            title={t('blockFriend.confirm.title')}
            description={t('blockFriend.confirm.description')}
            confirmText={t('blockFriend.confirm.confirm')}
            cancelText={t('blockFriend.confirm.cancel')}
            isLoading={friends.status.blockUser.loading}
            variant="destructive"
            onConfirm={() => {
              handleBlock();
              setOpenBlockModal(false);
            }}
            open={openBlockModal}
            onOpenChange={setOpenBlockModal}
          />
        </div>
      );
    }

    return (
      <div className="flex gap-2 items-center">
        <Button
          className={cn(
            'w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-md',
            classes
          )}
          asChild
        >
          <Link href={`/profile/${userId}`}>{t('view')}</Link>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              loading={remLoad || blockLoad}
              variant="ghost"
              size="icon"
              className="border"
            >
              {!remLoad && <Icon name="more-horizontal" size={20} />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onSelect={() => setOpenConfirm(true)}
              className="text-red-600 focus:text-red-600 cursor-pointer"
            >
              {!remLoad && (
                <Icon name="user-minus" className="mr-2" size={16} />
              )}
              {remLoad ? t('removeFriend.loading') : t('removeFriend.label')}
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => setOpenBlockModal(true)}
              className="text-red-600 focus:text-red-600 cursor-pointer"
            >
              {!blockLoad && <Icon name="user" className="mr-2" size={16} />}
              {blockLoad ? t('blockFriend.loading') : t('blockFriend.label')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <ConfirmationModal
          title={t('removeFriend.confirm.title')}
          description={t('removeFriend.confirm.description')}
          confirmText={t('removeFriend.confirm.confirm')}
          cancelText={t('removeFriend.confirm.cancel')}
          isLoading={remLoad}
          variant="destructive"
          onConfirm={() => {
            handleRemove();
            setOpenConfirm(false);
          }}
          open={openConfirm}
          onOpenChange={setOpenConfirm}
        />

        <ConfirmationModal
          title={t('blockFriend.confirm.title')}
          description={t('blockFriend.confirm.description')}
          confirmText={t('blockFriend.confirm.confirm')}
          cancelText={t('blockFriend.confirm.cancel')}
          isLoading={friends.status.blockUser.loading}
          variant="destructive"
          onConfirm={() => {
            handleBlock();
            setOpenConfirm(false);
          }}
          open={openBlockModal}
          onOpenChange={setOpenBlockModal}
        />
      </div>
    );
  }

  // ---------------------------------------------------------

  if (isRequestSent && !isReqReceived) {
    return (
      <Button
        onClick={() => router.push('/dashboard/friends/requests')}
        className="w-full flex items-center justify-center gap-1"
        variant="outline"
      >
        <Icon name="user-minus" className="mr-2" size={16} />
        {t('requested.label')}
      </Button>
    );
  }

  // ---------------------------------------------------------

  if (isReqReceived && !isRequestSent) {
    const rejLoad = friends.status.rejectFriendRequest.loading;
    const acceptLoad = friends.status.acceptFriendRequest.loading;
    return (
      <>
        <Button
          onClick={handleReject}
          loading={rejLoad}
          className="w-full"
          variant="outline"
        >
          {rejLoad && <Icon name="user-minus" className="mr-2" size={16} />}
          {rejLoad
            ? t('reqReceive.reject.loading')
            : t('reqReceive.reject.label')}
        </Button>
        <Button onClick={handleAccept} className="w-full" variant="default">
          {!acceptLoad && <Icon name="user-plus" className="mr-2" size={16} />}
          {acceptLoad
            ? t('reqReceive.accept.loading')
            : t('reqReceive.accept.label')}
        </Button>
      </>
    );
  }

  // ---------------------------------------------------------

  const addLoad = friends.status.sendFriendRequest.loading;
  const blockLoad = friends.status.blockUser.loading;

  return (
    <div
      className={cn('flex items-center gap-2', friendProfile ? '' : '')}
    >
      <Button
        onClick={handleAdd}
        loading={addLoad}
        className={cn(friendProfile ? '' : 'w-full', classes)}
      >
        {!addLoad && <Icon name="user-plus" className="mr-2" size={16} />}
        {addLoad ? t('addFriend.loading') : t('addFriend.label')}
      </Button>
      {friendProfile && (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                loading={blockLoad}
              >
                {!blockLoad && (
                  <Icon name="more-horizontal" size={18} />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onSelect={isBlocked ? () => router.push('/dashboard/friends/blocked') : () => setOpenBlockModal(true)}
                className={cn(
                  'cursor-pointer',
                  isBlocked ? 'text-primary focus:text-primary' : 'text-destructive focus:text-destructive'
                )}
              >
                <Icon name={isBlocked ? 'undo' : 'lock'} className="mr-2" size={16} />
                {isBlocked ? 'Unblock User' : t('blockFriend.label')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ConfirmationModal
            title={t('blockFriend.confirm.title')}
            description={t('blockFriend.confirm.description')}
            confirmText={t('blockFriend.confirm.confirm')}
            cancelText={t('blockFriend.confirm.cancel')}
            isLoading={blockLoad}
            variant="destructive"
            onConfirm={() => {
              handleBlockNonFriend();
              setOpenBlockModal(false);
            }}
            open={openBlockModal}
            onOpenChange={setOpenBlockModal}
          />
        </>
      )}
    </div>
  );
};

export { FriendButton };
