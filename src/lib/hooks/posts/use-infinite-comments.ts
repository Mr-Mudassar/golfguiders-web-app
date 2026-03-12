import React from 'react';
import { useLazyQuery } from '@apollo/client/react';
import { useInfiniteQuery } from '@tanstack/react-query';

import type { Comment } from '@/lib/definitions';

import type {
  GetCommentRepliesType,
  GetCommentRepliesVariablesType,
  GetCommentsByPostType,
  GetCommentsByPostVariablesType,
} from './_interface';
import { GetCommentReplies, GetCommentsByPost } from './_query';

const commentsQueries = {
  comments: {
    query: GetCommentsByPost,
    type: {} as GetCommentsByPostType,
    variables: {} as GetCommentsByPostVariablesType,
    dataKey: 'getCommentByPost',
  },
  replies: {
    query: GetCommentReplies,
    type: {} as GetCommentRepliesType,
    variables: {} as GetCommentRepliesVariablesType,
    dataKey: 'getCommentByParentId',
  },
} as const;

type CommentsType = keyof typeof commentsQueries;

type QueryVariables = {
  postId?: string;
  parentId?: string;
};

interface UseInfiniteCommentsProps<T extends CommentsType> {
  type: T;
  variables: QueryVariables;
  /**
   * Set this to false or a function that returns false to disable automatic refetching when the query mounts
   * or changes query keys. To refetch the query, use the refetch method returned from the useQuery instance.
   * Accepts a boolean or function that returns a boolean. Defaults to `true`.
   */
  enabled?: boolean;

  /**
   * Set a number to fetch from a specific page. Defaults to `1`.
   */
  initialPageParam?: number;

  /**
   * Determines if the query should refetch on mount. Can be set to a boolean or `always`. Defaults to `always`.
   */
  refetchOnMount?: boolean | 'always';
}

export function useInfiniteComments<T extends CommentsType>({
  type,
  variables,
  ...options
}: UseInfiniteCommentsProps<T>) {
  const [hasNextPage, sethasNextPage] = React.useState<boolean>(true);

  const queryConfig = commentsQueries[type];

  const [fetchComments] = useLazyQuery<
    typeof queryConfig.type,
    typeof queryConfig.variables
  >(queryConfig.query, { fetchPolicy: 'no-cache' });

  const infiniteQuery = useInfiniteQuery({
    queryKey: ['commentsByPost', type, variables?.postId, variables?.parentId],
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await fetchComments({
        variables: {
          page: pageParam,
          postId: variables.postId,
          parentId: variables.parentId || '',
        },
      });

      if (!data) return;

      const comments = data[
        queryConfig.dataKey as keyof typeof data
      ] as Comment[];

      sethasNextPage(comments.length === 10);
      return comments;
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage && lastPage.length > 0 ? allPages.length + 1 : undefined;
    },
    initialPageParam: options.initialPageParam || 1,
    refetchOnMount: 'always',
    ...options,
  });

  return {
    ...infiniteQuery,
    hasNextPage,
  };
}
