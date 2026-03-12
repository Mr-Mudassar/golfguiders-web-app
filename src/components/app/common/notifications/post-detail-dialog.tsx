'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
} from '@/components/ui';
import { useQuery } from '@apollo/client/react';
import { Loading } from '@/components/common';
import { PostCard, BuddyPostCard } from '@/components/app/common/post-card';
import { PostType } from '@/lib/constants';
import type {
  GetUserPostDetailType,
  GetUserPostDetailVariablesType,
} from '@/components/app/common/create-post-dialog/_interface';
import { GET_USER_POST_BY_POSTID } from '@/components/app/common/create-post-dialog/_query';

interface PostDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The post owner's user_id (from notification metadata.action_id) */
  userId: string;
  /** The post's created timestamp (from notification metadata.action_created) */
  created: string;
}

const PostDetailDialog: React.FC<PostDetailDialogProps> = ({
  open,
  onOpenChange,
  userId,
  created,
}) => {
  const { data, loading, error } = useQuery<
    GetUserPostDetailType,
    GetUserPostDetailVariablesType
  >(GET_USER_POST_BY_POSTID, {
    variables: {
      userId,
      created,
    },
    skip: !open || !userId || !created,
    fetchPolicy: 'cache-and-network',
  });

  const post = data?.getUserPostDetail?.[0];
  const isBuddyPost = post?.type === PostType.GolfBuddy;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0"
        aria-describedby={undefined}
      >
        <DialogHeader className="mt-4 mb-2 px-4">
          <DialogTitle className="text-md font-bold text-muted-foreground">
            Post Details
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center min-h-[200px] p-6">
            <Loading iconSize={32} iconColor="primary" />
          </div>
        )}

        {error && (
          <p className="text-destructive text-sm text-center py-8 px-6">
            Failed to load post. Please try again.
          </p>
        )}

        {!loading && !post && !error && (
          <div className="text-center text-sm text-muted-foreground pt-8 pb-12 px-6">
            No Details Found
          </div>
        )}

        {!loading && !error && post && (
          <div className="p-4">
            {isBuddyPost ? (
              <BuddyPostCard
                post={post}
                hideMap={false}
                showViewPostInMenu={false}
              />
            ) : (
              <PostCard post={post as any} />
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export { PostDetailDialog };
