import type { ActivityTypePost } from '@/lib/definitions';

export interface GetSavedPostsType {
  getSavePostByUserId: {
    values: ActivityTypePost[];
    pageState: string | null;
  };
}

//#region Variables

export interface GetSavedPostsVariablesType {
  page: number;
}
