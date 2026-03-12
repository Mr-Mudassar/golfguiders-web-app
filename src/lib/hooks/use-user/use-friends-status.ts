import {
  GetBlockList,
  GetFriendListById,
  GetUserFriendList,
  GetSentFriendRequests,
  type GetBlockListType,
  type GetBlockListVariable,
  type GetUserFriendListType,
  type GetUserFriendListById,
  type GetSentFriendRequestsType,
  type GetUserFriendListVariables,
  type GetFriendListByIdVariables,
  type GetSentFriendRequestsVariablesType,
} from '@/app/[locale]/(app)/dashboard/friends';
import React from 'react';
import { useIntersectionObserver } from 'usehooks-ts';
import { useAppDispatch, useAppSelector } from '../..';
import { useInfiniteQuery } from '@tanstack/react-query';
import { usePaginatedQuery } from './use-paginated-query';
import { useLazyQuery, useQuery } from '@apollo/client/react';
import { GetReceivedFriendRequests } from '@/components/app/dashboard/friends/friend-request/_query';
import { GetUserFriendRecommendations } from '@/components/app/dashboard/friends/people-you-may-know/_query';
import {
  setBlockList,
  setFriendList,
  setReceivedReq,
  setSentFriendRequestCount,
  setSentReqList,
} from '@/lib/redux/slices';
import type {
  GetReceivedFriendRequestsType,
  GetReceivedFriendRequestsVariablesType,
} from '@/components/app/dashboard/friends/friend-request/_interface';
import type {
  GetFriendRecommendVariableType,
  GetUserFriendRecommendationsQueryType,
} from '@/components/app/dashboard/friends/people-you-may-know/_interface';

function useFetchAllFriends(pageNum?: number, enabled?: boolean) {
  const [fetchDefaultFriends] = useLazyQuery<
    GetUserFriendListType,
    GetUserFriendListVariables
  >(GetUserFriendList, {
    fetchPolicy: 'no-cache',
  });

  const queryFn = async (page: number = 1) => {
    try {
      const { data, error } = await fetchDefaultFriends({
        variables: { page },
      });

      // If there's an error, throw it to stop retries
      if (error) {
        console.error('Error fetching all friends:', error);
        throw error;
      }

      return data?.getUserFriendList?.values || [];
    } catch (err) {
      console.error('Error in fetchAllFriends query:', err);
      throw err; // Re-throw to stop infinite query from retrying
    }
  };

  return usePaginatedQuery(['userFriendList'], queryFn, {
    reduxFunc: setFriendList,
    extractUserId: (item) => item.friend_user_id,
    enabled: enabled !== false, // Only fetch if enabled is not explicitly false
  });
}

export const useFetchPeopleFriends = ({
  search,
  friendId,
}: {
  search?: string;
  friendId: string;
}) => {
  const [hasNextPage, setHasNextPage] = React.useState(true);
  const friendsObserver = useIntersectionObserver({
    initialIsIntersecting: false, // Changed to false to prevent immediate fetch
    rootMargin: '100px',
  });

  // Reset hasNextPage and error when friendId changes
  React.useEffect(() => {
    setHasNextPage(true);
    setHasError(false);
  }, [friendId]);

  const [fetchFriendsList] = useLazyQuery<
    GetUserFriendListById,
    GetFriendListByIdVariables
  >(GetFriendListById, {
    fetchPolicy: 'no-cache',
  });

  const [hasError, setHasError] = React.useState(false);

  const friendsQuery = useInfiniteQuery({
    queryKey: ['userFriends', friendId],
    queryFn: async ({ pageParam = 1 }) => {
      if (!friendId) return []; // Early return if no friendId

      try {
        const { data, error } = await fetchFriendsList({
          variables: {
            friendId,
            page: pageParam || 1,
          },
        });

        // If there's an error, stop fetching
        if (error) {
          console.error('Error fetching friends list:', error);
          setHasError(true);
          setHasNextPage(false);
          return [];
        }

        if (!data) {
          setHasNextPage(false);
          return [];
        }

        const friendsList = data.getUserFriendListByFriendId?.values;
        setHasNextPage(!!data.getUserFriendListByFriendId?.pageState);
        setHasError(false); // Reset error on success

        return friendsList || [];
      } catch (err) {
        console.error('Error in friends query:', err);
        setHasError(true);
        setHasNextPage(false);
        return [];
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length === 0) return undefined;
      return allPages.length + 1;
    },
    initialPageParam: 1,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 0,
    enabled: !!friendId && friendId.length > 0 && !hasError,
  });

  // Merge all pages into a single friends list
  const peopleFriends = React.useMemo(() => {
    return friendsQuery.data?.pages.reduce((acc, page) => {
      if (!page) return acc;
      if (!acc) return page;
      return [...acc, ...page];
    }, []);
  }, [friendsQuery.data]);

  // Filter friends based on search query
  const filteredFriends = React.useMemo(() => {
    if (!search || !peopleFriends) return peopleFriends;

    return peopleFriends.filter((friend) => {
      const userName = `${friend.userInfo.first_name} ${friend.userInfo.last_name}`;
      return userName.toLowerCase().includes(search.toLowerCase());
    });
  }, [search, peopleFriends]);

  // Store fetchNextPage in a ref to avoid dependency issues
  const fetchNextPageRef = React.useRef(friendsQuery.fetchNextPage);
  React.useEffect(() => {
    fetchNextPageRef.current = friendsQuery.fetchNextPage;
  }, [friendsQuery.fetchNextPage]);

  // Fetch next page when observer intersects and there's more data
  // Use specific properties instead of the entire friendsQuery object to prevent infinite loops
  React.useEffect(() => {
    // Don't fetch if no friendId, error occurred, or if already fetching/loading
    if (
      !friendId ||
      hasError ||
      !friendsObserver.isIntersecting ||
      !hasNextPage ||
      friendsQuery.isFetching ||
      friendsQuery.isLoading ||
      friendsQuery.isError
    ) {
      return;
    }

    // Use a small delay to prevent rapid successive calls
    const timeoutId = setTimeout(() => {
      if (
        hasNextPage &&
        !hasError &&
        !friendsQuery.isFetching &&
        !friendsQuery.isLoading &&
        !friendsQuery.isError
      ) {
        fetchNextPageRef.current();
      }
    }, 100);

    return () => clearTimeout(timeoutId);
    // Intentionally exclude friendsQuery object to prevent infinite loops
    // We only depend on specific properties that indicate query state
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    friendId,
    hasError,
    friendsObserver.isIntersecting,
    hasNextPage,
    friendsQuery.isFetching,
    friendsQuery.isLoading,
    friendsQuery.isError,
  ]);

  return { filteredFriends, peopleFriends, friendsQuery, friendsObserver };
};

