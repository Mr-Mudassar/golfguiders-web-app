import type { BuddyPostRequest } from '@/lib/definitions';

export interface GetBuddyRequestsByPostType {
  getBuddyPostRequestByUser: BuddyPostRequest[];
}

//#region Variables

export interface GetBuddyRequestsByPostVariablesType {
  postId: string;
  post_user_id: string;
  page: number;
}
