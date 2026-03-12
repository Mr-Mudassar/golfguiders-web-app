import type {
  ActivityTypePost,
  BuddyPostRequest,
  Comment,
  Post,
  PostMedias,
} from '@/lib/definitions';

export interface GetPostMediaType {
  getPostMediaByPostId: PostMedias[];
}
export interface DeletePostMediaType {
  deletePostMedia: {
    created: string;
  };
}

export interface DeletePostMediaVariableType {
  postId: string;
  DeletePostMediaInput: {
    url: string;
    file_id: string;
    created: string;
  }[];
}

export interface LikePostMutationType {
  likePost: number;
}

export interface SavePostMutationType {
  userSavePost: boolean;
}

export interface RemoveSavePostType {
  removeSavePost: boolean;
}

export interface DeletePostMutationType {
  deletePost: boolean;
}

export interface AddToFavoriteMutationType {
  userFavoritePost: boolean;
}

export interface RemoveFromFavoriteMutationType {
  removeFavoritePost: boolean;
}

export interface GetPostsByCircleType {
  getPostByCricle: {
    values: ActivityTypePost[];
    pageState: number;
  };
}

export interface GetPostsByDistanceType {
  getPostsByDistance: {
    values: ActivityTypePost[];
    pageState: number;
  }
}

export interface GetUpcomingBuddyPostByUserType {
  getUpcomingBuddyPostByUser: {
    values: Post[];
    pageState: number;
  }
}

export interface GetToDayBuddyPostByUserType {
  getToDayBuddyPostByUser: {
    values: Post[];
    pageState: number;
  }
}

export interface GetPostsByUserType {
  getPostsByUserId: {
    values: Post[];
    pageState: number;
  }
}

export interface GetPostsByTypeType {
  getPostsByType: Post[];
}

export interface JoinAsBuddyRequestMutationType {
  createBuddyPostRequest: BuddyPostRequest;
}

export interface AcceptBuddyRequestMutationType {
  acceptBuddyPostRequest: BuddyPostRequest;
}

export interface RejectBuddyRequestMutationType {
  rejectBuddyPostRequest: BuddyPostRequest;
}

export interface GetCommentsByPostType {
  getCommentByPost: Comment[];
}

export interface GetCommentRepliesType {
  getCommentByParentId: Comment[];
}

export interface CreateCommentMutationType {
  createComment: Comment;
}

export interface DeleteCommentMutationType {
  deleteComment: boolean;
}

export interface UpdateCommentMutationType {
  updateComment: Comment;
}

export interface LikeCommentMutationType {
  likeComment: number;
}

//#region Variables

export interface GetPostMediaVariablesType {
  postId: string;
}

export interface LikePostMutationVariablesType {
  postCreatorId: string;
  createdAt: string;
}

export interface SavePostMutationVariablesType {
  postUserId?: string;
  createdAt: string;
  postId: string;
}

// export interface RemoveSavePostMutationVariableType {
//   postId: string;
//   postCreated: string;
//   userId: string;
// }

export interface DeletePostMutationVariablesType {
  postid: string;
  geohash: string;
  createdAt: string;
  type: string;
  userTags: string[];
  groupTags: string[];
}

export interface AddToFavoriteMutationVariablesType {
  postUserId?: string;
  createdAt: string;
  postId: string;
}

export interface GetPostsByCircleVariablesType {
  page: number;
}

export interface GetPostsByDistanceVariablesType {
  page: number;
  lat: number;
  lng: number;
  distance: number;
}

export interface GetBuddyPostsVariablesType {
  page: number;
  local_date_time: string;
  time_zone: string;
}

export interface GetPostsByUserVariablesType {
  page: number;
  userId: string;
  latitude?: number;
  longitude?: number;
}

export interface GetPostsByTypeVariablesType {
  page: number;
  lat: number;
  lng: number;
  distance: number;
  type: string;
}

export interface JoinAsBuddyRequestMutationVariablesType {
  requestInput: {
    post_id: string;
    post_user_id: string;
    post_created: string;
  };
}

export interface AcceptBuddyRequestMutationVariablesType {
  requestInput: {
    post_id: string,
    post_created: string,
    pending_req_user_id: string,
    buddy_req_created: string,
    post_date_from: string,
    post_date_to: string,
  };
}

export interface RejectBuddyRequestMutationVariablesType {
  requestInput: {
    post_id: string,
    post_created: string,
    pending_req_user_id: string,
    buddy_req_created: string,
    post_date_from: string,
    post_date_to: string,
  };
}

export interface GetCommentsByPostVariablesType {
  postId: string;
  page: number;
}

export interface GetCommentRepliesVariablesType {
  parentId: string;
  page: number;
}

export interface CreateCommentMutationVariablesType {
  postUserId: string;
  postCreated: string;
  commentInput: {
    post_id: string;
    comment: string;
    parent_id?: string;
    reply_count?: number;
    parent_comment_created?: string;
    status?: string;
    type?: string;
  };
}

export interface DeleteCommentMutationVariablesType {
  postId: string;
  createdAt: string;
  postUid: string;
  postCreated: string;
  commentId: string;
}

export interface UpdateCommentMutationVariablesType {
  updateCommentInput: {
    comment_id?: string;
    post_id: string;
    created: string;
    comment?: string;
    parent_id?: string;
    reply_count?: number;
    status?: string;
    type?: string;
    modified?: string;
    likes?: string[];
  };
}

export interface LikeCommentMutationVariablesType {
  postId: string;
  commentCreatedAt: string;
  postUid: string;
  postCreated: string;
}

export interface ReportContentMutationType {
  reportContent: {
    reported_content_id: string;
    reported_content_created: string;
    reporter_user_id: string;
    reported_user_id: string;
    content_type: string;
    notes: string;
    created: string;
    report_id: string;
    report_status: string;
  };
}

export interface ReportContentMutationVariablesType {
  reportContentInput: {
    reported_content_id: string;
    reported_content_created: string;
    reported_user_id: string;
    content_type: string;
    notes: string;
  };
}