function useReqReceive() {
  const [fetchRequests] = useLazyQuery<
    GetReceivedFriendRequestsType,
    GetReceivedFriendRequestsVariablesType
  >(GetReceivedFriendRequests, {
    fetchPolicy: 'no-cache',
  });

  const queryFn = async (page: number) => {
    const { data, error } = await fetchRequests({ variables: { page } });
    if (error) throw error;
    return data?.getUserFriendReqReceived?.values || [];
  };

  return usePaginatedQuery(['getRequests'], queryFn, {
    reduxFunc: setReceivedReq,
    extractUserId: (item) => item.from_user_id,
  });
}

function useFetchSentReq(enabled?: boolean) {
  const dispatch = useAppDispatch();
  const [fetchSentRequests] = useLazyQuery<
    GetSentFriendRequestsType,
    GetSentFriendRequestsVariablesType
  >(GetSentFriendRequests, {
    fetchPolicy: 'no-cache',
  });

  const queryFn = async (page: number) => {
    const { data, error } = await fetchSentRequests({ variables: { page } });
    if (error) throw error;
    if (data?.getUserFriendReqSent?.count) {
      dispatch(setSentFriendRequestCount(data?.getUserFriendReqSent?.count));
    }
    return data?.getUserFriendReqSent?.values || [];
  };

  return usePaginatedQuery(['sentFriendRequests'], queryFn, {
    reduxFunc: setSentReqList,
    extractUserId: (item) => item.to_user_id,
    enabled: enabled !== false, // Only fetch if enabled is not explicitly false
  });
}

function useFetchBlockList() {
  const { data, refetch, loading } = useQuery<
    GetBlockListType,
    GetBlockListVariable
  >(GetBlockList, {
    variables: { page: 1 },
    fetchPolicy: 'cache-and-network',
  });

  const dispatch = useAppDispatch();

  // const blockListQuery = useInfiniteQuery({
  //   queryKey: ['userBlockList'],
  //   queryFn: async ({ pageParam = 1 }) => {
  //     const { data } = await fetchBlockList({
  //       variables: {
  //         page: pageParam,
  //       },
  //     });

  //     if (!data) return;

  //     const blockList = data.getBlockedListByUser;
  //     return blockList;
  //   },
  //   getNextPageParam: (lastPage, allPages) => {
  //     return lastPage && lastPage.length > 0 ? allPages.length + 1 : undefined;
  //   },
  //   initialPageParam: 1,
  //   refetchOnMount: 'always',
  //   refetchOnWindowFocus: true,
  // });

  const mergedList = React.useMemo(() => {
    return data?.getBlockedListByUser ?? [];
  }, [data]);

  React.useEffect(() => {
    if (data?.getBlockedListByUser) {
      data?.getBlockedListByUser.forEach((item) => {
        const userId = item?.block_user_id;
        if (userId) {
          dispatch(setBlockList({ action: 'add', userId }));
        }
      });
    }
  }, [data, dispatch]);

  return { mergedList, refetch, loading };
}

function useFetchBlockListPaginated() {
  const [fetchBlockList] = useLazyQuery<
    GetBlockListType,
    GetBlockListVariable
  >(GetBlockList, {
    fetchPolicy: 'no-cache',
  });

  const queryFn = async (page: number) => {
    const { data } = await fetchBlockList({ variables: { page } });
    return data?.getBlockedListByUser || [];
  };

  return usePaginatedQuery(['blockedUsers'], queryFn, {
    reduxFunc: setBlockList,
    extractUserId: (item) => item.block_user_id,
  });
}

