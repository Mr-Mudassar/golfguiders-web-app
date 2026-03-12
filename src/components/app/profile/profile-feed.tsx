'use client';

import React from 'react';
import dynamic from 'next/dynamic';

import { useInfinitePosts, useAppSelector } from '@/lib';
import { useIntersectionObserver } from 'usehooks-ts';
import type { Post } from '@/lib/definitions';

const PostCard = dynamic(() => import('../common').then((mod) => mod.PostCard));
const PostCardSkeleton = dynamic(() =>
  import('../common/skeletons').then((mod) => mod.PostCardSkeleton)
);
const PaginationSkeleton = dynamic(() =>
  import('../common/skeletons').then((mod) => mod.PaginationSkeleton)
);
const LoadingScreen = dynamic(() =>
  import('@/components/common').then((mod) => mod.LoadingScreen)
);

interface ProfileFeedProps {
  readonly className?: string;
  userId: string;
  setPosts: (count: number) => void;
}

const ProfileFeed: React.FC<ProfileFeedProps> = ({ userId, setPosts }) => {
  const blockedUsers = useAppSelector((state) => state.user.blockedUsers);
  const postsObserver = useIntersectionObserver({
    initialIsIntersecting: true,
  });
  
  // If viewing a blocked user's profile, don't show posts
  const isBlockedUser = blockedUsers.includes(userId);

  const postsInfiniteQuery = useInfinitePosts({
    type: 'user',
    variables: {
      userId: userId,
    },
    change: { activeTab: '', isRefresh: 0 },
    enabled: !!userId,
    refetchOnMount: true,
  });

  const posts = React.useMemo(() => {
    return postsInfiniteQuery.data?.pages.reduce((acc, page) => {
      if (!page) return acc;
      if (!acc) return page;

      return [...acc, ...page];
    });
  }, [postsInfiniteQuery.data]);

  React.useEffect(() => {
    if (postsObserver.isIntersecting && postsInfiniteQuery.hasNextPage) {
      postsInfiniteQuery.fetchNextPage();
      return;
    }
    setPosts(posts?.length ?? 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postsObserver.isIntersecting]);

  if (!posts) return <LoadingScreen />;

  // Don't show posts if user is blocked
  if (isBlockedUser) {
    return null;
  }

  return (
    <section>
      {!postsInfiniteQuery.isFetching && !posts?.length ? (
        <div className="w-full flex flex-col items-center justify-center py-16 text-muted-foreground">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mb-4 opacity-40"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M3 9h18" />
            <path d="M9 21V9" />
          </svg>
          <p className="text-base font-medium">No posts yet</p>
          <p className="text-sm mt-1 opacity-70">
            Posts will appear here once shared.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {!!posts?.length &&
            posts
              ?.filter((p) => !p?.is_deleted)
              ?.map((post: Post) => <PostCard post={post} key={post.postid} />)}
        </div>
      )}
      {/* <PostCard post={dummyPost} /> */}
      {postsInfiniteQuery.isFetchingNextPage && <PaginationSkeleton type="post" count={2} />}
      <div className="h-8" ref={postsObserver.ref} />
    </section>
  );
};

export { ProfileFeed };

// const dummyPost = {
//   user_id: "8cd2a9e0-98c8-47d6-a992-f60272786924",
//   postal_code: 51050,
//   postid: 39472009,
//   created: 17773328802,
//   background_color: "yellow",
//   description: "This is a dummy post",
//   feeling_emoji: "😏",
//   latitude: 37.10,
//   longitude: -74.91,
//   location: "Lahore",
//   visibility: "public",
//   title: "Dummy Post",
//   type: "Post",
//   // user_likes: [],
//   // user_saves: [],
//   // user_shares: [],
//   // user_tags: [],
//   // group_tags: [],
//   // like_Count: 0,
//   // share_Count: 0,
//   userInfo: {
//     user_id: "8cd2a9e0-98c8-47d6-a992-f60272786924",
//     first_name: "Jav",
//     last_name: "Mughal",
//     photo_profile: "https://f004.backblazeb2.com/file/prod-general/aa1377bb-e52b-4299-a2c0-2d3121d17493.webp"
//   },
//   // sharedOfUserInfo: UserInfo,
// }
