'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useAppSelector } from '@/lib';
import type { Post, BuddyPost } from '@/lib/definitions';

interface InfinitePostsCache {
  pages: (Post | BuddyPost)[][];
  pageParams?: unknown[];
}

/**
 * Hook for optimistic like/unlike updates on posts
 * Updates React Query cache immediately for instant UI feedback
 */
export function useLikePostOptimistic() {
  const client = useQueryClient();
  const userId = useAppSelector((s) => s.auth.user?.userid);

  /**
   * Update like state in all post caches
   * @param postId - The post ID to update
   * @param liked - Whether the post is being liked (true) or unliked (false)
   */
  const updateLikeInCache = (postId: string, liked: boolean) => {
    if (!userId) return;

    client.setQueriesData<InfinitePostsCache>(
      { queryKey: ['posts'] },
      (oldData) => {
        if (!oldData?.pages) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page) =>
            page.map((p) => {
              // Handle both Post and BuddyPost types
              const id = (p as Post).postid ?? (p as BuddyPost).post_id;
              if (id !== postId) return p;

              const post = p as Post;
              const userLikes = Array.isArray(post.user_likes)
                ? [...post.user_likes]
                : [];
              const hasUser = userLikes.includes(userId);

              // Add user to likes array if liking and not already liked
              if (liked && !hasUser) {
                userLikes.push(userId);
              }

              // Remove user from likes array if unliking
              if (!liked && hasUser) {
                const index = userLikes.indexOf(userId);
                if (index !== -1) {
                  userLikes.splice(index, 1);
                }
              }

              return { ...post, user_likes: userLikes };
            })
          ),
        };
      }
    );
  };

  return { updateLikeInCache };
}
