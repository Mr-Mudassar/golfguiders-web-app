'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useIntersectionObserver } from 'usehooks-ts';

import { Tabs, TabsContent, TabsList, TabsTrigger, AnimatedCard } from '@/components/ui';
import { useInfinitePosts, useAppSelector, useSharedLocation } from '@/lib';
import { usePathname, useRouter } from '@/i18n/routing';
import type { Post } from '@/lib/definitions';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import { PostCardSkeleton, PaginationSkeleton } from '@/components/app/common/skeletons';

const PostCard = dynamic(() =>
  import('@/components/app/common').then((mod) => mod.PostCard)
);

const PostsBy = {
  Feed: 'feed',
  Circle: 'circle',
} as const;

const PostsFeedInner = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const { location } = useSharedLocation();
  const blockedUsers = useAppSelector((state) => state.user.blockedUsers);

  const circlePostsObserver = useIntersectionObserver({
    // Important: don't start intersecting "true" or it can trigger fetchNextPage
    // before page 1 is loaded, causing duplicate page=1 calls.
    initialIsIntersecting: false,
  });
  const distancePostsObserver = useIntersectionObserver({
    initialIsIntersecting: false,
  });

  // Once feed has loaded data, never show full skeleton again (avoids flash on first save/action)
  const feedDataEverLoadedRef = React.useRef(false);

  const postsByFromUrl = searchParams.get('postsBy');
  const initialTab = postsByFromUrl === PostsBy.Feed || postsByFromUrl === null
    ? PostsBy.Feed
    : postsByFromUrl === PostsBy.Circle
      ? PostsBy.Circle
      : PostsBy.Feed;
  const [activeTab, setActiveTab] = React.useState(initialTab);

  // Sync active tab from URL (e.g. browser back/forward, initial load)
  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const isFeedTab = activeTab === PostsBy.Feed;
  const isCircleTab = activeTab === PostsBy.Circle;

  const distanceVariables = React.useMemo(
    () =>
      location
        ? { latitude: location.lat, longitude: location.lng }
        : { latitude: undefined as number | undefined, longitude: undefined as number | undefined },
    [location?.lat, location?.lng]
  );

  const circlePostsInfiniteQuery = useInfinitePosts({
    type: 'circle',
    enabled: isCircleTab,
  });

  const distancePostsInfiniteQuery = useInfinitePosts({
    type: 'distance',
    variables: distanceVariables,
    change: { activeTab: '', isRefresh: 0 },
    enabled: isFeedTab && !!location,
  });

  // Preload comment chunk once feed has data so opening comments doesn't trigger full feed reload
  React.useEffect(() => {
    if (!isFeedTab || !distancePostsInfiniteQuery.data?.pages?.length) return;
    const t = setTimeout(() => {
      import('@/components/app/common/post-card/comments').catch(() => { });
    }, 300);
    return () => clearTimeout(t);
  }, [isFeedTab, distancePostsInfiniteQuery.data?.pages?.length]);

  const handleFeedChange = React.useCallback(
    (v: string) => {
      setActiveTab(v as typeof PostsBy.Feed | typeof PostsBy.Circle);
      const params = new URLSearchParams(searchParams);
      params.set('postsBy', v);
      replace(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, replace]
  );

  const circlePosts = React.useMemo(() => {
    return circlePostsInfiniteQuery.data?.pages.reduce((acc, page) => {
      if (!page) return acc;
      if (!acc) return page;

      return [...acc, ...page];
    });
  }, [circlePostsInfiniteQuery.data]);

  const distancePosts = React.useMemo(() => {
    return distancePostsInfiniteQuery.data?.pages.reduce((acc, page) => {
      if (!page) return acc;
      if (!acc) return page;

      return [...acc, ...page];
    });
  }, [distancePostsInfiniteQuery.data]);

  const filteredDistancePosts = React.useMemo(
    () => distancePosts?.filter((p) => !p?.is_deleted && !blockedUsers.includes(p.user_id)),
    [distancePosts, blockedUsers]
  );

  const hasFeedData = Boolean(
    location && distancePostsInfiniteQuery.data !== undefined && distancePostsInfiniteQuery.data?.pages?.length
  );
  if (hasFeedData) feedDataEverLoadedRef.current = true;
  const showFeedSkeleton = !feedDataEverLoadedRef.current && (!location || distancePostsInfiniteQuery.data === undefined);

  const filteredCirclePosts = React.useMemo(
    () => circlePosts?.filter((p: Post) => !p?.is_deleted && !blockedUsers.includes(p.user_id)),
    [circlePosts, blockedUsers]
  );

  React.useEffect(() => {
    if (
      distancePostsObserver.isIntersecting &&
      isFeedTab &&
      distancePostsInfiniteQuery.hasNextPage &&
      !!location &&
      !distancePostsInfiniteQuery.isFetchingNextPage &&
      !!distancePostsInfiniteQuery.data
    ) {
      distancePostsInfiniteQuery.fetchNextPage();
      return;
    }

    if (
      circlePostsObserver.isIntersecting &&
      isCircleTab &&
      circlePostsInfiniteQuery.hasNextPage &&
      !circlePostsInfiniteQuery.isFetchingNextPage &&
      !!circlePostsInfiniteQuery.data
    ) {
      circlePostsInfiniteQuery.fetchNextPage();
      return;
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    distancePostsObserver.isIntersecting,
    circlePostsObserver.isIntersecting,
  ]);

  return (
    <section>
      <Tabs
        value={activeTab}
        onValueChange={handleFeedChange}
        className="w-full"
      >
        <TabsList className="w-full h-12 bg-muted/30 backdrop-blur-md border border-border/40 p-1.5 mb-6 shadow-sm rounded-xl">
          <TabsTrigger
            className="w-full h-full rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg active:scale-95"
            value={PostsBy.Feed}
          >
            Feed
          </TabsTrigger>
          <TabsTrigger
            className="w-full h-full rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg active:scale-95"
            value={PostsBy.Circle}
          >
            Circle
          </TabsTrigger>
        </TabsList>
        <TabsContent value={PostsBy.Feed} className="min-h-[800px] relative">
          {/* Skeleton: always mounted, visibility toggled to avoid remount flash */}
          <div
            className={cn(
              'flex flex-col gap-4 transition-opacity duration-150',
              showFeedSkeleton
                ? 'opacity-100 pointer-events-auto'
                : 'opacity-0 pointer-events-none absolute inset-0 invisible'
            )}
            aria-hidden={!showFeedSkeleton}
          >
            <PostCardSkeleton count={3} />
          </div>
          {/* Empty state: only when we have received data and it's empty */}
          {location &&
            distancePostsInfiniteQuery.data !== undefined &&
            !filteredDistancePosts?.length && (
              <div className="w-full flex items-center justify-center h-60 text-sm text-muted-foreground">
                No posts found! Make sure your location is on
              </div>
            )}
          {/* Posts: only when we have data and posts */}
          {location &&
            distancePostsInfiniteQuery.data !== undefined &&
            !!filteredDistancePosts?.length && (
              <div className="flex flex-col gap-4 animate-in fade-in duration-300 ease-out">
                {filteredDistancePosts?.map((post: Post, index: number) => (
                  <AnimatedCard key={post.postid} index={index}>
                    <PostCard post={post} />
                  </AnimatedCard>
                ))}
              </div>
            )}
          {distancePostsInfiniteQuery.isFetchingNextPage && (
            <PaginationSkeleton type="post" count={2} />
          )}
          <div className="h-8" ref={distancePostsObserver.ref} />
        </TabsContent>
        <TabsContent value={PostsBy.Circle} className="min-h-[800px]">
          {circlePostsInfiniteQuery.isLoading && !circlePosts?.length ? (
            <div className="flex flex-col gap-4 animate-in fade-in duration-200 ease-out">
              <PostCardSkeleton count={3} />
            </div>
          ) : !circlePostsInfiniteQuery.isFetching && !circlePosts?.length ? (
            <div className="w-full flex items-center justify-center h-60 text-sm text-muted-foreground animate-in fade-in duration-500">
              No posts found!
            </div>
          ) : (
            <div className="flex flex-col gap-4 animate-in fade-in duration-300 ease-out">
              {filteredCirclePosts?.map((post: Post, index: number) => (
                <AnimatedCard key={post.postid} index={index}>
                  <PostCard type="circle" post={post} />
                </AnimatedCard>
              ))}
            </div>
          )}
          {circlePostsInfiniteQuery.isFetchingNextPage && (
            <PaginationSkeleton type="post" count={2} />
          )}
          <div className="h-8" ref={circlePostsObserver.ref} />
        </TabsContent>
      </Tabs>
    </section>
  );
};

const PostsFeed = () => (
  <Suspense
    fallback={
      <section>
        <Tabs defaultValue={PostsBy.Feed} className="w-full">
          <TabsList className="w-full h-12 bg-muted/30 backdrop-blur-md border border-border/40 p-1.5 mb-6 shadow-sm rounded-xl">
            <TabsTrigger
              className="w-full h-full rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg active:scale-95"
              value={PostsBy.Feed}
            >
              Feed
            </TabsTrigger>
            <TabsTrigger
              className="w-full h-full rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg active:scale-95"
              value={PostsBy.Circle}
            >
              Circle
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex flex-col gap-4">
          <PostCardSkeleton count={3} />
        </div>
      </section>
    }
  >
    <PostsFeedInner />
  </Suspense>
);

export { PostsFeed };
