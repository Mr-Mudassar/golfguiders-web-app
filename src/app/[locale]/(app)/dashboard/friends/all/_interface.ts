import type { BlockUser, UserFriend } from '@/lib/definitions';

export interface GetUserFriendListType {
  getUserFriendList: {
    values: UserFriend[];
    pageState: number;
  };
}

export interface GetUserFriendListVariables {
  page: number;
}


export interface GetUserFriendListById {
  getUserFriendListByFriendId: {
    values: UserFriend[];
    pageState: number;
  };
}

export interface GetFriendListByIdVariables {
  friendId: string | string[];
  page: number;
}

export interface GetBlockListType {
  getBlockedListByUser: BlockUser[];
}

export interface GetBlockListVariable {
  page: number;
}


export interface GetIsBlockType {
  isBlockedUser: boolean;
}
export interface GetIsBlockVariableType {
  userId: string;
}
