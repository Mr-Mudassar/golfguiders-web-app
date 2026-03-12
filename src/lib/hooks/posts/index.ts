import { useLazyQuery, useMutation } from '@apollo/client/react';

import type { Post } from '@/lib/definitions';

import type {
  RemoveFromFavoriteMutationType,
  RemoveSavePostType,
  AcceptBuddyRequestMutationType,
  AcceptBuddyRequestMutationVariablesType,
  AddToFavoriteMutationType,
  AddToFavoriteMutationVariablesType,
  DeletePostMutationType,
  DeletePostMutationVariablesType,
  GetPostMediaType,
  GetPostMediaVariablesType,
  JoinAsBuddyRequestMutationType,
  JoinAsBuddyRequestMutationVariablesType,
  LikePostMutationType,
  LikePostMutationVariablesType,
  RejectBuddyRequestMutationType,
  RejectBuddyRequestMutationVariablesType,
  SavePostMutationType,
  SavePostMutationVariablesType,
  DeletePostMediaType,
  DeletePostMediaVariableType,
  ReportContentMutationType,
  ReportContentMutationVariablesType,
} from './_interface';
import {
  AcceptBuddyRequestMutation,
  AddToFavoriteMutation,
  DeletePostMedia,
  DeletePostMutation,
  JoinAsBuddyRequestMutation,
  LikePostMutation,
  RejectBuddyRequestMutation,
  RemoveFromFavoriteMutation,
  SavePostMutation,
  UnSavePostMutation,
  ReportContent,
} from './_mutation';
import { GetPostMedia } from './_query';

// ── Individual hooks (mount only what you need) ──────────────────────

export function useLikePost() {
  const [likePost, likePostState] = useMutation<
    LikePostMutationType,
    LikePostMutationVariablesType
  >(LikePostMutation);

  return { likePost, status: likePostState };
}

export function usePostMedia() {
  const [getPostMedia, postMedia] = useLazyQuery<
    GetPostMediaType,
    GetPostMediaVariablesType
  >(GetPostMedia);

  return { getPostMedia, status: postMedia };
}

export function useSendJoinRequest() {
  const [sendJoinRequest, sendJoinRequestState] = useMutation<
    JoinAsBuddyRequestMutationType,
    JoinAsBuddyRequestMutationVariablesType
  >(JoinAsBuddyRequestMutation);

  return { sendJoinRequest, status: sendJoinRequestState };
}

export function useSavePostActions() {
  const [savePost, savePostState] = useMutation<
    SavePostMutationType,
    SavePostMutationVariablesType
  >(SavePostMutation);
  const [unSavePost, unSavePostState] = useMutation<
    RemoveSavePostType,
    SavePostMutationVariablesType
  >(UnSavePostMutation);

  return {
    savePost,
    unSavePost,
    status: { savePost: savePostState, unSavePost: unSavePostState },
  };
}

export function useDeletePostAction() {
  const [deletePostMutation, deletePostState] = useMutation<
    DeletePostMutationType,
    DeletePostMutationVariablesType
  >(DeletePostMutation);

  async function deletePost(post: Post) {
    return await deletePostMutation({
      variables: {
        postid: post.postid!,
        geohash: post.geohash! || 't',
        createdAt: post.created!,
        type: post.type!,
        userTags: post.user_tags!,
        groupTags: post.group_tags!,
      },
    });
  }

  return { deletePost, status: deletePostState };
}

export function useReportContentAction() {
  const [reportContent, reportContentState] = useMutation<
    ReportContentMutationType,
    ReportContentMutationVariablesType
  >(ReportContent);

  return { reportContent, status: reportContentState };
}

export function useBuddyRequestActions() {
  const [acceptBuddyRequest, acceptBuddyRequestState] = useMutation<
    AcceptBuddyRequestMutationType,
    AcceptBuddyRequestMutationVariablesType
  >(AcceptBuddyRequestMutation);

  const [rejectBuddyRequest, rejectBuddyRequestState] = useMutation<
    RejectBuddyRequestMutationType,
    RejectBuddyRequestMutationVariablesType
  >(RejectBuddyRequestMutation);

  return {
    acceptBuddyRequest,
    rejectBuddyRequest,
    status: {
      acceptBuddyRequest: acceptBuddyRequestState,
      rejectBuddyRequest: rejectBuddyRequestState,
    },
  };
}

export function useDeletePostMediaAction() {
  const [deletePostMedia, deletePostMediaState] = useMutation<
    DeletePostMediaType,
    DeletePostMediaVariableType
  >(DeletePostMedia);

  async function deletePostMediaFunc(mediaDetails: DeletePostMediaVariableType) {
    return await deletePostMedia({
      variables: {
        postId: mediaDetails.postId,
        DeletePostMediaInput: mediaDetails.DeletePostMediaInput,
      },
    });
  }

  return { deletePostMediaFunc, status: deletePostMediaState };
}

export function useFavoriteActions() {
  const [addToFavorites, addToFavoritesState] = useMutation<
    AddToFavoriteMutationType,
    AddToFavoriteMutationVariablesType
  >(AddToFavoriteMutation);

  const [removeFav, removeFavState] = useMutation<
    RemoveFromFavoriteMutationType,
    AddToFavoriteMutationVariablesType
  >(RemoveFromFavoriteMutation);

  return {
    addToFavorites,
    removeFav,
    status: { addToFavorites: addToFavoritesState, removeFav: removeFavState },
  };
}

// ── Legacy composite hook (backward-compatible) ──────────────────────

export function usePost() {
  const { likePost, status: likePostState } = useLikePost();
  const { getPostMedia, status: postMedia } = usePostMedia();
  const { sendJoinRequest, status: sendJoinRequestState } = useSendJoinRequest();
  const { savePost, unSavePost, status: saveStatuses } = useSavePostActions();
  const { deletePost, status: deletePostState } = useDeletePostAction();
  const { reportContent, status: reportContentState } = useReportContentAction();
  const { acceptBuddyRequest, rejectBuddyRequest, status: buddyStatuses } = useBuddyRequestActions();
  const { deletePostMediaFunc, status: deletePostMediaState } = useDeletePostMediaAction();
  const { addToFavorites, removeFav, status: favStatuses } = useFavoriteActions();

  return {
    likePost,
    savePost,
    unSavePost,
    addToFavorites,
    removeFav,
    getPostMedia,
    deletePost,
    sendJoinRequest,
    acceptBuddyRequest,
    rejectBuddyRequest,
    deletePostMediaFunc,
    reportContent,
    status: {
      likePost: likePostState,
      savePost: saveStatuses.savePost,
      unSavePost: saveStatuses.unSavePost,
      addToFavorites: favStatuses.addToFavorites,
      removeFav: favStatuses.removeFav,
      deletePost: deletePostState,
      sendJoinRequest: sendJoinRequestState,
      acceptBuddyRequest: buddyStatuses.acceptBuddyRequest,
      rejectBuddyRequest: buddyStatuses.rejectBuddyRequest,
      postMedia,
      deletePostMediaState,
      reportContent: reportContentState,
    }
  };
}

export * from './use-infinite-posts';
export * from './use-infinite-comments';
export * from './use-post-comment';