function useFetchRecommendationsPaginated({ search = '' }: { search?: string }) {
  const auth = useAppSelector((s) => s.auth?.user);

  const [fetchRecs] = useLazyQuery<
    GetUserFriendRecommendationsQueryType,
    GetFriendRecommendVariableType
  >(GetUserFriendRecommendations, { fetchPolicy: 'no-cache' });

  // Track API's next_page so getNextPageParam can use it
  const nextPageRef = React.useRef<number | null>(null);

  const observer = useIntersectionObserver({
    initialIsIntersecting: false,
    rootMargin: '120px',
  });

  const enabled = !!auth?.latitude && !!auth?.longitude;

  const infiniteQuery = useInfiniteQuery<import('@/lib/definitions').User[], Error>({
    queryKey: ['userRecommendationsPaginated', search, auth?.latitude, auth?.longitude],
    queryFn: async (context) => {
      const page = (context.pageParam as number) ?? 1;
      try {
        const { data, error } = await fetchRecs({
          variables: {
            latitude: auth?.latitude ?? 0,
            longitude: auth?.longitude ?? 0,
            distance: 52000,
            searchInput: search,
            page,
          },
        });
        if (error) { nextPageRef.current = null; throw error; }
        const values = data?.getUserFriendRecommendation?.values ?? [];
        const apiNextPage = data?.getUserFriendRecommendation?.next_page;
        // Store next_page from API; null means no more pages
        nextPageRef.current = apiNextPage && apiNextPage > page ? apiNextPage : null;
        return values;
      } catch (err) {
        nextPageRef.current = null;
        throw err;
      }
    },
    getNextPageParam: () => nextPageRef.current ?? undefined,
    initialPageParam: 1,
    enabled,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const fetchNextPageRef = React.useRef(infiniteQuery.fetchNextPage);
  React.useEffect(() => { fetchNextPageRef.current = infiniteQuery.fetchNextPage; }, [infiniteQuery.fetchNextPage]);

  React.useEffect(() => {
    if (
      observer.isIntersecting &&
      infiniteQuery.hasNextPage &&
      !infiniteQuery.isFetching &&
      !infiniteQuery.isLoading &&
      !infiniteQuery.isError
    ) {
      fetchNextPageRef.current();
    }
  }, [observer.isIntersecting, infiniteQuery.hasNextPage, infiniteQuery.isFetching, infiniteQuery.isLoading, infiniteQuery.isError]);

  const mergedList = React.useMemo(() => infiniteQuery.data?.pages.flat() ?? [], [infiniteQuery.data]);

  return { mergedList, infiniteQuery, observer, loading: infiniteQuery.isLoading };
}

const useFetchUserRecommendations = ({ search = '' }: { search?: string }) => {
  const auth = useAppSelector((s) => s.auth?.user);
  const sentRequests = useAppSelector((s) => s.user.sentRequests);
  const friendIds = useAppSelector((s) => s.user.friendIds);
  const friendRecommendations = useQuery<
    GetUserFriendRecommendationsQueryType,
    GetFriendRecommendVariableType
  >(GetUserFriendRecommendations, {
    variables: {
      latitude: auth?.latitude ?? 0,
      longitude: auth?.longitude ?? 0,
      distance: 52000,
      searchInput: search,
      page: 1,
    },
    fetchPolicy: 'cache-and-network',
    skip: !auth?.latitude || !auth?.longitude,
  });
  const allRecommendations =
    friendRecommendations.data?.getUserFriendRecommendation?.values || [];


  const filteredFriendRecommendations = React.useMemo(() => {
    return allRecommendations?.filter((friend) => {
      const isAlreadySent = sentRequests?.includes(friend?.userid ?? '');
      const fullName = (
        friend.first_name +
        ' ' +
        friend.last_name
      ).toLowerCase();
      const matchesSearch = !search || fullName.includes(search.toLowerCase());
      return matchesSearch && !isAlreadySent;
    });
  }, [search, sentRequests, allRecommendations]);

  const allFriendSuggestions = React.useMemo(() => {
    return allRecommendations?.filter((f) => {
      const isFriend = friendIds.includes(f?.userid ?? '');
      const fullName = (f?.first_name + ' ' + f?.last_name).toLowerCase();
      const matchesSearch = !search || fullName.includes(search.toLowerCase());
      return matchesSearch && !isFriend;
    });
  }, [search, allRecommendations, friendIds]);

  return {
    filteredFriendRecommendations,
    friendRecommendations,
    allFriendSuggestions,
    loading: friendRecommendations.loading,
  };
};

export {
  useFetchAllFriends,
  useFetchSentReq,
  useFetchUserRecommendations,
  useFetchRecommendationsPaginated,
  useReqReceive,
  useFetchBlockList,
  useFetchBlockListPaginated,
};
