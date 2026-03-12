import React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useIntersectionObserver } from "usehooks-ts";
import { useAppDispatch } from "@/lib";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ReduxUpdater = (payload: { action: "add" | "remove"; userId: string }) => any;

export function usePaginatedQuery<T>(
  queryKey: unknown[],
  queryFn: (pageParam: number) => Promise<T[]>,
  options?: {
    reduxFunc: ReduxUpdater;
    extractUserId?: (item: T) => string | undefined;
    enabled?: boolean;
  }
) {
  const dispatch = useAppDispatch();
  const [hasNextPage, setHasNextPage] = React.useState(true);

  const observer = useIntersectionObserver({
    initialIsIntersecting: false, // Changed to false to prevent immediate fetch
    rootMargin: "120px",
  });

  const infiniteQuery = useInfiniteQuery<T[], Error>({
    queryKey,
    queryFn: async (context) => {
      const pageParam = (context.pageParam as number) ?? 1;
      try {
        const data = await queryFn(pageParam);
        if (!data || data.length === 0) {
          setHasNextPage(false);
          return [];
        }
        return data;
      } catch (error) {
        console.error('Error in paginated query:', error);
        setHasNextPage(false);
        throw error; // Re-throw to stop retries
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage && lastPage.length > 0 ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: options?.enabled !== false,
    staleTime: 0, // Override global 60s staleTime — paginated data should always be fresh
    refetchOnMount: 'always', // Refetch when component mounts (e.g. navigating to the page)
    refetchOnWindowFocus: false,
    retry: 1, // Retry once on failure (network hiccups)
  });

  // Sync Redux state if needed
  React.useEffect(() => {
    if (infiniteQuery.data && options?.reduxFunc && options?.extractUserId) {
      const allItems = infiniteQuery.data.pages.flat();
      allItems.forEach((item) => {
        const userId = options.extractUserId!(item);
        if (userId) {
          dispatch(options.reduxFunc({ action: "add", userId }));
        }
      });
    }
  }, [infiniteQuery.data, dispatch, options]);

  // Store fetchNextPage in a ref to avoid dependency issues
  const fetchNextPageRef = React.useRef(infiniteQuery.fetchNextPage);
  React.useEffect(() => {
    fetchNextPageRef.current = infiniteQuery.fetchNextPage;
  }, [infiniteQuery.fetchNextPage]);

  React.useEffect(() => {
    // Don't fetch if error occurred or already fetching/loading
    if (
      observer.isIntersecting &&
      hasNextPage &&
      !infiniteQuery.isFetching &&
      !infiniteQuery.isLoading &&
      !infiniteQuery.isError
    ) {
      fetchNextPageRef.current();
    }
  }, [
    observer.isIntersecting,
    hasNextPage,
    infiniteQuery.isFetching,
    infiniteQuery.isLoading,
    infiniteQuery.isError,
  ]);

  const mergedList = React.useMemo(() => {
    return infiniteQuery.data?.pages.flat() ?? [];
  }, [infiniteQuery.data]);

  return { infiniteQuery, observer, mergedList };
}
