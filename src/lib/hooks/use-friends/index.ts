import { useMutation } from '@apollo/client/react';
import type {
  AcceptFriendRequestMutationType,
  AcceptFriendRequestVariablesType,
  BlockUserMutationType,
  BlockUserVariableType,
  CancelFriendRequestMutationType,
  CancelFriendRequestVariablesType,
  RejectFriendRequestMutationType,
  RejectFriendRequestVariablesType,
  RemoveFriendVariablesType,
  RemoveUserFriendMutationType,
  SendFriendRequestMutationType,
  SendFriendRequestVariablesType,
  UnBlockUserMutationType,
  UnBlockUserVariableType,
} from './_interface';
import {
  AcceptFriendRequest,
  BlockUser,
  CancelFriendRequest,
  RejectFriendRequest,
  RemoveFriend,
  SendFriendRequest,
  UnBlockUser,
} from './_mutation';

export const useFriends = () => {
  const [sendFriendRequest, sendFriendRequestState] = useMutation<
    SendFriendRequestMutationType,
    SendFriendRequestVariablesType
  >(SendFriendRequest);
  const [cancelFriendRequest, cancelFriendRequestState] = useMutation<
    CancelFriendRequestMutationType,
    CancelFriendRequestVariablesType
  >(CancelFriendRequest);
  const [acceptFriendRequest, acceptFriendRequestState] = useMutation<
    AcceptFriendRequestMutationType,
    AcceptFriendRequestVariablesType
  >(AcceptFriendRequest);
  const [rejectFriendRequest, rejectFriendRequestState] = useMutation<
    RejectFriendRequestMutationType,
    RejectFriendRequestVariablesType
  >(RejectFriendRequest);
  const [removeFriend, removeFriendState] = useMutation<
    RemoveUserFriendMutationType,
    RemoveFriendVariablesType
  >(RemoveFriend);
  const [blockUser, blockUserState] = useMutation<
    BlockUserMutationType,
    BlockUserVariableType
  >(BlockUser);
  const [unblockUser, unblockUserState] = useMutation<
    UnBlockUserMutationType,
    UnBlockUserVariableType
  >(UnBlockUser)

  return {
    sendFriendRequest,
    cancelFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    blockUser,
    unblockUser,
    removeFriend,
    status: {
      sendFriendRequest: sendFriendRequestState,
      cancelFriendRequest: cancelFriendRequestState,
      acceptFriendRequest: acceptFriendRequestState,
      rejectFriendRequest: rejectFriendRequestState,
      removeFriend: removeFriendState,
      blockUser: blockUserState,
      unblockUser: unblockUserState
    },
  };
};
