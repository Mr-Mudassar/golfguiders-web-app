'use client';

import React from 'react';

import { useTranslations } from 'next-intl';
import { useFetchSavedPosts } from '@/lib/hooks/use-user';
import { useAppSelector } from '@/lib';
import dynamic from 'next/dynamic';
import { Bookmark } from 'lucide-react';

const PostCard = dynamic(() =>
  import('../../common').then((mod) => mod.PostCard)
);
const PostCardSkeleton = dynamic(() =>
  import('../../common/skeletons').then((mod) => mod.PostCardSkeleton)
);

const SavedPostsFeed = () => {
  const { savedPostQuery, savedPosts, observer } = useFetchSavedPosts();
  const blockedUsers = useAppSelector((state) => state.user.blockedUsers);
  const t = useTranslations('savedFavPage.saved');

  const filteredPosts = savedPosts?.filter(
    (p) => !p?.is_deleted && !blockedUsers.includes(p.user_id)
  );

  return (
    <section>
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Bookmark className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-semibold">{t('title')}</h1>
          <p className="text-xs text-muted-foreground">
            Your bookmarked posts collection
          </p>
        </div>
      </div>
      {!savedPostQuery.isLoading && !filteredPosts?.length ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 animate-in fade-in duration-300">
          <div className="h-14 w-14 rounded-2xl bg-muted/50 flex items-center justify-center">
            <Bookmark className="h-7 w-7 text-muted-foreground/60" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              {t('noPosts')}
            </p>
            <p className="text-xs text-muted-foreground/70">
              Posts you save will appear here
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts?.map((post) => (
            <PostCard post={post} key={post.postid} forceSaved />
          ))}
        </div>
      )}

      {savedPostQuery.isLoading &&
        Array.from({ length: 6 }).map((_, i) => <PostCardSkeleton key={i} />)}

      {/* Observer elements, will allow us to call next fetch when its intersecting the view */}
      <div ref={observer.ref} />
    </section>
  );
};

export { SavedPostsFeed };
