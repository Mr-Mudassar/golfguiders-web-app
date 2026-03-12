'use client';

import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
} from '@/components/ui';
import React from 'react';
import { BuddyPostCard } from './index';
import { useQuery } from '@apollo/client/react';
import { Loading } from '@/components/common';
import type { BuddyPost } from '@/lib/definitions';
import type {
  GetUserPostDetailType,
  GetUserPostDetailVariablesType,
} from '@/components/app/common/create-post-dialog/_interface';
import { GET_USER_POST_BY_POSTID } from '@/components/app/common/create-post-dialog/_query';


interface ViewPostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Buddy post with at least user_id and created for fetching full details */
  post: Pick<BuddyPost, 'user_id' | 'created'> & Partial<BuddyPost>;
}


const ViewPostModal: React.FC<ViewPostModalProps> = ({
  open,
  onOpenChange,
  post,
}) => {

  const { data, loading, error } = useQuery<
    GetUserPostDetailType,
    GetUserPostDetailVariablesType
  >(GET_USER_POST_BY_POSTID, {
    variables: {
      userId: post.post_user_id ?? '',
      created: post.created ?? '',
    },
    skip: !open || !post.post_user_id || !post.created,
    fetchPolicy: 'cache-and-network',
  });

  const fullPost = data?.getUserPostDetail[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0"
        aria-describedby={undefined}
      >
        <DialogHeader className='mt-4 mb-2 px-4'>
          <DialogTitle className='text-md font-bold text-muted-foreground'>Post Details</DialogTitle>
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


        {!loading && !fullPost && <div className='text-center text-sm text-muted-foreground  pt-8 pb-12 px-6'>No Details Found</div>}

        {!loading && !error && fullPost && (
          <div className="p-4">
            <BuddyPostCard
              post={fullPost}
              hideMap={false}
              showViewPostInMenu={false}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export { ViewPostModal };
