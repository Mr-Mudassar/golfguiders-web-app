import { useMutation } from '@apollo/client/react';

import type {
  LikeCommentMutationType,
  LikeCommentMutationVariablesType,
  CreateCommentMutationType,
  CreateCommentMutationVariablesType,
  DeleteCommentMutationType,
  DeleteCommentMutationVariablesType,
  UpdateCommentMutationType,
  UpdateCommentMutationVariablesType,
} from './_interface';
import {
  CreateCommentMutation,
  DeleteCommentMutation,
  LikeCommentMutation,
  UpdateCommentMutation,
} from './_mutation';

export function usePostComment() {
  const [createComment, createCommentState] = useMutation<
    CreateCommentMutationType,
    CreateCommentMutationVariablesType
  >(CreateCommentMutation);

  const [deleteComment, deleteCommentState] = useMutation<
    DeleteCommentMutationType,
    DeleteCommentMutationVariablesType
  >(DeleteCommentMutation);

  const [updateComment, updateCommentState] = useMutation<
    UpdateCommentMutationType,
    UpdateCommentMutationVariablesType
  >(UpdateCommentMutation);

  const [likeComment, likeCommentState] = useMutation<
    LikeCommentMutationType,
    LikeCommentMutationVariablesType
  >(LikeCommentMutation);

  return {
    createComment,
    deleteComment,
    likeComment,
    updateComment,
    status: {
      createComment: createCommentState,
      deleteComment: deleteCommentState,
      likeComment: likeCommentState,
      updateComment: updateCommentState
    },
  };
}
