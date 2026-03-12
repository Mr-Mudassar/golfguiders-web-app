import React from 'react';
import { useLazyQuery } from '@apollo/client/react';
import { useIntersectionObserver } from 'usehooks-ts';
import {
  GetSavedPosts,
} from '@/components/app/dashboard/posts/_query';
import type {
  GetSavedPostsType,
  GetSavedPostsVariablesType,
} from '@/components/app/dashboard/posts/_interface';
import { useInfiniteQuery } from '@tanstack/react-query';

// 🚀 Hook for Saved Posts
function useFetchSavedPosts() {
  const observer = useIntersectionObserver({ rootMargin: '100px' });
  const [hasNextPage, setHasNextPage] = React.useState(true);
  const [fetchPosts] = useLazyQuery<GetSavedPostsType, GetSavedPostsVariablesType>(GetSavedPosts, {
    fetchPolicy: 'no-cache',
  });

  const queryFn = async ({ pageParam = 1 }) => {
    const { data } = await fetchPosts({ variables: { page: pageParam } });
    if (!data) return [];
    setHasNextPage(!!data.getSavePostByUserId.pageState);
    return data.getSavePostByUserId.values;
  };

  const savedPostQuery = useInfiniteQuery({
    queryKey: ['getSavedPosts'],
    queryFn,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage && lastPage.length > 0 ? allPages.length + 1 : undefined;
    },
    staleTime: 2 * 60 * 1000,
    initialPageParam: 1,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // Flatten all pages
  const savedPosts = React.useMemo(() => {
    return savedPostQuery?.data?.pages.flat() ?? [];
  }, [savedPostQuery.data]);

  // // Dispatch each post to Redux
  // React.useEffect(() => {
  //   if (savedPosts.length > 0) {
  //     savedPosts.forEach((post: Post) => {
  //       if (post?.postid) {
  //         dispatch(setSavedList({ postId: post.postid, action: 'add' }));
  //       }
  //     });
  //   }
  // }, [savedPosts, dispatch]);

  // Auto-fetch next page (do not depend on savedPostQuery object to avoid loop when API responds)
  const { fetchNextPage, isFetchingNextPage } = savedPostQuery;
  React.useEffect(() => {
    if (
      observer.isIntersecting &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [observer.isIntersecting, hasNextPage, isFetchingNextPage]);

  // Find a specific post easily
  const findPost = (postId: string) => {
    return savedPosts.find(post => post?.postid === postId);
  };

  return {
    savedPostQuery,
    savedPosts,
    findPost,
    observer,
  };
}

export { useFetchSavedPosts }