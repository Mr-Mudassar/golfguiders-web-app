import type { BlockUser, SentFriendRequest, UserFriend } from '@/lib/definitions';

export interface SendFriendRequestMutationType {
  sendUserFriendReq: SentFriendRequest;
}

export interface AcceptFriendRequestMutationType {
  acceptFriendReq: boolean;
}

export interface RejectFriendRequestMutationType {
  rejectFriendReq: boolean;
}

export interface RemoveUserFriendMutationType {
  removeUserFriend: UserFriend;
}

export interface CancelFriendRequestMutationType {
  CancelFriendRequest: boolean;
}

export interface BlockUserMutationType {
  blockUser: BlockUser;
}

export interface UnBlockUserMutationType {
  unBlockUser: BlockUser;
}

// Variable Types

export interface SendFriendRequestVariablesType {
  userId: string;
}

export interface CancelFriendRequestVariablesType {
  userId: string;
  createdAt: string;
}

export interface AcceptFriendRequestVariablesType {
  userId: string;
  createdAt: string;
}

export interface RejectFriendRequestVariablesType {
  userId: string;
  createdAt: string;
}

export interface RemoveFriendVariablesType {
  friendId: string;
  createdAt: string;
}

export interface BlockUserVariableType {
  userId: string;
}

export interface UnBlockUserVariableType {
  userId: string;
  createdAt: string;
}
