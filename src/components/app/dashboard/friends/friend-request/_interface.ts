import type { ReceivedFriendRequest } from '@/lib/definitions';

export interface GetReceivedFriendRequestsType {
  getUserFriendReqReceived: {
    values: ReceivedFriendRequest[];
    pageState: number;
  };
}

//#region variables

export interface GetReceivedFriendRequestsVariablesType {
  page: number;
}
