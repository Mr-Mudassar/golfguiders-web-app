import type { SentFriendRequest } from '@/lib/definitions';

export interface GetSentFriendRequestsType {
  getUserFriendReqSent: {
    count: number;
    values: SentFriendRequest[];
    pageState: number;
  };
}

//#region variables

export interface GetSentFriendRequestsVariablesType {
  page: number;
}
