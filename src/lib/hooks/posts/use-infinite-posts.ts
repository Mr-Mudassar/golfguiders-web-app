import React from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useLazyQuery } from '@apollo/client/react';
import { MaxPostsDistance, PerPageLimit } from '@/lib/constants';
import type {
  GetBuddyPostsVariablesType,
  GetPostsByCircleType,
  GetPostsByCircleVariablesType,
  GetPostsByDistanceType,
  GetPostsByDistanceVariablesType,
  GetPostsByUserType,
  GetPostsByUserVariablesType,
  GetToDayBuddyPostByUserType,
  GetUpcomingBuddyPostByUserType,
} from './_interface';
import {
  getPostByCricle,
  GetPostsByDistance,
  GetPostsByUserId,
  GetToDayBuddyPostByUser,
  GetUpcomingBuddyPostByUser,
} from './_query';
import type { BuddyPost, Post } from '@/lib/definitions';

const PostsQueries = {
  circle: {
    query: getPostByCricle,
    type: {} as GetPostsByCircleType,
    variables: {} as GetPostsByCircleVariablesType,
    dataKey: 'getPostByCricle',
  },
  distance: {
    query: GetPostsByDistance,
    type: {} as GetPostsByDistanceType,
    variables: {} as GetPostsByDistanceVariablesType,
    dataKey: 'getPostsByDistance',
  },
  today: {
    query: GetToDayBuddyPostByUser,
    type: {} as GetToDayBuddyPostByUserType,
    variables: {} as GetBuddyPostsVariablesType,
    dataKey: 'getToDayBuddyPostByUser',
  },
  upcoming: {
    query: GetUpcomingBuddyPostByUser,
    type: {} as GetUpcomingBuddyPostByUserType,
    variables: {} as GetBuddyPostsVariablesType,
    dataKey: 'getUpcomingBuddyPostByUser',
  },
  user: {
    query: GetPostsByUserId,
    type: {} as GetPostsByUserType,
    variables: {} as GetPostsByUserVariablesType,
    dataKey: 'getPostsByUserId',
  },
} as const;

type PostsType = keyof typeof PostsQueries;

export type PostsFeedType = PostsType;

type QueryVariables = {
  latitude?: number;
  longitude?: number;
  distance?: number;
  userId?: string;
  activeTab?: 'today' | 'upcoming';
};

interface PostRes {
  values: Post[] | BuddyPost[];
}

// Assuming Post has an 'id' property, and BuddyPost has a 'post_id' property
interface UseInfinitePostsType<T extends PostsType> {
  type: T;
  variables?: QueryVariables;
  change?: { activeTab: string; isRefresh: number | null };
  enabled?: boolean;
  initialPageParam?: number;
  refetchOnMount?: boolean | 'always';
  staleTime?: number;
}

export function useInfinitePosts<T extends PostsType>({
  type,
  variables,
  change,
  ...options
}: UseInfinitePostsType<T>) {
  const [hasNextPage, setHasNextPage] = React.useState<boolean>(true);

  const queryConfig = PostsQueries[type];

  const [fetchPosts] = useLazyQuery<
    typeof queryConfig.type,
    typeof queryConfig.variables
  >(queryConfig.query, {
    fetchPolicy: 'cache-and-network',
  });

  const infiniteQuery = useInfiniteQuery({
    queryKey: [
      'posts',
      type,
      variables?.userId,
      variables?.latitude,
      variables?.longitude,
      variables?.distance,
      change?.activeTab,
      change?.isRefresh,
    ],
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await fetchPosts({
        variables: {
          page: pageParam,
          distance: variables?.distance || MaxPostsDistance,
          lat: variables?.latitude || 31,
          lng: variables?.longitude || -74,
          userId: variables?.userId,
          local_date_time: new Date().toISOString(),
          time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      });

      if (!data) return [];

      const posts = data[queryConfig.dataKey as keyof typeof data] as PostRes;

      // Remove duplicates based on post_id (for BuddyPost) or id (for Post)
      const seen = new Set<string>();
      const uniquePosts = posts.values.filter((post) => {
        // Type narrowing based on query type
        if (type === 'today' || type === 'upcoming') {
          const buddyPost = post as BuddyPost;
          if (!buddyPost?.post_id) return false;
          if (seen.has(buddyPost.post_id)) return false;
          seen.add(buddyPost.post_id);
          return true;
        } else {
          const regularPost = post as Post;
          if (!regularPost?.postid) return false; // Assuming Post has 'id'
          if (seen.has(regularPost.postid)) return false;
          seen.add(regularPost.postid);
          return true;
        }
      });

      setHasNextPage(uniquePosts.length === PerPageLimit);
      return uniquePosts;
    },
    getNextPageParam: (lastPage, allPages) => {
      // Only fetch next page if the last page has the expected number of posts
      return lastPage.length === PerPageLimit ? allPages.length + 1 : undefined;
    },
    initialPageParam: options.initialPageParam || 1,
    refetchOnMount: options.refetchOnMount ?? false,
    refetchOnWindowFocus: false,
    staleTime: 2 * 60 * 1000,
    ...options,
  });

  return { ...infiniteQuery, hasNextPage };
}
