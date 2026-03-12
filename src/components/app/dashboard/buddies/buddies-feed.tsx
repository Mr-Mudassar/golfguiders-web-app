'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import { PostType } from '@/lib/constants';
import type { BuddyPost } from '@/lib/definitions';
import { useIntersectionObserver } from 'usehooks-ts';
import { useAppSelector, useInfinitePosts } from '@/lib';
import { Skeleton } from '@/components/ui';
import { Calendar } from 'lucide-react';

const BuddyPostCard = dynamic(() =>
  import('../../common').then((mod) => mod.BuddyPostCard)
);
const PostCardSkeleton = dynamic(() =>
  import('../../common/skeletons').then((mod) => mod.PostCardSkeleton)
);
const PaginationSkeleton = dynamic(() =>
  import('../../common/skeletons').then((mod) => mod.PaginationSkeleton)
);

function GroupsSkeleton() {
  return (
    <div className="rounded-xl border bg-card/50 animate-in fade-in duration-200">
      <div className="flex justify-between items-center px-6 pt-5 pb-3">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
      <div className="flex flex-col gap-3 px-6 pb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-border/40 bg-muted/20 p-4 flex items-center gap-4">
            <Skeleton className="h-11 w-11 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-24" />
            </div>
            <div className="flex gap-1.5">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const Groups = dynamic(() => import('./groups').then((mod) => mod.Groups), {
  loading: () => <GroupsSkeleton />,
  ssr: false,
});

interface BuddiesFeedProps {
  readonly className?: string;
}

const BuddiesFeed: React.FC<BuddiesFeedProps> = ({ className }) => {
  const postsObserver = useIntersectionObserver({
    initialIsIntersecting: true,
  });
  const blockedUsers = useAppSelector((state) => state.user.blockedUsers);

  const isRefresh: number | null = useAppSelector(
    (state) => state.user.isRefreshPost
  );

  const [activeTab, setActiveTab] = React.useState<'today' | 'upcoming'>(
    'today'
  );
  const [groupTab, setGroupTab] = React.useState<boolean>(false);

  const postsInfiniteQuery = useInfinitePosts({
    type: activeTab,
    variables: {},
    change: { activeTab, isRefresh },
    enabled: !!activeTab,
    refetchOnMount: true,
    staleTime: 0, // Always fetch fresh data when switching tabs (today/upcoming)
  });

  const posts = React.useMemo(() => {
    // Flatten pages and remove duplicates based on post_id
    const seen = new Set<string>();
    return (postsInfiniteQuery.data?.pages?.flat()?.filter((post) => {
      const buddyPost = post as BuddyPost; // Cast to BuddyPost since today/upcoming return BuddyPost
      if (!buddyPost?.post_id) return false;
      if (seen.has(buddyPost.post_id)) return false;
      seen.add(buddyPost.post_id);
      return true;
    }) ?? []) as BuddyPost[];
  }, [postsInfiniteQuery.data]);

  const filteredPosts = React.useMemo(
    () => posts?.filter((post) => !blockedUsers.includes(post.user_id)),
    [posts, blockedUsers]
  );

  React.useEffect(() => {
    if (
      postsObserver.isIntersecting &&
      postsInfiniteQuery.hasNextPage &&
      !postsInfiniteQuery.isFetching
    ) {
      postsInfiniteQuery.fetchNextPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postsObserver.isIntersecting, postsInfiniteQuery.hasNextPage]);

  return (
    <section className={className}>
      <div className="mb-6 flex items-center justify-between bg-muted/30 p-1.5 rounded-2xl border border-border/50 w-full">
        <div className="flex gap-1 w-full">
          {['Today', 'Upcoming'].map((tab) => {
            const isActive = activeTab === tab.toLowerCase() && !groupTab;
            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab.toLowerCase() as 'today' | 'upcoming');
                  setGroupTab(false);
                }}
                className={cn(
                  "flex-1 px-5 py-2 text-xs font-bold rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {tab}
              </button>
            );
          })}
          <button
            onClick={() => setGroupTab(true)}
            className={cn(
              "flex-1 px-5 py-2 text-xs font-bold rounded-xl transition-all duration-200",
              groupTab
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            Groups
          </button>
        </div>
      </div>
      {groupTab ? (
        <Groups />
      ) : postsInfiniteQuery.isLoading ? (
        <div className="flex flex-col gap-3">
          <PostCardSkeleton count={3} showBuddyInfo showGolfCourse />
        </div>
      ) : !posts?.length ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 animate-in fade-in duration-300">
          <div className="h-14 w-14 rounded-2xl bg-muted/50 flex items-center justify-center">
            <Calendar className="h-7 w-7 text-muted-foreground/60" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              No {activeTab === 'today' ? "today's" : 'upcoming'} posts
            </p>
            <p className="text-xs text-muted-foreground/70">
              {activeTab === 'today'
                ? 'No golf buddy posts for today yet'
                : 'No upcoming golf buddy posts scheduled'}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {filteredPosts?.map((post) => (
              <BuddyPostCard
                post={{ ...post, type: PostType.GolfBuddy }}
                key={post.post_id}
                hideMap
                showViewPostInMenu
              />
            ))}
          </div>
          {postsInfiniteQuery.isFetchingNextPage && (
            <PaginationSkeleton type="post" count={2} />
          )}
          <div className="h-8" ref={postsObserver.ref} />
        </>
      )}
    </section>
  );
};

export { BuddiesFeed };
